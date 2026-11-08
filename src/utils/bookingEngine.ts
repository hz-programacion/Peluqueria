import { AppointmentRecord, StudioService } from '../data/studioData';

export const BUFFER_MINUTES = 10;

export interface BookingSummary {
  selectedServices: StudioService[];
  serviceMinutes: number;
  bufferMinutes: number;
  totalBlockMinutes: number;
  subtotalPrice: number;
  discountAmount: number;
  discountReason?: string;
  totalPrice: number;
  depositAmount: number;
}

export interface TimeSlot {
  time: string; // "HH:mm"
  available: boolean;
  reason?: string;
}

export interface UpcomingOpenDay {
  dateISO: string;
  dayNameShort: string;
  dayNumber: string;
  monthShort: string;
  shortLabel: string;
  isToday: boolean;
  freeSlotsCount: number;
}

export interface BookingFormInput {
  selectedServiceIds: string[];
  date: string;
  time: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  whatsappNumber: string;
  paymentOption: 'deposit' | 'commitment';
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export interface NextAvailableSlotInfo {
  dateISO: string;
  time: string;
  isToday: boolean;
  label: string;
  freeCountToday: number;
}

const DAY_NAMES_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTH_NAMES_SHORT = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

/**
 * Returns YYYY-MM-DD in local time (never shifted to tomorrow or UTC).
 */
export function getTodayLocalISO(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns YYYY-MM-DD offset by `daysOffset` from `now` in local time.
 */
export function getOffsetDateISO(daysOffset: number, now: Date = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysOffset);
  return getTodayLocalISO(d);
}

/**
 * Calculates cumulative service duration, mandatory hygiene buffer,
 * automatic combo / multi-service discount, total block duration, total price, and deposit amount.
 */
export function calculateBookingSummary(
  selectedServiceIds: string[],
  catalog: StudioService[],
  bufferMin = BUFFER_MINUTES,
  depositPercentage = 30
): BookingSummary {
  const visibleCatalog = catalog.filter((s) => !s.hidden);
  const selectedServices = visibleCatalog.filter((s) => selectedServiceIds.includes(s.id));

  let serviceMinutes = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
  const subtotalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  let discountAmount = 0;
  let discountReason: string | undefined;

  // Smart Business Rule 1: If client selects "Corte" (srv-01) + "Barba" (srv-03) separately,
  // automatically match the official "Corte + Perfilado de Barba" (srv-02) combo price & 60m duration!
  const hasHaircut01 = selectedServices.some((s) => s.id === 'srv-01');
  const hasBeard03 = selectedServices.some((s) => s.id === 'srv-03');
  const officialCombo02 = visibleCatalog.find((s) => s.id === 'srv-02');

  if (hasHaircut01 && hasBeard03) {
    const hairSrv = selectedServices.find((s) => s.id === 'srv-01')!;
    const beardSrv = selectedServices.find((s) => s.id === 'srv-03')!;
    const pairSum = hairSrv.price + beardSrv.price;
    const targetComboPrice = officialCombo02 ? officialCombo02.price : pairSum - 3500;
    if (pairSum > targetComboPrice) {
      discountAmount = pairSum - targetComboPrice;
      discountReason = 'Bonificación automática Combo Corte + Barba';
    }
    // Optimize combined chair time by 15 min when performing haircut + beard in the same session
    serviceMinutes = Math.max(45, serviceMinutes - 15);
  } else if (selectedServices.length >= 2) {
    // Smart Business Rule 2: 10% Multi-Service Pack Bonus (rounded to nearest $500 ARS)
    const rawDiscount = Math.round((subtotalPrice * 0.1) / 500) * 500;
    if (rawDiscount >= 500) {
      discountAmount = rawDiscount;
      discountReason = 'Bonificación Pack Servicios Combinados (10% OFF)';
    }
  }

  const totalPrice = Math.max(0, subtotalPrice - discountAmount);
  const bufferMinutes = selectedServices.length > 0 ? bufferMin : 0;
  const totalBlockMinutes = serviceMinutes + bufferMinutes;
  const depositAmount = Math.round(totalPrice * (depositPercentage / 100));

  return {
    selectedServices,
    serviceMinutes,
    bufferMinutes,
    totalBlockMinutes,
    subtotalPrice,
    discountAmount,
    discountReason,
    totalPrice,
    depositAmount,
  };
}

export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export interface BlockedTimeSlotDef {
  date: string;
  startTime: string;
  durationMinutes: number;
  reason?: string;
}

/**
 * Generates candidate slots every 30 minutes between studio opening and closing hours
 * and checks whether a continuous block of `requiredBlockMinutes` fits without
 * colliding with existing appointments or blocked slots (each including its buffer).
 */
export function getAvailableTimeSlots(
  dateStr: string,
  requiredBlockMinutes: number,
  appointments: AppointmentRecord[],
  openHour = 11,
  closeHour = 21,
  blockedSlots: BlockedTimeSlotDef[] = [],
  openDays: number[] = [1, 2, 3, 4, 5, 6]
): TimeSlot[] {
  if (!dateStr) return [];

  // Parse local date safely
  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3 && !parts.some(Number.isNaN)) {
    const localDate = new Date(parts[0], parts[1] - 1, parts[2]);
    const dayOfWeek = localDate.getDay(); // 0 = Sun ... 6 = Sat
    if (Array.isArray(openDays) && openDays.length > 0 && !openDays.includes(dayOfWeek)) {
      return [];
    }
  }

  const openMin = openHour * 60;
  const closeMin = closeHour * 60;
  const dayAppointments = appointments.filter((app) => app.date === dateStr);
  const dayBlocked = blockedSlots.filter((b) => b.date === dateStr);
  const slots: TimeSlot[] = [];

  const effectiveDuration = requiredBlockMinutes > 0 ? requiredBlockMinutes : 50;

  for (let startMin = openMin; startMin + effectiveDuration <= closeMin; startMin += 30) {
    const endMin = startMin + effectiveDuration;
    let conflictReason: string | undefined;

    // Check against active appointments
    for (const app of dayAppointments) {
      const appStart = timeToMinutes(app.startTime);
      const appEnd = appStart + app.serviceMinutes + app.bufferMinutes;

      if (startMin < appEnd && endMin > appStart) {
        conflictReason = `Reservado (${app.startTime} – ${minutesToTime(appEnd)})`;
        break;
      }
    }

    // Check against manual blocked slots
    if (!conflictReason) {
      for (const block of dayBlocked) {
        const bStart = timeToMinutes(block.startTime);
        const bEnd = bStart + block.durationMinutes;
        if (startMin < bEnd && endMin > bStart) {
          conflictReason = block.reason
            ? `Bloqueado: ${block.reason}`
            : 'Horario bloqueado por el estudio';
          break;
        }
      }
    }

    slots.push({
      time: minutesToTime(startMin),
      available: !conflictReason,
      reason: conflictReason,
    });
  }

  return slots;
}

/**
 * Returns the next `count` open business days that have at least 1 available slot,
 * skipping closed weekdays (e.g. Sundays/Mondays) so the booking calendar always
 * defaults to a bookable working day.
 */
export function getUpcomingOpenDays(
  appointments: AppointmentRecord[],
  blockedSlots: BlockedTimeSlotDef[] = [],
  openHour = 11,
  closeHour = 21,
  openDays: number[] = [2, 3, 4, 5, 6],
  requiredBlockMinutes = 50,
  count = 6,
  now: Date = new Date()
): UpcomingOpenDay[] {
  const result: UpcomingOpenDay[] = [];
  const todayISO = getTodayLocalISO(now);

  for (let offset = 0; offset <= 21 && result.length < count; offset++) {
    const candidateDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    const dayOfWeek = candidateDate.getDay();
    if (Array.isArray(openDays) && openDays.length > 0 && !openDays.includes(dayOfWeek)) {
      continue;
    }

    const dateISO = getTodayLocalISO(candidateDate);
    const daySlots = getAvailableTimeSlots(
      dateISO,
      requiredBlockMinutes,
      appointments,
      openHour,
      closeHour,
      blockedSlots,
      openDays
    );
    const freeSlotsCount = daySlots.filter((s) => s.available).length;

    const dayNameShort = DAY_NAMES_SHORT[dayOfWeek] || 'Día';
    const dayNumber = String(candidateDate.getDate()).padStart(2, '0');
    const monthShort = MONTH_NAMES_SHORT[candidateDate.getMonth()] || '';
    const isToday = dateISO === todayISO;

    result.push({
      dateISO,
      dayNameShort,
      dayNumber,
      monthShort,
      shortLabel: isToday ? `Hoy (${dayNameShort} ${dayNumber})` : `${dayNameShort} ${dayNumber} ${monthShort}`,
      isToday,
      freeSlotsCount,
    });
  }

  return result;
}

/**
 * Calculates in real-time the next available slot today (or the next open day if today has none left).
 */
export function getNextAvailableSlotInfo(
  appointments: AppointmentRecord[],
  blockedSlots: BlockedTimeSlotDef[] = [],
  openHour = 11,
  closeHour = 21,
  openDays: number[] = [1, 2, 3, 4, 5, 6],
  requiredBlockMinutes = 50,
  now: Date = new Date()
): NextAvailableSlotInfo {
  const todayISO = getTodayLocalISO(now);
  const todaySlots = getAvailableTimeSlots(
    todayISO,
    requiredBlockMinutes,
    appointments,
    openHour,
    closeHour,
    blockedSlots,
    openDays
  );

  const freeTodaySlots = todaySlots.filter((s) => s.available);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // First check if there is a slot today that is >= current time (or any free slot today if outside open hours)
  const upcomingTodaySlot =
    freeTodaySlots.find((s) => timeToMinutes(s.time) >= currentMinutes) || freeTodaySlots[0];

  if (upcomingTodaySlot) {
    return {
      dateISO: todayISO,
      time: upcomingTodaySlot.time,
      isToday: true,
      label: `Próximo turno libre hoy: ${upcomingTodaySlot.time} hs`,
      freeCountToday: freeTodaySlots.length,
    };
  }

  // Otherwise check the next 7 days for the earliest open slot
  for (let offset = 1; offset <= 7; offset++) {
    const nextDateISO = getOffsetDateISO(offset, now);
    const nextSlots = getAvailableTimeSlots(
      nextDateISO,
      requiredBlockMinutes,
      appointments,
      openHour,
      closeHour,
      blockedSlots,
      openDays
    );
    const firstFree = nextSlots.find((s) => s.available);
    if (firstFree) {
      const parts = nextDateISO.split('-').map(Number);
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      const dayLabel =
        offset === 1
          ? 'mañana'
          : `${DAY_NAMES_SHORT[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      return {
        dateISO: nextDateISO,
        time: firstFree.time,
        isToday: false,
        label: `Próximo turno libre (${dayLabel}): ${firstFree.time} hs`,
        freeCountToday: 0,
      };
    }
  }

  return {
    dateISO: todayISO,
    time: `${String(openHour).padStart(2, '0')}:00`,
    isToday: false,
    label: `Agenda abierta desde las ${String(openHour).padStart(2, '0')}:00 hs`,
    freeCountToday: 0,
  };
}

/**
 * Finds active appointments by WhatsApp number (matching trailing digits) or client name / ticket ID.
 */
export function findAppointmentsByQuery(
  query: string,
  appointments: AppointmentRecord[]
): AppointmentRecord[] {
  const trimmed = (query || '').trim();
  if (!trimmed) return [];

  const queryDigits = trimmed.replace(/\D/g, '');
  const queryLower = trimmed.toLowerCase();

  return appointments.filter((app) => {
    const appDigits = (app.whatsapp || '').replace(/\D/g, '');
    // Match by last 6+ digits of WhatsApp number if digits were entered
    if (queryDigits.length >= 6 && appDigits.length >= 6) {
      const tail = queryDigits.slice(-6);
      if (appDigits.includes(tail)) return true;
    }
    // Also match by Ticket ID or Client Name
    if (app.id.toLowerCase().includes(queryLower)) return true;
    if (app.clientName.toLowerCase().includes(queryLower)) return true;
    return false;
  });
}

/**
 * Normalizes an Argentine WhatsApp / mobile phone number into international digits (549...)
 * and a clean human-readable display string.
 */
export function normalizeArgentineWhatsApp(rawInput: string): {
  digits: string;
  formattedDisplay: string;
  isValid: boolean;
} {
  let digits = (rawInput || '').replace(/\D/g, '');
  if (!digits) {
    return { digits: '', formattedDisplay: '', isValid: false };
  }

  // Strip leading 00 or 0 (national trunk prefix in Argentina, e.g. 03462...)
  digits = digits.replace(/^0+/, '');

  // If 10 digits (e.g. 3462554421), prepend 549 for Argentina mobile WhatsApp
  if (digits.length === 10 && !digits.startsWith('54')) {
    digits = `549${digits}`;
  } else if (digits.length === 11 && digits.startsWith('15')) {
    digits = `5493462${digits.slice(2)}`;
  } else if (digits.startsWith('54') && !digits.startsWith('549') && digits.length === 12) {
    digits = `549${digits.slice(2)}`;
  }

  const isValid = digits.length >= 8 && digits.length <= 15;
  return {
    digits,
    formattedDisplay: digits.startsWith('549')
      ? `+54 9 ${digits.slice(3, 7)} ${digits.slice(7)}`
      : rawInput.trim(),
    isValid,
  };
}

/**
 * Validates all 3 steps of the booking form without substituting fallback values.
 */
export function validateBookingForm(input: BookingFormInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.selectedServiceIds || input.selectedServiceIds.length === 0) {
    errors.services = 'Seleccioná al menos un servicio para calcular tu bloque de atención.';
  }

  if (!input.date || input.date.trim() === '') {
    errors.date = 'Seleccioná una fecha disponible en el calendario.';
  }

  if (!input.time || input.time.trim() === '') {
    errors.time = 'Seleccioná una franja horaria continua.';
  }

  if (!input.firstName || input.firstName.trim().length < 2) {
    errors.firstName = 'Ingresá tu nombre (mínimo 2 caracteres).';
  }

  if (!input.lastName || input.lastName.trim().length < 2) {
    errors.lastName = 'Ingresá tu apellido (mínimo 2 caracteres).';
  }

  const digitsOnly = (input.whatsappNumber || '').replace(/\D/g, '');
  if (digitsOnly.length < 8 || digitsOnly.length > 15) {
    errors.whatsappNumber = 'Ingresá un número de WhatsApp válido (entre 8 y 15 dígitos).';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Computes real-time studio open/closed status based on studio hours.
 */
export function getStudioLiveStatus(
  now: Date,
  openHour = 11,
  closeHour = 21,
  openDays: number[] = [1, 2, 3, 4, 5, 6]
): {
  isOpen: boolean;
  headline: string;
  subline: string;
  availabilityLabel: string;
} {
  const day = now.getDay();
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const currentTotalMin = hour * 60 + minutes;

  const isWorkDay = openDays.includes(day);
  const openMin = openHour * 60;
  const closeMin = closeHour * 60;

  if (isWorkDay && currentTotalMin >= openMin && currentTotalMin < closeMin) {
    return {
      isOpen: true,
      headline: `Abierto ahora · Cierra hoy a las ${String(closeHour).padStart(2, '0')}:00`,
      subline: 'Atención en curso 1 a 1 · Gestión 100% online sin interrupciones telefónicas',
      availabilityLabel: 'Disponible hoy · Turnos en vivo actualizados',
    };
  }

  if (isWorkDay && currentTotalMin < openMin) {
    return {
      isOpen: false,
      headline: `Cerrado ahora · Abre hoy a las ${String(openHour).padStart(2, '0')}:00`,
      subline: 'Agenda online activa las 24 hs con confirmación inmediata por WhatsApp',
      availabilityLabel: `Disponible hoy · Apertura ${String(openHour).padStart(2, '0')}:00 hs`,
    };
  }

  return {
    isOpen: false,
    headline: `Agenda Online 24 hs · Apertura ${String(openHour).padStart(2, '0')}:00 hs`,
    subline: 'Reservá tu franja horaria en vivo para hoy o los próximos días',
    availabilityLabel: 'Turnos disponibles en tiempo real',
  };
}

export function buildAutomatedWhatsAppMessages(params: {
  clientFirstName: string;
  date: string;
  time: string;
  endTime: string;
  serviceNames: string[];
  reviewShortlink: string;
}) {
  const servicesList = params.serviceNames.join(' + ');
  const instantConfirmation = `Hola ${params.clientFirstName}, tu turno 1 a 1 en Rodrigo Cutsss quedó confirmado para el ${params.date} a las ${params.time} hs (${servicesList}). Dirección: Vuelta de Obligado 931, Venado Tuerto, Santa Fe. Recordá que contamos con 10 min de tolerancia.`;
  const reminder2HoursBefore = `Hola ${params.clientFirstName}, te recordamos que hoy a las ${params.time} hs te esperamos en Rodrigo Cutsss para tu ${servicesList}. Vuelta de Obligado 931, Venado Tuerto.`;
  const reviewRequest2HoursAfter = `¡Hola ${params.clientFirstName}! Gracias por pasar hoy por Rodrigo Cutsss. ¿Cómo quedó ese corte? Si tenés 20 segundos, me ayuda muchísimo tu opinión acá: ${params.reviewShortlink}`;

  return {
    instantConfirmation,
    reminder2HoursBefore,
    reviewRequest2HoursAfter,
  };
}

export function formatPriceARS(amount: number): string {
  return `$${amount.toLocaleString('es-AR')}`;
}

/**
 * Accepts either a full Instagram URL ("https://instagram.com/rodrigo.cutsss")
 * or a handle ("@rodrigo.cutsss" / "rodrigo.cutsss") and returns a valid URL and display handle.
 */
export function resolveInstagramInfo(input: string): { url: string; handle: string } {
  const trimmed = (input || '@rodrigo.cutsss').trim();
  if (/^https?:\/\//i.test(trimmed)) {
    const match = trimmed.match(/instagram\.com\/([^/?#]+)/i);
    const extracted = match && match[1] ? match[1].replace(/^@/, '') : 'rodrigo.cutsss';
    return {
      url: trimmed,
      handle: `@${extracted}`,
    };
  }
  const cleanHandle = trimmed.replace(/^@/, '').replace(/\/+$/, '') || 'rodrigo.cutsss';
  return {
    url: `https://instagram.com/${cleanHandle}`,
    handle: `@${cleanHandle}`,
  };
}

/**
 * Accepts either a full WhatsApp URL ("https://wa.me/5493462554421") or phone number
 * and returns a clean digits string, base URL, and display text.
 */
export function resolveWhatsAppInfo(
  phoneDisplayInput: string,
  whatsappRawInput?: string
): { url: string; digits: string; display: string } {
  const rawSource = (whatsappRawInput || phoneDisplayInput || '5493462554421').trim();
  const digits = rawSource.replace(/\D/g, '') || '5493462554421';
  const display =
    phoneDisplayInput && !/^https?:\/\//i.test(phoneDisplayInput.trim())
      ? phoneDisplayInput.trim()
      : `+${digits}`;
  return {
    url: `https://wa.me/${digits}`,
    digits,
    display,
  };
}

export function resolveTikTokInfo(input?: string): { url: string; handle: string } {
  const trimmed = (input || '@rodrigo.cutsss_vt').trim();
  if (/^https?:\/\//i.test(trimmed)) {
    const match = trimmed.match(/tiktok\.com\/@?([^/?#]+)/i);
    const extracted = match && match[1] ? match[1].replace(/^@/, '') : 'rodrigo.cutsss_vt';
    return {
      url: trimmed,
      handle: `@${extracted}`,
    };
  }
  const cleanHandle = trimmed.replace(/^@/, '').replace(/\/+$/, '') || 'rodrigo.cutsss_vt';
  return {
    url: `https://www.tiktok.com/@${cleanHandle}`,
    handle: `@${cleanHandle}`,
  };
}

export function resolveFacebookInfo(input?: string): { url: string; handle: string } {
  const trimmed = (input || 'rodrigocutsss.vt').trim();
  if (/^https?:\/\//i.test(trimmed)) {
    const match = trimmed.match(/facebook\.com\/([^/?#]+)/i);
    const extracted = match && match[1] ? match[1] : 'Rodrigo Cutsss';
    return {
      url: trimmed,
      handle: extracted,
    };
  }
  const cleanHandle = trimmed.replace(/^@/, '').replace(/\/+$/, '') || 'rodrigocutsss.vt';
  return {
    url: `https://www.facebook.com/${cleanHandle}`,
    handle: cleanHandle,
  };
}

export function resolveYouTubeInfo(input?: string): { url: string; handle: string } {
  const trimmed = (input || '@rodrigocutsss').trim();
  if (/^https?:\/\//i.test(trimmed)) {
    const match = trimmed.match(/youtube\.com\/@?([^/?#]+)/i);
    const extracted = match && match[1] ? match[1].replace(/^@/, '') : 'rodrigocutsss';
    return {
      url: trimmed,
      handle: `@${extracted}`,
    };
  }
  const cleanHandle = trimmed.replace(/^@/, '').replace(/\/+$/, '') || 'rodrigocutsss';
  return {
    url: `https://www.youtube.com/@${cleanHandle}`,
    handle: `@${cleanHandle}`,
  };
}
