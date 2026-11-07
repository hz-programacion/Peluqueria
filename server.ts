import express, { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { createServer as createViteServer } from 'vite';
import {
  StudioRepository,
  RateLimiter,
  validateAndCreateAppointment,
  rescheduleAppointment,
  computeStudioMetrics,
  sanitizeText,
} from './src/server/backendEngine';
import { StudioService, StudioGalleryItem } from './src/data/studioData';
import { HomeSectionId } from './src/data/studioStore';

const PORT = 3000;
const DB_FILE_PATH = path.resolve(process.cwd(), 'data', 'studio-db.json');

export async function createAppServer() {
  const app = express();
  const repo = new StudioRepository(DB_FILE_PATH);
  const apiLimiter = new RateLimiter(60_000, 180);
  const loginLimiter = new RateLimiter(300_000, 12);

  app.use(express.json({ limit: '6mb' }));

  // Security Headers Middleware
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-XSS-Protection', '0');
    next();
  });

  // Rate Limiter for /api/*
  app.use('/api', (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'local';
    const check = apiLimiter.check(ip);
    res.setHeader('X-RateLimit-Remaining', String(check.remaining));
    if (!check.allowed) {
      res.status(429).json({
        ok: false,
        error: 'Demasiadas solicitudes seguidas. Esperá unos segundos y volvé a intentar.',
      });
      return;
    }
    next();
  });

  // 1. Health & Diagnostics Endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    const state = repo.getState();
    res.json({
      ok: true,
      status: 'healthy',
      studio: state.config.studioTitle,
      updatedAt: state.updatedAt,
      counts: {
        services: state.services.length,
        appointments: state.appointments.length,
        galleryItems: state.galleryItems.length,
        reviews: state.reviews.length,
        blockedSlots: state.blockedSlots.length,
      },
    });
  });

  // 2. Full Bootstrap State Endpoint
  app.get('/api/bootstrap', (_req: Request, res: Response) => {
    const state = repo.getState();
    const metrics = computeStudioMetrics(state);
    res.json({
      ok: true,
      data: {
        config: state.config,
        services: state.services,
        appointments: state.appointments,
        blockedSlots: state.blockedSlots,
        galleryItems: state.galleryItems,
        reviews: state.reviews,
        metrics,
      },
    });
  });

  // 3. Admin Login & Token Verification
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || 'local';
    const limit = loginLimiter.check(`login:${ip}`);
    if (!limit.allowed) {
      res.status(429).json({
        ok: false,
        error: 'Demasiados intentos de PIN. Esperá unos minutos antes de reintentar.',
      });
      return;
    }

    const pin = String(req.body?.pin || '');
    const result = repo.authenticateAdmin(pin);
    if (!result.ok) {
      res.status(401).json({
        ok: false,
        error: 'PIN de seguridad incorrecto.',
      });
      return;
    }
    loginLimiter.reset(`login:${ip}`);
    res.json({
      ok: true,
      token: result.token,
    });
  });

  // 4. Admin Metrics & Audit Logs
  app.get('/api/admin/metrics', (_req: Request, res: Response) => {
    const state = repo.getState();
    const metrics = computeStudioMetrics(state);
    res.json({
      ok: true,
      metrics,
      auditLogs: state.auditLogs.slice(0, 40),
    });
  });

  // 5. Appointments Lookup by WhatsApp / Name / Ticket Code
  app.get('/api/appointments/lookup', (req: Request, res: Response) => {
    const q = sanitizeText(req.query.q, 80);
    if (!q || q.length < 2) {
      res.status(400).json({
        ok: false,
        error: 'Ingresá al menos 3 números de tu WhatsApp, tu nombre o el código TK-...',
      });
      return;
    }
    const matches = repo.lookupAppointments(q);
    res.json({
      ok: true,
      appointments: matches,
    });
  });

  // 6. Create Appointment (with Collision & Double-Booking Prevention)
  app.post('/api/appointments', (req: Request, res: Response) => {
    const state = repo.getState();
    const result = validateAndCreateAppointment(state, {
      date: req.body?.date,
      startTime: req.body?.startTime,
      clientName: req.body?.clientName,
      whatsapp: req.body?.whatsapp,
      serviceIds: req.body?.serviceIds,
      serviceNames: req.body?.serviceNames,
      paymentOption: req.body?.paymentOption,
      bypassSlotCheck: Boolean(req.body?.bypassSlotCheck),
    });

    if (!result.ok) {
      res.status(result.status).json({
        ok: false,
        error: result.error,
        fieldErrors: result.fieldErrors,
      });
      return;
    }

    repo.save();
    res.status(result.status).json({
      ok: true,
      appointment: result.data,
      metrics: computeStudioMetrics(state),
    });
  });

  // 7. Update Appointment Status or Reschedule
  app.patch('/api/appointments/:id', (req: Request, res: Response) => {
    const id = String(req.params.id);
    const state = repo.getState();
    const existing = state.appointments.find((a) => a.id === id);
    if (!existing) {
      res.status(404).json({ ok: false, error: 'Turno no encontrado.' });
      return;
    }

    // If rescheduling date/startTime
    if (req.body?.date && req.body?.startTime) {
      const resched = rescheduleAppointment(
        state,
        id,
        String(req.body.date),
        String(req.body.startTime)
      );
      if (!resched.ok) {
        res.status(resched.status).json({ ok: false, error: resched.error });
        return;
      }
      repo.save();
      res.json({ ok: true, appointment: resched.data });
      return;
    }

    if (req.body?.status === 'confirmed' || req.body?.status === 'completed') {
      existing.status = req.body.status;
      state.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'APPOINTMENT_STATUS',
        actor: 'admin',
        details: `Turno ${existing.id} (${existing.clientName}) marcado como ${existing.status}.`,
      });
      repo.save();
    }

    res.json({ ok: true, appointment: existing });
  });

  // 8. Cancel & Free Appointment Slot
  app.delete('/api/appointments/:id', (req: Request, res: Response) => {
    const id = String(req.params.id);
    const state = repo.getState();
    const target = state.appointments.find((a) => a.id === id);
    state.appointments = state.appointments.filter((a) => a.id !== id);
    if (target) {
      state.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'APPOINTMENT_CANCELLED',
        actor: 'admin',
        details: `Turno ${target.id} (${target.clientName} · ${target.date} ${target.startTime}) cancelado y horario liberado.`,
      });
    }
    repo.save();
    res.json({ ok: true, appointments: state.appointments });
  });

  // 9. Update Studio Config
  app.put('/api/config', (req: Request, res: Response) => {
    const updated = repo.updateConfig(req.body || {});
    res.json({ ok: true, config: updated });
  });

  // 10. Move Section Order
  app.post('/api/config/section-order', (req: Request, res: Response) => {
    const sectionId = req.body?.sectionId as HomeSectionId;
    const direction = req.body?.direction as 'up' | 'down';
    const order = repo.moveSection(sectionId, direction);
    res.json({ ok: true, sectionOrder: order });
  });

  // 11. Services CRUD & Bulk Price Adjustment
  app.post('/api/services/bulk-price', (req: Request, res: Response) => {
    const pct = Number(req.body?.percentage || 0);
    if (Number.isNaN(pct) || pct < -50 || pct > 100) {
      res.status(400).json({ ok: false, error: 'Porcentaje de ajuste inválido.' });
      return;
    }
    const result = repo.bulkAdjustPrices(pct);
    res.json({ ok: true, ...result });
  });

  app.post('/api/services', (req: Request, res: Response) => {
    const state = repo.getState();
    const body = req.body as Partial<StudioService>;
    const cleanName = sanitizeText(body.name, 90);
    if (!cleanName) {
      res.status(400).json({ ok: false, error: 'El nombre del servicio es obligatorio.' });
      return;
    }
    const newSrv: StudioService = {
      id: body.id || `srv-${Date.now()}`,
      index: body.index || String(state.services.length + 1).padStart(2, '0'),
      category: body.category || 'Fades & Cortes',
      name: cleanName,
      durationMinutes: Math.max(10, Number(body.durationMinutes) || 40),
      price: Math.max(1000, Number(body.price) || 12000),
      shortDescription: sanitizeText(body.shortDescription, 320),
      preparation: Array.isArray(body.preparation)
        ? body.preparation.map((x) => sanitizeText(x, 180))
        : ['Venir con el cabello limpio'],
      executionSteps: Array.isArray(body.executionSteps)
        ? body.executionSteps.map((x) => sanitizeText(x, 180))
        : ['Diagnóstico visagista', 'Ejecución técnica', 'Styling final'],
      aftercare: sanitizeText(body.aftercare, 220) || 'Control cada 14 días.',
      productsUsed: sanitizeText(body.productsUsed, 180) || 'Clippers & Shaver Titanio 0.0mm',
      popularTag: body.popularTag ? sanitizeText(body.popularTag, 40) : undefined,
    };
    state.services.push(newSrv);
    repo.save();
    res.status(201).json({ ok: true, service: newSrv, services: state.services });
  });

  app.put('/api/services/:id', (req: Request, res: Response) => {
    const id = String(req.params.id);
    const state = repo.getState();
    state.services = state.services.map((s) =>
      s.id === id ? { ...s, ...req.body } : s
    );
    repo.save();
    res.json({ ok: true, services: state.services });
  });

  app.delete('/api/services/:id', (req: Request, res: Response) => {
    const id = String(req.params.id);
    const state = repo.getState();
    state.services = state.services.filter((s) => s.id !== id);
    repo.save();
    res.json({ ok: true, services: state.services });
  });

  // 12. Gallery CRUD
  app.post('/api/gallery', (req: Request, res: Response) => {
    const state = repo.getState();
    const body = req.body as Partial<StudioGalleryItem>;
    if (!body.imageUrl) {
      res.status(400).json({ ok: false, error: 'La imagen es obligatoria.' });
      return;
    }
    const item: StudioGalleryItem = {
      id: body.id || `gal-${Date.now()}`,
      title: sanitizeText(body.title, 90) || 'Creación en el Estudio',
      category: body.category || 'Cortes & Fades',
      imageUrl: String(body.imageUrl),
      description: sanitizeText(body.description, 320),
      dateLabel: sanitizeText(body.dateLabel, 40) || 'Reciente · VT',
      tags: Array.isArray(body.tags) ? body.tags : ['#RodrigoCutsss'],
      technicalSpec: sanitizeText(body.technicalSpec, 140),
      priceLabel: sanitizeText(body.priceLabel, 40) || state.config.mainPriceDisplay,
      likes: Number(body.likes) || 25,
      hideBuyButton: Boolean(body.hideBuyButton),
      hidePrice: Boolean(body.hidePrice),
      hidden: Boolean(body.hidden),
    };
    state.galleryItems.unshift(item);
    repo.save();
    res.status(201).json({ ok: true, item, galleryItems: state.galleryItems });
  });

  app.put('/api/gallery/:id', (req: Request, res: Response) => {
    const id = String(req.params.id);
    const state = repo.getState();
    state.galleryItems = state.galleryItems.map((g) =>
      g.id === id ? { ...g, ...req.body } : g
    );
    repo.save();
    res.json({ ok: true, galleryItems: state.galleryItems });
  });

  app.delete('/api/gallery/:id', (req: Request, res: Response) => {
    const id = String(req.params.id);
    const state = repo.getState();
    state.galleryItems = state.galleryItems.filter((g) => g.id !== id);
    repo.save();
    res.json({ ok: true, galleryItems: state.galleryItems });
  });

  // 13. Blocked Slots CRUD
  app.post('/api/blocked-slots', (req: Request, res: Response) => {
    const state = repo.getState();
    const slot = {
      id: req.body?.id || `block-${Date.now()}`,
      date: String(req.body?.date || ''),
      startTime: String(req.body?.startTime || '15:00'),
      durationMinutes: Math.max(15, Number(req.body?.durationMinutes) || 60),
      reason: sanitizeText(req.body?.reason, 120) || 'Pausa de estudio',
    };
    state.blockedSlots.push(slot);
    repo.save();
    res.status(201).json({ ok: true, blockedSlot: slot, blockedSlots: state.blockedSlots });
  });

  app.delete('/api/blocked-slots/:id', (req: Request, res: Response) => {
    const id = String(req.params.id);
    const state = repo.getState();
    state.blockedSlots = state.blockedSlots.filter((b) => b.id !== id);
    repo.save();
    res.json({ ok: true, blockedSlots: state.blockedSlots });
  });

  // 14. Reviews CRUD
  app.get('/api/reviews', (_req: Request, res: Response) => {
    res.json({ ok: true, reviews: repo.getState().reviews });
  });

  app.post('/api/reviews', (req: Request, res: Response) => {
    const state = repo.getState();
    const clientName = sanitizeText(req.body?.clientName, 60);
    const comment = sanitizeText(req.body?.comment, 420);
    if (!clientName || !comment || comment.length < 4) {
      res.status(400).json({
        ok: false,
        error: 'Completá tu nombre y una reseña válida.',
      });
      return;
    }
    const rating = Math.max(1, Math.min(5, Number(req.body?.rating) || 5));
    const entry = {
      id: `rev-${Date.now()}`,
      clientName,
      serviceName:
        sanitizeText(req.body?.serviceName, 90) ||
        'Corte de Pelo (Corte de Autor & Fade)',
      price: sanitizeText(req.body?.price, 30) || state.config.mainPriceDisplay,
      rating,
      date: 'Reciente',
      city: 'Venado Tuerto',
      verified: true,
      comment,
      createdAtISO: new Date().toISOString(),
    };
    state.reviews.unshift(entry);
    repo.save();
    res.status(201).json({ ok: true, review: entry, reviews: state.reviews });
  });

  app.delete('/api/reviews/:id', (req: Request, res: Response) => {
    const id = String(req.params.id);
    const state = repo.getState();
    state.reviews = state.reviews.filter((r) => r.id !== id);
    repo.save();
    res.json({ ok: true, reviews: state.reviews });
  });

  // Centralized API Error Handler
  app.use('/api', (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    res.status(500).json({
      ok: false,
      error: 'Error interno procesando la solicitud en el servidor.',
      detail: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  });

  // Mount Vite in development or static dist in production
  const distPath = path.resolve(process.cwd(), 'dist');
  if (process.env.NODE_ENV === 'production' && fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createAppServer().then((app) => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[RODRIGO CUTSSS FULL-STACK] Server listening on http://0.0.0.0:${PORT}`);
    });
  });
}
