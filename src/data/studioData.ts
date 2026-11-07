export interface StudioService {
  id: string;
  index: string;
  category: 'Fades & Cortes' | 'Corte & Barba' | 'Color & Platinados' | 'Detalles & Barba';
  name: string;
  durationMinutes: number;
  price: number;
  shortDescription: string;
  preparation: string[];
  executionSteps: string[];
  aftercare: string;
  productsUsed: string;
  popularTag?: string;
  imageUrl?: string;
  hidden?: boolean;
  hideBuyButton?: boolean;
  hidePrice?: boolean;
  hideProducts?: boolean;
}

export type GalleryItemCategory =
  | 'Cortes & Fades'
  | 'El Estudio & Local'
  | 'Máquinas & Setup'
  | 'Color & Diseños'
  | 'Cultura & Streetwear'
  | 'General';

export interface StudioGalleryItem {
  id: string;
  title: string;
  category: GalleryItemCategory;
  imageUrl: string;
  description: string;
  dateLabel: string;
  tags: string[];
  technicalSpec?: string;
  serviceId?: string;
  priceLabel?: string;
  likes: number;
  featured?: boolean;
  hidden?: boolean;
  hideBuyButton?: boolean;
  hidePrice?: boolean;
  hideSpec?: boolean;
}

export interface LookbookItem {
  id: string;
  title: string;
  category: 'Skin Fades' | 'Tapers & Caída' | 'Texturizados' | 'Platinados & Buzz' | 'Barba & Perfilado';
  imageUrl: string;
  servicePerformed: string;
  executionTime: string;
  productApplied: string;
  toolsUsed: string;
  authorNote: string;
  guardSpec: string;
  featuredSpan?: boolean;
}

export interface GoogleReview {
  id: string;
  authorName: string;
  authorInitials: string;
  relativeDate: string;
  rating: number;
  serviceTag: string;
  textParts: { text: string; highlight?: boolean }[];
}

export interface AppointmentRecord {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  serviceMinutes: number;
  bufferMinutes: number;
  clientName: string;
  whatsapp: string;
  serviceNames: string[];
  paymentOption: 'deposit' | 'commitment';
  status: 'confirmed' | 'completed';
  reviewLoopScheduledAt: string;
}

export const PRESENTATION_AUDIO_URL =
  '/assets/aistudio/ElevenLabs_2026-11-06T09_51_29_Carlos_pro_pvc_s50_sim75_v4_d6b60f32.mp3';

export interface TranscriptSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  highlight?: string;
}

export const PRESENTATION_AUDIO_TRANSCRIPT: TranscriptSegment[] = [
  {
    id: 'seg-1',
    startTime: 0,
    endTime: 3.8,
    text: 'Hola, bienvenido al estudio. Soy Rodrigo.',
    highlight: 'Rodrigo',
  },
  {
    id: 'seg-2',
    startTime: 3.8,
    endTime: 8.2,
    text: 'Trabajamos cortes de autor, perfilado de barba, coloración y cuidado capilar.',
    highlight: 'cortes de autor',
  },
  {
    id: 'seg-3',
    startTime: 8.2,
    endTime: 11.2,
    text: 'Cada sesión es uno a uno, en calma y cuidando cada detalle.',
    highlight: 'uno a uno',
  },
  {
    id: 'seg-4',
    startTime: 11.2,
    endTime: 15.1,
    text: 'Si venís con una idea, la trabajamos; si no, buscamos juntos lo que mejor te quede.',
    highlight: 'buscamos juntos',
  },
  {
    id: 'seg-5',
    startTime: 15.1,
    endTime: 19.5,
    text: 'Reservá tu lugar desde la página o escribinos por WhatsApp. Te esperamos.',
    highlight: 'Reservá tu lugar',
  },
];

export const STUDIO_INFO = {
  authorName: 'Rodrigo',
  studioTitle: 'Rodrigo Estudio',
  brandKicker: 'Estudio de Corte & Autor · Venado Tuerto',
  tagline: 'El oficio del corte a medida, en un espacio íntimo y sin prisa.',
  bio: 'Estudio privado de atención personalizada uno a uno en Vuelta de Obligado 931, Venado Tuerto, Santa Fe. Dedicamos el tiempo necesario a escuchar, asesorar y lograr un corte que acompañe tus facciones y tu estilo diario.',
  address: 'Vuelta de Obligado 931',
  neighborhood: 'Venado Tuerto, Santa Fe',
  phoneDisplay: '+54 9 3462 55-4421',
  whatsappRaw: '5493462554421',
  instagram: '@rodrigo.cutsss',
  instagramUrl: 'https://instagram.com/rodrigo.cutsss',
  instagramDirectUrl: 'https://ig.me/m/rodrigo.cutsss',
  tiktokUrl: 'https://tiktok.com/@rodrigo.cutsss_vt',
  spotifyPlaylistUrl: 'https://open.spotify.com',
  currentVibeTrack: 'Sesión Acústica & Jazz de Estudio',
  googleMapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Vuelta+de+Obligado+931+Venado+Tuerto+Santa+Fe',
  wazeUrl: 'https://waze.com/ul?q=Vuelta+de+Obligado+931+Venado+Tuerto+Santa+Fe',
  googleReviewShortlink: 'https://g.page/r/RodrigoCutsss/review',
  heroImage: '/src/assets/images/hero_studio_portrait_1793889687375.jpg',
  spaceImage: '/src/assets/images/space_private_atelier_1793889688437.jpg',
  presentationAudioUrl: PRESENTATION_AUDIO_URL,
};

export const STUDIO_SERVICES: StudioService[] = [
  {
    id: 'srv-01',
    index: '01',
    category: 'Fades & Cortes',
    name: 'Corte de Autor / Clásico',
    durationMinutes: 45,
    price: 12000,
    popularTag: 'Esencial del Estudio',
    imageUrl: '/src/assets/images/lookbook_classic_scissoring_1793889690402.jpg',
    shortDescription:
      'Diagnóstico personalizado según tu estructura facial y remolinos, corte preciso a tijera o máquina graduada, lavado refrescante y peinado final con acabado orgánico.',
    preparation: [
      'Asesoramiento inicial tranquilo para definir proporciones, caída natural y facilidad de peinado en tu día a día.',
      'Adaptamos la técnica a cabellos lacios, ondulados o con rulos para que el crecimiento sea parejo.',
    ],
    executionSteps: [
      '10 min · Conversación previa y estudio de facciones y textura capilar.',
      '20 min · Arquitectura del corte con tijera de hoja japonesa y transiciones suaves a máquina.',
      '10 min · Texturizado en seco para dar movimiento natural sin rigidez.',
      '05 min · Peinado final con pomada mate al agua o arcilla botánica.',
    ],
    aftercare:
      'Mantiene su estructura y caída armónica entre 3 y 4 semanas sin perder prolijidad en nuca ni contornos.',
    productsUsed: 'Tijeras de corte y esculpir · Máquina de precisión · Arcilla mate orgánica',
  },
  {
    id: 'srv-02',
    index: '02',
    category: 'Corte & Barba',
    name: 'Corte + Perfilado de Barba',
    durationMinutes: 60,
    price: 17000,
    popularTag: 'Servicio Integral',
    imageUrl: '/src/assets/images/lookbook_skin_fade_crop_1793889691565.jpg',
    shortDescription:
      'Servicio completo de cabello a medida integrado con el diseño, recorte volumétrico y perfilado de barba con compresa tibia aromática y bálsamo hidratante.',
    preparation: [
      'Ideal para armonizar las líneas del cabello con el volumen mandibular en una sola sesión relajada.',
      'Trabajamos con recortadoras hipoalergénicas de alta precisión para cuidar la piel sensible.',
    ],
    executionSteps: [
      '30 min · Corte de cabello completo a tijera y máquina con unión limpia en patillas.',
      '15 min · Esculpido de barba a peine y tijera equilibrando mentón y pómulos.',
      '10 min · Compresa tibia aromática y definición suave de líneas en cuello y mejillas.',
      '05 min · Hidratación con óleo de jojoba y cedro más peinado final.',
    ],
    aftercare:
      'Recomendamos aplicar 3 gotas de óleo nutritivo luego de la ducha para mantener la fibra suave.',
    productsUsed: 'Tijera de autor · Recortadora de precisión · Óleo botánico de jojoba y cedro',
  },
  {
    id: 'srv-03',
    index: '03',
    category: 'Detalles & Barba',
    name: 'Diseño y Perfilado de Barba',
    durationMinutes: 30,
    price: 8500,
    imageUrl: '/src/assets/images/hero_studio_portrait_1793889687375.jpg',
    shortDescription:
      'Recorte cuidadoso de longitud, definición natural de contornos en pómulos y cuello, toalla tibia relajante e hidratación profunda del vello facial y la piel.',
    preparation: [
      'Venir con la barba seca y peinada en su dirección habitual para evaluar la densidad real.',
    ],
    executionSteps: [
      '10 min · Rebaje progresivo de volumen y simetría mandibular.',
      '10 min · Aplicación de toalla tibia para abrir poros y suavizar el vello.',
      '05 min · Limpieza precisa de líneas superiores e inferiores sin irritación.',
      '05 min · Cierre con tónico calmante y bálsamo nutritivo de absorción rápida.',
    ],
    aftercare:
      'Cepillar diariamente hacia abajo con cepillo de cerdas naturales para ordenar el crecimiento.',
    productsUsed: 'Peine de madera antiestático · Tónico botánico calmante · Bálsamo hidratante',
  },
  {
    id: 'srv-04',
    index: '04',
    category: 'Color & Platinados',
    name: 'Coloración / Iluminación',
    durationMinutes: 90,
    price: 28000,
    imageUrl: '/src/assets/images/lookbook_tonal_color_1793889692797.jpg',
    shortDescription:
      'Reflejos sutiles, desgaste natural, camuflaje de canas o color global trabajado con aditivos protectores que preservan la salud, el brillo y la suavidad del cabello.',
    preparation: [
      'Si tenés una idea o referencia tonal, la evaluamos juntos antes de comenzar según la base natural de tu pelo.',
    ],
    executionSteps: [
      '15 min · Diagnóstico de tono, prueba de elasticidad y preparación protectora.',
      '45 min · Aplicación artesanal de iluminación, reflejos o coloración global con protector de enlaces.',
      '15 min · Matizado personalizado para lograr tonos naturales, cálidos o fríos sin reflejos indeseados.',
      '15 min · Lavado ácido sellador, baño nutritivo y corte o peinado de terminación.',
    ],
    aftercare:
      'Lavar con shampoo sin sulfatos y realizar una nutrición hidratante cada 15 días.',
    productsUsed: 'Coloración profesional sin amoníaco · Protector de fibra Plex · Baño sellador pH ácido',
  },
  {
    id: 'srv-05',
    index: '05',
    category: 'Detalles & Barba',
    name: 'Lavado Premium y Nutrición Capilar',
    durationMinutes: 30,
    price: 9500,
    imageUrl: '/src/assets/images/lookbook_long_layers_1793889692727.jpg',
    shortDescription:
      'Ritual de higiene oxigenante del cuero cabelludo, masaje descontracturante en lavacabezas y baño de crema restaurador con vapor suave para devolver cuerpo y brillo.',
    preparation: [
      'Podés reservarlo como sesión individual de renovación o sumarlo a tu corte de cabello.',
    ],
    executionSteps: [
      '10 min · Lavado purificante doble con masaje circular en sienes, nuca y cuero cabelludo.',
      '12 min · Aplicación de máscara nutritiva rica en lípidos y aminoácidos con toalla tibia.',
      '08 min · Enjuague templado estimulante y secado natural con protector térmico.',
    ],
    aftercare:
      'Deja el cabello dócil, luminoso y liviano desde el primer día.',
    productsUsed: 'Shampoo botánico purificante · Máscara restauradora de aminoácidos · Bruma hidratante',
  },
];

export const STUDIO_GALLERY_ITEMS: StudioGalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Corte a Tijera & Textura Orgánica',
    category: 'Cortes & Fades',
    imageUrl: '/src/assets/images/lookbook_classic_scissoring_1793889690402.jpg',
    description:
      'Trabajo íntegro a tijera respetando los remolinos y la caída natural del cabello para lograr un estilo sobrio, versátil y fácil de peinar todos los días.',
    dateLabel: 'Colección de Estudio',
    tags: ['#CorteDeAutor', '#Tijera', '#VenadoTuerto'],
    technicalSpec: 'Corte en capas suaves · Acabado mate natural',
    serviceId: 'srv-01',
    priceLabel: '$12.000 ARS',
    likes: 194,
    featured: true,
  },
  {
    id: 'gal-2',
    title: 'El Estudio en Vuelta de Obligado 931',
    category: 'El Estudio & Local',
    imageUrl: '/src/assets/images/space_private_atelier_1793889688437.jpg',
    description:
      'Un refugio de calma en Venado Tuerto. Luz natural, materiales nobles, café de especialidad recién molido y un único sillón para atenderte sin interrupciones.',
    dateLabel: 'El Espacio',
    tags: ['#EstudioPrivado', '#VueltaDeObligado931', '#AtencionUnoAUno'],
    technicalSpec: 'Atención exclusiva por turno · Café de cortesía · Vinilos & Jazz',
    likes: 238,
    featured: true,
  },
  {
    id: 'gal-3',
    title: 'Corte Contemporáneo & Perfilado de Barba',
    category: 'Cortes & Fades',
    imageUrl: '/src/assets/images/lookbook_skin_fade_crop_1793889691565.jpg',
    description:
      'Transición limpia en laterales combinada con longitud texturizada arriba y barba rebajada con precisión para enmarcar el rostro con naturalidad.',
    dateLabel: 'Trabajo en Estudio',
    tags: ['#CorteYBarba', '#Visagismo', '#VenadoTuerto'],
    technicalSpec: 'Transición gradual · Barba hidratada con óleo botánico',
    serviceId: 'srv-02',
    priceLabel: '$17.000 ARS',
    likes: 251,
  },
  {
    id: 'gal-4',
    title: 'Herramientas de Precisión & Cuidado Artesanal',
    category: 'Máquinas & Setup',
    imageUrl: '/src/assets/images/hero_studio_portrait_1793889687375.jpg',
    description:
      'Tijeras de aleación japonesa, peines de madera y carbono y productos botánicos seleccionados para cuidar el cuero cabelludo y la piel en cada visita.',
    dateLabel: 'Oficio & Detalle',
    tags: ['#Oficio', '#TijeraJaponesa', '#CuidadoCapilar'],
    technicalSpec: 'Esterilización completa entre turnos · Cosmética botánica',
    serviceId: 'srv-01',
    priceLabel: '$12.000 ARS',
    likes: 176,
  },
  {
    id: 'gal-5',
    title: 'Iluminación Sutil & Reflejos Tono sobre Tono',
    category: 'Color & Diseños',
    imageUrl: '/src/assets/images/lookbook_tonal_color_1793889692797.jpg',
    description:
      'Trabajo de iluminación dimensión cálida que aporta relieve al corte manteniendo la fibra sana, brillante y sedosa.',
    dateLabel: 'Colorimetría',
    tags: ['#Iluminacion', '#ColorNatural', '#CuidadoDeFibra'],
    technicalSpec: 'Protector Plex · Matiz cálido natural · Baño de brillo',
    serviceId: 'srv-04',
    priceLabel: '$28.000 ARS',
    likes: 215,
  },
  {
    id: 'gal-6',
    title: 'Nutrición Profunda & Movimiento en Capas',
    category: 'Cultura & Streetwear',
    imageUrl: '/src/assets/images/lookbook_long_layers_1793889692727.jpg',
    description:
      'Cabello tratado con nuestro ritual de lavado purificante y baño de crema de aminoácidos, logrando peso sano y brillo natural.',
    dateLabel: 'Salud Capilar',
    tags: ['#NutricionCapilar', '#BrilloNatural', '#VenadoTuerto'],
    technicalSpec: 'Masaje capilar + Baño restaurador de lípidos',
    serviceId: 'srv-05',
    priceLabel: '$9.500 ARS',
    likes: 189,
  },
];

export const LOOKBOOK_ITEMS: LookbookItem[] = [
  {
    id: 'lb-1',
    title: 'Sastrería Capilar a Tijera',
    category: 'Tapers & Caída',
    imageUrl: '/src/assets/images/lookbook_classic_scissoring_1793889690402.jpg',
    servicePerformed: '01. Corte de Autor / Clásico',
    executionTime: '45 min',
    guardSpec: 'Tijera sobre peine · Contornos suaves',
    productApplied: 'Arcilla mate de fijación flexible',
    toolsUsed: 'Tijera de hoja convexa 6.0"',
    authorNote:
      'Buscamos que el corte acompañe el movimiento natural de tu pelo y siga viéndose prolijo a medida que pasan las semanas.',
    featuredSpan: true,
  },
  {
    id: 'lb-2',
    title: 'Textura Corta & Barba Perfilada',
    category: 'Texturizados',
    imageUrl: '/src/assets/images/lookbook_skin_fade_crop_1793889691565.jpg',
    servicePerformed: '02. Corte + Perfilado de Barba',
    executionTime: '60 min',
    guardSpec: 'Laterales limpios · Barba en ángulo natural',
    productApplied: 'Óleo de jojoba y cedro + Polvo mate',
    toolsUsed: 'Tijera de entresacar · Máquina de precisión',
    authorNote:
      'Equilibrio entre un lateral despejado y una barba suave e hidratada con compresa tibia.',
  },
  {
    id: 'lb-3',
    title: 'Iluminación & Relieve Tonal',
    category: 'Platinados & Buzz',
    imageUrl: '/src/assets/images/lookbook_tonal_color_1793889692797.jpg',
    servicePerformed: '04. Coloración / Iluminación',
    executionTime: '90 min',
    guardSpec: 'Iluminación progresiva con protector capilar',
    productApplied: 'Baño de crema ácido + Sérum nutritivo',
    toolsUsed: 'Pincel de precisión · Peine de carbono',
    authorNote:
      'Aportamos luz en los puntos clave del corte cuidando siempre la integridad de la fibra capilar.',
  },
  {
    id: 'lb-4',
    title: 'Nutrición & Caída Fluida',
    category: 'Barba & Perfilado',
    imageUrl: '/src/assets/images/lookbook_long_layers_1793889692727.jpg',
    servicePerformed: '05. Lavado Premium y Nutrición Capilar',
    executionTime: '30 min',
    guardSpec: 'Hidratación profunda en lavacabezas',
    productApplied: 'Máscara de aminoácidos y argán',
    toolsUsed: 'Vapor tibio · Cepillo de cerdas naturales',
    authorNote:
      'Un descanso de media hora pensado para revitalizar el cuero cabelludo y devolverle suavidad al pelo.',
    featuredSpan: true,
  },
];

export const GOOGLE_REVIEWS: GoogleReview[] = [
  {
    id: 'rev-1',
    authorName: 'Martín Salvatierra',
    authorInitials: 'MS',
    relativeDate: 'Hace 3 días',
    rating: 5,
    serviceTag: 'Corte de Autor / Clásico',
    textParts: [
      { text: 'Una experiencia completamente distinta en Venado Tuerto. ' },
      { text: 'Sin ruidos ni gente esperando encima tuyo', highlight: true },
      { text: ': llegás a tu hora en Vuelta de Obligado 931, te reciben con un café y Rodrigo se toma todo el tiempo para lograr exactamente el corte que buscás.' },
    ],
  },
  {
    id: 'rev-2',
    authorName: 'Lucas Santoro',
    authorInitials: 'LS',
    relativeDate: 'Hace 1 semana',
    rating: 5,
    serviceTag: 'Corte + Perfilado de Barba',
    textParts: [
      { text: 'Destaco el ' },
      { text: 'trabajo a tijera y el cuidado en el perfilado de barba con toalla tibia', highlight: true },
      { text: '. El corte crece parejo durante semanas y la reserva desde la web funciona con una precisión impecable.' },
    ],
  },
  {
    id: 'rev-3',
    authorName: 'Julián Méndez',
    authorInitials: 'JM',
    relativeDate: 'Hace 2 semanas',
    rating: 5,
    serviceTag: 'Lavado Premium y Nutrición Capilar',
    textParts: [
      { text: 'Sumé el lavado premium con nutrición a mi corte habitual y ' },
      { text: 'el cambio en la textura del pelo se nota al instante', highlight: true },
      { text: '. El ambiente del estudio transmite una paz difícil de encontrar hoy en día.' },
    ],
  },
  {
    id: 'rev-4',
    authorName: 'Facundo Morán',
    authorInitials: 'FM',
    relativeDate: 'Hace 3 semanas',
    rating: 5,
    serviceTag: 'Diseño y Perfilado de Barba',
    textParts: [
      { text: 'Puntualidad absoluta y ' },
      { text: 'un asesoramiento muy honesto según tus facciones', highlight: true },
      { text: '. Es un verdadero estudio de autor donde cada detalle está pensado para que salgas renovado.' },
    ],
  },
];

export interface StreetwearDrop {
  id: string;
  name: string;
  category: 'Grooming' | 'Apparel' | 'Herramientas';
  price: number;
  badge?: string;
  description: string;
  spec: string;
}

export const STUDIO_DROPS: StreetwearDrop[] = [
  {
    id: 'drop-clay',
    name: 'Arcilla Botánica de Fijación Mate',
    category: 'Grooming',
    price: 14500,
    badge: 'Uso Diario',
    description: 'Arcilla natural al agua de fijación flexible y acabado mate sin residuos.',
    spec: '90g · Base Agua · Extractos Botánicos',
  },
  {
    id: 'drop-oil',
    name: 'Óleo Nutritivo de Jojoba & Cedro para Barba',
    category: 'Grooming',
    price: 16000,
    badge: 'Cuidado Facial',
    description: 'Hidratación profunda para el vello facial y la piel, de rápida absorción.',
    spec: '30ml · Prensado en Frío · Gotero de Vidrio',
  },
];

export function resolveInstagramHref(config: { instagram: string; instagramUrl?: string }): string {
  const rawUrl = (config.instagramUrl || '').trim();
  if (rawUrl && /^https?:\/\//i.test(rawUrl)) {
    return rawUrl;
  }
  const cleanHandle = (config.instagram || '').replace(/^@/, '').trim();
  return `https://instagram.com/${cleanHandle || 'rodrigo.cutsss'}`;
}

export function resolveWhatsAppHref(
  config: { whatsappRaw: string; whatsappUrl?: string },
  messageText?: string
): string {
  const rawUrl = (config.whatsappUrl || '').trim();
  if (rawUrl && /^https?:\/\//i.test(rawUrl)) {
    if (!messageText) return rawUrl;
    const sep = rawUrl.includes('?') ? '&' : '?';
    return `${rawUrl}${sep}text=${encodeURIComponent(messageText)}`;
  }
  const digits = (config.whatsappRaw || '').replace(/\D/g, '') || '5493462589104';
  if (!messageText) return `https://wa.me/${digits}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(messageText)}`;
}
