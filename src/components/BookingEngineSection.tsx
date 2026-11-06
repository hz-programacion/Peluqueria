import React, { useState } from 'react';
import { Check, Calendar, Clock, ShieldAlert, CheckCircle2, ArrowRight, RotateCcw } from 'lucide-react';
import { AppointmentRecord, STUDIO_INFO, StudioService } from '../data/studioData';
import {
  calculateBookingSummary,
  getAvailableTimeSlots,
  validateBookingForm,
  formatPriceARS,
  minutesToTime,
  timeToMinutes,
  buildAutomatedWhatsAppMessages,
} from '../utils/bookingEngine';

interface BookingEngineSectionProps {
  services: StudioService[];
  selectedServiceIds: string[];
  onToggleService: (serviceId: string) => void;
  appointments: AppointmentRecord[];
  onConfirmAppointment: (newAppointment: AppointmentRecord) => void;
}

const AVAILABLE_DATES = [
  { date: '2026-11-05', label: 'Jue 05 Nov', dayName: 'Hoy' },
  { date: '2026-11-06', label: 'Vie 06 Nov', dayName: 'Mañana' },
  { date: '2026-11-07', label: 'Sáb 07 Nov', dayName: 'Sábado' },
  { date: '2026-11-10', label: 'Mar 10 Nov', dayName: 'Martes' },
  { date: '2026-11-11', label: 'Mié 11 Nov', dayName: 'Miércoles' },
  { date: '2026-11-12', label: 'Jue 12 Nov', dayName: 'Jueves' },
];

const COUNTRY_CODES = [
  { code: '+54', label: '+54 (AR)' },
  { code: '+598', label: '+598 (UY)' },
  { code: '+56', label: '+56 (CL)' },
  { code: '+55', label: '+55 (BR)' },
  { code: '+34', label: '+34 (ES)' },
  { code: '+1', label: '+1 (US)' },
];

export const BookingEngineSection: React.FC<BookingEngineSectionProps> = ({
  services,
  selectedServiceIds,
  onToggleService,
  appointments,
  onConfirmAppointment,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-06');
  const [selectedTime, setSelectedTime] = useState<string>('14:00');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('+54');
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');
  const [paymentOption, setPaymentOption] = useState<'deposit' | 'commitment'>('commitment');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmedReceipt, setConfirmedReceipt] = useState<AppointmentRecord | null>(null);

  const summary = calculateBookingSummary(selectedServiceIds, services);
  const timeSlots = getAvailableTimeSlots(
    selectedDate,
    summary.totalBlockMinutes,
    appointments
  );

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    const updatedSlots = getAvailableTimeSlots(
      newDate,
      summary.totalBlockMinutes,
      appointments
    );
    const firstAvailable = updatedSlots.find((s) => s.available);
    setSelectedTime(firstAvailable ? firstAvailable.time : '');
    setErrors((prev) => ({ ...prev, date: '', time: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateBookingForm({
      selectedServiceIds,
      date: selectedDate,
      time: selectedTime,
      firstName,
      lastName,
      countryCode,
      whatsappNumber,
      paymentOption,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    // Verify selected slot is still available for the accumulated duration
    const chosenSlot = timeSlots.find((s) => s.time === selectedTime);
    if (!chosenSlot || !chosenSlot.available) {
      setErrors({
        time: 'La franja seleccionada no dispone de tiempo continuo suficiente. Elegí otro horario.',
      });
      return;
    }

    const startMin = timeToMinutes(selectedTime);
    const endMin = startMin + summary.totalBlockMinutes;
    const reviewMin = endMin + 120; // 2 hours after completion

    const newRecord: AppointmentRecord = {
      id: `turn-${Date.now()}`,
      date: selectedDate,
      startTime: selectedTime,
      serviceMinutes: summary.serviceMinutes,
      bufferMinutes: summary.bufferMinutes,
      clientName: `${firstName.trim()} ${lastName.trim()}`,
      whatsapp: `${countryCode} ${whatsappNumber.trim()}`,
      serviceNames: summary.selectedServices.map((s) => s.name),
      paymentOption,
      status: 'confirmed',
      reviewLoopScheduledAt: minutesToTime(reviewMin),
    };

    setErrors({});
    onConfirmAppointment(newRecord);
    setConfirmedReceipt(newRecord);
  };

  const handleResetNewBooking = () => {
    setConfirmedReceipt(null);
    setFirstName('');
    setLastName('');
    setWhatsappNumber('');
    setErrors({});
  };

  return (
    <section
      id="reservas"
      className="py-20 md:py-28 border-b border-stone-300/70 dark:border-white/[0.08] bg-stone-200/35 dark:bg-[#111113]"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <p className="font-mono-tech text-xs uppercase tracking-widest text-[#9A7B4F] dark:text-[#C5A880] mb-3">
              05. Motor de Reserva Directo · Agenda en Tiempo Real
            </p>
            <h2 className="font-editorial text-3xl md:text-5xl font-normal leading-[1.12] text-[#141415] dark:text-[#F4F4F6]">
              Reservá tu bloque privado en tres pasos.
            </h2>
          </div>

          <div className="font-mono-tech text-xs text-stone-600 dark:text-[#8E8E93] space-y-1">
            <p>CÁLCULO AUTOMÁTICO DE BLOQUE CONTINUO</p>
            <p className="text-[#9A7B4F] dark:text-[#C5A880]">
              Incluye +10 min de sanitización y preparación entre clientes
            </p>
          </div>
        </div>

        {confirmedReceipt ? (
          /* Confirmed Appointment Ticket & Automated WhatsApp Loop Receipt */
          <div
            data-testid="booking-confirmation-receipt"
            className="p-8 md:p-10 rounded-sm border border-[#9A7B4F] dark:border-[#C5A880] bg-white dark:bg-[#161618]"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-stone-300 dark:border-white/[0.08]">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#9A7B4F] dark:text-[#C5A880]" />
                <div>
                  <p className="font-mono-tech text-xs uppercase text-[#9A7B4F] dark:text-[#C5A880]">
                    TURNO CONFIRMADO Y BLOQUEADO EN AGENDA
                  </p>
                  <h3 className="font-editorial text-3xl text-[#141415] dark:text-[#F4F4F6]">
                    Te esperamos, {confirmedReceipt.clientName}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetNewBooking}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-mono-tech border border-stone-300 dark:border-white/[0.15] rounded-sm hover:border-[#C5A880] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Agendar otro turno</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-6 space-y-4 text-sm">
                <div className="p-5 rounded-sm border border-stone-200 dark:border-white/[0.08] bg-stone-100/60 dark:bg-[#0C0C0D] font-mono-tech space-y-2">
                  <p className="text-xs text-stone-500 dark:text-[#8E8E93]">DETALLE DE LA SESIÓN 1 A 1</p>
                  <p className="text-base text-[#141415] dark:text-[#F4F4F6]">
                    Fecha: {confirmedReceipt.date} · Inicio: {confirmedReceipt.startTime} hs
                  </p>
                  <p className="text-xs text-[#9A7B4F] dark:text-[#C5A880]">
                    Duración técnica: {confirmedReceipt.serviceMinutes} min + {confirmedReceipt.bufferMinutes} min buffer sanitización
                  </p>
                  <p className="text-xs text-stone-600 dark:text-[#8E8E93]">
                    Servicios: {confirmedReceipt.serviceNames.join(' + ')}
                  </p>
                  <p className="text-xs text-stone-600 dark:text-[#8E8E93]">
                    Modalidad: {confirmedReceipt.paymentOption === 'deposit' ? 'Seña previa 30% acreditada' : 'Compromiso de asistencia directa'}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-3 text-xs font-mono-tech">
                <p className="uppercase text-[#9A7B4F] dark:text-[#C5A880]">
                  WEBHOOK WHATSAPP BUSINESS · SECUENCIA PROGRAMADA
                </p>
                <div className="p-4 rounded-sm border border-stone-200 dark:border-white/[0.08] bg-stone-100/60 dark:bg-[#0C0C0D]">
                  <p className="text-stone-500 dark:text-[#8E8E93] mb-1">
                    [ENVIADO AHORA A {confirmedReceipt.whatsapp}]
                  </p>
                  <p className="text-[#141415] dark:text-[#F4F4F6] leading-relaxed">
                    {
                      buildAutomatedWhatsAppMessages({
                        clientFirstName: confirmedReceipt.clientName.split(' ')[0],
                        date: confirmedReceipt.date,
                        time: confirmedReceipt.startTime,
                        endTime: confirmedReceipt.reviewLoopScheduledAt,
                        serviceNames: confirmedReceipt.serviceNames,
                        reviewShortlink: STUDIO_INFO.googleReviewShortlink,
                      }).instantConfirmation
                    }
                  </p>
                </div>
                <div className="p-4 rounded-sm border border-stone-200 dark:border-white/[0.08] bg-stone-100/60 dark:bg-[#0C0C0D]">
                  <p className="text-stone-500 dark:text-[#8E8E93] mb-1">
                    [PROGRAMADO {confirmedReceipt.reviewLoopScheduledAt} HS · +2 HS POST-TURNO]
                  </p>
                  <p className="text-[#9A7B4F] dark:text-[#C5A880] leading-relaxed">
                    {
                      buildAutomatedWhatsAppMessages({
                        clientFirstName: confirmedReceipt.clientName.split(' ')[0],
                        date: confirmedReceipt.date,
                        time: confirmedReceipt.startTime,
                        endTime: confirmedReceipt.reviewLoopScheduledAt,
                        serviceNames: confirmedReceipt.serviceNames,
                        reviewShortlink: STUDIO_INFO.googleReviewShortlink,
                      }).reviewRequest2HoursAfter
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 7 Columns: Step 1 (Services) & Step 2 (Date & Time Slots) */}
            <div className="lg:col-span-7 space-y-8">
              {/* STEP 1: Service Selection */}
              <div className="p-6 md:p-8 rounded-sm border border-stone-300 dark:border-white/[0.08] bg-white dark:bg-[#161618]">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <h3 className="font-editorial text-2xl text-[#141415] dark:text-[#F4F4F6]">
                    Paso 1. Seleccioná uno o más servicios
                  </h3>
                  <span className="font-mono-tech text-xs text-[#9A7B4F] dark:text-[#C5A880]">
                    {summary.serviceMinutes} min + {summary.bufferMinutes} min limpieza
                  </span>
                </div>

                {errors.services && (
                  <p
                    role="alert"
                    className="mb-4 text-xs font-mono-tech text-red-600 dark:text-red-400 flex items-center gap-1.5"
                  >
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{errors.services}</span>
                  </p>
                )}

                <div className="space-y-3">
                  {services.map((srv) => {
                    const isSelected = selectedServiceIds.includes(srv.id);
                    return (
                      <button
                        key={srv.id}
                        type="button"
                        onClick={() => {
                          onToggleService(srv.id);
                          setErrors((prev) => ({ ...prev, services: '' }));
                        }}
                        aria-pressed={isSelected}
                        className={`w-full p-4 rounded-sm border text-left transition-colors flex items-center justify-between gap-4 cursor-pointer ${
                          isSelected
                            ? 'border-[#9A7B4F] dark:border-[#C5A880] bg-stone-100 dark:bg-[#1E1E22]'
                            : 'border-stone-300/80 dark:border-white/[0.08] hover:border-stone-400 dark:hover:border-white/[0.2]'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <span
                            className={`w-5 h-5 rounded-xs flex items-center justify-center border ${
                              isSelected
                                ? 'bg-[#9A7B4F] dark:bg-[#C5A880] border-[#9A7B4F] dark:border-[#C5A880] text-[#0C0C0D]'
                                : 'border-stone-400 dark:border-white/25'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-[#141415] dark:text-[#F4F4F6]">
                              {srv.index}. {srv.name}
                            </p>
                            <p className="text-xs font-mono-tech text-stone-500 dark:text-[#8E8E93]">
                              {srv.category} · {srv.durationMinutes} min
                            </p>
                          </div>
                        </div>

                        <span className="font-mono-tech text-sm font-medium text-[#141415] dark:text-[#F4F4F6] shrink-0">
                          {formatPriceARS(srv.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: Interactive Date & Continuous Slot Picker (48px Touch Targets) */}
              <div className="p-6 md:p-8 rounded-sm border border-stone-300 dark:border-white/[0.08] bg-white dark:bg-[#161618]">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <h3 className="font-editorial text-2xl text-[#141415] dark:text-[#F4F4F6]">
                    Paso 2. Fecha y franja horaria continua
                  </h3>
                  <span className="font-mono-tech text-xs text-stone-500 dark:text-[#8E8E93]">
                    Bloque requerido: {summary.totalBlockMinutes || 55} min
                  </span>
                </div>

                {/* Date Picker Grid */}
                <label className="block font-mono-tech text-xs uppercase text-stone-500 dark:text-[#8E8E93] mb-2.5">
                  <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
                  Seleccionar Día Operativo (Mar a Sáb)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
                  {AVAILABLE_DATES.map((d) => {
                    const active = selectedDate === d.date;
                    return (
                      <button
                        key={d.date}
                        type="button"
                        onClick={() => handleDateChange(d.date)}
                        aria-pressed={active}
                        className={`min-h-[48px] px-3 py-2.5 rounded-sm border font-mono-tech text-xs transition-colors flex flex-col items-start justify-center cursor-pointer ${
                          active
                            ? 'border-[#9A7B4F] dark:border-[#C5A880] bg-[#141415] text-[#F4F4F6] dark:bg-[#C5A880] dark:text-[#0C0C0D]'
                            : 'border-stone-300 dark:border-white/[0.1] text-[#141415] dark:text-[#F4F4F6] hover:border-[#C5A880]'
                        }`}
                      >
                        <span className="font-semibold">{d.label}</span>
                        <span className="text-[11px] opacity-75">{d.dayName}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Time Slots Grid (48px Touch Targets) */}
                <label className="block font-mono-tech text-xs uppercase text-stone-500 dark:text-[#8E8E93] mb-2.5">
                  <Clock className="w-3.5 h-3.5 inline mr-1.5" />
                  Horarios con Hueco Continuo Disponible
                </label>

                {errors.time && (
                  <p
                    role="alert"
                    className="mb-3 text-xs font-mono-tech text-red-600 dark:text-red-400"
                  >
                    {errors.time}
                  </p>
                )}

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {timeSlots.map((slot) => {
                    const isSelected = selectedTime === slot.time && slot.available;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => {
                          setSelectedTime(slot.time);
                          setErrors((prev) => ({ ...prev, time: '' }));
                        }}
                        title={slot.reason || `Disponible a las ${slot.time}`}
                        className={`min-h-[48px] px-3 py-2 rounded-sm border font-mono-tech text-xs transition-colors flex flex-col items-center justify-center ${
                          !slot.available
                            ? 'border-stone-200 dark:border-white/[0.04] bg-stone-100 dark:bg-[#0C0C0D]/50 text-stone-400 dark:text-stone-600 line-through cursor-not-allowed'
                            : isSelected
                            ? 'border-[#9A7B4F] dark:border-[#C5A880] bg-[#141415] text-[#F4F4F6] dark:bg-[#C5A880] dark:text-[#0C0C0D] font-semibold cursor-pointer'
                            : 'border-stone-300 dark:border-white/[0.12] text-[#141415] dark:text-[#F4F4F6] hover:border-[#C5A880] cursor-pointer'
                        }`}
                      >
                        <span>{slot.time} hs</span>
                        {!slot.available && (
                          <span className="text-[10px] no-underline">Ocupado</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Step 3 (Client Details, Deposit/Commitment, Summary & Submit) */}
            <div className="lg:col-span-5">
              <div className="p-6 md:p-8 rounded-sm border border-stone-300 dark:border-white/[0.08] bg-white dark:bg-[#161618] flex flex-col justify-between h-full">
                <div>
                  <h3 className="font-editorial text-2xl text-[#141415] dark:text-[#F4F4F6] mb-6">
                    Paso 3. Datos del cliente y confirmación
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="booking-first-name"
                          className="block font-mono-tech text-xs uppercase text-stone-600 dark:text-[#8E8E93] mb-1.5"
                        >
                          Nombre *
                        </label>
                        <input
                          id="booking-first-name"
                          type="text"
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value);
                            setErrors((prev) => ({ ...prev, firstName: '' }));
                          }}
                          placeholder="Ej. Julián"
                          className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-sm border border-stone-300 dark:border-white/[0.15] bg-transparent text-[#141415] dark:text-[#F4F4F6] focus:border-[#C5A880] focus:outline-none"
                        />
                        {errors.firstName && (
                          <p role="alert" className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {errors.firstName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="booking-last-name"
                          className="block font-mono-tech text-xs uppercase text-stone-600 dark:text-[#8E8E93] mb-1.5"
                        >
                          Apellido *
                        </label>
                        <input
                          id="booking-last-name"
                          type="text"
                          value={lastName}
                          onChange={(e) => {
                            setLastName(e.target.value);
                            setErrors((prev) => ({ ...prev, lastName: '' }));
                          }}
                          placeholder="Ej. Álvarez"
                          className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-sm border border-stone-300 dark:border-white/[0.15] bg-transparent text-[#141415] dark:text-[#F4F4F6] focus:border-[#C5A880] focus:outline-none"
                        />
                        {errors.lastName && (
                          <p role="alert" className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {errors.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* WhatsApp with Country Code Selector */}
                    <div>
                      <label
                        htmlFor="booking-whatsapp"
                        className="block font-mono-tech text-xs uppercase text-stone-600 dark:text-[#8E8E93] mb-1.5"
                      >
                        WhatsApp para confirmación y recordatorio automático *
                      </label>
                      <div className="flex gap-2">
                        <select
                          aria-label="Código de país de WhatsApp"
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="min-h-[44px] px-3 py-2.5 text-xs font-mono-tech rounded-sm border border-stone-300 dark:border-white/[0.15] bg-[#F7F5F0] dark:bg-[#0C0C0D] text-[#141415] dark:text-[#F4F4F6]"
                        >
                          {COUNTRY_CODES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                        <input
                          id="booking-whatsapp"
                          type="tel"
                          value={whatsappNumber}
                          onChange={(e) => {
                            setWhatsappNumber(e.target.value);
                            setErrors((prev) => ({ ...prev, whatsappNumber: '' }));
                          }}
                          placeholder="11 5842 9104"
                          className="flex-1 min-h-[44px] px-3.5 py-2.5 text-sm font-mono-tech rounded-sm border border-stone-300 dark:border-white/[0.15] bg-transparent text-[#141415] dark:text-[#F4F4F6] focus:border-[#C5A880] focus:outline-none"
                        />
                      </div>
                      {errors.whatsappNumber && (
                        <p role="alert" className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {errors.whatsappNumber}
                        </p>
                      )}
                    </div>

                    {/* Reservation Modality Selector */}
                    <div className="pt-2">
                      <span className="block font-mono-tech text-xs uppercase text-stone-600 dark:text-[#8E8E93] mb-2">
                        Modalidad de Garantía de Turno
                      </span>
                      <div className="grid grid-cols-1 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setPaymentOption('commitment')}
                          aria-pressed={paymentOption === 'commitment'}
                          className={`p-3.5 rounded-sm border text-left transition-colors cursor-pointer ${
                            paymentOption === 'commitment'
                              ? 'border-[#9A7B4F] dark:border-[#C5A880] bg-stone-100 dark:bg-[#1E1E22]'
                              : 'border-stone-300 dark:border-white/[0.1]'
                          }`}
                        >
                          <p className="text-xs font-semibold text-[#141415] dark:text-[#F4F4F6]">
                            Confirmación Directa · Compromiso de Asistencia
                          </p>
                          <p className="text-xs text-stone-500 dark:text-[#8E8E93] mt-0.5">
                            Abonás el total ({formatPriceARS(summary.totalPrice)}) en el estudio. Cancelación sin cargo hasta 24 hs antes.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentOption('deposit')}
                          aria-pressed={paymentOption === 'deposit'}
                          className={`p-3.5 rounded-sm border text-left transition-colors cursor-pointer ${
                            paymentOption === 'deposit'
                              ? 'border-[#9A7B4F] dark:border-[#C5A880] bg-stone-100 dark:bg-[#1E1E22]'
                              : 'border-stone-300 dark:border-white/[0.1]'
                          }`}
                        >
                          <p className="text-xs font-semibold text-[#141415] dark:text-[#F4F4F6]">
                            Pago de Seña Previa (30% · {formatPriceARS(summary.depositAmount)})
                          </p>
                          <p className="text-xs text-stone-500 dark:text-[#8E8E93] mt-0.5">
                            Congela el valor del servicio y deja el saldo restante para el día del turno.
                          </p>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Summary Breakdown & Submit Button */}
                <div className="pt-6 mt-8 border-t border-stone-300 dark:border-white/[0.08]">
                  <div className="space-y-2 font-mono-tech text-xs mb-5">
                    <div className="flex justify-between text-stone-600 dark:text-[#8E8E93]">
                      <span>Servicios ({summary.selectedServices.length}):</span>
                      <span>{summary.serviceMinutes} min</span>
                    </div>
                    <div className="flex justify-between text-stone-600 dark:text-[#8E8E93]">
                      <span>Buffer sanitización 1 a 1:</span>
                      <span>+{summary.bufferMinutes} min</span>
                    </div>
                    <div className="flex justify-between text-stone-600 dark:text-[#8E8E93]">
                      <span>Fecha y franja:</span>
                      <span>
                        {selectedDate} · {selectedTime || '--:--'} hs
                      </span>
                    </div>
                    <div className="pt-2 border-t border-stone-200 dark:border-white/[0.08] flex justify-between text-sm font-semibold text-[#141415] dark:text-[#F4F4F6]">
                      <span>Total Estimado ({summary.totalBlockMinutes} min bloque):</span>
                      <span className="text-[#9A7B4F] dark:text-[#C5A880]">
                        {formatPriceARS(summary.totalPrice)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider bg-[#141415] text-[#F4F4F6] dark:bg-[#C5A880] dark:text-[#0C0C0D] hover:opacity-90 transition-opacity rounded-sm cursor-pointer"
                  >
                    <span>Confirmar Turno en Agenda</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
