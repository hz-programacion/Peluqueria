import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Calendar,
  Clock,
  MessageCircle,
  Copy,
  CheckCircle2,
  MapPin,
  Search,
  Download,
  CalendarPlus,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import {
  calculateBookingSummary,
  getAvailableTimeSlots,
  formatPriceARS,
  timeToMinutes,
  minutesToTime,
  resolveWhatsAppInfo,
  getTodayLocalISO,
  getOffsetDateISO,
  findAppointmentsByQuery,
} from '../utils/bookingEngine';
import {
  downloadAppointmentICS,
  downloadThermalTicketPNG,
  generateGoogleCalendarUrl,
  ExportableTicketData,
} from '../utils/ticketExport';
import { AppointmentRecord } from '../data/studioData';

type BookingMode = 'new_booking' | 'lookup_ticket';
type BookingStep = 1 | 2 | 3;

export const ThermalReceiptBooking: React.FC = () => {
  const {
    config,
    services,
    appointments,
    blockedSlots,
    addAppointment,
    rescheduleAppointment,
    selectedServiceIds,
    toggleSelectService,
    setSelectedServiceIds,
    preselectedSlot,
    setPreselectedSlot,
  } = useStudio();

  const [activeMode, setActiveMode] = useState<BookingMode>('new_booking');
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);

  const todayISO = getTodayLocalISO();
  const tomorrowISO = getOffsetDateISO(1);
  const dayAfterISO = getOffsetDateISO(2);

  const [selectedDate, setSelectedDate] = useState<string>(todayISO);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [paymentOption, setPaymentOption] = useState<'deposit' | 'commitment'>('deposit');
  const [formError, setFormError] = useState<string>('');
  const [confirmedTicket, setConfirmedTicket] = useState<ExportableTicketData | null>(null);
  const [copiedAlias, setCopiedAlias] = useState<boolean>(false);
  const [downloadedFeedback, setDownloadedFeedback] = useState<string>('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState<boolean>(false);

  // Lookup state
  const [lookupQuery, setLookupQuery] = useState<string>('');
  const [lookupSearched, setLookupSearched] = useState<boolean>(false);
  const [reschedulingTicketId, setReschedulingTicketId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>(todayISO);
  const [rescheduleTime, setRescheduleTime] = useState<string>('');
  const [rescheduleFeedback, setRescheduleFeedback] = useState<{
    type: 'ok' | 'err';
    text: string;
  } | null>(null);

  // Listen for preselected slot from Hero availability indicator
  useEffect(() => {
    if (preselectedSlot) {
      setActiveMode('new_booking');
      setSelectedDate(preselectedSlot.date);
      setSelectedTime(preselectedSlot.time);
      setCurrentStep(2);
      setPreselectedSlot(null);
    }
  }, [preselectedSlot, setPreselectedSlot]);

  // Listen for direct service selection from the Interactive Service Catalog
  useEffect(() => {
    const handleCatalogSelect = (e: Event) => {
      const customEvent = e as CustomEvent<{ serviceId?: string }>;
      if (customEvent.detail?.serviceId) {
        setSelectedServiceIds([customEvent.detail.serviceId]);
      }
      setActiveMode('new_booking');
      setConfirmedTicket(null);
      setCurrentStep(2);
    };
    window.addEventListener('atelier-select-service', handleCatalogSelect);
    window.addEventListener('atelier:select-service-and-advance', handleCatalogSelect);
    return () => {
      window.removeEventListener('atelier-select-service', handleCatalogSelect);
      window.removeEventListener('atelier:select-service-and-advance', handleCatalogSelect);
    };
  }, [setSelectedServiceIds]);

  const visibleServices = services.filter((s) => !s.hidden);

  const summary = calculateBookingSummary(
    selectedServiceIds,
    visibleServices,
    config.cleanBufferMinutes,
    config.depositPercentage
  );

  const slots = getAvailableTimeSlots(
    selectedDate,
    summary.totalBlockMinutes,
    appointments,
    config.openingHour,
    config.closingHour,
    blockedSlots,
    config.openDays
  );

  const availableSlotsCount = slots.filter((s) => s.available).length;
  const waInfo = resolveWhatsAppInfo(config.phoneDisplay, config.whatsappRaw);

  useEffect(() => {
    if (currentStep === 2 && !selectedTime) {
      const firstOpen = slots.find((s) => s.available);
      if (firstOpen) {
        setSelectedTime(firstOpen.time);
      }
    }
  }, [currentStep, selectedDate, slots, selectedTime]);

  const handleCopyAlias = () => {
    navigator.clipboard?.writeText(config.transferAlias || 'RODRIGO.CUTSSS');
    setCopiedAlias(true);
    setTimeout(() => setCopiedAlias(false), 2000);
  };

  const handleAdvanceToStep2 = () => {
    if (selectedServiceIds.length === 0) {
      setFormError('Elegí al menos un servicio para continuar con la fecha y hora.');
      return;
    }
    setFormError('');
    setCurrentStep(2);
  };

  const handleAdvanceToStep3 = () => {
    if (!selectedDate || !selectedTime) {
      setFormError('Seleccioná un día y un horario disponible para avanzar.');
      return;
    }
    setFormError('');
    setCurrentStep(3);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServiceIds.length === 0) {
      setFormError('Seleccioná al menos un servicio en el Paso 1.');
      setCurrentStep(1);
      return;
    }
    if (!selectedTime) {
      setFormError('Seleccioná un horario disponible en el Paso 2.');
      setCurrentStep(2);
      return;
    }
    if (clientName.trim().length < 2) {
      setFormError('Por favor ingresá tu nombre y apellido.');
      return;
    }
    if (whatsapp.replace(/\D/g, '').length < 8) {
      setFormError('Ingresá un número de WhatsApp válido (mínimo 8 dígitos).');
      return;
    }

    setFormError('');
    setIsSubmittingBooking(true);

    const ticketId = `RC-${Math.floor(100000 + Math.random() * 900000)}`;
    const endMinutes = timeToMinutes(selectedTime) + summary.totalBlockMinutes + 120;
    const reviewTime = minutesToTime(endMinutes);

    const newRecord: AppointmentRecord = {
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
      reviewLoopScheduledAt: reviewTime,
    };

    const result = await addAppointment(newRecord);
    setIsSubmittingBooking(false);

    if (!result.ok) {
      setFormError(result.error || 'Ese horario acaba de ocuparse. Por favor elegí otro horario.');
      return;
    }

    const saved = result.appointment || newRecord;

    setConfirmedTicket({
      id: saved.id,
      clientName: saved.clientName,
      whatsapp: saved.whatsapp,
      date: saved.date,
      time: saved.startTime,
      services: saved.serviceNames,
      totalMinutes: summary.totalBlockMinutes,
      totalPrice: summary.totalPrice,
      paymentOption: saved.paymentOption,
      studioTitle: config.studioTitle,
      address: config.address,
      neighborhood: config.neighborhood,
      transferAlias: config.transferAlias,
    });
  };

  const matchedAppointments = lookupQuery.trim()
    ? findAppointmentsByQuery(lookupQuery, appointments)
    : [];

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupSearched(true);
    setRescheduleFeedback(null);
  };

  const handleOpenReschedule = (app: AppointmentRecord) => {
    setReschedulingTicketId(app.id);
    setRescheduleDate(app.date);
    setRescheduleTime(app.startTime);
    setRescheduleFeedback(null);
  };

  const handleConfirmReschedule = async (app: AppointmentRecord) => {
    if (!rescheduleDate || !rescheduleTime) return;
    const res = await rescheduleAppointment(app.id, rescheduleDate, rescheduleTime);
    if (!res.ok) {
      setRescheduleFeedback({
        type: 'err',
        text: res.error || 'No se pudo reprogramar en ese horario.',
      });
    } else {
      setRescheduleFeedback({
        type: 'ok',
        text: `Turno #${app.id} reprogramado con éxito para el ${rescheduleDate} a las ${rescheduleTime} hs.`,
      });
      setReschedulingTicketId(null);
    }
  };

  const buildTicketFromAppointment = (app: AppointmentRecord): ExportableTicketData => {
    const matchedPrices = app.serviceNames.reduce((acc, sName) => {
      const found = services.find((srv) => srv.name.toLowerCase() === sName.toLowerCase());
      return acc + (found ? found.price : 12000);
    }, 0);

    return {
      id: app.id,
      clientName: app.clientName,
      whatsapp: app.whatsapp,
      date: app.date,
      time: app.startTime,
      services: app.serviceNames,
      totalMinutes: app.serviceMinutes + app.bufferMinutes,
      totalPrice: matchedPrices,
      paymentOption: app.paymentOption,
      studioTitle: config.studioTitle,
      address: config.address,
      neighborhood: config.neighborhood,
      transferAlias: config.transferAlias,
    };
  };

  return (
    <div className="bg-[#FAF6EE] border border-[#C8BBA4] rounded-xl overflow-hidden shadow-[0_18px_44px_rgba(24,21,18,0.09)] relative">
      {/* Top River Plate Sash Accent Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#9E2A2B] via-[#B89146] to-[#9E2A2B]" />

      {/* Top Mode Bar: Reservar Lugar vs Consultar mi Turno */}
      <div className="px-4 sm:px-10 py-4 sm:py-5 border-b border-[#C8BBA4] flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 sm:gap-4 bg-[#EAE0CE]">
        <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setActiveMode('new_booking');
              setConfirmedTicket(null);
            }}
            className={`px-3 sm:px-4 py-2.5 rounded-lg text-[11px] sm:text-xs font-mono font-bold tracking-wider uppercase transition-all cursor-pointer text-center justify-center whitespace-nowrap ${
              activeMode === 'new_booking'
                ? 'bg-[#9E2A2B] text-[#FAF6EE] shadow-[0_3px_0_#5E1516]'
                : 'text-[#4F463B] hover:text-[#181512] border border-[#C8BBA4] bg-[#FAF6EE]'
            }`}
          >
            Nueva Reserva
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('lookup_ticket')}
            className={`px-3 sm:px-4 py-2.5 rounded-lg text-[11px] sm:text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap ${
              activeMode === 'lookup_ticket'
                ? 'bg-[#9E2A2B] text-[#FAF6EE] shadow-[0_3px_0_#5E1516]'
                : 'text-[#4F463B] hover:text-[#181512] border border-[#C8BBA4] bg-[#FAF6EE]'
            }`}
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span>Consultar turno</span>
          </button>
        </div>

        {/* Step Progress Indicator when in New Booking mode */}
        {activeMode === 'new_booking' && !confirmedTicket && (
          <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 sm:gap-5 text-[11px] sm:text-xs font-mono pt-1 lg:pt-0">
            {[
              { step: 1 as BookingStep, label: '01. Servicio' },
              { step: 2 as BookingStep, label: '02. Fecha y hora' },
              { step: 3 as BookingStep, label: '03. Tus datos' },
            ].map((item, idx) => {
              const isCurrent = currentStep === item.step;
              const isCompleted = currentStep > item.step;
              return (
                <React.Fragment key={item.step}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(item.step)}
                    className={`flex items-center gap-1 font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      isCurrent
                        ? 'text-[#181512] border-b-2 border-[#9E2A2B] pb-0.5'
                        : isCompleted
                        ? 'text-[#1F6E43]'
                        : 'text-[#6E6355]'
                    }`}
                  >
                    {isCompleted && <Check className="w-3.5 h-3.5 text-[#1F6E43]" />}
                    <span>{item.label}</span>
                  </button>
                  {idx < 2 && <span className="text-[#9C8F7A]" aria-hidden="true">/</span>}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Content Area with AnimatePresence */}
      <div className="p-4 sm:p-8 lg:p-12 text-[#181512]">
        <AnimatePresence mode="wait">
          {activeMode === 'lookup_ticket' ? (
            /* MODE B: CONSULTAR MI TURNO RESERVADO POR WHATSAPP */
            <motion.div
              key="lookup-mode"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#9E2A2B] font-bold block">
                  Gestión de Reservas Activas · {config.studioTitle}
                </span>
                <h3 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#181512]">
                  Consultá o reprogramá tu turno
                </h3>
                <p className="text-sm text-[#4F463B]">
                  Ingresá tu número de WhatsApp, tu nombre o el código de tu comprobante para ver el
                  detalle de tu reserva en {config.address}, Venado Tuerto.
                </p>
              </div>

              <form onSubmit={handleLookupSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#5C5346] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={lookupQuery}
                    onChange={(e) => {
                      setLookupQuery(e.target.value);
                      setLookupSearched(true);
                    }}
                    placeholder="Ej.: 3462 521984, Ignacio Varela o TK-841920"
                    aria-label="Buscar turno por número de WhatsApp o nombre"
                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#EAE0CE] border border-[#C8BBA4] text-[#181512] text-sm focus:outline-none focus:border-[#9E2A2B]"
                  />
                </div>
                <button
                  type="submit"
                  className="h-12 px-6 rounded-xl bg-[#9E2A2B] hover:bg-[#822021] text-[#FAF6EE] text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap"
                >
                  Buscar turno
                </button>
              </form>

              <div className="flex flex-wrap items-center gap-2 text-xs text-[#5C5346]">
                <span>Consultas rápidas de ejemplo:</span>
                {appointments.slice(0, 2).map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => {
                      setLookupQuery(sample.whatsapp);
                      setLookupSearched(true);
                    }}
                    className="underline hover:text-[#9E2A2B] cursor-pointer text-[#4F463B]"
                  >
                    {sample.clientName} ({sample.whatsapp})
                  </button>
                ))}
              </div>

              {lookupSearched && lookupQuery.trim() !== '' && (
                <div className="space-y-4 pt-2">
                  {matchedAppointments.length === 0 ? (
                    <div className="p-6 rounded-xl bg-[#EAE0CE] border border-[#D5C9B4] text-center space-y-3">
                      <p className="text-sm font-bold text-[#181512]">
                        No encontramos un turno activo con “{lookupQuery}”.
                      </p>
                      <p className="text-xs text-[#5C5346]">
                        Verificá los últimos dígitos de tu WhatsApp o reservá un nuevo horario en el
                        estudio.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveMode('new_booking')}
                        className="px-5 py-2.5 rounded-lg bg-[#9E2A2B] text-[#FAF6EE] text-xs font-mono font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Ir a reservar turno
                      </button>
                    </div>
                  ) : (
                    matchedAppointments.map((app) => {
                      const ticketObj = buildTicketFromAppointment(app);
                      const isReschedulingThis = reschedulingTicketId === app.id;
                      const rescheduleSlots = isReschedulingThis
                        ? getAvailableTimeSlots(
                            rescheduleDate,
                            app.serviceMinutes + app.bufferMinutes,
                            appointments.filter((a) => a.id !== app.id),
                            config.openingHour,
                            config.closingHour,
                            blockedSlots,
                            config.openDays
                          )
                        : [];
                      return (
                        <div
                          key={app.id}
                          className="p-6 rounded-xl bg-[#EAE0CE] border border-[#C8BBA4] space-y-5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#D5C9B4]">
                            <div className="flex items-center gap-3 text-xs text-[#10B981] font-mono font-bold">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Turno Confirmado</span>
                              <span>·</span>
                              <span className="text-[#181512]">#{app.id}</span>
                            </div>
                            <span className="text-xs text-[#5C5346] font-mono">
                              {config.address} · {config.neighborhood}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-xs text-[#5C5346] block">Cliente</span>
                              <span className="font-bold text-[#181512] block mt-0.5">
                                {app.clientName}
                              </span>
                              <span className="text-xs text-[#5C5346] font-mono">
                                {app.whatsapp}
                              </span>
                            </div>
                            <div>
                              <span className="text-xs text-[#5C5346] block">Fecha y horario</span>
                              <span className="font-bold text-[#9E2A2B] font-mono block mt-0.5">
                                {app.date} · {app.startTime} hs
                              </span>
                              <span className="text-xs text-[#5C5346]">
                                Duración: {app.serviceMinutes} min
                              </span>
                            </div>
                            <div>
                              <span className="text-xs text-[#5C5346] block">Servicio</span>
                              <span className="font-bold text-[#181512] block mt-0.5">
                                {app.serviceNames.join(' + ')}
                              </span>
                            </div>
                          </div>

                          {rescheduleFeedback && (
                            <div
                              className={`p-3 rounded-lg text-xs border font-mono ${
                                rescheduleFeedback.type === 'ok'
                                  ? 'bg-[#10B981]/15 border-[#10B981] text-[#181512]'
                                  : 'bg-[#9E2A2B]/15 border-[#9E2A2B] text-[#F43F5E]'
                              }`}
                            >
                              {rescheduleFeedback.text}
                            </div>
                          )}

                          {isReschedulingThis && (
                            <div className="p-4 rounded-xl bg-[#FAF6EE] border border-[#C8BBA4] space-y-3 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#181512] uppercase tracking-wider font-mono">
                                  Elegí nueva fecha y horario disponible
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setReschedulingTicketId(null)}
                                  className="text-[#5C5346] hover:text-[#181512] cursor-pointer"
                                >
                                  Cancelar
                                </button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[#5C5346] mb-1">Nueva Fecha</label>
                                  <input
                                    type="date"
                                    value={rescheduleDate}
                                    min={todayISO}
                                    onChange={(e) => setRescheduleDate(e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg bg-[#EAE0CE] border border-[#C8BBA4] text-[#181512]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[#5C5346] mb-1">Nuevo Horario</label>
                                  <select
                                    value={rescheduleTime}
                                    onChange={(e) => setRescheduleTime(e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg bg-[#EAE0CE] border border-[#C8BBA4] text-[#181512]"
                                  >
                                    {rescheduleSlots
                                      .filter((s) => s.available)
                                      .map((s) => (
                                        <option key={s.time} value={s.time}>
                                          {s.time} hs (Disponible)
                                        </option>
                                      ))}
                                  </select>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleConfirmReschedule(app)}
                                className="w-full py-2.5 rounded-lg bg-[#9E2A2B] hover:bg-[#822021] text-[#FAF6EE] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                              >
                                Confirmar nuevo horario
                              </button>
                            </div>
                          )}

                          <div className="pt-3 border-t border-[#D5C9B4] flex flex-wrap items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => downloadThermalTicketPNG(ticketObj)}
                              className="px-3.5 py-2 rounded-lg bg-[#9E2A2B] hover:bg-[#822021] text-[#FAF6EE] text-xs font-mono font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Guardar Comprobante PNG</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => downloadAppointmentICS(ticketObj)}
                              className="px-3.5 py-2 rounded-lg border border-[#C8BBA4] hover:border-white text-[#181512] text-xs font-mono font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <CalendarPlus className="w-3.5 h-3.5 text-[#9E2A2B]" />
                              <span>Calendario (.ics)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenReschedule(app)}
                              className="px-3.5 py-2 rounded-lg border border-[#C8BBA4] hover:border-[#9E2A2B] text-[#181512] text-xs font-mono font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-[#9E2A2B]" />
                              <span>Cambiar Horario</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </motion.div>
          ) : confirmedTicket ? (
            /* CONFIRMED BOOKING VOUCHER VIEW */
            <motion.div
              key="confirmed-voucher"
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28 }}
              className="relative max-w-2xl mx-auto bg-[#EAE0CE] border-2 border-[#9E2A2B]/60 rounded-2xl p-8 sm:p-10 space-y-6 shadow-2xl overflow-hidden"
            >
              <motion.div
                initial={{ opacity: 0, scale: 1.5, rotate: -22 }}
                animate={{ opacity: 1, scale: 1, rotate: -10 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 16,
                  delay: 0.15,
                }}
                aria-hidden="true"
                className="hidden sm:flex absolute top-6 right-6 w-24 h-24 rounded-full border-2 border-[#9E2A2B] text-[#9E2A2B] flex-col items-center justify-center text-center p-2 pointer-events-none select-none bg-[#FAF6EE]/90"
              >
                <span className="text-[8px] font-mono uppercase tracking-widest leading-tight">
                  Rodrigo Cutsss
                </span>
                <span className="font-display font-black uppercase text-xs text-[#181512] my-0.5">
                  Confirmado
                </span>
                <span className="text-[7px] font-mono uppercase tracking-wider text-[#5C5346]">
                  Venado Tuerto
                </span>
              </motion.div>

              <div className="text-center space-y-2 pb-6 border-b border-[#D5C9B4]">
                <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#10B981] font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Turno Confirmado · {config.studioTitle}</span>
                </div>
                <h3 className="font-display text-3xl sm:text-4xl font-black uppercase text-[#181512]">
                  Te esperamos, {confirmedTicket.clientName}
                </h3>
                <p className="text-xs text-[#5C5346] font-mono">
                  {confirmedTicket.address} · {confirmedTicket.neighborhood} · Ticket #
                  {confirmedTicket.id}
                </p>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm py-2 border-b border-[#D5C9B4] pb-6">
                <div>
                  <dt className="text-xs text-[#5C5346] uppercase tracking-wider font-mono">
                    Fecha y Hora
                  </dt>
                  <dd className="font-mono font-bold text-base text-[#181512] mt-0.5 tabular-nums">
                    {confirmedTicket.date} · {confirmedTicket.time} hs
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#5C5346] uppercase tracking-wider font-mono">
                    Duración Estimada
                  </dt>
                  <dd className="font-mono font-bold text-base text-[#181512] mt-0.5 tabular-nums">
                    {confirmedTicket.totalMinutes} minutos
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-[#5C5346] uppercase tracking-wider font-mono">
                    Servicios Seleccionados
                  </dt>
                  <dd className="font-bold text-[#181512] mt-0.5">
                    {confirmedTicket.services.join(' + ')}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#5C5346] uppercase tracking-wider font-mono">
                    Modalidad
                  </dt>
                  <dd className="text-zinc-200 mt-0.5">
                    {confirmedTicket.paymentOption === 'deposit'
                      ? `Seña 30% (Alias: ${confirmedTicket.transferAlias})`
                      : 'Abono en el estudio al finalizar'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#5C5346] uppercase tracking-wider font-mono">
                    Valor Total
                  </dt>
                  <dd className="font-mono font-bold text-lg text-[#9E2A2B] mt-0.5 tabular-nums">
                    {formatPriceARS(confirmedTicket.totalPrice || summary.totalPrice)}
                  </dd>
                </div>
              </dl>

              {downloadedFeedback && (
                <div className="p-3 rounded-lg bg-[#10B981]/15 border border-[#10B981] text-[#181512] text-xs text-center font-mono">
                  {downloadedFeedback}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    downloadThermalTicketPNG(confirmedTicket);
                    setDownloadedFeedback('Comprobante descargado como imagen PNG.');
                  }}
                  className="py-3 px-4 rounded-xl bg-[#9E2A2B] hover:bg-[#822021] text-[#FAF6EE] text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Guardar Comprobante (PNG)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    downloadAppointmentICS(confirmedTicket);
                    setDownloadedFeedback('Archivo de calendario (.ics) descargado.');
                  }}
                  className="py-3 px-4 rounded-xl border border-[#C8BBA4] hover:border-white text-[#181512] text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <CalendarPlus className="w-4 h-4 text-[#9E2A2B]" />
                  <span>Agendar en Calendario (.ics)</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <a
                  href={generateGoogleCalendarUrl(confirmedTicket)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#5C5346] hover:text-[#181512] underline font-mono"
                >
                  Abrir directamente en Google Calendar
                </a>

                <a
                  href={`${waInfo.url}?text=${encodeURIComponent(
                    `Hola ${config.authorName}! Reservé mi turno (#${confirmedTicket.id}) para el ${confirmedTicket.date} a las ${confirmedTicket.time} hs (${confirmedTicket.services.join(' + ')}) a nombre de ${confirmedTicket.clientName}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-zinc-950 text-xs font-mono font-bold uppercase tracking-wider transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar confirmación por WhatsApp</span>
                </a>
              </div>

              <div className="pt-4 border-t border-[#D5C9B4] text-center">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmedTicket(null);
                    setSelectedTime('');
                    setCurrentStep(1);
                  }}
                  className="text-xs text-[#5C5346] hover:text-[#181512] underline cursor-pointer font-mono"
                >
                  Realizar otra reserva
                </button>
              </div>
            </motion.div>
          ) : (
            /* 3-STEP WIZARD FLOW WITH ANIMATEPRESENCE */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left 8 Cols: Active Step Viewport */}
              <div className="lg:col-span-8">
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div
                      key="step-1-services"
                      initial={{ opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 14 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-6"
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-mono uppercase tracking-widest text-[#9E2A2B] font-bold block">
                          Paso 01 de 03 · {config.studioTitle}
                        </span>
                        <h3 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#181512]">
                          Elegí tu servicio
                        </h3>
                        <p className="text-sm text-[#4F463B]">
                          Seleccioná un servicio individual o combiná tu corte con perfilado de barba
                          o nutrición capilar.
                        </p>
                      </div>

                      <div className="divide-y divide-[#D5C9B4] border border-[#D5C9B4] rounded-2xl overflow-hidden bg-[#EAE0CE]">
                        {visibleServices.map((service) => {
                          const isSelected = selectedServiceIds.includes(service.id);
                          return (
                            <button
                              key={service.id}
                              type="button"
                              onClick={() => toggleSelectService(service.id)}
                              className={`w-full text-left p-5 sm:p-6 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer ${
                                isSelected
                                  ? 'bg-[#9E2A2B]/15 border-l-4 border-l-[#9E2A2B] text-[#181512]'
                                  : 'hover:bg-[#EFE7D6] text-[#181512]'
                              }`}
                            >
                              <div className="space-y-1.5 pr-4">
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                                      isSelected
                                        ? 'bg-[#9E2A2B] text-[#FAF6EE]'
                                        : 'bg-[#FAF6EE] border border-[#C8BBA4] text-[#9E2A2B]'
                                    }`}
                                  >
                                    {service.index}
                                  </span>
                                  <h4 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#181512]">
                                    {service.name}
                                  </h4>
                                </div>
                                <p className="text-xs sm:text-sm leading-relaxed max-w-xl text-[#4F463B]">
                                  {service.shortDescription}
                                </p>
                              </div>

                              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#D5C9B4]">
                                <div className="text-left sm:text-right">
                                  <span className="font-mono text-base font-bold block tabular-nums text-[#181512]">
                                    {formatPriceARS(service.price)}
                                  </span>
                                  <span className="text-xs block tabular-nums text-[#5C5346] font-mono">
                                    {service.durationMinutes} min
                                  </span>
                                </div>
                                <span
                                  className={`text-xs font-mono uppercase tracking-wider font-bold px-3 py-1 rounded border ${
                                    isSelected
                                      ? 'border-[#9E2A2B] bg-[#9E2A2B] text-[#FAF6EE]'
                                      : 'border-[#C8BBA4] text-[#4F463B]'
                                  }`}
                                >
                                  {isSelected ? 'Seleccionado ✓' : 'Seleccionar'}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {formError && (
                        <p className="text-xs text-[#F43F5E] font-mono font-bold">{formError}</p>
                      )}

                      <div className="flex items-center justify-end pt-2">
                        <button
                          type="button"
                          onClick={handleAdvanceToStep2}
                          className="px-7 py-3.5 rounded-xl bg-[#9E2A2B] hover:bg-[#822021] text-[#FAF6EE] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-[0_10px_25px_rgba(225,29,72,0.35)] cursor-pointer"
                        >
                          <span>Continuar a fecha y hora</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      key="step-2-datetime"
                      initial={{ opacity: 0, x: 14 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -14 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-6"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                        <div className="space-y-1">
                          <span className="text-xs font-mono uppercase tracking-widest text-[#9E2A2B] font-bold block">
                            Paso 02 de 03
                          </span>
                          <h3 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#181512]">
                            Elegí tu día y horario disponible
                          </h3>
                        </div>
                        <span className="text-xs text-[#5C5346] font-mono tabular-nums">
                          {availableSlotsCount} horarios disponibles para el {selectedDate}
                        </span>
                      </div>

                      {/* Date Selection Bar */}
                      <div className="p-5 rounded-2xl bg-[#EAE0CE] border border-[#D5C9B4] space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <label
                            htmlFor="atelier-booking-date"
                            className="text-xs font-mono uppercase tracking-wider text-[#4F463B] font-bold flex items-center gap-2"
                          >
                            <Calendar className="w-4 h-4 text-[#9E2A2B]" />
                            <span>Fecha del turno:</span>
                          </label>
                          <div className="flex items-center gap-2">
                            {[
                              { label: 'Hoy', iso: todayISO },
                              { label: 'Mañana', iso: tomorrowISO },
                              { label: 'Pasado', iso: dayAfterISO },
                            ].map((preset) => (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => {
                                  setSelectedDate(preset.iso);
                                  setSelectedTime('');
                                }}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                                  selectedDate === preset.iso
                                    ? 'bg-[#9E2A2B] text-[#FAF6EE]'
                                    : 'bg-[#FAF6EE] text-[#5C5346] border border-[#D5C9B4] hover:text-[#181512]'
                                }`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <input
                          id="atelier-booking-date"
                          type="date"
                          value={selectedDate}
                          min={todayISO}
                          onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setSelectedTime('');
                          }}
                          className="w-full h-11 px-4 rounded-xl bg-[#FAF6EE] border border-[#C8BBA4] text-[#181512] font-mono text-sm focus:outline-none focus:border-[#9E2A2B]"
                        />
                      </div>

                      {/* Time Slot Grid */}
                      <div className="p-5 rounded-2xl bg-[#EAE0CE] border border-[#D5C9B4] space-y-4">
                        <div className="flex items-center justify-between text-xs font-mono text-[#5C5346]">
                          <span className="uppercase tracking-wider font-bold flex items-center gap-2 text-zinc-200">
                            <Clock className="w-4 h-4 text-[#9E2A2B]" />
                            <span>Horarios en {config.studioTitle} ({selectedDate}):</span>
                          </span>
                          <span>Bloque: {summary.totalBlockMinutes} min</span>
                        </div>

                        {slots.length === 0 ? (
                          <p className="text-sm text-[#F43F5E] py-6 text-center font-mono">
                            El estudio permanece cerrado en la fecha seleccionada. Por favor elegí
                            otro día hábil.
                          </p>
                        ) : (
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                            {slots.map((slot, slotIdx) => {
                              const isSelected = selectedTime === slot.time;
                              return (
                                <motion.button
                                  key={`${selectedDate}-${slot.time}`}
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.18, delay: slotIdx * 0.014 }}
                                  type="button"
                                  disabled={!slot.available}
                                  onClick={() => setSelectedTime(slot.time)}
                                  className={`py-3 px-2 rounded-lg font-mono text-xs transition-all tabular-nums ${
                                    !slot.available
                                      ? 'bg-[#FAF6EE]/60 text-zinc-600 line-through cursor-not-allowed border border-[#D5C9B4]/50'
                                      : isSelected
                                      ? 'bg-[#9E2A2B] text-[#FAF6EE] font-bold shadow-[0_6px_16px_rgba(225,29,72,0.4)] cursor-pointer'
                                      : 'bg-[#FAF6EE] hover:border-[#9E2A2B] text-[#181512] border border-[#C8BBA4] cursor-pointer'
                                  }`}
                                >
                                  {slot.time} hs
                                </motion.button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {formError && (
                        <p className="text-xs text-[#F43F5E] font-mono font-bold">{formError}</p>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="px-5 py-3 rounded-xl border border-[#C8BBA4] hover:border-white text-[#181512] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Volver a servicios</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleAdvanceToStep3}
                          className="px-7 py-3.5 rounded-xl bg-[#9E2A2B] hover:bg-[#822021] text-[#FAF6EE] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-[0_10px_25px_rgba(225,29,72,0.35)] cursor-pointer"
                        >
                          <span>Continuar a tus datos</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 3 && (
                    <motion.form
                      key="step-3-client"
                      onSubmit={handleConfirmBooking}
                      initial={{ opacity: 0, x: 14 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -14 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-6"
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-mono uppercase tracking-widest text-[#9E2A2B] font-bold block">
                          Paso 03 de 03
                        </span>
                        <h3 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#181512]">
                          Completá tus datos para confirmar
                        </h3>
                        <p className="text-sm text-[#4F463B]">
                          Tu lugar quedará reservado para el{' '}
                          <strong className="text-[#181512]">{selectedDate}</strong> a las{' '}
                          <strong className="text-[#9E2A2B]">{selectedTime} hs</strong> en{' '}
                          {config.address}.
                        </p>
                      </div>

                      <div className="p-6 rounded-2xl bg-[#EAE0CE] border border-[#D5C9B4] space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="atelier-client-name"
                              className="block text-xs font-mono uppercase tracking-wider text-[#4F463B] font-bold mb-2"
                            >
                              Tu Nombre y Apellido
                            </label>
                            <input
                              id="atelier-client-name"
                              type="text"
                              required
                              placeholder="Ej. Lucas Santoro"
                              value={clientName}
                              onChange={(e) => setClientName(e.target.value)}
                              className="w-full h-11 px-4 rounded-xl bg-[#FAF6EE] border border-[#C8BBA4] text-[#181512] text-sm focus:outline-none focus:border-[#9E2A2B]"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="atelier-client-whatsapp"
                              className="block text-xs font-mono uppercase tracking-wider text-[#4F463B] font-bold mb-2"
                            >
                              Tu WhatsApp (sin 0 ni 15)
                            </label>
                            <input
                              id="atelier-client-whatsapp"
                              type="tel"
                              required
                              placeholder="Ej. 3462 554421"
                              value={whatsapp}
                              onChange={(e) => setWhatsapp(e.target.value)}
                              className="w-full h-11 px-4 rounded-xl bg-[#FAF6EE] border border-[#C8BBA4] text-[#181512] text-sm font-mono focus:outline-none focus:border-[#9E2A2B]"
                            />
                          </div>
                        </div>

                        <div className="space-y-2.5 pt-2 border-t border-[#D5C9B4]">
                          <span className="block text-xs font-mono uppercase tracking-wider text-[#4F463B] font-bold">
                            Modalidad de reserva:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <label
                              className={`p-4 rounded-xl border cursor-pointer transition-colors flex items-start gap-3 ${
                                paymentOption === 'deposit'
                                  ? 'bg-[#9E2A2B]/15 border-[#9E2A2B]'
                                  : 'bg-[#FAF6EE] border-[#D5C9B4]'
                              }`}
                            >
                              <input
                                type="radio"
                                name="paymentOption"
                                checked={paymentOption === 'deposit'}
                                onChange={() => setPaymentOption('deposit')}
                                className="mt-0.5 accent-[#9E2A2B]"
                              />
                              <div>
                                <span className="font-bold text-[#181512] block">
                                  Seña del {config.depositPercentage}% (
                                  {formatPriceARS(summary.depositAmount)})
                                </span>
                                <span className="text-[#5C5346] block mt-0.5">
                                  Transferencia al alias{' '}
                                  <strong className="text-[#181512]">{config.transferAlias}</strong>
                                </span>
                              </div>
                            </label>

                            <label
                              className={`p-4 rounded-xl border cursor-pointer transition-colors flex items-start gap-3 ${
                                paymentOption === 'commitment'
                                  ? 'bg-[#9E2A2B]/15 border-[#9E2A2B]'
                                  : 'bg-[#FAF6EE] border-[#D5C9B4]'
                              }`}
                            >
                              <input
                                type="radio"
                                name="paymentOption"
                                checked={paymentOption === 'commitment'}
                                onChange={() => setPaymentOption('commitment')}
                                className="mt-0.5 accent-[#9E2A2B]"
                              />
                              <div>
                                <span className="font-bold text-[#181512] block">
                                  Abonar en el estudio ({formatPriceARS(summary.totalPrice)})
                                </span>
                                <span className="text-[#5C5346] block mt-0.5">
                                  Compromiso de asistencia puntual (tolerancia 10 min).
                                </span>
                              </div>
                            </label>
                          </div>

                          {paymentOption === 'deposit' && (
                            <div className="p-3 rounded-xl bg-[#FAF6EE] border border-[#D5C9B4] flex items-center justify-between text-xs font-mono">
                              <span className="text-[#4F463B]">
                                Alias de transferencia:{' '}
                                <strong className="text-[#181512]">{config.transferAlias}</strong>
                              </span>
                              <button
                                type="button"
                                onClick={handleCopyAlias}
                                className="inline-flex items-center gap-1 text-[#9E2A2B] hover:text-[#181512] font-bold cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>{copiedAlias ? 'Copiado ✓' : 'Copiar alias'}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {formError && (
                        <p className="text-xs text-[#F43F5E] font-mono font-bold">{formError}</p>
                      )}

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="px-5 py-3 rounded-xl border border-[#C8BBA4] hover:border-white text-[#181512] text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Cambiar horario</span>
                        </button>

                        <button
                          type="submit"
                          disabled={isSubmittingBooking}
                          className="px-8 py-4 rounded-xl bg-[#9E2A2B] hover:bg-[#822021] text-[#FAF6EE] text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-[0_10px_25px_rgba(225,29,72,0.4)] cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          <span>
                            {isSubmittingBooking
                              ? 'Confirmando reserva...'
                              : 'Confirmar reserva ahora'}
                          </span>
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

              {/* Right 4 Cols: Live Summary Ticket */}
              <aside className="lg:col-span-4 bg-[#EAE0CE] border-2 border-[#C8BBA4] rounded-2xl p-6 sm:p-7 space-y-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-80">
                  <div className="w-24 h-3 bg-[#9E2A2B] rotate-45 translate-x-4 translate-y-2" />
                </div>

                <div className="pb-4 border-b border-[#D5C9B4]">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#9E2A2B] font-bold block">
                    Ticket de Reserva en Vivo
                  </span>
                  <h4 className="font-display text-2xl font-black uppercase text-[#181512] mt-0.5">
                    {config.studioTitle}
                  </h4>
                  <p className="text-xs text-[#5C5346] flex items-center gap-1.5 mt-1 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-[#9E2A2B]" />
                    <span>
                      {config.address}, {config.neighborhood}
                    </span>
                  </p>
                </div>

                <dl className="space-y-3 text-xs font-mono">
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-[#5C5346]">Servicio(s):</dt>
                    <dd className="text-right font-bold text-[#181512]">
                      {summary.selectedServices.length > 0
                        ? summary.selectedServices.map((s) => s.name).join(' + ')
                        : 'Sin seleccionar'}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-[#5C5346]">Fecha elegida:</dt>
                    <dd className="text-[#181512] tabular-nums">{selectedDate}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-[#5C5346]">Horario:</dt>
                    <dd className="font-bold text-[#9E2A2B] tabular-nums">
                      {selectedTime ? `${selectedTime} hs` : 'Por definir en Paso 02'}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-[#5C5346]">Tiempo dedicado:</dt>
                    <dd className="text-[#181512] tabular-nums">{summary.serviceMinutes} min</dd>
                  </div>
                </dl>

                <div className="pt-4 border-t border-[#D5C9B4] flex items-baseline justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#5C5346] font-bold">
                    Valor Total
                  </span>
                  <span className="font-mono text-2xl font-black text-[#181512] tabular-nums">
                    {formatPriceARS(summary.totalPrice)}
                  </span>
                </div>

                <p className="text-[11px] text-[#5C5346] leading-relaxed pt-2 border-t border-[#D5C9B4]">
                  Atención individual uno a uno sin esperas. Al confirmar recibís tu ticket digital
                  PNG y el recordatorio para tu calendario.
                </p>
              </aside>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
