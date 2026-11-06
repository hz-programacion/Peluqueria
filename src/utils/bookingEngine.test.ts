import test from 'node:test';
import assert from 'node:assert/strict';
import { STUDIO_SERVICES, AppointmentRecord } from '../data/studioData';
import {
  calculateBookingSummary,
  getAvailableTimeSlots,
  validateBookingForm,
  getStudioLiveStatus,
  buildAutomatedWhatsAppMessages,
} from './bookingEngine';

test('calculateBookingSummary adds service durations plus a single 10-minute hygiene buffer', () => {
  const summary = calculateBookingSummary(
    ['srv-mid-fade-crop', 'srv-full-experience'],
    STUDIO_SERVICES
  );
  // 40 min + 60 min = 100 min + 10 min buffer = 110 min
  assert.equal(summary.serviceMinutes, 100);
  assert.equal(summary.bufferMinutes, 10);
  assert.equal(summary.totalBlockMinutes, 110);
  assert.equal(summary.totalPrice, 12000 + 17000);
  assert.equal(summary.depositAmount, Math.round(29000 * 0.3));
});

test('calculateBookingSummary returns 0 buffer when no services are selected', () => {
  const summary = calculateBookingSummary([], STUDIO_SERVICES);
  assert.equal(summary.serviceMinutes, 0);
  assert.equal(summary.bufferMinutes, 0);
  assert.equal(summary.totalBlockMinutes, 0);
  assert.equal(summary.totalPrice, 0);
});

test('getAvailableTimeSlots blocks overlapping continuous intervals including 10-min buffer', () => {
  const existingAppointments: AppointmentRecord[] = [
    {
      id: 'app-1',
      date: '2026-11-06',
      startTime: '11:00',
      serviceMinutes: 45,
      bufferMinutes: 10, // occupies 11:00 to 11:55
      clientName: 'Lucas Gómez',
      whatsapp: '+5491144445555',
      serviceNames: ['Mid / Low Fade & Crop Texturizado'],
      paymentOption: 'commitment',
      status: 'confirmed',
      reviewLoopScheduledAt: '13:55',
    },
  ];

  // If client wants a 75m service + 10m buffer = 85m total block:
  // Starting at 10:00 would end at 11:25 -> overlaps with 11:00 appointment!
  const slotsFor85m = getAvailableTimeSlots('2026-11-06', 85, existingAppointments, 10, 20);
  const slot1000 = slotsFor85m.find((s) => s.time === '10:00');
  const slot1100 = slotsFor85m.find((s) => s.time === '11:00');
  const slot1200 = slotsFor85m.find((s) => s.time === '12:00');

  assert.equal(slot1000?.available, false);
  assert.equal(slot1100?.available, false);
  assert.equal(slot1200?.available, true);
});

test('validateBookingForm rejects empty inputs and accepts valid data', () => {
  const invalidResult = validateBookingForm({
    selectedServiceIds: [],
    date: '',
    time: '',
    firstName: 'A',
    lastName: '',
    countryCode: '+54',
    whatsappNumber: '123',
    paymentOption: 'commitment',
  });

  assert.equal(invalidResult.valid, false);
  assert.ok(invalidResult.errors.services);
  assert.ok(invalidResult.errors.firstName);
  assert.ok(invalidResult.errors.lastName);
  assert.ok(invalidResult.errors.whatsappNumber);

  const validResult = validateBookingForm({
    selectedServiceIds: ['srv-mid-fade-crop'],
    date: '2026-11-06',
    time: '14:00',
    firstName: 'Julián',
    lastName: 'Álvarez',
    countryCode: '+54',
    whatsappNumber: '1156789012',
    paymentOption: 'deposit',
  });

  assert.equal(validResult.valid, true);
  assert.equal(Object.keys(validResult.errors).length, 0);
});

test('getStudioLiveStatus accurately detects open and closed studio hours', () => {
  // Thursday Nov 5, 2026 at 14:30 -> Open
  const openDate = new Date(2026, 10, 5, 14, 30);
  const openStatus = getStudioLiveStatus(openDate);
  assert.equal(openStatus.isOpen, true);
  assert.ok(openStatus.headline.includes('Abierto ahora'));

  // Thursday Nov 5, 2026 at 08:15 -> Closed before opening
  const earlyDate = new Date(2026, 10, 5, 8, 15);
  const earlyStatus = getStudioLiveStatus(earlyDate);
  assert.equal(earlyStatus.isOpen, false);
  assert.ok(earlyStatus.headline.includes('Abre hoy a las 10:00'));
});

test('buildAutomatedWhatsAppMessages includes direct Google Review shortlink 2 hours post-appointment', () => {
  const messages = buildAutomatedWhatsAppMessages({
    clientFirstName: 'Martín',
    date: '2026-11-06',
    time: '15:00',
    endTime: '15:55',
    serviceNames: ['Corte de Pelo (Corte de Autor & Fade)'],
    reviewShortlink: 'https://g.page/r/RodrigoCutsss/review',
  });

  assert.ok(messages.reviewRequest2HoursAfter.includes('¡Hola Martín! Gracias por pasar hoy por Rodrigo Cutsss.'));
  assert.ok(messages.reviewRequest2HoursAfter.includes('https://g.page/r/RodrigoCutsss/review'));
});
