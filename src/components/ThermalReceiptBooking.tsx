import React, { useState, useEffect } from 'react';
import { useStudio } from '../context/StudioContext';
import {
  calculateBookingSummary,
  getAvailableTimeSlots,
  formatPriceARS,
  getTodayLocalISO,
  getOffsetDateISO,
  resolveWhatsAppInfo,
} from '../utils/bookingEngine';
import {
  Scissors,
  MessageCircle,
  Barcode,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  MapPin,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';

export const ThermalReceiptBooking: React.FC = () => {
  const {
    services,
    selectedServiceIds,
    toggleSelectService,
    appointments,
    blockedSlots,
    addAppointment,
    cancelAppointment,
    config,
  } = useStudio();

  const todayISO = getTodayLocalISO();
  const tomorrowISO = getOffsetDateISO(1);
  const dayAfterISO = getOffsetDateISO(2);

  // Default date is strictly TODAY in local time
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayLocalISO());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [paymentOption, setPaymentOption] = useState<'deposit' | 'commitment'>('deposit');
  const [hasConfirmed, setHasConfirmed] = useState<boolean>(false);
  const [confirmedTicket, setConfirmedTicket] = useState<{
    id: string;
    clientName: string;
    whatsapp: string;
    services: string[];
    date: string;
    time: string;
    totalPrice: number;
    depositAmount: number;
    totalMinutes: number;
    paymentOption: 'deposit' | 'commitment';
    waMessage: string;
  } | null>(null);

  const visibleServices = services.filter((s) => !s.hidden);
  const waInfo = resolveWhatsAppInfo(config.phoneDisplay, config.whatsappRaw);

  // Summary calculation with dynamic buffer and deposit percentage
  const summary = calculateBookingSummary(
    selectedServiceIds,
    visibleServices,
    config.cleanBufferMinutes,
    config.depositPercentage
  );

  // Available Slots for date recalculated dynamically whenever appointments/blocks/services change
  const availableSlots = getAvailableTimeSlots(
    selectedDate,
    summary.totalBlockMinutes,
    appointments,
    config.openingHour,
    config.closingHour,
    blockedSlots,
    config.openDays
  );

  const freeSlotsCount = availableSlots.filter((s) => s.available).length;
  const busySlotsCount = availableSlots.length - freeSlotsCount;

  // Automatically clear selectedTime if that slot was just booked/blocked or no longer fits
  useEffect(() => {
    if (!selectedTime) return;
    const stillAvailable = availableSlots.some((s) => s.time === selectedTime && s.available);
    if (!stillAvailable) {
      setSelectedTime('');
    }
  }, [availableSlots, selectedTime]);

  // Form Validation
  const isFormValid =
    summary.selectedServices.length > 0 &&
    selectedDate.trim() !== '' &&
    selectedTime.trim() !== '' &&
    clientName.trim().length >= 2 &&
    whatsapp.replace(/\D/g, '').length >= 8;

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const ticketId = `TK-${Math.floor(100000 + Math.random() * 900000)}`;

    addAppointment({
      id: ticketId,
      date: selectedDate,
      startTime: selectedTime,
      serviceMinutes: summary.serviceMinutes,
      bufferMinutes: summary.bufferMinutes,
      clientName: clientName.trim(),
      whatsapp: whatsapp.trim(),
      serviceNames: summary.selectedServices.map((s) => s.name),
      paymentOption,
      status: 'confirmed',
      reviewLoopScheduledAt: `${selectedDate} ${selectedTime}`,
    });

    const serviceListText = summary.selectedServices.map((s) => `• ${s.name}`).join('\n');
    const waText = encodeURIComponent(
      `Hola ${config.authorName}! Acabo de reservar mi turno en la web de ${config.studioTitle}:\n\n` +
        `Ticket: #${ticketId}\n` +
        `Cliente: ${clientName.trim()}\n` +
        `Fecha: ${selectedDate}\n` +
        `Horario: ${selectedTime} hs\n` +
        `Servicios:\n${serviceListText}\n\n` +
        `Total: ${formatPriceARS(summary.totalPrice)}\n` +
        `Modalidad: ${
          paymentOption === 'deposit'
            ? `Seña del ${config.depositPercentage}% (${formatPriceARS(summary.depositAmount)}) a alias ${config.transferAlias}`
            : 'Compromiso de asistencia (abono en el estudio)'
        }\n\n` +
        `Nos vemos en ${config.address}, ${config.neighborhood}!`
    );

    setConfirmedTicket({
      id: ticketId,
      clientName: clientName.trim(),
      whatsapp: whatsapp.trim(),
      services: summary.selectedServices.map((s) => s.name),
      date: selectedDate,
      time: selectedTime,
      totalPrice: summary.totalPrice,
      depositAmount: summary.depositAmount,
      totalMinutes: summary.serviceMinutes,
      paymentOption,
      waMessage: `${waInfo.url}?text=${waText}`,
    });

    setHasConfirmed(true);
  };

  if (hasConfirmed && confirmedTicket) {
    return (
      <div className="py-6 px-4 max-w-xl mx-auto">
        <div className="bg-[#FAF8F5] text-zinc-950 p-6 sm:p-8 rounded-2xl shadow-2xl font-mono text-xs border border-zinc-300 relative overflow-hidden">
          <div className="text-center pb-4 mb-4 border-b border-dashed border-zinc-400">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[11px] mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Turno Reservado y Bloqueado en Agenda</span>
            </div>
            <div className="flex justify-center items-center gap-1 mb-1">
              <Barcode className="w-48 h-10 text-zinc-800" />
            </div>
            <p className="text-[10px] font-bold tracking-widest text-zinc-600">
              * {confirmedTicket.id} *
            </p>
            <h2 className="font-display font-black text-xl uppercase tracking-tight text-zinc-900 mt-2">
              {config.studioTitle}
            </h2>
            <p className="text-[11px] text-zinc-700 font-bold">
              {config.address} · {config.neighborhood}
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-zinc-600 font-semibold">FECHA TURNO:</span>
              <span className="font-bold text-zinc-900 tabular-nums">{confirmedTicket.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 font-semibold">HORARIO EXACTO:</span>
              <span className="font-bold text-zinc-900 text-sm bg-zinc-200 px-2 py-0.5 rounded tabular-nums">
                {confirmedTicket.time} HS
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 font-semibold">CLIENTE:</span>
              <span className="font-bold text-zinc-900 uppercase">{confirmedTicket.clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 font-semibold">WHATSAPP:</span>
              <span className="text-zinc-900 font-bold tabular-nums">{confirmedTicket.whatsapp}</span>
            </div>

            <div className="pt-3 border-t border-dashed border-zinc-400">
              <span className="text-zinc-600 font-semibold block mb-1">SERVICIOS SELECCIONADOS:</span>
              {confirmedTicket.services.map((srv, idx) => (
                <div key={idx} className="flex justify-between font-bold text-zinc-900 py-0.5">
                  <span>{srv}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-zinc-900 flex justify-between items-baseline text-sm">
              <span className="font-black text-zinc-900">TOTAL ARS:</span>
              <span className="font-black text-base text-zinc-950 tabular-nums">
                {formatPriceARS(confirmedTicket.totalPrice)}
              </span>
            </div>

            <div className="text-[11px] text-zinc-800 bg-zinc-100 p-3.5 rounded-xl border border-zinc-300 leading-relaxed">
              {confirmedTicket.paymentOption === 'deposit' ? (
                <>
                  <span className="font-bold block text-zinc-950 mb-0.5">
                    MODALIDAD: SEÑA {config.depositPercentage}%
                  </span>
                  Alias para transferir:{' '}
                  <strong className="text-zinc-950">{config.transferAlias}</strong> · Monto:{' '}
                  <strong className="tabular-nums text-zinc-950">
                    {formatPriceARS(confirmedTicket.depositAmount)}
                  </strong>
                </>
              ) : (
                <>
                  <span className="font-bold block text-zinc-950 mb-0.5">
                    MODALIDAD: COMPROMISO DE ASISTENCIA
                  </span>
                  Abonás el total en efectivo o transferencia al terminar tu corte en el estudio.
                </>
              )}
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <a
              href={confirmedTicket.waMessage}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 bg-[#1E8E5A] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 hover:bg-[#19784C] transition-colors shadow-md cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Enviar Ticket a WhatsApp de {config.authorName}</span>
            </a>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  playMechanicalClick();
                  setHasConfirmed(false);
                  setConfirmedTicket(null);
                  setSelectedTime('');
                }}
                className="py-2.5 px-3 rounded-xl border border-zinc-300 text-zinc-800 hover:bg-zinc-200 text-[11px] font-bold cursor-pointer"
              >
                Agendar otro turno
              </button>

              <button
                type="button"
                onClick={() => {
                  playMechanicalClick();
                  cancelAppointment(confirmedTicket.id);
                  setHasConfirmed(false);
                  setConfirmedTicket(null);
                  setSelectedTime('');
                }}
                className="py-2.5 px-3 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Cancelar y liberar horario</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Interactive 3-Step Selector */}
      <div className="lg:col-span-7 space-y-6">
        {/* Step 1: Services Selector */}
        <div className="bg-[#111318] border border-[#232730] rounded-2xl p-6 sm:p-7 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1E222B] pb-4 mb-5">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-[#D4A373] text-zinc-950 flex items-center justify-center font-mono text-xs font-black">
                01
              </span>
              <h3 className="font-display text-lg font-bold text-white uppercase tracking-tight">
                Seleccioná tus Servicios
              </h3>
            </div>
            <span className="text-xs font-mono text-zinc-400 tabular-nums">
              {summary.selectedServices.length} seleccionados
            </span>
          </div>

          <div className="space-y-3">
            {visibleServices.map((srv) => {
              const isSelected = selectedServiceIds.includes(srv.id);
              const showPrice = config.showServicePrice && !srv.hidePrice;
              const showDuration = config.showServiceDuration;

              return (
                <div
                  key={srv.id}
                  onClick={() => {
                    playMechanicalClick();
                    toggleSelectService(srv.id);
                  }}
                  onMouseEnter={playMechanicalHover}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 active:scale-[0.99] ${
                    isSelected
                      ? 'bg-[#171A21] border-[#D4A373] shadow-[0_4px_20px_rgba(212,163,115,0.12)]'
                      : 'bg-[#0C0E12] border-[#1F232C] hover:border-[#D4A373]/40'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-display font-bold text-white text-sm sm:text-base truncate">
                        {srv.name}
                      </h4>
                      {srv.popularTag && (
                        <span className="text-[11px] font-mono font-semibold text-[#D4A373] shrink-0">
                          · {srv.popularTag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 font-mono">
                      {srv.category}
                      {showDuration ? ` · ${srv.durationMinutes} min` : ''}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    {showPrice && (
                      <span className="text-base font-mono font-black text-white block tabular-nums">
                        {formatPriceARS(srv.price)}
                      </span>
                    )}
                    <span
                      className={`text-[11px] font-mono font-bold ${
                        isSelected ? 'text-[#D4A373]' : 'text-zinc-500'
                      }`}
                    >
                      {isSelected ? '✓ Seleccionado' : 'Elegir'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Date & Slot Selector */}
        <div className="bg-[#111318] border border-[#232730] rounded-2xl p-6 sm:p-7 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E222B] pb-4 mb-5">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-[#D4A373] text-zinc-950 flex items-center justify-center font-mono text-xs font-black">
                02
              </span>
              <h3 className="font-display text-lg font-bold text-white uppercase tracking-tight">
                Fecha &amp; Horario en Vivo
              </h3>
            </div>
            <span className="text-xs font-mono text-zinc-400 tabular-nums">
              {freeSlotsCount} libres · {busySlotsCount} ocupados
            </span>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <label
                  htmlFor="booking-date-input"
                  className="text-xs font-mono text-zinc-300 uppercase font-bold"
                >
                  Elegí el Día (Por defecto Hoy {todayISO}):
                </label>

                {/* Quick Day Buttons */}
                <div className="inline-flex items-center gap-1.5">
                  {[
                    { label: 'Hoy', iso: todayISO },
                    { label: 'Mañana', iso: tomorrowISO },
                    { label: 'Pasado', iso: dayAfterISO },
                  ].map((d) => (
                    <button
                      key={d.iso}
                      type="button"
                      onClick={() => {
                        playMechanicalClick();
                        setSelectedDate(d.iso);
                        setSelectedTime('');
                      }}
                      className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition-colors cursor-pointer ${
                        selectedDate === d.iso
                          ? 'bg-[#D4A373] text-zinc-950'
                          : 'bg-[#0C0E12] border border-[#232730] text-zinc-400 hover:text-white'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <input
                id="booking-date-input"
                type="date"
                min={todayISO}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTime('');
                }}
                className="w-full bg-[#0C0E12] border border-[#282C37] rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-hidden focus:border-[#D4A373]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-mono text-zinc-300 uppercase font-bold">
                  Horarios para el {selectedDate}:
                </span>
                <span className="text-[11px] font-mono text-zinc-400">
                  Actualización automática en vivo
                </span>
              </div>

              {availableSlots.length === 0 ? (
                <div className="p-5 bg-[#161922] border border-[#262B36] rounded-xl text-center text-xs font-mono text-zinc-300 space-y-2.5">
                  <p>El estudio permanece cerrado en la fecha seleccionada ({selectedDate}).</p>
                  <button
                    type="button"
                    onClick={() => setSelectedDate(todayISO)}
                    className="px-3.5 py-2 rounded-lg bg-[#D4A373] text-zinc-950 font-bold cursor-pointer"
                  >
                    Ver horarios de Hoy ({todayISO})
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedTime === slot.time && slot.available;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        title={slot.reason || `Disponible a las ${slot.time} hs`}
                        onClick={() => {
                          playMechanicalClick();
                          setSelectedTime(slot.time);
                        }}
                        onMouseEnter={slot.available ? playMechanicalHover : undefined}
                        className={`py-2.5 px-3 rounded-xl font-mono text-xs font-bold transition-all tabular-nums ${
                          !slot.available
                            ? 'bg-[#090B0E] border border-[#191C24] text-zinc-600 line-through cursor-not-allowed'
                            : isSelected
                            ? 'bg-[#D4A373] text-zinc-950 shadow-md font-black cursor-pointer'
                            : 'bg-[#0C0E12] border border-[#232730] text-zinc-200 hover:border-[#D4A373] hover:text-white cursor-pointer active:scale-95'
                        }`}
                      >
                        <span>{slot.time} hs</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 3: Client Details */}
        <div className="bg-[#111318] border border-[#232730] rounded-2xl p-6 sm:p-7 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-[#1E222B] pb-4 mb-5">
            <span className="w-6 h-6 rounded-lg bg-[#D4A373] text-zinc-950 flex items-center justify-center font-mono text-xs font-black">
              03
            </span>
            <h3 className="font-display text-lg font-bold text-white uppercase tracking-tight">
              Tus Datos de Contacto
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="text-xs font-mono text-zinc-300 uppercase block mb-1.5 font-bold">
                Nombre y Apellido
              </label>
              <input
                type="text"
                placeholder="Ej. Lucas Santoro"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-[#0C0E12] border border-[#282C37] rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-hidden focus:border-[#D4A373]"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-300 uppercase block mb-1.5 font-bold">
                WhatsApp (sin 0 ni 15)
              </label>
              <input
                type="tel"
                placeholder="Ej. 3462 554421"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-[#0C0E12] border border-[#282C37] rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-hidden focus:border-[#D4A373]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-zinc-300 uppercase block mb-2 font-bold">
              Modalidad de Reserva:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onMouseEnter={playMechanicalHover}
                className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-colors ${
                  paymentOption === 'deposit'
                    ? 'bg-[#171A21] border-[#D4A373]'
                    : 'bg-[#0C0E12] border-[#232730]'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentOption === 'deposit'}
                  onChange={() => {
                    playMechanicalClick();
                    setPaymentOption('deposit');
                  }}
                  className="mt-1 accent-[#D4A373]"
                />
                <div className="text-xs">
                  <span className="font-bold text-white block">
                    Seña del {config.depositPercentage}%
                  </span>
                  <span className="text-zinc-400 text-[11px] leading-relaxed block mt-0.5">
                    Transferencia a alias <strong className="text-zinc-200">{config.transferAlias}</strong> para asegurar el horario.
                  </span>
                </div>
              </label>

              <label
                onMouseEnter={playMechanicalHover}
                className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-colors ${
                  paymentOption === 'commitment'
                    ? 'bg-[#171A21] border-[#D4A373]'
                    : 'bg-[#0C0E12] border-[#232730]'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentOption === 'commitment'}
                  onChange={() => {
                    playMechanicalClick();
                    setPaymentOption('commitment');
                  }}
                  className="mt-1 accent-[#D4A373]"
                />
                <div className="text-xs">
                  <span className="font-bold text-white block">Compromiso de Asistencia</span>
                  <span className="text-zinc-400 text-[11px] leading-relaxed block mt-0.5">
                    Sin seña previa. Abonás el 100% en el estudio ({config.mainPriceDisplay}). Tolerancia {config.maxCourtesyMinutes} min.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Live Ticket Preview + Clear Information Card Below Ticket */}
      <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
        {/* Ticket Card */}
        <div className="bg-[#FAF8F5] text-zinc-950 p-6 sm:p-7 rounded-2xl shadow-2xl font-mono text-xs border border-zinc-300">
          <div className="text-center pb-4 mb-4 border-b border-dashed border-zinc-400">
            <Barcode className="w-40 h-8 mx-auto text-zinc-800 mb-1" />
            <span className="text-[10px] tracking-widest text-zinc-600 uppercase font-bold block">
              {config.studioTitle} · TICKET EN VIVO
            </span>
            <p className="font-display font-black text-lg text-zinc-900 mt-1 uppercase">
              {config.address} · {config.neighborhood}
            </p>
          </div>

          <div className="space-y-3 mb-5">
            <div className="flex justify-between">
              <span className="text-zinc-600 font-semibold">FECHA:</span>
              <span className="font-bold text-zinc-950 tabular-nums">
                {selectedDate || todayISO}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 font-semibold">HORA:</span>
              <span
                className={`font-bold tabular-nums ${
                  selectedTime ? 'text-zinc-950 bg-amber-100 px-2 py-0.5 rounded' : 'text-zinc-500'
                }`}
              >
                {selectedTime ? `${selectedTime} HS` : 'Seleccionar horario'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 font-semibold">CLIENTE:</span>
              <span className="font-bold text-zinc-950 uppercase">
                {clientName.trim() || 'Completar nombre'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 font-semibold">DURACIÓN ESTIMADA:</span>
              <span className="font-bold text-zinc-950 tabular-nums">
                {summary.serviceMinutes} min
              </span>
            </div>

            <div className="pt-3 border-t border-dashed border-zinc-400">
              <span className="text-zinc-600 font-semibold block mb-1">SERVICIOS:</span>
              {summary.selectedServices.length === 0 ? (
                <p className="text-zinc-500 italic">No hay servicios seleccionados</p>
              ) : (
                summary.selectedServices.map((srv) => (
                  <div key={srv.id} className="flex justify-between py-0.5">
                    <span className="text-zinc-900 font-medium truncate max-w-[24ch]">{srv.name}</span>
                    <span className="font-bold text-zinc-950 tabular-nums">
                      {formatPriceARS(srv.price)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-zinc-900 flex justify-between items-baseline text-sm">
              <span className="font-black text-zinc-900">TOTAL ARS:</span>
              <span className="font-black text-lg text-zinc-950 tabular-nums">
                {formatPriceARS(summary.totalPrice)}
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={!isFormValid}
            onClick={(e) => {
              playMechanicalClick();
              handleConfirmReservation(e);
            }}
            onMouseEnter={isFormValid ? playMechanicalHover : undefined}
            className={`w-full py-4 text-xs font-mono font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
              isFormValid
                ? 'bg-[#111318] text-[#D4A373] hover:bg-black hover:text-[#E2B687]'
                : 'bg-zinc-200 text-zinc-600 border border-zinc-300 cursor-not-allowed'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>Confirmar Turno &amp; Emitir Ticket</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {!isFormValid && (
            <div className="mt-3 p-3 rounded-xl bg-zinc-100 border border-zinc-300 text-[11px] text-zinc-800 font-sans font-medium text-center leading-relaxed">
              Para activar el botón, elegí un <strong>horario libre</strong> ({selectedDate}) y completá tu <strong>nombre</strong> y <strong>WhatsApp</strong> en el Paso 03.
            </div>
          )}
        </div>

        {/* Clean High-Contrast Info Panel Below the Ticket */}
        <div className="bg-[#111318] border border-[#232730] rounded-2xl p-5 shadow-xl space-y-3 text-xs font-mono">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#1E222B]">
            <span className="text-[#D4A373] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#D4A373]" />
              <span>Información del Turno 1 a 1</span>
            </span>
            <span className="text-zinc-400">{config.neighborhood}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-zinc-300">
            <div className="p-3 rounded-xl bg-[#0C0E12] border border-[#1E222B]">
              <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1 mb-0.5">
                <MapPin className="w-3 h-3 text-[#D4A373]" />
                Dirección del Estudio
              </span>
              <span className="text-white font-bold block">{config.address}</span>
              <span className="text-[11px] text-zinc-400">Atención privada sin demoras</span>
            </div>

            <div className="p-3 rounded-xl bg-[#0C0E12] border border-[#1E222B]">
              <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1 mb-0.5">
                <Clock className="w-3 h-3 text-[#D4A373]" />
                Tolerancia &amp; Alias
              </span>
              <span className="text-white font-bold block">Alias: {config.transferAlias}</span>
              <span className="text-[11px] text-zinc-400">
                Tolerancia: {config.maxCourtesyMinutes} min · Seña {config.depositPercentage}%
              </span>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between gap-2 text-[11px] text-zinc-400">
            <span>¿Tenés dudas con un horario?</span>
            <a
              href={`${waInfo.url}?text=${encodeURIComponent(
                `Hola ${config.authorName}! Estoy viendo los turnos en la web para el ${selectedDate} y te quería hacer una consulta.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D4A373] hover:underline font-bold inline-flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Consultar por WhatsApp ({waInfo.display})</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
