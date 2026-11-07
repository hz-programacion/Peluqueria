import { AppointmentRecord, STUDIO_INFO } from './studioData';
import { getTodayLocalISO, getOffsetDateISO } from '../utils/bookingEngine';

export type HomeSectionId =
  | 'booking'
  | 'services'
  | 'beforeAfter'
  | 'gallery'
  | 'reviews'
  | 'barber'
  | 'location';

export type UrbanThemePreset = 'amber' | 'uv' | 'crimson' | 'volt';

export type SiteLayoutMode = 'landing' | 'tabs';

export const DEFAULT_SECTION_ORDER: HomeSectionId[] = [
  'booking',
  'services',
  'beforeAfter',
  'gallery',
  'reviews',
  'barber',
  'location',
];

export interface StudioConfig {
  authorName: string;
  studioTitle: string;
  brandKicker: string;
  tagline: string;
  heroSubtitle: string;
  bio: string;
  mainPriceDisplay: string;
  address: string;
  neighborhood: string;
  scheduleDisplay: string;
  phoneDisplay: string;
  whatsappRaw: string;
  instagram: string;
  tiktok: string;
  transferAlias: string;
  spotifyPlaylistUrl: string;
  currentVibeTrack: string;
  googleMapsUrl: string;
  wazeUrl: string;
  googleReviewShortlink: string;
  heroImage: string;
  spaceImage: string;
  openingHour: number;
  closingHour: number;
  openDays: number[]; // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  cleanBufferMinutes: number;
  depositPercentage: number;
  noticeHoursCancellation: number;
  maxCourtesyMinutes: number;
  walkInStatus: 'available' | 'booked_full';
  adminPin: string;
  layoutMode: SiteLayoutMode;
  sectionOrder: HomeSectionId[];
  urbanTheme: UrbanThemePreset;
  showPromoBanner: boolean;
  promoBannerText: string;
  enableDripTrail: boolean;
  enableParallax: boolean;
  showHeroSection: boolean;
  showServicesSection: boolean;
  showBeforeAfterSection: boolean;
  showBookingSection: boolean;
  showGallerySection: boolean;
  showBarberSection: boolean;
  showReviewsSection: boolean;
  showLocationSection: boolean;
  showGalleryFilter: boolean;
  showGalleryBookingButton: boolean;
  showGalleryPriceBadge: boolean;
  showGalleryTechnicalSpec: boolean;
  showGalleryLikes: boolean;
  showGalleryTags: boolean;
  showServiceBookingButton: boolean;
  showServicePrice: boolean;
  showServiceProducts: boolean;
  showServiceDuration: boolean;
}

export const INITIAL_STUDIO_CONFIG: StudioConfig = {
  authorName: STUDIO_INFO.authorName,
  studioTitle: STUDIO_INFO.studioTitle,
  brandKicker: STUDIO_INFO.brandKicker,
  tagline: STUDIO_INFO.tagline,
  heroSubtitle:
    'Un espacio íntimo en Vuelta de Obligado 931, Venado Tuerto. Trabajamos cada corte, perfilado de barba y tratamiento capilar de manera personalizada, dedicando el tiempo necesario a cada detalle.',
  bio: STUDIO_INFO.bio,
  mainPriceDisplay: '$12.000 ARS',
  address: STUDIO_INFO.address,
  neighborhood: STUDIO_INFO.neighborhood,
  scheduleDisplay: 'Martes a Sábados · 11:00 a 21:00 hs',
  phoneDisplay: STUDIO_INFO.phoneDisplay,
  whatsappRaw: STUDIO_INFO.whatsappRaw,
  instagram: STUDIO_INFO.instagram,
  tiktok: '@rodrigo.cutsss_vt',
  transferAlias: 'RODRIGO.CUTSSS',
  spotifyPlaylistUrl: STUDIO_INFO.spotifyPlaylistUrl,
  currentVibeTrack: 'Sesión Acústica & Jazz de Estudio',
  googleMapsUrl: STUDIO_INFO.googleMapsUrl,
  wazeUrl: STUDIO_INFO.wazeUrl,
  googleReviewShortlink: STUDIO_INFO.googleReviewShortlink,
  heroImage: STUDIO_INFO.heroImage,
  spaceImage: STUDIO_INFO.spaceImage,
  openingHour: 11,
  closingHour: 21,
  openDays: [1, 2, 3, 4, 5, 6],
  cleanBufferMinutes: 10,
  depositPercentage: 30,
  noticeHoursCancellation: 24,
  maxCourtesyMinutes: 10,
  walkInStatus: 'available',
  adminPin: '1234',
  layoutMode: 'landing',
  sectionOrder: DEFAULT_SECTION_ORDER,
  urbanTheme: 'amber',
  showPromoBanner: false,
  promoBannerText:
    'Atención personalizada uno a uno en Vuelta de Obligado 931, Venado Tuerto',
  enableDripTrail: false,
  enableParallax: true,
  showHeroSection: true,
  showServicesSection: true,
  showBeforeAfterSection: true,
  showBookingSection: true,
  showGallerySection: true,
  showBarberSection: true,
  showReviewsSection: true,
  showLocationSection: true,
  showGalleryFilter: true,
  showGalleryBookingButton: true,
  showGalleryPriceBadge: true,
  showGalleryTechnicalSpec: true,
  showGalleryLikes: true,
  showGalleryTags: false,
  showServiceBookingButton: true,
  showServicePrice: true,
  showServiceProducts: true,
  showServiceDuration: true,
};

const todayISO = getTodayLocalISO();
const tomorrowISO = getOffsetDateISO(1);

export const INITIAL_BLOCKED_SLOTS = [
  {
    id: 'block-1',
    date: todayISO,
    startTime: '14:30',
    durationMinutes: 30,
    reason: 'Pausa de mediodía y acondicionamiento del estudio',
  },
  {
    id: 'block-2',
    date: tomorrowISO,
    startTime: '19:00',
    durationMinutes: 60,
    reason: 'Sesión fotográfica de archivo editorial',
  },
];

export const INITIAL_APPOINTMENTS_STORE: AppointmentRecord[] = [
  {
    id: 'TK-841920',
    date: todayISO,
    startTime: '13:00',
    serviceMinutes: 45,
    bufferMinutes: 10,
    clientName: 'Ignacio Varela',
    whatsapp: '+54 9 3462 521984',
    serviceNames: ['Corte de Autor / Clásico'],
    paymentOption: 'commitment',
    status: 'confirmed',
    reviewLoopScheduledAt: '16:00',
  },
  {
    id: 'TK-904312',
    date: todayISO,
    startTime: '17:00',
    serviceMinutes: 60,
    bufferMinutes: 10,
    clientName: 'Lautaro Rossi',
    whatsapp: '+54 9 3462 609341',
    serviceNames: ['Corte + Perfilado de Barba'],
    paymentOption: 'deposit',
    status: 'confirmed',
    reviewLoopScheduledAt: '20:10',
  },
  {
    id: 'TK-773105',
    date: tomorrowISO,
    startTime: '12:00',
    serviceMinutes: 60,
    bufferMinutes: 10,
    clientName: 'Santiago Romero',
    whatsapp: '+54 9 3462 489023',
    serviceNames: ['Corte + Perfilado de Barba'],
    paymentOption: 'deposit',
    status: 'confirmed',
    reviewLoopScheduledAt: '15:20',
  },
];
