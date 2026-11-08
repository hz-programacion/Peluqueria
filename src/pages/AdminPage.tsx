import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useStudio, normalizeSectionOrder } from '../context/StudioContext';
import {
  Shield,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  Clock,
  DollarSign,
  Calendar,
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
  MessageCircle,
  CheckCircle2,
  Lock,
  Users,
  FileText,
  KeyRound,
  BellRing,
  Star,
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
import { RetroCornerBandaBookmark, RetroRiverCrestBadge } from '../components/RetroPaperBanda';

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
      'Asistente de reservas en 3 pasos, consulta de turno activo y descarga de ticket PNG/ICS.',
  },
  services: {
    key: 'showServicesSection',
    label: 'Catálogo Interactivo de Servicios (#servicios)',
    description:
      'Carta de servicios con vista previa sincronizada, tiempos, valores y selección en 1 clic.',
  },
  beforeAfter: {
    key: 'showBeforeAfterSection',
    label: 'Comparador Urbano "Antes & Después" (#transformaciones)',
    description:
      'Deslizador interactivo con divisor aerosol para comparar el estado previo y el corte terminado.',
  },
  gallery: {
    key: 'showGallerySection',
    label: 'Galería & Trabajos del Estudio (#obras)',
    description:
      'Portafolio fotográfico con filtros por categoría, likes, ficha técnica y reserva directa.',
  },
  reviews: {
    key: 'showReviewsSection',
    label: 'Reseñas de Clientes (#opiniones)',
    description:
      'Testimonios verificados de clientes en Venado Tuerto y modal para publicar reseña.',
  },
  barber: {
    key: 'showBarberSection',
    label: 'Conocé al Barbero & Audio de Presentación (#estudio)',
    description:
      'Perfil de Rodrigo, reproductor de voz con transcripción sincronizada y contacto directo.',
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
    clientNotes,
    saveClientNote,
    deleteClientNote,
    navigateTo,
    auditLogs,
  } = useStudio();

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState<
    | 'sections_profile'
    | 'appointments'
    | 'clients_crm'
    | 'finance_box'
    | 'services'
    | 'gallery'
    | 'business_rules'
    | 'calendar'
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

  // CRM Client Formula Form
  const [crmClientName, setCrmClientName] = useState('');
  const [crmWhatsapp, setCrmWhatsapp] = useState('');
  const [crmFormulaSpec, setCrmFormulaSpec] = useState('');
  const [crmHairType, setCrmHairType] = useState('Ondulado / Densidad media');
  const [crmPreferredProducts, setCrmPreferredProducts] = useState('Polvo voluminizador mate');
  const [crmSearch, setCrmSearch] = useState('');

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
      '20 min · Degradé limpio a máquina y conexión a tijera',
      '10 min · Texturizado en seco para volumen y movimiento',
      '05 min · Peinado final con acabado mate',
    ],
    aftercare: 'Mantiene estructura entre 2 y 3 semanas.',
    productsUsed: 'Clippers de precisión · Tijeras de esculpir · Polvo mate',
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
      setPinError(`PIN incorrecto. El PIN activo es ${config.adminPin || '1234'}.`);
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
      studioTitle: studioTitleForm.trim() || 'Rodrigo Cutsss',
      brandKicker: brandKickerForm.trim() || 'Peluquería & Barbería de Autor · Venado Tuerto',
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
      `Cambios guardados y aplicados en vivo (${studioTitleForm.trim() || 'Rodrigo Cutsss'})`
    );
  };

  // Financial & Appointment metrics
  const estimateAppPrice = (serviceNames: string[]) => {
    const sum = serviceNames.reduce((acc, name) => {
      const found = services.find((s) => s.name.toLowerCase() === name.toLowerCase());
      return acc + (found ? found.price : 12000);
    }, 0);
    return sum > 0 ? sum : 12000;
  };

  const todayAppointments = appointments.filter((a) => a.date === todayStr);
  const totalRevenueEst = appointments.reduce(
    (acc, app) => acc + estimateAppPrice(app.serviceNames),
    0
  );
  const todayRevenueEst = todayAppointments.reduce(
    (acc, app) => acc + estimateAppPrice(app.serviceNames),
    0
  );
  const depositCollectedARS = appointments
    .filter((a) => a.paymentOption === 'deposit')
    .reduce(
      (acc, app) =>
        acc + Math.round((estimateAppPrice(app.serviceNames) * config.depositPercentage) / 100),
      0
    );
  const pendingBalanceInChairARS = Math.max(0, totalRevenueEst - depositCollectedARS);
  const averageTicketARS =
    appointments.length > 0 ? Math.round(totalRevenueEst / appointments.length) : 12000;

  // Combined CRM Client Directory (merges saved formula notes + appointment history)
  const combinedClients = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        clientName: string;
        whatsapp: string;
        formulaSpec: string;
        hairType: string;
        preferredProducts: string;
        visitsCount: number;
        totalSpentARS: number;
        lastDate: string;
      }
    >();

    for (const note of clientNotes) {
      const key = note.whatsapp.replace(/\D/g, '') || note.clientName.toLowerCase();
      map.set(key, {
        id: note.id,
        clientName: note.clientName,
        whatsapp: note.whatsapp,
        formulaSpec: note.formulaSpec,
        hairType: note.hairType,
        preferredProducts: note.preferredProducts,
        visitsCount: 1,
        totalSpentARS: 12000,
        lastDate: note.updatedAt,
      });
    }

    for (const app of appointments) {
      const key = app.whatsapp.replace(/\D/g, '') || app.clientName.toLowerCase();
      const price = estimateAppPrice(app.serviceNames);
      const existing = map.get(key);
      if (existing) {
        existing.visitsCount += 1;
        existing.totalSpentARS += price;
        if (app.date > existing.lastDate || !existing.lastDate.includes('-')) {
          existing.lastDate = `${app.date} (${app.startTime} hs)`;
        }
      } else {
        map.set(key, {
          id: `crm-auto-${app.id}`,
          clientName: app.clientName,
          whatsapp: app.whatsapp,
          formulaSpec: `Servicio habitual: ${app.serviceNames.join(' + ')}`,
          hairType: 'Por especificar en próxima visita',
          preferredProducts: 'Setup estándar Rodrigo Cutsss',
          visitsCount: 1,
          totalSpentARS: price,
          lastDate: `${app.date} (${app.startTime} hs)`,
        });
      }
    }

    const list = Array.from(map.values());
    if (!crmSearch.trim()) return list;
    const q = crmSearch.toLowerCase();
    return list.filter(
      (c) =>
        c.clientName.toLowerCase().includes(q) ||
        c.whatsapp.toLowerCase().includes(q) ||
        c.formulaSpec.toLowerCase().includes(q)
    );
  }, [clientNotes, appointments, crmSearch, services]);

  const handleExportAppointmentsCSV = () => {
    const headers = [
      'ID',
      'Fecha',
      'Horario',
      'Cliente',
      'WhatsApp',
      'Servicios',
      'Minutos',
      'Valor ARS',
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
      String(estimateAppPrice(a.serviceNames)),
      a.paymentOption === 'deposit' ? 'Seña Transferencia' : 'Pago en Estudio',
      a.status,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rodrigo-cutsss-caja-y-agenda-${todayStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast('Planilla CSV de turnos y caja descargada');
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
      title: photoTitle.trim() || `Corte en ${config.studioTitle}`,
      category: photoCategory || 'Cortes & Fades',
      imageUrl: photoPreviewUrl.trim(),
      description:
        photoDescription.trim() ||
        `Trabajo realizado por ${config.authorName} en ${config.studioTitle} (${config.address}, ${config.neighborhood}).`,
      technicalSpec:
        photoTechnicalSpec.trim() || 'Fade de precisión · Atención 1 a 1',
      dateLabel: 'Nuevo · Rodrigo Cutsss',
      likes: 34,
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
    triggerToast('Foto publicada en la galería pública');
  };

  const handleSaveServiceModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceFormData.name?.trim()) return;
    if (editingService) {
      updateService(editingService.id, {
        ...serviceFormData,
        name: serviceFormData.name.trim(),
        price: Number(serviceFormData.price) || 12000,
        durationMinutes: Number(serviceFormData.durationMinutes) || 45,
      });
      triggerToast(`Servicio "${serviceFormData.name}" actualizado`);
    } else {
      const nextIndex = String(services.length + 1).padStart(2, '0');
      addService({
        id: `srv-custom-${Date.now()}`,
        index: nextIndex,
        category: (serviceFormData.category as StudioService['category']) || 'Fades & Cortes',
        name: serviceFormData.name.trim(),
        durationMinutes: Number(serviceFormData.durationMinutes) || 45,
        price: Number(serviceFormData.price) || 12000,
        shortDescription:
          serviceFormData.shortDescription?.trim() ||
          'Atención personalizada en Rodrigo Cutsss.',
        preparation: serviceFormData.preparation || ['Asesoramiento previo personalizado'],
        executionSteps: serviceFormData.executionSteps || [
          '10 min · Diagnóstico y asesoramiento',
          '25 min · Ejecución técnica',
          '10 min · Terminación y peinado',
        ],
        aftercare: serviceFormData.aftercare || 'Control sugerido cada 3 semanas.',
        productsUsed:
          serviceFormData.productsUsed || 'Clippers de precisión · Tijeras · Polvo mate',
        imageUrl:
          serviceFormData.imageUrl ||
          '/src/assets/images/urban_streetwear_haircut_1793930882291.jpg',
      });
      triggerToast(`Nuevo servicio "${serviceFormData.name}" añadido a la carta`);
    }
    setIsNewServiceModalOpen(false);
  };

  const igInfo = resolveInstagramInfo(config.instagram);
  const waInfo = resolveWhatsAppInfo(config.phoneDisplay, config.whatsappRaw);
  const normalizedOrder = normalizeSectionOrder(config.sectionOrder);

  // If not authenticated, render Aged-Paper & Retro Carmine PIN Gate
  if (!isAdminAuthenticated) {
    return (
      <div className="py-14 md:py-24 px-4 flex items-center justify-center min-h-[75vh] bg-[#F3ECE0] text-[#181512]">
        <div className="w-full max-w-md p-7 sm:p-10 rounded-xl border border-[#C8BBA4] bg-[#FAF6EE] shadow-[0_22px_50px_rgba(24,21,18,0.12)] relative overflow-hidden">
          <RetroCornerBandaBookmark size="lg" />

          <div className="flex items-center gap-3.5 mb-5">
            <RetroRiverCrestBadge size="md" />
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#9E2A2B] font-semibold block">
                Acceso Privado · {config.studioTitle}
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#181512]">
                Dirección del Estudio
              </h1>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#4F463B] leading-relaxed mb-6">
            Sector reservado de {config.studioTitle}. Ingresá tu PIN para gestionar turnos en
            tiempo real, fichas técnicas de clientes, caja diaria, precios y secciones.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="admin-pin"
                className="block text-xs font-mono uppercase tracking-wider text-[#4F463B] mb-1.5 font-semibold"
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
                className="w-full h-12 px-4 rounded-lg text-center tracking-[0.4em] text-xl font-mono font-bold border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512] focus:border-[#9E2A2B] focus:outline-none"
                autoFocus
              />
              {pinError && (
                <p className="text-xs text-[#9E2A2B] mt-2 font-mono font-bold">{pinError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-lg uppercase font-mono font-semibold text-xs tracking-[0.16em] bg-[#9E2A2B] text-[#FAF6EE] hover:bg-[#822021] border border-[#781D1E] shadow-[0_3px_0_#5E1516] transition-all cursor-pointer"
            >
              Ingresar al Panel de {config.studioTitle}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-dashed border-[#C8BBA4] text-center space-y-2">
            <p className="text-xs font-mono text-[#4F463B]">
              PIN por defecto:{' '}
              <strong className="text-[#9E2A2B]">{config.adminPin || '1234'}</strong>
            </p>
            <p className="text-[11px] font-mono text-[#6E6355]">
              Atajo rápido desde cualquier pantalla:{' '}
              <kbd className="text-[#181512] font-semibold">Ctrl+Shift+A</kbd> o triple clic en el
              escudo RC.
            </p>
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="text-xs font-mono text-[#4F463B] hover:text-[#9E2A2B] mt-2 underline cursor-pointer inline-block font-semibold"
            >
              Volver al sitio público
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
    <div className="min-h-screen bg-[#0B0D12] text-[#FAFAFA] border-t-4 border-[#9E2A2B]">
      <div className="py-8 md:py-14 px-4 sm:px-8 max-w-7xl mx-auto text-[#FAFAFA] space-y-8">
      {/* Toast Notification */}
      {saveToast && (
        <div
          role="status"
          data-testid="admin-save-toast"
          className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl bg-[#0C0E14] text-white border-2 border-[#E11D48] shadow-2xl text-xs font-mono flex items-center gap-2.5"
        >
          <CheckCircle2 className="w-4 h-4 text-[#E11D48]" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Header Bar for Admin */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-[#E11D48] font-bold mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>CENTRO DE COMANDO PRIVADO · {config.studioTitle.toUpperCase()}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            Panel de <span className="text-[#E11D48]">Administración</span>
          </h1>
          <p className="text-xs font-mono text-zinc-400 mt-1 flex flex-wrap items-center gap-2">
            <KeyRound className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>
              Acceso sigiloso activo (invisible para clientes): entrá con{' '}
              <strong className="text-white">Ctrl + Shift + A</strong>, triple clic en el logo{' '}
              <strong className="text-white">{config.studioTitle}</strong> o{' '}
              <strong className="text-white">/#/admin</strong>.
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-[#E11D48] text-white hover:bg-[#BE123C] transition-colors cursor-pointer shadow-[0_6px_20px_rgba(225,29,72,0.35)]"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>+ Subir Foto a Galería</span>
          </button>

          <button
            type="button"
            data-testid="admin-view-public-site"
            onClick={() => navigateTo('home')}
            className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider border border-zinc-700 bg-[#12151E] hover:border-white text-white transition-colors cursor-pointer"
          >
            Ver Sitio Público
          </button>
          <button
            type="button"
            onClick={logoutAdmin}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-[#E11D48]/15 text-[#F43F5E] border border-[#E11D48]/40 hover:bg-[#E11D48] hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Quick KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-zinc-800 bg-[#0C0E14] relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#E11D48]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">
            Turnos de Hoy ({todayStr})
          </span>
          <p className="font-display text-3xl font-black uppercase text-white mt-1">
            {todayAppointments.length} Turnos Hoy
          </p>
          <p className="text-xs font-mono text-[#E11D48] font-bold mt-1">
            Hoy: {formatPriceARS(todayRevenueEst)} · Total: {formatPriceARS(totalRevenueEst)}
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-800 bg-[#0C0E14]">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">
            Fichero CRM de Clientes
          </span>
          <p className="font-display text-3xl font-black uppercase text-white mt-1 tabular-nums">
            {combinedClients.length} Clientes
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('clients_crm')}
            className="text-xs font-mono text-[#E11D48] hover:text-white underline mt-1 cursor-pointer"
          >
            Ver fórmulas de corte y WhatsApp &rarr;
          </button>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-800 bg-[#0C0E14]">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">
            Secciones Activas ({visibleSectionsCount}/8)
          </span>
          <p className="font-mono text-sm font-bold text-white mt-1.5 truncate">
            {config.studioTitle} · {igInfo.handle}
          </p>
          <p className="text-xs font-mono text-zinc-400 mt-1 truncate">
            WA: {waInfo.display}
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-800 bg-[#0C0E14]">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">
            Disponibilidad Hoy en Portada
          </span>
          <p className="font-display text-2xl font-black uppercase text-white mt-1">
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
            className="text-xs font-mono text-[#E11D48] hover:text-white underline mt-1 cursor-pointer"
          >
            Cambiar disponibilidad en vivo &rarr;
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-zinc-800">
        {[
          {
            id: 'sections_profile',
            label: 'Secciones, Textos & Banner',
            icon: Sliders,
          },
          {
            id: 'appointments',
            label: `Turnos & Recordatorios WA (${appointments.length})`,
            icon: Calendar,
          },
          {
            id: 'clients_crm',
            label: `CRM Clientes & Fórmulas (${combinedClients.length})`,
            icon: Users,
          },
          {
            id: 'finance_box',
            label: 'Caja, Señas & Finanzas',
            icon: DollarSign,
          },
          {
            id: 'services',
            label: `Servicios & Precios (${services.length})`,
            icon: TrendingUp,
          },
          {
            id: 'gallery',
            label: `Galería (${galleryItems.length})`,
            icon: Camera,
          },
          {
            id: 'business_rules',
            label: 'Horarios, PIN & Efectos',
            icon: Settings,
          },
          {
            id: 'calendar',
            label: `Bloqueos (${blockedSlots.length})`,
            icon: Clock,
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
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-mono font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#E11D48] text-white shadow-[0_6px_18px_rgba(225,29,72,0.35)]'
                  : 'bg-[#0C0E14] border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-600'
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
            <div className="p-6 sm:p-7 rounded-2xl border border-zinc-800 bg-[#0C0E14] space-y-5">
              <div className="border-b border-zinc-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#E11D48] font-bold mb-1">
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>ESTRUCTURA Y JERARQUÍA DEL SITIO</span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-black uppercase text-white">
                    Orden de Secciones &amp; Visibilidad
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Subí, bajá o apagá cualquier sección. Todo cambio impacta en vivo en la portada.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    updateConfig({ sectionOrder: [...DEFAULT_SECTION_ORDER] });
                    triggerToast('Orden recomendado restaurado');
                  }}
                  className="px-3.5 py-2 rounded-xl border border-zinc-700 bg-[#12151E] hover:border-white text-xs font-mono text-white flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#E11D48]" />
                  <span>Orden por Defecto</span>
                </button>
              </div>

              {/* Site Layout Mode Selector */}
              <div className="p-4 rounded-xl bg-[#12151E] border border-zinc-800 space-y-2.5">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#E11D48] font-bold block">
                  Modo de Visualización en Portada:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      updateConfig({ layoutMode: 'landing' });
                      triggerToast('Modo cambiado a Landing Completa');
                    }}
                    className={`p-3.5 rounded-xl border text-left font-mono text-xs transition-all cursor-pointer ${
                      (config.layoutMode || 'landing') === 'landing'
                        ? 'border-[#E11D48] bg-[#E11D48]/15 text-white'
                        : 'border-zinc-800 bg-[#0C0E14] text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    <span className="block font-bold">1. Flujo Completo (Landing)</span>
                    <span className="text-[11px] opacity-80 block mt-0.5">
                      Muestra todas las secciones activas una debajo de otra.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateConfig({ layoutMode: 'tabs' });
                      triggerToast('Modo cambiado a Navegación por Pestañas');
                    }}
                    className={`p-3.5 rounded-xl border text-left font-mono text-xs transition-all cursor-pointer ${
                      config.layoutMode === 'tabs'
                        ? 'border-[#E11D48] bg-[#E11D48]/15 text-white'
                        : 'border-zinc-800 bg-[#0C0E14] text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    <span className="block font-bold">2. Vista por Pestañas</span>
                    <span className="text-[11px] opacity-80 block mt-0.5">
                      Permite alternar entre secciones mediante botones superiores.
                    </span>
                  </button>
                </div>
              </div>

              {/* Fixed Portada Switch */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-[#12151E] flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#E11D48] text-white font-mono text-[10px] font-bold">
                      PORTADA
                    </span>
                    <span className="font-mono text-xs font-bold text-white">
                      Hero Principal &amp; Próximo Turno Libre (#inicio)
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Cabecera con mural urbano, banda roja diagonal y botón de turno inmediato.
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
                    config.showHeroSection !== false ? 'bg-[#E11D48]' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white transition ${
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
                      className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isEnabled
                          ? 'bg-[#12151E] border-zinc-800'
                          : 'bg-[#0C0E14] border-zinc-900 opacity-60'
                      }`}
                    >
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => {
                            moveSectionInOrder(secId, 'up');
                            triggerToast(`"${meta.label}" subida a posición #${index}`);
                          }}
                          title="Subir sección"
                          className="w-7 h-7 rounded border border-zinc-700 bg-[#0C0E14] hover:border-[#E11D48] text-white flex items-center justify-center disabled:opacity-30 cursor-pointer"
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
                          className="w-7 h-7 rounded border border-zinc-700 bg-[#0C0E14] hover:border-[#E11D48] text-white flex items-center justify-center disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-[#E11D48] font-mono text-[10px] font-bold">
                            #{index + 1}
                          </span>
                          <span className="font-mono text-xs font-bold text-white">
                            {meta.label}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                              isEnabled
                                ? 'bg-[#10B981]/15 text-[#10B981]'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {isEnabled ? 'Visible' : 'Oculta'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-1">{meta.description}</p>
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
                          isEnabled ? 'bg-[#E11D48]' : 'bg-zinc-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white transition ${
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

          {/* Right Column: Form to update Identity, Texts & Rotating Banner */}
          <div className="lg:col-span-6 space-y-6">
            <form
              onSubmit={handleSaveProfileAndLinks}
              className="p-6 sm:p-7 rounded-2xl border border-zinc-800 bg-[#0C0E14] space-y-5"
            >
              <div className="border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#E11D48] font-bold mb-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>IDENTIDAD, TEXTOS Y BANNER ROTATIVO</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-black uppercase text-white">
                  Datos de {config.studioTitle} &amp; Contacto
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Cualquier cambio que guardes acá actualiza la barra superior, el banner rotativo
                  con parallax, la portada, el turnero y el pie de página.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="admin-barber-name"
                      className="block text-xs font-mono text-zinc-300 mb-1 font-bold uppercase"
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
                      className="w-full h-10 px-3 rounded-xl text-xs font-mono border border-zinc-700 bg-[#12151E] text-white"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="admin-studio-title"
                      className="block text-xs font-mono text-zinc-300 mb-1 font-bold uppercase"
                    >
                      Nombre de la Peluquería / Marca *
                    </label>
                    <input
                      id="admin-studio-title"
                      type="text"
                      value={studioTitleForm}
                      onChange={(e) => setStudioTitleForm(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl text-xs font-mono border border-zinc-700 bg-[#12151E] text-white"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="admin-promo-banner-text"
                    className="block text-xs font-mono text-[#E11D48] mb-1 font-bold uppercase"
                  >
                    Texto Destacado del Banner Rotativo con Parallax
                  </label>
                  <input
                    id="admin-promo-banner-text"
                    type="text"
                    value={promoBannerTextForm}
                    onChange={(e) => setPromoBannerTextForm(e.target.value)}
                    placeholder="Ej. RODRIGO CUTSSS · LA BANDA DEL CORTE EN VUELTA DE OBLIGADO 931"
                    className="w-full h-10 px-3 rounded-xl text-xs font-mono border border-[#E11D48]/50 bg-[#12151E] text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-zinc-300 mb-1 font-bold uppercase">
                      Precio Base Destacado
                    </label>
                    <input
                      id="admin-main-price"
                      type="text"
                      value={mainPriceForm}
                      onChange={(e) => setMainPriceForm(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl text-xs font-mono border border-zinc-700 bg-[#12151E] text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-300 mb-1 font-bold uppercase">
                      Dirección del Estudio
                    </label>
                    <input
                      id="admin-address"
                      type="text"
                      value={addressForm}
                      onChange={(e) => setAddressForm(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl text-xs font-mono border border-zinc-700 bg-[#12151E] text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-300 mb-1 font-bold uppercase">
                      Ciudad y Provincia
                    </label>
                    <input
                      id="admin-neighborhood"
                      type="text"
                      value={neighborhoodForm}
                      onChange={(e) => setNeighborhoodForm(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl text-xs font-mono border border-zinc-700 bg-[#12151E] text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-300 mb-1 font-bold uppercase">
                      Alias de Transferencia / Seña
                    </label>
                    <input
                      id="admin-transfer-alias"
                      type="text"
                      value={transferAliasForm}
                      onChange={(e) => setTransferAliasForm(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl text-xs font-mono border border-zinc-700 bg-[#12151E] text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1 font-bold uppercase">
                    Titular Principal de Portada (Hero)
                  </label>
                  <input
                    type="text"
                    value={taglineForm}
                    onChange={(e) => setTaglineForm(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl text-xs font-mono border border-zinc-700 bg-[#12151E] text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1 font-bold uppercase">
                    Bajada de Portada (Subtítulo Hero)
                  </label>
                  <textarea
                    rows={2}
                    value={heroSubtitleForm}
                    onChange={(e) => setHeroSubtitleForm(e.target.value)}
                    className="w-full p-3 rounded-xl text-xs font-mono border border-zinc-700 bg-[#12151E] text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1 font-bold uppercase">
                    Biografía &amp; Presentación de {config.authorName}
                  </label>
                  <textarea
                    rows={3}
                    value={bioForm}
                    onChange={(e) => setBioForm(e.target.value)}
                    className="w-full p-3 rounded-xl text-xs font-mono border border-zinc-700 bg-[#12151E] text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-zinc-300 mb-1 font-bold uppercase">
                      Instagram (Usuario o URL)
                    </label>
                    <input
                      type="text"
                      value={instagramForm}
                      onChange={(e) => setInstagramForm(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl text-xs font-mono border border-zinc-700 bg-[#12151E] text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-300 mb-1 font-bold uppercase">
                      WhatsApp Visible
                    </label>
                    <input
                      type="text"
                      value={whatsappDisplayForm}
                      onChange={(e) => {
                        setWhatsappDisplayForm(e.target.value);
                        setWhatsappRawForm(e.target.value.replace(/\D/g, ''));
                      }}
                      className="w-full h-10 px-3 rounded-xl text-xs font-mono border border-zinc-700 bg-[#12151E] text-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                data-testid="admin-save-profile-btn"
                className="w-full h-12 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-[0_8px_24px_rgba(225,29,72,0.35)]"
              >
                Guardar y Aplicar en Vivo en Todo el Sitio
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================== */}
      {/* TAB 1: APPOINTMENTS + 1-CLICK WHATSAPP REMINDERS                            */}
      {/* =========================================================================== */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          {/* Quick Manual Appointment Creator */}
          <div className="p-6 rounded-2xl border border-zinc-800 bg-[#0C0E14] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#E11D48] font-bold block">
                  CARGA MANUAL DE TURNO (OCUPA EL HORARIO EN LA WEB AL INSTANTE)
                </span>
                <h3 className="font-display text-2xl font-black uppercase text-white">
                  Agendar Turno Manual (WhatsApp o Presencial)
                </h3>
              </div>

              <button
                type="button"
                onClick={handleExportAppointmentsCSV}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-700 bg-[#12151E] hover:border-[#E11D48] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#E11D48]" />
                <span>Exportar Planilla CSV</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs font-mono">
              <div>
                <label className="block text-zinc-400 mb-1">Fecha</label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-[#12151E] text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Horario</label>
                <input
                  type="time"
                  value={manualTime}
                  onChange={(e) => setManualTime(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-[#12151E] text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Servicio</label>
                <select
                  value={manualServiceId}
                  onChange={(e) => setManualServiceId(e.target.value)}
                  className="w-full h-10 px-2.5 rounded-xl border border-zinc-700 bg-[#12151E] text-white"
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
                  className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-[#12151E] text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">WhatsApp</label>
                <input
                  type="text"
                  value={manualClientWhatsapp}
                  onChange={(e) => setManualClientWhatsapp(e.target.value)}
                  placeholder="+54 9 3462 ..."
                  className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-[#12151E] text-white"
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
                      id: `RC-${Date.now().toString().slice(-6)}`,
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
                  className="w-full h-10 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-mono font-bold uppercase text-xs cursor-pointer transition-colors"
                >
                  + Ocupar Turno
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-black uppercase text-white">
                Agenda de Turnos &amp; Mensajes Rápidos WhatsApp
              </h2>
              <p className="text-xs font-mono text-zinc-400">
                Enviá recordatorios o confirmaciones en 1 clic. Si cancelás un turno, el horario se
                libera al instante.
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
                  className="h-9 pl-8 pr-3 rounded-xl border border-zinc-700 bg-[#0C0E14] text-xs font-mono text-white focus:border-[#E11D48] focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => setAppointmentFilter('today')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-colors cursor-pointer ${
                  appointmentFilter === 'today'
                    ? 'border-[#E11D48] bg-[#E11D48] text-white'
                    : 'border-zinc-800 bg-[#0C0E14] text-zinc-400'
                }`}
              >
                Hoy {todayStr} ({todayAppointments.length})
              </button>
              <button
                type="button"
                onClick={() => setAppointmentFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-colors cursor-pointer ${
                  appointmentFilter === 'all'
                    ? 'border-[#E11D48] bg-[#E11D48] text-white'
                    : 'border-zinc-800 bg-[#0C0E14] text-zinc-400'
                }`}
              >
                Todos ({appointments.length})
              </button>
            </div>
          </div>

          {displayedAppointments.length === 0 ? (
            <div className="p-8 rounded-2xl border border-zinc-800 bg-[#0C0E14] text-center space-y-2">
              <p className="font-display text-2xl font-bold uppercase text-white">
                No hay turnos registrados para este filtro
              </p>
              <p className="text-xs font-mono text-zinc-400">
                Todos los horarios dentro de la jornada están libres en el turnero público.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {displayedAppointments.map((app) => {
                const startMin = timeToMinutes(app.startTime);
                const endMin = startMin + app.serviceMinutes + app.bufferMinutes;
                const isFinished = app.status === 'completed';
                const cleanDigits = app.whatsapp.replace(/\D/g, '');
                const firstName = app.clientName.split(' ')[0];

                return (
                  <div
                    key={app.id}
                    className={`p-5 md:p-6 rounded-2xl border transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${
                      isFinished
                        ? 'border-zinc-900 bg-[#0C0E14]/60 opacity-70'
                        : 'border-zinc-800 bg-[#0C0E14]'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                        <span className="px-2.5 py-0.5 rounded bg-[#E11D48] text-white font-bold">
                          {app.date}
                        </span>
                        <span className="font-bold text-white">
                          {app.startTime} a {minutesToTime(endMin)} hs
                        </span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-zinc-400">
                          {app.serviceMinutes}m + {app.bufferMinutes}m pausa
                        </span>
                        <span className="text-zinc-600">·</span>
                        <span
                          className={
                            app.paymentOption === 'deposit'
                              ? 'text-[#10B981] font-bold'
                              : 'text-zinc-300'
                          }
                        >
                          {app.paymentOption === 'deposit'
                            ? `Seña ${config.depositPercentage}%`
                            : 'Abono en el Estudio'}
                        </span>
                      </div>

                      <h3 className="font-display text-2xl font-black uppercase text-white">
                        {app.clientName}
                      </h3>

                      <p className="text-xs font-mono text-zinc-300">
                        Servicio:{' '}
                        <span className="text-white font-bold">
                          {app.serviceNames.join(' + ')}
                        </span>{' '}
                        ·{' '}
                        <span className="text-[#E11D48] font-bold">
                          {formatPriceARS(estimateAppPrice(app.serviceNames))}
                        </span>
                      </p>

                      <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 pt-1">
                        <span>WhatsApp: {app.whatsapp}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {/* 1-Click WhatsApp Reminder */}
                      <a
                        href={`https://wa.me/${cleanDigits}?text=${encodeURIComponent(
                          `Hola ${firstName}! Te escribimos de ${config.studioTitle} para recordarte tu turno del ${app.date} a las ${app.startTime} hs (${app.serviceNames.join(' + ')}) en ${config.address}. ¡Te esperamos!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl border border-[#10B981]/50 bg-[#10B981]/15 text-[#10B981] text-xs font-mono font-bold hover:bg-[#10B981] hover:text-zinc-950 transition-colors flex items-center gap-1.5"
                      >
                        <BellRing className="w-3.5 h-3.5" />
                        <span>Recordatorio WA</span>
                      </a>

                      {/* 1-Click Post-Cut Review Request */}
                      <a
                        href={`https://wa.me/${cleanDigits}?text=${encodeURIComponent(
                          `Hola ${firstName}! Gracias por pasar hoy por ${config.studioTitle}. Si te gustó cómo quedó el corte, te agradecemos un montón tu reseña en nuestra web. ¡Nos vemos la próxima!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl border border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-mono font-bold hover:bg-[#F59E0B] hover:text-zinc-950 transition-colors flex items-center gap-1.5"
                      >
                        <Star className="w-3.5 h-3.5" />
                        <span>Pedir Reseña</span>
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
                              ? 'Turno marcado como pendiente'
                              : 'Turno marcado como completado'
                          );
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold border border-zinc-700 bg-[#12151E] text-white hover:border-white transition-colors cursor-pointer"
                      >
                        {isFinished ? 'Reabrir' : 'Completado ✓'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          cancelAppointment(app.id);
                          triggerToast(
                            `Turno de ${app.clientName} (${app.startTime} hs) cancelado y horario liberado`
                          );
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold text-[#F43F5E] hover:text-white border border-[#E11D48]/40 hover:bg-[#E11D48] transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Liberar</span>
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
      {/* TAB 2: CRM FICHERO DE CLIENTES & FÓRMULAS TÉCNICAS DE CORTE                 */}
      {/* =========================================================================== */}
      {activeTab === 'clients_crm' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 5 Cols: Add / Update Client Formula */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!crmClientName.trim() || !crmFormulaSpec.trim()) {
                triggerToast('Completá el nombre del cliente y su fórmula de corte');
                return;
              }
              saveClientNote({
                id: `crm-${Date.now()}`,
                clientName: crmClientName.trim(),
                whatsapp: crmWhatsapp.trim() || '+54 9 3462',
                formulaSpec: crmFormulaSpec.trim(),
                hairType: crmHairType.trim() || 'Densidad media',
                preferredProducts: crmPreferredProducts.trim() || 'Polvo mate',
                updatedAt: `Actualizado ${todayStr}`,
              });
              setCrmClientName('');
              setCrmWhatsapp('');
              setCrmFormulaSpec('');
              triggerToast('Ficha técnica de cliente guardada en el CRM');
            }}
            className="lg:col-span-5 p-6 sm:p-7 rounded-2xl border border-zinc-800 bg-[#0C0E14] space-y-4"
          >
            <div className="border-b border-zinc-800 pb-4">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#E11D48] font-bold block mb-1">
                FICHERO TÉCNICO · {config.studioTitle}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-black uppercase text-white">
                Registrar Fórmula de Cliente
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Guardá qué alzada usa cada cliente, sus remolinos y su producto favorito para
                repetir su corte exacto en cada visita.
              </p>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-zinc-300 mb-1 font-bold uppercase">
                  Nombre y Apellido *
                </label>
                <input
                  type="text"
                  required
                  value={crmClientName}
                  onChange={(e) => setCrmClientName(e.target.value)}
                  placeholder="Ej. Ignacio Varela"
                  className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-[#12151E] text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-bold uppercase">
                  WhatsApp del Cliente
                </label>
                <input
                  type="text"
                  value={crmWhatsapp}
                  onChange={(e) => setCrmWhatsapp(e.target.value)}
                  placeholder="+54 9 3462 521984"
                  className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-[#12151E] text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-bold uppercase">
                  Fórmula Técnica de Corte / Alzadas / Remolinos *
                </label>
                <textarea
                  rows={3}
                  required
                  value={crmFormulaSpec}
                  onChange={(e) => setCrmFormulaSpec(e.target.value)}
                  placeholder="Ej. Mid Drop Fade desde 0.0mm a 1.5mm · Arriba 4cm a tijera · Cuidar remolino derecho"
                  className="w-full p-3 rounded-xl border border-zinc-700 bg-[#12151E] text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1 font-bold uppercase">
                    Tipo de Pelo / Barba
                  </label>
                  <input
                    type="text"
                    value={crmHairType}
                    onChange={(e) => setCrmHairType(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-[#12151E] text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1 font-bold uppercase">
                    Acabado / Producto
                  </label>
                  <input
                    type="text"
                    value={crmPreferredProducts}
                    onChange={(e) => setCrmPreferredProducts(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-[#12151E] text-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-mono text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
            >
              + Guardar Ficha Técnica
            </button>
          </form>

          {/* Right 7 Cols: Client Formulas List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-3xl font-black uppercase text-white">
                  Directorio &amp; Historial ({combinedClients.length})
                </h3>
                <p className="text-xs font-mono text-zinc-400">
                  Sincronizado automáticamente con las reservas del turnero.
                </p>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={crmSearch}
                  onChange={(e) => setCrmSearch(e.target.value)}
                  placeholder="Buscar cliente o fórmula..."
                  className="h-10 pl-9 pr-4 rounded-xl border border-zinc-700 bg-[#0C0E14] text-xs font-mono text-white"
                />
              </div>
            </div>

            <div className="space-y-3">
              {combinedClients.map((client) => {
                const digits = client.whatsapp.replace(/\D/g, '');
                return (
                  <div
                    key={client.id}
                    className="p-5 rounded-2xl border border-zinc-800 bg-[#0C0E14] space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="font-display text-2xl font-black uppercase text-white">
                          {client.clientName}
                        </h4>
                        <span className="text-xs font-mono text-zinc-400">
                          WA: {client.whatsapp} · {client.lastDate}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="px-2.5 py-1 rounded bg-[#E11D48]/15 text-[#E11D48] font-bold">
                          {client.visitsCount} {client.visitsCount === 1 ? 'visita' : 'visitas'}
                        </span>
                        <span className="px-2.5 py-1 rounded bg-zinc-800 text-white font-bold">
                          {formatPriceARS(client.totalSpentARS)}
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#12151E] border border-zinc-800 text-xs font-mono space-y-1.5">
                      <p className="text-white">
                        <strong className="text-[#E11D48] uppercase">Fórmula: </strong>
                        {client.formulaSpec}
                      </p>
                      <p className="text-zinc-400">
                        <strong>Pelo/Barba:</strong> {client.hairType} ·{' '}
                        <strong>Producto:</strong> {client.preferredProducts}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCrmClientName(client.clientName);
                            setCrmWhatsapp(client.whatsapp);
                            setCrmFormulaSpec(client.formulaSpec);
                            setCrmHairType(client.hairType);
                            setCrmPreferredProducts(client.preferredProducts);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-white text-xs font-mono text-zinc-200 cursor-pointer"
                        >
                          Editar Ficha
                        </button>

                        {digits.length >= 8 && (
                          <a
                            href={`https://wa.me/${digits}?text=${encodeURIComponent(
                              `Hola ${client.clientName.split(' ')[0]}! Te escribe ${config.authorName} de ${config.studioTitle}. ¿Cómo viene creciendo ese corte? Cuando quieras renovar tu lugar te espero por el estudio.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg border border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981] text-xs font-mono font-bold inline-flex items-center gap-1.5"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Seguimiento WA</span>
                          </a>
                        )}
                      </div>

                      {!client.id.startsWith('crm-auto-') && (
                        <button
                          type="button"
                          onClick={() => {
                            deleteClientNote(client.id);
                            triggerToast('Ficha eliminada');
                          }}
                          className="text-xs font-mono text-[#F43F5E] hover:underline cursor-pointer"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================== */}
      {/* TAB 3: CAJA DIARIA, SEÑAS & REPORTE FINANCIERO                              */}
      {/* =========================================================================== */}
      {activeTab === 'finance_box' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#E11D48] font-bold block">
                CONTROL DE CAJA Y FACTURACIÓN · {config.studioTitle}
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-black uppercase text-white">
                Balance de Caja, Señas ({config.depositPercentage}%) &amp; Servicios
              </h2>
            </div>

            <button
              type="button"
              onClick={handleExportAppointmentsCSV}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-mono text-xs font-bold uppercase tracking-wider cursor-pointer shadow-[0_8px_24px_rgba(225,29,72,0.35)]"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Planilla Excel (.CSV)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-2xl border border-zinc-800 bg-[#0C0E14]">
              <span className="text-xs font-mono uppercase text-zinc-400 block">
                Caja Estimada Hoy ({todayStr})
              </span>
              <p className="font-mono text-3xl font-black text-white mt-2 tabular-nums">
                {formatPriceARS(todayRevenueEst)}
              </p>
              <span className="text-xs font-mono text-[#10B981] mt-1 block">
                {todayAppointments.length} turnos programados hoy
              </span>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-800 bg-[#0C0E14]">
              <span className="text-xs font-mono uppercase text-zinc-400 block">
                Facturación Total en Agenda
              </span>
              <p className="font-mono text-3xl font-black text-[#E11D48] mt-2 tabular-nums">
                {formatPriceARS(totalRevenueEst)}
              </p>
              <span className="text-xs font-mono text-zinc-400 mt-1 block">
                Ticket promedio: {formatPriceARS(averageTicketARS)}
              </span>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-800 bg-[#0C0E14]">
              <span className="text-xs font-mono uppercase text-zinc-400 block">
                Señas por Transferencia ({config.depositPercentage}%)
              </span>
              <p className="font-mono text-3xl font-black text-[#10B981] mt-2 tabular-nums">
                {formatPriceARS(depositCollectedARS)}
              </p>
              <span className="text-xs font-mono text-zinc-400 mt-1 block">
                Alias activo: {config.transferAlias}
              </span>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-800 bg-[#0C0E14]">
              <span className="text-xs font-mono uppercase text-zinc-400 block">
                Saldo a Cobrar en el Estudio
              </span>
              <p className="font-mono text-3xl font-black text-white mt-2 tabular-nums">
                {formatPriceARS(pendingBalanceInChairARS)}
              </p>
              <span className="text-xs font-mono text-zinc-400 mt-1 block">
                Efectivo o transferencia al terminar
              </span>
            </div>
          </div>

          {/* Breakdown by Service */}
          <div className="p-6 sm:p-8 rounded-2xl border border-zinc-800 bg-[#0C0E14] space-y-5">
            <h3 className="font-display text-2xl font-black uppercase text-white">
              Rendimiento por Servicio del Catálogo
            </h3>
            <div className="divide-y divide-zinc-800 font-mono text-xs">
              {services.map((srv) => {
                const count = appointments.filter((a) =>
                  a.serviceNames.some((n) => n.toLowerCase() === srv.name.toLowerCase())
                ).length;
                const rev = count * srv.price;
                return (
                  <div
                    key={srv.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <span className="text-[#E11D48] font-bold mr-2">{srv.index}.</span>
                      <span className="text-white font-bold">{srv.name}</span>
                      <span className="text-zinc-500 ml-2">({formatPriceARS(srv.price)})</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-zinc-400">{count} turnos reservados</span>
                      <span className="text-white font-bold tabular-nums">
                        {formatPriceARS(rev)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
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
              <h2 className="font-display text-3xl font-black uppercase text-white">
                Catálogo de Servicios, Precios y Ajuste Masivo
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Editá cada servicio o aplicá un ajuste porcentual en 1 clic a toda la carta y al
                banner rotativo (redondeado a múltiplos de $500 ARS).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[#0C0E14] border border-zinc-800 font-mono text-xs">
                <span className="px-2 text-zinc-300 font-bold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-[#E11D48]" />
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
                    className="px-2.5 py-1.5 rounded-lg bg-[#12151E] hover:bg-[#E11D48] text-white font-bold border border-zinc-700 transition-colors cursor-pointer"
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
                  });
                  setIsNewServiceModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-[#E11D48] text-white hover:bg-[#BE123C] cursor-pointer"
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
                className={`p-6 rounded-2xl border flex flex-col justify-between transition-all ${
                  srv.hidden
                    ? 'border-zinc-900 bg-[#0C0E14]/50 opacity-60'
                    : 'border-zinc-800 bg-[#0C0E14]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-4 font-mono text-xs text-zinc-400 mb-2">
                    <span className="text-[#E11D48] font-bold">
                      {srv.index}. {srv.category}
                    </span>
                    <span className="text-lg font-black text-white">
                      {formatPriceARS(srv.price)}
                    </span>
                  </div>

                  <h3 className="font-display text-2xl font-black uppercase text-white mb-1">
                    {srv.name}
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mb-2">
                    Duración en agenda: {srv.durationMinutes} minutos
                  </p>
                  <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                    {srv.shortDescription}
                  </p>

                  <div className="p-3.5 rounded-xl bg-[#12151E] border border-zinc-800 space-y-2 mb-3">
                    <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                      Visibilidad en este servicio:
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
                        className="px-2.5 py-1 rounded font-mono text-[10px] border border-zinc-700 bg-[#0C0E14] text-white cursor-pointer"
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
                        className="px-2.5 py-1 rounded font-mono text-[10px] border border-zinc-700 bg-[#0C0E14] text-white cursor-pointer"
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
                        className="px-2.5 py-1 rounded font-mono text-[10px] border border-zinc-700 bg-[#0C0E14] text-white cursor-pointer"
                      >
                        {srv.hidePrice ? 'Precio Oculto' : 'Precio Visible'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-mono">ID: {srv.id}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingService(srv);
                        setServiceFormData(srv);
                        setIsNewServiceModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono border border-zinc-700 bg-[#12151E] hover:border-white text-white transition-colors cursor-pointer"
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
                      className="p-1.5 rounded-lg text-[#F43F5E] border border-[#E11D48]/30 hover:bg-[#E11D48] hover:text-white cursor-pointer"
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
      {/* TAB 5: GALLERY MANAGEMENT                                                   */}
      {/* =========================================================================== */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-black uppercase text-white">
                Galería &amp; Trabajos de {config.studioTitle} (#obras)
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Subí nuevas fotos o controlá la visibilidad individual de cada tarjeta, su precio y
                su botón de reserva.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-[#E11D48] text-white hover:bg-[#BE123C] cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Subir Nueva Foto</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all ${
                  item.hidden
                    ? 'border-zinc-900 bg-[#0C0E14]/50 opacity-60'
                    : 'border-zinc-800 bg-[#0C0E14]'
                }`}
              >
                <div className="h-52 overflow-hidden relative bg-[#07080C]">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded bg-[#07080C]/90 text-white font-mono text-[10px]">
                      {item.category}
                    </span>
                    {item.hidden && (
                      <span className="px-2 py-1 rounded bg-[#E11D48] text-white font-mono text-[10px] uppercase">
                        OCULTA
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-display text-xl font-bold uppercase text-white mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2">{item.description}</p>
                  </div>

                  <div className="pt-3 border-t border-zinc-800 space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          updateGalleryItem(item.id, { hidden: !item.hidden });
                          triggerToast(
                            !item.hidden ? 'Foto ocultada de la galería' : 'Foto visible'
                          );
                        }}
                        className="px-2.5 py-1 rounded font-mono text-[10px] border border-zinc-700 bg-[#12151E] text-white cursor-pointer flex items-center gap-1"
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
                        }}
                        className="px-2.5 py-1 rounded font-mono text-[10px] border border-zinc-700 bg-[#12151E] text-white cursor-pointer"
                      >
                        {item.hideBuyButton ? 'Sin Botón Reservar' : 'Con Botón Reservar'}
                      </button>
                    </div>

                    <div className="pt-2 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          deleteGalleryItem(item.id);
                          triggerToast('Foto eliminada de la galería');
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-[#F43F5E] hover:underline cursor-pointer"
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
      {/* TAB 6: HORARIOS, TEMA RIVER PLATE, EFECTOS Y PIN                            */}
      {/* =========================================================================== */}
      {activeTab === 'business_rules' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Schedule, Open Days, PIN */}
          <div className="lg:col-span-7 p-6 sm:p-7 rounded-2xl border border-zinc-800 bg-[#0C0E14] space-y-6">
            <div className="border-b border-zinc-800 pb-4">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#E11D48] font-bold block mb-1">
                REGLAS OPERATIVAS Y HORARIOS
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-black uppercase text-white">
                Días de Atención, Horarios &amp; PIN
              </h2>
            </div>

            <div>
              <span className="block text-xs font-mono text-zinc-300 mb-2 font-bold uppercase">
                Días Hábiles de Atención en el Turnero:
              </span>
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
                          triggerToast('Debe haber al menos 1 día activo');
                          return;
                        }
                        updateConfig({ openDays: nextDays });
                        triggerToast(`Día ${d.full}: ${isDayOpen ? 'Cerrado' : 'Abierto'}`);
                      }}
                      className={`px-3.5 py-2 rounded-xl font-mono text-xs border transition-colors cursor-pointer ${
                        isDayOpen
                          ? 'bg-[#E11D48] text-white border-[#E11D48] font-bold'
                          : 'bg-[#12151E] text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      {d.full}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <label className="block text-zinc-300 mb-1.5 font-bold uppercase">
                  Hora de Apertura (24h)
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
                  className="w-full h-11 px-3.5 rounded-xl border border-zinc-700 bg-[#12151E] text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1.5 font-bold uppercase">
                  Hora de Cierre (24h)
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
                  className="w-full h-11 px-3.5 rounded-xl border border-zinc-700 bg-[#12151E] text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1.5 font-bold uppercase">
                  Pausa Entre Turnos (min)
                </label>
                <select
                  value={config.cleanBufferMinutes}
                  onChange={(e) => {
                    updateConfig({ cleanBufferMinutes: Number(e.target.value) });
                    triggerToast(`Pausa actualizada a ${e.target.value} min`);
                  }}
                  className="w-full h-11 px-3.5 rounded-xl border border-zinc-700 bg-[#12151E] text-white font-bold"
                >
                  <option value={0}>0 min</option>
                  <option value={5}>5 min</option>
                  <option value={10}>10 min (Recomendado)</option>
                  <option value={15}>15 min</option>
                </select>
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
                    className="flex-1 h-11 px-3.5 rounded-xl border border-zinc-700 bg-[#12151E] text-[#E11D48] font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!adminPinForm.trim()) return;
                      updateConfig({ adminPin: adminPinForm.trim() });
                      triggerToast(`Nuevo PIN guardado: ${adminPinForm.trim()}`);
                    }}
                    className="px-4 rounded-xl bg-[#E11D48] text-white font-bold uppercase cursor-pointer"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: River Plate Visual Presets & Interactive Effects */}
          <div className="lg:col-span-5 p-6 sm:p-7 rounded-2xl border border-zinc-800 bg-[#0C0E14] space-y-6">
            <div className="border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#E11D48] font-bold mb-1">
                <Palette className="w-3.5 h-3.5" />
                <span>ESTÉTICA RIVER PLATE &amp; EFECTOS URBANOS</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-black uppercase text-white">
                Atmósfera &amp; Animaciones
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  {
                    id: 'crimson',
                    name: 'La Banda Roja (Oficial)',
                    desc: 'Obsidiana Monumental, Blanco Puro y Rojo River',
                    swatch: '#E11D48',
                  },
                  {
                    id: 'uv',
                    name: 'Noche de Copa (Luz Roja)',
                    desc: 'Resplandor carmesí intenso y alto contraste',
                    swatch: '#F43F5E',
                  },
                  {
                    id: 'amber',
                    name: 'Edición Campeón (Dorado)',
                    desc: 'Detalles en oro campeón, rojo y negro',
                    swatch: '#F59E0B',
                  },
                  {
                    id: 'volt',
                    name: 'Acero Monumental',
                    desc: 'Plata metálica, blanco y rojo carmesí',
                    swatch: '#D4D4D8',
                  },
                ] as { id: UrbanThemePreset; name: string; desc: string; swatch: string }[]
              ).map((preset) => {
                const active = (config.urbanTheme || 'crimson') === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      updateConfig({ urbanTheme: preset.id });
                      triggerToast(`Tema visual activado: ${preset.name}`);
                    }}
                    className={`p-3.5 rounded-xl border text-left font-mono transition-all cursor-pointer ${
                      active
                        ? 'border-[#E11D48] bg-[#E11D48]/15 text-white'
                        : 'border-zinc-800 bg-[#12151E] text-zinc-300 hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/40"
                        style={{ backgroundColor: preset.swatch }}
                      />
                      <span className="text-xs font-bold">{preset.name}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">{preset.desc}</p>
                  </button>
                );
              })}
            </div>

            <div className="space-y-3 pt-2 border-t border-zinc-800 text-xs font-mono">
              {[
                {
                  key: 'showPromoBanner' as const,
                  label: 'Banner Rotativo Superior con Precios y Dirección',
                  desc: 'Cinta continua con valores de servicios, dirección y próximo turno',
                },
                {
                  key: 'enableParallax' as const,
                  label: 'Efecto Parallax & Aceleración del Banner al Scrollear',
                  desc: 'Movimiento multicapa en el fondo urbano y retrato principal',
                },
                {
                  key: 'enableDripTrail' as const,
                  label: 'Rastro Aerosol & Botones Magnéticos',
                  desc: 'Efecto de aerosol interactivo en colores rojo y blanco al mover el cursor',
                },
              ].map((fx) => {
                const isOn = config[fx.key] !== false;
                return (
                  <div
                    key={fx.key}
                    className="p-3.5 rounded-xl border border-zinc-800 bg-[#12151E] flex items-center justify-between gap-3"
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
                        updateConfig({ [fx.key]: !isOn });
                        triggerToast(`${fx.label}: ${!isOn ? 'Activado' : 'Desactivado'}`);
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                        isOn ? 'bg-[#E11D48]' : 'bg-zinc-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white transition ${
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
      {/* TAB 7: CALENDAR & BLOCKED SLOTS                                             */}
      {/* =========================================================================== */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-3xl font-black uppercase text-white mb-1">
              Bloqueos de Horario &amp; Pausas del Estudio
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              Bloqueá franjas para almuerzo o trámites. Esos horarios dejan de ofrecerse al
              instante en el turnero público.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-800 bg-[#0C0E14] space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[#E11D48] font-bold">
              Bloquear Franja Horaria Específica
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono">
              <div>
                <label className="block text-zinc-400 mb-1">Fecha</label>
                <input
                  type="date"
                  value={newBlockedDate}
                  onChange={(e) => setNewBlockedDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-[#12151E] text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Hora de Inicio</label>
                <input
                  type="time"
                  value={newBlockedTime}
                  onChange={(e) => setNewBlockedTime(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-[#12151E] text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Duración (min)</label>
                <select
                  value={newBlockedDuration}
                  onChange={(e) => setNewBlockedDuration(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-[#12151E] text-white"
                >
                  <option value={30}>30 minutos</option>
                  <option value={60}>60 minutos</option>
                  <option value={90}>90 minutos</option>
                  <option value={120}>2 horas</option>
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Motivo</label>
                <input
                  type="text"
                  value={newBlockedReason}
                  onChange={(e) => setNewBlockedReason(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-[#12151E] text-white"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    addBlockedSlot({
                      id: `block-${Date.now()}`,
                      date: newBlockedDate,
                      startTime: newBlockedTime,
                      durationMinutes: newBlockedDuration,
                      reason: newBlockedReason.trim() || 'Bloqueo administrativo',
                    });
                    triggerToast(`Horario ${newBlockedTime} hs bloqueado el ${newBlockedDate}`);
                  }}
                  className="w-full h-10 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-mono font-bold uppercase text-xs cursor-pointer"
                >
                  + Bloquear Franja
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {blockedSlots.map((slot) => (
              <div
                key={slot.id}
                className="p-5 rounded-2xl border border-zinc-800 bg-[#0C0E14] flex items-center justify-between gap-4"
              >
                <div className="space-y-1 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#E11D48] text-white font-bold">
                      {slot.date}
                    </span>
                    <span className="text-white font-bold">
                      {slot.startTime} hs ({slot.durationMinutes} min)
                    </span>
                  </div>
                  <p className="text-zinc-400">{slot.reason}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    deleteBlockedSlot(slot.id);
                    triggerToast('Bloqueo eliminado y horario habilitado');
                  }}
                  className="px-3 py-2 rounded-xl border border-zinc-700 hover:border-[#E11D48] text-xs font-mono text-[#F43F5E] cursor-pointer"
                >
                  Desbloquear
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for Adding/Editing Service */}
      {isNewServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleSaveServiceModal}
            className="w-full max-w-lg rounded-2xl border-2 border-[#E11D48]/50 bg-[#0C0E14] p-6 sm:p-8 space-y-4 text-xs font-mono"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-display text-2xl font-black uppercase text-white">
                {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
              </h3>
              <button
                type="button"
                onClick={() => setIsNewServiceModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-zinc-300 mb-1 font-bold uppercase">
                Nombre del Servicio *
              </label>
              <input
                type="text"
                required
                value={serviceFormData.name || ''}
                onChange={(e) =>
                  setServiceFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-[#12151E] text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-300 mb-1 font-bold uppercase">
                  Precio (ARS) *
                </label>
                <input
                  type="number"
                  required
                  value={serviceFormData.price || 12000}
                  onChange={(e) =>
                    setServiceFormData((prev) => ({ ...prev, price: Number(e.target.value) }))
                  }
                  className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-[#12151E] text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-300 mb-1 font-bold uppercase">
                  Duración (min) *
                </label>
                <input
                  type="number"
                  required
                  value={serviceFormData.durationMinutes || 45}
                  onChange={(e) =>
                    setServiceFormData((prev) => ({
                      ...prev,
                      durationMinutes: Number(e.target.value),
                    }))
                  }
                  className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-[#12151E] text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 mb-1 font-bold uppercase">Descripción</label>
              <textarea
                rows={3}
                value={serviceFormData.shortDescription || ''}
                onChange={(e) =>
                  setServiceFormData((prev) => ({
                    ...prev,
                    shortDescription: e.target.value,
                  }))
                }
                className="w-full p-3 rounded-xl border border-zinc-700 bg-[#12151E] text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewServiceModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#E11D48] text-white font-bold uppercase cursor-pointer"
              >
                Guardar Servicio
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal for Uploading Gallery Photo */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateGalleryPhoto}
            className="w-full max-w-lg rounded-2xl border-2 border-[#E11D48]/50 bg-[#0C0E14] p-6 sm:p-8 space-y-4 text-xs font-mono"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-display text-2xl font-black uppercase text-white">
                Subir Foto a Galería · {config.studioTitle}
              </h3>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-zinc-300 mb-1 font-bold uppercase">
                Título del Trabajo
              </label>
              <input
                type="text"
                value={photoTitle}
                onChange={(e) => setPhotoTitle(e.target.value)}
                placeholder="Ej. Mid Drop Fade & Textura"
                className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-[#12151E] text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-300 mb-1 font-bold uppercase">Categoría</label>
                <select
                  value={photoCategory}
                  onChange={(e) => setPhotoCategory(e.target.value as GalleryItemCategory)}
                  className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-[#12151E] text-white"
                >
                  <option value="Cortes & Fades">Cortes &amp; Fades</option>
                  <option value="El Estudio & Local">El Estudio &amp; Local</option>
                  <option value="Máquinas & Setup">Máquinas &amp; Setup</option>
                  <option value="Color & Diseños">Color &amp; Diseños</option>
                  <option value="Cultura & Streetwear">Cultura &amp; Streetwear</option>
                </select>
              </div>
              <div>
                <label className="block text-zinc-300 mb-1 font-bold uppercase">
                  Etiqueta de Precio
                </label>
                <input
                  type="text"
                  value={photoPriceTag}
                  onChange={(e) => setPhotoPriceTag(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-zinc-700 bg-[#12151E] text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 mb-1 font-bold uppercase">
                Seleccionar Foto desde tu Celular/PC o pegar URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={photoPreviewUrl}
                  onChange={(e) => setPhotoPreviewUrl(e.target.value)}
                  placeholder="https://... o subí archivo"
                  className="flex-1 h-10 px-3 rounded-xl border border-zinc-700 bg-[#12151E] text-white"
                />
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
                  className="px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold cursor-pointer"
                >
                  {isCompressingPhoto ? '...' : 'Archivo'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 mb-1 font-bold uppercase">Descripción</label>
              <textarea
                rows={2}
                value={photoDescription}
                onChange={(e) => setPhotoDescription(e.target.value)}
                className="w-full p-3 rounded-xl border border-zinc-700 bg-[#12151E] text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#E11D48] text-white font-bold uppercase cursor-pointer"
              >
                Publicar en Galería
              </button>
            </div>
          </form>
        </div>
      )}
      </div>
    </div>
  );
};
