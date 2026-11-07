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
  Download,
  Search,
  Settings,
  TrendingUp,
} from 'lucide-react';
import { StudioService, GalleryItemCategory } from '../data/studioData';
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
    label: 'Turnero Paso a Paso & Consulta por WhatsApp (#turnero)',
    description:
      'Asistente de reservas en 3 pasos, consulta de turno activo y descarga de comprobante PNG/ICS.',
  },
  services: {
    key: 'showServicesSection',
    label: 'Catálogo Interactivo de Servicios (#servicios)',
    description:
      'Carta editorial de servicios con vista previa sincronizada, tiempos, valores y selección en 1 clic.',
  },
  beforeAfter: {
    key: 'showBeforeAfterSection',
    label: 'Comparador Editorial "Antes & Después" (#transformaciones)',
    description:
      'Deslizador interactivo de sastrería capilar para comparar diagnóstico previo y resultado final.',
  },
  gallery: {
    key: 'showGallerySection',
    label: 'Obras & Detalles de Autor (#obras)',
    description:
      'Portafolio fotográfico con revelado editorial, filtros por categoría y reserva directa.',
  },
  reviews: {
    key: 'showReviewsSection',
    label: 'Voces del Estudio & Reseñas (#opiniones)',
    description:
      'Testimonios verificados de clientes en Venado Tuerto y formulario para publicar reseña.',
  },
  barber: {
    key: 'showBarberSection',
    label: 'Manifiesto & El Estudio (#estudio)',
    description:
      'Presentación editorial del espacio privado, filosofía uno a uno y fotografía con parallax.',
  },
  location: {
    key: 'showLocationSection',
    label: 'Ubicación, Plano & Horarios (#ubicacion)',
    description:
      'Dirección Vuelta de Obligado 931, plano de referencia, alias y accesos a Google Maps / Waze.',
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

  // Form state for Profile, Texts & Rotating Banner
  const [barberNameForm, setBarberNameForm] = useState(config.authorName);
  const [instagramForm, setInstagramForm] = useState(config.instagram);
  const [whatsappDisplayForm, setWhatsappDisplayForm] = useState(config.phoneDisplay);
  const [whatsappRawForm, setWhatsappRawForm] = useState(config.whatsappRaw);
  const [studioTitleForm, setStudioTitleForm] = useState(config.studioTitle);
  const [brandKickerForm, setBrandKickerForm] = useState(config.brandKicker);
  const [taglineForm, setTaglineForm] = useState(config.tagline);
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
    setBrandKickerForm(config.brandKicker);
    setTaglineForm(config.tagline);
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
    config.brandKicker,
    config.tagline,
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
    durationMinutes: 45,
    price: 12000,
    shortDescription: '',
    preparation: ['Cabello limpio y libre de fijadores pesados'],
    executionSteps: [
      '10 min · Diagnóstico personalizado y estudio de facciones',
      '20 min · Corte preciso a tijera y transiciones suaves',
      '10 min · Texturizado en seco para movimiento natural',
      '05 min · Peinado final con acabado mate orgánico',
    ],
    aftercare: 'Recomendamos control cada 3 a 4 semanas.',
    productsUsed: 'Tijeras de corte y esculpir · Máquina de precisión · Arcilla mate orgánica',
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
    'Pausa de mediodía y acondicionamiento del estudio'
  );

  // Admin Photo Upload Form
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoCategory, setPhotoCategory] = useState<GalleryItemCategory>('Cortes & Fades');
  const [photoDescription, setPhotoDescription] = useState('');
  const [photoTechnicalSpec, setPhotoTechnicalSpec] = useState('');
  const [photoPriceTag, setPhotoPriceTag] = useState(config.mainPriceDisplay || '$12.000 ARS');
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
      studioTitle: studioTitleForm.trim() || `${cleanName} Estudio`,
      brandKicker: brandKickerForm.trim() || 'Estudio de Corte & Autor',
      tagline: taglineForm.trim() || config.tagline,
      address: addressForm.trim() || config.address,
      neighborhood: neighborhoodForm.trim() || config.neighborhood,
      transferAlias: transferAliasForm.trim() || config.transferAlias,
      mainPriceDisplay: mainPriceForm.trim() || config.mainPriceDisplay,
      heroSubtitle: heroSubtitleForm.trim() || config.heroSubtitle,
      bio: bioForm.trim() || config.bio,
      promoBannerText: promoBannerTextForm.trim(),
    });

    triggerToast(
      `Cambios guardados y aplicados en el sitio (${cleanName} · ${addressForm.trim()})`
    );
  };

  const handleExportAppointmentsCSV = () => {
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
    link.download = `agenda-estudio-${todayStr}.csv`;
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
      title: photoTitle.trim() || `Obra en el Estudio · ${config.studioTitle}`,
      category: photoCategory || 'General',
      imageUrl: photoPreviewUrl.trim(),
      description:
        photoDescription.trim() ||
        `Trabajo realizado por ${config.authorName} en el estudio de ${config.address}, ${config.neighborhood}.`,
      technicalSpec:
        photoTechnicalSpec.trim() || 'Corte a medida · Atención individual uno a uno',
      dateLabel: 'Reciente · Estudio',
      likes: 28,
      tags: ['RodrigoEstudio', 'VenadoTuerto'],
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
    triggerToast('Obra publicada en el portafolio del sitio');
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

  // If not authenticated, render refined Editorial Atelier PIN screen
  if (!isAdminAuthenticated) {
    return (
      <div className="py-16 md:py-24 px-4 flex items-center justify-center min-h-[72vh] atelier-paper-surface">
        <div className="w-full max-w-md p-8 sm:p-10 border border-[#171513]/15 bg-[#EFEAE1] text-[#171513] shadow-[0_24px_60px_rgba(23,21,19,0.08)]">
          <div className="w-12 h-12 bg-[#171513] text-[#F7F4EE] flex items-center justify-center mb-6">
            <Lock className="w-5 h-5 text-[#C8A97E]" />
          </div>

          <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#96734E] font-medium block mb-1">
            Gestión del Estudio · Control Integral
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-medium text-[#171513] mb-2">
            Acceso de Administración
          </h1>
          <p className="text-xs sm:text-sm text-[#4A443E] leading-relaxed mb-6">
            Ingresá tu PIN para editar textos, precios, banner rotativo, orden de secciones,
            horarios y turnos en tiempo real.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="admin-pin"
                className="block text-xs font-mono uppercase tracking-wider text-[#575049] mb-1.5 font-medium"
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
                className="w-full h-12 px-4 text-center tracking-[0.4em] text-xl font-mono font-semibold border border-[#171513]/25 bg-[#F7F4EE] text-[#171513] focus:border-[#96734E] focus:outline-none"
                autoFocus
              />
              {pinError && <p className="text-xs text-[#A65D43] mt-2 font-mono">{pinError}</p>}
            </div>

            <button
              type="submit"
              className="w-full h-12 uppercase font-medium text-xs tracking-[0.16em] bg-[#171513] text-[#F7F4EE] hover:bg-[#96734E] transition-colors cursor-pointer"
            >
              Ingresar al Panel del Estudio
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#171513]/12 text-center">
            <p className="text-xs font-mono text-[#655E57]">
              PIN activo:{' '}
              <strong className="text-[#96734E]">{config.adminPin || '1234'}</strong>
            </p>
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="text-xs text-[#575049] hover:text-[#171513] mt-2.5 underline cursor-pointer"
            >
              Volver a la portada del estudio
            </button>
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
    <div className="py-10 md:py-14 px-4 sm:px-8 max-w-[1360px] mx-auto text-[#171513] space-y-8">
      {/* Toast Notification */}
      {saveToast && (
        <div
          role="status"
          data-testid="admin-save-toast"
          className="fixed bottom-6 right-6 z-50 px-5 py-3.5 bg-[#171513] text-[#F7F4EE] border border-[#C8A97E]/40 shadow-2xl text-xs font-mono flex items-center gap-2.5"
        >
          <CheckCircle2 className="w-4 h-4 text-[#C8A97E]" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Bar for Admin */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#171513]/15">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-[#96734E] font-medium mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>DIRECCIÓN Y GESTIÓN DEL ESTUDIO · {config.authorName.toUpperCase()}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-medium text-[#171513]">
            Panel de Administración
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-wider bg-[#96734E] text-[#F7F4EE] hover:bg-[#171513] transition-colors cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>+ Subir Obra a Galería</span>
          </button>

          <button
            type="button"
            data-testid="admin-view-public-site"
            onClick={() => navigateTo('home')}
            className="px-4 py-2.5 text-xs font-mono uppercase tracking-wider border border-[#171513]/25 bg-[#EFEAE1] hover:bg-[#171513] hover:text-[#F7F4EE] transition-colors cursor-pointer"
          >
            Ver Sitio Público
          </button>
          <button
            type="button"
            onClick={logoutAdmin}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-mono uppercase tracking-wider bg-[#A65D43]/12 text-[#A65D43] border border-[#A65D43]/30 hover:bg-[#A65D43] hover:text-[#F7F4EE] transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>
      </div>

      {/* Quick KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 border border-[#171513]/12 bg-[#EFEAE1]">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#655E57] block">
            Turnos de Hoy ({todayStr})
          </span>
          <p className="font-display text-3xl font-semibold text-[#171513] mt-1">
            {todayAppointments.length} Turnos Hoy
          </p>
          <p className="text-xs font-mono text-[#96734E] mt-1">
            {appointments.length} totales · {formatPriceARS(totalRevenueEst)} est.
          </p>
        </div>

        <div className="p-5 border border-[#171513]/12 bg-[#EFEAE1]">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#655E57] block">
            Secciones &amp; Ocupación
          </span>
          <p className="font-display text-3xl font-semibold text-[#171513] mt-1 tabular-nums">
            {visibleSectionsCount}/8 Secciones
          </p>
          <p className="text-xs font-mono text-[#4A443E] mt-1 truncate">
            {backendMetrics
              ? `Servicio Top: ${backendMetrics.topServiceName}`
              : `Modo: ${config.layoutMode === 'tabs' ? 'Pestañas' : 'Flujo Completo'}`}
          </p>
        </div>

        <div className="p-5 border border-[#171513]/12 bg-[#EFEAE1]">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#655E57] block">
            Identidad &amp; Contacto Activo
          </span>
          <p className="font-mono text-sm font-semibold text-[#171513] mt-1.5 truncate">
            {config.authorName} · {igInfo.handle}
          </p>
          <p className="text-xs font-mono text-[#4A443E] mt-1 truncate">
            WA: {waInfo.display}
          </p>
        </div>

        <div className="p-5 border border-[#171513]/12 bg-[#EFEAE1]">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#655E57] block">
            Disponibilidad Hoy en Portada
          </span>
          <p className="font-display text-2xl font-semibold text-[#171513] mt-1">
            {config.walkInStatus === 'available' ? 'Turnos Abiertos' : 'Agenda Completa'}
          </p>
          <button
            type="button"
            onClick={() => {
              const newStatus = config.walkInStatus === 'available' ? 'booked_full' : 'available';
              updateConfig({ walkInStatus: newStatus });
              triggerToast(
                `Estado en portada actualizado: ${
                  newStatus === 'available' ? 'Turnos abiertos hoy' : 'Agenda completa hoy'
                }`
              );
            }}
            className="text-xs font-mono text-[#96734E] hover:text-[#171513] underline mt-1 cursor-pointer"
          >
            Cambiar disponibilidad en vivo &rarr;
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-[#171513]/15">
        {[
          {
            id: 'sections_profile',
            label: 'Secciones, Textos & Banner Rotativo',
            icon: Sliders,
          },
          {
            id: 'business_rules',
            label: 'Horarios, Paleta & Efectos',
            icon: Settings,
          },
          { id: 'appointments', label: `Turnos en Vivo (${appointments.length})`, icon: Calendar },
          { id: 'services', label: `Servicios & Precios (${services.length})`, icon: DollarSign },
          { id: 'gallery', label: `Obras & Galería (${galleryItems.length})`, icon: Camera },
          { id: 'calendar', label: `Bloqueos de Horario (${blockedSlots.length})`, icon: Clock },
          {
            id: 'server_audit',
            label: `Servidor & Métricas (${auditLogs.length})`,
            icon: Shield,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              data-testid={`admin-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-wider font-mono transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#171513] text-[#F7F4EE] font-semibold'
                  : 'bg-[#EFEAE1] border border-[#171513]/15 text-[#4A443E] hover:text-[#171513] hover:border-[#171513]'
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Live Section Reordering & Layout Architecture */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 sm:p-7 border border-[#171513]/15 bg-[#EFEAE1] space-y-5">
              <div className="border-b border-[#171513]/12 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#96734E] font-medium mb-1">
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>ESTRUCTURA Y JERARQUÍA DEL SITIO</span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-medium text-[#171513]">
                    Orden de Secciones &amp; Visibilidad
                  </h2>
                  <p className="text-xs text-[#4A443E] mt-1">
                    Reordená o activá/ocultá cada módulo. Todo cambio se refleja al instante en la
                    portada principal.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    updateConfig({ sectionOrder: [...DEFAULT_SECTION_ORDER] });
                    triggerToast('Orden recomendado restaurado');
                  }}
                  className="px-3.5 py-2 border border-[#171513]/20 bg-[#F7F4EE] hover:border-[#171513] text-xs font-mono text-[#171513] flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#96734E]" />
                  <span>Orden por Defecto</span>
                </button>
              </div>

              {/* Site Layout Mode Selector */}
              <div className="p-4 bg-[#F7F4EE] border border-[#171513]/12 space-y-2.5">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#96734E] font-medium block">
                  Modo de Navegación en Portada:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      updateConfig({ layoutMode: 'landing' });
                      triggerToast('Estructura cambiada a Flujo Editorial Completo (Landing)');
                    }}
                    className={`p-3.5 border text-left font-mono text-xs transition-all cursor-pointer ${
                      (config.layoutMode || 'landing') === 'landing'
                        ? 'border-[#171513] bg-[#171513] text-[#F7F4EE]'
                        : 'border-[#171513]/15 bg-[#EFEAE1] text-[#4A443E] hover:border-[#171513]'
                    }`}
                  >
                    <span className="block font-semibold">1. Flujo Editorial Completo</span>
                    <span className="text-[11px] opacity-80 block mt-0.5">
                      Despliega todas las secciones activas en el orden configurado abajo.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateConfig({ layoutMode: 'tabs' });
                      triggerToast('Estructura cambiada a Vista por Pestañas Individuales');
                    }}
                    className={`p-3.5 border text-left font-mono text-xs transition-all cursor-pointer ${
                      config.layoutMode === 'tabs'
                        ? 'border-[#171513] bg-[#171513] text-[#F7F4EE]'
                        : 'border-[#171513]/15 bg-[#EFEAE1] text-[#4A443E] hover:border-[#171513]'
                    }`}
                  >
                    <span className="block font-semibold">2. Vista por Pestañas Individuales</span>
                    <span className="text-[11px] opacity-80 block mt-0.5">
                      Muestra una barra de pestañas editoriales para ver una sección a la vez.
                    </span>
                  </button>
                </div>
              </div>

              {/* Fixed Portada Switch */}
              <div className="p-4 border border-[#171513]/15 bg-[#F7F4EE] flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#96734E]/15 text-[#96734E] font-mono text-[10px] font-semibold">
                      PORTADA
                    </span>
                    <span className="font-mono text-xs font-semibold text-[#171513]">
                      Hero Editorial &amp; Próximo Turno Libre (#inicio)
                    </span>
                  </div>
                  <p className="text-[11px] text-[#575049] mt-1">
                    Cabecera asimétrica con retrato parallax, titular serif e indicador de turno
                    libre hoy.
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={config.showHeroSection !== false}
                  aria-label="Mostrar u ocultar Portada Principal"
                  onClick={() => {
                    const nextVal = config.showHeroSection === false;
                    updateConfig({ showHeroSection: nextVal });
                    triggerToast(`Portada Principal: ${nextVal ? 'Visible' : 'Oculta'}`);
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    config.showHeroSection !== false ? 'bg-[#171513]' : 'bg-[#C5BBAE]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#F7F4EE] transition ${
                      config.showHeroSection !== false ? 'translate-x-5' : 'translate-x-0'
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
                      className={`p-4 border transition-all flex items-center justify-between gap-3 ${
                        isEnabled
                          ? 'bg-[#F7F4EE] border-[#171513]/15'
                          : 'bg-[#E4DDD1]/60 border-[#171513]/10 opacity-70'
                      }`}
                    >
                      {/* Up / Down Order Controls */}
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => {
                            moveSectionInOrder(secId, 'up');
                            triggerToast(`"${meta.label}" subida a posición #${index}`);
                          }}
                          title="Subir sección"
                          className="w-7 h-7 border border-[#171513]/20 bg-[#EFEAE1] hover:border-[#171513] text-[#171513] flex items-center justify-center disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === normalizedOrder.length - 1}
                          onClick={() => {
                            moveSectionInOrder(secId, 'down');
                            triggerToast(`"${meta.label}" bajada a posición #${index + 2}`);
                          }}
                          title="Bajar sección"
                          className="w-7 h-7 border border-[#171513]/20 bg-[#EFEAE1] hover:border-[#171513] text-[#171513] flex items-center justify-center disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 bg-[#171513] text-[#F7F4EE] font-mono text-[10px]">
                            #{index + 1}
                          </span>
                          <span className="font-mono text-xs font-semibold text-[#171513]">
                            {meta.label}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 ${
                              isEnabled
                                ? 'bg-[#3D4F43]/15 text-[#3D4F43]'
                                : 'bg-[#C5BBAE]/40 text-[#655E57]'
                            }`}
                          >
                            {isEnabled ? 'Visible' : 'Oculta'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#575049] mt-1">{meta.description}</p>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={isEnabled}
                        aria-label={`Mostrar u ocultar ${meta.label}`}
                        onClick={() => {
                          updateConfig({ [meta.key]: !isEnabled });
                          triggerToast(
                            `${meta.label}: ${!isEnabled ? 'Visible en el sitio' : 'Oculta'}`
                          );
                        }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                          isEnabled ? 'bg-[#171513]' : 'bg-[#C5BBAE]'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#F7F4EE] transition ${
                            isEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Form to update Identity, Texts, Rotating Banner & Card Switches */}
          <div className="lg:col-span-6 space-y-6">
            <form
              onSubmit={handleSaveProfileAndLinks}
              className="p-6 sm:p-7 border border-[#171513]/15 bg-[#EFEAE1] space-y-5"
            >
              <div className="border-b border-[#171513]/12 pb-4">
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#96734E] font-medium mb-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>IDENTIDAD, TEXTOS Y BANNER ROTATIVO</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-medium text-[#171513]">
                  Datos del Estudio, Portada &amp; Contacto
                </h2>
                <p className="text-xs text-[#4A443E] mt-1">
                  Cualquier cambio que guardes acá actualiza la barra superior, el banner rotativo,
                  la portada, el manifiesto, el turnero y el pie de página.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="admin-barber-name"
                      className="block text-xs font-mono text-[#4A443E] mb-1 font-medium uppercase"
                    >
                      Nombre del Profesional *
                    </label>
                    <input
                      id="admin-barber-name"
                      name="authorName"
                      type="text"
                      required
                      value={barberNameForm}
                      onChange={(e) => setBarberNameForm(e.target.value)}
                      className="w-full h-10 px-3 text-xs font-mono border border-[#171513]/20 bg-[#F7F4EE] text-[#171513]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="admin-studio-title"
                      className="block text-xs font-mono text-[#4A443E] mb-1 font-medium uppercase"
                    >
                      Nombre del Estudio (Navbar / Marca) *
                    </label>
                    <input
                      id="admin-studio-title"
                      type="text"
                      value={studioTitleForm}
                      onChange={(e) => setStudioTitleForm(e.target.value)}
                      className="w-full h-10 px-3 text-xs font-mono border border-[#171513]/20 bg-[#F7F4EE] text-[#171513]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="admin-promo-banner-text"
                    className="block text-xs font-mono text-[#96734E] mb-1 font-semibold uppercase"
                  >
                    Texto Destacado del Banner Rotativo con Parallax
                  </label>
                  <input
                    id="admin-promo-banner-text"
                    type="text"
                    value={promoBannerTextForm}
                    onChange={(e) => setPromoBannerTextForm(e.target.value)}
                    placeholder="Ej. ATENCIÓN INDIVIDUAL UNO A UNO · VUELTA DE OBLIGADO 931"
                    className="w-full h-10 px-3 text-xs font-mono border border-[#96734E]/40 bg-[#F7F4EE] text-[#171513]"
                  />
                  <span className="text-[11px] text-[#655E57] block mt-1">
                    Se combina automáticamente con los precios de servicios, dirección y próximo
                    turno libre.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-[#4A443E] mb-1 font-medium uppercase">
                      Precio Base Destacado
                    </label>
                    <input
                      id="admin-main-price"
                      type="text"
                      value={mainPriceForm}
                      onChange={(e) => setMainPriceForm(e.target.value)}
                      className="w-full h-10 px-3 text-xs font-mono border border-[#171513]/20 bg-[#F7F4EE] text-[#171513]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#4A443E] mb-1 font-medium uppercase">
                      Dirección del Estudio
                    </label>
                    <input
                      id="admin-address"
                      type="text"
                      value={addressForm}
                      onChange={(e) => setAddressForm(e.target.value)}
                      className="w-full h-10 px-3 text-xs font-mono border border-[#171513]/20 bg-[#F7F4EE] text-[#171513]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#4A443E] mb-1 font-medium uppercase">
                      Ciudad y Provincia
                    </label>
                    <input
                      id="admin-neighborhood"
                      type="text"
                      value={neighborhoodForm}
                      onChange={(e) => setNeighborhoodForm(e.target.value)}
                      className="w-full h-10 px-3 text-xs font-mono border border-[#171513]/20 bg-[#F7F4EE] text-[#171513]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#4A443E] mb-1 font-medium uppercase">
                      Alias de Transferencia / Seña
                    </label>
                    <input
                      id="admin-transfer-alias"
                      type="text"
                      value={transferAliasForm}
                      onChange={(e) => setTransferAliasForm(e.target.value)}
                      className="w-full h-10 px-3 text-xs font-mono border border-[#171513]/20 bg-[#F7F4EE] text-[#171513]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#4A443E] mb-1 font-medium uppercase">
                    Titular Principal de Portada (Hero)
                  </label>
                  <input
                    id="admin-tagline"
                    type="text"
                    value={taglineForm}
                    onChange={(e) => setTaglineForm(e.target.value)}
                    className="w-full h-10 px-3 text-xs font-mono border border-[#171513]/20 bg-[#F7F4EE] text-[#171513]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#4A443E] mb-1 font-medium uppercase">
                    Bajada / Subtítulo de Portada
                  </label>
                  <textarea
                    rows={2}
                    value={heroSubtitleForm}
                    onChange={(e) => setHeroSubtitleForm(e.target.value)}
                    className="w-full p-2.5 text-xs font-mono border border-[#171513]/20 bg-[#F7F4EE] text-[#171513]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#4A443E] mb-1 font-medium uppercase">
                    Texto del Manifiesto / El Estudio (#estudio)
                  </label>
                  <textarea
                    rows={2}
                    value={bioForm}
                    onChange={(e) => setBioForm(e.target.value)}
                    className="w-full p-2.5 text-xs font-mono border border-[#171513]/20 bg-[#F7F4EE] text-[#171513]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#171513]/12">
                  <div>
                    <label
                      htmlFor="admin-instagram-link"
                      className="block text-xs font-mono text-[#4A443E] mb-1 font-medium uppercase"
                    >
                      Instagram (Usuario o URL) *
                    </label>
                    <input
                      id="admin-instagram-link"
                      name="instagram"
                      type="text"
                      required
                      value={instagramForm}
                      onChange={(e) => setInstagramForm(e.target.value)}
                      className="w-full h-10 px-3 text-xs font-mono border border-[#171513]/20 bg-[#F7F4EE] text-[#171513]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="admin-whatsapp-display"
                      className="block text-xs font-mono text-[#4A443E] mb-1 font-medium uppercase"
                    >
                      WhatsApp Directo *
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
                      className="w-full h-10 px-3 text-xs font-mono border border-[#171513]/20 bg-[#F7F4EE] text-[#171513]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#171513]/12 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-mono text-[#575049]">
                  <Instagram className="w-3.5 h-3.5 text-[#96734E]" />
                  <span>{resolveInstagramInfo(instagramForm).handle}</span>
                  <span>·</span>
                  <MessageCircle className="w-3.5 h-3.5 text-[#3D4F43]" />
                  <span>{whatsappDisplayForm}</span>
                </div>

                <button
                  type="submit"
                  data-testid="admin-save-profile-btn"
                  className="inline-flex items-center gap-2 px-6 py-3 text-xs font-mono uppercase tracking-wider bg-[#171513] text-[#F7F4EE] hover:bg-[#96734E] transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>

            {/* Card Elements Visibility Switches */}
            <div className="p-6 sm:p-7 border border-[#171513]/15 bg-[#EFEAE1] space-y-4">
              <div className="border-b border-[#171513]/12 pb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#96734E] font-medium block">
                  ELEMENTOS DE CATÁLOGO Y PORTAFOLIO
                </span>
                <h3 className="font-display text-2xl font-medium text-[#171513]">
                  Switches de Precios, Botones y Filtros
                </h3>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                {[
                  {
                    key: 'showServiceBookingButton' as const,
                    label: 'Botón "Elegir servicio" en el Catálogo',
                    desc: 'Muestra u oculta los botones de reserva directa en la carta de servicios',
                  },
                  {
                    key: 'showServicePrice' as const,
                    label: 'Precios en el Catálogo de Servicios y Banner',
                    desc: 'Muestra u oculta los valores en pesos en la carta de servicios',
                  },
                  {
                    key: 'showServiceDuration' as const,
                    label: 'Duración (minutos) en el Catálogo de Servicios',
                    desc: 'Muestra u oculta el tiempo estimado de cada sesión',
                  },
                  {
                    key: 'showServiceProducts' as const,
                    label: 'Detalle "Incluye:" en el Catálogo de Servicios',
                    desc: 'Muestra las herramientas y productos botánicos de cada servicio',
                  },
                  {
                    key: 'showGalleryFilter' as const,
                    label: 'Pestañas de Categorías en Obras & Portafolio',
                    desc: 'Permite filtrar las fotos por categoría en la sección #obras',
                  },
                  {
                    key: 'showGalleryBookingButton' as const,
                    label: 'Botón "Reservar" en Tarjetas de Obras',
                    desc: 'Muestra u oculta el acceso al turnero debajo de cada obra',
                  },
                  {
                    key: 'showGalleryPriceBadge' as const,
                    label: 'Valor de Referencia en Tarjetas de Obras',
                    desc: 'Muestra u oculta el precio junto a la fecha de cada obra',
                  },
                ].map((item) => {
                  const enabled = Boolean(config[item.key]);
                  return (
                    <div
                      key={item.key}
                      className="p-3.5 border border-[#171513]/12 bg-[#F7F4EE] flex items-center justify-between gap-3"
                    >
                      <div>
                        <span className="font-semibold text-[#171513] block">{item.label}</span>
                        <span className="text-[11px] text-[#575049] block mt-0.5">{item.desc}</span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={enabled}
                        aria-label={item.label}
                        onClick={() => {
                          updateConfig({ [item.key]: !enabled });
                          triggerToast(`${item.label}: ${!enabled ? 'Activo' : 'Oculto'}`);
                        }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                          enabled ? 'bg-[#171513]' : 'bg-[#C5BBAE]'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#F7F4EE] transition ${
                            enabled ? 'translate-x-5' : 'translate-x-0'
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
      {/* TAB 1: HORARIOS, REGLAS DE NEGOCIO, PALETA EDITORIAL & EFECTOS              */}
      {/* =========================================================================== */}
      {activeTab === 'business_rules' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Business Rules, Opening/Closing Hours, Open Days, Buffer & PIN */}
          <div className="lg:col-span-7 p-6 sm:p-7 border border-[#171513]/15 bg-[#EFEAE1] space-y-6">
            <div className="border-b border-[#171513]/12 pb-4">
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#96734E] font-medium mb-1">
                <Settings className="w-3.5 h-3.5" />
                <span>REGLAS DE AGENDA Y ATENCIÓN</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-medium text-[#171513]">
                Horarios de Jornada, Días Abiertos, Señas y PIN
              </h2>
              <p className="text-xs text-[#4A443E] mt-1">
                Estos parámetros gobiernan automáticamente los turnos libres que se calculan en
                tiempo real en la portada y el turnero.
              </p>
            </div>

            {/* Active Days of the Week */}
            <div className="space-y-2">
              <label className="block text-xs font-mono text-[#171513] font-semibold uppercase">
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
                      className={`px-3.5 py-2 font-mono text-xs border transition-colors cursor-pointer ${
                        isDayOpen
                          ? 'bg-[#171513] text-[#F7F4EE] border-[#171513] font-semibold'
                          : 'bg-[#F7F4EE] text-[#655E57] border-[#171513]/15 hover:text-[#171513]'
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
                <label className="block text-[#4A443E] mb-1.5 font-semibold uppercase">
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
                  className="w-full h-11 px-3.5 border border-[#171513]/20 bg-[#F7F4EE] text-[#171513] font-semibold"
                />
              </div>

              <div>
                <label className="block text-[#4A443E] mb-1.5 font-semibold uppercase">
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
                  className="w-full h-11 px-3.5 border border-[#171513]/20 bg-[#F7F4EE] text-[#171513] font-semibold"
                />
              </div>

              <div>
                <label className="block text-[#4A443E] mb-1.5 font-semibold uppercase">
                  Pausa de Acondicionamiento Entre Turnos (min)
                </label>
                <select
                  value={config.cleanBufferMinutes}
                  onChange={(e) => {
                    updateConfig({ cleanBufferMinutes: Number(e.target.value) });
                    triggerToast(`Pausa entre turnos actualizada a ${e.target.value} min`);
                  }}
                  className="w-full h-11 px-3.5 border border-[#171513]/20 bg-[#F7F4EE] text-[#171513] font-semibold"
                >
                  <option value={0}>0 min (Sin pausa)</option>
                  <option value={5}>5 min</option>
                  <option value={10}>10 min (Recomendado)</option>
                  <option value={15}>15 min</option>
                  <option value={20}>20 min</option>
                </select>
              </div>

              <div>
                <label className="block text-[#4A443E] mb-1.5 font-semibold uppercase">
                  Porcentaje de Seña por Transferencia (%)
                </label>
                <select
                  value={config.depositPercentage}
                  onChange={(e) => {
                    updateConfig({ depositPercentage: Number(e.target.value) });
                    triggerToast(`Porcentaje de seña: ${e.target.value}%`);
                  }}
                  className="w-full h-11 px-3.5 border border-[#171513]/20 bg-[#F7F4EE] text-[#171513] font-semibold"
                >
                  <option value={20}>20% de seña</option>
                  <option value={30}>30% de seña (Recomendado)</option>
                  <option value={50}>50% de seña</option>
                </select>
              </div>

              <div>
                <label className="block text-[#4A443E] mb-1.5 font-semibold uppercase">
                  Texto Visible de Horarios
                </label>
                <input
                  type="text"
                  value={scheduleDisplayForm}
                  onChange={(e) => setScheduleDisplayForm(e.target.value)}
                  onBlur={() => {
                    updateConfig({ scheduleDisplay: scheduleDisplayForm });
                    triggerToast('Texto de horarios actualizado');
                  }}
                  className="w-full h-11 px-3.5 border border-[#171513]/20 bg-[#F7F4EE] text-[#171513]"
                />
              </div>

              <div>
                <label className="block text-[#4A443E] mb-1.5 font-semibold uppercase">
                  PIN Maestro del Panel Admin
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={8}
                    value={adminPinForm}
                    onChange={(e) => setAdminPinForm(e.target.value)}
                    className="flex-1 h-11 px-3.5 border border-[#171513]/20 bg-[#F7F4EE] text-[#96734E] font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!adminPinForm.trim()) return;
                      updateConfig({ adminPin: adminPinForm.trim() });
                      triggerToast(`Nuevo PIN guardado: ${adminPinForm.trim()}`);
                    }}
                    className="px-4 bg-[#171513] text-[#F7F4EE] font-semibold uppercase cursor-pointer"
                  >
                    Guardar PIN
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Editorial Atmosphere Preset & Visual Effects Controls */}
          <div className="lg:col-span-5 p-6 sm:p-7 border border-[#171513]/15 bg-[#EFEAE1] space-y-6">
            <div className="border-b border-[#171513]/12 pb-4">
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#96734E] font-medium mb-1">
                <Palette className="w-3.5 h-3.5" />
                <span>DIRECCIÓN DE ARTE &amp; EFECTOS EDITORIALES</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-medium text-[#171513]">
                Atmósfera &amp; Animaciones
              </h2>
              <p className="text-xs text-[#4A443E] mt-1">
                Personalizá el matiz del papel editorial, el banner rotativo con parallax y las
                micro-interacciones del sitio.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  {
                    id: 'amber',
                    name: 'Alabastro & Bronce Mate',
                    desc: 'Hueso cálido original, carbón y bronce',
                    swatch: '#96734E',
                  },
                  {
                    id: 'crimson',
                    name: 'Terracota & Lino Cálido',
                    desc: 'Matiz terracota suave y papel lino',
                    swatch: '#A65D43',
                  },
                  {
                    id: 'volt',
                    name: 'Salvia Botánico & Piedra',
                    desc: 'Verde salvia de estudio y piedra clara',
                    swatch: '#3D4F43',
                  },
                  {
                    id: 'uv',
                    name: 'Pergamino & Carbón Profundo',
                    desc: 'Contraste editorial acentuado en pergamino',
                    swatch: '#171513',
                  },
                ] as { id: UrbanThemePreset; name: string; desc: string; swatch: string }[]
              ).map((preset) => {
                const active = (config.urbanTheme || 'amber') === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      updateConfig({ urbanTheme: preset.id });
                      triggerToast(`Atmósfera editorial activada: ${preset.name}`);
                    }}
                    className={`p-3.5 border text-left font-mono transition-all cursor-pointer ${
                      active
                        ? 'border-[#171513] bg-[#171513] text-[#F7F4EE]'
                        : 'border-[#171513]/15 bg-[#F7F4EE] text-[#171513] hover:border-[#171513]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/30"
                        style={{ backgroundColor: preset.swatch }}
                      />
                      <span className="text-xs font-semibold">{preset.name}</span>
                    </div>
                    <p className="text-[11px] opacity-80">{preset.desc}</p>
                  </button>
                );
              })}
            </div>

            <div className="space-y-3 pt-2 border-t border-[#171513]/12 text-xs font-mono">
              {[
                {
                  key: 'showPromoBanner' as const,
                  label: 'Banner Rotativo Superior con Precios y Dirección',
                  desc: 'Cinta animada continua en la cabecera con valores de servicios, dirección y horario',
                },
                {
                  key: 'enableParallax' as const,
                  label: 'Efecto Parallax en Retratos & Velocidad del Banner',
                  desc: 'Desplazamiento suave en fotografías y aceleración del banner al hacer scroll',
                },
                {
                  key: 'enableDripTrail' as const,
                  label: 'Revelado de Película Cálida & Botones Magnéticos',
                  desc: 'Transición analógica en fotografías y atracción magnética sutil en botones',
                },
              ].map((fx) => {
                const isOn = config[fx.key] !== false;
                return (
                  <div
                    key={fx.key}
                    className="p-3.5 border border-[#171513]/12 bg-[#F7F4EE] flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="font-semibold text-[#171513] block">{fx.label}</span>
                      <span className="text-[11px] text-[#575049] block mt-0.5">{fx.desc}</span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isOn}
                      onClick={() => {
                        updateConfig({ [fx.key]: !isOn });
                        triggerToast(`${fx.label}: ${!isOn ? 'Activado' : 'Desactivado'}`);
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                        isOn ? 'bg-[#171513]' : 'bg-[#C5BBAE]'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#F7F4EE] transition ${
                          isOn ? 'translate-x-5' : 'translate-x-0'
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
          <div className="p-6 border border-[#171513]/15 bg-[#EFEAE1] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#96734E] font-medium block">
                  CARGA MANUAL DE TURNO (ACTUALIZA LA AGENDA PÚBLICA AL INSTANTE)
                </span>
                <h3 className="font-display text-2xl font-medium text-[#171513]">
                  Agendar Turno Manual (Cliente por WhatsApp o Presencial)
                </h3>
              </div>

              <button
                type="button"
                onClick={handleExportAppointmentsCSV}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#171513] bg-[#F7F4EE] hover:bg-[#171513] text-[#171513] hover:text-[#F7F4EE] font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Agenda CSV</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs font-mono">
              <div>
                <label className="block text-[#575049] mb-1">Fecha</label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full h-10 px-3 border border-[#171513]/20 bg-[#F7F4EE] text-[#171513]"
                />
              </div>
              <div>
                <label className="block text-[#575049] mb-1">Horario</label>
                <input
                  type="time"
                  value={manualTime}
                  onChange={(e) => setManualTime(e.target.value)}
                  className="w-full h-10 px-3 border border-[#171513]/20 bg-[#F7F4EE] text-[#171513]"
                />
              </div>
              <div>
                <label className="block text-[#575049] mb-1">Servicio</label>
                <select
                  value={manualServiceId}
                  onChange={(e) => setManualServiceId(e.target.value)}
                  className="w-full h-10 px-2.5 border border-[#171513]/20 bg-[#F7F4EE] text-[#171513]"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({formatPriceARS(s.price)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[#575049] mb-1">Cliente</label>
                <input
                  type="text"
                  value={manualClientName}
                  onChange={(e) => setManualClientName(e.target.value)}
                  placeholder="Ej. Franco Gómez"
                  className="w-full h-10 px-3 border border-[#171513]/20 bg-[#F7F4EE] text-[#171513]"
                />
              </div>
              <div>
                <label className="block text-[#575049] mb-1">WhatsApp</label>
                <input
                  type="text"
                  value={manualClientWhatsapp}
                  onChange={(e) => setManualClientWhatsapp(e.target.value)}
                  placeholder="+54 9 3462 ..."
                  className="w-full h-10 px-3 border border-[#171513]/20 bg-[#F7F4EE] text-[#171513]"
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
                    const srvMin = chosenSrv ? chosenSrv.durationMinutes : 45;
                    const endMin =
                      timeToMinutes(manualTime) + srvMin + config.cleanBufferMinutes + 120;
                    addAppointment({
                      id: `TK-${Date.now().toString().slice(-6)}`,
                      date: manualDate,
                      startTime: manualTime,
                      serviceMinutes: srvMin,
                      bufferMinutes: config.cleanBufferMinutes,
                      clientName: manualClientName.trim(),
                      whatsapp: manualClientWhatsapp.trim() || config.phoneDisplay,
                      serviceNames: [chosenSrv ? chosenSrv.name : 'Corte de Autor / Clásico'],
                      paymentOption: 'commitment',
                      status: 'confirmed',
                      reviewLoopScheduledAt: minutesToTime(endMin),
                    });
                    setManualClientName('');
                    setManualClientWhatsapp('');
                    triggerToast(`Turno agendado para ${manualDate} a las ${manualTime} hs`);
                  }}
                  className="w-full h-10 bg-[#171513] hover:bg-[#96734E] text-[#F7F4EE] font-mono uppercase text-xs cursor-pointer transition-colors"
                >
                  + Ocupar Turno
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-medium">Agenda de Turnos Confirmados</h2>
              <p className="text-xs font-mono text-[#575049]">
                Si cancelás un turno acá, ese horario vuelve a quedar libre inmediatamente en el
                turnero público.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#8C8379] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={appointmentSearch}
                  onChange={(e) => setAppointmentSearch(e.target.value)}
                  placeholder="Buscar cliente o WhatsApp..."
                  className="h-9 pl-8 pr-3 border border-[#171513]/20 bg-[#EFEAE1] text-xs font-mono text-[#171513] focus:border-[#96734E] focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => setAppointmentFilter('today')}
                className={`px-3 py-1.5 text-xs font-mono border transition-colors cursor-pointer ${
                  appointmentFilter === 'today'
                    ? 'border-[#171513] bg-[#171513] text-[#F7F4EE]'
                    : 'border-[#171513]/15 bg-[#EFEAE1] text-[#575049]'
                }`}
              >
                Hoy {todayStr} ({todayAppointments.length})
              </button>
              <button
                type="button"
                onClick={() => setAppointmentFilter('all')}
                className={`px-3 py-1.5 text-xs font-mono border transition-colors cursor-pointer ${
                  appointmentFilter === 'all'
                    ? 'border-[#171513] bg-[#171513] text-[#F7F4EE]'
                    : 'border-[#171513]/15 bg-[#EFEAE1] text-[#575049]'
                }`}
              >
                Todos ({appointments.length})
              </button>
            </div>
          </div>

          {displayedAppointments.length === 0 ? (
            <div className="p-8 border border-[#171513]/15 bg-[#EFEAE1] text-center space-y-2">
              <p className="font-display text-2xl font-medium text-[#171513]">
                No hay turnos registrados para este filtro
              </p>
              <p className="text-xs font-mono text-[#655E57]">
                Todos los horarios dentro de la jornada están disponibles en el turnero público.
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
                    className={`p-5 md:p-6 border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                      isFinished
                        ? 'border-[#171513]/10 bg-[#E4DDD1]/60 opacity-70'
                        : 'border-[#171513]/15 bg-[#EFEAE1]'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                        <span className="px-2.5 py-0.5 bg-[#171513] text-[#F7F4EE] font-semibold">
                          {app.date}
                        </span>
                        <span className="font-semibold text-[#171513]">
                          {app.startTime} a {minutesToTime(endMin)} hs
                        </span>
                        <span className="text-[#8C8379]">·</span>
                        <span className="text-[#575049]">
                          {app.serviceMinutes}m servicio + {app.bufferMinutes}m pausa
                        </span>
                        <span className="text-[#8C8379]">·</span>
                        <span
                          className={
                            app.paymentOption === 'deposit'
                              ? 'text-[#3D4F43] font-semibold'
                              : 'text-[#655E57]'
                          }
                        >
                          {app.paymentOption === 'deposit'
                            ? `Seña ${config.depositPercentage}%`
                            : 'Abono en el Estudio'}
                        </span>
                      </div>

                      <h3 className="font-display text-2xl font-medium text-[#171513]">
                        {app.clientName}
                      </h3>

                      <p className="text-xs font-mono text-[#4A443E]">
                        Servicio:{' '}
                        <span className="text-[#171513] font-semibold">
                          {app.serviceNames.join(' + ')}
                        </span>
                      </p>

                      <div className="flex items-center gap-4 text-xs font-mono text-[#655E57] pt-1">
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
                        className="px-3.5 py-2 border border-[#3D4F43]/40 bg-[#3D4F43]/10 text-[#3D4F43] text-xs font-mono font-medium hover:bg-[#3D4F43] hover:text-[#F7F4EE] transition-colors flex items-center gap-1.5"
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
                        className="px-3.5 py-2 text-xs font-mono border border-[#171513]/25 bg-[#F7F4EE] text-[#171513] hover:bg-[#171513] hover:text-[#F7F4EE] transition-colors cursor-pointer"
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
                        className="px-3.5 py-2 text-xs font-mono text-[#A65D43] hover:text-[#F7F4EE] border border-[#A65D43]/35 hover:bg-[#A65D43] transition-colors flex items-center gap-1.5 cursor-pointer"
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
      {/* TAB 3: GALLERY MANAGEMENT                                                   */}
      {/* =========================================================================== */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-medium">
                Obras &amp; Portafolio del Estudio (#obras)
              </h2>
              <p className="text-xs text-[#575049] font-mono">
                Subí nuevas fotografías o controlá la visibilidad individual de cada obra, su
                precio y su botón de reserva.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 text-xs font-mono uppercase tracking-wider bg-[#171513] text-[#F7F4EE] hover:bg-[#96734E] cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Subir Nueva Obra</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                className={`border overflow-hidden flex flex-col justify-between transition-all ${
                  item.hidden
                    ? 'border-[#171513]/10 bg-[#E4DDD1]/60 opacity-60'
                    : 'border-[#171513]/15 bg-[#EFEAE1]'
                }`}
              >
                <div className="h-52 overflow-hidden relative bg-[#171513]">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 bg-[#171513]/85 text-[#F7F4EE] font-mono text-[10px]">
                      {item.category}
                    </span>
                    {item.hidden && (
                      <span className="px-2 py-1 bg-[#A65D43] text-[#F7F4EE] font-mono text-[10px] uppercase">
                        OCULTA
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-display text-xl font-medium text-[#171513] mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#4A443E] line-clamp-2">{item.description}</p>
                  </div>

                  <div className="pt-3 border-t border-[#171513]/12 space-y-2">
                    <span className="text-[10px] font-mono uppercase text-[#655E57] block">
                      Opciones en esta obra:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          updateGalleryItem(item.id, { hidden: !item.hidden });
                          triggerToast(
                            !item.hidden
                              ? 'Obra ocultada del portafolio público'
                              : 'Obra visible en el portafolio público'
                          );
                        }}
                        className="px-2.5 py-1 font-mono text-[10px] border border-[#171513]/20 bg-[#F7F4EE] text-[#171513] cursor-pointer flex items-center gap-1"
                      >
                        {item.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{item.hidden ? 'Oculta' : 'Visible'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          updateGalleryItem(item.id, {
                            hideBuyButton: !item.hideBuyButton,
                          });
                          triggerToast(
                            !item.hideBuyButton
                              ? 'Botón Reservar ocultado en esta obra'
                              : 'Botón Reservar visible en esta obra'
                          );
                        }}
                        className="px-2.5 py-1 font-mono text-[10px] border border-[#171513]/20 bg-[#F7F4EE] text-[#171513] cursor-pointer"
                      >
                        {item.hideBuyButton ? 'Sin Botón Reservar' : 'Con Botón Reservar'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          updateGalleryItem(item.id, { hidePrice: !item.hidePrice });
                          triggerToast(
                            !item.hidePrice
                              ? 'Precio ocultado en esta obra'
                              : 'Precio visible en esta obra'
                          );
                        }}
                        className="px-2.5 py-1 font-mono text-[10px] border border-[#171513]/20 bg-[#F7F4EE] text-[#171513] cursor-pointer"
                      >
                        {item.hidePrice ? 'Precio Oculto' : 'Precio Visible'}
                      </button>
                    </div>

                    <div className="pt-2 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          deleteGalleryItem(item.id);
                          triggerToast('Obra eliminada de la galería');
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-[#A65D43] hover:underline cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar obra</span>
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
              <h2 className="font-display text-3xl font-medium">
                Catálogo de Servicios, Precios y Ajuste Masivo
              </h2>
              <p className="text-xs text-[#575049] font-mono">
                Editá cada servicio o aplicá un ajuste porcentual en 1 clic a toda la carta y al
                banner rotativo (redondeado a múltiplos de $500 ARS).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 p-1.5 bg-[#EFEAE1] border border-[#171513]/15 font-mono text-xs">
                <span className="px-2 text-[#4A443E] font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-[#96734E]" />
                  <span>Ajuste Masivo:</span>
                </span>
                {[-10, 10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    data-testid={`admin-bulk-price-${pct}`}
                    onClick={() => {
                      bulkAdjustServicePrices(pct);
                      triggerToast(
                        `Precios del catálogo y banner actualizados en ${
                          pct > 0 ? `+${pct}%` : `${pct}%`
                        }`
                      );
                    }}
                    className="px-2.5 py-1.5 bg-[#F7F4EE] hover:bg-[#171513] text-[#171513] hover:text-[#F7F4EE] font-semibold border border-[#171513]/15 transition-colors cursor-pointer"
                  >
                    {pct > 0 ? `+${pct}%` : `${pct}%`}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingService(null);
                  setServiceFormData({
                    index: String(services.length + 1).padStart(2, '0'),
                    category: 'Fades & Cortes',
                    name: '',
                    durationMinutes: 45,
                    price: 12000,
                    shortDescription: '',
                    preparation: ['Cabello limpio y libre de fijadores pesados'],
                    executionSteps: [
                      '10 min · Diagnóstico personalizado y estudio de facciones',
                      '25 min · Desarrollo del corte a tijera y máquina',
                      '10 min · Lavado y acabado con pomada mate botánica',
                    ],
                    aftercare: 'Recomendamos control cada 3 semanas.',
                    productsUsed: 'Tijera de autor · Máquina de precisión · Arcilla mate orgánica',
                  });
                  setIsNewServiceModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-mono uppercase tracking-wider bg-[#171513] text-[#F7F4EE] hover:bg-[#96734E] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir Servicio</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {services.map((srv) => (
              <div
                key={srv.id}
                className={`p-6 border flex flex-col justify-between transition-all ${
                  srv.hidden
                    ? 'border-[#171513]/10 bg-[#E4DDD1]/60 opacity-60'
                    : 'border-[#171513]/15 bg-[#EFEAE1]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-4 font-mono text-xs text-[#655E57] mb-2">
                    <span className="text-[#96734E] font-semibold">
                      {srv.index}. {srv.category}
                    </span>
                    <span className="text-lg font-semibold text-[#171513]">
                      {formatPriceARS(srv.price)}
                    </span>
                  </div>

                  <h3 className="font-display text-2xl font-medium text-[#171513] mb-1">
                    {srv.name}
                  </h3>
                  <p className="text-xs font-mono text-[#575049] mb-2">
                    Duración en agenda: {srv.durationMinutes} minutos
                  </p>
                  <p className="text-xs text-[#4A443E] leading-relaxed mb-4">
                    {srv.shortDescription}
                  </p>

                  <div className="p-3.5 bg-[#F7F4EE] border border-[#171513]/12 space-y-2 mb-3">
                    <span className="text-[10px] font-mono uppercase text-[#655E57] block">
                      Opciones en este servicio:
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
                        className="px-2.5 py-1 font-mono text-[10px] border border-[#171513]/20 bg-[#EFEAE1] text-[#171513] cursor-pointer"
                      >
                        {srv.hidden ? 'Servicio Oculto' : 'Servicio Visible'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          updateService(srv.id, {
                            hideBuyButton: !srv.hideBuyButton,
                          });
                          triggerToast(
                            !srv.hideBuyButton
                              ? 'Botón Elegir servicio ocultado'
                              : 'Botón Elegir servicio visible'
                          );
                        }}
                        className="px-2.5 py-1 font-mono text-[10px] border border-[#171513]/20 bg-[#EFEAE1] text-[#171513] cursor-pointer"
                      >
                        {srv.hideBuyButton ? 'Botón Reservar Oculto' : 'Botón Reservar Activo'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          updateService(srv.id, { hidePrice: !srv.hidePrice });
                          triggerToast(
                            !srv.hidePrice
                              ? 'Precio ocultado en este servicio'
                              : 'Precio visible en este servicio'
                          );
                        }}
                        className="px-2.5 py-1 font-mono text-[10px] border border-[#171513]/20 bg-[#EFEAE1] text-[#171513] cursor-pointer"
                      >
                        {srv.hidePrice ? 'Precio Oculto' : 'Precio Visible'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-[#171513]/12 flex items-center justify-between">
                  <span className="text-xs text-[#655E57] font-mono">ID: {srv.id}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingService(srv);
                        setServiceFormData(srv);
                        setIsNewServiceModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-mono border border-[#171513]/25 bg-[#F7F4EE] hover:bg-[#171513] hover:text-[#F7F4EE] transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteService(srv.id);
                        triggerToast('Servicio eliminado del catálogo');
                      }}
                      className="p-1.5 text-[#A65D43] border border-[#A65D43]/30 hover:bg-[#A65D43] hover:text-[#F7F4EE] cursor-pointer"
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
            <h2 className="font-display text-3xl font-medium mb-1">
              Bloqueos de Horario &amp; Pausas del Estudio
            </h2>
            <p className="text-xs text-[#575049] font-mono">
              Bloqueá franjas para almuerzo o diligencias. Esos horarios dejan de ofrecerse al
              instante en el turnero público.
            </p>
          </div>

          <div className="p-6 border border-[#171513]/15 bg-[#EFEAE1]">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[#96734E] font-medium mb-4">
              Bloquear Franja Horaria Específica
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#4A443E] mb-1 font-medium">
                  Fecha
                </label>
                <input
                  type="date"
                  value={newBlockedDate}
                  onChange={(e) => setNewBlockedDate(e.target.value)}
                  className="w-full h-10 px-3 text-xs font-mono border border-[#171513]/20 bg-[#F7F4EE] text-[#171513]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#4A443E] mb-1 font-medium">
                  Hora de Inicio
                </label>
                <input
                  type="time"
                  value={newBlockedTime}
                  onChange={(e) => setNewBlockedTime(e.target.value)}
                  className="w-full h-10 px-3 text-xs font-mono border border-[#171513]/20 bg-[#F7F4EE] text-[#171513]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#4A443E] mb-1 font-medium">
                  Duración (minutos)
                </label>
                <input
                  type="number"
                  step={15}
                  value={newBlockedDuration}
                  onChange={(e) => setNewBlockedDuration(Number(e.target.value))}
                  className="w-full h-10 px-3 text-xs font-mono border border-[#171513]/20 bg-[#F7F4EE] text-[#171513]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#4A443E] mb-1 font-medium">
                  Motivo
                </label>
                <input
                  type="text"
                  value={newBlockedReason}
                  onChange={(e) => setNewBlockedReason(e.target.value)}
                  className="w-full h-10 px-3 text-xs font-mono border border-[#171513]/20 bg-[#F7F4EE] text-[#171513]"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!newBlockedDate || !newBlockedTime) return;
                  addBlockedSlot({
                    id: `block-${Date.now()}`,
                    date: newBlockedDate,
                    startTime: newBlockedTime,
                    durationMinutes: newBlockedDuration,
                    reason: newBlockedReason,
                  });
                  triggerToast('Franja horaria bloqueada en el turnero público');
                }}
                className="px-5 py-2.5 text-xs font-mono uppercase tracking-wider bg-[#171513] text-[#F7F4EE] hover:bg-[#96734E] cursor-pointer"
              >
                Bloquear Horario
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-display text-2xl font-medium">
              Bloqueos Activos ({blockedSlots.length})
            </h3>
            {blockedSlots.map((b) => (
              <div
                key={b.id}
                className="p-4 border border-[#171513]/15 bg-[#EFEAE1] flex items-center justify-between gap-4 font-mono text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#171513]">
                      {b.date} · {b.startTime} hs
                    </span>
                    <span className="text-[#96734E]">({b.durationMinutes} minutos)</span>
                  </div>
                  <p className="text-[#575049] mt-0.5">{b.reason || 'Pausa de estudio'}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    deleteBlockedSlot(b.id);
                    triggerToast('Bloqueo eliminado y horario liberado');
                  }}
                  className="text-[#A65D43] hover:bg-[#A65D43] hover:text-[#F7F4EE] px-3 py-1.5 border border-[#A65D43]/35 cursor-pointer flex items-center gap-1 transition-colors"
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
              <h2 className="font-display text-3xl font-medium">
                Estado del Servidor, Métricas &amp; Registro de Operaciones
              </h2>
              <p className="text-xs text-[#575049] font-mono">
                Monitoreo del motor de reservas anti-colisión, sincronización con Firebase y
                persistencia en el servidor.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                refreshBackendState();
                triggerToast('Estado y métricas sincronizados con el servidor');
              }}
              className="px-4 py-2.5 bg-[#171513] text-[#F7F4EE] font-mono text-xs uppercase tracking-wider cursor-pointer"
            >
              Sincronizar Ahora
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-5 bg-[#EFEAE1] border border-[#171513]/15">
              <span className="text-[#655E57] uppercase text-[10px] block">Conexión API /api/*</span>
              <p className="font-display text-2xl font-semibold text-[#3D4F43] mt-1">
                {backendConnected ? 'ONLINE · SINCRONIZADO' : 'MODO LOCAL ACTIVO'}
              </p>
              <span className="text-[11px] text-[#575049] block mt-0.5">
                Validación y sanitización activas
              </span>
            </div>

            <div className="p-5 bg-[#EFEAE1] border border-[#171513]/15">
              <span className="text-[#655E57] uppercase text-[10px] block">
                Ocupación de Jornada Hoy
              </span>
              <p className="font-display text-3xl font-semibold text-[#171513] mt-1 tabular-nums">
                {backendMetrics ? `${backendMetrics.todayOccupancyPercentage}%` : '25%'}
              </p>
              <span className="text-[11px] text-[#575049] block mt-0.5">
                {backendMetrics
                  ? `${backendMetrics.freeSlotsTodayCount} horarios libres hoy`
                  : 'Cálculo dinámico por bloques'}
              </span>
            </div>

            <div className="p-5 bg-[#EFEAE1] border border-[#171513]/15">
              <span className="text-[#655E57] uppercase text-[10px] block">
                Facturación Estimada Hoy
              </span>
              <p className="font-display text-3xl font-semibold text-[#96734E] mt-1 tabular-nums">
                {formatPriceARS(
                  backendMetrics ? backendMetrics.todayEstimatedRevenueARS : totalRevenueEst
                )}
              </p>
              <span className="text-[11px] text-[#575049] block mt-0.5">
                Acumulado:{' '}
                {formatPriceARS(
                  backendMetrics ? backendMetrics.totalEstimatedRevenueARS : totalRevenueEst
                )}
              </span>
            </div>

            <div className="p-5 bg-[#EFEAE1] border border-[#171513]/15">
              <span className="text-[#655E57] uppercase text-[10px] block">Modalidades Elegidas</span>
              <p className="font-display text-2xl font-semibold text-[#171513] mt-1 tabular-nums">
                {backendMetrics
                  ? `${backendMetrics.depositAppointmentsCount} Seña / ${backendMetrics.commitmentAppointmentsCount} Estudio`
                  : `${appointments.length} Turnos Activos`}
              </p>
              <span className="text-[11px] text-[#3D4F43] block mt-0.5 truncate">
                {backendMetrics ? backendMetrics.nextAvailableSlotLabel : 'Agenda verificada'}
              </span>
            </div>
          </div>

          <div className="p-6 bg-[#EFEAE1] border border-[#171513]/15 space-y-4">
            <div className="flex items-center justify-between border-b border-[#171513]/12 pb-3">
              <h3 className="font-display text-2xl font-medium text-[#171513]">
                Registro de Operaciones ({auditLogs.length})
              </h3>
              <span className="text-xs font-mono text-[#96734E]">Persistencia Atómica JSON</span>
            </div>

            {auditLogs.length === 0 ? (
              <p className="text-xs font-mono text-[#655E57]">
                No hay eventos registrados aún en esta sesión.
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1 font-mono text-xs">
                {auditLogs.slice(0, 35).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-[#F7F4EE] border border-[#171513]/12 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-[#171513] text-[#F7F4EE] text-[10px] uppercase">
                          {log.action}
                        </span>
                        <span className="text-[10px] uppercase text-[#655E57]">
                          Actor: {log.actor}
                        </span>
                      </div>
                      <p className="text-[#171513]">{log.details}</p>
                    </div>
                    <span className="text-[11px] text-[#655E57] tabular-nums shrink-0">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171513]/75 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#F7F4EE] border border-[#171513]/20 text-[#171513] p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#171513]/12">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#96734E] block">
                  ARCHIVO VISUAL DEL ESTUDIO
                </span>
                <h3 className="font-display text-2xl font-medium">
                  Subir Nueva Obra al Portafolio
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 text-[#655E57] hover:text-[#171513] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGalleryPhoto} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[#171513] mb-1.5 font-semibold">
                  1. Elegir Foto desde tu Dispositivo o pegar URL *
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
                    className="px-4 py-2.5 bg-[#EFEAE1] border border-[#171513]/25 text-[#171513] font-semibold hover:border-[#171513] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4 text-[#96734E]" />
                    <span>
                      {isCompressingPhoto ? 'Procesando imagen...' : 'Seleccionar Archivo'}
                    </span>
                  </button>
                  <input
                    type="text"
                    value={photoPreviewUrl}
                    onChange={(e) => setPhotoPreviewUrl(e.target.value)}
                    placeholder="O pegá la URL de una imagen..."
                    className="flex-1 h-10 px-3 border border-[#171513]/20 bg-[#EFEAE1] text-[#171513]"
                  />
                </div>
                {photoPreviewUrl && (
                  <div className="mt-3 h-40 overflow-hidden border border-[#171513]/15 bg-[#171513]">
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
                  <label className="block text-[#575049] mb-1">Título de la Obra</label>
                  <input
                    type="text"
                    value={photoTitle}
                    onChange={(e) => setPhotoTitle(e.target.value)}
                    placeholder="Ej. Corte a Tijera & Textura"
                    className="w-full h-10 px-3 border border-[#171513]/20 bg-[#EFEAE1] text-[#171513]"
                  />
                </div>

                <div>
                  <label className="block text-[#575049] mb-1">Categoría</label>
                  <select
                    value={photoCategory}
                    onChange={(e) => setPhotoCategory(e.target.value as GalleryItemCategory)}
                    className="w-full h-10 px-3 border border-[#171513]/20 bg-[#EFEAE1] text-[#171513]"
                  >
                    <option value="Cortes & Fades">Cortes &amp; Fades</option>
                    <option value="El Estudio & Local">El Estudio &amp; Local</option>
                    <option value="Máquinas & Setup">Máquinas &amp; Setup</option>
                    <option value="Color & Diseños">Color &amp; Diseños</option>
                    <option value="Cultura & Streetwear">Cultura &amp; Streetwear</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#575049] mb-1">Especificación Técnica</label>
                  <input
                    type="text"
                    value={photoTechnicalSpec}
                    onChange={(e) => setPhotoTechnicalSpec(e.target.value)}
                    placeholder="Ej. Tijera japonesa · Acabado mate"
                    className="w-full h-10 px-3 border border-[#171513]/20 bg-[#EFEAE1] text-[#171513]"
                  />
                </div>
                <div>
                  <label className="block text-[#575049] mb-1">Etiqueta de Valor</label>
                  <input
                    type="text"
                    value={photoPriceTag}
                    onChange={(e) => setPhotoPriceTag(e.target.value)}
                    className="w-full h-10 px-3 border border-[#171513]/20 bg-[#EFEAE1] text-[#171513]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#575049] mb-1">Descripción breve</label>
                <textarea
                  rows={2}
                  value={photoDescription}
                  onChange={(e) => setPhotoDescription(e.target.value)}
                  placeholder="Descripción del trabajo realizado en el estudio..."
                  className="w-full p-2.5 border border-[#171513]/20 bg-[#EFEAE1] text-[#171513]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 p-2.5 border border-[#171513]/15 bg-[#EFEAE1] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={photoHideBuyButton}
                    onChange={(e) => setPhotoHideBuyButton(e.target.checked)}
                  />
                  <span>Ocultar botón Reservar</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 border border-[#171513]/15 bg-[#EFEAE1] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={photoHidePrice}
                    onChange={(e) => setPhotoHidePrice(e.target.checked)}
                  />
                  <span>Ocultar valor en foto</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#171513]/12 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono border border-[#171513]/20 text-[#575049] hover:text-[#171513] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-mono uppercase tracking-wider bg-[#171513] text-[#F7F4EE] hover:bg-[#96734E] cursor-pointer"
                >
                  Publicar Obra Ahora
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171513]/75 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#F7F4EE] border border-[#171513]/20 text-[#171513] p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#171513]/12">
              <h3 className="font-display text-2xl font-medium">
                {editingService ? 'Editar Servicio del Catálogo' : 'Nuevo Servicio del Catálogo'}
              </h3>
              <button
                type="button"
                onClick={() => setIsNewServiceModalOpen(false)}
                className="p-1 text-[#655E57] hover:text-[#171513]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[#4A443E] mb-1 font-semibold">
                  Nombre del Servicio *
                </label>
                <input
                  type="text"
                  value={serviceFormData.name || ''}
                  onChange={(e) =>
                    setServiceFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Ej. Corte de Autor / Clásico"
                  className="w-full h-10 px-3 border border-[#171513]/20 bg-[#EFEAE1] text-[#171513] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#4A443E] mb-1 font-semibold">Categoría</label>
                  <select
                    value={serviceFormData.category || 'Fades & Cortes'}
                    onChange={(e) =>
                      setServiceFormData((prev) => ({
                        ...prev,
                        category: e.target.value as StudioService['category'],
                      }))
                    }
                    className="w-full h-10 px-3 border border-[#171513]/20 bg-[#EFEAE1] text-[#171513]"
                  >
                    <option value="Fades & Cortes">Fades &amp; Cortes</option>
                    <option value="Corte & Barba">Corte &amp; Barba</option>
                    <option value="Color & Platinados">Color &amp; Platinados</option>
                    <option value="Detalles & Barba">Detalles &amp; Barba</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#4A443E] mb-1 font-semibold">
                    Duración (minutos) *
                  </label>
                  <input
                    type="number"
                    step={5}
                    value={serviceFormData.durationMinutes || 45}
                    onChange={(e) =>
                      setServiceFormData((prev) => ({
                        ...prev,
                        durationMinutes: Number(e.target.value),
                      }))
                    }
                    className="w-full h-10 px-3 border border-[#171513]/20 bg-[#EFEAE1] text-[#171513]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#4A443E] mb-1 font-semibold">
                  Precio en Pesos (ARS) *
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
                  className="w-full h-10 px-3 border border-[#171513]/20 bg-[#EFEAE1] text-[#171513]"
                />
              </div>

              <div>
                <label className="block text-[#4A443E] mb-1 font-semibold">
                  Elementos Incluidos ("Incluye:")
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
                  className="w-full h-10 px-3 border border-[#171513]/20 bg-[#EFEAE1] text-[#171513]"
                />
              </div>

              <div>
                <label className="block text-[#4A443E] mb-1 font-semibold">
                  Descripción en el Catálogo
                </label>
                <textarea
                  rows={3}
                  value={serviceFormData.shortDescription || ''}
                  onChange={(e) =>
                    setServiceFormData((prev) => ({
                      ...prev,
                      shortDescription: e.target.value,
                    }))
                  }
                  className="w-full p-2.5 border border-[#171513]/20 bg-[#EFEAE1] text-[#171513]"
                />
              </div>

              <div className="pt-4 border-t border-[#171513]/12 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewServiceModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono border border-[#171513]/20 text-[#575049] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!serviceFormData.name) return;
                    if (editingService) {
                      updateService(editingService.id, serviceFormData);
                      triggerToast('Servicio actualizado en el catálogo y turnero');
                    } else {
                      addService({
                        id: `srv-${Date.now()}`,
                        index: String(services.length + 1).padStart(2, '0'),
                        category:
                          (serviceFormData.category as StudioService['category']) ||
                          'Fades & Cortes',
                        name: serviceFormData.name,
                        durationMinutes: serviceFormData.durationMinutes || 45,
                        price: serviceFormData.price || 12000,
                        shortDescription: serviceFormData.shortDescription || '',
                        preparation: serviceFormData.preparation || [],
                        executionSteps: serviceFormData.executionSteps || [],
                        aftercare: serviceFormData.aftercare || '',
                        productsUsed: serviceFormData.productsUsed || '',
                      });
                      triggerToast('Nuevo servicio publicado en el catálogo');
                    }
                    setIsNewServiceModalOpen(false);
                  }}
                  className="px-5 py-2 text-xs font-mono uppercase tracking-wider bg-[#171513] text-[#F7F4EE] hover:bg-[#96734E] cursor-pointer"
                >
                  Guardar Servicio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
