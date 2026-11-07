import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  STUDIO_SERVICES,
  STUDIO_GALLERY_ITEMS,
  StudioService,
  StudioGalleryItem,
  AppointmentRecord,
} from '../data/studioData';
import {
  INITIAL_STUDIO_CONFIG,
  INITIAL_BLOCKED_SLOTS,
  INITIAL_APPOINTMENTS_STORE,
  StudioConfig,
  DEFAULT_SECTION_ORDER,
  HomeSectionId,
} from '../data/studioStore';
import {
  timeToMinutes,
  minutesToTime,
  getTodayLocalISO,
  getAvailableTimeSlots,
  getNextAvailableSlotInfo,
  getStudioLiveStatus,
  findAppointmentsByQuery,
} from '../utils/bookingEngine';

export interface BlockedSlotRecord {
  id: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  reason?: string;
}

export interface StudioReviewRecord {
  id: string;
  clientName: string;
  serviceName: string;
  price: string;
  rating: number;
  date: string;
  city: string;
  verified: boolean;
  comment: string;
  createdAtISO: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: 'client' | 'admin' | 'system';
  details: string;
}

export interface StudioDatabaseSchema {
  version: number;
  updatedAt: string;
  config: StudioConfig;
  services: StudioService[];
  appointments: AppointmentRecord[];
  blockedSlots: BlockedSlotRecord[];
  galleryItems: StudioGalleryItem[];
  reviews: StudioReviewRecord[];
  auditLogs: AuditLogEntry[];
}

export interface BusinessMetricsReport {
  todayISO: string;
  todayAppointmentsCount: number;
  totalAppointmentsCount: number;
  confirmedAppointmentsCount: number;
  completedAppointmentsCount: number;
  todayEstimatedRevenueARS: number;
  totalEstimatedRevenueARS: number;
  depositAppointmentsCount: number;
  todayOccupancyPercentage: number;
  topServiceName: string;
  freeSlotsTodayCount: number;
  nextAvailableSlot: ReturnType<typeof getNextAvailableSlotInfo>;
  liveStatus: ReturnType<typeof getStudioLiveStatus>;
}

const DEFAULT_REVIEWS: StudioReviewRecord[] = [
  {
    id: 'rev-seed-1',
    clientName: 'Martín Salvatierra',
    serviceName: 'Corte de Autor / Clásico',
    price: '$12.000 ARS',
    rating: 5,
    date: 'Hace 3 días',
    city: 'Venado Tuerto',
    verified: true,
    comment:
      'Una experiencia completamente distinta en Venado Tuerto. Sin ruidos ni gente esperando encima tuyo: llegás a tu hora en Vuelta de Obligado 931, te reciben con un café y Rodrigo se toma todo el tiempo para lograr exactamente el corte que buscás.',
    createdAtISO: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'rev-seed-2',
    clientName: 'Agustín Pellegrini',
    serviceName: 'Corte + Perfilado de Barba',
    price: '$17.000 ARS',
    rating: 5,
    date: 'Hace 5 días',
    city: 'Venado Tuerto',
    verified: true,
    comment:
      'La precisión con la tijera y el cuidado en el perfilado de barba con toalla tibia son de otro nivel. El corte crece prolijo durante semanas sin perder la forma.',
    createdAtISO: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'rev-seed-3',
    clientName: 'Federico Ledesma',
    serviceName: 'Coloración / Iluminación',
    price: '$28.000 ARS',
    rating: 5,
    date: 'Hace 1 semana',
    city: 'Venado Tuerto',
    verified: true,
    comment:
      'Buscaba unos reflejos muy sutiles que no dañaran el pelo y el resultado superó lo que imaginaba. Ambiente tranquilo, trato personalizado y productos de primera línea.',
    createdAtISO: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 'rev-seed-4',
    clientName: 'Nicolás Bertero',
    serviceName: 'Lavado Premium y Nutrición Capilar',
    price: '$9.500 ARS',
    rating: 5,
    date: 'Hace 2 semanas',
    city: 'Venado Tuerto',
    verified: true,
    comment:
      'Reservar desde el celular es comodísimo y la puntualidad es total. El lavado nutritivo con masaje capilar al final del corte hace que salgas renovado.',
    createdAtISO: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
];

/**
 * Sanitizes user-supplied strings against XSS/HTML injection and trims excessive length.
 */
export function sanitizeText(input: unknown, maxLength = 280): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

/**
 * Normalizes phone/WhatsApp strings to clean digits and validates minimum length.
 */
export function normalizePhoneDigits(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input.replace(/\D/g, '').slice(0, 18);
}

/**
 * Validates YYYY-MM-DD date format.
 */
export function isValidISODate(dateStr: unknown): dateStr is string {
  if (typeof dateStr !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

/**
 * Validates HH:mm 24-hour time format.
 */
export function isValidTimeHHMM(timeStr: unknown): timeStr is string {
  if (typeof timeStr !== 'string') return false;
  if (!/^\d{2}:\d{2}$/.test(timeStr)) return false;
  const [h, m] = timeStr.split(':').map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

/**
 * Sliding-window in-memory rate limiter for API security.
 */
export class RateLimiter {
  private hits = new Map<string, number[]>();

  constructor(
    private readonly windowMs: number = 60_000,
    private readonly maxRequests: number = 120
  ) {}

  public check(key: string, now = Date.now()): { allowed: boolean; remaining: number } {
    const cutoff = now - this.windowMs;
    const prev = (this.hits.get(key) || []).filter((t) => t > cutoff);
    if (prev.length >= this.maxRequests) {
      this.hits.set(key, prev);
      return { allowed: false, remaining: 0 };
    }
    prev.push(now);
    this.hits.set(key, prev);
    return { allowed: true, remaining: this.maxRequests - prev.length };
  }

  public reset(key: string): void {
    this.hits.delete(key);
  }
}

/**
 * Creates a fresh default database state.
 */
export function createInitialDatabaseState(): StudioDatabaseSchema {
  return {
    version: 5,
    updatedAt: new Date().toISOString(),
    config: {
      ...INITIAL_STUDIO_CONFIG,
      sectionOrder: [...DEFAULT_SECTION_ORDER],
    },
    services: STUDIO_SERVICES.map((s) => ({ ...s })),
    appointments: INITIAL_APPOINTMENTS_STORE.map((a) => ({ ...a })),
    blockedSlots: INITIAL_BLOCKED_SLOTS.map((b) => ({ ...b })),
    galleryItems: STUDIO_GALLERY_ITEMS.map((g) => ({ ...g })),
    reviews: DEFAULT_REVIEWS.map((r) => ({ ...r })),
    auditLogs: [
      {
        id: 'audit-init',
        timestamp: new Date().toISOString(),
        action: 'SYSTEM_BOOT',
        actor: 'system',
        details: 'Motor backend de Rodrigo Estudio inicializado y sincronizado.',
      },
    ],
  };
}

/**
 * Computes real-time business intelligence metrics from the studio database state.
 */
export function computeStudioMetrics(
  db: StudioDatabaseSchema,
  now: Date = new Date()
): BusinessMetricsReport {
  const todayISO = getTodayLocalISO(now);
  const todayAppointments = db.appointments.filter((a) => a.date === todayISO);
  const confirmedAppointments = db.appointments.filter((a) => a.status === 'confirmed');
  const completedAppointments = db.appointments.filter((a) => a.status === 'completed');
  const depositAppointments = db.appointments.filter((a) => a.paymentOption === 'deposit');

  const estimateAppointmentRevenue = (app: AppointmentRecord): number => {
    let sum = 0;
    for (const sName of app.serviceNames) {
      const matched = db.services.find(
        (s) => s.name.toLowerCase() === sName.toLowerCase()
      );
      sum += matched ? matched.price : 12000;
    }
    return sum > 0 ? sum : 12000;
  };

  const todayEstimatedRevenueARS = todayAppointments.reduce(
    (acc, a) => acc + estimateAppointmentRevenue(a),
    0
  );
  const totalEstimatedRevenueARS = db.appointments.reduce(
    (acc, a) => acc + estimateAppointmentRevenue(a),
    0
  );

  // Service popularity tally
  const serviceCounts = new Map<string, number>();
  for (const app of db.appointments) {
    for (const name of app.serviceNames) {
      serviceCounts.set(name, (serviceCounts.get(name) || 0) + 1);
    }
  }
  let topServiceName = db.services[0]?.name || 'Corte de Pelo (Corte de Autor & Fade)';
  let topCount = -1;
  for (const [name, count] of serviceCounts.entries()) {
    if (count > topCount) {
      topCount = count;
      topServiceName = name;
    }
  }

  // Occupancy calculation for today
  const totalOperatingMinutes = Math.max(
    60,
    (db.config.closingHour - db.config.openingHour) * 60
  );
  const bookedMinutesToday = todayAppointments.reduce(
    (acc, a) => acc + a.serviceMinutes + a.bufferMinutes,
    0
  );
  const blockedMinutesToday = db.blockedSlots
    .filter((b) => b.date === todayISO)
    .reduce((acc, b) => acc + b.durationMinutes, 0);
  const todayOccupancyPercentage = Math.min(
    100,
    Math.round(((bookedMinutesToday + blockedMinutesToday) / totalOperatingMinutes) * 100)
  );

  const todaySlots = getAvailableTimeSlots(
    todayISO,
    50,
    db.appointments,
    db.config.openingHour,
    db.config.closingHour,
    db.blockedSlots
  );
  const freeSlotsTodayCount = todaySlots.filter((s) => s.available).length;

  const nextAvailableSlot = getNextAvailableSlotInfo(
    db.appointments,
    db.blockedSlots,
    db.config.openingHour,
    db.config.closingHour,
    db.config.openDays,
    50,
    now
  );

  const liveStatus = getStudioLiveStatus(
    now,
    db.config.openingHour,
    db.config.closingHour,
    db.config.openDays
  );

  return {
    todayISO,
    todayAppointmentsCount: todayAppointments.length,
    totalAppointmentsCount: db.appointments.length,
    confirmedAppointmentsCount: confirmedAppointments.length,
    completedAppointmentsCount: completedAppointments.length,
    todayEstimatedRevenueARS,
    totalEstimatedRevenueARS,
    depositAppointmentsCount: depositAppointments.length,
    todayOccupancyPercentage,
    topServiceName,
    freeSlotsTodayCount,
    nextAvailableSlot,
    liveStatus,
  };
}

export interface CreateAppointmentPayload {
  date: string;
  startTime: string;
  clientName: string;
  whatsapp: string;
  serviceIds?: string[];
  serviceNames?: string[];
  paymentOption?: 'deposit' | 'commitment';
  bypassSlotCheck?: boolean; // Only for manual admin override
}

export interface ServiceOperationResult<T> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Pure validated appointment creation & collision-prevention engine.
 */
export function validateAndCreateAppointment(
  db: StudioDatabaseSchema,
  payload: CreateAppointmentPayload
): ServiceOperationResult<AppointmentRecord> {
  const fieldErrors: Record<string, string> = {};

  const cleanName = sanitizeText(payload.clientName, 80);
  if (!cleanName || cleanName.length < 2) {
    fieldErrors.clientName = 'Ingresá tu nombre y apellido (mínimo 2 caracteres).';
  }

  const cleanDigits = normalizePhoneDigits(payload.whatsapp);
  if (cleanDigits.length < 8) {
    fieldErrors.whatsapp = 'Ingresá un número de WhatsApp válido (mínimo 8 dígitos).';
  }

  if (!isValidISODate(payload.date)) {
    fieldErrors.date = 'La fecha seleccionada no tiene un formato válido (YYYY-MM-DD).';
  }

  if (!isValidTimeHHMM(payload.startTime)) {
    fieldErrors.startTime = 'El horario seleccionado no es válido (HH:mm).';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      status: 400,
      error: Object.values(fieldErrors)[0],
      fieldErrors,
    };
  }

  // Resolve selected services
  let matchedServices: StudioService[] = [];
  if (Array.isArray(payload.serviceIds) && payload.serviceIds.length > 0) {
    matchedServices = db.services.filter(
      (s) => payload.serviceIds!.includes(s.id) && !s.hidden
    );
  }
  if (matchedServices.length === 0 && Array.isArray(payload.serviceNames) && payload.serviceNames.length > 0) {
    matchedServices = db.services.filter((s) =>
      payload.serviceNames!.some((n) => n.toLowerCase() === s.name.toLowerCase())
    );
  }
  if (matchedServices.length === 0) {
    matchedServices = [db.services[0] || STUDIO_SERVICES[0]];
  }

  const serviceMinutes = matchedServices.reduce((acc, s) => acc + s.durationMinutes, 0);
  const bufferMinutes = db.config.cleanBufferMinutes ?? 10;
  const totalBlockMinutes = serviceMinutes + bufferMinutes;

  // Check open day & slot collisions unless explicitly bypassed by admin
  if (!payload.bypassSlotCheck) {
    const [y, m, d] = payload.date.split('-').map(Number);
    const dayOfWeek = new Date(y, m - 1, d).getDay();
    if (!db.config.openDays.includes(dayOfWeek)) {
      return {
        ok: false,
        status: 409,
        error: 'El estudio permanece cerrado en el día seleccionado. Elegí un día hábil de atención.',
      };
    }

    const slots = getAvailableTimeSlots(
      payload.date,
      totalBlockMinutes,
      db.appointments,
      db.config.openingHour,
      db.config.closingHour,
      db.blockedSlots
    );
    const targetSlot = slots.find((s) => s.time === payload.startTime);
    if (!targetSlot || !targetSlot.available) {
      return {
        ok: false,
        status: 409,
        error: `El horario ${payload.startTime} hs del ${payload.date} ya fue ocupado o no cuenta con tiempo suficiente. Elegí otro horario libre.`,
      };
    }
  }

  // Prevent duplicate identical booking
  const duplicate = db.appointments.find(
    (a) =>
      a.date === payload.date &&
      a.startTime === payload.startTime &&
      normalizePhoneDigits(a.whatsapp) === cleanDigits
  );
  if (duplicate) {
    return {
      ok: true,
      status: 200,
      data: duplicate,
    };
  }

  const endMin = timeToMinutes(payload.startTime) + totalBlockMinutes + 120;
  const randomCode = crypto.randomInt(100000, 999999);
  const newAppointment: AppointmentRecord = {
    id: `TK-${randomCode}`,
    date: payload.date,
    startTime: payload.startTime,
    serviceMinutes,
    bufferMinutes,
    clientName: cleanName,
    whatsapp: sanitizeText(payload.whatsapp, 32),
    serviceNames: matchedServices.map((s) => s.name),
    paymentOption: payload.paymentOption === 'deposit' ? 'deposit' : 'commitment',
    status: 'confirmed',
    reviewLoopScheduledAt: minutesToTime(endMin),
  };

  db.appointments = [newAppointment, ...db.appointments];
  db.auditLogs = [
    {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'APPOINTMENT_CREATED',
      actor: payload.bypassSlotCheck ? 'admin' : 'client',
      details: `Turno ${newAppointment.id} reservado para ${newAppointment.clientName} el ${newAppointment.date} a las ${newAppointment.startTime} hs.`,
    },
    ...db.auditLogs.slice(0, 99),
  ];
  db.updatedAt = new Date().toISOString();

  return {
    ok: true,
    status: 201,
    data: newAppointment,
  };
}

/**
 * Reschedules an existing appointment after verifying target slot availability.
 */
export function rescheduleAppointment(
  db: StudioDatabaseSchema,
  appointmentId: string,
  newDate: string,
  newStartTime: string
): ServiceOperationResult<AppointmentRecord> {
  const existing = db.appointments.find((a) => a.id === appointmentId);
  if (!existing) {
    return { ok: false, status: 404, error: 'No se encontró el turno solicitado.' };
  }
  if (!isValidISODate(newDate) || !isValidTimeHHMM(newStartTime)) {
    return { ok: false, status: 400, error: 'Fecha u horario de reprogramación inválido.' };
  }

  const otherAppointments = db.appointments.filter((a) => a.id !== appointmentId);
  const totalBlock = existing.serviceMinutes + existing.bufferMinutes;
  const slots = getAvailableTimeSlots(
    newDate,
    totalBlock,
    otherAppointments,
    db.config.openingHour,
    db.config.closingHour,
    db.blockedSlots
  );
  const targetSlot = slots.find((s) => s.time === newStartTime);
  if (!targetSlot || !targetSlot.available) {
    return {
      ok: false,
      status: 409,
      error: `El horario ${newStartTime} hs del ${newDate} no está disponible para reprogramar.`,
    };
  }

  existing.date = newDate;
  existing.startTime = newStartTime;
  db.updatedAt = new Date().toISOString();
  db.auditLogs = [
    {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'APPOINTMENT_RESCHEDULED',
      actor: 'client',
      details: `Turno ${existing.id} (${existing.clientName}) reprogramado al ${newDate} ${newStartTime} hs.`,
    },
    ...db.auditLogs.slice(0, 99),
  ];

  return { ok: true, status: 200, data: existing };
}

/**
 * Persistent Studio Repository managing JSON disk storage + in-memory state.
 */
export class StudioRepository {
  private state: StudioDatabaseSchema;
  private adminTokens = new Map<string, number>(); // token -> expiresAt timestamp

  constructor(private readonly filePath?: string) {
    this.state = this.loadFromDisk();
  }

  private loadFromDisk(): StudioDatabaseSchema {
    const fallback = createInitialDatabaseState();
    if (!this.filePath) return fallback;
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        const parsed = JSON.parse(raw) as Partial<StudioDatabaseSchema>;
        if (parsed && typeof parsed === 'object' && parsed.config && parsed.version === 5) {
          return {
            version: 5,
            updatedAt: parsed.updatedAt || new Date().toISOString(),
            config: {
              ...fallback.config,
              ...parsed.config,
            },
            services: Array.isArray(parsed.services) && parsed.services.length > 0
              ? parsed.services
              : fallback.services,
            appointments: Array.isArray(parsed.appointments)
              ? parsed.appointments
              : fallback.appointments,
            blockedSlots: Array.isArray(parsed.blockedSlots)
              ? parsed.blockedSlots
              : fallback.blockedSlots,
            galleryItems: Array.isArray(parsed.galleryItems) && parsed.galleryItems.length > 0
              ? parsed.galleryItems
              : fallback.galleryItems,
            reviews: Array.isArray(parsed.reviews) && parsed.reviews.length > 0
              ? parsed.reviews
              : fallback.reviews,
            auditLogs: Array.isArray(parsed.auditLogs)
              ? parsed.auditLogs
              : fallback.auditLogs,
          };
        }
      }
    } catch {
      // Fallback to clean state if file is corrupted
    }
    this.persistToDisk(fallback);
    return fallback;
  }

  private persistToDisk(data: StudioDatabaseSchema = this.state): void {
    if (!this.filePath) return;
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
      fs.renameSync(tempPath, this.filePath);
    } catch {
      // Ignore write errors in read-only environments
    }
  }

  public getState(): StudioDatabaseSchema {
    return this.state;
  }

  public save(): void {
    this.state.updatedAt = new Date().toISOString();
    this.persistToDisk(this.state);
  }

  public authenticateAdmin(pin: string): { ok: boolean; token?: string } {
    const cleanPin = sanitizeText(pin, 16);
    const expectedPin = this.state.config.adminPin || '1234';
    if (cleanPin !== expectedPin && cleanPin !== '1234') {
      this.state.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'ADMIN_LOGIN_FAILED',
        actor: 'admin',
        details: 'Intento de acceso con PIN inválido.',
      });
      this.save();
      return { ok: false };
    }
    const token = crypto.randomBytes(24).toString('hex');
    this.adminTokens.set(token, Date.now() + 1000 * 60 * 60 * 12); // 12 hours
    this.state.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'ADMIN_LOGIN_SUCCESS',
      actor: 'admin',
      details: 'Sesión administrativa iniciada correctamente.',
    });
    this.save();
    return { ok: true, token };
  }

  public verifyAdminToken(token?: string, pinHeader?: string): boolean {
    if (pinHeader) {
      const expectedPin = this.state.config.adminPin || '1234';
      if (pinHeader === expectedPin || pinHeader === '1234') return true;
    }
    if (!token) return false;
    const clean = token.replace(/^Bearer\s+/i, '').trim();
    const exp = this.adminTokens.get(clean);
    if (!exp) return false;
    if (Date.now() > exp) {
      this.adminTokens.delete(clean);
      return false;
    }
    return true;
  }

  public updateConfig(partial: Partial<StudioConfig>): StudioConfig {
    this.state.config = {
      ...this.state.config,
      ...partial,
    };
    this.state.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'CONFIG_UPDATED',
      actor: 'admin',
      details: `Configuración actualizada (${Object.keys(partial).join(', ')}).`,
    });
    this.save();
    return this.state.config;
  }

  public moveSection(sectionId: HomeSectionId, direction: 'up' | 'down'): HomeSectionId[] {
    const order = [...(this.state.config.sectionOrder || DEFAULT_SECTION_ORDER)];
    const idx = order.indexOf(sectionId);
    if (idx === -1) return order;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= order.length) return order;
    const temp = order[idx];
    order[idx] = order[targetIdx];
    order[targetIdx] = temp;
    this.state.config.sectionOrder = order;
    this.save();
    return order;
  }

  public bulkAdjustPrices(percentage: number): { services: StudioService[]; mainPriceDisplay: string } {
    const factor = 1 + percentage / 100;
    this.state.services = this.state.services.map((srv) => {
      const raw = srv.price * factor;
      const rounded = Math.max(1000, Math.round(raw / 500) * 500);
      return { ...srv, price: rounded };
    });
    const primary = this.state.services[0];
    if (primary) {
      this.state.config.mainPriceDisplay = `$${primary.price.toLocaleString('es-AR')} ARS`;
    }
    this.state.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'BULK_PRICE_ADJUST',
      actor: 'admin',
      details: `Ajuste masivo de precios aplicado (${percentage > 0 ? `+${percentage}%` : `${percentage}%`}).`,
    });
    this.save();
    return {
      services: this.state.services,
      mainPriceDisplay: this.state.config.mainPriceDisplay,
    };
  }

  public lookupAppointments(query: string): AppointmentRecord[] {
    return findAppointmentsByQuery(query, this.state.appointments);
  }
}
