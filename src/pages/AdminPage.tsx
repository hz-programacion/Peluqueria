import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { 
  Shield, LogOut, Plus, Trash2, Edit3, Check, X, Clock, DollarSign, Calendar, 
  MapPin, Phone, Instagram, AlertCircle, Save, Sparkles, User, MessageCircle, FileText, CheckCircle2, Lock, Radio
} from 'lucide-react';
import { StudioService, LookbookItem, AppointmentRecord } from '../data/studioData';
import { formatPriceARS, timeToMinutes, minutesToTime } from '../utils/bookingEngine';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';

export const AdminPage: React.FC = () => {
  const { 
    isAdminAuthenticated, loginAdmin, logoutAdmin, config, updateConfig, 
    services, addService, updateService, deleteService,
    lookbook, addLookbookItem, deleteLookbookItem,
    appointments, updateAppointmentStatus, cancelAppointment,
    blockedSlots, addBlockedSlot, deleteBlockedSlot,
    navigateTo 
  } = useStudio();

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState<'appointments' | 'services' | 'calendar' | 'lookbook' | 'settings'>('appointments');
  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'today'>('all');
  const [saveToast, setSaveToast] = useState('');

  // Editing state for Services
  const [editingService, setEditingService] = useState<StudioService | null>(null);
  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState(false);
  const [serviceFormData, setServiceFormData] = useState<Partial<StudioService>>({
    category: 'Fades & Cortes',
    name: '',
    durationMinutes: 45,
    price: 38000,
    shortDescription: '',
    preparation: ['Venir con el cabello limpio', 'Traer foto de referencia si buscás un fade específico'],
    executionSteps: ['Diagnóstico visagista', 'Apertura de guías y shaver', 'Corte superior a tijera', 'Styling con polvo mate'],
    aftercare: 'Mantiene máxima nitidez entre 10 y 14 días.',
    productsUsed: 'Babyliss FX3 · Polvo Voluminizador Slick Gorilla',
  });

  // New Blocked Slot Form
  const [newBlockedDate, setNewBlockedDate] = useState('2026-11-06');
  const [newBlockedTime, setNewBlockedTime] = useState('15:00');
  const [newBlockedDuration, setNewBlockedDuration] = useState(60);
  const [newBlockedReason, setNewBlockedReason] = useState('Almuerzo / Esterilización UV de herramientas');

  // New Lookbook Form
  const [isNewLookbookOpen, setIsNewLookbookOpen] = useState(false);
  const [lookbookForm, setLookbookForm] = useState<Partial<LookbookItem>>({
    title: '',
    category: 'Skin Fades',
    imageUrl: '/src/assets/images/urban_barber_hero_1793929257447.jpg',
    servicePerformed: '01. Mid / Low Fade & Crop Texturizado',
    executionTime: '45 min',
    guardSpec: 'Guía 0.5 a navaja · Tijera de entresacar',
    productApplied: 'Polvo voluminizador mate',
    toolsUsed: 'Babyliss Pro Gold FX · Tijera Kasho 5.5"',
    authorNote: 'Desvanecido comprimido y textura natural superior.',
  });

  const triggerToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(''), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(pinInput)) {
      setPinError('');
      setPinInput('');
    } else {
      setPinError('PIN incorrecto. El PIN maestro predeterminado es 1234.');
    }
  };

  // Metric computations for today
  const todayStr = '2026-11-05';
  const todayAppointments = appointments.filter((a) => a.date === todayStr);
  const totalRevenueEst = appointments.reduce((acc, app) => {
    const matchedService = services.find((s) => app.serviceNames.includes(s.name));
    return acc + (matchedService ? matchedService.price : 38000);
  }, 0);

  // If not authenticated, render urban pin screen
  if (!isAdminAuthenticated) {
    return (
      <div className="py-16 md:py-28 px-4 flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md p-6 md:p-8 rounded-2xl border border-[#272938] bg-[#111219] text-white shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-[#00F0FF] text-black flex items-center justify-center font-bold text-xl mb-5 shadow-[0_0_15px_rgba(0,240,255,0.4)]">
            <Lock className="w-6 h-6 stroke-[2.5]" />
          </div>

          <span className="font-mono text-xs uppercase text-[#00F0FF] font-bold block mb-1">
            PORTAL DEL BARBERO · CONTROL TOTAL
          </span>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold mb-2">
            Acceso Privado de Estudio
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed mb-6">
            Ingresá tu PIN para revisar los turnos agendados, ajustar precios, bloquear horarios de descanso o actualizar los cortes del Lookbook.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-pin" className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 font-semibold">
                PIN de Seguridad (4 Dígitos)
              </label>
              <input
                id="admin-pin"
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError('');
                }}
                placeholder="1234"
                className="w-full h-12 px-3.5 text-center tracking-[0.4em] text-xl font-mono font-bold rounded-xl border border-[#2B2D3D] bg-[#161722] text-white focus:border-[#00F0FF] focus:outline-none"
                autoFocus
              />
              {pinError && (
                <p className="text-xs text-red-400 mt-2 font-mono">
                  {pinError}
                </p>
              )}
            </div>

            <button
              type="submit"
              onClick={playMechanicalClick}
              onMouseEnter={playMechanicalHover}
              className="w-full h-12 uppercase font-black text-xs tracking-wider bg-[#00F0FF] text-black rounded-xl hover:bg-[#00D5E5] transition-all cursor-pointer shadow-lg active:scale-95"
            >
              Entrar al Panel de Control
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#20222D] text-center">
            <p className="text-xs font-mono text-zinc-500">
              PIN maestro por defecto: <strong className="text-[#00F0FF]">1234</strong>
            </p>
            <button
              onClick={() => {
                playMechanicalClick();
                navigateTo('home');
              }}
              onMouseEnter={playMechanicalHover}
              className="text-xs text-zinc-400 hover:text-white mt-2.5 underline cursor-pointer"
            >
              Volver a la portada del cliente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard View
  const displayedAppointments = appointmentFilter === 'today'
    ? appointments.filter((a) => a.date === todayStr)
    : appointments;

  return (
    <div className="py-8 md:py-14 px-4 sm:px-6 max-w-[1360px] mx-auto min-h-screen text-white space-y-8">
      
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-[#00F0FF] text-black font-bold rounded-xl shadow-2xl text-xs font-mono flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 stroke-[3]" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Bar for Admin */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#222432]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#00F0FF] font-bold mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>SESIÓN ADMINISTRATIVA INICIADA · {config.authorName.toUpperCase()}</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-black uppercase">
            Panel de Control del Barbero
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigateTo('home')}
            className="px-4 py-2 text-xs font-mono font-bold rounded-xl border border-[#2B2D3D] bg-[#161722] hover:border-[#00F0FF] transition-colors cursor-pointer"
          >
            Ver Sitio Público
          </button>
          <button
            onClick={logoutAdmin}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold rounded-xl bg-red-950/40 text-red-400 border border-red-800/40 hover:bg-red-900/40 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Barbero Quick KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-[#232532] bg-[#111218]">
          <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 block">Citas Agendadas</span>
          <p className="font-display text-2xl font-black text-white mt-0.5">{appointments.length} Turnos</p>
          <p className="text-[11px] font-mono text-[#00F0FF] mt-0.5">{todayAppointments.length} para el día de hoy</p>
        </div>

        <div className="p-4 rounded-xl border border-[#232532] bg-[#111218]">
          <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 block">Facturación Proyectada</span>
          <p className="font-display text-2xl font-black text-[#00F0FF] mt-0.5">{formatPriceARS(totalRevenueEst)}</p>
          <p className="text-[11px] font-mono text-zinc-400 mt-0.5">Basado en citas confirmadas</p>
        </div>

        <div className="p-4 rounded-xl border border-[#232532] bg-[#111218]">
          <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 block">Servicios en Carta</span>
          <p className="font-display text-2xl font-black text-white mt-0.5">{services.length} Cortes</p>
          <p className="text-[11px] font-mono text-zinc-400 mt-0.5">Precios y duraciones configurables</p>
        </div>

        <div className="p-4 rounded-xl border border-[#232532] bg-[#111218]">
          <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 block">Disponibilidad en Vivo</span>
          <p className="font-display text-xl font-bold text-white mt-0.5">
            {config.walkInStatus === 'available' ? 'Turnos del día abiertos' : 'Agenda 100% Completa'}
          </p>
          <button
            onClick={() => {
              const newStatus = config.walkInStatus === 'available' ? 'booked_full' : 'available';
              updateConfig({ walkInStatus: newStatus });
              triggerToast(`Estado actualizado: ${newStatus === 'available' ? 'Huecos abiertos hoy' : 'Agenda Completa'}`);
            }}
            className="text-[11px] font-mono text-[#00F0FF] hover:underline mt-0.5 cursor-pointer"
          >
            Cambiar estado &rarr;
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-[#222432]">
        {[
          { id: 'appointments', label: `Citas y Turnos (${appointments.length})`, icon: Calendar },
          { id: 'services', label: `Cortes y Precios (${services.length})`, icon: DollarSign },
          { id: 'calendar', label: `Bloqueos de Horario (${blockedSlots.length})`, icon: Clock },
          { id: 'lookbook', label: `Lookbook (${lookbook.length})`, icon: Sparkles },
          { id: 'settings', label: 'Ajustes del Estudio', icon: MapPin },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-mono font-bold transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#00F0FF] text-black shadow-md'
                  : 'bg-[#14151E] border border-[#232532] text-zinc-400 hover:text-white hover:border-zinc-500'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold">
                Agenda de Turnos Confirmados
              </h2>
              <p className="text-xs font-mono text-zinc-400">
                Podés contactar a cada cliente con mensaje pre-escrito en 1 clic de WhatsApp.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setAppointmentFilter('all')}
                className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg border transition-colors cursor-pointer ${
                  appointmentFilter === 'all'
                    ? 'border-[#00F0FF] bg-[#00F0FF] text-black'
                    : 'border-[#272938] bg-[#14151E] text-zinc-400 hover:text-white'
                }`}
              >
                Todos ({appointments.length})
              </button>
              <button
                onClick={() => setAppointmentFilter('today')}
                className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg border transition-colors cursor-pointer ${
                  appointmentFilter === 'today'
                    ? 'border-[#00F0FF] bg-[#00F0FF] text-black'
                    : 'border-[#272938] bg-[#14151E] text-zinc-400 hover:text-white'
                }`}
              >
                Hoy ({todayAppointments.length})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {displayedAppointments.map((app) => {
              const startMin = timeToMinutes(app.startTime);
              const endMin = startMin + app.serviceMinutes + app.bufferMinutes;
              const isFinished = app.status === 'completed';

              return (
                <div
                  key={app.id}
                  className={`p-5 md:p-6 rounded-xl border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                    isFinished
                      ? 'border-[#222432] bg-[#0E0F14] opacity-70'
                      : 'border-[#272938] bg-[#12131A]'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                      <span className="px-2.5 py-0.5 rounded bg-[#00F0FF] text-black font-extrabold">
                        {app.date}
                      </span>
                      <span className="font-bold text-white">
                        {app.startTime} a {minutesToTime(endMin)} hs
                      </span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-zinc-300">
                        {app.serviceMinutes}m corte + {app.bufferMinutes}m buffer
                      </span>
                      <span className="text-zinc-600">·</span>
                      <span className={app.paymentOption === 'deposit' ? 'text-emerald-400 font-bold' : 'text-zinc-400'}>
                        {app.paymentOption === 'deposit' ? 'Seña 30% Acreditada' : 'Abono en Local'}
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-bold text-white">
                      {app.clientName}
                    </h3>

                    <p className="text-xs font-mono text-zinc-300">
                      Corte: <span className="text-white font-semibold">{app.serviceNames.join(' + ')}</span>
                    </p>

                    <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 pt-1">
                      <span>Tel: {app.whatsapp}</span>
                      <span>·</span>
                      <span>Reseña programada: {app.reviewLoopScheduledAt} hs</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <a
                      href={`https://wa.me/${app.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                        `Hola ${app.clientName.split(' ')[0]}! Te escribe Rodrigo de Rodrigo Cutsss para confirmar tu turno del ${app.date} a las ${app.startTime} hs en Vuelta de Obligado 931, Venado Tuerto.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 text-[#25D366] text-xs font-mono font-bold hover:bg-[#25D366]/20 flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Directo</span>
                    </a>

                    <button
                      onClick={() => {
                        updateAppointmentStatus(app.id, isFinished ? 'confirmed' : 'completed');
                        triggerToast(isFinished ? 'Cita reabierta' : 'Cita marcada como finalizada');
                      }}
                      className={`px-3 py-2 text-xs font-mono font-bold rounded-xl border transition-colors cursor-pointer ${
                        isFinished
                          ? 'border-zinc-700 text-zinc-400'
                          : 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                      }`}
                    >
                      {isFinished ? 'Reabrir' : 'Finalizar'}
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`¿Cancelar y liberar el turno de ${app.clientName}?`)) {
                          cancelAppointment(app.id);
                          triggerToast('Turno liberado del calendario');
                        }
                      }}
                      aria-label="Cancelar cita"
                      className="p-2 text-zinc-500 hover:text-red-400 border border-[#272938] rounded-xl hover:bg-white/5 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SERVICES & PRICING */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold">
                Cortes de la Carta, Tiempos y Precios
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Al cambiar la duración en minutos, el calendario recalcula en vivo las franjas horarias libres.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingService(null);
                setServiceFormData({
                  index: String(services.length + 1).padStart(2, '0'),
                  category: 'Fades & Cortes',
                  name: '',
                  durationMinutes: 45,
                  price: 38000,
                  shortDescription: '',
                  preparation: ['Venir con el pelo lavado dentro de las 24 hs'],
                  executionSteps: ['Diagnóstico', 'Degradé con clippers & shaver', 'Corte a tijera', 'Styling'],
                  aftercare: 'Recomendamos control cada 2 a 3 semanas.',
                  productsUsed: 'Babyliss FX3 · Polvo mate',
                });
                setIsNewServiceModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-mono font-black uppercase tracking-wider bg-[#00F0FF] text-black rounded-xl hover:bg-[#00D5E5] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Añadir Corte</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {services.map((srv) => (
              <div
                key={srv.id}
                className="p-5 md:p-6 rounded-xl border border-[#232532] bg-[#111218] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 font-mono text-xs text-zinc-400 mb-2">
                    <span className="text-[#00F0FF] font-bold">{srv.index}. {srv.category}</span>
                    <span className="text-lg font-black text-white">{formatPriceARS(srv.price)}</span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-white mb-1">{srv.name}</h3>
                  <p className="text-xs font-mono text-zinc-300 mb-2">
                    Duración bloqueada: {srv.durationMinutes} minutos
                  </p>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    {srv.shortDescription}
                  </p>

                  <div className="pt-3 border-t border-[#1E202B] text-[11px] font-mono text-zinc-400 space-y-1">
                    <p><span className="text-zinc-500">Herramientas:</span> {srv.productsUsed}</p>
                    <p><span className="text-zinc-500">Mantenimiento:</span> {srv.aftercare}</p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#1E202B] flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-mono">ID: {srv.id}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingService(srv);
                        setServiceFormData(srv);
                        setIsNewServiceModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-mono font-bold border border-[#2B2D3D] rounded-lg hover:border-[#00F0FF] cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar el servicio "${srv.name}"?`)) {
                          deleteService(srv.id);
                          triggerToast('Servicio eliminado de la carta');
                        }
                      }}
                      className="p-1.5 text-zinc-500 hover:text-red-400 border border-[#2B2D3D] rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CALENDAR & BLOCKED SLOTS */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl font-bold mb-1">
              Bloqueos de Horario &amp; Pausas del Barbero
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              Bloqueá franjas para almuerzo, gimnasio, capacitaciones o afilado de máquinas. Los clientes no verán turnos en esos horarios.
            </p>
          </div>

          {/* Form to create block */}
          <div className="p-6 rounded-xl border border-[#232532] bg-[#111218]">
            <h3 className="font-mono text-xs uppercase text-[#00F0FF] font-bold mb-4">
              Bloquear Horario Específico
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1 font-semibold">Fecha</label>
                <input
                  type="date"
                  value={newBlockedDate}
                  onChange={(e) => setNewBlockedDate(e.target.value)}
                  className="w-full h-10 px-3 text-xs font-mono rounded-lg border border-[#2B2D3D] bg-[#161722] text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1 font-semibold">Hora de Inicio</label>
                <input
                  type="time"
                  value={newBlockedTime}
                  onChange={(e) => setNewBlockedTime(e.target.value)}
                  className="w-full h-10 px-3 text-xs font-mono rounded-lg border border-[#2B2D3D] bg-[#161722] text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1 font-semibold">Duración (minutos)</label>
                <input
                  type="number"
                  step={15}
                  value={newBlockedDuration}
                  onChange={(e) => setNewBlockedDuration(Number(e.target.value))}
                  className="w-full h-10 px-3 text-xs font-mono rounded-lg border border-[#2B2D3D] bg-[#161722] text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1 font-semibold">Motivo</label>
                <input
                  type="text"
                  value={newBlockedReason}
                  onChange={(e) => setNewBlockedReason(e.target.value)}
                  placeholder="Ej. Almuerzo o mantenimiento"
                  className="w-full h-10 px-3 text-xs font-mono rounded-lg border border-[#2B2D3D] bg-[#161722] text-white"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  if (!newBlockedDate || !newBlockedTime) return;
                  addBlockedSlot({
                    id: `block-${Date.now()}`,
                    date: newBlockedDate,
                    startTime: newBlockedTime,
                    durationMinutes: newBlockedDuration,
                    reason: newBlockedReason,
                  });
                  triggerToast('Franja bloqueada exitosamente');
                }}
                className="px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider bg-[#00F0FF] text-black rounded-lg hover:bg-[#00D5E5] cursor-pointer"
              >
                Bloquear Horario
              </button>
            </div>
          </div>

          {/* List of blocked slots */}
          <div className="space-y-3">
            <h3 className="font-display text-xl font-bold">Bloqueos Registrados ({blockedSlots.length})</h3>
            {blockedSlots.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-xl border border-[#232532] bg-[#111218] flex items-center justify-between gap-4 font-mono text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{b.date} · {b.startTime} hs</span>
                    <span className="text-[#00F0FF]">({b.durationMinutes} minutos)</span>
                  </div>
                  <p className="text-zinc-400 mt-0.5">{b.reason || 'Sin motivo especificado'}</p>
                </div>

                <button
                  onClick={() => {
                    deleteBlockedSlot(b.id);
                    triggerToast('Bloqueo eliminado');
                  }}
                  className="text-zinc-500 hover:text-red-400 p-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LOOKBOOK MANAGEMENT */}
      {activeTab === 'lookbook' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold">Gestión del Lookbook</h2>
              <p className="text-xs text-zinc-400 font-mono">
                Agregá nuevos cortes fotográficos con la máquina y peines utilizados.
              </p>
            </div>
            <button
              onClick={() => setIsNewLookbookOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-mono font-black uppercase tracking-wider bg-[#00F0FF] text-black rounded-xl hover:bg-[#00D5E5] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Nuevo Trabajo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {lookbook.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-[#232532] bg-[#111218] overflow-hidden flex flex-col justify-between"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/80 text-[#00F0FF] font-mono text-[10px] font-bold rounded">
                    {item.category}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display text-lg font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-xs text-zinc-400 mb-2">{item.servicePerformed}</p>
                    <p className="text-xs font-mono text-[#00F0FF]">Guía: {item.guardSpec}</p>
                    <p className="text-xs font-mono text-zinc-400">Producto: {item.productApplied}</p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#1E202B] flex items-center justify-end">
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar "${item.title}" del Lookbook?`)) {
                          deleteLookbookItem(item.id);
                          triggerToast('Corte eliminado del lookbook');
                        }
                      }}
                      className="text-zinc-500 hover:text-red-400 p-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: STUDIO SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-3xl space-y-6">
          <div>
            <h2 className="font-display text-2xl font-bold mb-1">Ajustes del Estudio</h2>
            <p className="text-xs text-zinc-400 font-mono">
              Configurá los datos del barbero, horarios de apertura y playlist urbana de Spotify.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-[#232532] bg-[#111218] space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1 font-semibold">Nombre del Barbero</label>
                <input
                  type="text"
                  value={config.authorName}
                  onChange={(e) => updateConfig({ authorName: e.target.value })}
                  className="w-full h-10 px-3 text-xs font-mono rounded-lg border border-[#2B2D3D] bg-[#161722] text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1 font-semibold">Título del Local</label>
                <input
                  type="text"
                  value={config.studioTitle}
                  onChange={(e) => updateConfig({ studioTitle: e.target.value })}
                  className="w-full h-10 px-3 text-xs font-mono rounded-lg border border-[#2B2D3D] bg-[#161722] text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1 font-semibold">Vibe &amp; Playlist de Estudio (Música que suena)</label>
              <input
                type="text"
                value={config.currentVibeTrack}
                onChange={(e) => updateConfig({ currentVibeTrack: e.target.value })}
                className="w-full h-10 px-3 text-xs font-mono rounded-lg border border-[#2B2D3D] bg-[#161722] text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1 font-semibold">Bio / Presentación</label>
              <textarea
                rows={3}
                value={config.bio}
                onChange={(e) => updateConfig({ bio: e.target.value })}
                className="w-full p-3 text-xs rounded-lg border border-[#2B2D3D] bg-[#161722] text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1 font-semibold">Dirección</label>
                <input
                  type="text"
                  value={config.address}
                  onChange={(e) => updateConfig({ address: e.target.value })}
                  className="w-full h-10 px-3 text-xs font-mono rounded-lg border border-[#2B2D3D] bg-[#161722] text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1 font-semibold">Barrio</label>
                <input
                  type="text"
                  value={config.neighborhood}
                  onChange={(e) => updateConfig({ neighborhood: e.target.value })}
                  className="w-full h-10 px-3 text-xs font-mono rounded-lg border border-[#2B2D3D] bg-[#161722] text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1 font-semibold">Apertura (hs)</label>
                <input
                  type="number"
                  value={config.openingHour}
                  onChange={(e) => updateConfig({ openingHour: Number(e.target.value) })}
                  className="w-full h-10 px-3 text-xs font-mono rounded-lg border border-[#2B2D3D] bg-[#161722] text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1 font-semibold">Cierre (hs)</label>
                <input
                  type="number"
                  value={config.closingHour}
                  onChange={(e) => updateConfig({ closingHour: Number(e.target.value) })}
                  className="w-full h-10 px-3 text-xs font-mono rounded-lg border border-[#2B2D3D] bg-[#161722] text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1 font-semibold">Buffer UV (min)</label>
                <input
                  type="number"
                  value={config.cleanBufferMinutes}
                  onChange={(e) => updateConfig({ cleanBufferMinutes: Number(e.target.value) })}
                  className="w-full h-10 px-3 text-xs font-mono rounded-lg border border-[#2B2D3D] bg-[#161722] text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => triggerToast('Ajustes guardados correctamente')}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-wider bg-[#00F0FF] text-black rounded-lg hover:bg-[#00D5E5] cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Ajustes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Service Create / Edit */}
      {isNewServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-[#111218] border border-[#2B2D3D] text-white rounded-2xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#222432]">
              <h3 className="font-display text-xl font-bold">
                {editingService ? 'Editar Corte' : 'Nuevo Corte'}
              </h3>
              <button
                onClick={() => setIsNewServiceModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Nombre del Corte / Servicio *</label>
                <input
                  type="text"
                  value={serviceFormData.name || ''}
                  onChange={(e) => setServiceFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej. Taper Fade & Line Up"
                  className="w-full h-10 px-3 rounded-lg border border-[#2B2D3D] bg-[#161722] text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Categoría</label>
                  <select
                    value={serviceFormData.category || 'Fades & Cortes'}
                    onChange={(e) => setServiceFormData((prev) => ({ ...prev, category: e.target.value as StudioService['category'] }))}
                    className="w-full h-10 px-3 rounded-lg border border-[#2B2D3D] bg-[#161722] text-white"
                  >
                    <option value="Fades & Cortes">Fades &amp; Cortes</option>
                    <option value="Corte & Barba">Corte &amp; Barba</option>
                    <option value="Color & Platinados">Color &amp; Platinados</option>
                    <option value="Detalles & Barba">Detalles &amp; Barba</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Duración (minutos) *</label>
                  <input
                    type="number"
                    step={15}
                    value={serviceFormData.durationMinutes || 45}
                    onChange={(e) => setServiceFormData((prev) => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                    className="w-full h-10 px-3 rounded-lg border border-[#2B2D3D] bg-[#161722] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Precio en ARS ($) *</label>
                <input
                  type="number"
                  step={1000}
                  value={serviceFormData.price || 38000}
                  onChange={(e) => setServiceFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                  className="w-full h-10 px-3 rounded-lg border border-[#2B2D3D] bg-[#161722] text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Descripción Breve</label>
                <textarea
                  rows={2}
                  value={serviceFormData.shortDescription || ''}
                  onChange={(e) => setServiceFormData((prev) => ({ ...prev, shortDescription: e.target.value }))}
                  className="w-full p-2.5 rounded-lg border border-[#2B2D3D] bg-[#161722] text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Herramientas / Productos</label>
                <input
                  type="text"
                  value={serviceFormData.productsUsed || ''}
                  onChange={(e) => setServiceFormData((prev) => ({ ...prev, productsUsed: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border border-[#2B2D3D] bg-[#161722] text-white"
                />
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-[#222432] flex items-center justify-end gap-3">
              <button
                onClick={() => setIsNewServiceModalOpen(false)}
                className="px-4 py-2 text-xs font-mono border border-[#2B2D3D] rounded-lg text-zinc-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!serviceFormData.name) {
                    alert('Por favor especificá el nombre del servicio');
                    return;
                  }
                  if (editingService) {
                    updateService(editingService.id, serviceFormData);
                    triggerToast('Corte actualizado con éxito');
                  } else {
                    addService({
                      id: `srv-${Date.now()}`,
                      index: String(services.length + 1).padStart(2, '0'),
                      category: serviceFormData.category || 'Fades & Cortes',
                      name: serviceFormData.name || '',
                      durationMinutes: serviceFormData.durationMinutes || 45,
                      price: serviceFormData.price || 38000,
                      shortDescription: serviceFormData.shortDescription || '',
                      preparation: serviceFormData.preparation || ['Cabello limpio'],
                      executionSteps: serviceFormData.executionSteps || ['Corte y pulido'],
                      aftercare: serviceFormData.aftercare || 'Mantiene nitidez por 2 semanas',
                      productsUsed: serviceFormData.productsUsed || 'Babyliss FX3',
                    });
                    triggerToast('Nuevo corte añadido a la carta');
                  }
                  setIsNewServiceModalOpen(false);
                }}
                className="px-5 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-[#00F0FF] text-black rounded-lg hover:bg-[#00D5E5] cursor-pointer"
              >
                Guardar Corte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Lookbook Create */}
      {isNewLookbookOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-[#111218] border border-[#2B2D3D] text-white rounded-2xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#222432]">
              <h3 className="font-display text-xl font-bold">Añadir Trabajo al Lookbook</h3>
              <button
                onClick={() => setIsNewLookbookOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Título del Trabajo *</label>
                <input
                  type="text"
                  value={lookbookForm.title || ''}
                  onChange={(e) => setLookbookForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej. Low Taper con Texturizado"
                  className="w-full h-10 px-3 rounded-lg border border-[#2B2D3D] bg-[#161722] text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Categoría</label>
                <select
                  value={lookbookForm.category || 'Skin Fades'}
                  onChange={(e) => setLookbookForm((prev) => ({ ...prev, category: e.target.value as LookbookItem['category'] }))}
                  className="w-full h-10 px-3 rounded-lg border border-[#2B2D3D] bg-[#161722] text-white"
                >
                  <option value="Skin Fades">Skin Fades</option>
                  <option value="Tapers & Caída">Tapers &amp; Caída</option>
                  <option value="Texturizados">Texturizados</option>
                  <option value="Platinados & Buzz">Platinados &amp; Buzz</option>
                  <option value="Barba & Perfilado">Barba &amp; Perfilado</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">URL de la Imagen</label>
                <input
                  type="text"
                  value={lookbookForm.imageUrl || ''}
                  onChange={(e) => setLookbookForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border border-[#2B2D3D] bg-[#161722] text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Especificación de Guías (ej: 0.5 a shaver)</label>
                <input
                  type="text"
                  value={lookbookForm.guardSpec || ''}
                  onChange={(e) => setLookbookForm((prev) => ({ ...prev, guardSpec: e.target.value }))}
                  placeholder="0 mm shaver a nuca limpia"
                  className="w-full h-10 px-3 rounded-lg border border-[#2B2D3D] bg-[#161722] text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Producto Aplicado</label>
                <input
                  type="text"
                  value={lookbookForm.productApplied || ''}
                  onChange={(e) => setLookbookForm((prev) => ({ ...prev, productApplied: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border border-[#2B2D3D] bg-[#161722] text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Criterio / Nota del Barbero</label>
                <textarea
                  rows={2}
                  value={lookbookForm.authorNote || ''}
                  onChange={(e) => setLookbookForm((prev) => ({ ...prev, authorNote: e.target.value }))}
                  className="w-full p-2.5 rounded-lg border border-[#2B2D3D] bg-[#161722] text-white text-xs"
                />
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-[#222432] flex items-center justify-end gap-3">
              <button
                onClick={() => setIsNewLookbookOpen(false)}
                className="px-4 py-2 text-xs font-mono border border-[#2B2D3D] rounded-lg text-zinc-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!lookbookForm.title) {
                    alert('Ingresá el título del trabajo');
                    return;
                  }
                  addLookbookItem({
                    id: `lb-${Date.now()}`,
                    title: lookbookForm.title || '',
                    category: lookbookForm.category || 'Skin Fades',
                    imageUrl: lookbookForm.imageUrl || '/src/assets/images/urban_barber_hero_1793929257447.jpg',
                    servicePerformed: lookbookForm.servicePerformed || '01. Mid / Low Fade & Crop Texturizado',
                    executionTime: lookbookForm.executionTime || '45 min',
                    guardSpec: lookbookForm.guardSpec || '0 a 1.5mm shaver',
                    productApplied: lookbookForm.productApplied || 'Polvo mate',
                    toolsUsed: lookbookForm.toolsUsed || 'Babyliss FX3',
                    authorNote: lookbookForm.authorNote || 'Corte urbano de precisión',
                  });
                  triggerToast('Corte añadido al lookbook');
                  setIsNewLookbookOpen(false);
                }}
                className="px-5 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-[#00F0FF] text-black rounded-lg hover:bg-[#00D5E5] cursor-pointer"
              >
                Guardar al Lookbook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
