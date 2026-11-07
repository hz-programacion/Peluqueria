import React, { useState, useRef, useEffect } from 'react';
import { useStudio, normalizeSectionOrder } from '../context/StudioContext';
import {
  Shield,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  X,
  Clock,
  DollarSign,
  Calendar,
  Instagram,
  Save,
  MessageCircle,
  CheckCircle2,
  Lock,
  Camera,
  Eye,
  EyeOff,
  Upload,
  Sliders,
  LayoutGrid,
  UserCheck,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Palette,
  Sparkles,
  Download,
  Search,
  Settings,
  TrendingUp,
} from 'lucide-react';
import {
  StudioService,
  GalleryItemCategory,
} from '../data/studioData';
import {
  HomeSectionId,
  UrbanThemePreset,
  DEFAULT_SECTION_ORDER,
} from '../data/studioStore';
import {
  formatPriceARS,
  timeToMinutes,
  minutesToTime,
  getTodayLocalISO,
  resolveInstagramInfo,
  resolveWhatsAppInfo,
} from '../utils/bookingEngine';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';

const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1080;
        const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.84));
      };
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const SECTION_ADMIN_META: Record<
  HomeSectionId,
  {
    key:
      | 'showBookingSection'
      | 'showServicesSection'
      | 'showBeforeAfterSection'
      | 'showGallerySection'
      | 'showReviewsSection'
      | 'showBarberSection'
      | 'showLocationSection';
    label: string;
    description: string;
  }
> = {
  booking: {
    key: 'showBookingSection',
    label: 'Reserva de Turnos & Consulta por WhatsApp (#reservar)',
    description: 'Turnero interactivo en vivo, consulta de ticket por WhatsApp y descarga PNG/ICS.',
  },
  services: {
    key: 'showServicesSection',
    label: 'Carta de Servicios, Fades & Precios (#servicios)',
    description: 'Tarjetas de cortes, barba y colorimetría con tiempos reales y reserva en 1 clic.',
  },
  beforeAfter: {
    key: 'showBeforeAfterSection',
    label: 'Comparador Interactivo "Antes / Después" Aerosol (#transformaciones)',
    description: 'Slider interactivo con línea divisoria de spray para comparar cambios de look.',
  },
  gallery: {
    key: 'showGallerySection',
    label: 'Galería de Creaciones Reales & Lookbook (#galeria)',
    description: 'Mural de trabajos reales en el estudio con filtros por categoría y zoom.',
  },
  reviews: {
    key: 'showReviewsSection',
    label: 'Reseñas Verificadas de Clientes (#opiniones)',
    description: 'Carrusel de opiniones verificadas (5.0★) y formulario para dejar reseña.',
  },
  barber: {
    key: 'showBarberSection',
    label: 'Presentación del Barbero & Equipamiento (#barbero)',
    description: 'Filosofía 1 a 1, máquinas clipper/trimmer/shaver 0.0mm y contacto directo.',
  },
  location: {
    key: 'showLocationSection',
    label: 'Ubicación, Mapa Urbano & Horarios (#ubicacion)',
    description: 'Dirección Vuelta de Obligado 931, accesos a Google Maps / Waze y alias.',
  },
};

const WEEKDAYS_LIST = [
  { day: 1, short: 'Lun', full: 'Lunes' },
  { day: 2, short: 'Mar', full: 'Martes' },
  { day: 3, short: 'Mié', full: 'Miércoles' },
  { day: 4, short: 'Jue', full: 'Jueves' },
  { day: 5, short: 'Vie', full: 'Viernes' },
  { day: 6, short: 'Sáb', full: 'Sábado' },
  { day: 0, short: 'Dom', full: 'Domingo' },
];

export const AdminPage: React.FC = () => {
  const {
    isAdminAuthenticated,
    loginAdmin,
    logoutAdmin,
    config,
    updateConfig,
    moveSectionInOrder,
    bulkAdjustServicePrices,
    services,
    addService,
    updateService,
    deleteService,
    galleryItems,
    addGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
    appointments,
    addAppointment,
    updateAppointmentStatus,
    cancelAppointment,
    blockedSlots,
    addBlockedSlot,
    deleteBlockedSlot,
    navigateTo,
    backendConnected,
    backendMetrics,
    auditLogs,
    refreshBackendState,
  } = useStudio();

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState<
    | 'sections_profile'
    | 'business_rules'
    | 'appointments'
    | 'gallery'
    | 'services'
    | 'calendar'
    | 'server_audit'
  >('sections_profile');
  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'today'>('today');
  const [appointmentSearch, setAppointmentSearch] = useState('');
  const [saveToast, setSaveToast] = useState('');

  // Form state for Barber Name, Instagram Link/Handle, and WhatsApp Link/Number
  const [barberNameForm, setBarberNameForm] = useState(config.authorName);
  const [instagramForm, setInstagramForm] = useState(config.instagram);
  const [whatsappDisplayForm, setWhatsappDisplayForm] = useState(config.phoneDisplay);
  const [whatsappRawForm, setWhatsappRawForm] = useState(config.whatsappRaw);
  const [studioTitleForm, setStudioTitleForm] = useState(config.studioTitle);
  const [addressForm, setAddressForm] = useState(config.address);
  const [neighborhoodForm, setNeighborhoodForm] = useState(config.neighborhood);
  const [transferAliasForm, setTransferAliasForm] = useState(config.transferAlias);
  const [mainPriceForm, setMainPriceForm] = useState(config.mainPriceDisplay);
  const [heroSubtitleForm, setHeroSubtitleForm] = useState(config.heroSubtitle);
  const [bioForm, setBioForm] = useState(config.bio);
  const [promoBannerTextForm, setPromoBannerTextForm] = useState(
    config.promoBannerText || ''
  );
  const [scheduleDisplayForm, setScheduleDisplayForm] = useState(config.scheduleDisplay);
  const [adminPinForm, setAdminPinForm] = useState(config.adminPin || '1234');

  // Sync local form state whenever config changes externally
  useEffect(() => {
    setBarberNameForm(config.authorName);
    setInstagramForm(config.instagram);
    setWhatsappDisplayForm(config.phoneDisplay);
    setWhatsappRawForm(config.whatsappRaw);
    setStudioTitleForm(config.studioTitle);
    setAddressForm(config.address);
    setNeighborhoodForm(config.neighborhood);
    setTransferAliasForm(config.transferAlias);
    setMainPriceForm(config.mainPriceDisplay);
    setHeroSubtitleForm(config.heroSubtitle);
    setBioForm(config.bio);
    setPromoBannerTextForm(config.promoBannerText || '');
    setScheduleDisplayForm(config.scheduleDisplay);
    setAdminPinForm(config.adminPin || '1234');
  }, [
    config.authorName,
    config.instagram,
    config.phoneDisplay,
    config.whatsappRaw,
    config.studioTitle,
    config.address,
    config.neighborhood,
    config.transferAlias,
    config.mainPriceDisplay,
    config.heroSubtitle,
    config.bio,
    config.promoBannerText,
    config.scheduleDisplay,
    config.adminPin,
  ]);

  // Editing state for Services
  const [editingService, setEditingService] = useState<StudioService | null>(null);
  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState(false);
  const [serviceFormData, setServiceFormData] = useState<Partial<StudioService>>({
    category: 'Fades & Cortes',
    name: '',
    durationMinutes: 40,
    price: 12000,
    shortDescription: '',
    preparation: ['Venir con el cabello limpio'],
    executionSteps: [
      'Diagnóstico visagista',
      'Degradé con clippers y shaver 0.0mm',
      'Corte superior a tijera',
      'Styling mate',
    ],
    aftercare: 'Mantiene máxima nitidez entre 10 y 14 días.',
    productsUsed: 'Babyliss FX3 · Shaver Titanio · Polvo Mate',
  });

  // Quick Manual Appointment Form
  const todayStr = getTodayLocalISO();
  const [manualDate, setManualDate] = useState(todayStr);
  const [manualTime, setManualTime] = useState('17:00');
  const [manualClientName, setManualClientName] = useState('');
  const [manualClientWhatsapp, setManualClientWhatsapp] = useState('');
  const [manualServiceId, setManualServiceId] = useState(services[0]?.id || 'srv-01');

  // New Blocked Slot Form
  const [newBlockedDate, setNewBlockedDate] = useState(todayStr);
  const [newBlockedTime, setNewBlockedTime] = useState('15:00');
  const [newBlockedDuration, setNewBlockedDuration] = useState(60);
  const [newBlockedReason, setNewBlockedReason] = useState(
    'Almuerzo / Esterilización UV de herramientas'
  );

  // Admin Photo Upload Form
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoCategory, setPhotoCategory] = useState<GalleryItemCategory>('Cortes & Fades');
  const [photoDescription, setPhotoDescription] = useState('');
  const [photoTechnicalSpec, setPhotoTechnicalSpec] = useState('');
  const [photoPriceTag] = useState(config.mainPriceDisplay || '$12.000');
  const [photoHideBuyButton, setPhotoHideBuyButton] = useState(false);
  const [photoHidePrice, setPhotoHidePrice] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(''), 3400);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(pinInput)) {
      setPinError('');
      setPinInput('');
    } else {
      setPinError(`PIN incorrecto. El PIN actual es ${config.adminPin || '1234'}.`);
    }
  };

  const handleSaveProfileAndLinks = (e: React.FormEvent) => {
    e.preventDefault();
    playMechanicalClick();

    const cleanName = barberNameForm.trim() || 'Rodrigo';
    const cleanIg = instagramForm.trim() || '@rodrigo.cutsss';
    const resolvedWa = resolveWhatsAppInfo(
      whatsappDisplayForm,
      whatsappRawForm || whatsappDisplayForm
    );

    updateConfig({
      authorName: cleanName,
      instagram: cleanIg,
      phoneDisplay: whatsappDisplayForm.trim() || resolvedWa.display,
      whatsappRaw: resolvedWa.digits,
      studioTitle: studioTitleForm.trim() || `${cleanName} Cutsss`,
      address: addressForm.trim() || config.address,
      neighborhood: neighborhoodForm.trim() || config.neighborhood,
      transferAlias: transferAliasForm.trim() || config.transferAlias,
      mainPriceDisplay: mainPriceForm.trim() || config.mainPriceDisplay,
      heroSubtitle: heroSubtitleForm.trim() || config.heroSubtitle,
      bio: bioForm.trim() || config.bio,
      promoBannerText: promoBannerTextForm.trim(),
    });

    triggerToast(
      `Configuración guardada: ${cleanName} · IG: ${cleanIg} · WA: ${
        whatsappDisplayForm.trim() || resolvedWa.display
      }`
    );
  };

  const handleExportAppointmentsCSV = () => {
    playMechanicalClick();
    const headers = [
      'ID',
      'Fecha',
      'Horario',
      'Cliente',
      'WhatsApp',
      'Servicios',
      'Minutos',
      'Modalidad Pago',
      'Estado',
    ];
    const rows = appointments.map((a) => [
      a.id,
      a.date,
      a.startTime,
      `"${a.clientName.replace(/"/g, '""')}"`,
      `"${a.whatsapp}"`,
      `"${a.serviceNames.join(' + ')}"`,
      String(a.serviceMinutes),
      a.paymentOption === 'deposit' ? 'Seña Transferencia' : 'Pago en Estudio',
      a.status,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agenda-rodrigo-cutsss-${todayStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast('Agenda exportada en archivo CSV');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsCompressingPhoto(true);
      const dataUrl = await compressImageFile(file);
      setPhotoPreviewUrl(dataUrl);
    } catch {
      triggerToast('No se pudo procesar la imagen seleccionada');
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  const handleCreateGalleryPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoPreviewUrl.trim()) {
      triggerToast('Seleccioná una foto desde tu dispositivo o pegá una URL');
      return;
    }

    addGalleryItem({
      id: `gal-admin-${Date.now()}`,
      title: photoTitle.trim() || `Trabajo en el Estudio · ${config.studioTitle}`,
      category: photoCategory || 'General',
      imageUrl: photoPreviewUrl.trim(),
      description:
        photoDescription.trim() ||
        `Foto subida por ${config.authorName} desde el estudio privado en ${config.address}, ${config.neighborhood}.`,
      technicalSpec: photoTechnicalSpec.trim() || 'Clipper & Shaver 0.0mm · Atención 1 a 1',
      dateLabel: 'Reciente · VT',
      likes: 25,
      tags: ['RodrigoCutsss', 'VenadoTuerto'],
      priceLabel: photoPriceTag.trim() || config.mainPriceDisplay,
      hideBuyButton: photoHideBuyButton,
      hidePrice: photoHidePrice,
    });

    setPhotoTitle('');
    setPhotoDescription('');
    setPhotoTechnicalSpec('');
    setPhotoPreviewUrl('');
    setPhotoHideBuyButton(false);
    setPhotoHidePrice(false);
    setIsUploadModalOpen(false);
    triggerToast('Foto publicada en la galería del sitio');
  };

  // Metric computations for today
  const todayAppointments = appointments.filter((a) => a.date === todayStr);
  const totalRevenueEst = appointments.reduce((acc, app) => {
    const matchedService = services.find((s) => app.serviceNames.includes(s.name));
    return acc + (matchedService ? matchedService.price : 12000);
  }, 0);

  const igInfo = resolveInstagramInfo(config.instagram);
  const waInfo = resolveWhatsAppInfo(config.phoneDisplay, config.whatsappRaw);
  const normalizedOrder = normalizeSectionOrder(config.sectionOrder);

  // If not authenticated, render refined PIN screen
  if (!isAdminAuthenticated) {
    return (
      <div className="py-16 md:py-24 px-4 flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md p-6 md:p-8 rounded-2xl border border-[#232730] bg-[#111318] text-white shadow-2xl concrete-overlay">
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-[#F59E0B] text-zinc-950 flex items-center justify-center font-bold text-xl mb-5 shadow-md">
              <Lock className="w-6 h-6 stroke-[2.5]" />
            </div>

            <span className="font-mono text-xs uppercase text-[#F59E0B] font-bold block mb-1">
              PORTAL DEL BARBERO · CONTROL TOTAL
            </span>
            <h1 className="font-display text-2xl md:text-3xl font-extrabold mb-2">
              Acceso Privado de Estudio
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              Ingresá tu PIN para ordenar secciones, elegir paleta urbana, ajustar precios masivos, configurar horarios o gestionar turnos en vivo.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-pin"
                  className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 font-semibold"
                >
                  PIN de Seguridad
                </label>
                <input
                  id="admin-pin"
                  type="password"
                  maxLength={8}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError('');
                  }}
                  placeholder="1234"
                  className="w-full h-12 px-3.5 text-center tracking-[0.4em] text-xl font-mono font-bold rounded-xl border border-[#282D37] bg-[#0C0E12] text-white focus:border-[#F59E0B] focus:outline-none"
                  autoFocus
                />
                {pinError && <p className="text-xs text-red-400 mt-2 font-mono">{pinError}</p>}
              </div>

              <button
                type="submit"
                onClick={playMechanicalClick}
                onMouseEnter={playMechanicalHover}
                className="w-full h-12 uppercase font-black text-xs tracking-wider bg-[#F59E0B] text-zinc-950 rounded-xl hover:bg-[#D97706] transition-all cursor-pointer shadow-lg active:scale-95"
              >
                Entrar al Panel de Control
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#1E222B] text-center">
              <p className="text-xs font-mono text-zinc-500">
                PIN maestro por defecto:{' '}
                <strong className="text-[#F59E0B]">{config.adminPin || '1234'}</strong>
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
      </div>
    );
  }

  const displayedAppointments = appointments
    .filter((a) => (appointmentFilter === 'today' ? a.date === todayStr : true))
    .filter((a) => {
      if (!appointmentSearch.trim()) return true;
      const q = appointmentSearch.toLowerCase();
      return (
        a.clientName.toLowerCase().includes(q) ||
        a.whatsapp.toLowerCase().includes(q) ||
        a.serviceNames.join(' ').toLowerCase().includes(q)
      );
    });

  const visibleSectionsCount =
    (config.showHeroSection !== false ? 1 : 0) +
    normalizedOrder.filter((id) => config[SECTION_ADMIN_META[id].key] !== false).length;

  return (
    <div className="py-8 md:py-12 px-4 sm:px-6 max-w-[1380px] mx-auto text-white space-y-8">
      {/* Toast Notification */}
      {saveToast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-[#F59E0B] text-zinc-950 font-bold rounded-xl shadow-2xl text-xs font-mono flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Bar for Admin */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#232730]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#F59E0B] font-bold mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>CENTRO DE MANDO DEL ESTUDIO · {config.authorName.toUpperCase()}</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-black uppercase">
            Panel de Control Total
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              playMechanicalClick();
              setIsUploadModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-black uppercase bg-[#F59E0B] text-zinc-950 rounded-xl shadow-sm hover:bg-[#D97706] cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>+ Subir Foto a Galería</span>
          </button>

          <button
            onClick={() => navigateTo('home')}
            className="px-4 py-2 text-xs font-mono font-bold rounded-xl border border-[#282D37] bg-[#161920] hover:border-[#F59E0B] transition-colors cursor-pointer"
          >
            Ver Sitio Público
          </button>
          <button
            onClick={logoutAdmin}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold rounded-xl bg-red-950/40 text-red-400 border border-red-800/40 hover:bg-red-900/40 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>
      </div>

      {/* Barbero Quick KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-[#232730] bg-[#111318] distressed-surface">
          <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 block">
            Turnos de Hoy ({todayStr})
          </span>
          <p className="font-display text-2xl font-black text-white mt-0.5">
            {todayAppointments.length} Turnos Hoy
          </p>
          <p className="text-[11px] font-mono text-[#F59E0B] mt-0.5">
            {appointments.length} turnos totales · {formatPriceARS(totalRevenueEst)} est.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-[#232730] bg-[#111318] distressed-surface">
          <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 block">
            Ocupación &amp; Servicio Top (Backend)
          </span>
          <p className="font-display text-2xl font-black text-[#00F0FF] mt-0.5 tabular-nums">
            {backendMetrics ? `${backendMetrics.todayOccupancyPercentage}% Ocupado` : `${visibleSectionsCount}/8 Activas`}
          </p>
          <p className="text-[11px] font-mono text-zinc-400 mt-0.5 truncate">
            {backendMetrics
              ? `Top: ${backendMetrics.topServiceName}`
              : `Modo: ${config.layoutMode === 'tabs' ? 'Pestañas Individuales' : 'Flujo Completo'}`}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-[#232730] bg-[#111318] distressed-surface">
          <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 block">
            Barbero &amp; Redes Activas
          </span>
          <p className="font-mono text-sm font-black text-white mt-1 truncate">
            {config.authorName} · {igInfo.handle}
          </p>
          <p className="text-[11px] font-mono text-zinc-400 mt-0.5 truncate">
            WA: {waInfo.display}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-[#232730] bg-[#111318] distressed-surface">
          <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 block">
            Estado de la Agenda Hoy
          </span>
          <p className="font-display text-xl font-bold text-white mt-0.5">
            {config.walkInStatus === 'available' ? 'Turnos Abiertos' : 'Agenda Completa'}
          </p>
          <button
            onClick={() => {
              const newStatus = config.walkInStatus === 'available' ? 'booked_full' : 'available';
              updateConfig({ walkInStatus: newStatus });
              triggerToast(
                `Estado actualizado: ${
                  newStatus === 'available' ? 'Turnos abiertos hoy' : 'Agenda Completa'
                }`
              );
            }}
            className="text-[11px] font-mono text-[#F59E0B] hover:underline mt-0.5 cursor-pointer"
          >
            Cambiar disponibilidad en vivo &rarr;
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-[#232730]">
        {[
          {
            id: 'sections_profile',
            label: 'Arquitectura, Orden de Secciones & Perfil',
            icon: Sliders,
          },
          {
            id: 'business_rules',
            label: 'Horarios, Reglas & Diseño Urbano',
            icon: Settings,
          },
          { id: 'appointments', label: `Turnos en Vivo (${appointments.length})`, icon: Calendar },
          { id: 'services', label: `Servicios & Precios (${services.length})`, icon: DollarSign },
          { id: 'gallery', label: `Galería de Fotos (${galleryItems.length})`, icon: Camera },
          { id: 'calendar', label: `Bloqueos de Horario (${blockedSlots.length})`, icon: Clock },
          {
            id: 'server_audit',
            label: `Servidor, Métricas & Auditoría (${auditLogs.length})`,
            icon: Shield,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-mono font-bold transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#F59E0B] text-zinc-950 shadow-sm'
                  : 'bg-[#111318] border border-[#232730] text-zinc-400 hover:text-white hover:border-zinc-500'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================== */}
      {/* TAB 0: ARQUITECTURA, ORDEN DE SECCIONES, SWITCHES & PERFIL                  */}
      {/* =========================================================================== */}
      {activeTab === 'sections_profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Live Section Reordering & Layout Architecture */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 rounded-2xl border border-[#232730] bg-[#111318] space-y-5 shadow-xl">
              <div className="border-b border-[#1E222B] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-mono uppercase text-[#F59E0B] font-bold mb-1">
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>ARQUITECTURA Y JERARQUÍA DEL SITIO WEB</span>
                  </div>
                  <h2 className="font-display text-2xl font-bold text-white">
                    Orden de Secciones &amp; Switches
                  </h2>
                  <p className="text-xs text-zinc-400 font-mono mt-1">
                    Subí o bajá cada sección para decidir qué ven primero tus clientes (por ejemplo: Sacar Turno arriba y Reseñas antes que Ubicación).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playMechanicalClick();
                    updateConfig({ sectionOrder: [...DEFAULT_SECTION_ORDER] });
                    triggerToast('Orden recomendado restaurado (Sacar Turno #1, Reseñas arriba)');
                  }}
                  className="px-3 py-2 rounded-xl border border-[#282D37] bg-[#161920] hover:border-[#F59E0B] text-[11px] font-mono font-bold text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Orden Recomendado</span>
                </button>
              </div>

              {/* Site Layout Mode Selector */}
              <div className="p-4 rounded-xl bg-[#0C0E14] border border-[#232836] space-y-2.5">
                <span className="font-mono text-[11px] uppercase text-[#00F0FF] font-bold block">
                  Modo de Estructura Principal del Sitio:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      playMechanicalClick();
                      updateConfig({ layoutMode: 'landing' });
                      triggerToast('Estructura cambiada a Flujo Completo Optimizado (Landing)');
                    }}
                    className={`p-3 rounded-xl border text-left font-mono text-xs transition-all cursor-pointer ${
                      (config.layoutMode || 'landing') === 'landing'
                        ? 'border-[#F59E0B] bg-[#F59E0B]/15 text-white font-bold'
                        : 'border-[#232730] bg-[#111318] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="block font-black text-[#F59E0B]">
                      1. Landing de Flujo Completo
                    </span>
                    <span className="text-[11px] text-zinc-400 block mt-0.5">
                      Muestra todas las secciones activas en el orden exacto de abajo.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playMechanicalClick();
                      updateConfig({ layoutMode: 'tabs' });
                      triggerToast('Estructura cambiada a Vista por Pestañas Individuales');
                    }}
                    className={`p-3 rounded-xl border text-left font-mono text-xs transition-all cursor-pointer ${
                      config.layoutMode === 'tabs'
                        ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-white font-bold'
                        : 'border-[#232730] bg-[#111318] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="block font-black text-[#00F0FF]">
                      2. Sitio por Pestañas Individuales
                    </span>
                    <span className="text-[11px] text-zinc-400 block mt-0.5">
                      Muestra una sola sección enfocada a la vez sin scroll largo.
                    </span>
                  </button>
                </div>
              </div>

              {/* Fixed Portada Switch */}
              <div className="p-4 rounded-xl border border-[#282D37] bg-[#161920] flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#F59E0B]/20 text-[#F59E0B] font-mono text-[10px] font-black">
                      PORTADA
                    </span>
                    <span className="font-mono text-xs font-bold text-white">
                      Presentación Principal &amp; Próximo Turno Libre (#inicio)
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-zinc-400 mt-1">
                    Cabecera principal con mural graffiti, indicador de próximo turno hoy y accesos rápidos.
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={config.showHeroSection !== false}
                  aria-label="Mostrar u ocultar Portada Principal"
                  onClick={() => {
                    playMechanicalClick();
                    const nextVal = config.showHeroSection === false;
                    updateConfig({ showHeroSection: nextVal });
                    triggerToast(
                      `Portada Principal: ${nextVal ? 'Visible' : 'Oculta'}`
                    );
                  }}
                  className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    config.showHeroSection !== false ? 'bg-[#F59E0B]' : 'bg-[#252934]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-zinc-950 transition ${
                      config.showHeroSection !== false
                        ? 'translate-x-6'
                        : 'translate-x-0 bg-zinc-400'
                    }`}
                  />
                </button>
              </div>

              {/* Reorderable Dynamic Sections */}
              <div className="space-y-2.5">
                {normalizedOrder.map((secId, index) => {
                  const meta = SECTION_ADMIN_META[secId];
                  const isEnabled = config[meta.key] !== false;
                  return (
                    <div
                      key={secId}
                      className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isEnabled
                          ? 'bg-[#161920] border-[#282D37]'
                          : 'bg-[#0C0E12] border-[#1E222B] opacity-70'
                      }`}
                    >
                      {/* Up / Down Order Controls */}
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => {
                            playMechanicalClick();
                            moveSectionInOrder(secId, 'up');
                            triggerToast(`"${meta.label}" subida a posición #${index}`);
                          }}
                          title="Subir sección"
                          className="w-7 h-7 rounded-lg border border-[#2C3240] bg-[#0C0E12] hover:border-[#F59E0B] text-zinc-300 hover:text-[#F59E0B] flex items-center justify-center disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === normalizedOrder.length - 1}
                          onClick={() => {
                            playMechanicalClick();
                            moveSectionInOrder(secId, 'down');
                            triggerToast(`"${meta.label}" bajada a posición #${index + 2}`);
                          }}
                          title="Bajar sección"
                          className="w-7 h-7 rounded-lg border border-[#2C3240] bg-[#0C0E12] hover:border-[#F59E0B] text-zinc-300 hover:text-[#F59E0B] flex items-center justify-center disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-[#00F0FF]/15 text-[#00F0FF] font-mono text-[10px] font-black">
                            #{index + 1}
                          </span>
                          <span className="font-mono text-xs font-bold text-white">
                            {meta.label}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                              isEnabled
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                            }`}
                          >
                            {isEnabled ? 'Visible' : 'Oculta'}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-zinc-400 mt-1">
                          {meta.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={isEnabled}
                        aria-label={`Mostrar u ocultar ${meta.label}`}
                        onClick={() => {
                          playMechanicalClick();
                          updateConfig({ [meta.key]: !isEnabled });
                          triggerToast(
                            `${meta.label}: ${
                              !isEnabled ? 'Visible en portada' : 'Ocultada en portada'
                            }`
                          );
                        }}
                        className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isEnabled ? 'bg-[#F59E0B]' : 'bg-[#252934]'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-zinc-950 shadow-md ring-0 transition duration-200 ease-in-out ${
                            isEnabled ? 'translate-x-6' : 'translate-x-0 bg-zinc-400'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Form to update Barber Name, Instagram Link, WhatsApp Link & Card Switches */}
          <div className="lg:col-span-6 space-y-6">
            <form
              onSubmit={handleSaveProfileAndLinks}
              className="p-6 rounded-2xl border border-[#232730] bg-[#111318] space-y-5 shadow-xl"
            >
              <div className="border-b border-[#1E222B] pb-4">
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase text-[#F59E0B] font-bold mb-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>FORMULARIO DE IDENTIDAD Y CONTACTO GLOBAL</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-white">
                  Barbero, Instagram, WhatsApp &amp; Banner
                </h2>
                <p className="text-xs text-zinc-400 font-mono mt-1">
                  Actualizá el nombre del barbero, enlaces de Instagram/WhatsApp, alias y anuncio superior.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="admin-barber-name"
                    className="block text-xs font-mono text-zinc-300 mb-1.5 font-bold uppercase"
                  >
                    Nombre del Barbero *
                  </label>
                  <input
                    id="admin-barber-name"
                    name="authorName"
                    type="text"
                    required
                    value={barberNameForm}
                    onChange={(e) => setBarberNameForm(e.target.value)}
                    placeholder="Ej. Rodrigo"
                    className="w-full h-11 px-3.5 text-sm font-mono rounded-xl border border-[#282D37] bg-[#0C0E12] text-white focus:border-[#F59E0B] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="admin-instagram-link"
                    className="block text-xs font-mono text-zinc-300 mb-1.5 font-bold uppercase"
                  >
                    Enlace o Usuario de Instagram *
                  </label>
                  <input
                    id="admin-instagram-link"
                    name="instagram"
                    type="text"
                    required
                    value={instagramForm}
                    onChange={(e) => setInstagramForm(e.target.value)}
                    placeholder="@rodrigo.cutsss o https://instagram.com/rodrigo.cutsss"
                    className="w-full h-11 px-3.5 text-sm font-mono rounded-xl border border-[#282D37] bg-[#0C0E12] text-white focus:border-[#F59E0B] focus:outline-none"
                  />
                  <span className="text-[11px] font-mono text-zinc-500 block mt-1">
                    Enlace activo:{' '}
                    <strong className="text-zinc-300">
                      {resolveInstagramInfo(instagramForm).url}
                    </strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="admin-whatsapp-display"
                      className="block text-xs font-mono text-zinc-300 mb-1.5 font-bold uppercase"
                    >
                      WhatsApp (Número o Enlace) *
                    </label>
                    <input
                      id="admin-whatsapp-display"
                      name="whatsapp"
                      type="text"
                      required
                      value={whatsappDisplayForm}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWhatsappDisplayForm(val);
                        const digits = val.replace(/\D/g, '');
                        if (digits.length >= 8) {
                          setWhatsappRawForm(digits);
                        }
                      }}
                      placeholder="+54 9 3462 55-4421"
                      className="w-full h-11 px-3.5 text-sm font-mono rounded-xl border border-[#282D37] bg-[#0C0E12] text-white focus:border-[#F59E0B] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="admin-whatsapp-raw"
                      className="block text-xs font-mono text-zinc-300 mb-1.5 font-bold uppercase"
                    >
                      WhatsApp (Dígitos para wa.me)
                    </label>
                    <input
                      id="admin-whatsapp-raw"
                      name="whatsappRaw"
                      type="text"
                      value={whatsappRawForm}
                      onChange={(e) => setWhatsappRawForm(e.target.value.replace(/\D/g, ''))}
                      placeholder="5493462554421"
                      className="w-full h-11 px-3.5 text-sm font-mono rounded-xl border border-[#282D37] bg-[#0C0E12] text-white focus:border-[#F59E0B] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#1E222B]">
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1 font-semibold">
                      Nombre del Estudio / Marca
                    </label>
                    <input
                      type="text"
                      value={studioTitleForm}
                      onChange={(e) => setStudioTitleForm(e.target.value)}
                      className="w-full h-10 px-3 text-xs font-mono rounded-xl border border-[#282D37] bg-[#0C0E12] text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1 font-semibold">
                      Precio Principal Destacado
                    </label>
                    <input
                      type="text"
                      value={mainPriceForm}
                      onChange={(e) => setMainPriceForm(e.target.value)}
                      className="w-full h-10 px-3 text-xs font-mono rounded-xl border border-[#282D37] bg-[#0C0E12] text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1 font-semibold">
                      Dirección del Estudio
                    </label>
                    <input
                      type="text"
                      value={addressForm}
                      onChange={(e) => setAddressForm(e.target.value)}
                      className="w-full h-10 px-3 text-xs font-mono rounded-xl border border-[#282D37] bg-[#0C0E12] text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1 font-semibold">
                      Alias de Transferencia / Seña
                    </label>
                    <input
                      type="text"
                      value={transferAliasForm}
                      onChange={(e) => setTransferAliasForm(e.target.value)}
                      className="w-full h-10 px-3 text-xs font-mono rounded-xl border border-[#282D37] bg-[#0C0E12] text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1 font-semibold">
                    Texto del Banner Superior de Anuncio
                  </label>
                  <input
                    type="text"
                    value={promoBannerTextForm}
                    onChange={(e) => setPromoBannerTextForm(e.target.value)}
                    placeholder="Ej. AGENDA ABIERTA ESTA SEMANA · VUELTA DE OBLIGADO 931"
                    className="w-full h-10 px-3 text-xs font-mono rounded-xl border border-[#282D37] bg-[#0C0E12] text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#1E222B] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <Instagram className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>{resolveInstagramInfo(instagramForm).handle}</span>
                  <span>·</span>
                  <MessageCircle className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>{whatsappDisplayForm}</span>
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 text-xs font-mono font-black uppercase tracking-wider bg-[#F59E0B] text-zinc-950 rounded-xl hover:bg-[#D97706] cursor-pointer shadow-md active:scale-95 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Perfil y Enlaces</span>
                </button>
              </div>
            </form>

            {/* Card Elements Visibility Switches */}
            <div className="p-6 rounded-2xl border border-[#232730] bg-[#111318] space-y-4 shadow-xl">
              <div className="border-b border-[#1E222B] pb-3">
                <span className="text-[10px] font-mono uppercase text-[#F59E0B] font-bold block">
                  ELEMENTOS INTERNOS DE LAS TARJETAS
                </span>
                <h3 className="font-display text-xl font-bold text-white">
                  Switches de Botones de Compra y Precios
                </h3>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                {[
                  {
                    key: 'showServiceBookingButton' as const,
                    label: 'Botón "Agendar Este Corte" en Tarjetas de Servicios',
                    desc: 'Desactivalo si querés que las tarjetas de servicios sean solo informativas',
                  },
                  {
                    key: 'showServicePrice' as const,
                    label: 'Precios en Tarjetas de Servicios',
                    desc: 'Muestra u oculta los precios en pesos en la carta de servicios',
                  },
                  {
                    key: 'showGalleryBookingButton' as const,
                    label: 'Botón "Reservar turno" en Tarjetas de Galería',
                    desc: 'Muestra u oculta el botón de reserva debajo de cada foto',
                  },
                  {
                    key: 'showGalleryPriceBadge' as const,
                    label: 'Etiqueta de Precio en Fotos de Galería',
                    desc: 'Muestra u oculta la etiqueta de valor sobre cada foto',
                  },
                  {
                    key: 'showGalleryFilter' as const,
                    label: 'Pestañas de Categorías en la Galería',
                    desc: 'Permite mostrar todas las fotos juntas o con pestañas por categoría',
                  },
                ].map((item) => {
                  const enabled = Boolean(config[item.key]);
                  return (
                    <div
                      key={item.key}
                      className="p-3.5 rounded-xl border border-[#232730] bg-[#161920] flex items-center justify-between gap-3"
                    >
                      <div>
                        <span className="font-bold text-white block">{item.label}</span>
                        <span className="text-[11px] text-zinc-400 block mt-0.5">
                          {item.desc}
                        </span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={enabled}
                        aria-label={item.label}
                        onClick={() => {
                          playMechanicalClick();
                          updateConfig({ [item.key]: !enabled });
                          triggerToast(`${item.label}: ${!enabled ? 'Activo' : 'Oculto'}`);
                        }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          enabled ? 'bg-[#F59E0B]' : 'bg-[#252934]'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-zinc-950 transition duration-200 ease-in-out ${
                            enabled ? 'translate-x-5' : 'translate-x-0 bg-zinc-400'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================== */}
      {/* TAB 1: HORARIOS, REGLAS DE NEGOCIO, TEMAS URBANOS & EFECTOS VISUALES        */}
      {/* =========================================================================== */}
      {activeTab === 'business_rules' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Business Rules, Opening/Closing Hours, Open Days, Buffer & PIN */}
          <div className="lg:col-span-7 p-6 rounded-2xl border border-[#232730] bg-[#111318] space-y-6 shadow-xl">
            <div className="border-b border-[#1E222B] pb-4">
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase text-[#F59E0B] font-bold mb-1">
                <Settings className="w-3.5 h-3.5" />
                <span>LÓGICA DE NEGOCIO Y MOTOR DE TURNOS</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-white">
                Horarios de Jornada, Días Abiertos, Señas y PIN
              </h2>
              <p className="text-xs text-zinc-400 font-mono mt-1">
                Estos parámetros gobiernan automáticamente los horarios que se muestran disponibles en el turnero de la portada.
              </p>
            </div>

            {/* Active Days of the Week */}
            <div className="space-y-2">
              <label className="block text-xs font-mono text-zinc-300 font-bold uppercase">
                Días de Atención Activos en el Turnero:
              </label>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS_LIST.map((d) => {
                  const isDayOpen = config.openDays.includes(d.day);
                  return (
                    <button
                      key={d.day}
                      type="button"
                      onClick={() => {
                        playMechanicalClick();
                        const nextDays = isDayOpen
                          ? config.openDays.filter((x) => x !== d.day)
                          : [...config.openDays, d.day].sort();
                        if (nextDays.length === 0) {
                          triggerToast('Debe haber al menos 1 día activo en la semana');
                          return;
                        }
                        updateConfig({ openDays: nextDays });
                        triggerToast(`Día ${d.full}: ${isDayOpen ? 'Cerrado' : 'Abierto'}`);
                      }}
                      className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer ${
                        isDayOpen
                          ? 'bg-[#F59E0B] text-zinc-950 border-[#F59E0B]'
                          : 'bg-[#0C0E12] text-zinc-400 border-[#282D37] hover:text-white'
                      }`}
                    >
                      {d.full}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Opening Hour, Closing Hour, Buffer & Courtesy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <label className="block text-zinc-300 mb-1.5 font-bold uppercase">
                  Hora de Apertura (Formato 24h)
                </label>
                <input
                  type="number"
                  min={7}
                  max={20}
                  value={config.openingHour}
                  onChange={(e) => {
                    const val = Math.max(7, Math.min(20, Number(e.target.value)));
                    updateConfig({ openingHour: val });
                  }}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#282D37] bg-[#0C0E12] text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1.5 font-bold uppercase">
                  Hora de Cierre (Formato 24h)
                </label>
                <input
                  type="number"
                  min={12}
                  max={23}
                  value={config.closingHour}
                  onChange={(e) => {
                    const val = Math.max(12, Math.min(23, Number(e.target.value)));
                    updateConfig({ closingHour: val });
                  }}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#282D37] bg-[#0C0E12] text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1.5 font-bold uppercase">
                  Buffer de Limpieza Entre Turnos (min)
                </label>
                <select
                  value={config.cleanBufferMinutes}
                  onChange={(e) => {
                    updateConfig({ cleanBufferMinutes: Number(e.target.value) });
                    triggerToast(`Buffer actualizado a ${e.target.value} min`);
                  }}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#282D37] bg-[#0C0E12] text-white font-bold"
                >
                  <option value={0}>0 min (Sin pausa)</option>
                  <option value={5}>5 min</option>
                  <option value={10}>10 min (Recomendado)</option>
                  <option value={15}>15 min</option>
                  <option value={20}>20 min</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1.5 font-bold uppercase">
                  Porcentaje de Seña por Transferencia (%)
                </label>
                <select
                  value={config.depositPercentage}
                  onChange={(e) => {
                    updateConfig({ depositPercentage: Number(e.target.value) });
                    triggerToast(`Porcentaje de seña: ${e.target.value}%`);
                  }}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#282D37] bg-[#0C0E12] text-white font-bold"
                >
                  <option value={20}>20% de seña</option>
                  <option value={30}>30% de seña (Recomendado)</option>
                  <option value={50}>50% de seña</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1.5 font-bold uppercase">
                  Texto Visible de Horarios
                </label>
                <input
                  type="text"
                  value={scheduleDisplayForm}
                  onChange={(e) => setScheduleDisplayForm(e.target.value)}
                  onBlur={() => updateConfig({ scheduleDisplay: scheduleDisplayForm })}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#282D37] bg-[#0C0E12] text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1.5 font-bold uppercase">
                  PIN Maestro del Panel Admin
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={8}
                    value={adminPinForm}
                    onChange={(e) => setAdminPinForm(e.target.value)}
                    className="flex-1 h-11 px-3.5 rounded-xl border border-[#282D37] bg-[#0C0E12] text-[#F59E0B] font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!adminPinForm.trim()) return;
                      updateConfig({ adminPin: adminPinForm.trim() });
                      triggerToast(`Nuevo PIN guardado: ${adminPinForm.trim()}`);
                    }}
                    className="px-4 rounded-xl bg-[#F59E0B] text-zinc-950 font-black uppercase cursor-pointer"
                  >
                    Guardar PIN
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Urban Aesthetic Theme Preset & Visual Effects Controls */}
          <div className="lg:col-span-5 p-6 rounded-2xl border border-[#232730] bg-[#111318] space-y-6 shadow-xl">
            <div className="border-b border-[#1E222B] pb-4">
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase text-[#00F0FF] font-bold mb-1">
                <Palette className="w-3.5 h-3.5" />
                <span>DIRECCIÓN DE ARTE &amp; ESTÉTICA URBANA</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-white">
                Paleta de Colores &amp; Efectos
              </h2>
              <p className="text-xs text-zinc-400 font-mono mt-1">
                Elegí la atmósfera cromática del sitio y controlá los efectos interactivos de aerosol y parallax.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  {
                    id: 'amber',
                    name: 'Street Gold & Cyan',
                    desc: 'Ámbar urbano, fuego y cian eléctrico',
                    swatch: '#F59E0B',
                  },
                  {
                    id: 'uv',
                    name: 'UV Street Neon (Luz Negra)',
                    desc: 'Cian fosforescente, ácido y magenta',
                    swatch: '#00F0FF',
                  },
                  {
                    id: 'crimson',
                    name: 'Crimson Spray Atelier',
                    desc: 'Rojo aerosol intenso, naranja y oro',
                    swatch: '#F43F5E',
                  },
                  {
                    id: 'volt',
                    name: 'Acid Volt & Concrete',
                    desc: 'Lima eléctrico, cian y hormigón',
                    swatch: '#CCFF00',
                  },
                ] as { id: UrbanThemePreset; name: string; desc: string; swatch: string }[]
              ).map((preset) => {
                const active = (config.urbanTheme || 'amber') === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      playMechanicalClick();
                      updateConfig({ urbanTheme: preset.id });
                      triggerToast(`Tema urbano activado: ${preset.name}`);
                    }}
                    className={`p-3.5 rounded-xl border text-left font-mono transition-all cursor-pointer ${
                      active
                        ? 'border-white bg-[#191E2B] shadow-md'
                        : 'border-[#252A36] bg-[#0C0E14] hover:border-zinc-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: preset.swatch }}
                      />
                      <span className="text-xs font-black text-white">{preset.name}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">{preset.desc}</p>
                  </button>
                );
              })}
            </div>

            <div className="space-y-3 pt-2 border-t border-[#1E222B] text-xs font-mono">
              {[
                {
                  key: 'showPromoBanner' as const,
                  label: 'Banner Superior de Anuncio / Promo',
                  desc: 'Muestra la barra superior con anuncio rápido y botón directo a reservar',
                },
                {
                  key: 'enableParallax' as const,
                  label: 'Efecto Parallax Urbano Multicapa',
                  desc: 'Fondo arquitectónico y mural reactivo al movimiento del mouse y scroll',
                },
                {
                  key: 'enableDripTrail' as const,
                  label: 'Rastro de Aerosol (Graffiti Drip Trail)',
                  desc: 'Efecto artístico de trazos de spray al desplazarse por la página',
                },
              ].map((fx) => {
                const isOn = config[fx.key] !== false;
                return (
                  <div
                    key={fx.key}
                    className="p-3.5 rounded-xl border border-[#232730] bg-[#161920] flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="font-bold text-white block">{fx.label}</span>
                      <span className="text-[11px] text-zinc-400 block mt-0.5">{fx.desc}</span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isOn}
                      onClick={() => {
                        playMechanicalClick();
                        updateConfig({ [fx.key]: !isOn });
                        triggerToast(`${fx.label}: ${!isOn ? 'Activado' : 'Desactivado'}`);
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                        isOn ? 'bg-[#F59E0B]' : 'bg-[#252934]'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-zinc-950 transition ${
                          isOn ? 'translate-x-5' : 'translate-x-0 bg-zinc-400'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================== */}
      {/* TAB 2: APPOINTMENTS (LIVE SLOTS + CSV EXPORT + SEARCH + MANUAL BOOKING)     */}
      {/* =========================================================================== */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          {/* Quick Manual Appointment Creator */}
          <div className="p-5 rounded-2xl border border-[#232730] bg-[#111318] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#F59E0B] font-bold block">
                  CARGA RÁPIDA DE TURNO (OCUPA EL HORARIO EN VIVO AL INSTANTE)
                </span>
                <h3 className="font-display text-lg font-bold text-white">
                  Agendar Turno Manual (Cliente por WhatsApp o Presencial)
                </h3>
              </div>

              <button
                type="button"
                onClick={handleExportAppointmentsCSV}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#00F0FF]/50 bg-[#00F0FF]/10 hover:bg-[#00F0FF] text-[#00F0FF] hover:text-zinc-950 font-mono text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Agenda CSV</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs font-mono">
              <div>
                <label className="block text-zinc-400 mb-1">Fecha</label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#282D37] bg-[#0C0E12] text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Horario</label>
                <input
                  type="time"
                  value={manualTime}
                  onChange={(e) => setManualTime(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#282D37] bg-[#0C0E12] text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Servicio</label>
                <select
                  value={manualServiceId}
                  onChange={(e) => setManualServiceId(e.target.value)}
                  className="w-full h-10 px-2.5 rounded-lg border border-[#282D37] bg-[#0C0E12] text-white"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({formatPriceARS(s.price)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Cliente</label>
                <input
                  type="text"
                  value={manualClientName}
                  onChange={(e) => setManualClientName(e.target.value)}
                  placeholder="Ej. Franco Gómez"
                  className="w-full h-10 px-3 rounded-lg border border-[#282D37] bg-[#0C0E12] text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">WhatsApp</label>
                <input
                  type="text"
                  value={manualClientWhatsapp}
                  onChange={(e) => setManualClientWhatsapp(e.target.value)}
                  placeholder="+54 9 3462 ..."
                  className="w-full h-10 px-3 rounded-lg border border-[#282D37] bg-[#0C0E12] text-white"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!manualClientName.trim()) {
                      triggerToast('Ingresá el nombre del cliente para agendar');
                      return;
                    }
                    const chosenSrv =
                      services.find((s) => s.id === manualServiceId) || services[0];
                    const srvMin = chosenSrv ? chosenSrv.durationMinutes : 40;
                    const endMin =
                      timeToMinutes(manualTime) + srvMin + config.cleanBufferMinutes + 120;
                    addAppointment({
                      id: `app-manual-${Date.now()}`,
                      date: manualDate,
                      startTime: manualTime,
                      serviceMinutes: srvMin,
                      bufferMinutes: config.cleanBufferMinutes,
                      clientName: manualClientName.trim(),
                      whatsapp: manualClientWhatsapp.trim() || config.phoneDisplay,
                      serviceNames: [chosenSrv ? chosenSrv.name : 'Corte de Pelo & Fade'],
                      paymentOption: 'commitment',
                      status: 'confirmed',
                      reviewLoopScheduledAt: minutesToTime(endMin),
                    });
                    setManualClientName('');
                    setManualClientWhatsapp('');
                    triggerToast(`Turno agendado para ${manualDate} a las ${manualTime} hs`);
                  }}
                  className="w-full h-10 bg-[#F59E0B] hover:bg-[#D97706] text-zinc-950 font-mono font-black uppercase text-xs rounded-lg cursor-pointer"
                >
                  + Ocupar Turno
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold">Agenda de Turnos Confirmados</h2>
              <p className="text-xs font-mono text-zinc-400">
                Si cancelás un turno acá, ese horario vuelve a aparecer disponible en la portada inmediatamente.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={appointmentSearch}
                  onChange={(e) => setAppointmentSearch(e.target.value)}
                  placeholder="Buscar cliente o WhatsApp..."
                  className="h-9 pl-8 pr-3 rounded-lg border border-[#282D37] bg-[#0C0E12] text-xs font-mono text-white focus:border-[#F59E0B] focus:outline-none"
                />
              </div>

              <button
                onClick={() => setAppointmentFilter('today')}
                className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg border transition-colors cursor-pointer ${
                  appointmentFilter === 'today'
                    ? 'border-[#F59E0B] bg-[#F59E0B] text-zinc-950'
                    : 'border-[#232730] bg-[#111318] text-zinc-400 hover:text-white'
                }`}
              >
                Hoy {todayStr} ({todayAppointments.length})
              </button>
              <button
                onClick={() => setAppointmentFilter('all')}
                className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg border transition-colors cursor-pointer ${
                  appointmentFilter === 'all'
                    ? 'border-[#F59E0B] bg-[#F59E0B] text-zinc-950'
                    : 'border-[#232730] bg-[#111318] text-zinc-400 hover:text-white'
                }`}
              >
                Todos ({appointments.length})
              </button>
            </div>
          </div>

          {displayedAppointments.length === 0 ? (
            <div className="p-8 rounded-2xl border border-[#232730] bg-[#111318] text-center space-y-2">
              <p className="font-display text-lg font-bold text-white">
                No hay turnos registrados para este filtro
              </p>
              <p className="text-xs font-mono text-zinc-400">
                Todos los horarios dentro de la jornada están 100% libres en el calendario público.
              </p>
            </div>
          ) : (
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
                        ? 'border-[#1E222B] bg-[#0C0E12] opacity-70'
                        : 'border-[#232730] bg-[#111318]'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                        <span className="px-2.5 py-0.5 rounded bg-[#F59E0B] text-zinc-950 font-extrabold">
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
                        <span
                          className={
                            app.paymentOption === 'deposit'
                              ? 'text-emerald-400 font-bold'
                              : 'text-zinc-400'
                          }
                        >
                          {app.paymentOption === 'deposit'
                            ? `Seña ${config.depositPercentage}% Acreditada`
                            : 'Abono en el Estudio'}
                        </span>
                      </div>

                      <h3 className="font-display text-xl font-bold text-white">
                        {app.clientName}
                      </h3>

                      <p className="text-xs font-mono text-zinc-300">
                        Servicio:{' '}
                        <span className="text-white font-semibold">
                          {app.serviceNames.join(' + ')}
                        </span>
                      </p>

                      <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 pt-1">
                        <span>WhatsApp: {app.whatsapp}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      <a
                        href={`https://wa.me/${app.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Hola ${
                            app.clientName.split(' ')[0]
                          }! Te escribe ${config.authorName} de ${
                            config.studioTitle
                          } para confirmar tu turno del ${app.date} a las ${
                            app.startTime
                          } hs en ${config.address}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs font-mono font-bold hover:bg-emerald-500/20 flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          updateAppointmentStatus(
                            app.id,
                            isFinished ? 'confirmed' : 'completed'
                          );
                          triggerToast(
                            isFinished
                              ? 'Cita marcada como pendiente'
                              : 'Cita marcada como completada'
                          );
                        }}
                        className={`px-3 py-2 text-xs font-mono font-bold rounded-xl border transition-colors cursor-pointer ${
                          isFinished
                            ? 'border-zinc-700 text-zinc-400'
                            : 'border-[#F59E0B]/40 text-[#F59E0B] bg-[#F59E0B]/10'
                        }`}
                      >
                        {isFinished ? 'Reabrir' : 'Completado'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          cancelAppointment(app.id);
                          triggerToast(
                            `Turno de ${app.clientName} (${app.startTime} hs) cancelado y horario liberado`
                          );
                        }}
                        className="px-3 py-2 text-xs font-mono font-bold text-red-400 hover:text-white border border-red-500/30 hover:bg-red-500/20 rounded-xl flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Cancelar y Liberar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================== */}
      {/* TAB 3: GALLERY MANAGEMENT (ADMIN-ONLY UPLOAD + HIDE CARD ELEMENTS)          */}
      {/* =========================================================================== */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold">
                Galería de Fotos del Estudio (Exclusivo Admin)
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Subí cualquier foto sin complicarte con etiquetas. También podés ocultar el botón de compra/reserva, ocultar precios o pausar fotos.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 text-xs font-mono font-black uppercase tracking-wider bg-[#F59E0B] text-zinc-950 rounded-xl hover:bg-[#D97706] cursor-pointer shadow-md"
            >
              <Upload className="w-4 h-4" />
              <span>Subir Foto a la Galería</span>
            </button>
          </div>

          {/* Grid of Gallery Photos with Per-Card Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all ${
                  item.hidden
                    ? 'border-zinc-800 bg-[#0C0E12] opacity-60'
                    : 'border-[#232730] bg-[#111318]'
                }`}
              >
                <div className="h-52 overflow-hidden relative bg-black">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 bg-black/85 text-[#F59E0B] font-mono text-[10px] font-bold rounded-lg border border-[#F59E0B]/40">
                      {item.category}
                    </span>
                    {item.hidden && (
                      <span className="px-2 py-1 bg-red-600 text-white font-mono text-[10px] font-black rounded-lg uppercase">
                        OCULTA
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-white mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 mb-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Per-Card Element Visibility Controls */}
                  <div className="pt-3 border-t border-[#1E222B] space-y-2">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                      Ocultar / Mostrar en esta tarjeta:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          updateGalleryItem(item.id, { hidden: !item.hidden });
                          triggerToast(
                            !item.hidden
                              ? 'Foto ocultada del sitio público'
                              : 'Foto visible en el sitio público'
                          );
                        }}
                        className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold border cursor-pointer flex items-center gap-1 ${
                          item.hidden
                            ? 'border-red-500/50 bg-red-500/15 text-red-300'
                            : 'border-[#282D37] bg-[#161920] text-zinc-300 hover:text-white'
                        }`}
                      >
                        {item.hidden ? (
                          <EyeOff className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                        <span>{item.hidden ? 'Foto Oculta' : 'Foto Visible'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          updateGalleryItem(item.id, {
                            hideBuyButton: !item.hideBuyButton,
                          });
                          triggerToast(
                            !item.hideBuyButton
                              ? 'Botón Reservar/Comprar ocultado en esta tarjeta'
                              : 'Botón Reservar/Comprar activado en esta tarjeta'
                          );
                        }}
                        className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold border cursor-pointer ${
                          item.hideBuyButton
                            ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
                            : 'border-[#282D37] bg-[#161920] text-zinc-300 hover:text-white'
                        }`}
                      >
                        {item.hideBuyButton ? 'Sin Botón Compra' : 'Con Botón Compra'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          updateGalleryItem(item.id, { hidePrice: !item.hidePrice });
                          triggerToast(
                            !item.hidePrice
                              ? 'Precio ocultado en esta foto'
                              : 'Precio visible en esta foto'
                          );
                        }}
                        className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold border cursor-pointer ${
                          item.hidePrice
                            ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
                            : 'border-[#282D37] bg-[#161920] text-zinc-300 hover:text-white'
                        }`}
                      >
                        {item.hidePrice ? 'Precio Oculto' : 'Precio Visible'}
                      </button>
                    </div>

                    <div className="pt-2 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          deleteGalleryItem(item.id);
                          triggerToast('Foto eliminada de la galería');
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-red-400 hover:text-red-300 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar foto</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================== */}
      {/* TAB 4: SERVICES & PRICING (WITH BULK PRICE ADJUSTMENT & PER-CARD TOGGLES)   */}
      {/* =========================================================================== */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold">
                Servicios, Precios y Actualización Masiva
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Editá precios individuales o aplicá un ajuste porcentual en 1 clic a toda la carta (redondeado a múltiplos de $500 ARS).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[#111318] border border-[#232730] font-mono text-xs">
                <span className="px-2 text-zinc-400 font-bold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Ajuste Masivo:</span>
                </span>
                {[-10, 10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      playMechanicalClick();
                      bulkAdjustServicePrices(pct);
                      triggerToast(
                        `Precios de todos los servicios actualizados en ${
                          pct > 0 ? `+${pct}%` : `${pct}%`
                        }`
                      );
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-[#161920] hover:bg-[#F59E0B] text-zinc-200 hover:text-zinc-950 font-black border border-[#282D37] transition-colors cursor-pointer"
                  >
                    {pct > 0 ? `+${pct}%` : `${pct}%`}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setEditingService(null);
                  setServiceFormData({
                    index: String(services.length + 1).padStart(2, '0'),
                    category: 'Fades & Cortes',
                    name: '',
                    durationMinutes: 40,
                    price: 12000,
                    shortDescription: '',
                    preparation: ['Venir con el pelo limpio'],
                    executionSteps: [
                      'Diagnóstico',
                      'Degradé con clippers & shaver 0.0mm',
                      'Corte a tijera',
                      'Styling',
                    ],
                    aftercare: 'Recomendamos control cada 2 semanas.',
                    productsUsed: 'Babyliss FX3 · Shaver Titanio · Polvo mate',
                  });
                  setIsNewServiceModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-mono font-black uppercase tracking-wider bg-[#F59E0B] text-zinc-950 rounded-xl hover:bg-[#D97706] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Añadir Servicio</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {services.map((srv) => (
              <div
                key={srv.id}
                className={`p-5 md:p-6 rounded-xl border flex flex-col justify-between transition-all ${
                  srv.hidden
                    ? 'border-zinc-800 bg-[#0C0E12] opacity-60'
                    : 'border-[#232730] bg-[#111318]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-4 font-mono text-xs text-zinc-400 mb-2">
                    <span className="text-[#F59E0B] font-bold">
                      {srv.index}. {srv.category}
                    </span>
                    <span className="text-lg font-black text-white">
                      {formatPriceARS(srv.price)}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-white mb-1">
                    {srv.name}
                  </h3>
                  <p className="text-xs font-mono text-zinc-300 mb-2">
                    Duración en agenda: {srv.durationMinutes} minutos
                  </p>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    {srv.shortDescription}
                  </p>

                  {/* Per-Service Card Visibility Toggles */}
                  <div className="p-3 rounded-xl bg-[#161920] border border-[#232730] space-y-2 mb-3">
                    <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                      Opciones de visualización en la tarjeta:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          updateService(srv.id, { hidden: !srv.hidden });
                          triggerToast(
                            !srv.hidden
                              ? 'Servicio ocultado de la carta pública'
                              : 'Servicio activado en la carta pública'
                          );
                        }}
                        className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold border cursor-pointer ${
                          srv.hidden
                            ? 'border-red-500/50 bg-red-500/15 text-red-300'
                            : 'border-[#282D37] bg-[#111318] text-zinc-300'
                        }`}
                      >
                        {srv.hidden ? 'Tarjeta Oculta' : 'Tarjeta Visible'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          updateService(srv.id, {
                            hideBuyButton: !srv.hideBuyButton,
                          });
                          triggerToast(
                            !srv.hideBuyButton
                              ? 'Botón de compra/reserva ocultado en este servicio'
                              : 'Botón de compra/reserva visible en este servicio'
                          );
                        }}
                        className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold border cursor-pointer ${
                          srv.hideBuyButton
                            ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
                            : 'border-[#282D37] bg-[#111318] text-zinc-300'
                        }`}
                      >
                        {srv.hideBuyButton
                          ? 'Botón Reservar Oculto'
                          : 'Botón Reservar Activo'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          updateService(srv.id, { hidePrice: !srv.hidePrice });
                          triggerToast(
                            !srv.hidePrice
                              ? 'Precio ocultado en esta tarjeta'
                              : 'Precio visible en esta tarjeta'
                          );
                        }}
                        className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold border cursor-pointer ${
                          srv.hidePrice
                            ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
                            : 'border-[#282D37] bg-[#111318] text-zinc-300'
                        }`}
                      >
                        {srv.hidePrice ? 'Precio Oculto' : 'Precio Visible'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-[#1E222B] flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-mono">ID: {srv.id}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingService(srv);
                        setServiceFormData(srv);
                        setIsNewServiceModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-mono font-bold border border-[#282D37] rounded-lg hover:border-[#F59E0B] cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar Datos</span>
                    </button>
                    <button
                      onClick={() => {
                        deleteService(srv.id);
                        triggerToast('Servicio eliminado de la carta');
                      }}
                      className="p-1.5 text-zinc-500 hover:text-red-400 border border-[#282D37] rounded-lg cursor-pointer"
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

      {/* =========================================================================== */}
      {/* TAB 5: CALENDAR & BLOCKED SLOTS                                             */}
      {/* =========================================================================== */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl font-bold mb-1">
              Bloqueos de Horario &amp; Pausas del Barbero
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              Bloqueá franjas para almuerzo, descanso o mantenimiento de máquinas. Esos horarios desaparecen al instante del turnero público.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-[#232730] bg-[#111318]">
            <h3 className="font-mono text-xs uppercase text-[#F59E0B] font-bold mb-4">
              Bloquear Horario Específico
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1 font-semibold">
                  Fecha
                </label>
                <input
                  type="date"
                  value={newBlockedDate}
                  onChange={(e) => setNewBlockedDate(e.target.value)}
                  className="w-full h-10 px-3 text-xs font-mono rounded-lg border border-[#282D37] bg-[#0C0E12] text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1 font-semibold">
                  Hora de Inicio
                </label>
                <input
                  type="time"
                  value={newBlockedTime}
                  onChange={(e) => setNewBlockedTime(e.target.value)}
                  className="w-full h-10 px-3 text-xs font-mono rounded-lg border border-[#282D37] bg-[#0C0E12] text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1 font-semibold">
                  Duración (minutos)
                </label>
                <input
                  type="number"
                  step={15}
                  value={newBlockedDuration}
                  onChange={(e) => setNewBlockedDuration(Number(e.target.value))}
                  className="w-full h-10 px-3 text-xs font-mono rounded-lg border border-[#282D37] bg-[#0C0E12] text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1 font-semibold">
                  Motivo
                </label>
                <input
                  type="text"
                  value={newBlockedReason}
                  onChange={(e) => setNewBlockedReason(e.target.value)}
                  placeholder="Ej. Almuerzo o mantenimiento"
                  className="w-full h-10 px-3 text-xs font-mono rounded-lg border border-[#282D37] bg-[#0C0E12] text-white"
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
                  triggerToast('Franja horaria bloqueada en el calendario en vivo');
                }}
                className="px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider bg-[#F59E0B] text-zinc-950 rounded-lg hover:bg-[#D97706] cursor-pointer"
              >
                Bloquear Horario
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-display text-xl font-bold">
              Bloqueos Activos ({blockedSlots.length})
            </h3>
            {blockedSlots.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-xl border border-[#232730] bg-[#111318] flex items-center justify-between gap-4 font-mono text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">
                      {b.date} · {b.startTime} hs
                    </span>
                    <span className="text-[#F59E0B]">({b.durationMinutes} minutos)</span>
                  </div>
                  <p className="text-zinc-400 mt-0.5">{b.reason || 'Pausa de estudio'}</p>
                </div>

                <button
                  onClick={() => {
                    deleteBlockedSlot(b.id);
                    triggerToast('Bloqueo eliminado y horario liberado');
                  }}
                  className="text-red-400 hover:text-white px-3 py-1.5 border border-red-500/30 rounded-lg cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Liberar</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================== */}
      {/* TAB 6: SERVER TELEMETRY, REAL-TIME BUSINESS METRICS & SECURITY AUDIT LOGS   */}
      {/* =========================================================================== */}
      {activeTab === 'server_audit' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold">
                Estado del Servidor Full-Stack, Métricas &amp; Auditoría
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Monitoreo en tiempo real del motor de reservas anti-colisión, persistencia JSON y registro de seguridad.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                playMechanicalClick();
                refreshBackendState();
                triggerToast('Estado y métricas sincronizados con el servidor');
              }}
              className="px-4 py-2.5 rounded-xl bg-[#F59E0B] text-zinc-950 font-mono text-xs font-black uppercase tracking-wider cursor-pointer"
            >
              Sincronizar con Servidor Ahora
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-[#111318] border border-[#232730]">
              <span className="text-zinc-400 uppercase text-[10px] font-bold block">
                Conexión API /api/*
              </span>
              <p className="font-display text-xl font-black text-emerald-400 mt-1">
                {backendConnected ? 'ONLINE · SINCRONIZADO' : 'MODO LOCAL ACTIVO'}
              </p>
              <span className="text-[11px] text-zinc-400 block mt-0.5">
                Rate-Limiting &amp; Sanitización Activos
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#111318] border border-[#232730]">
              <span className="text-zinc-400 uppercase text-[10px] font-bold block">
                Ocupación de Jornada Hoy
              </span>
              <p className="font-display text-2xl font-black text-[#00F0FF] mt-1 tabular-nums">
                {backendMetrics ? `${backendMetrics.todayOccupancyPercentage}%` : '25%'}
              </p>
              <span className="text-[11px] text-zinc-400 block mt-0.5">
                {backendMetrics
                  ? `${backendMetrics.freeSlotsTodayCount} horarios libres hoy`
                  : 'Cálculo dinámico por bloques'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#111318] border border-[#232730]">
              <span className="text-zinc-400 uppercase text-[10px] font-bold block">
                Facturación Estimada Hoy
              </span>
              <p className="font-display text-2xl font-black text-[#F59E0B] mt-1 tabular-nums">
                {formatPriceARS(
                  backendMetrics ? backendMetrics.todayEstimatedRevenueARS : totalRevenueEst
                )}
              </p>
              <span className="text-[11px] text-zinc-400 block mt-0.5">
                Total general:{' '}
                {formatPriceARS(
                  backendMetrics ? backendMetrics.totalEstimatedRevenueARS : totalRevenueEst
                )}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#111318] border border-[#232730]">
              <span className="text-zinc-400 uppercase text-[10px] font-bold block">
                Modalidades Elegidas
              </span>
              <p className="font-display text-xl font-black text-white mt-1 tabular-nums">
                {backendMetrics
                  ? `${backendMetrics.depositAppointmentsCount} Seña / ${backendMetrics.commitmentAppointmentsCount} Estudio`
                  : `${appointments.length} Turnos Activos`}
              </p>
              <span className="text-[11px] text-[#CCFF00] block mt-0.5 truncate">
                {backendMetrics ? backendMetrics.nextAvailableSlotLabel : 'Agenda verificada'}
              </span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#111318] border border-[#232730] space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E222B] pb-3">
              <h3 className="font-display text-xl font-bold text-white">
                Registro de Auditoría y Operaciones del Servidor ({auditLogs.length})
              </h3>
              <span className="text-xs font-mono text-[#00F0FF]">
                Persistencia Atómica JSON
              </span>
            </div>

            {auditLogs.length === 0 ? (
              <p className="text-xs font-mono text-zinc-400">
                No hay eventos registrados aún en esta sesión.
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1 font-mono text-xs">
                {auditLogs.slice(0, 35).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-[#0C0E12] border border-[#1E222B] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#F59E0B]/15 text-[#F59E0B] text-[10px] font-black uppercase">
                          {log.action}
                        </span>
                        <span className="text-[10px] uppercase text-zinc-400 font-bold">
                          Actor: {log.actor}
                        </span>
                      </div>
                      <p className="text-zinc-200">{log.details}</p>
                    </div>
                    <span className="text-[11px] text-zinc-500 tabular-nums shrink-0">
                      {new Date(log.timestamp).toLocaleString('es-AR')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================== */}
      {/* MODAL: ADMIN PHOTO UPLOAD TO GALLERY                                        */}
      {/* =========================================================================== */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#111318] border border-[#282D37] text-white rounded-2xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1E222B]">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#F59E0B] font-bold block">
                  EXCLUSIVO ADMINISTRADOR
                </span>
                <h3 className="font-display text-xl font-bold">
                  Subir Nueva Foto a la Galería
                </h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGalleryPhoto} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-zinc-300 mb-1.5 font-bold">
                  1. Elegir Foto desde tu Celular / PC o pegar Link *
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-[#161920] border border-[#F59E0B]/50 text-white font-bold hover:bg-[#F59E0B]/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4 text-[#F59E0B]" />
                    <span>
                      {isCompressingPhoto ? 'Procesando foto...' : 'Seleccionar Archivo'}
                    </span>
                  </button>
                  <input
                    type="text"
                    value={photoPreviewUrl}
                    onChange={(e) => setPhotoPreviewUrl(e.target.value)}
                    placeholder="O pegá la URL de una imagen..."
                    className="flex-1 h-10 px-3 rounded-xl border border-[#282D37] bg-[#0C0E12] text-white"
                  />
                </div>
                {photoPreviewUrl && (
                  <div className="mt-3 h-40 rounded-xl overflow-hidden border border-[#282D37] bg-black">
                    <img
                      src={photoPreviewUrl}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">
                    Título de la Foto (Opcional)
                  </label>
                  <input
                    type="text"
                    value={photoTitle}
                    onChange={(e) => setPhotoTitle(e.target.value)}
                    placeholder="Ej. Mid Fade en el Estudio"
                    className="w-full h-10 px-3 rounded-lg border border-[#282D37] bg-[#0C0E12] text-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Sección (Opcional)</label>
                  <select
                    value={photoCategory}
                    onChange={(e) =>
                      setPhotoCategory(e.target.value as GalleryItemCategory)
                    }
                    className="w-full h-10 px-3 rounded-lg border border-[#282D37] bg-[#0C0E12] text-white"
                  >
                    <option value="Cortes & Fades">Cortes &amp; Fades</option>
                    <option value="El Estudio & Local">El Estudio &amp; Local</option>
                    <option value="Máquinas & Setup">Máquinas &amp; Setup</option>
                    <option value="Color & Diseños">Color &amp; Diseños</option>
                    <option value="Cultura & Streetwear">Cultura &amp; Streetwear</option>
                    <option value="General">General (Sin etiqueta)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">
                  Descripción breve (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={photoDescription}
                  onChange={(e) => setPhotoDescription(e.target.value)}
                  placeholder="Si lo dejás vacío se publica directo sin texto extra..."
                  className="w-full p-2.5 rounded-lg border border-[#282D37] bg-[#0C0E12] text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-[#282D37] bg-[#0C0E12] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={photoHideBuyButton}
                    onChange={(e) => setPhotoHideBuyButton(e.target.checked)}
                  />
                  <span>Ocultar botón Reservar</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-[#282D37] bg-[#0C0E12] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={photoHidePrice}
                    onChange={(e) => setPhotoHidePrice(e.target.checked)}
                  />
                  <span>Ocultar precio en foto</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#1E222B] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono border border-[#282D37] rounded-lg text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-mono font-black uppercase tracking-wider bg-[#F59E0B] text-zinc-950 rounded-lg cursor-pointer"
                >
                  Publicar Foto Ahora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================== */}
      {/* MODAL: SERVICE CREATE / EDIT                                                */}
      {/* =========================================================================== */}
      {isNewServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#111318] border border-[#282D37] text-white rounded-2xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1E222B]">
              <h3 className="font-display text-xl font-bold">
                {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
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
                <label className="block text-zinc-400 mb-1 font-semibold">
                  Nombre del Corte / Servicio *
                </label>
                <input
                  type="text"
                  value={serviceFormData.name || ''}
                  onChange={(e) =>
                    setServiceFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Ej. Taper Fade & Line Up"
                  className="w-full h-10 px-3 rounded-lg border border-[#282D37] bg-[#0C0E12] text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">
                    Categoría
                  </label>
                  <select
                    value={serviceFormData.category || 'Fades & Cortes'}
                    onChange={(e) =>
                      setServiceFormData((prev) => ({
                        ...prev,
                        category: e.target.value as StudioService['category'],
                      }))
                    }
                    className="w-full h-10 px-3 rounded-lg border border-[#282D37] bg-[#0C0E12] text-white"
                  >
                    <option value="Fades & Cortes">Fades &amp; Cortes</option>
                    <option value="Corte & Barba">Corte &amp; Barba</option>
                    <option value="Color & Platinados">Color &amp; Platinados</option>
                    <option value="Detalles & Barba">Detalles &amp; Barba</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">
                    Duración (minutos) *
                  </label>
                  <input
                    type="number"
                    step={5}
                    value={serviceFormData.durationMinutes || 40}
                    onChange={(e) =>
                      setServiceFormData((prev) => ({
                        ...prev,
                        durationMinutes: Number(e.target.value),
                      }))
                    }
                    className="w-full h-10 px-3 rounded-lg border border-[#282D37] bg-[#0C0E12] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">
                  Precio en ARS ($) *
                </label>
                <input
                  type="number"
                  step={500}
                  value={serviceFormData.price || 12000}
                  onChange={(e) =>
                    setServiceFormData((prev) => ({
                      ...prev,
                      price: Number(e.target.value),
                    }))
                  }
                  className="w-full h-10 px-3 rounded-lg border border-[#282D37] bg-[#0C0E12] text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">
                  Descripción Breve
                </label>
                <textarea
                  rows={2}
                  value={serviceFormData.shortDescription || ''}
                  onChange={(e) =>
                    setServiceFormData((prev) => ({
                      ...prev,
                      shortDescription: e.target.value,
                    }))
                  }
                  className="w-full p-2.5 rounded-lg border border-[#282D37] bg-[#0C0E12] text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">
                  Herramientas / Productos
                </label>
                <input
                  type="text"
                  value={serviceFormData.productsUsed || ''}
                  onChange={(e) =>
                    setServiceFormData((prev) => ({
                      ...prev,
                      productsUsed: e.target.value,
                    }))
                  }
                  className="w-full h-10 px-3 rounded-lg border border-[#282D37] bg-[#0C0E12] text-white"
                />
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-[#1E222B] flex items-center justify-end gap-3">
              <button
                onClick={() => setIsNewServiceModalOpen(false)}
                className="px-4 py-2 text-xs font-mono border border-[#282D37] rounded-lg text-zinc-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!serviceFormData.name?.trim()) {
                    triggerToast('Especificá el nombre del corte o servicio');
                    return;
                  }
                  if (editingService) {
                    updateService(editingService.id, serviceFormData);
                    triggerToast('Servicio actualizado con éxito');
                  } else {
                    const newSrv: StudioService = {
                      id: `srv-custom-${Date.now()}`,
                      index: String(services.length + 1).padStart(2, '0'),
                      category:
                        (serviceFormData.category as StudioService['category']) ||
                        'Fades & Cortes',
                      name: serviceFormData.name.trim(),
                      durationMinutes: Number(serviceFormData.durationMinutes) || 40,
                      price: Number(serviceFormData.price) || 12000,
                      shortDescription:
                        serviceFormData.shortDescription ||
                        'Servicio personalizado de autor en Venado Tuerto.',
                      preparation: serviceFormData.preparation || [
                        'Venir con el cabello limpio',
                      ],
                      executionSteps: serviceFormData.executionSteps || [
                        'Diagnóstico',
                        'Ejecución técnica a máquina y tijera',
                        'Acabado',
                      ],
                      aftercare:
                        serviceFormData.aftercare || 'Control recomendado cada 15 días.',
                      productsUsed:
                        serviceFormData.productsUsed || 'Línea Profesional Rodrigo Cutsss',
                    };
                    addService(newSrv);
                    triggerToast('Nuevo servicio añadido a la carta');
                  }
                  setIsNewServiceModalOpen(false);
                }}
                className="px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider bg-[#F59E0B] text-zinc-950 rounded-lg cursor-pointer"
              >
                Guardar Servicio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
