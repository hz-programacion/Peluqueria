import { AppointmentRecord, StudioService } from '../data/studioData';

export const BUFFER_MINUTES = 10;

export interface BookingSummary {
  selectedServices: StudioService[];
  serviceMinutes: number;
  bufferMinutes: number;
  totalBlockMinutes: number;
  totalPrice: number;
  depositAmount: number;
}

export interface TimeSlot {
  time: string; // "HH:mm"
  available: boolean;
  reason?: string;
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

/**
 * Calculates cumulative service duration, mandatory 10-minute hygiene buffer,
 * total block duration, total price, and 30% deposit amount.
 */
export function calculateBookingSummary(
  selectedServiceIds: string[],
  catalog: StudioService[]
): BookingSummary {
  const selectedServices = catalog.filter((s) => selectedServiceIds.includes(s.id));
  const serviceMinutes = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
  const bufferMinutes = selectedServices.length > 0 ? BUFFER_MINUTES : 0;
  const totalBlockMinutes = serviceMinutes + bufferMinutes;
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const depositAmount = Math.round(totalPrice * 0.3);

  return {
    selectedServices,
    serviceMinutes,
    bufferMinutes,
    totalBlockMinutes,
    totalPrice,
    depositAmount,
  };
}

export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
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
  openHour = 10,
  closeHour = 20,
  blockedSlots: BlockedTimeSlotDef[] = []
): TimeSlot[] {
  const openMin = openHour * 60;
  const closeMin = closeHour * 60;
  const dayAppointments = appointments.filter((app) => app.date === dateStr);
  const dayBlocked = blockedSlots.filter((b) => b.date === dateStr);
  const slots: TimeSlot[] = [];

  const effectiveDuration = requiredBlockMinutes > 0 ? requiredBlockMinutes : 55;

  for (let startMin = openMin; startMin + effectiveDuration <= closeMin; startMin += 30) {
    const endMin = startMin + effectiveDuration;
    let conflictReason: string | undefined;

    // Check against appointments
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
          conflictReason = block.reason ? `Bloqueado: ${block.reason}` : 'Horario bloqueado por el estudio';
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
 * Computes real-time studio open/closed status based on Buenos Aires studio hours:
 * Tuesday (2) through Saturday (6), 10:00 to 20:00.
 */
export function getStudioLiveStatus(now: Date): {
  isOpen: boolean;
  headline: string;
  subline: string;
  availabilityLabel: string;
} {
  const day = now.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue ... 6 = Sat
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const currentTotalMin = hour * 60 + minutes;

  const isWorkDay = day >= 2 && day <= 6;
  const openMin = 10 * 60;
  const closeMin = 20 * 60;

  if (isWorkDay && currentTotalMin >= openMin && currentTotalMin < closeMin) {
    return {
      isOpen: true,
      headline: 'Abierto ahora · Cierra hoy a las 20:00',
      subline: 'Atención en curso 1 a 1 · Gestión 100% online sin interrupciones telefónicas',
      availabilityLabel: 'Disponible hoy · Últimos 2 bloques libres',
    };
  }

  if (isWorkDay && currentTotalMin < openMin) {
    return {
      isOpen: false,
      headline: 'Cerrado ahora · Abre hoy a las 10:00',
      subline: 'Agenda online activa las 24 hs con confirmación inmediata por WhatsApp',
      availabilityLabel: 'Disponible hoy · Apertura 10:00 hs',
    };
  }

  if (day === 0 || day === 1) {
    return {
      isOpen: false,
      headline: 'Cerrado ahora · Abre el martes a las 10:00',
      subline: 'Domingos y lunes dedicados a descanso y curaduría del estudio',
      availabilityLabel: 'Últimos cupos esta semana · Mar a Sáb',
    };
  }

  return {
    isOpen: false,
    headline: day === 6 ? 'Cerrado ahora · Abre el martes a las 10:00' : 'Cerrado ahora · Abre mañana a las 10:00',
    subline: 'Reserva directa habilitada para asegurar tu próxima franja exclusiva',
    availabilityLabel: 'Últimos cupos esta semana',
  };
}

/**
 * Generates the automated WhatsApp confirmation and 2-hour post-visit Google Review loop payload.
 */
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
