import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRESENTATION_AUDIO_URL,
  PRESENTATION_AUDIO_TRANSCRIPT,
  STUDIO_GALLERY_ITEMS,
  STUDIO_SERVICES,
  STUDIO_DROPS,
  LOOKBOOK_ITEMS,
  GOOGLE_REVIEWS,
  AppointmentRecord,
} from './studioData';
import { INITIAL_STUDIO_CONFIG } from './studioStore';
import {
  getTodayLocalISO,
  getAvailableTimeSlots,
  calculateBookingSummary,
  resolveInstagramInfo,
  resolveWhatsAppInfo,
  getNextAvailableSlotInfo,
  findAppointmentsByQuery,
} from '../utils/bookingEngine';
import {
  generateICSContent,
  generateGoogleCalendarUrl,
  ExportableTicketData,
} from '../utils/ticketExport';

test('presentation audio asset and synchronized transcript are properly configured', () => {
  assert.equal(
    PRESENTATION_AUDIO_URL,
    '/assets/aistudio/ElevenLabs_2026-11-06T09_51_29_Carlos_pro_pvc_s50_sim75_v4_d6b60f32.mp3'
  );
  assert.ok(PRESENTATION_AUDIO_TRANSCRIPT.length >= 5);
  for (const segment of PRESENTATION_AUDIO_TRANSCRIPT) {
    assert.ok(segment.endTime > segment.startTime, `Segment ${segment.id} must have endTime > startTime`);
    assert.ok(segment.text.length > 5, `Segment ${segment.id} must have non-empty text`);
  }
});

test('multi-purpose gallery includes all 5 categories for Rodrigo and the studio', () => {
  const categories = new Set(STUDIO_GALLERY_ITEMS.map((item) => item.category));
  assert.ok(categories.has('Cortes & Fades'));
  assert.ok(categories.has('El Estudio & Local'));
  assert.ok(categories.has('Máquinas & Setup'));
  assert.ok(categories.has('Color & Diseños'));
  assert.ok(categories.has('Cultura & Streetwear'));
});

test('no services, lookbook items, gallery items, or reviews reference razors (navaja/shavette) or disliked phrase (cero plantillas)', () => {
  const serialized = JSON.stringify({
    PRESENTATION_AUDIO_TRANSCRIPT,
    INITIAL_STUDIO_CONFIG,
    STUDIO_SERVICES,
    STUDIO_DROPS,
    LOOKBOOK_ITEMS,
    STUDIO_GALLERY_ITEMS,
    GOOGLE_REVIEWS,
  }).toLowerCase();

  assert.equal(serialized.includes('navaja'), false, 'Should not contain navaja');
  assert.equal(serialized.includes('shavette'), false, 'Should not contain shavette');
  assert.equal(serialized.includes('cero plantillas'), false, 'Should not contain cero plantillas');
  assert.equal(serialized.includes('ceroplantillas'), false, 'Should not contain ceroplantillas');
});

test('getTodayLocalISO returns current local date in YYYY-MM-DD format', () => {
  const today = getTodayLocalISO(new Date(2026, 10, 6, 10, 30, 0));
  assert.equal(today, '2026-11-06');
});

test('getAvailableTimeSlots updates dynamically when appointments are added or cancelled', () => {
  const dateStr = '2026-11-06'; // Friday
  const totalMinutesNeeded = 50; // 40m cut + 10m buffer

  // Initially empty appointments
  const initialSlots = getAvailableTimeSlots(dateStr, totalMinutesNeeded, [], 11, 21, []);
  const slot1630Before = initialSlots.find((s) => s.time === '16:30');
  assert.ok(slot1630Before);
  assert.equal(slot1630Before.available, true);

  // Add an appointment at 16:30
  const booked: AppointmentRecord[] = [
    {
      id: 'app-test-1',
      date: dateStr,
      startTime: '16:30',
      serviceMinutes: 40,
      bufferMinutes: 10,
      clientName: 'Test Client',
      whatsapp: '+5493462554421',
      serviceNames: ['Corte de Pelo & Fade'],
      paymentOption: 'commitment',
      status: 'confirmed',
      reviewLoopScheduledAt: '19:20',
    },
  ];

  const slotsAfterBooking = getAvailableTimeSlots(dateStr, totalMinutesNeeded, booked, 11, 21, []);
  const slot1630During = slotsAfterBooking.find((s) => s.time === '16:30');
  assert.ok(slot1630During);
  assert.equal(slot1630During.available, false);

  // Cancel the appointment (empty array) -> slot becomes available again
  const slotsAfterCancel = getAvailableTimeSlots(dateStr, totalMinutesNeeded, [], 11, 21, []);
  const slot1630After = slotsAfterCancel.find((s) => s.time === '16:30');
  assert.ok(slot1630After);
  assert.equal(slot1630After.available, true);
});

test('getNextAvailableSlotInfo calculates real-time next open slot today or next open day', () => {
  const fridayMorning = new Date(2026, 10, 6, 10, 15, 0); // 2026-11-06 10:15
  const nextSlot = getNextAvailableSlotInfo([], [], 10, 20, [1, 2, 3, 4, 5, 6], 50, fridayMorning);
  assert.ok(nextSlot);
  assert.equal(nextSlot.dateISO, '2026-11-06');
  assert.equal(nextSlot.isToday, true);
  assert.equal(nextSlot.time, '10:30');
});

test('findAppointmentsByQuery matches by WhatsApp digits, client name, or ticket ID', () => {
  const sampleAppointments: AppointmentRecord[] = [
    {
      id: 'TK-882910',
      date: '2026-11-07',
      startTime: '15:30',
      serviceMinutes: 45,
      bufferMinutes: 10,
      clientName: 'Mateo Rossi',
      whatsapp: '+54 9 3462 51-2340',
      serviceNames: ['Corte Urbano & Fade de Autor'],
      paymentOption: 'deposit',
      status: 'confirmed',
      reviewLoopScheduledAt: '18:00',
    },
  ];

  const byPhone = findAppointmentsByQuery('512340', sampleAppointments);
  assert.equal(byPhone.length, 1);
  assert.equal(byPhone[0].id, 'TK-882910');

  const byName = findAppointmentsByQuery('Mateo', sampleAppointments);
  assert.equal(byName.length, 1);

  const byId = findAppointmentsByQuery('TK-882910', sampleAppointments);
  assert.equal(byId.length, 1);
});

test('generateICSContent and generateGoogleCalendarUrl build valid calendar data', () => {
  const ticket: ExportableTicketData = {
    id: 'TK-900100',
    clientName: 'Lucas Santoro',
    whatsapp: '3462554421',
    date: '2026-11-07',
    time: '16:30',
    services: ['Corte Urbano & Fade de Autor'],
    totalMinutes: 45,
    totalPrice: 12000,
    paymentOption: 'deposit',
    studioTitle: 'Rodrigo Cutsss',
    address: 'Vuelta de Obligado 931',
    neighborhood: 'Venado Tuerto, Santa Fe',
    transferAlias: 'rodrigo.cutsss.mp',
  };

  const ics = generateICSContent(ticket);
  assert.equal(ics.includes('BEGIN:VCALENDAR'), true);
  assert.equal(ics.includes('Vuelta de Obligado 931'), true);
  assert.equal(ics.includes('DTSTART:20261107T163000'), true);

  const gcal = generateGoogleCalendarUrl(ticket);
  assert.equal(gcal.startsWith('https://calendar.google.com/calendar/render?'), true);
  assert.equal(gcal.includes('TK-900100'), true);
});

test('calculateBookingSummary ignores hidden services and computes deposit properly', () => {
  const servicesWithHidden = STUDIO_SERVICES.map((s, idx) =>
    idx === 0 ? { ...s, hidden: true } : s
  );
  const summary = calculateBookingSummary(
    [STUDIO_SERVICES[0].id, STUDIO_SERVICES[1].id],
    servicesWithHidden,
    10,
    30
  );
  assert.equal(summary.selectedServices.length, 1);
  assert.equal(summary.selectedServices[0].id, STUDIO_SERVICES[1].id);
});

test('INITIAL_STUDIO_CONFIG includes all main-page section visibility switches enabled by default and conversion-first section order', () => {
  assert.equal(INITIAL_STUDIO_CONFIG.showHeroSection, true);
  assert.equal(INITIAL_STUDIO_CONFIG.showServicesSection, true);
  assert.equal(INITIAL_STUDIO_CONFIG.showBeforeAfterSection, true);
  assert.equal(INITIAL_STUDIO_CONFIG.showBookingSection, true);
  assert.equal(INITIAL_STUDIO_CONFIG.showGallerySection, true);
  assert.equal(INITIAL_STUDIO_CONFIG.showBarberSection, true);
  assert.equal(INITIAL_STUDIO_CONFIG.showReviewsSection, true);
  assert.equal(INITIAL_STUDIO_CONFIG.showLocationSection, true);

  const order = INITIAL_STUDIO_CONFIG.sectionOrder || [];
  assert.equal(order[0], 'booking', 'Booking (Sacar Turno) must be the #1 priority section');
  const reviewsIdx = order.indexOf('reviews');
  const locationIdx = order.indexOf('location');
  assert.ok(reviewsIdx !== -1 && locationIdx !== -1 && reviewsIdx < locationIdx, 'Reviews must appear above Location');
});

test('resolveInstagramInfo and resolveWhatsAppInfo handle both handles/numbers and full URLs', () => {
  const ig1 = resolveInstagramInfo('@rodrigo.cutsss');
  assert.equal(ig1.url, 'https://instagram.com/rodrigo.cutsss');
  assert.equal(ig1.handle, '@rodrigo.cutsss');

  const ig2 = resolveInstagramInfo('https://instagram.com/nuevo.barbero');
  assert.equal(ig2.url, 'https://instagram.com/nuevo.barbero');
  assert.equal(ig2.handle, '@nuevo.barbero');

  const wa1 = resolveWhatsAppInfo('+54 9 3462 66-7788');
  assert.equal(wa1.digits, '5493462667788');
  assert.equal(wa1.url, 'https://wa.me/5493462667788');
});

test('src/lib/firebase.ts contains zero hardcoded Google API keys and reads from VITE_FIREBASE_API_KEY', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const firebaseSource = fs.readFileSync(path.resolve(process.cwd(), 'src/lib/firebase.ts'), 'utf8');
  assert.equal(/AIza[0-9A-Za-z_-]{30,}/.test(firebaseSource), false, 'Must not contain hardcoded Google API Key');
  assert.equal(firebaseSource.includes('VITE_FIREBASE_API_KEY'), true, 'Must use VITE_FIREBASE_API_KEY env var');
});

test('backendEngine: sanitizeText strips HTML tags and enforces max length', async () => {
  const { sanitizeText, normalizePhoneDigits } = await import('../server/backendEngine');
  const dirty = '  <script>alert(1)</script>Mateo   Rossi <b>Cut</b>  ';
  assert.equal(sanitizeText(dirty, 80), 'alert(1)Mateo Rossi Cut');
  assert.equal(normalizePhoneDigits('+54 9 3462 51-2340'), '5493462512340');
});

test('backendEngine: RateLimiter allows requests within limit and blocks excess', async () => {
  const { RateLimiter } = await import('../server/backendEngine');
  const limiter = new RateLimiter(60_000, 3);
  assert.equal(limiter.check('127.0.0.1', 1000).allowed, true);
  assert.equal(limiter.check('127.0.0.1', 1001).allowed, true);
  assert.equal(limiter.check('127.0.0.1', 1002).allowed, true);
  const fourth = limiter.check('127.0.0.1', 1003);
  assert.equal(fourth.allowed, false);
  assert.equal(fourth.remaining, 0);
});

test('backendEngine: validateAndCreateAppointment prevents double-booking collisions and validates fields', async () => {
  const {
    createInitialDatabaseState,
    validateAndCreateAppointment,
    rescheduleAppointment,
    computeStudioMetrics,
  } = await import('../server/backendEngine');

  const state = createInitialDatabaseState();
  state.appointments = [];
  state.blockedSlots = [];

  // 1. Valid appointment creation on Friday 2026-11-06 at 16:00
  const validRes = validateAndCreateAppointment(state, {
    date: '2026-11-06',
    startTime: '16:00',
    clientName: 'Lucas Santoro',
    whatsapp: '+54 9 3462 55-4421',
    serviceNames: ['Corte de Pelo (Corte de Autor & Fade)'],
    paymentOption: 'deposit',
  });
  assert.equal(validRes.ok, true);
  assert.equal(validRes.status, 201);
  assert.ok(validRes.data);
  const createdId = validRes.data.id;

  // 2. Overlapping slot at 16:30 on the same date must be rejected with 409 Conflict
  const overlapRes = validateAndCreateAppointment(state, {
    date: '2026-11-06',
    startTime: '16:30',
    clientName: 'Otro Cliente',
    whatsapp: '+54 9 3462 99-8877',
    serviceNames: ['Corte de Pelo (Corte de Autor & Fade)'],
    paymentOption: 'commitment',
  });
  assert.equal(overlapRes.ok, false);
  assert.equal(overlapRes.status, 409);

  // 3. Rescheduling createdId to 17:30 succeeds and frees 16:00
  const resched = rescheduleAppointment(state, createdId, '2026-11-06', '17:30');
  assert.equal(resched.ok, true);
  assert.equal(resched.data?.startTime, '17:30');

  // 4. Metrics computation returns accurate counts and revenue
  const metrics = computeStudioMetrics(state, new Date(2026, 10, 6, 12, 0, 0));
  assert.equal(metrics.todayAppointmentsCount, 1);
  assert.ok(metrics.todayEstimatedRevenueARS >= 12000);
});

test('UrbanHaircutAdvisor: computeVisagismoPrescription returns tailored 2026 technical formula', async () => {
  const { computeVisagismoPrescription } = await import('../components/UrbanHaircutAdvisor');
  const curlyLowTaper = computeVisagismoPrescription('curly', 'oval', 'low_taper');
  assert.ok(curlyLowTaper.headline.includes('Low Taper'));
  assert.ok(curlyLowTaper.guardFormula.includes('0.0mm'));

  const platinum = computeVisagismoPrescription('straight', 'angular', 'platinum_color');
  assert.ok(platinum.headline.includes('Platinado'));
});

test('STUDIO_SERVICES contains the 5 realistic local services for Venado Tuerto', () => {
  assert.equal(STUDIO_SERVICES.length, 5);
  const serviceNames = STUDIO_SERVICES.map((s) => s.name);
  assert.deepEqual(serviceNames, [
    'Corte de Autor / Clásico',
    'Corte + Perfilado de Barba',
    'Diseño y Perfilado de Barba',
    'Coloración / Iluminación',
    'Lavado Premium y Nutrición Capilar',
  ]);
});

test('seoEngine: resolveSeoViewKey and buildViewSeoMetadata produce unique titles, descriptions, and Schema.org JSON-LD for every view', async () => {
  const { resolveSeoViewKey, buildViewSeoMetadata } = await import('../utils/seoEngine');

  assert.equal(resolveSeoViewKey('home', 'turnero'), 'booking');
  assert.equal(resolveSeoViewKey('home', 'servicios'), 'services');
  assert.equal(resolveSeoViewKey('home', 'obras'), 'lookbook');
  assert.equal(resolveSeoViewKey('admin', ''), 'admin');

  const views = [
    'home',
    'booking',
    'services',
    'beforeAfter',
    'lookbook',
    'reviews',
    'experience',
    'location',
    'admin',
  ] as const;

  const titles = new Set<string>();
  const descriptions = new Set<string>();

  for (const v of views) {
    const meta = buildViewSeoMetadata({
      viewKey: v,
      config: INITIAL_STUDIO_CONFIG,
      services: STUDIO_SERVICES,
      origin: 'https://rodrigocutsss.com.ar',
    });
    assert.ok(meta.title.length > 15, `View ${v} must have a descriptive title`);
    assert.ok(meta.description.length > 40, `View ${v} must have a descriptive meta description`);
    titles.add(meta.title);
    descriptions.add(meta.description);
  }

  assert.equal(titles.size, views.length, 'Every view must have a unique <title>');
  assert.equal(descriptions.size, views.length, 'Every view must have a unique <meta name="description">');

  const adminMeta = buildViewSeoMetadata({
    viewKey: 'admin',
    config: INITIAL_STUDIO_CONFIG,
    origin: 'https://rodrigocutsss.com.ar',
  });
  assert.equal(adminMeta.robots, 'noindex, nofollow');
});

test('PWA compliance: manifest.json, service worker, and icon assets meet browser installability standards', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');

  const manifestPath = path.resolve(process.cwd(), 'public/manifest.json');
  assert.equal(fs.existsSync(manifestPath), true, 'public/manifest.json must exist');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.id, '/');
  assert.equal(manifest.start_url, '/');
  assert.equal(manifest.scope, '/');
  assert.equal(manifest.display, 'standalone');
  assert.ok(manifest.short_name.length <= 12, 'short_name must be <= 12 characters');

  const iconSizes = manifest.icons.map((i: { sizes: string }) => i.sizes);
  assert.equal(iconSizes.includes('192x192'), true, 'Must include 192x192 icon');
  assert.equal(iconSizes.includes('512x512'), true, 'Must include 512x512 icon');

  const hasMaskable = manifest.icons.some(
    (i: { purpose?: string }) => i.purpose === 'maskable'
  );
  assert.equal(hasMaskable, true, 'Must include dedicated maskable icon');

  for (const file of [
    'public/sw.js',
    'public/icon.svg',
    'public/pwa-192x192.png',
    'public/pwa-512x512.png',
    'public/pwa-maskable-512x512.png',
    'public/apple-touch-icon.png',
  ]) {
    const full = path.resolve(process.cwd(), file);
    assert.equal(fs.existsSync(full), true, `${file} must exist`);
    assert.ok(fs.statSync(full).size > 100, `${file} must be non-empty`);
  }
});

test('Perfected Business Logic: smart combo discount, upcoming open working days on closed Sunday, and Argentine WhatsApp normalization', async () => {
  const {
    calculateBookingSummary,
    getUpcomingOpenDays,
    normalizeArgentineWhatsApp,
  } = await import('../utils/bookingEngine');

  // 1. Selecting Haircut (srv-01: $12.000, 45m) + Beard (srv-03: $8.500, 30m) automatically matches Combo (srv-02: $17.000, 60m)
  const comboSummary = calculateBookingSummary(['srv-01', 'srv-03'], STUDIO_SERVICES, 10, 30);
  assert.equal(comboSummary.subtotalPrice, 20500);
  assert.equal(comboSummary.discountAmount, 3500);
  assert.equal(comboSummary.totalPrice, 17000);
  assert.equal(comboSummary.serviceMinutes, 60);

  // 2. Selecting Haircut (srv-01: $12.000) + Wash/Nutrition (srv-05: $9.500) applies 10% Pack Bonus
  const packSummary = calculateBookingSummary(['srv-01', 'srv-05'], STUDIO_SERVICES, 10, 30);
  assert.equal(packSummary.subtotalPrice, 21500);
  assert.ok(packSummary.discountAmount >= 2000);
  assert.equal(packSummary.totalPrice, packSummary.subtotalPrice - packSummary.discountAmount);

  // 3. On Sunday 2026-11-08 when openDays is Tue-Sat ([2,3,4,5,6]), getUpcomingOpenDays starts on Tuesday 2026-11-10
  const sunday = new Date(2026, 10, 8, 13, 0, 0);
  const upcoming = getUpcomingOpenDays([], [], 11, 21, [2, 3, 4, 5, 6], 50, 6, sunday);
  assert.equal(upcoming.length, 6);
  assert.equal(upcoming[0].dateISO, '2026-11-10');
  assert.equal(upcoming[0].dayNameShort, 'Mar');
  assert.ok(upcoming[0].freeSlotsCount > 0);

  // 4. Argentine WhatsApp normalization handles local Venado Tuerto numbers
  const norm = normalizeArgentineWhatsApp('03462 55-4421');
  assert.equal(norm.isValid, true);
  assert.equal(norm.digits, '5493462554421');
});

test('INITIAL_TRANSFORMATION_CASES provides complete before/after transformation records with recommended profiles', async () => {
  const { INITIAL_TRANSFORMATION_CASES } = await import('./studioData');
  assert.ok(INITIAL_TRANSFORMATION_CASES.length >= 3);
  for (const item of INITIAL_TRANSFORMATION_CASES) {
    assert.ok(item.id.length > 0);
    assert.ok(item.title.length > 3);
    assert.ok(item.beforeImage.length > 5);
    assert.ok(item.afterImage.length > 5);
    assert.ok(item.idealFor.length > 5);
  }
});

test('src/services/firebase.ts initializes Firestore and Auth with provisioned project configuration', async () => {
  const { firebaseConfig, isFirebaseConfigured, db, auth } = await import('../services/firebase');
  const { formatBytesLabel } = await import('../utils/imageOptimizer');

  assert.equal(isFirebaseConfigured, true);
  assert.equal(firebaseConfig.projectId, 'clear-air-3mzf6');
  assert.ok(db !== null, 'Firestore db instance must be initialized');
  assert.ok(auth !== null, 'Firebase Auth instance must be initialized');
  assert.equal(formatBytesLabel(153600), '150 KB');
});
