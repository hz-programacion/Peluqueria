import { AppointmentRecord, STUDIO_INFO } from './studioData';
import { getTodayLocalISO, getOffsetDateISO } from '../utils/bookingEngine';

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
  // Main Page Section Visibility Switches (controlled from Admin Portal)
  showHeroSection: boolean;
  showServicesSection: boolean;
  showBookingSection: boolean;
  showGallerySection: boolean;
  showBarberSection: boolean;
  showReviewsSection: boolean;
  showLocationSection: boolean;
  // Global Card Visibility Settings (controlled from Admin Portal)
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
    'Acá hacemos cortes, fades, color, barba y otros servicios con atención exclusiva 1 a 1 en Vuelta de Obligado 931, Venado Tuerto. Si venís con una idea, la sacamos; si no, la armamos juntos.',
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
  currentVibeTrack: 'Bienvenido · Voz de Rodrigo',
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
  // Main Page Section Visibility Switches
  showHeroSection: true,
  showServicesSection: true,
  showBookingSection: true,
  showGallerySection: true,
  showBarberSection: true,
  showReviewsSection: true,
  showLocationSection: true,
  // Default Card Visibility Settings
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
    reason: 'Almuerzo / Esterilización UV de herramientas',
  },
  {
    id: 'block-2',
    date: tomorrowISO,
    startTime: '19:00',
    durationMinutes: 60,
    reason: 'Grabación de contenido / Galería del Estudio',
  },
];

export const INITIAL_APPOINTMENTS_STORE: AppointmentRecord[] = [
  {
    id: 'TK-841920',
    date: todayISO,
    startTime: '13:00',
    serviceMinutes: 40,
    bufferMinutes: 10,
    clientName: 'Ignacio Varela',
    whatsapp: '+54 9 3462 521984',
    serviceNames: ['Corte de Pelo (Corte de Autor & Fade)'],
    paymentOption: 'commitment',
    status: 'confirmed',
    reviewLoopScheduledAt: '16:00',
  },
  {
    id: 'TK-904312',
    date: todayISO,
    startTime: '17:00',
    serviceMinutes: 40,
    bufferMinutes: 10,
    clientName: 'Lautaro Rossi',
    whatsapp: '+54 9 3462 609341',
    serviceNames: ['Taper Fade & Contornos a Trimmer'],
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
    serviceNames: ['Corte de Pelo + Perfilado de Barba Completo'],
    paymentOption: 'deposit',
    status: 'confirmed',
    reviewLoopScheduledAt: '15:20',
  },
];
