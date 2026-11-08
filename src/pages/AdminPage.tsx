import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
  Users,
  KeyRound,
  BellRing,
  Star,
  Globe,
  SplitSquareVertical,
  HelpCircle,
} from 'lucide-react';
import {
  StudioService,
  GalleryItemCategory,
  TransformationCaseRecord,
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
import { buildViewSeoMetadata, SeoViewKey } from '../utils/seoEngine';
import {
  RetroCornerBandaBookmark,
  RetroRiverCrestBadge,
} from '../components/RetroPaperBanda';

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
    label: 'Comparador "Antes & Después" (#transformaciones)',
    description:
      'Cortina interactiva y vista lado a lado para mostrar el cambio antes y después del corte.',
  },
  gallery: {
    key: 'showGallerySection',
    label: 'Galería & Trabajos del Estudio (#obras)',
    description:
      'Portafolio fotográfico puro con filtros por categoría, likes y subida directa de fotos.',
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

type AdminTabId =
  | 'sections_profile'
  | 'appointments'
  | 'clients_crm'
  | 'finance_box'
  | 'services'
  | 'transformations'
  | 'gallery'
  | 'business_rules'
  | 'calendar';

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
    transformations,
    addTransformation,
    deleteTransformation,
    resetTransformations,
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
  } = useStudio();

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTabId>('sections_profile');
  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'today'>('today');
  const [appointmentSearch, setAppointmentSearch] = useState('');
  const [saveToast, setSaveToast] = useState('');

  // Form state for Profile, Texts, Social Media & Rotating Banner
  const [barberNameForm, setBarberNameForm] = useState(config.authorName);
  const [instagramForm, setInstagramForm] = useState(config.instagram);
  const [tiktokForm, setTiktokForm] = useState(config.tiktok || '@rodrigo.cutsss');
  const [facebookForm, setFacebookForm] = useState(config.facebook || 'rodrigo.cutsss');
  const [youtubeForm, setYoutubeForm] = useState(config.youtube || '@rodrigo.cutsss');
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
  const [adminPinForm, setAdminPinForm] = useState(config.adminPin || '1234');
  const [seoPreviewView, setSeoPreviewView] = useState<SeoViewKey>('home');

  // CRM Client Formula Form
  const [crmClientName, setCrmClientName] = useState('');
  const [crmWhatsapp, setCrmWhatsapp] = useState('');
  const [crmFormulaSpec, setCrmFormulaSpec] = useState('');
  const [crmHairType, setCrmHairType] = useState('Ondulado / Densidad media');
  const [crmPreferredProducts, setCrmPreferredProducts] = useState('Polvo voluminizador mate');
  const [crmSearch, setCrmSearch] = useState('');

  // New Transformation Case Form (Antes & Después)
  const [transTitle, setTransTitle] = useState('');
  const [transShortTab, setTransShortTab] = useState('');
  const [transServiceId, setTransServiceId] = useState(services[0]?.id || 'srv-01');
  const [transIdealFor, setTransIdealFor] = useState(
    'Cabello con crecimiento de 4 a 6 semanas que busca recuperar estructura y definición.'
  );
  const [transBeforeDetail, setTransBeforeDetail] = useState(
    'Laterales abultados sin forma y contornos desprolijos.'
  );
  const [transAfterDetail, setTransAfterDetail] = useState(
    'Degradé limpio al ras, textura superior a tijera y peinado con acabado mate.'
  );
  const [transBeforeImg, setTransBeforeImg] = useState('');
  const [transAfterImg, setTransAfterImg] = useState('');
  const [transStepsText, setTransStepsText] = useState(
    'Diagnóstico personalizado de estructura craneal y remolinos.\nDegradé progresivo a máquina y conexión a tijera.\nTexturizado y terminación con producto mate.'
  );
  const beforeFileRef = useRef<HTMLInputElement>(null);
  const afterFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBarberNameForm(config.authorName);
    setInstagramForm(config.instagram);
    setTiktokForm(config.tiktok || '@rodrigo.cutsss');
    setFacebookForm(config.facebook || 'rodrigo.cutsss');
    setYoutubeForm(config.youtube || '@rodrigo.cutsss');
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
    setAdminPinForm(config.adminPin || '1234');
  }, [
    config.authorName,
    config.instagram,
    config.tiktok,
    config.facebook,
    config.youtube,
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
      tiktok: tiktokForm.trim() || '@rodrigo.cutsss',
      facebook: facebookForm.trim() || 'rodrigo.cutsss',
      youtube: youtubeForm.trim() || '@rodrigo.cutsss',
      phoneDisplay: whatsappDisplayForm.trim() || resolvedWa.display,
      whatsappRaw: resolvedWa.digits,
      studioTitle: studioTitleForm.trim() || 'Rodrigo Cutsss',
      brandKicker:
        brandKickerForm.trim() || 'Peluquería & Barbería de Autor · Venado Tuerto',
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
      `Cambios y redes guardados en vivo (${studioTitleForm.trim() || 'Rodrigo Cutsss'})`
    );
  };

  const handleExportBackupJSON = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      studioTitle: config.studioTitle,
      config,
      services,
      galleryItems,
      transformations,
      appointments,
      blockedSlots,
      clientNotes,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rodrigo-cutsss-backup-${todayStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast('Respaldo completo JSON descargado');
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

  // Combined CRM Client Directory
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

  const handleCreateTransformationCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transTitle.trim()) {
      triggerToast('Ingresá un título para el caso de Antes y Después');
      return;
    }
    const chosenSrv = services.find((s) => s.id === transServiceId) || services[0];
    const newCase: TransformationCaseRecord = {
      id: `trans-custom-${Date.now()}`,
      title: transTitle.trim(),
      shortTabTitle: transShortTab.trim() || transTitle.trim().slice(0, 20),
      tag: `CASO DE ESTUDIO · ${chosenSrv ? chosenSrv.category.toUpperCase() : 'CORTE DE AUTOR'}`,
      serviceId: chosenSrv ? chosenSrv.id : 'srv-01',
      priceDisplay: chosenSrv ? formatPriceARS(chosenSrv.price) : '$12.000 ARS',
      duration: chosenSrv ? `${chosenSrv.durationMinutes} min` : '45 min',
      idealFor:
        transIdealFor.trim() ||
        'Clientes que buscan una estructura limpia y duradera adaptada a sus facciones.',
      beforeLabel: 'ANTES · ESTADO INICIAL',
      beforeDetail: transBeforeDetail.trim() || 'Crecimiento previo sin estructura.',
      afterLabel: 'DESPUÉS · RESULTADO EN ESTUDIO',
      afterDetail: transAfterDetail.trim() || 'Corte terminado en Rodrigo Cutsss.',
      beforeImage:
        transBeforeImg.trim() ||
        '/src/assets/images/urban_barber_hero_1793929257447.jpg',
      afterImage:
        transAfterImg.trim() ||
        '/src/assets/images/urban_textured_crop_1793929259231.jpg',
      formulaSteps: transStepsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    };
    addTransformation(newCase);
    setTransTitle('');
    setTransShortTab('');
    setTransBeforeImg('');
    setTransAfterImg('');
    triggerToast('Nuevo caso Antes y Después publicado en el sitio');
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

  const adminTabsList: {
    id: AdminTabId;
    label: string;
    shortLabel: string;
    badge?: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: 'sections_profile',
      label: 'Secciones, Textos & SEO',
      shortLabel: 'Estructura & Textos',
      badge: `${visibleSectionsCount}/8`,
      icon: Sliders,
    },
    {
      id: 'appointments',
      label: `Turnos & Recordatorios WA (${appointments.length})`,
      shortLabel: 'Turnos & Agenda',
      badge: String(appointments.length),
      icon: Calendar,
    },
    {
      id: 'clients_crm',
      label: `CRM Clientes & Fórmulas (${combinedClients.length})`,
      shortLabel: 'Fichero CRM',
      badge: String(combinedClients.length),
      icon: Users,
    },
    {
      id: 'finance_box',
      label: 'Caja, Señas & Finanzas',
      shortLabel: 'Caja & Finanzas',
      icon: DollarSign,
    },
    {
      id: 'services',
      label: `Servicios & Precios (${services.length})`,
      shortLabel: 'Servicios & Precios',
      badge: String(services.length),
      icon: TrendingUp,
    },
    {
      id: 'transformations',
      label: `Antes & Después (${transformations.length})`,
      shortLabel: 'Antes & Después',
      badge: String(transformations.length),
      icon: SplitSquareVertical,
    },
    {
      id: 'gallery',
      label: `Galería (${galleryItems.length})`,
      shortLabel: 'Galería de Fotos',
      badge: String(galleryItems.length),
      icon: Camera,
    },
    {
      id: 'business_rules',
      label: 'Horarios, PIN & Efectos',
      shortLabel: 'Horarios & PIN',
      icon: Settings,
    },
    {
      id: 'calendar',
      label: `Bloqueos (${blockedSlots.length})`,
      shortLabel: 'Bloqueos Horarios',
      badge: String(blockedSlots.length),
      icon: Clock,
    },
  ];

  return (
    <div className="min-h-screen bg-[#EFE8DA] text-[#181512]">
      {/* Toast Notification */}
      {saveToast && (
        <div
          role="status"
          data-testid="admin-save-toast"
          className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl bg-[#181512] text-[#FAF6EE] border-2 border-[#9E2A2B] shadow-2xl text-xs font-mono flex items-center gap-2.5"
        >
          <CheckCircle2 className="w-4 h-4 text-[#9E2A2B]" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Executive Command Bar (Deep Ink + Subtle River Plate Carmine Sash) */}
      <div className="bg-[#181512] text-[#FAF6EE] border-b-2 border-[#9E2A2B] relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            background:
              'linear-gradient(125deg, transparent 62%, #9E2A2B 62%, #9E2A2B 70%, transparent 70%)',
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <RetroRiverCrestBadge size="md" />
            <div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#E06D6E] font-semibold">
                <Shield className="w-3.5 h-3.5" />
                <span>ESCRITORIO DE DIRECCIÓN · LIBRO MAYOR DE {config.studioTitle.toUpperCase()}</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#FAF6EE] mt-0.5">
                Panel de Administración{' '}
                <span className="font-editorial italic font-normal text-[#E06D6E]">
                  &amp; Gestión Integral
                </span>
              </h1>
              <p className="text-xs font-mono text-[#C8BBA4] mt-1 flex flex-wrap items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-[#E06D6E]" />
                <span>
                  Acceso privado activo: entrá con{' '}
                  <strong className="text-[#FAF6EE]">Ctrl + Shift + A</strong>, triple clic en el
                  escudo <strong className="text-[#FAF6EE]">RC</strong> o{' '}
                  <strong className="text-[#FAF6EE]">/#/admin</strong>.
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider bg-[#9E2A2B] text-[#FAF6EE] hover:bg-[#822021] border border-[#781D1E] transition-colors cursor-pointer shadow-xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>+ Subir Foto</span>
            </button>

            <button
              type="button"
              onClick={handleExportBackupJSON}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider border border-[#4F463B] bg-[#24201C] hover:border-[#9E2A2B] text-[#FAF6EE] transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#E06D6E]" />
              <span>Backup JSON</span>
            </button>

            <button
              type="button"
              data-testid="admin-view-public-site"
              onClick={() => navigateTo('home')}
              className="px-4 py-2.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider border border-[#C8BBA4] bg-[#FAF6EE] text-[#181512] hover:bg-[#EAE0CE] transition-colors cursor-pointer"
            >
              Ver Sitio Público
            </button>

            <button
              type="button"
              onClick={logoutAdmin}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider bg-[#24201C] text-[#E06D6E] border border-[#9E2A2B]/50 hover:bg-[#9E2A2B] hover:text-[#FAF6EE] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Executive Ledger Body */}
      <div className="py-8 px-4 sm:px-8 max-w-7xl mx-auto space-y-8">
        {/* 4-Column Executive KPI Ledger Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-[#C8BBA4] bg-[#FAF6EE] shadow-[0_6px_20px_rgba(24,21,18,0.04)] relative overflow-hidden">
            <RetroCornerBandaBookmark size="sm" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#6E6355] font-semibold block">
              Agenda de Hoy ({todayStr})
            </span>
            <p className="font-display text-3xl font-bold text-[#181512] mt-1 tabular-nums">
              {todayAppointments.length} Turnos Hoy
            </p>
            <p className="text-xs font-mono text-[#9E2A2B] font-semibold mt-1 tabular-nums">
              Hoy: {formatPriceARS(todayRevenueEst)} · Total: {formatPriceARS(totalRevenueEst)}
            </p>
          </div>

          <div className="p-5 rounded-xl border border-[#C8BBA4] bg-[#FAF6EE] shadow-[0_6px_20px_rgba(24,21,18,0.04)]">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#6E6355] font-semibold block">
              Fichero CRM de Clientes
            </span>
            <p className="font-display text-3xl font-bold text-[#181512] mt-1 tabular-nums">
              {combinedClients.length} Clientes
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('clients_crm')}
              className="text-xs font-mono text-[#9E2A2B] hover:underline mt-1 cursor-pointer font-semibold"
            >
              Ver fórmulas de corte y WhatsApp &rarr;
            </button>
          </div>

          <div className="p-5 rounded-xl border border-[#C8BBA4] bg-[#FAF6EE] shadow-[0_6px_20px_rgba(24,21,18,0.04)]">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#6E6355] font-semibold block">
              Secciones Activas ({visibleSectionsCount}/8)
            </span>
            <p className="font-mono text-sm font-bold text-[#181512] mt-1.5 truncate">
              {config.studioTitle} · {igInfo.handle}
            </p>
            <p className="text-xs font-mono text-[#4F463B] mt-1 truncate">
              WA Oficial: {waInfo.display}
            </p>
          </div>

          <div className="p-5 rounded-xl border border-[#C8BBA4] bg-[#FAF6EE] shadow-[0_6px_20px_rgba(24,21,18,0.04)]">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#6E6355] font-semibold block">
              Disponibilidad en Portada
            </span>
            <p className="font-display text-2xl font-bold text-[#181512] mt-1">
              {config.walkInStatus === 'available' ? 'Turnos Abiertos' : 'Agenda Completa'}
            </p>
            <button
              type="button"
              onClick={() => {
                const newStatus =
                  config.walkInStatus === 'available' ? 'booked_full' : 'available';
                updateConfig({ walkInStatus: newStatus });
                triggerToast(
                  `Estado en portada actualizado: ${
                    newStatus === 'available' ? 'Turnos abiertos hoy' : 'Agenda completa hoy'
                  }`
                );
              }}
              className="text-xs font-mono text-[#9E2A2B] hover:underline mt-1 cursor-pointer font-semibold"
            >
              Cambiar estado en vivo &rarr;
            </button>
          </div>
        </div>

        {/* Navigation Modules Bar (Responsive Segmented Tabs with Test IDs) */}
        <div
          role="tablist"
          aria-label="Módulos del Panel de Administración"
          className="p-2 rounded-xl bg-[#FAF6EE] border border-[#C8BBA4] shadow-[0_6px_20px_rgba(24,21,18,0.04)] flex flex-wrap items-center gap-1.5"
        >
          {adminTabsList.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                data-testid={`admin-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs uppercase tracking-wider font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#9E2A2B] text-[#FAF6EE] shadow-xs'
                    : 'bg-transparent text-[#4F463B] hover:text-[#181512] hover:bg-[#EFE7D6]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Animated Module Viewport */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* =========================================================================== */}
            {/* TAB 0: ARQUITECTURA, ORDEN DE SECCIONES, SWITCHES & PERFIL                  */}
            {/* =========================================================================== */}
            {activeTab === 'sections_profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Live Section Reordering & Layout Architecture */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="p-6 sm:p-7 rounded-xl border border-[#C8BBA4] bg-[#FAF6EE] shadow-xs space-y-5">
                    <div className="border-b border-[#D5C9B4] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#9E2A2B] font-bold mb-1">
                          <LayoutGrid className="w-3.5 h-3.5" />
                          <span>ESTRUCTURA Y JERARQUÍA DEL SITIO</span>
                        </div>
                        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#181512]">
                          Orden de Secciones &amp; Visibilidad
                        </h2>
                        <p className="text-xs text-[#4F463B] mt-1">
                          Subí, bajá o apagá cualquier sección. Todo cambio impacta en vivo en la
                          portada.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          updateConfig({ sectionOrder: [...DEFAULT_SECTION_ORDER] });
                          triggerToast('Orden recomendado restaurado');
                        }}
                        className="px-3.5 py-2 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] hover:border-[#9E2A2B] text-xs font-mono text-[#181512] font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-[#9E2A2B]" />
                        <span>Orden por Defecto</span>
                      </button>
                    </div>

                    {/* Site Layout Mode Selector */}
                    <div className="p-4 rounded-xl bg-[#F3ECE0] border border-[#C8BBA4] space-y-2.5">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-[#9E2A2B] font-bold block">
                        Modo de Navegación en Portada:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            updateConfig({ layoutMode: 'landing' });
                            triggerToast('Modo cambiado a Landing Completa');
                          }}
                          className={`p-3.5 rounded-lg border text-left font-mono text-xs transition-all cursor-pointer ${
                            (config.layoutMode || 'landing') === 'landing'
                              ? 'border-[#9E2A2B] bg-[#FAF6EE] text-[#181512] shadow-2xs'
                              : 'border-[#C8BBA4] bg-[#FAF6EE]/60 text-[#4F463B] hover:border-[#9E2A2B]'
                          }`}
                        >
                          <span className="block font-bold text-[#181512]">
                            1. Flujo Continuo (Landing)
                          </span>
                          <span className="text-[11px] text-[#4F463B] block mt-0.5">
                            Muestra todas las secciones activas una debajo de otra.
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            updateConfig({ layoutMode: 'tabs' });
                            triggerToast('Modo cambiado a Navegación por Vistas con Telón');
                          }}
                          className={`p-3.5 rounded-lg border text-left font-mono text-xs transition-all cursor-pointer ${
                            config.layoutMode === 'tabs'
                              ? 'border-[#9E2A2B] bg-[#FAF6EE] text-[#181512] shadow-2xs'
                              : 'border-[#C8BBA4] bg-[#FAF6EE]/60 text-[#4F463B] hover:border-[#9E2A2B]'
                          }`}
                        >
                          <span className="block font-bold text-[#181512]">
                            2. Modo App por Vistas (Telón)
                          </span>
                          <span className="text-[11px] text-[#4F463B] block mt-0.5">
                            Alterna entre secciones con animación de telón y deslizamiento.
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Fixed Portada Switch */}
                    <div className="p-4 rounded-xl border border-[#C8BBA4] bg-[#F3ECE0] flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-[#9E2A2B] text-[#FAF6EE] font-mono text-[10px] font-bold">
                            PORTADA
                          </span>
                          <span className="font-mono text-xs font-bold text-[#181512]">
                            Hero Principal &amp; Próximo Turno Libre (#inicio)
                          </span>
                        </div>
                        <p className="text-[11px] text-[#4F463B] mt-1">
                          Cabecera en papel envejecido con banda roja diagonal y turno inmediato.
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
                          config.showHeroSection !== false ? 'bg-[#9E2A2B]' : 'bg-[#B8AA93]'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#FAF6EE] transition ${
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
                                ? 'bg-[#F3ECE0] border-[#C8BBA4]'
                                : 'bg-[#FAF6EE] border-[#D5C9B4] opacity-60'
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
                                className="w-7 h-7 rounded border border-[#C8BBA4] bg-[#FAF6EE] hover:border-[#9E2A2B] text-[#181512] flex items-center justify-center disabled:opacity-30 cursor-pointer"
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
                                className="w-7 h-7 rounded border border-[#C8BBA4] bg-[#FAF6EE] hover:border-[#9E2A2B] text-[#181512] flex items-center justify-center disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-[#EAE0CE] border border-[#C8BBA4] text-[#9E2A2B] font-mono text-[10px] font-bold">
                                  #{index + 1}
                                </span>
                                <span className="font-mono text-xs font-bold text-[#181512]">
                                  {meta.label}
                                </span>
                                <span
                                  className={`text-[10px] font-mono font-semibold ${
                                    isEnabled ? 'text-[#1F6E43]' : 'text-[#6E6355]'
                                  }`}
                                >
                                  · {isEnabled ? 'Visible' : 'Oculta'}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#4F463B] mt-1">{meta.description}</p>
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
                                isEnabled ? 'bg-[#9E2A2B]' : 'bg-[#B8AA93]'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#FAF6EE] transition ${
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
                    className="p-6 sm:p-7 rounded-xl border border-[#C8BBA4] bg-[#FAF6EE] shadow-xs space-y-5"
                  >
                    <div className="border-b border-[#D5C9B4] pb-4">
                      <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#9E2A2B] font-bold mb-1">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>IDENTIDAD, TEXTOS Y REDES DE {config.studioTitle.toUpperCase()}</span>
                      </div>
                      <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#181512]">
                        Datos del Estudio &amp; Contacto
                      </h2>
                      <p className="text-xs text-[#4F463B] mt-1">
                        Cualquier cambio que guardes acá actualiza la barra superior, el banner, la
                        portada, el turnero y el pie de página.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="admin-barber-name"
                            className="block text-xs font-mono text-[#4F463B] mb-1 font-bold uppercase"
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
                            className="w-full h-10 px-3 rounded-lg text-xs font-mono border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="admin-studio-title"
                            className="block text-xs font-mono text-[#4F463B] mb-1 font-bold uppercase"
                          >
                            Nombre de la Peluquería / Marca *
                          </label>
                          <input
                            id="admin-studio-title"
                            type="text"
                            value={studioTitleForm}
                            onChange={(e) => setStudioTitleForm(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg text-xs font-mono border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="admin-promo-banner-text"
                          className="block text-xs font-mono text-[#9E2A2B] mb-1 font-bold uppercase"
                        >
                          Texto Destacado del Banner Superior
                        </label>
                        <input
                          id="admin-promo-banner-text"
                          type="text"
                          value={promoBannerTextForm}
                          onChange={(e) => setPromoBannerTextForm(e.target.value)}
                          placeholder="Ej. RODRIGO CUTSSS · SASTRERÍA CAPILAR EN VUELTA DE OBLIGADO 931"
                          className="w-full h-10 px-3 rounded-lg text-xs font-mono border border-[#9E2A2B]/50 bg-[#F3ECE0] text-[#181512]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="admin-main-price"
                            className="block text-xs font-mono text-[#4F463B] mb-1 font-bold uppercase"
                          >
                            Precio Base Destacado
                          </label>
                          <input
                            id="admin-main-price"
                            type="text"
                            value={mainPriceForm}
                            onChange={(e) => setMainPriceForm(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg text-xs font-mono border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="admin-address"
                            className="block text-xs font-mono text-[#4F463B] mb-1 font-bold uppercase"
                          >
                            Dirección del Estudio
                          </label>
                          <input
                            id="admin-address"
                            type="text"
                            value={addressForm}
                            onChange={(e) => setAddressForm(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg text-xs font-mono border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="admin-neighborhood"
                            className="block text-xs font-mono text-[#4F463B] mb-1 font-bold uppercase"
                          >
                            Ciudad y Provincia
                          </label>
                          <input
                            id="admin-neighborhood"
                            type="text"
                            value={neighborhoodForm}
                            onChange={(e) => setNeighborhoodForm(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg text-xs font-mono border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="admin-transfer-alias"
                            className="block text-xs font-mono text-[#4F463B] mb-1 font-bold uppercase"
                          >
                            Alias de Transferencia / Seña
                          </label>
                          <input
                            id="admin-transfer-alias"
                            type="text"
                            value={transferAliasForm}
                            onChange={(e) => setTransferAliasForm(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg text-xs font-mono border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-[#4F463B] mb-1 font-bold uppercase">
                          Titular Principal de Portada (Hero)
                        </label>
                        <input
                          type="text"
                          value={taglineForm}
                          onChange={(e) => setTaglineForm(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg text-xs font-mono border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-[#4F463B] mb-1 font-bold uppercase">
                          Bajada de Portada (Subtítulo Hero)
                        </label>
                        <textarea
                          rows={2}
                          value={heroSubtitleForm}
                          onChange={(e) => setHeroSubtitleForm(e.target.value)}
                          className="w-full p-3 rounded-lg text-xs font-mono border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-[#4F463B] mb-1 font-bold uppercase">
                          Biografía &amp; Presentación de {config.authorName}
                        </label>
                        <textarea
                          rows={3}
                          value={bioForm}
                          onChange={(e) => setBioForm(e.target.value)}
                          className="w-full p-3 rounded-lg text-xs font-mono border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                        />
                      </div>

                      <div className="pt-2 border-t border-[#D5C9B4] space-y-3">
                        <span className="font-mono text-[11px] uppercase tracking-widest text-[#9E2A2B] font-bold block">
                          Redes Sociales Oficiales &amp; Contacto Directo
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-mono text-[#4F463B] mb-1 font-bold uppercase">
                              Instagram (Usuario o URL)
                            </label>
                            <input
                              type="text"
                              value={instagramForm}
                              onChange={(e) => setInstagramForm(e.target.value)}
                              placeholder="@rodrigo.cutsss"
                              className="w-full h-10 px-3 rounded-lg text-xs font-mono border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-mono text-[#4F463B] mb-1 font-bold uppercase">
                              TikTok (Usuario o URL)
                            </label>
                            <input
                              type="text"
                              value={tiktokForm}
                              onChange={(e) => setTiktokForm(e.target.value)}
                              placeholder="@rodrigo.cutsss"
                              className="w-full h-10 px-3 rounded-lg text-xs font-mono border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-mono text-[#4F463B] mb-1 font-bold uppercase">
                              Facebook (Página o URL)
                            </label>
                            <input
                              type="text"
                              value={facebookForm}
                              onChange={(e) => setFacebookForm(e.target.value)}
                              placeholder="rodrigo.cutsss"
                              className="w-full h-10 px-3 rounded-lg text-xs font-mono border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-mono text-[#4F463B] mb-1 font-bold uppercase">
                              YouTube (Canal o URL)
                            </label>
                            <input
                              type="text"
                              value={youtubeForm}
                              onChange={(e) => setYoutubeForm(e.target.value)}
                              placeholder="@rodrigo.cutsss"
                              className="w-full h-10 px-3 rounded-lg text-xs font-mono border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-xs font-mono text-[#4F463B] mb-1 font-bold uppercase">
                              WhatsApp Oficial para Turnos y Consultas
                            </label>
                            <input
                              type="text"
                              value={whatsappDisplayForm}
                              onChange={(e) => {
                                setWhatsappDisplayForm(e.target.value);
                                setWhatsappRawForm(e.target.value.replace(/\D/g, ''));
                              }}
                              className="w-full h-10 px-3 rounded-lg text-xs font-mono border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      data-testid="admin-save-profile-btn"
                      className="w-full h-12 rounded-lg bg-[#9E2A2B] hover:bg-[#822021] text-[#FAF6EE] font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-[0_3px_0_#5E1516]"
                    >
                      Guardar Identidad, Textos y Redes Sociales
                    </button>
                  </form>

                  {/* Live Dynamic SEO Meta-Tag Inspector & Google SERP Preview */}
                  <div className="p-6 sm:p-7 rounded-xl border border-[#C8BBA4] bg-[#FAF6EE] shadow-xs space-y-4">
                    <div className="border-b border-[#D5C9B4] pb-4">
                      <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#9E2A2B] font-bold mb-1">
                        <Globe className="w-3.5 h-3.5" />
                        <span>MOTOR SEO DINÁMICO POR VISTA · SCHEMA.ORG JSON-LD</span>
                      </div>
                      <h2 className="font-display text-2xl font-bold text-[#181512]">
                        Vista Previa en Google &amp; Meta-Etiquetas
                      </h2>
                      <p className="text-xs text-[#4F463B] mt-1">
                        Cada vista actualiza automáticamente el{' '}
                        <code className="font-mono font-semibold text-[#181512]">&lt;title&gt;</code>
                        , <code className="font-mono font-semibold text-[#181512]">description</code>{' '}
                        y tarjetas OpenGraph para buscadores.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {(
                        [
                          { id: 'home', label: 'Portada' },
                          { id: 'booking', label: 'Turnero' },
                          { id: 'services', label: 'Servicios' },
                          { id: 'beforeAfter', label: 'Antes/Después' },
                          { id: 'lookbook', label: 'Galería' },
                          { id: 'reviews', label: 'Reseñas' },
                          { id: 'experience', label: 'Perfil' },
                          { id: 'location', label: 'Ubicación' },
                        ] as { id: SeoViewKey; label: string }[]
                      ).map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSeoPreviewView(v.id)}
                          className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-semibold border transition-colors cursor-pointer ${
                            seoPreviewView === v.id
                              ? 'bg-[#9E2A2B] border-[#9E2A2B] text-[#FAF6EE]'
                              : 'bg-[#F3ECE0] border-[#C8BBA4] text-[#4F463B] hover:border-[#9E2A2B]'
                          }`}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>

                    {(() => {
                      const previewMeta = buildViewSeoMetadata({
                        viewKey: seoPreviewView,
                        config,
                        services,
                        origin: 'https://rodrigocutsss.com.ar',
                      });
                      return (
                        <div className="p-4 rounded-xl bg-[#F3ECE0] border border-[#C8BBA4] space-y-1.5">
                          <span className="text-[11px] font-mono text-[#1F6E43] font-semibold block truncate">
                            https://rodrigocutsss.com.ar{previewMeta.canonicalPath}
                          </span>
                          <p className="text-base font-bold text-[#1D4ED8] leading-snug">
                            {previewMeta.title}
                          </p>
                          <p className="text-xs text-[#4F463B] leading-relaxed">
                            {previewMeta.description}
                          </p>
                          <div className="pt-2 border-t border-[#D5C9B4] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[#6E6355]">
                            <span>Robots: {previewMeta.robots}</span>
                            <span>Schema.org: HairSalon JSON-LD Activo</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================== */}
            {/* TAB 1: APPOINTMENTS + 1-CLICK WHATSAPP REMINDERS                            */}
            {/* =========================================================================== */}
            {activeTab === 'appointments' && (
              <div className="space-y-6">
                {/* Quick Manual Appointment Creator */}
                <div className="p-6 rounded-xl border border-[#C8BBA4] bg-[#FAF6EE] shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#9E2A2B] font-bold block">
                        CARGA MANUAL DE TURNO (OCUPA EL HORARIO EN LA WEB AL INSTANTE)
                      </span>
                      <h3 className="font-display text-2xl font-bold text-[#181512]">
                        Agendar Turno Manual (WhatsApp o Presencial)
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={handleExportAppointmentsCSV}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] hover:border-[#9E2A2B] text-[#181512] font-mono text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#9E2A2B]" />
                      <span>Exportar Planilla CSV</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs font-mono">
                    <div>
                      <label className="block text-[#4F463B] font-semibold mb-1">Fecha</label>
                      <input
                        type="date"
                        value={manualDate}
                        onChange={(e) => setManualDate(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#4F463B] font-semibold mb-1">Horario</label>
                      <input
                        type="time"
                        value={manualTime}
                        onChange={(e) => setManualTime(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#4F463B] font-semibold mb-1">Servicio</label>
                      <select
                        value={manualServiceId}
                        onChange={(e) => setManualServiceId(e.target.value)}
                        className="w-full h-10 px-2.5 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                      >
                        {services.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({formatPriceARS(s.price)})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#4F463B] font-semibold mb-1">Cliente</label>
                      <input
                        type="text"
                        value={manualClientName}
                        onChange={(e) => setManualClientName(e.target.value)}
                        placeholder="Ej. Franco Gómez"
                        className="w-full h-10 px-3 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#4F463B] font-semibold mb-1">WhatsApp</label>
                      <input
                        type="text"
                        value={manualClientWhatsapp}
                        onChange={(e) => setManualClientWhatsapp(e.target.value)}
                        placeholder="+54 9 3462 ..."
                        className="w-full h-10 px-3 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
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
                        className="w-full h-10 rounded-lg bg-[#9E2A2B] hover:bg-[#822021] text-[#FAF6EE] font-mono font-bold uppercase text-xs cursor-pointer transition-colors"
                      >
                        + Ocupar Turno
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-3xl font-bold text-[#181512]">
                      Agenda de Turnos &amp; Mensajes Rápidos WhatsApp
                    </h2>
                    <p className="text-xs font-mono text-[#4F463B]">
                      Enviá recordatorios o confirmaciones en 1 clic. Si liberás un turno, el
                      horario vuelve a estar disponible al instante.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-[#6E6355] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={appointmentSearch}
                        onChange={(e) => setAppointmentSearch(e.target.value)}
                        placeholder="Buscar cliente o WhatsApp..."
                        className="h-9 pl-8 pr-3 rounded-lg border border-[#C8BBA4] bg-[#FAF6EE] text-xs font-mono text-[#181512] focus:border-[#9E2A2B] focus:outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setAppointmentFilter('today')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-colors cursor-pointer ${
                        appointmentFilter === 'today'
                          ? 'border-[#9E2A2B] bg-[#9E2A2B] text-[#FAF6EE]'
                          : 'border-[#C8BBA4] bg-[#FAF6EE] text-[#4F463B]'
                      }`}
                    >
                      Hoy {todayStr} ({todayAppointments.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAppointmentFilter('all')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-colors cursor-pointer ${
                        appointmentFilter === 'all'
                          ? 'border-[#9E2A2B] bg-[#9E2A2B] text-[#FAF6EE]'
                          : 'border-[#C8BBA4] bg-[#FAF6EE] text-[#4F463B]'
                      }`}
                    >
                      Todos ({appointments.length})
                    </button>
                  </div>
                </div>

                {displayedAppointments.length === 0 ? (
                  <div className="p-8 rounded-xl border border-[#C8BBA4] bg-[#FAF6EE] text-center space-y-2">
                    <p className="font-display text-2xl font-bold text-[#181512]">
                      No hay turnos registrados para este filtro
                    </p>
                    <p className="text-xs font-mono text-[#4F463B]">
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
                          className={`p-5 md:p-6 rounded-xl border transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${
                            isFinished
                              ? 'border-[#D5C9B4] bg-[#F3ECE0]/70 opacity-75'
                              : 'border-[#C8BBA4] bg-[#FAF6EE] shadow-2xs'
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                              <span className="px-2.5 py-0.5 rounded bg-[#9E2A2B] text-[#FAF6EE] font-bold tabular-nums">
                                {app.date}
                              </span>
                              <span className="font-bold text-[#181512] tabular-nums">
                                {app.startTime} a {minutesToTime(endMin)} hs
                              </span>
                              <span className="text-[#6E6355]">·</span>
                              <span className="text-[#4F463B] tabular-nums">
                                {app.serviceMinutes}m + {app.bufferMinutes}m pausa
                              </span>
                              <span className="text-[#6E6355]">·</span>
                              <span
                                className={
                                  app.paymentOption === 'deposit'
                                    ? 'text-[#1F6E43] font-bold'
                                    : 'text-[#4F463B]'
                                }
                              >
                                {app.paymentOption === 'deposit'
                                  ? `Seña ${config.depositPercentage}%`
                                  : 'Abono en el Estudio'}
                              </span>
                            </div>

                            <h3 className="font-display text-2xl font-bold text-[#181512]">
                              {app.clientName}
                            </h3>

                            <p className="text-xs font-mono text-[#4F463B]">
                              Servicio:{' '}
                              <span className="text-[#181512] font-bold">
                                {app.serviceNames.join(' + ')}
                              </span>{' '}
                              ·{' '}
                              <span className="text-[#9E2A2B] font-bold tabular-nums">
                                {formatPriceARS(estimateAppPrice(app.serviceNames))}
                              </span>
                            </p>

                            <div className="flex items-center gap-4 text-xs font-mono text-[#6E6355] pt-1">
                              <span>WhatsApp: {app.whatsapp}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <a
                              href={`https://wa.me/${cleanDigits}?text=${encodeURIComponent(
                                `Hola ${firstName}! Te escribimos de ${config.studioTitle} para recordarte tu turno del ${app.date} a las ${app.startTime} hs (${app.serviceNames.join(' + ')}) en ${config.address}. ¡Te esperamos!`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 rounded-lg border border-[#1F6E43]/40 bg-[#1F6E43]/10 text-[#1F6E43] text-xs font-mono font-bold hover:bg-[#1F6E43] hover:text-[#FAF6EE] transition-colors flex items-center gap-1.5"
                            >
                              <BellRing className="w-3.5 h-3.5" />
                              <span>Recordatorio WA</span>
                            </a>

                            <a
                              href={`https://wa.me/${cleanDigits}?text=${encodeURIComponent(
                                `Hola ${firstName}! Gracias por pasar hoy por ${config.studioTitle}. Si te gustó cómo quedó el corte, te agradecemos tu reseña en nuestra web. ¡Nos vemos la próxima!`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 rounded-lg border border-[#9A7B38]/50 bg-[#9A7B38]/10 text-[#7A5E24] text-xs font-mono font-bold hover:bg-[#9A7B38] hover:text-[#FAF6EE] transition-colors flex items-center gap-1.5"
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
                              className="px-3.5 py-2 rounded-lg text-xs font-mono font-semibold border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512] hover:border-[#9E2A2B] transition-colors cursor-pointer"
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
                              className="px-3.5 py-2 rounded-lg text-xs font-mono font-semibold text-[#9E2A2B] hover:text-[#FAF6EE] border border-[#9E2A2B]/40 hover:bg-[#9E2A2B] transition-colors flex items-center gap-1.5 cursor-pointer"
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
                  className="lg:col-span-5 p-6 sm:p-7 rounded-xl border border-[#C8BBA4] bg-[#FAF6EE] shadow-xs space-y-4"
                >
                  <div className="border-b border-[#D5C9B4] pb-4">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#9E2A2B] font-bold block mb-1">
                      FICHERO TÉCNICO · {config.studioTitle}
                    </span>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#181512]">
                      Registrar Fórmula de Cliente
                    </h2>
                    <p className="text-xs text-[#4F463B] mt-1">
                      Guardá qué graduación usa cada cliente, sus remolinos y su producto favorito
                      para repetir su corte exacto en cada visita.
                    </p>
                  </div>

                  <div className="space-y-3 text-xs font-mono">
                    <div>
                      <label className="block text-[#4F463B] mb-1 font-bold uppercase">
                        Nombre y Apellido *
                      </label>
                      <input
                        type="text"
                        required
                        value={crmClientName}
                        onChange={(e) => setCrmClientName(e.target.value)}
                        placeholder="Ej. Ignacio Varela"
                        className="w-full h-10 px-3 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#4F463B] mb-1 font-bold uppercase">
                        WhatsApp del Cliente
                      </label>
                      <input
                        type="text"
                        value={crmWhatsapp}
                        onChange={(e) => setCrmWhatsapp(e.target.value)}
                        placeholder="+54 9 3462 521984"
                        className="w-full h-10 px-3 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#4F463B] mb-1 font-bold uppercase">
                        Fórmula Técnica de Corte / Alzadas / Remolinos *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={crmFormulaSpec}
                        onChange={(e) => setCrmFormulaSpec(e.target.value)}
                        placeholder="Ej. Mid Drop Fade desde 0.0mm a 1.5mm · Arriba 4cm a tijera · Cuidar remolino derecho"
                        className="w-full p-3 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#4F463B] mb-1 font-bold uppercase">
                          Tipo de Pelo / Barba
                        </label>
                        <input
                          type="text"
                          value={crmHairType}
                          onChange={(e) => setCrmHairType(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                        />
                      </div>
                      <div>
                        <label className="block text-[#4F463B] mb-1 font-bold uppercase">
                          Acabado / Producto
                        </label>
                        <input
                          type="text"
                          value={crmPreferredProducts}
                          onChange={(e) => setCrmPreferredProducts(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 rounded-lg bg-[#9E2A2B] hover:bg-[#822021] text-[#FAF6EE] font-mono text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
                  >
                    + Guardar Ficha Técnica
                  </button>
                </form>

                <div className="lg:col-span-7 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display text-3xl font-bold text-[#181512]">
                        Directorio &amp; Historial ({combinedClients.length})
                      </h3>
                      <p className="text-xs font-mono text-[#4F463B]">
                        Sincronizado automáticamente con las reservas del turnero.
                      </p>
                    </div>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-[#6E6355] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={crmSearch}
                        onChange={(e) => setCrmSearch(e.target.value)}
                        placeholder="Buscar cliente o fórmula..."
                        className="h-10 pl-9 pr-4 rounded-lg border border-[#C8BBA4] bg-[#FAF6EE] text-xs font-mono text-[#181512]"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {combinedClients.map((client) => {
                      const digits = client.whatsapp.replace(/\D/g, '');
                      return (
                        <div
                          key={client.id}
                          className="p-5 rounded-xl border border-[#C8BBA4] bg-[#FAF6EE] shadow-2xs space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <h4 className="font-display text-2xl font-bold text-[#181512]">
                                {client.clientName}
                              </h4>
                              <span className="text-xs font-mono text-[#6E6355]">
                                WA: {client.whatsapp} · {client.lastDate}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 font-mono text-xs tabular-nums">
                              <span className="px-2.5 py-1 rounded bg-[#EAE0CE] border border-[#C8BBA4] text-[#9E2A2B] font-bold">
                                {client.visitsCount}{' '}
                                {client.visitsCount === 1 ? 'visita' : 'visitas'}
                              </span>
                              <span className="px-2.5 py-1 rounded bg-[#181512] text-[#FAF6EE] font-bold">
                                {formatPriceARS(client.totalSpentARS)}
                              </span>
                            </div>
                          </div>

                          <div className="p-3.5 rounded-lg bg-[#F3ECE0] border border-[#C8BBA4] text-xs font-mono space-y-1.5">
                            <p className="text-[#181512]">
                              <strong className="text-[#9E2A2B] uppercase">Fórmula: </strong>
                              {client.formulaSpec}
                            </p>
                            <p className="text-[#4F463B]">
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
                                className="px-3 py-1.5 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] hover:border-[#9E2A2B] text-xs font-mono text-[#181512] font-semibold cursor-pointer"
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
                                  className="px-3 py-1.5 rounded-lg border border-[#1F6E43]/40 bg-[#1F6E43]/10 text-[#1F6E43] text-xs font-mono font-bold inline-flex items-center gap-1.5"
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
                                className="text-xs font-mono text-[#9E2A2B] hover:underline cursor-pointer font-semibold"
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
                    <span className="text-xs font-mono uppercase tracking-widest text-[#9E2A2B] font-bold block">
                      LIBRO DE CAJA Y FACTURACIÓN · {config.studioTitle}
                    </span>
                    <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#181512]">
                      Balance de Caja, Señas ({config.depositPercentage}%) &amp; Servicios
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportAppointmentsCSV}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#9E2A2B] hover:bg-[#822021] text-[#FAF6EE] font-mono text-xs font-bold uppercase tracking-wider cursor-pointer shadow-[0_3px_0_#5E1516]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar Planilla Excel (.CSV)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-6 rounded-xl border border-[#C8BBA4] bg-[#FAF6EE] shadow-2xs">
                    <span className="text-xs font-mono uppercase text-[#6E6355] font-semibold block">
                      Caja Estimada Hoy ({todayStr})
                    </span>
                    <p className="font-mono text-3xl font-bold text-[#181512] mt-2 tabular-nums">
                      {formatPriceARS(todayRevenueEst)}
                    </p>
                    <span className="text-xs font-mono text-[#1F6E43] font-semibold mt-1 block">
                      {todayAppointments.length} turnos programados hoy
                    </span>
                  </div>

                  <div className="p-6 rounded-xl border border-[#C8BBA4] bg-[#FAF6EE] shadow-2xs">
                    <span className="text-xs font-mono uppercase text-[#6E6355] font-semibold block">
                      Facturación Total en Agenda
                    </span>
                    <p className="font-mono text-3xl font-bold text-[#9E2A2B] mt-2 tabular-nums">
                      {formatPriceARS(totalRevenueEst)}
                    </p>
                    <span className="text-xs font-mono text-[#4F463B] mt-1 block tabular-nums">
                      Ticket promedio: {formatPriceARS(averageTicketARS)}
                    </span>
                  </div>

                  <div className="p-6 rounded-xl border border-[#C8BBA4] bg-[#FAF6EE] shadow-2xs">
                    <span className="text-xs font-mono uppercase text-[#6E6355] font-semibold block">
                      Señas por Transferencia ({config.depositPercentage}%)
                    </span>
                    <p className="font-mono text-3xl font-bold text-[#1F6E43] mt-2 tabular-nums">
                      {formatPriceARS(depositCollectedARS)}
                    </p>
                    <span className="text-xs font-mono text-[#4F463B] mt-1 block">
                      Alias activo: {config.transferAlias}
                    </span>
                  </div>

                  <div className="p-6 rounded-xl border border-[#C8BBA4] bg-[#FAF6EE] shadow-2xs">
                    <span className="text-xs font-mono uppercase text-[#6E6355] font-semibold block">
                      Saldo a Cobrar en Sillón
                    </span>
                    <p className="font-mono text-3xl font-bold text-[#181512] mt-2 tabular-nums">
                      {formatPriceARS(pendingBalanceInChairARS)}
                    </p>
                    <span className="text-xs font-mono text-[#4F463B] mt-1 block">
                      Efectivo o transferencia al terminar
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-8 rounded-xl border border-[#C8BBA4] bg-[#FAF6EE] shadow-2xs space-y-5">
                  <h3 className="font-display text-2xl font-bold text-[#181512]">
                    Rendimiento por Servicio del Catálogo
                  </h3>
                  <div className="divide-y divide-[#D5C9B4] font-mono text-xs">
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
                            <span className="text-[#9E2A2B] font-bold mr-2">{srv.index}.</span>
                            <span className="text-[#181512] font-bold">{srv.name}</span>
                            <span className="text-[#6E6355] ml-2 tabular-nums">
                              ({formatPriceARS(srv.price)})
                            </span>
                          </div>
                          <div className="flex items-center gap-4 tabular-nums">
                            <span className="text-[#4F463B]">{count} turnos reservados</span>
                            <span className="text-[#181512] font-bold">
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
            {/* TAB 4: SERVICES & PRICING                                                   */}
            {/* =========================================================================== */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-3xl font-bold text-[#181512]">
                      Catálogo de Servicios, Precios y Ajuste Masivo
                    </h2>
                    <p className="text-xs text-[#4F463B] font-mono">
                      Editá cada servicio o aplicá un ajuste porcentual en 1 clic a toda la carta
                      (redondeado automáticamente a múltiplos de $500 ARS).
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#FAF6EE] border border-[#C8BBA4] font-mono text-xs">
                      <span className="px-2 text-[#181512] font-bold flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-[#9E2A2B]" />
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
                              `Precios del catálogo actualizados en ${
                                pct > 0 ? `+${pct}%` : `${pct}%`
                              }`
                            );
                          }}
                          className="px-2.5 py-1.5 rounded bg-[#F3ECE0] hover:bg-[#9E2A2B] text-[#181512] hover:text-[#FAF6EE] font-bold border border-[#C8BBA4] transition-colors cursor-pointer"
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
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-[#9E2A2B] text-[#FAF6EE] hover:bg-[#822021] cursor-pointer"
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
                      className={`p-6 rounded-xl border flex flex-col justify-between transition-all ${
                        srv.hidden
                          ? 'border-[#D5C9B4] bg-[#F3ECE0]/60 opacity-65'
                          : 'border-[#C8BBA4] bg-[#FAF6EE] shadow-2xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-4 font-mono text-xs text-[#6E6355] mb-2">
                          <span className="text-[#9E2A2B] font-bold">
                            {srv.index}. {srv.category}
                          </span>
                          <span className="text-lg font-bold text-[#181512] tabular-nums">
                            {formatPriceARS(srv.price)}
                          </span>
                        </div>

                        <h3 className="font-display text-2xl font-bold text-[#181512] mb-1">
                          {srv.name}
                        </h3>
                        <p className="text-xs font-mono text-[#6E6355] mb-2 tabular-nums">
                          Duración en agenda: {srv.durationMinutes} minutos
                        </p>
                        <p className="text-xs text-[#4F463B] leading-relaxed mb-4">
                          {srv.shortDescription}
                        </p>

                        <div className="p-3.5 rounded-lg bg-[#F3ECE0] border border-[#C8BBA4] space-y-2 mb-3">
                          <span className="text-[10px] font-mono uppercase text-[#6E6355] font-semibold block">
                            Opciones de visualización en este servicio:
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
                              className="px-2.5 py-1 rounded font-mono text-[10px] font-semibold border border-[#C8BBA4] bg-[#FAF6EE] text-[#181512] cursor-pointer"
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
                              className="px-2.5 py-1 rounded font-mono text-[10px] font-semibold border border-[#C8BBA4] bg-[#FAF6EE] text-[#181512] cursor-pointer"
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
                                    ? 'Precio ocultado en este servicio'
                                    : 'Precio visible en este servicio'
                                );
                              }}
                              className="px-2.5 py-1 rounded font-mono text-[10px] font-semibold border border-[#C8BBA4] bg-[#FAF6EE] text-[#181512] cursor-pointer"
                            >
                              {srv.hidePrice ? 'Precio Oculto' : 'Precio Visible'}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 mt-2 border-t border-[#D5C9B4] flex items-center justify-between">
                        <span className="text-xs text-[#6E6355] font-mono">ID: {srv.id}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingService(srv);
                              setServiceFormData(srv);
                              setIsNewServiceModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border border-[#C8BBA4] bg-[#F3ECE0] hover:border-[#9E2A2B] text-[#181512] transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#9E2A2B]" />
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteService(srv.id);
                              triggerToast('Servicio eliminado del catálogo');
                            }}
                            className="p-1.5 rounded-lg text-[#9E2A2B] border border-[#9E2A2B]/30 hover:bg-[#9E2A2B] hover:text-[#FAF6EE] cursor-pointer"
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
            {/* TAB 5 (NEW): TRANSFORMACIONES (ANTES & DESPUÉS) - GUÍA Y GESTOR EDITABLE    */}
            {/* =========================================================================== */}
            {activeTab === 'transformations' && (
              <div className="space-y-6">
                {/* Practical Explanation & Toggle Card */}
                <div className="p-6 sm:p-7 rounded-xl border border-[#C8BBA4] bg-[#FAF6EE] shadow-xs space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#D5C9B4]">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#9E2A2B] font-bold">
                        <HelpCircle className="w-4 h-4" />
                        <span>¿CÓMO FUNCIONA LA SECCIÓN &ldquo;ANTES Y DESPUÉS&rdquo;?</span>
                      </div>
                      <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#181512] mt-1">
                        Gestor de Transformaciones Reales en el Sillón
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const nextState = config.showBeforeAfterSection === false;
                          updateConfig({ showBeforeAfterSection: nextState });
                          triggerToast(
                            nextState
                              ? 'Sección Antes y Después activada en la web'
                              : 'Sección Antes y Después ocultada de la web'
                          );
                        }}
                        className={`px-4 py-2.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                          config.showBeforeAfterSection !== false
                            ? 'bg-[#1F6E43] text-[#FAF6EE] border-[#1F6E43]'
                            : 'bg-[#F3ECE0] text-[#4F463B] border-[#C8BBA4]'
                        }`}
                      >
                        {config.showBeforeAfterSection !== false
                          ? '✓ Sección Visible en Portada'
                          : 'Sección Oculta en Portada'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          resetTransformations();
                          triggerToast('Casos de demostración originales restaurados');
                        }}
                        className="px-3.5 py-2.5 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] hover:border-[#9E2A2B] text-xs font-mono font-semibold text-[#181512] cursor-pointer"
                      >
                        Restaurar Casos Demo
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                    <div className="p-4 rounded-lg bg-[#F3ECE0] border border-[#C8BBA4] space-y-1">
                      <span className="text-[#9E2A2B] font-bold uppercase block">
                        1. ¿Para qué sirve?
                      </span>
                      <p className="text-[#4F463B] leading-relaxed">
                        Muestra cómo llega un cliente con 4-6 semanas de crecimiento (Foto Antes) y
                        cómo le queda el fade o perfilado terminado (Foto Después). Es lo que más
                        convence a clientes nuevos indecisos.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-[#F3ECE0] border border-[#C8BBA4] space-y-1">
                      <span className="text-[#9E2A2B] font-bold uppercase block">
                        2. ¿Cómo sacar las 2 fotos?
                      </span>
                      <p className="text-[#4F463B] leading-relaxed">
                        Sentá al cliente en el sillón y sacale 1 foto de perfil/3 cuartos antes de
                        empezar. Al terminar el corte, sacale otra foto desde el mismo ángulo.
                        Subilas acá abajo.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-[#F3ECE0] border border-[#C8BBA4] space-y-1">
                      <span className="text-[#9E2A2B] font-bold uppercase block">
                        3. ¿Y si no tengo fotos dobles hoy?
                      </span>
                      <p className="text-[#4F463B] leading-relaxed">
                        En la web ahora incluimos modo <strong>Cortina Automática</strong> y modo{' '}
                        <strong>Lado a Lado</strong>. Y si preferís usar sólo la Galería común,
                        podés ocultar esta sección con el botón verde de arriba en 1 clic.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form + Current Cases Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left 5 Cols: Create New Before/After Case */}
                  <form
                    onSubmit={handleCreateTransformationCase}
                    className="lg:col-span-5 p-6 rounded-xl border border-[#C8BBA4] bg-[#FAF6EE] shadow-xs space-y-4 text-xs font-mono"
                  >
                    <div className="border-b border-[#D5C9B4] pb-3">
                      <span className="text-[10px] uppercase tracking-widest text-[#9E2A2B] font-bold block">
                        SUBIR NUEVO CASO REAL
                      </span>
                      <h3 className="font-display text-2xl font-bold text-[#181512]">
                        Publicar Antes y Después
                      </h3>
                    </div>

                    <div>
                      <label className="block text-[#4F463B] mb-1 font-bold uppercase">
                        Título del Cambio *
                      </label>
                      <input
                        type="text"
                        required
                        value={transTitle}
                        onChange={(e) => setTransTitle(e.target.value)}
                        placeholder="Ej. De 5 Semanas de Crecimiento a Mid Drop Fade"
                        className="w-full h-10 px-3 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#4F463B] mb-1 font-bold uppercase">
                          Nombre Corto (Pestaña)
                        </label>
                        <input
                          type="text"
                          value={transShortTab}
                          onChange={(e) => setTransShortTab(e.target.value)}
                          placeholder="Ej. Mid Drop Fade"
                          className="w-full h-10 px-3 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                        />
                      </div>

                      <div>
                        <label className="block text-[#4F463B] mb-1 font-bold uppercase">
                          Servicio Asociado
                        </label>
                        <select
                          value={transServiceId}
                          onChange={(e) => setTransServiceId(e.target.value)}
                          className="w-full h-10 px-2.5 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                        >
                          {services.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({formatPriceARS(s.price)})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Foto ANTES Upload */}
                    <div>
                      <label className="block text-[#4F463B] mb-1 font-bold uppercase">
                        1. Foto ANTES (Subir desde celular/PC o URL)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={transBeforeImg}
                          onChange={(e) => setTransBeforeImg(e.target.value)}
                          placeholder="Subí archivo o pegá URL..."
                          className="flex-1 h-10 px-3 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                        />
                        <input
                          ref={beforeFileRef}
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              const dataUrl = await compressImageFile(f);
                              setTransBeforeImg(dataUrl);
                            }
                          }}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => beforeFileRef.current?.click()}
                          className="px-3.5 rounded-lg bg-[#EAE0CE] border border-[#C8BBA4] hover:border-[#9E2A2B] text-[#181512] font-bold cursor-pointer"
                        >
                          Elegir
                        </button>
                      </div>
                    </div>

                    {/* Foto DESPUÉS Upload */}
                    <div>
                      <label className="block text-[#4F463B] mb-1 font-bold uppercase">
                        2. Foto DESPUÉS (Subir desde celular/PC o URL)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={transAfterImg}
                          onChange={(e) => setTransAfterImg(e.target.value)}
                          placeholder="Subí archivo o pegá URL..."
                          className="flex-1 h-10 px-3 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                        />
                        <input
                          ref={afterFileRef}
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              const dataUrl = await compressImageFile(f);
                              setTransAfterImg(dataUrl);
                            }
                          }}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => afterFileRef.current?.click()}
                          className="px-3.5 rounded-lg bg-[#EAE0CE] border border-[#C8BBA4] hover:border-[#9E2A2B] text-[#181512] font-bold cursor-pointer"
                        >
                          Elegir
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#4F463B] mb-1 font-bold uppercase">
                          Detalle del Antes
                        </label>
                        <input
                          type="text"
                          value={transBeforeDetail}
                          onChange={(e) => setTransBeforeDetail(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                        />
                      </div>
                      <div>
                        <label className="block text-[#4F463B] mb-1 font-bold uppercase">
                          Detalle del Después
                        </label>
                        <input
                          type="text"
                          value={transAfterDetail}
                          onChange={(e) => setTransAfterDetail(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#4F463B] mb-1 font-bold uppercase">
                        ¿Para quién es ideal este trabajo?
                      </label>
                      <input
                        type="text"
                        value={transIdealFor}
                        onChange={(e) => setTransIdealFor(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#4F463B] mb-1 font-bold uppercase">
                        Pasos realizados (1 por línea)
                      </label>
                      <textarea
                        rows={3}
                        value={transStepsText}
                        onChange={(e) => setTransStepsText(e.target.value)}
                        className="w-full p-3 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full h-11 rounded-lg bg-[#9E2A2B] hover:bg-[#822021] text-[#FAF6EE] font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      + Publicar Caso Antes y Después
                    </button>
                  </form>

                  {/* Right 7 Cols: Active Transformation Cases */}
                  <div className="lg:col-span-7 space-y-4">
                    <h3 className="font-display text-2xl font-bold text-[#181512]">
                      Casos Activos en el Comparador ({transformations.length})
                    </h3>

                    <div className="space-y-4">
                      {transformations.map((item, idx) => (
                        <div
                          key={item.id}
                          className="p-5 rounded-xl border border-[#C8BBA4] bg-[#FAF6EE] shadow-2xs space-y-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9E2A2B] font-bold block">
                                CASO 0{idx + 1} · {item.shortTabTitle}
                              </span>
                              <h4 className="font-display text-xl font-bold text-[#181512]">
                                {item.title}
                              </h4>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 rounded bg-[#EAE0CE] border border-[#C8BBA4] font-mono text-xs font-bold text-[#181512] tabular-nums">
                                {item.priceDisplay} · {item.duration}
                              </span>
                              {transformations.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    deleteTransformation(item.id);
                                    triggerToast('Caso eliminado del comparador');
                                  }}
                                  className="px-2.5 py-1 rounded border border-[#9E2A2B]/40 text-xs font-mono text-[#9E2A2B] hover:bg-[#9E2A2B] hover:text-[#FAF6EE] cursor-pointer"
                                >
                                  Eliminar
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-2 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0]">
                              <div className="aspect-[16/10] rounded overflow-hidden bg-[#181512] mb-2">
                                <img
                                  src={item.beforeImage}
                                  alt={`Antes ${item.title}`}
                                  className="w-full h-full object-cover grayscale"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <span className="text-[10px] font-mono font-bold text-[#6E6355] uppercase block">
                                ANTES:
                              </span>
                              <p className="text-xs text-[#4F463B] line-clamp-2">
                                {item.beforeDetail}
                              </p>
                            </div>

                            <div className="p-2 rounded-lg border border-[#9E2A2B]/50 bg-[#EFE7D6]">
                              <div className="aspect-[16/10] rounded overflow-hidden bg-[#181512] mb-2">
                                <img
                                  src={item.afterImage}
                                  alt={`Después ${item.title}`}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <span className="text-[10px] font-mono font-bold text-[#9E2A2B] uppercase block">
                                DESPUÉS:
                              </span>
                              <p className="text-xs text-[#181512] line-clamp-2">
                                {item.afterDetail}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================== */}
            {/* TAB 6: GALLERY MANAGEMENT                                                   */}
            {/* =========================================================================== */}
            {activeTab === 'gallery' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-3xl font-bold text-[#181512]">
                      Galería Fotográfica de {config.studioTitle} (#obras)
                    </h2>
                    <p className="text-xs text-[#4F463B] font-mono">
                      Galería visual pura sin botones de reserva ni precios. Subí fotos desde tu
                      celular o PC en segundos.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const nextAllow = config.allowPublicGalleryUpload === false;
                        updateConfig({ allowPublicGalleryUpload: nextAllow });
                        triggerToast(
                          nextAllow
                            ? 'Botón Subir Foto activado en la galería pública'
                            : 'Botón Subir Foto sólo visible en el Admin'
                        );
                      }}
                      className={`px-3.5 py-2.5 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer ${
                        config.allowPublicGalleryUpload !== false
                          ? 'border-[#1F6E43]/50 bg-[#1F6E43]/10 text-[#1F6E43]'
                          : 'border-[#C8BBA4] bg-[#FAF6EE] text-[#4F463B]'
                      }`}
                    >
                      {config.allowPublicGalleryUpload !== false
                        ? '✓ Subida Directa en Galería Activa'
                        : 'Subida Directa en Galería Oculta'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(true)}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-[#9E2A2B] text-[#FAF6EE] hover:bg-[#822021] cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>+ Subir Nueva Foto</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {galleryItems.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-xl border overflow-hidden flex flex-col justify-between transition-all ${
                        item.hidden
                          ? 'border-[#D5C9B4] bg-[#F3ECE0]/60 opacity-60'
                          : 'border-[#C8BBA4] bg-[#FAF6EE] shadow-2xs'
                      }`}
                    >
                      <div className="h-56 overflow-hidden relative bg-[#181512]">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded bg-[#FAF6EE]/95 border border-[#C8BBA4] text-[#181512] font-mono text-[10px] font-semibold">
                            {item.category}
                          </span>
                          {item.hidden && (
                            <span className="px-2 py-1 rounded bg-[#9E2A2B] text-[#FAF6EE] font-mono text-[10px] uppercase font-bold">
                              OCULTA
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h3 className="font-display text-xl font-bold text-[#181512] mb-1">
                            {item.title}
                          </h3>
                          <p className="text-xs text-[#4F463B] line-clamp-2">{item.description}</p>
                        </div>

                        <div className="pt-3 border-t border-[#D5C9B4] flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              updateGalleryItem(item.id, { hidden: !item.hidden });
                              triggerToast(
                                !item.hidden ? 'Foto ocultada de la galería' : 'Foto visible'
                              );
                            }}
                            className="px-2.5 py-1.5 rounded font-mono text-[10px] font-semibold border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512] cursor-pointer flex items-center gap-1"
                          >
                            {item.hidden ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                            <span>{item.hidden ? 'Oculta' : 'Visible'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              deleteGalleryItem(item.id);
                              triggerToast('Foto eliminada de la galería');
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-[#9E2A2B] hover:underline cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar foto</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =========================================================================== */}
            {/* TAB 7: HORARIOS, TEMA RIVER PLATE, EFECTOS Y PIN                            */}
            {/* =========================================================================== */}
            {activeTab === 'business_rules' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 p-6 sm:p-7 rounded-xl border border-[#C8BBA4] bg-[#FAF6EE] shadow-xs space-y-6">
                  <div className="border-b border-[#D5C9B4] pb-4">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#9E2A2B] font-bold block mb-1">
                      REGLAS OPERATIVAS Y HORARIOS
                    </span>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#181512]">
                      Días de Atención, Horarios &amp; PIN
                    </h2>
                  </div>

                  <div>
                    <span className="block text-xs font-mono text-[#4F463B] mb-2 font-bold uppercase">
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
                            className={`px-3.5 py-2 rounded-lg font-mono text-xs border transition-colors cursor-pointer ${
                              isDayOpen
                                ? 'bg-[#9E2A2B] text-[#FAF6EE] border-[#9E2A2B] font-bold'
                                : 'bg-[#F3ECE0] text-[#4F463B] border-[#C8BBA4] hover:text-[#181512]'
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
                      <label className="block text-[#4F463B] mb-1.5 font-bold uppercase">
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
                        className="w-full h-11 px-3.5 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512] font-bold tabular-nums"
                      />
                    </div>

                    <div>
                      <label className="block text-[#4F463B] mb-1.5 font-bold uppercase">
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
                        className="w-full h-11 px-3.5 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512] font-bold tabular-nums"
                      />
                    </div>

                    <div>
                      <label className="block text-[#4F463B] mb-1.5 font-bold uppercase">
                        Pausa Entre Turnos (min)
                      </label>
                      <select
                        value={config.cleanBufferMinutes}
                        onChange={(e) => {
                          updateConfig({ cleanBufferMinutes: Number(e.target.value) });
                          triggerToast(`Pausa actualizada a ${e.target.value} min`);
                        }}
                        className="w-full h-11 px-3.5 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512] font-bold"
                      >
                        <option value={0}>0 min</option>
                        <option value={5}>5 min</option>
                        <option value={10}>10 min (Recomendado)</option>
                        <option value={15}>15 min</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#4F463B] mb-1.5 font-bold uppercase">
                        PIN Maestro del Panel Admin
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={8}
                          value={adminPinForm}
                          onChange={(e) => setAdminPinForm(e.target.value)}
                          className="flex-1 h-11 px-3.5 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#9E2A2B] font-bold tabular-nums"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!adminPinForm.trim()) return;
                            updateConfig({ adminPin: adminPinForm.trim() });
                            triggerToast(`Nuevo PIN guardado: ${adminPinForm.trim()}`);
                          }}
                          className="px-4 rounded-lg bg-[#9E2A2B] text-[#FAF6EE] font-bold uppercase cursor-pointer"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: River Plate Visual Presets & Interactive Effects */}
                <div className="lg:col-span-5 p-6 sm:p-7 rounded-xl border border-[#C8BBA4] bg-[#FAF6EE] shadow-xs space-y-6">
                  <div className="border-b border-[#D5C9B4] pb-4">
                    <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#9E2A2B] font-bold mb-1">
                      <Palette className="w-3.5 h-3.5" />
                      <span>ESTÉTICA DE ÉPOCA &amp; ANIMACIONES</span>
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#181512]">
                      Atmósfera &amp; Efectos
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(
                      [
                        {
                          id: 'crimson',
                          name: 'La Banda Carmesí (Oficial)',
                          desc: 'Papel envejecido, tinta sepia y banda roja histórica',
                          swatch: '#9E2A2B',
                        },
                        {
                          id: 'uv',
                          name: 'Edición Nocturna',
                          desc: 'Contraste acentuado en carmesí profundo',
                          swatch: '#822021',
                        },
                        {
                          id: 'amber',
                          name: 'Edición Dorada 1986',
                          desc: 'Matices en oro viejo, papel cálido y carmesí',
                          swatch: '#B89146',
                        },
                        {
                          id: 'volt',
                          name: 'Plata & Acero',
                          desc: 'Sobriedad clásica de sastrería tradicional',
                          swatch: '#5C5346',
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
                          className={`p-3.5 rounded-lg border text-left font-mono transition-all cursor-pointer ${
                            active
                              ? 'border-[#9E2A2B] bg-[#EFE7D6] text-[#181512] shadow-2xs'
                              : 'border-[#C8BBA4] bg-[#F3ECE0] text-[#4F463B] hover:border-[#9E2A2B]'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="w-3.5 h-3.5 rounded-full shrink-0 border border-[#181512]/30"
                              style={{ backgroundColor: preset.swatch }}
                            />
                            <span className="text-xs font-bold text-[#181512]">{preset.name}</span>
                          </div>
                          <p className="text-[11px] text-[#4F463B]">{preset.desc}</p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-3 pt-2 border-t border-[#D5C9B4] text-xs font-mono">
                    {[
                      {
                        key: 'showPromoBanner' as const,
                        label: 'Banner Superior con Precios y Dirección',
                        desc: 'Cinta continua a velocidad suave con valores y próximo turno libre',
                      },
                      {
                        key: 'enableParallax' as const,
                        label: 'Efecto Parallax Suave al Scrollear',
                        desc: 'Movimiento de profundidad en el retrato principal y texturas',
                      },
                      {
                        key: 'enableDripTrail' as const,
                        label: 'Micro-Interacciones & Botones Magnéticos',
                        desc: 'Respuesta táctil en botones principales y cursores de escritorio',
                      },
                    ].map((fx) => {
                      const isOn = config[fx.key] !== false;
                      return (
                        <div
                          key={fx.key}
                          className="p-3.5 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] flex items-center justify-between gap-3"
                        >
                          <div>
                            <span className="font-bold text-[#181512] block">{fx.label}</span>
                            <span className="text-[11px] text-[#4F463B] block mt-0.5">
                              {fx.desc}
                            </span>
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
                              isOn ? 'bg-[#9E2A2B]' : 'bg-[#B8AA93]'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#FAF6EE] transition ${
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
            {/* TAB 8: CALENDAR & BLOCKED SLOTS                                             */}
            {/* =========================================================================== */}
            {activeTab === 'calendar' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-3xl font-bold text-[#181512] mb-1">
                    Bloqueos de Horario &amp; Pausas del Estudio
                  </h2>
                  <p className="text-xs text-[#4F463B] font-mono">
                    Bloqueá franjas para almuerzo o trámites. Esos horarios dejan de ofrecerse al
                    instante en el turnero público.
                  </p>
                </div>

                <div className="p-6 rounded-xl border border-[#C8BBA4] bg-[#FAF6EE] shadow-xs space-y-4">
                  <h3 className="font-mono text-xs uppercase tracking-widest text-[#9E2A2B] font-bold">
                    Bloquear Franja Horaria Específica
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono">
                    <div>
                      <label className="block text-[#4F463B] font-semibold mb-1">Fecha</label>
                      <input
                        type="date"
                        value={newBlockedDate}
                        onChange={(e) => setNewBlockedDate(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#4F463B] font-semibold mb-1">
                        Hora de Inicio
                      </label>
                      <input
                        type="time"
                        value={newBlockedTime}
                        onChange={(e) => setNewBlockedTime(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#4F463B] font-semibold mb-1">
                        Duración (min)
                      </label>
                      <select
                        value={newBlockedDuration}
                        onChange={(e) => setNewBlockedDuration(Number(e.target.value))}
                        className="w-full h-10 px-3 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                      >
                        <option value={30}>30 minutos</option>
                        <option value={60}>60 minutos</option>
                        <option value={90}>90 minutos</option>
                        <option value={120}>2 horas</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#4F463B] font-semibold mb-1">Motivo</label>
                      <input
                        type="text"
                        value={newBlockedReason}
                        onChange={(e) => setNewBlockedReason(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
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
                          triggerToast(
                            `Horario ${newBlockedTime} hs bloqueado el ${newBlockedDate}`
                          );
                        }}
                        className="w-full h-10 rounded-lg bg-[#9E2A2B] hover:bg-[#822021] text-[#FAF6EE] font-mono font-bold uppercase text-xs cursor-pointer"
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
                      className="p-5 rounded-xl border border-[#C8BBA4] bg-[#FAF6EE] shadow-2xs flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1 font-mono text-xs">
                        <div className="flex items-center gap-2 tabular-nums">
                          <span className="px-2 py-0.5 rounded bg-[#9E2A2B] text-[#FAF6EE] font-bold">
                            {slot.date}
                          </span>
                          <span className="text-[#181512] font-bold">
                            {slot.startTime} hs ({slot.durationMinutes} min)
                          </span>
                        </div>
                        <p className="text-[#4F463B]">{slot.reason}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          deleteBlockedSlot(slot.id);
                          triggerToast('Bloqueo eliminado y horario habilitado');
                        }}
                        className="px-3 py-2 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] hover:border-[#9E2A2B] text-xs font-mono font-semibold text-[#9E2A2B] cursor-pointer"
                      >
                        Desbloquear
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Modal for Adding/Editing Service */}
        {isNewServiceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#181512]/75 backdrop-blur-sm">
            <form
              onSubmit={handleSaveServiceModal}
              className="w-full max-w-lg rounded-xl border-2 border-[#9E2A2B] bg-[#FAF6EE] p-6 sm:p-8 space-y-4 text-xs font-mono text-[#181512] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#C8BBA4] pb-3">
                <h3 className="font-display text-2xl font-bold text-[#181512]">
                  {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsNewServiceModalOpen(false)}
                  className="text-[#4F463B] hover:text-[#181512] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="block text-[#4F463B] mb-1 font-bold uppercase">
                  Nombre del Servicio *
                </label>
                <input
                  type="text"
                  required
                  value={serviceFormData.name || ''}
                  onChange={(e) =>
                    setServiceFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full h-10 px-3 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4F463B] mb-1 font-bold uppercase">
                    Precio (ARS) *
                  </label>
                  <input
                    type="number"
                    required
                    value={serviceFormData.price || 12000}
                    onChange={(e) =>
                      setServiceFormData((prev) => ({ ...prev, price: Number(e.target.value) }))
                    }
                    className="w-full h-10 px-3 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512] tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[#4F463B] mb-1 font-bold uppercase">
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
                    className="w-full h-10 px-3 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512] tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#4F463B] mb-1 font-bold uppercase">Descripción</label>
                <textarea
                  rows={3}
                  value={serviceFormData.shortDescription || ''}
                  onChange={(e) =>
                    setServiceFormData((prev) => ({
                      ...prev,
                      shortDescription: e.target.value,
                    }))
                  }
                  className="w-full p-3 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewServiceModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-[#C8BBA4] text-[#4F463B] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-[#9E2A2B] text-[#FAF6EE] font-bold uppercase cursor-pointer"
                >
                  Guardar Servicio
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal for Uploading Gallery Photo */}
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#181512]/75 backdrop-blur-sm">
            <form
              onSubmit={handleCreateGalleryPhoto}
              className="w-full max-w-lg rounded-xl border-2 border-[#9E2A2B] bg-[#FAF6EE] p-6 sm:p-8 space-y-4 text-xs font-mono text-[#181512] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#C8BBA4] pb-3">
                <h3 className="font-display text-2xl font-bold text-[#181512]">
                  Subir Foto a Galería · {config.studioTitle}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="text-[#4F463B] hover:text-[#181512] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="block text-[#4F463B] mb-1 font-bold uppercase">
                  Seleccionar Foto desde tu Celular/PC o pegar URL *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={photoPreviewUrl}
                    onChange={(e) => setPhotoPreviewUrl(e.target.value)}
                    placeholder="https://... o subí archivo"
                    className="flex-1 h-10 px-3 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
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
                    className="px-4 rounded-lg bg-[#9E2A2B] hover:bg-[#822021] text-[#FAF6EE] font-bold cursor-pointer"
                  >
                    {isCompressingPhoto ? '...' : 'Elegir Foto'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4F463B] mb-1 font-bold uppercase">
                    Título (Opcional)
                  </label>
                  <input
                    type="text"
                    value={photoTitle}
                    onChange={(e) => setPhotoTitle(e.target.value)}
                    placeholder="Ej. Mid Drop Fade & Textura"
                    className="w-full h-10 px-3 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                  />
                </div>

                <div>
                  <label className="block text-[#4F463B] mb-1 font-bold uppercase">Categoría</label>
                  <select
                    value={photoCategory}
                    onChange={(e) => setPhotoCategory(e.target.value as GalleryItemCategory)}
                    className="w-full h-10 px-3 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                  >
                    <option value="Cortes & Fades">Cortes &amp; Fades</option>
                    <option value="El Estudio & Local">El Estudio &amp; Local</option>
                    <option value="Máquinas & Setup">Máquinas &amp; Setup</option>
                    <option value="Color & Diseños">Color &amp; Diseños</option>
                    <option value="Cultura & Streetwear">Cultura &amp; Streetwear</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#4F463B] mb-1 font-bold uppercase">
                  Nota o Descripción (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={photoDescription}
                  onChange={(e) => setPhotoDescription(e.target.value)}
                  placeholder="Detalle opcional de la foto..."
                  className="w-full p-3 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-[#C8BBA4] text-[#4F463B] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-[#9E2A2B] text-[#FAF6EE] font-bold uppercase cursor-pointer"
                >
                  Publicar Foto
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
