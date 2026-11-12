/**
 * TypeScript interfaces for Rodrigo Cutsss Appointments
 * Includes customer information, service types, selected time slot, and booking status.
 */

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type AppointmentPaymentOption = 'deposit' | 'full' | 'studio' | 'commitment';

export interface AppointmentCustomerInfo {
  name: string;
  whatsapp: string;
  email?: string;
  notes?: string;
}

export interface AppointmentServiceType {
  id: string;
  name: string;
  category?: string;
  durationMinutes: number;
  price: number;
}

export interface AppointmentTimeSlot {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string; // HH:mm
  serviceMinutes: number;
  bufferMinutes: number;
}

export interface Appointment {
  id: string;
  // Flat fields used by the booking & calendar engine
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  serviceMinutes: number;
  bufferMinutes: number;
  clientName: string;
  whatsapp: string;
  serviceNames: string[];
  paymentOption: AppointmentPaymentOption;
  status: AppointmentStatus;
  reviewLoopScheduledAt: string;
  // Structured fields for rich customer, service, and slot metadata
  customer?: AppointmentCustomerInfo;
  services?: AppointmentServiceType[];
  timeSlot?: AppointmentTimeSlot;
  totalPrice?: number;
  depositAmount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAppointmentInput {
  id?: string;
  date?: string;
  startTime?: string;
  serviceMinutes?: number;
  bufferMinutes?: number;
  clientName?: string;
  whatsapp?: string;
  serviceNames?: string[];
  paymentOption?: AppointmentPaymentOption;
  status?: AppointmentStatus;
  reviewLoopScheduledAt?: string;
  customer?: AppointmentCustomerInfo;
  services?: AppointmentServiceType[];
  timeSlot?: AppointmentTimeSlot;
  totalPrice?: number;
  depositAmount?: number;
}

export interface UpdateAppointmentInput {
  date?: string;
  startTime?: string;
  serviceMinutes?: number;
  bufferMinutes?: number;
  clientName?: string;
  whatsapp?: string;
  serviceNames?: string[];
  paymentOption?: AppointmentPaymentOption;
  status?: AppointmentStatus;
  reviewLoopScheduledAt?: string;
  totalPrice?: number;
  depositAmount?: number;
}

/**
 * Normalizes an Appointment or legacy AppointmentRecord into a complete Appointment object
 * containing both flat fields and structured customer/timeSlot metadata.
 */
export function normalizeAppointmentRecord(input: CreateAppointmentInput & { id: string }): Appointment {
  const status: AppointmentStatus =
    input.status === 'pending' ||
    input.status === 'confirmed' ||
    input.status === 'completed' ||
    input.status === 'cancelled'
      ? input.status
      : 'confirmed';

  const paymentOption: AppointmentPaymentOption =
    input.paymentOption === 'deposit' ||
    input.paymentOption === 'full' ||
    input.paymentOption === 'studio' ||
    input.paymentOption === 'commitment'
      ? input.paymentOption
      : 'deposit';

  const serviceMinutes = Math.min(
    360,
    Math.max(10, Number(input.timeSlot?.serviceMinutes ?? input.serviceMinutes) || 45)
  );
  const bufferMinutes = Math.min(
    60,
    Math.max(0, Number(input.timeSlot?.bufferMinutes ?? input.bufferMinutes ?? 10))
  );
  const clientName = String(input.customer?.name || input.clientName || 'Cliente').trim().slice(0, 80);
  const whatsapp = String(input.customer?.whatsapp || input.whatsapp || '').trim().slice(0, 32);
  const date = String(input.timeSlot?.date || input.date || '').slice(0, 10);
  const startTime = String(input.timeSlot?.startTime || input.startTime || '').slice(0, 5);
  const serviceNames = (
    input.serviceNames && input.serviceNames.length > 0
      ? input.serviceNames
      : input.services?.map((s) => s.name) || ['Corte de Autor / Clásico']
  )
    .slice(0, 6)
    .map((s) => String(s).slice(0, 120));

  return {
    id: input.id,
    date,
    startTime,
    serviceMinutes,
    bufferMinutes,
    clientName,
    whatsapp,
    serviceNames,
    paymentOption,
    status,
    reviewLoopScheduledAt: String(input.reviewLoopScheduledAt || '19:00').slice(0, 32),
    customer: {
      name: clientName,
      whatsapp,
      ...(input.customer?.email ? { email: input.customer.email } : {}),
      ...(input.customer?.notes ? { notes: input.customer.notes } : {}),
    },
    timeSlot: {
      date,
      startTime,
      serviceMinutes,
      bufferMinutes,
      ...(input.timeSlot?.endTime ? { endTime: input.timeSlot.endTime } : {}),
    },
    ...(input.services ? { services: input.services } : {}),
    ...(typeof input.totalPrice === 'number' ? { totalPrice: input.totalPrice } : {}),
    ...(typeof input.depositAmount === 'number' ? { depositAmount: input.depositAmount } : {}),
  };
}
