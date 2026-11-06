import { StudioService, LookbookItem, GoogleReview, AppointmentRecord, STUDIO_INFO, STUDIO_SERVICES, LOOKBOOK_ITEMS, GOOGLE_REVIEWS } from './studioData';

export interface StudioConfig {
  authorName: string;
  studioTitle: string;
  brandKicker: string;
  tagline: string;
  bio: string;
  address: string;
  neighborhood: string;
  phoneDisplay: string;
  whatsappRaw: string;
  instagram: string;
  spotifyPlaylistUrl: string;
  currentVibeTrack: string;
  googleMapsUrl: string;
  wazeUrl: string;
  googleReviewShortlink: string;
  heroImage: string;
  spaceImage: string;
  openingHour: number;
  closingHour: number;
  openDays: number[]; // 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  cleanBufferMinutes: number;
  depositPercentage: number;
  noticeHoursCancellation: number;
  maxCourtesyMinutes: number;
  walkInStatus: 'available' | 'booked_full';
}

export const INITIAL_STUDIO_CONFIG: StudioConfig = {
  authorName: STUDIO_INFO.authorName,
  studioTitle: STUDIO_INFO.studioTitle,
  brandKicker: STUDIO_INFO.brandKicker,
  tagline: STUDIO_INFO.tagline,
  bio: STUDIO_INFO.bio,
  address: STUDIO_INFO.address,
  neighborhood: STUDIO_INFO.neighborhood,
  phoneDisplay: STUDIO_INFO.phoneDisplay,
  whatsappRaw: STUDIO_INFO.whatsappRaw,
  instagram: STUDIO_INFO.instagram,
  spotifyPlaylistUrl: STUDIO_INFO.spotifyPlaylistUrl,
  currentVibeTrack: STUDIO_INFO.currentVibeTrack,
  googleMapsUrl: STUDIO_INFO.googleMapsUrl,
  wazeUrl: STUDIO_INFO.wazeUrl,
  googleReviewShortlink: STUDIO_INFO.googleReviewShortlink,
  heroImage: STUDIO_INFO.heroImage,
  spaceImage: STUDIO_INFO.spaceImage,
  openingHour: 11,
  closingHour: 21,
  openDays: [2, 3, 4, 5, 6],
  cleanBufferMinutes: 10,
  depositPercentage: 30,
  noticeHoursCancellation: 24,
  maxCourtesyMinutes: 10,
  walkInStatus: 'booked_full',
};

export const INITIAL_BLOCKED_SLOTS = [
  { id: 'block-1', date: '2026-11-05', startTime: '15:00', durationMinutes: 60, reason: 'Almuerzo / Esterilización UV de herramientas' },
  { id: 'block-2', date: '2026-11-07', startTime: '19:00', durationMinutes: 120, reason: 'Grabación de contenido / Lookbook shooting' }
];

export const INITIAL_APPOINTMENTS_STORE: AppointmentRecord[] = [
  {
    id: 'seed-1',
    date: '2026-11-05',
    startTime: '12:00',
    serviceMinutes: 60,
    bufferMinutes: 10,
    clientName: 'Santiago Romero',
    whatsapp: '+54 1148902311',
    serviceNames: ['Full Experience: Corte Urbano + Barba Esculpida'],
    paymentOption: 'deposit',
    status: 'confirmed',
    reviewLoopScheduledAt: '15:20',
  },
  {
    id: 'seed-2',
    date: '2026-11-06',
    startTime: '13:00',
    serviceMinutes: 45,
    bufferMinutes: 10,
    clientName: 'Ignacio Varela',
    whatsapp: '+54 1152198400',
    serviceNames: ['Mid / Low Fade & Crop Texturizado'],
    paymentOption: 'commitment',
    status: 'confirmed',
    reviewLoopScheduledAt: '16:00',
  },
  {
    id: 'seed-3',
    date: '2026-11-06',
    startTime: '17:00',
    serviceMinutes: 45,
    bufferMinutes: 10,
    clientName: 'Lautaro Rossi',
    whatsapp: '+54 1160934122',
    serviceNames: ['Taper Fade & Line Up Quirúrgico'],
    paymentOption: 'deposit',
    status: 'confirmed',
    reviewLoopScheduledAt: '20:10',
  },
];
