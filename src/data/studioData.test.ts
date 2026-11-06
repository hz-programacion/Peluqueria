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
} from '../utils/bookingEngine';

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

test('INITIAL_STUDIO_CONFIG includes all main-page section visibility switches enabled by default', () => {
  assert.equal(INITIAL_STUDIO_CONFIG.showHeroSection, true);
  assert.equal(INITIAL_STUDIO_CONFIG.showServicesSection, true);
  assert.equal(INITIAL_STUDIO_CONFIG.showBookingSection, true);
  assert.equal(INITIAL_STUDIO_CONFIG.showGallerySection, true);
  assert.equal(INITIAL_STUDIO_CONFIG.showBarberSection, true);
  assert.equal(INITIAL_STUDIO_CONFIG.showReviewsSection, true);
  assert.equal(INITIAL_STUDIO_CONFIG.showLocationSection, true);
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
