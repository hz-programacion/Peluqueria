import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Plus,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Phone,
  Scissors,
  FileText,
  UserCheck,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Volume2,
  VolumeX,
  AlertTriangle,
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import {
  timeToMinutes,
  minutesToTime,
  getTodayLocalISO,
  resolveWhatsAppInfo,
} from '../utils/bookingEngine';
import { ClientFormulaNote, AppointmentRecord } from '../data/studioData';
import { RetroRiverCrestBadge } from '../components/RetroPaperBanda';

export const ChairModePage: React.FC = () => {
  const {
    config,
    appointments,
    clientNotes,
    saveClientNote,
    updateAppointmentStatus,
    navigateTo,
  } = useStudio();

  const todayISO = getTodayLocalISO();

  // Filter today's appointments sorted by start time
  const todayAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.date === todayISO)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  }, [appointments, todayISO]);

  // Current active appointment on the chair (or first non-cancelled / non-completed today)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  const activeAppointment = useMemo(() => {
    if (selectedAppointmentId) {
      const found = todayAppointments.find((a) => a.id === selectedAppointmentId);
      if (found) return found;
    }
    // Default to the first confirmed or in-progress appointment
    return (
      todayAppointments.find((a) => a.status === 'confirmed') ||
      todayAppointments[0] ||
      null
    );
  }, [todayAppointments, selectedAppointmentId]);

  // Next appointment in queue
  const nextAppointment = useMemo(() => {
    if (!activeAppointment) return null;
    return todayAppointments.find(
      (a) =>
        a.id !== activeAppointment.id &&
        a.status === 'confirmed' &&
        timeToMinutes(a.startTime) >= timeToMinutes(activeAppointment.startTime)
    );
  }, [todayAppointments, activeAppointment]);

  // Client formula CRM notes for active client
  const activeClientNote = useMemo(() => {
    if (!activeAppointment) return null;
    const cleanWa = activeAppointment.whatsapp.replace(/\D/g, '');
    return clientNotes.find(
      (n) =>
        n.clientName.toLowerCase() === activeAppointment.clientName.toLowerCase() ||
        (cleanWa && n.whatsapp.replace(/\D/g, '') === cleanWa)
    );
  }, [activeAppointment, clientNotes]);

  // Timer state
  const totalSessionDurationSeconds = useMemo(() => {
    if (!activeAppointment) return 45 * 60;
    return (activeAppointment.serviceMinutes || 45) * 60;
  }, [activeAppointment]);

  const [secondsRemaining, setSecondsRemaining] = useState<number>(totalSessionDurationSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Sync timer when active appointment changes
  useEffect(() => {
    setSecondsRemaining(totalSessionDurationSeconds);
    setIsTimerRunning(false);
  }, [activeAppointment?.id, totalSessionDurationSeconds]);

  // Live countdown interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (secondsRemaining === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      // Play brief audio chime or beep if sound enabled
      if (soundEnabled && typeof window !== 'undefined' && 'AudioContext' in window) {
        try {
          const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 587.33; // D5
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
          osc.start();
          osc.stop(ctx.currentTime + 0.8);
        } catch {
          // Audio autoplay restricted
        }
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, secondsRemaining, soundEnabled]);

  // Editing CRM note modal
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [formulaInput, setFormulaInput] = useState('');
  const [hairTypeInput, setHairTypeInput] = useState('');
  const [productsInput, setProductsInput] = useState('');

  const handleOpenEditNote = () => {
    if (activeClientNote) {
      setFormulaInput(activeClientNote.formulaSpec || '');
      setHairTypeInput(activeClientNote.hairType || '');
      setProductsInput(activeClientNote.preferredProducts || '');
    } else {
      setFormulaInput('Low Taper fade al 0.0mm con shaver, cúspide a tijera texturizada');
      setHairTypeInput('Cabello grueso con remolino en coronilla');
      setProductsInput('Cera mate al agua fijación media');
    }
    setIsEditingNote(true);
  };

  const handleSaveNote = () => {
    if (!activeAppointment) return;
    const noteId = activeClientNote?.id || `note-${Date.now()}`;
    const newNote: ClientFormulaNote = {
      id: noteId,
      clientName: activeAppointment.clientName,
      whatsapp: activeAppointment.whatsapp,
      formulaSpec: formulaInput,
      hairType: hairTypeInput,
      preferredProducts: productsInput,
      updatedAt: todayISO,
    };
    saveClientNote(newNote);
    setIsEditingNote(false);
  };

  const handleCompleteSession = () => {
    if (!activeAppointment) return;
    updateAppointmentStatus(activeAppointment.id, 'completed');
    setIsTimerRunning(false);
  };

  const handleNoShow = () => {
    if (!activeAppointment) return;
    if (confirm(`¿Marcar a ${activeAppointment.clientName} como ausente / cancelado?`)) {
      updateAppointmentStatus(activeAppointment.id, 'cancelled');
      setIsTimerRunning(false);
    }
  };

  const handleAddCourtesyTime = (minutes: number) => {
    setSecondsRemaining((prev) => prev + minutes * 60);
  };

  const formatTimerDigits = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progressPercent = Math.min(
    100,
    Math.max(0, ((totalSessionDurationSeconds - secondsRemaining) / totalSessionDurationSeconds) * 100)
  );

  return (
    <div className="min-h-screen bg-[#141416] text-[#FAF6EE] pb-12 select-none">
      {/* Top Ergonomic Command Bar */}
      <div className="bg-[#1C1C20] border-b border-[#2C2C33] px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <RetroRiverCrestBadge size="sm" monogram={config.brandMonogram} />
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D4AF37] font-bold block leading-none">
              Modo Silla · Sillón de Corte
            </span>
            <span className="font-display text-sm font-bold text-[#FAF6EE]">
              {config.authorName || 'Rodrigo'} · {config.studioTitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-[#27272D] text-[#D4AF37] hover:text-[#FAF6EE] transition-colors"
            title={soundEnabled ? 'Silenciar campanada' : 'Activar campanada'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => navigateTo('admin')}
            className="px-3 py-1.5 rounded-lg bg-[#27272D] hover:bg-[#34343C] text-xs font-mono font-semibold text-[#C5BBAA] transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4 sm:pt-6 space-y-4">
        {/* Active Chair Session Card */}
        {activeAppointment ? (
          <div className="bg-[#1C1C20] border border-[#3A3A44] rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
            {/* Top status indicator strip */}
            <div
              className={`h-1.5 absolute top-0 inset-x-0 ${
                activeAppointment.status === 'completed'
                  ? 'bg-[#1F6E43]'
                  : isTimerRunning
                    ? 'bg-[#D4AF37]'
                    : 'bg-[#9E2A2B]'
              }`}
            />

            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                  Cliente en Sillón
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#FAF6EE] leading-tight">
                  {activeAppointment.clientName}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs font-mono text-[#A89E8C]">
                  <span>Horario: {activeAppointment.startTime} hs</span>
                  <span>•</span>
                  <span>{activeAppointment.serviceNames.join(' + ')}</span>
                </div>
              </div>

              {/* Direct call / WhatsApp for client */}
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${activeAppointment.whatsapp.replace(/\D/g, '')}`}
                  className="w-10 h-10 rounded-xl bg-[#27272D] text-[#FAF6EE] hover:bg-[#34343C] flex items-center justify-center transition-colors shadow-xs"
                  title="Llamar"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <a
                  href={`https://wa.me/${activeAppointment.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-[#1F6E43] text-[#FAF6EE] hover:bg-[#175634] flex items-center justify-center transition-colors shadow-xs"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Session Countdown Timer */}
            <div className="bg-[#141416] border border-[#2D2D36] rounded-xl p-4 sm:p-5 text-center my-4 relative">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8E877A] block mb-1">
                Tiempo Restante de Sesión
              </span>

              {/* Big Digits Display */}
              <div
                className={`font-mono text-5xl sm:text-6xl font-black tracking-tight ${
                  secondsRemaining < 300
                    ? 'text-[#C5221F]'
                    : secondsRemaining < 600
                      ? 'text-[#E5A93C]'
                      : 'text-[#FAF6EE]'
                }`}
              >
                {formatTimerDigits(secondsRemaining)}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#27272D] h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-[#9E2A2B] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Timer Controls */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                    isTimerRunning
                      ? 'bg-[#C5221F] hover:bg-[#A51D24] text-[#FAF6EE]'
                      : 'bg-[#D4AF37] hover:bg-[#B89146] text-[#141416]'
                  }`}
                >
                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isTimerRunning ? 'Pausar' : 'Iniciar Reloj'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddCourtesyTime(5)}
                  className="px-3 py-2.5 rounded-xl bg-[#27272D] hover:bg-[#34343C] text-xs font-mono font-semibold text-[#FAF6EE] cursor-pointer"
                  title="Sumar 5 minutos"
                >
                  +5m
                </button>

                <button
                  type="button"
                  onClick={() => handleAddCourtesyTime(10)}
                  className="px-3 py-2.5 rounded-xl bg-[#27272D] hover:bg-[#34343C] text-xs font-mono font-semibold text-[#FAF6EE] cursor-pointer"
                  title="Sumar 10 minutos cortesía"
                >
                  +10m
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsTimerRunning(false);
                    setSecondsRemaining(totalSessionDurationSeconds);
                  }}
                  className="p-2.5 rounded-xl bg-[#27272D] hover:bg-[#34343C] text-[#8E877A] hover:text-[#FAF6EE] cursor-pointer"
                  title="Reiniciar cronómetro"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Technical CRM Formula Card */}
            <div className="bg-[#24242A] border border-[#34343E] rounded-xl p-4 mt-4">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#D4AF37]">
                  <FileText className="w-4 h-4" />
                  <span>Ficha Técnica Personal</span>
                </div>
                <button
                  type="button"
                  onClick={handleOpenEditNote}
                  className="text-xs font-mono font-semibold text-[#D4AF37] hover:underline cursor-pointer"
                >
                  {activeClientNote ? 'Editar Notas' : '+ Crear Ficha'}
                </button>
              </div>

              {activeClientNote ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#1C1C20] p-2.5 rounded-lg border border-[#31313A]">
                    <span className="text-[10px] font-mono uppercase text-[#8E877A] block">
                      Fórmula de Corte
                    </span>
                    <span className="text-[#FAF6EE] font-medium">{activeClientNote.formulaSpec}</span>
                  </div>

                  <div className="bg-[#1C1C20] p-2.5 rounded-lg border border-[#31313A]">
                    <span className="text-[10px] font-mono uppercase text-[#8E877A] block">
                      Tipo de Pelo &amp; Remolinos
                    </span>
                    <span className="text-[#FAF6EE] font-medium">
                      {activeClientNote.hairType}
                    </span>
                  </div>

                  <div className="bg-[#1C1C20] p-2.5 rounded-lg border border-[#31313A] sm:col-span-2">
                    <span className="text-[10px] font-mono uppercase text-[#8E877A] block">
                      Producto Preferido &amp; Acabado
                    </span>
                    <span className="text-[#FAF6EE] font-medium">
                      {activeClientNote.preferredProducts}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#8E877A] italic">
                  Sin ficha técnica registrada para {activeAppointment.clientName}. Hacé clic en
                  &ldquo;+ Crear Ficha&rdquo; para guardar su degradado, remolinos y medidas.
                </p>
              )}
            </div>

            {/* Giant 1-Tap Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-[#31313A]">
              <button
                type="button"
                onClick={handleCompleteSession}
                className="py-4 px-3 rounded-xl bg-[#1F6E43] hover:bg-[#175634] text-[#FAF6EE] font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98 transition-all"
              >
                <CheckCircle2 className="w-5 h-5 text-[#88E7AB]" />
                <span>Corte Finalizado ✓</span>
              </button>

              <button
                type="button"
                onClick={handleNoShow}
                className="py-4 px-3 rounded-xl bg-[#2D2022] hover:bg-[#3D2528] border border-[#66282B] text-[#F57B7B] font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
              >
                <XCircle className="w-5 h-5" />
                <span>No se presentó</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#1C1C20] border border-[#2C2C33] rounded-2xl p-8 text-center text-[#8E877A]">
            <Scissors className="w-10 h-10 mx-auto mb-3 opacity-40 text-[#D4AF37]" />
            <h3 className="font-editorial text-xl font-bold text-[#FAF6EE] mb-1">
              Sillón Disponible
            </h3>
            <p className="text-xs text-[#8E877A] max-w-sm mx-auto">
              No hay turnos activos en curso en este momento. Seleccioná el próximo cliente de la lista
              para subirlo al sillón.
            </p>
          </div>
        )}

        {/* Next in Line Preview */}
        {nextAppointment && (
          <div className="bg-[#1C1C20] border border-[#2D2D36] rounded-xl p-4 flex items-center justify-between gap-3 shadow-md">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E877A] block font-semibold">
                Próximo Cliente en Espera:
              </span>
              <span className="font-display text-base font-bold text-[#FAF6EE] block">
                {nextAppointment.clientName}
              </span>
              <span className="text-xs font-mono text-[#D4AF37]">
                {nextAppointment.startTime} hs ({nextAppointment.serviceNames.join(', ')})
              </span>
            </div>

            <a
              href={`https://wa.me/${nextAppointment.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                `¡Hola ${nextAppointment.clientName}! Ya casi estamos listos para recibirte en Rodrigo Cutsss. Te esperamos en Vuelta de Obligado 931.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 rounded-lg bg-[#1F6E43] hover:bg-[#175634] text-[#FAF6EE] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Avisar que Pase</span>
            </a>
          </div>
        )}

        {/* Today's Full Timeline Carousel */}
        <div className="bg-[#1C1C20] border border-[#2D2D36] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#FAF6EE] font-bold">
              Agenda de Hoy ({todayAppointments.length} turnos)
            </span>
            <span className="text-[10px] font-mono text-[#8E877A]">{todayISO}</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {todayAppointments.map((app) => (
              <div
                key={app.id}
                onClick={() => setSelectedAppointmentId(app.id)}
                className={`p-3 rounded-lg border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  activeAppointment?.id === app.id
                    ? 'bg-[#27272D] border-[#D4AF37] text-[#FAF6EE]'
                    : 'bg-[#18181B] border-[#2C2C33] text-[#8E877A] hover:border-[#40404C]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#D4AF37] w-14">
                    {app.startTime} hs
                  </span>
                  <div>
                    <span className="text-sm font-bold text-[#FAF6EE] block leading-tight">
                      {app.clientName}
                    </span>
                    <span className="text-[11px] text-[#8E877A] block">
                      {app.serviceNames.join(' + ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                      app.status === 'completed'
                        ? 'bg-[#1F6E43]/20 text-[#88E7AB] border border-[#1F6E43]/40'
                        : app.status === 'cancelled'
                          ? 'bg-[#C5221F]/20 text-[#F57B7B] border border-[#C5221F]/40'
                          : 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40'
                    }`}
                  >
                    {app.status === 'completed'
                      ? '✓ Hecho'
                      : app.status === 'cancelled'
                        ? 'Cancelado'
                        : 'Confirmado'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#8E877A]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Edit CRM Formula Note */}
      <AnimatePresence>
        {isEditingNote && activeAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0C]/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1C1C20] border border-[#3A3A44] rounded-2xl max-w-lg w-full p-6 text-[#FAF6EE] shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#31313A]">
                <div>
                  <h3 className="font-editorial text-xl font-bold text-[#FAF6EE]">
                    Ficha Técnica: {activeAppointment.clientName}
                  </h3>
                  <span className="text-xs font-mono text-[#8E877A]">
                    Guardado sincronizado con Firebase y CRM local
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingNote(false)}
                  className="text-xs font-mono text-[#8E877A] hover:text-[#FAF6EE]"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#D4AF37] mb-1">
                  Fórmula de Corte / Degradado
                </label>
                <input
                  type="text"
                  value={formulaInput}
                  onChange={(e) => setFormulaInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#141416] border border-[#31313A] text-xs text-[#FAF6EE] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#D4AF37] mb-1">
                  Tipo de Pelo &amp; Remolinos en Coronilla
                </label>
                <input
                  type="text"
                  value={hairTypeInput}
                  onChange={(e) => setHairTypeInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#141416] border border-[#31313A] text-xs text-[#FAF6EE] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#D4AF37] mb-1">
                  Productos &amp; Fijación Favorita
                </label>
                <input
                  type="text"
                  value={productsInput}
                  onChange={(e) => setProductsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#141416] border border-[#31313A] text-xs text-[#FAF6EE] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#31313A]">
                <button
                  type="button"
                  onClick={() => setIsEditingNote(false)}
                  className="px-4 py-2 text-xs font-mono text-[#8E877A] hover:text-[#FAF6EE]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="px-5 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#B89146] text-[#141416] text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-xs"
                >
                  Guardar Ficha
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default ChairModePage;
