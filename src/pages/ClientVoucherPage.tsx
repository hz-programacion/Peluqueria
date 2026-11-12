import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  CalendarPlus,
  Download,
  Share2,
  ArrowLeft,
  RefreshCw,
  XCircle,
  MessageCircle,
  Copy,
  CreditCard,
  Building,
  Sparkles,
  Scissors,
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import {
  getAvailableTimeSlots,
  getUpcomingOpenDays,
  formatPriceARS,
  resolveWhatsAppInfo,
  getTodayLocalISO,
  findAppointmentsByQuery,
} from '../utils/bookingEngine';
import {
  downloadAppointmentICS,
  downloadThermalTicketPNG,
  generateGoogleCalendarUrl,
  ExportableTicketData,
} from '../utils/ticketExport';
import { RetroRiverCrestBadge } from '../components/RetroPaperBanda';

export const ClientVoucherPage: React.FC = () => {
  const {
    activeTicketId,
    setActiveTicketId,
    appointments,
    services,
    config,
    blockedSlots,
    rescheduleAppointment,
    updateAppointmentStatus,
    navigateTo,
  } = useStudio();

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [downloadFeedback, setDownloadFeedback] = useState<string>('');

  // Reschedule state
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [selectedRescheduleDate, setSelectedRescheduleDate] = useState<string>('');
  const [selectedRescheduleTime, setSelectedRescheduleTime] = useState<string>('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleSuccessMsg, setRescheduleSuccessMsg] = useState<string | null>(null);
  const [rescheduleErrorMsg, setRescheduleErrorMsg] = useState<string | null>(null);

  // Cancellation state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancellationConfirmed, setCancellationConfirmed] = useState(false);

  // Find target appointment
  const currentTicketId = activeTicketId || searchQuery.trim();
  const appointment = useMemo(() => {
    if (!currentTicketId) return null;
    return appointments.find(
      (a) =>
        a.id.toLowerCase() === currentTicketId.toLowerCase() ||
        a.id.toLowerCase() === `rc-${currentTicketId.toLowerCase()}`
    );
  }, [appointments, currentTicketId]);

  const waInfo = resolveWhatsAppInfo(config.phoneDisplay, config.whatsappRaw);
  const todayISO = getTodayLocalISO();

  // Upcoming open working days for rescheduling
  const upcomingOpenDays = useMemo(() => {
    return getUpcomingOpenDays(
      appointments,
      blockedSlots,
      config.openingHour,
      config.closingHour,
      config.openDays,
      appointment ? appointment.serviceMinutes + appointment.bufferMinutes : 50,
      6
    );
  }, [appointments, blockedSlots, config, appointment]);

  const activeRescheduleDate = selectedRescheduleDate || upcomingOpenDays[0]?.dateISO || todayISO;

  // Available slots on chosen reschedule date (excluding other bookings, allowing current booking slot)
  const availableSlots = useMemo(() => {
    if (!activeRescheduleDate) return [];
    const otherAppointments = appointment
      ? appointments.filter((a) => a.id !== appointment.id)
      : appointments;
    return getAvailableTimeSlots(
      activeRescheduleDate,
      appointment ? appointment.serviceMinutes + appointment.bufferMinutes : 50,
      otherAppointments,
      config.openingHour,
      config.closingHour,
      blockedSlots,
      config.openDays
    );
  }, [activeRescheduleDate, appointments, appointment, blockedSlots, config]);

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleConfirmReschedule = async () => {
    if (!appointment || !activeRescheduleDate || !selectedRescheduleTime) return;
    setRescheduleLoading(true);
    setRescheduleErrorMsg(null);
    setRescheduleSuccessMsg(null);

    const res = await rescheduleAppointment(
      appointment.id,
      activeRescheduleDate,
      selectedRescheduleTime
    );
    setRescheduleLoading(false);

    if (res.ok) {
      setRescheduleSuccessMsg(
        `Tu turno fue reprogramado con éxito para el ${activeRescheduleDate} a las ${selectedRescheduleTime} hs.`
      );
      setIsRescheduling(false);
    } else {
      setRescheduleErrorMsg(res.error || 'No se pudo reprogramar el turno en ese horario.');
    }
  };

  const handleConfirmCancellation = () => {
    if (!appointment) return;
    setCancelLoading(true);
    updateAppointmentStatus(appointment.id, 'cancelled');
    setCancelLoading(false);
    setShowCancelModal(false);
    setCancellationConfirmed(true);
  };

  const exportableTicket: ExportableTicketData | null = useMemo(() => {
    if (!appointment) return null;
    const matchedPrices = appointment.serviceNames.reduce((acc, sName) => {
      const found = services.find((srv) => srv.name.toLowerCase() === sName.toLowerCase());
      return acc + (found ? found.price : 12000);
    }, 0);

    return {
      id: appointment.id,
      clientName: appointment.clientName,
      whatsapp: appointment.whatsapp,
      date: appointment.date,
      time: appointment.startTime,
      services: appointment.serviceNames,
      totalMinutes: appointment.serviceMinutes + appointment.bufferMinutes,
      totalPrice: matchedPrices,
      paymentOption: appointment.paymentOption,
      studioTitle: config.studioTitle,
      address: config.address,
      neighborhood: config.neighborhood,
      transferAlias: config.transferAlias,
    };
  }, [appointment, services, config]);

  const handleDownloadPNG = async () => {
    if (!exportableTicket) return;
    setDownloadFeedback('Generando boleto editorial...');
    try {
      await downloadThermalTicketPNG(exportableTicket);
      setDownloadFeedback('¡Boleto PNG guardado en tu dispositivo!');
    } catch {
      setDownloadFeedback('Error al exportar. Podés tomar captura de pantalla.');
    }
    setTimeout(() => setDownloadFeedback(''), 3000);
  };

  const handleDownloadICS = () => {
    if (!exportableTicket) return;
    downloadAppointmentICS(exportableTicket);
  };

  return (
    <div className="min-h-screen py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Top back navigation */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigateTo('home')}
          className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#4F463B] hover:text-[#9E2A2B] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Estudio</span>
        </button>

        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#786D5E] font-semibold">
          Portal de Autogestión 1 a 1
        </span>
      </div>

      {!appointment ? (
        /* If no appointment found with current ID */
        <div className="bg-[#FAF6EE] border border-[#C8BBA4] rounded-2xl p-8 sm:p-12 text-center shadow-[0_14px_36px_rgba(24,21,18,0.08)]">
          <RetroRiverCrestBadge size="md" monogram={config.brandMonogram} className="mx-auto mb-4" />
          <h2 className="font-editorial text-2xl sm:text-3xl text-[#181512] font-bold mb-2">
            Consultá o Gestioná tu Turno
          </h2>
          <p className="text-sm text-[#4F463B] max-w-md mx-auto mb-6">
            Ingresá el código de tu comprobante (ej. {activeTicketId || 'RC-841920'}) o tu número de
            WhatsApp para ver el estado, reprogramar o cancelar.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                setActiveTicketId(searchQuery.trim());
              }
            }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ej.: RC-841920 o 3462 521984"
              className="w-full px-4 py-3 rounded-xl bg-[#EAE0CE] border border-[#C8BBA4] text-sm text-[#181512] focus:outline-none focus:border-[#9E2A2B]"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#9E2A2B] text-[#FAF6EE] text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#822021] transition-colors whitespace-nowrap cursor-pointer"
            >
              Buscar Turno
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#D5C9B4] flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigateTo('home', 'turnero')}
              className="text-xs font-mono font-semibold uppercase text-[#9E2A2B] underline hover:text-[#822021]"
            >
              Sacar un Nuevo Turno →
            </button>
            <span className="text-[#C8BBA4] hidden sm:inline">•</span>
            <a
              href={`${waInfo.url}?text=${encodeURIComponent(
                `Hola ${config.authorName}! Necesito consultar sobre mi turno en Rodrigo Cutsss.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono font-semibold uppercase text-[#4F463B] hover:text-[#181512] inline-flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#1F6E43]" />
              <span>Contactar a Rodrigo por WhatsApp</span>
            </a>
          </div>
        </div>
      ) : (
        /* Appointment Voucher Card */
        <div className="space-y-6">
          {/* Status Banner */}
          {rescheduleSuccessMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-[#E6F4EA] border border-[#A8DAB5] text-[#137333] text-sm flex items-center gap-3 shadow-xs"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{rescheduleSuccessMsg}</span>
            </motion.div>
          )}

          {appointment.status === 'cancelled' && (
            <div className="p-4 rounded-xl bg-[#FCE8E6] border border-[#F5C2C7] text-[#C5221F] text-sm flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <XCircle className="w-5 h-5 shrink-0" />
                <span>
                  <strong>Turno Cancelado:</strong> Este horario fue liberado en el sistema para otro
                  cliente.
                </span>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('home', 'turnero')}
                className="px-3 py-1.5 rounded-lg bg-[#C5221F] text-[#FAF6EE] text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#A51D24] transition-colors whitespace-nowrap cursor-pointer shrink-0"
              >
                Reservar Nuevo Turno
              </button>
            </div>
          )}

          {/* Main High-Fashion Archival Ticket */}
          <div className="bg-[#FAF6EE] border border-[#C8BBA4] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(24,21,18,0.1)] relative">
            {/* Top decorative sash accent */}
            <div className="h-2 w-full bg-gradient-to-r from-[#9E2A2B] via-[#B89146] to-[#9E2A2B]" />

            <div className="p-6 sm:p-10">
              {/* Header: Crest + Studio Title + Ticket Number */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#D5C9B4]">
                <div className="flex items-center gap-3.5">
                  <RetroRiverCrestBadge
                    size="md"
                    monogram={config.brandMonogram}
                    logoUrl={config.brandLogoUrl}
                  />
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#9E2A2B] font-bold block">
                      Boleto Oficial de Sastrería Capilar
                    </span>
                    <h1 className="font-display text-xl sm:text-2xl font-bold text-[#181512] leading-tight">
                      {config.studioTitle}
                    </h1>
                    <span className="text-xs text-[#5C5346] flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#9E2A2B]" />
                      {config.address}, {config.neighborhood}
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#786D5E] block font-semibold">
                    Comprobante
                  </span>
                  <span className="text-lg font-mono font-bold text-[#181512] tracking-wider">
                    #{appointment.id}
                  </span>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                        appointment.status === 'confirmed'
                          ? 'bg-[#1F6E43]/12 text-[#1F6E43] border border-[#1F6E43]/30'
                          : appointment.status === 'completed'
                            ? 'bg-[#B89146]/15 text-[#B89146] border border-[#B89146]/35'
                            : appointment.status === 'cancelled'
                              ? 'bg-[#C5221F]/12 text-[#C5221F] border border-[#C5221F]/30'
                              : 'bg-[#E5A93C]/15 text-[#A06C10] border border-[#E5A93C]/35'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {appointment.status === 'confirmed'
                        ? 'Confirmado & Agendado'
                        : appointment.status === 'completed'
                          ? 'Corte Finalizado'
                          : appointment.status === 'cancelled'
                            ? 'Cancelado'
                            : 'Pendiente'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Client & Timing Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-[#D5C9B4]">
                {/* Timing */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EAE0CE] border border-[#C8BBA4] flex items-center justify-center text-[#9E2A2B]">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#786D5E] block">
                        Fecha Reservada
                      </span>
                      <span className="font-display text-base font-bold text-[#181512]">
                        {appointment.date}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EAE0CE] border border-[#C8BBA4] flex items-center justify-center text-[#9E2A2B]">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#786D5E] block">
                        Horario de Atención
                      </span>
                      <span className="font-display text-base font-bold text-[#181512]">
                        {appointment.startTime} hs{' '}
                        <span className="text-xs font-normal text-[#5C5346]">
                          ({appointment.serviceMinutes} min de sesión + {appointment.bufferMinutes} min
                          higiene)
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Client info */}
                <div className="space-y-3">
                  <div className="bg-[#EAE0CE] p-4 rounded-xl border border-[#C8BBA4]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#786D5E] block mb-1">
                      Titular de la Reserva
                    </span>
                    <span className="font-display text-base font-bold text-[#181512] block">
                      {appointment.clientName}
                    </span>
                    <span className="text-xs font-mono text-[#5C5346] mt-0.5 block">
                      WhatsApp: {appointment.whatsapp}
                    </span>
                  </div>
                </div>
              </div>

              {/* Services & Value */}
              <div className="py-6 border-b border-[#D5C9B4]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#786D5E] block mb-3 font-semibold">
                  Servicios Incluidos en tu Sesión
                </span>
                <div className="space-y-2">
                  {appointment.serviceNames.map((sName, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm py-1.5 px-3 rounded-lg bg-[#EFE6D5]/60 border border-[#D5C9B4]/60"
                    >
                      <div className="flex items-center gap-2">
                        <Scissors className="w-4 h-4 text-[#9E2A2B]" />
                        <span className="font-semibold text-[#181512]">{sName}</span>
                      </div>
                      <span className="text-xs font-mono text-[#5C5346]">Atención 1 a 1</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Info & Optional Mercado Pago */}
              <div className="py-6 border-b border-[#D5C9B4]">
                <div className="bg-[#EAE0CE]/75 border border-[#C8BBA4] rounded-xl p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#181512] font-bold">
                      Datos de Pago & Seña
                    </span>
                    <span className="text-xs font-mono font-semibold text-[#4F463B]">
                      {appointment.paymentOption === 'deposit'
                        ? 'Seña del 30% requerida'
                        : 'Abono total en el local'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Alias Bancario (0% Comisión) */}
                    <div className="p-3 bg-[#FAF6EE] rounded-lg border border-[#C8BBA4] flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-mono uppercase text-[#786D5E] block">
                          Alias Bancario (Sin comisión)
                        </span>
                        <span className="font-mono font-bold text-[#181512]">
                          {config.transferAlias}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(config.transferAlias, 'alias')}
                        className="p-1.5 rounded-md hover:bg-[#EAE0CE] text-[#4F463B] transition-colors cursor-pointer"
                        title="Copiar alias"
                      >
                        {copiedField === 'alias' ? (
                          <CheckCircle2 className="w-4 h-4 text-[#1F6E43]" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* CBU Bancario */}
                    {config.transferCbu && (
                      <div className="p-3 bg-[#FAF6EE] rounded-lg border border-[#C8BBA4] flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-mono uppercase text-[#786D5E] block">
                            CBU Bancario
                          </span>
                          <span className="font-mono font-bold text-[#181512] truncate max-w-[140px] block">
                            {config.transferCbu}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(config.transferCbu!, 'cbu')}
                          className="p-1.5 rounded-md hover:bg-[#EAE0CE] text-[#4F463B] transition-colors cursor-pointer"
                          title="Copiar CBU"
                        >
                          {copiedField === 'cbu' ? (
                            <CheckCircle2 className="w-4 h-4 text-[#1F6E43]" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Optional Mercado Pago Link if enabled in Admin */}
                  {config.mercadoPagoEnabled && config.mercadoPagoLink && (
                    <div className="mt-3 pt-3 border-t border-[#C8BBA4] flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-left w-full sm:w-auto">
                        <span className="text-[10px] font-mono uppercase text-[#009EE3] font-bold block flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5" />
                          Pago con Mercado Pago (Tarjetas Débito/Crédito)
                        </span>
                        <span className="text-[11px] text-[#5C5346]">
                          {config.mercadoPagoNote || 'Aboná tu seña con tarjeta al instante'}
                        </span>
                      </div>
                      <a
                        href={config.mercadoPagoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#009EE3] hover:bg-[#0081BA] text-[#FAF6EE] text-xs font-mono font-bold uppercase tracking-wider transition-colors text-center whitespace-nowrap shadow-xs"
                      >
                        Pagar Seña con Mercado Pago →
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* 1-Click Self-Service Actions (Reprogramar / Cancelar) */}
              {appointment.status !== 'cancelled' && (
                <div className="py-6 border-b border-[#D5C9B4]">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRescheduling(!isRescheduling);
                        setRescheduleErrorMsg(null);
                        setRescheduleSuccessMsg(null);
                      }}
                      className="px-5 py-3 rounded-xl bg-[#EAE0CE] hover:bg-[#E2D4BF] border border-[#C8BBA4] text-[#181512] text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <RefreshCw className="w-4 h-4 text-[#9E2A2B]" />
                      <span>{isRescheduling ? 'Cerrar Reprogramación' : 'Reprogramar Turno (1 Clic)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowCancelModal(true)}
                      className="px-5 py-3 rounded-xl bg-[#FAF6EE] hover:bg-[#FCE8E6] border border-[#F5C2C7] text-[#C5221F] text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Cancelar Turno</span>
                    </button>
                  </div>

                  {/* Inline Reschedule Picker */}
                  <AnimatePresence>
                    {isRescheduling && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-6 p-5 sm:p-6 rounded-xl bg-[#EAE0CE] border border-[#C8BBA4]"
                      >
                        <h3 className="font-editorial text-lg font-bold text-[#181512] mb-1">
                          Seleccioná tu nuevo día y horario disponible
                        </h3>
                        <p className="text-xs text-[#5C5346] mb-4">
                          El horario anterior ({appointment.date} a las {appointment.startTime} hs) se
                          liberará automáticamente en el sistema.
                        </p>

                        {/* Day Selector */}
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
                          {upcomingOpenDays.map((d) => (
                            <button
                              key={d.dateISO}
                              type="button"
                              onClick={() => {
                                setSelectedRescheduleDate(d.dateISO);
                                setSelectedRescheduleTime('');
                              }}
                              className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                                activeRescheduleDate === d.dateISO
                                  ? 'bg-[#9E2A2B] text-[#FAF6EE] border-[#781D1E] shadow-xs'
                                  : 'bg-[#FAF6EE] text-[#181512] border-[#C8BBA4] hover:border-[#9E2A2B]'
                              }`}
                            >
                              <span className="text-[10px] font-mono block uppercase">
                                {d.dayNameShort}
                              </span>
                              <span className="text-base font-bold block">{d.dayNumber}</span>
                              <span className="text-[9px] block opacity-80">
                                {d.freeSlotsCount} libres
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Available Slots */}
                        <div className="mb-4">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#786D5E] font-bold block mb-2">
                            Horarios Libres el {activeRescheduleDate}:
                          </span>
                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
                            {availableSlots
                              .filter((s) => s.available)
                              .map((slot) => (
                                <button
                                  key={slot.time}
                                  type="button"
                                  onClick={() => setSelectedRescheduleTime(slot.time)}
                                  className={`py-2 px-1 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                                    selectedRescheduleTime === slot.time
                                      ? 'bg-[#1F6E43] text-[#FAF6EE] border-[#175634] shadow-xs'
                                      : 'bg-[#FAF6EE] text-[#181512] border-[#C8BBA4] hover:border-[#1F6E43]'
                                  }`}
                                >
                                  {slot.time} hs
                                </button>
                              ))}
                          </div>
                        </div>

                        {rescheduleErrorMsg && (
                          <div className="p-3 mb-3 rounded-lg bg-[#FCE8E6] text-[#C5221F] text-xs font-mono">
                            {rescheduleErrorMsg}
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#C8BBA4]">
                          <button
                            type="button"
                            onClick={() => setIsRescheduling(false)}
                            className="px-4 py-2 text-xs font-mono text-[#5C5346] hover:text-[#181512]"
                          >
                            Descartar
                          </button>
                          <button
                            type="button"
                            disabled={!selectedRescheduleTime || rescheduleLoading}
                            onClick={handleConfirmReschedule}
                            className="px-5 py-2.5 rounded-lg bg-[#1F6E43] hover:bg-[#175634] disabled:opacity-50 text-[#FAF6EE] text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            {rescheduleLoading
                              ? 'Guardando...'
                              : `Confirmar para las ${selectedRescheduleTime || '--:--'} hs`}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Export & Calendar Actions */}
              <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleDownloadPNG}
                    className="px-4 py-2 rounded-lg bg-[#FAF6EE] border border-[#C8BBA4] hover:border-[#9E2A2B] text-[#181512] text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-[#9E2A2B]" />
                    <span>Guardar Boleto PNG</span>
                  </button>

                  <a
                    href={generateGoogleCalendarUrl(exportableTicket!)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg bg-[#FAF6EE] border border-[#C8BBA4] hover:border-[#9E2A2B] text-[#181512] text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-[#4285F4]" />
                    <span>Google Calendar</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleDownloadICS}
                    className="px-4 py-2 rounded-lg bg-[#FAF6EE] border border-[#C8BBA4] hover:border-[#9E2A2B] text-[#181512] text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <CalendarDays className="w-3.5 h-3.5 text-[#9E2A2B]" />
                    <span>Apple / Outlook (.ics)</span>
                  </button>
                </div>

                <a
                  href={`${waInfo.url}?text=${encodeURIComponent(
                    `Hola ${config.authorName}! Te escribo sobre mi turno #${appointment.id} (${appointment.date} a las ${appointment.startTime} hs).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1F6E43] hover:bg-[#175634] text-[#FAF6EE] text-xs font-mono font-bold uppercase tracking-wider transition-colors shadow-xs w-full sm:w-auto justify-center"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Avisar a Rodrigo</span>
                </a>
              </div>

              {downloadFeedback && (
                <p className="mt-3 text-center text-xs font-mono text-[#1F6E43]">
                  {downloadFeedback}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Cancellation */}
      <AnimatePresence>
        {showCancelModal && appointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#181512]/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FAF6EE] border border-[#C8BBA4] rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative"
            >
              <div className="w-12 h-12 rounded-xl bg-[#FCE8E6] text-[#C5221F] flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>

              <h3 className="font-editorial text-2xl font-bold text-[#181512] mb-2">
                ¿Deseás cancelar tu turno?
              </h3>
              <p className="text-sm text-[#4F463B] mb-6">
                Al cancelar, el horario ({appointment.date} a las {appointment.startTime} hs) se
                liberará inmediatamente en la agenda para que otro cliente pueda aprovecharlo.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#C8BBA4] text-xs font-mono font-semibold uppercase text-[#4F463B] hover:text-[#181512] cursor-pointer"
                >
                  Mantener mi turno
                </button>
                <button
                  type="button"
                  disabled={cancelLoading}
                  onClick={handleConfirmCancellation}
                  className="px-5 py-2.5 rounded-xl bg-[#C5221F] hover:bg-[#A51D24] text-[#FAF6EE] text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {cancelLoading ? 'Cancelando...' : 'Sí, Liberar Horario'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default ClientVoucherPage;
