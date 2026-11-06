import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import {
  calculateBookingSummary,
  getAvailableTimeSlots,
  formatPriceARS,
} from '../utils/bookingEngine';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Phone,
  User,
  Scissors,
  MessageCircle,
  Barcode,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';

export const ThermalReceiptBooking: React.FC = () => {
  const {
    services,
    selectedServiceIds,
    toggleSelectService,
    setSelectedServiceIds,
    appointments,
    blockedSlots,
    addAppointment,
    config,
  } = useStudio();

  // Booking Form State
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
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
    totalMinutes: number;
    paymentOption: 'deposit' | 'commitment';
    waMessage: string;
  } | null>(null);

  // Summary calculation with exact arguments
  const summary = calculateBookingSummary(selectedServiceIds, services);

  // Available Slots for date with exact parameters
  const availableSlots = getAvailableTimeSlots(
    selectedDate,
    summary.totalBlockMinutes,
    appointments,
    config.openingHour,
    config.closingHour,
    blockedSlots
  );

  // Form Validation
  const isFormValid =
    selectedServiceIds.length > 0 &&
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
      reviewLoopScheduledAt: `${selectedDate}T${selectedTime}:00`,
    });

    const serviceListText = summary.selectedServices.map((s) => `• ${s.name}`).join('\n');
    const waText = encodeURIComponent(
      `Hola Rodrigo! Acabo de generar mi ticket en la web de Rodrigo Cutsss:\n\n` +
      `🎟️ Ticket: #${ticketId}\n` +
      `👤 Cliente: ${clientName.trim()}\n` +
      `📅 Fecha: ${selectedDate}\n` +
      `⏰ Horario: ${selectedTime} hs\n` +
      `✂️ Servicios:\n${serviceListText}\n\n` +
      `💰 Total: ${formatPriceARS(summary.totalPrice)}\n` +
      `💳 Modalidad: ${paymentOption === 'deposit' ? 'Seña del 30% (' + formatPriceARS(summary.depositAmount) + ')' : 'Compromiso sin seña'}\n\n` +
      `Quedo a la espera de la confirmación para el local en Vuelta de Obligado 931, Venado Tuerto!`
    );

    setConfirmedTicket({
      id: ticketId,
      clientName: clientName.trim(),
      whatsapp: whatsapp.trim(),
      services: summary.selectedServices.map((s) => s.name),
      date: selectedDate,
      time: selectedTime,
      totalPrice: summary.totalPrice,
      totalMinutes: summary.serviceMinutes,
      paymentOption,
      waMessage: `https://wa.me/${config.whatsappRaw}?text=${waText}`,
    });

    setHasConfirmed(true);
  };

  if (hasConfirmed && confirmedTicket) {
    return (
      <div className="py-8 px-4 max-w-xl mx-auto">
        <div className="bg-[#FAF8F5] text-zinc-950 p-6 sm:p-8 rounded-xl shadow-2xl font-mono text-xs border border-zinc-300 relative overflow-hidden receipt-tear-bottom">
          <div className="text-center pb-4 mb-4 border-b border-dashed border-zinc-400">
            <div className="flex justify-center items-center gap-1 mb-1">
              <Barcode className="w-48 h-10 text-zinc-800" />
            </div>
            <p className="text-[10px] font-bold tracking-widest text-zinc-600">
              * {confirmedTicket.id} *
            </p>
            <h2 className="font-display font-black text-xl uppercase tracking-tight text-zinc-900 mt-2">
              RODRIGO CUTSSS
            </h2>
            <p className="text-[10px] text-zinc-600 font-bold">
              Vuelta de Obligado 931 · Venado Tuerto, Santa Fe
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-zinc-500">FECHA TURNO:</span>
              <span className="font-bold text-zinc-900">{confirmedTicket.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">HORARIO EXACTO:</span>
              <span className="font-bold text-zinc-900 text-sm bg-zinc-200 px-1.5 py-0.5 rounded">
                {confirmedTicket.time} HS
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">CLIENTE:</span>
              <span className="font-bold text-zinc-900 uppercase">{confirmedTicket.clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">WHATSAPP:</span>
              <span className="text-zinc-900">{confirmedTicket.whatsapp}</span>
            </div>

            <div className="pt-3 border-t border-dashed border-zinc-400">
              <span className="text-zinc-500 block mb-1">SERVICIOS SELECCIONADOS:</span>
              {confirmedTicket.services.map((srv, idx) => (
                <div key={idx} className="flex justify-between font-bold text-zinc-800 py-0.5">
                  <span>{srv}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-zinc-900 flex justify-between items-baseline text-sm">
              <span className="font-black text-zinc-900">TOTAL ARS:</span>
              <span className="font-black text-base text-zinc-950">
                {formatPriceARS(confirmedTicket.totalPrice)}
              </span>
            </div>

            <div className="text-[10px] text-zinc-600 bg-zinc-100 p-2.5 rounded border border-zinc-300">
              {confirmedTicket.paymentOption === 'deposit' ? (
                <>
                  <span className="font-bold block text-zinc-900">MODALIDAD: SEÑA 30%</span>
                  Alias para transferir: <strong className="text-zinc-950">MORETTI.STUDIO</strong> · Monto: {formatPriceARS(confirmedTicket.totalPrice * 0.3)}
                </>
              ) : (
                <>
                  <span className="font-bold block text-zinc-900">MODALIDAD: COMPROMISO</span>
                  Abonás el total en efectivo o transferencia al terminar tu corte en el estudio.
                </>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <a
              href={confirmedTicket.waMessage}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 hover:bg-[#20b858] transition-colors shadow-lg cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Enviar Ticket a WhatsApp de Rodrigo</span>
            </a>

            <button
              type="button"
              onClick={() => {
                setHasConfirmed(false);
                setConfirmedTicket(null);
                setSelectedServiceIds(['srv-mid-fade-crop']);
              }}
              className="w-full py-2.5 text-zinc-500 hover:text-zinc-900 text-center text-[11px] underline cursor-pointer"
            >
              Agendar otro turno
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Interactive Selector */}
      <div className="lg:col-span-7 space-y-8">
        
        {/* Step 1: Services Selector */}
        <div className="bg-[#12131A] border border-[#232532] rounded-2xl p-6 sm:p-7 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1E202B] pb-4 mb-5">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-gradient-to-r from-[#A855F7] to-[#FF4655] text-white flex items-center justify-center font-mono text-xs font-black shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                01
              </span>
              <h3 className="font-display text-lg font-bold text-white uppercase tracking-tight">
                Seleccioná tus Servicios
              </h3>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              {summary.selectedServices.length} seleccionados
            </span>
          </div>

          <div className="space-y-3">
            {services.map((srv) => {
              const isSelected = selectedServiceIds.includes(srv.id);
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
                      ? 'bg-[#181A28] border-[#A855F7] shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                      : 'bg-[#0E0F16] border-[#222432] hover:border-[#A855F7]/40'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-display font-bold text-white text-sm sm:text-base truncate">
                        {srv.name}
                      </h4>
                      {srv.popularTag && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#FF4655]/20 text-[#FF4655]">
                          {srv.popularTag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 font-mono">
                      {srv.category} · {srv.durationMinutes} min
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-mono font-black text-white block">
                      {formatPriceARS(srv.price)}
                    </span>
                    <span className={`text-[11px] font-mono font-bold ${isSelected ? 'text-[#A855F7]' : 'text-zinc-500'}`}>
                      {isSelected ? '[Listo]' : '[Sumar]'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Date & Slot Selector */}
        <div className="bg-[#12131A] border border-[#232532] rounded-2xl p-6 sm:p-7 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1E202B] pb-4 mb-5">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-gradient-to-r from-[#A855F7] to-[#FF4655] text-white flex items-center justify-center font-mono text-xs font-black shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                02
              </span>
              <h3 className="font-display text-lg font-bold text-white uppercase tracking-tight">
                Fecha &amp; Horario Disponible
              </h3>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              Duración: {summary.serviceMinutes} min + 10m buffer
            </span>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-xs font-mono text-zinc-400 uppercase block mb-2 font-bold">
                Elegí el Día:
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTime('');
                }}
                className="w-full bg-[#0E0F16] border border-[#2B2D3D] rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-hidden focus:border-[#A855F7]"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 uppercase block mb-2 font-bold">
                Horarios Libres para el {selectedDate}:
              </label>
              {availableSlots.length === 0 ? (
                <div className="p-4 bg-[#181A24] border border-[#2B2D3D] rounded-xl text-center text-xs font-mono text-zinc-400">
                  No hay turnos libres para esta fecha o es día no laboral (Domingo/Lunes). Elegí otro día.
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
                        onClick={() => {
                          playMechanicalClick();
                          setSelectedTime(slot.time);
                        }}
                        onMouseEnter={playMechanicalHover}
                        className={`py-2.5 px-3 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                          !slot.available
                            ? 'bg-[#0E0F16] border border-[#1A1C24] text-zinc-600 line-through cursor-not-allowed'
                            : isSelected
                            ? 'bg-gradient-to-r from-[#A855F7] to-[#D946EF] text-white shadow-md font-black'
                            : 'bg-[#0E0F16] border border-[#232532] text-zinc-300 hover:border-[#A855F7]/50 hover:text-white'
                        }`}
                      >
                        {slot.time} hs
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 3: Client Details */}
        <div className="bg-[#12131A] border border-[#232532] rounded-2xl p-6 sm:p-7 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-[#1E202B] pb-4 mb-5">
            <span className="w-6 h-6 rounded-full bg-gradient-to-r from-[#A855F7] to-[#FF4655] text-white flex items-center justify-center font-mono text-xs font-black shadow-[0_0_10px_rgba(168,85,247,0.4)]">
              03
            </span>
            <h3 className="font-display text-lg font-bold text-white uppercase tracking-tight">
              Tus Datos de Contacto
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="text-xs font-mono text-zinc-400 uppercase block mb-1.5 font-bold">
                Nombre y Apellido
              </label>
              <input
                type="text"
                placeholder="Ej. Lucas Santoro"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-[#0E0F16] border border-[#2B2D3D] rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-hidden focus:border-[#A855F7]"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 uppercase block mb-1.5 font-bold">
                WhatsApp (sin 0 ni 15)
              </label>
              <input
                type="tel"
                placeholder="Ej. 3462 554421"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-[#0E0F16] border border-[#2B2D3D] rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-hidden focus:border-[#A855F7]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-zinc-400 uppercase block mb-2 font-bold">
              Modalidad de Reserva:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onMouseEnter={playMechanicalHover}
                className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-colors ${
                  paymentOption === 'deposit'
                    ? 'bg-[#181A28] border-[#A855F7]'
                    : 'bg-[#0E0F16] border-[#232532]'
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
                  className="mt-1 accent-[#A855F7]"
                />
                <div className="text-xs">
                  <span className="font-bold text-white block">Seña del 30%</span>
                  <span className="text-zinc-400 text-[11px]">
                    Transferencia a alias RODRIGO.CUTSSS para blindar el horario.
                  </span>
                </div>
              </label>

              <label
                onMouseEnter={playMechanicalHover}
                className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-colors ${
                  paymentOption === 'commitment'
                    ? 'bg-[#181A28] border-[#A855F7]'
                    : 'bg-[#0E0F16] border-[#232532]'
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
                  className="mt-1 accent-[#A855F7]"
                />
                <div className="text-xs">
                  <span className="font-bold text-white block">Compromiso de Honor</span>
                  <span className="text-zinc-400 text-[11px]">
                    Sin seña previa. Pagás 100% en el sillón ($12.000). Tolerancia estricta de 10 min.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Live Thermal Ticket Preview */}
      <div className="lg:col-span-5 sticky top-24">
        <div className="bg-[#FAF8F5] text-zinc-950 p-6 sm:p-7 rounded-2xl shadow-2xl font-mono text-xs border border-zinc-300 receipt-tear-bottom">
          <div className="text-center pb-4 mb-4 border-b border-dashed border-zinc-400">
            <Barcode className="w-40 h-8 mx-auto text-zinc-800 mb-1" />
            <span className="text-[10px] tracking-widest text-zinc-500 uppercase font-bold block">
              RODRIGO CUTSSS // LIVE TICKET
            </span>
            <p className="font-display font-black text-lg text-zinc-900 mt-1 uppercase">
              Vuelta de Obligado 931 · Venado Tuerto
            </p>
          </div>

          <div className="space-y-3 mb-5">
            <div className="flex justify-between">
              <span className="text-zinc-500">FECHA:</span>
              <span className="font-bold text-zinc-900">{selectedDate || 'A definir'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">HORA:</span>
              <span className="font-bold text-zinc-900">
                {selectedTime ? `${selectedTime} HS` : 'Seleccionar hora'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">CLIENTE:</span>
              <span className="font-bold text-zinc-900 uppercase">
                {clientName || 'Completar datos'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">DURACIÓN ESTIMADA:</span>
              <span className="font-bold text-zinc-900">{summary.serviceMinutes} min</span>
            </div>

            <div className="pt-3 border-t border-dashed border-zinc-400">
              <span className="text-zinc-500 block mb-1">SERVICIOS:</span>
              {summary.selectedServices.length === 0 ? (
                <p className="text-zinc-400 italic">No hay servicios seleccionados</p>
              ) : (
                summary.selectedServices.map((srv) => (
                  <div key={srv.id} className="flex justify-between py-0.5">
                    <span className="text-zinc-800 truncate max-w-[20ch]">{srv.name}</span>
                    <span className="font-bold text-zinc-900">{formatPriceARS(srv.price)}</span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-zinc-900 flex justify-between items-baseline text-sm">
              <span className="font-black text-zinc-900">TOTAL ARS:</span>
              <span className="font-black text-lg text-zinc-950">
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
            className={`w-full py-4 text-xs font-mono font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl active:scale-95 ${
              isFormValid
                ? 'bg-[#0A0B10] text-[#A855F7] hover:bg-black hover:text-[#D946EF] hover:scale-[1.01]'
                : 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>Emitir Ticket &amp; Agendar</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {!isFormValid && (
            <p className="text-[10px] text-zinc-500 text-center mt-2">
              Completá servicio, día, hora y nombre para emitir el ticket.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
