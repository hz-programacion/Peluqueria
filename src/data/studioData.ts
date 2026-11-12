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
  paymentOption: 'deposit' | 'full' | 'studio' | 'commitment';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  reviewLoopScheduledAt: string;
}

export interface ClientFormulaNote {
  id: string;
  clientName: string;
  whatsapp: string;
  formulaSpec: string;
  hairType: string;
  preferredProducts: string;
  updatedAt: string;
}

export interface TransformationCaseRecord {
  id: string;
  title: string;
  shortTabTitle: string;
  tag: string;
  serviceId: string;
  priceDisplay: string;
  duration: string;
  idealFor: string;
  beforeLabel: string;
  beforeDetail: string;
  afterLabel: string;
  afterDetail: string;
  beforeImage: string;
  afterImage: string;
  formulaSteps: string[];
}

export const INITIAL_TRANSFORMATION_CASES: TransformationCaseRecord[] = [
  {
    id: 'trans-crop-fade',
    title: 'De Largo Sin Estructura a Burst Fade 0.0mm & Textured Crop',
    shortTabTitle: 'Burst Fade & Crop',
    tag: 'CASO 01 · CAMBIO DE ESTRUCTURA',
    serviceId: 'srv-01',
    priceDisplay: '$12.000 ARS',
    duration: '45 min',
    idealFor: 'Cabello lacio u ondulado con laterales abultados que pierde forma a las 2 semanas.',
    beforeLabel: 'ANTES · 6 SEMANAS DE CRECIMIENTO',
    beforeDetail: 'Laterales sin forma, nuca desprolija y peso excesivo en la zona superior.',
    afterLabel: 'DESPUÉS · SKIN FADE 0.0MM & CROP MATE',
    afterDetail: 'Pulido al ras con Shaver de Titanio 0.0mm, textura a tijera y polvo mate.',
    beforeImage: '/src/assets/images/urban_barber_hero_1793929257447.jpg',
    afterImage: '/src/assets/images/urban_textured_crop_1793929259231.jpg',
    formulaSteps: [
      'Apertura de guía a clipper y rasurado hipoalergénico 0.0 mm con shaver de lámina de titanio.',
      'Descarga de peso en cúspide con tijera de esculpir para lograr movimiento orgánico.',
      'Marcado frontal limpio con Trimmer y sellado con polvo texturizante mate.',
    ],
  },
  {
    id: 'trans-taper-beard',
    title: 'De Rulos & Barba Desconectada a Low Taper + Barba al Vapor',
    shortTabTitle: 'Low Taper & Barba',
    tag: 'CASO 02 · VISAGISMO COMPLETO',
    serviceId: 'srv-02',
    priceDisplay: '$17.000 ARS',
    duration: '60 min',
    idealFor: 'Clientes que buscan integrar el corte con una barba prolija que estilice las facciones.',
    beforeLabel: 'ANTES · RULOS Y BARBA SIN LÍNEA',
    beforeDetail: 'Volumen descontrolado en patillas y barba sin ángulo mandibular definido.',
    afterLabel: 'DESPUÉS · LOW TAPER & BARBA ESCULPIDA',
    afterDetail: 'Transición limpia en sienes, barba perfilada con toalla tibia y contornos a trimmer.',
    beforeImage: '/src/assets/images/urban_taper_curls_1793929259459.jpg',
    afterImage: '/src/assets/images/urban_beard_fade_1793929260672.jpg',
    formulaSteps: [
      'Low Taper comprimido en patillas y nuca baja conservando la caída natural superior.',
      'Esculpido geométrico de barba con toalla caliente al vapor y bálsamo hidratante.',
      'Limpieza al ras en cuello y pómulos con Shaver de Titanio 0.0 mm.',
    ],
  },
  {
    id: 'trans-platinum-ice',
    title: 'De Base Oscura a Platinado Hielo Ceniza + High Skin Fade',
    shortTabTitle: 'Platinado Hielo',
    tag: 'CASO 03 · COLORIMETRÍA DE AUTOR',
    serviceId: 'srv-04',
    priceDisplay: '$28.000 ARS',
    duration: '90 min',
    idealFor: 'Cambio de look total cuidando la fibra capilar con protectores Plex sin tonos amarillos.',
    beforeLabel: 'ANTES · TONO NATURAL SIN CONTRASTE',
    beforeDetail: 'Cabello oscuro uniforme sin definición en contornos ni contraste lateral.',
    afterLabel: 'DESPUÉS · PLATINADO CENIZA FRÍO + FADE',
    afterDetail: 'Decoloración protegida con Plex y matiz blanco hielo con degradé alto.',
    beforeImage: '/src/assets/images/urban_textured_crop_1793929259231.jpg',
    afterImage: '/src/assets/images/urban_platinum_buzz_1793929260240.jpg',
    formulaSteps: [
      'Protección lipídica del cuero cabelludo y decoloración controlada con aditivo Plex.',
      'Matizado técnico plata ceniza frío para neutralizar por completo tonos cálidos.',
      'High Skin Fade 0.0 mm en laterales para resaltar el contraste del corte.',
    ],
  },
];

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
    text: 'Hola, bienvenido a Rodrigo Cutsss. Soy Rodrigo.',
    highlight: 'Rodrigo Cutsss',
  },
  {
    id: 'seg-2',
    startTime: 3.8,
    endTime: 8.2,
    text: 'Trabajamos fades limpios, cortes de autor, perfilado de barba y coloración.',
    highlight: 'cortes de autor',
  },
  {
    id: 'seg-3',
    startTime: 8.2,
    endTime: 11.2,
    text: 'Cada sesión es uno a uno, en nuestro estudio de Vuelta de Obligado 931.',
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
  studioTitle: 'Rodrigo Cutsss',
  brandKicker: 'Peluquería & Barbería de Autor · Venado Tuerto',
  tagline: 'Fades limpios, textura real y tu mejor versión en cada corte.',
  bio: 'En Rodrigo Cutsss trabajamos cada turno uno a uno en Vuelta de Obligado 931, Venado Tuerto, Santa Fe. Combinamos técnica de precisión con máquina y tijera, buen ambiente y dedicación total para que tu corte mantenga su estructura perfecta durante semanas.',
  address: 'Vuelta de Obligado 931',
  neighborhood: 'Venado Tuerto, Santa Fe',
  phoneDisplay: '+54 9 3462 55-4421',
  whatsappRaw: '5493462554421',
  instagram: '@rodrigo.cutsss',
  instagramUrl: 'https://instagram.com/rodrigo.cutsss',
  instagramDirectUrl: 'https://ig.me/m/rodrigo.cutsss',
  tiktokUrl: 'https://tiktok.com/@rodrigo.cutsss_vt',
  spotifyPlaylistUrl: 'https://open.spotify.com',
  currentVibeTrack: 'Rodrigo Cutsss · Monumental Session',
  googleMapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Vuelta+de+Obligado+931+Venado+Tuerto+Santa+Fe',
  wazeUrl: 'https://waze.com/ul?q=Vuelta+de+Obligado+931+Venado+Tuerto+Santa+Fe',
  googleReviewShortlink: 'https://g.page/r/RodrigoCutsss/review',
  heroImage: '/src/assets/images/urban_barber_hero_1793929257447.jpg',
  spaceImage: '/src/assets/images/urban_graffiti_mirror_1793930882309.jpg',
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
    popularTag: 'El Más Pedido',
    imageUrl: '/src/assets/images/urban_streetwear_haircut_1793930882291.jpg',
    shortDescription:
      'Diagnóstico personalizado según tus facciones, skin fade o taper limpio a máquina y tijera, texturizado superior y peinado final con acabado mate.',
    preparation: [
      'Asesoramiento inicial para definir altura del degradé, caída natural y facilidad de peinado diario.',
      'Adaptamos la graduación (0.0mm a 2.0mm) y el trabajo a tijera según tu tipo de pelo y remolinos.',
    ],
    executionSteps: [
      '10 min · Diagnóstico de estructura craneal, remolinos y estilo.',
      '20 min · Degradé limpio a máquina y conexión precisa a tijera.',
      '10 min · Texturizado en seco (Point Cutting) para dar volumen y movimiento.',
      '05 min · Peinado final con polvo voluminizador o pomada mate.',
    ],
    aftercare:
      'Mantiene su estructura y caída armónica entre 2 y 3 semanas sin perder prolijidad en nuca ni contornos.',
    productsUsed: 'Clippers de precisión · Tijeras de esculpir · Polvo de textura & Arcilla mate',
  },
  {
    id: 'srv-02',
    index: '02',
    category: 'Corte & Barba',
    name: 'Corte + Perfilado de Barba',
    durationMinutes: 60,
    price: 17000,
    popularTag: 'Combo Completo',
    imageUrl: '/src/assets/images/urban_beard_fade_1793929260672.jpg',
    shortDescription:
      'Servicio integral de corte de cabello a medida combinado con diseño, rebaje volumétrico y perfilado de barba con compresa tibia e hidratación.',
    preparation: [
      'Ideal para integrar el degradé de las patillas con la estructura mandibular en una sola sesión.',
      'Utilizamos trimmers hipoalergénicas de alta precisión para definir contornos sin irritar la piel.',
    ],
    executionSteps: [
      '30 min · Corte de cabello completo con fade o taper y textura superior.',
      '15 min · Esculpido geométrico de barba equilibrando mentón y pómulos.',
      '10 min · Toalla tibia aromática y limpieza precisa de líneas en cuello y mejillas.',
      '05 min · Aplicación de óleo nutritivo y bálsamo hidratante.',
    ],
    aftercare:
      'Recomendamos aplicar 3 gotas de óleo hidratante luego de la ducha para mantener la fibra suave.',
    productsUsed: 'Trimmer de detalle · Tijera de autor · Óleo de jojoba y cedro',
  },
  {
    id: 'srv-03',
    index: '03',
    category: 'Detalles & Barba',
    name: 'Diseño y Perfilado de Barba',
    durationMinutes: 30,
    price: 8500,
    imageUrl: '/src/assets/images/urban_barber_hands_detail_1793930883253.jpg',
    shortDescription:
      'Alineación de pómulos y cuello, rebaje graduado de volumen, ritual de toalla tibia relajante y nutrición profunda del vello facial y la piel.',
    preparation: [
      'Venir con la barba seca y peinada en su dirección natural para evaluar la densidad real.',
    ],
    executionSteps: [
      '10 min · Rebaje progresivo de volumen y simetría mandibular.',
      '10 min · Aplicación de toalla tibia para abrir poros y suavizar el vello.',
      '05 min · Definición limpia de contornos superiores e inferiores con trimmer.',
      '05 min · Cierre con aftershave calmante y bálsamo nutritivo.',
    ],
    aftercare:
      'Cepillar diariamente hacia abajo con cepillo de cerdas naturales para ordenar el crecimiento.',
    productsUsed: 'Trimmer de precisión · Tónico calmante · Bálsamo hidratante de barba',
  },
  {
    id: 'srv-04',
    index: '04',
    category: 'Color & Platinados',
    name: 'Coloración / Iluminación',
    durationMinutes: 90,
    price: 28000,
    popularTag: 'Color Studio',
    imageUrl: '/src/assets/images/urban_platinum_buzz_1793929260240.jpg',
    shortDescription:
      'Platinados globales, reflejos, mechas o iluminación trabajados con aditivos protectores de fibra más corte y matizado personalizado.',
    preparation: [
      'No lavar el cuero cabelludo durante las 24 horas previas para conservar la barrera lipídica natural.',
    ],
    executionSteps: [
      '15 min · Diagnóstico de tono base, elasticidad y preparación protectora.',
      '45 min · Decoloración controlada o iluminación con aditivo protector Plex.',
      '15 min · Matizado técnico (hielo, ceniza, perla o tonos cálidos) sin reflejos indeseados.',
      '15 min · Lavado ácido sellador, nutrición y corte de terminación.',
    ],
    aftercare:
      'Usar shampoo matizador violeta 1 vez por semana y máscara nutritiva cada 10 días.',
    productsUsed: 'Decolorante con Plex · Matizador profesional · Sellador pH ácido',
  },
  {
    id: 'srv-05',
    index: '05',
    category: 'Detalles & Barba',
    name: 'Lavado Premium y Nutrición Capilar',
    durationMinutes: 30,
    price: 9500,
    imageUrl: '/src/assets/images/urban_taper_curls_1793929259459.jpg',
    shortDescription:
      'Limpieza oxigenante del cuero cabelludo, masaje descontracturante y baño de crema restaurador con vapor tibio para devolver cuerpo y brillo.',
    preparation: [
      'Podés reservarlo como sesión individual de renovación o sumarlo a tu corte habitual.',
    ],
    executionSteps: [
      '10 min · Lavado purificante doble con masaje circular en sienes y nuca.',
      '12 min · Aplicación de máscara nutritiva de aminoácidos con toalla tibia.',
      '08 min · Enjuague estimulante y modelado con protector térmico.',
    ],
    aftercare:
      'Deja el cabello dócil, luminoso y con textura sana desde el primer día.',
    productsUsed: 'Shampoo purificante · Máscara restauradora de aminoácidos · Bruma térmica',
  },
];

export const STUDIO_GALLERY_ITEMS: StudioGalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Mid Drop Fade & Textura Crop',
    category: 'Cortes & Fades',
    imageUrl: '/src/assets/images/urban_streetwear_haircut_1793930882291.jpg',
    description:
      'Transición limpia desde 0.0mm con caída detrás del lóbulo y desconexión texturizada en la zona superior para un peinado rápido con polvo mate.',
    dateLabel: 'Destacado · Rodrigo Cutsss',
    tags: ['#MidDropFade', '#RodrigoCutsss', '#VenadoTuerto'],
    technicalSpec: 'Clipper 0.0mm a 1.5mm · Point Cutting · Polvo Mate',
    serviceId: 'srv-01',
    priceLabel: '$12.000 ARS',
    likes: 214,
    featured: true,
  },
  {
    id: 'gal-2',
    title: 'El Estudio en Vuelta de Obligado 931',
    category: 'El Estudio & Local',
    imageUrl: '/src/assets/images/urban_graffiti_mirror_1793930882309.jpg',
    description:
      'Nuestro espacio privado en Venado Tuerto: sillón profesional, iluminación de precisión, buena música y atención exclusiva por turno.',
    dateLabel: 'El Estudio',
    tags: ['#RodrigoCutsss', '#VueltaDeObligado931', '#EstudioPrivado'],
    technicalSpec: 'Atención 1 a 1 · Música & Café · Cero esperas',
    likes: 268,
    featured: true,
  },
  {
    id: 'gal-3',
    title: 'Skin Fade & Perfilado Geométrico de Barba',
    category: 'Cortes & Fades',
    imageUrl: '/src/assets/images/urban_beard_fade_1793929260672.jpg',
    description:
      'Degradé en laterales integrado con barba rebajada en ángulo mandibular y terminación con compresa tibia y óleo nutritivo.',
    dateLabel: 'Combo Completo',
    tags: ['#FadeYBarba', '#RodrigoCutsss', '#VenadoTuerto'],
    technicalSpec: 'Taper en patillas · Toalla tibia · Óleo de cedro',
    serviceId: 'srv-02',
    priceLabel: '$17.000 ARS',
    likes: 289,
  },
  {
    id: 'gal-4',
    title: 'Arsenal Técnico: Clippers & Tijeras de Acero',
    category: 'Máquinas & Setup',
    imageUrl: '/src/assets/images/urban_barber_hands_detail_1793930883253.jpg',
    description:
      'Máquinas inalámbricas calibradas al detalle, trimmers de contorno hipoalergénicas y esterilización completa entre cada cliente.',
    dateLabel: 'Setup Profesional',
    tags: ['#Setup', '#Clippers', '#Precision'],
    technicalSpec: 'Cuchillas DLC · Esterilización UV · Tijeras 6.0"',
    serviceId: 'srv-01',
    priceLabel: '$12.000 ARS',
    likes: 192,
  },
  {
    id: 'gal-5',
    title: 'Ice Platinum Global + Low Taper',
    category: 'Color & Diseños',
    imageUrl: '/src/assets/images/urban_platinum_buzz_1793929260240.jpg',
    description:
      'Decoloración cuidada con aditivo protector de enlaces, matiz blanco hielo uniforme y contornos limpios en patillas y nuca.',
    dateLabel: 'Colorimetría',
    tags: ['#Platinado', '#ColorStudio', '#LowTaper'],
    technicalSpec: 'Protector Plex · Matiz Ice · Sellado pH ácido',
    serviceId: 'srv-04',
    priceLabel: '$28.000 ARS',
    likes: 247,
  },
  {
    id: 'gal-6',
    title: 'Low Taper & Movimiento Natural en Capas',
    category: 'Cultura & Streetwear',
    imageUrl: '/src/assets/images/urban_textured_crop_1793929259231.jpg',
    description:
      'Trabajo a tijera manteniendo el largo superior con contornos ultra limpios para un look versátil que crece parejo.',
    dateLabel: 'Estilo de Autor',
    tags: ['#LowTaper', '#Textura', '#RodrigoCutsss'],
    technicalSpec: 'Tijera sobre peine · Arcilla botánica mate',
    serviceId: 'srv-01',
    priceLabel: '$12.000 ARS',
    likes: 205,
  },
];

export const LOOKBOOK_ITEMS: LookbookItem[] = [
  {
    id: 'lb-1',
    title: 'Mid Drop Fade & Crop Texturizado',
    category: 'Skin Fades',
    imageUrl: '/src/assets/images/urban_streetwear_haircut_1793930882291.jpg',
    servicePerformed: '01. Corte de Autor / Clásico',
    executionTime: '45 min',
    guardSpec: '0.0mm Shaver -> 0.5mm -> 1.5mm -> Tijera',
    productApplied: 'Polvo voluminizador + Arcilla mate',
    toolsUsed: 'Clipper inalámbrica + Tijera de esculpir',
    authorNote:
      'Curvamos la línea de transición detrás del oído para acompañar la estructura ósea y lograr máxima duración.',
    featuredSpan: true,
  },
  {
    id: 'lb-2',
    title: 'Skin Fade & Barba Esculpida',
    category: 'Barba & Perfilado',
    imageUrl: '/src/assets/images/urban_beard_fade_1793929260672.jpg',
    servicePerformed: '02. Corte + Perfilado de Barba',
    executionTime: '60 min',
    guardSpec: 'Fade lateral + Barba en degradé mandibular',
    productApplied: 'Óleo de jojoba y cedro + Bálsamo mate',
    toolsUsed: 'Trimmer de precisión + Compresa tibia',
    authorNote:
      'Equilibrio exacto entre laterales limpios y una barba con peso visual en el mentón.',
  },
  {
    id: 'lb-3',
    title: 'Ice Platinum & Low Taper',
    category: 'Platinados & Buzz',
    imageUrl: '/src/assets/images/urban_platinum_buzz_1793929260240.jpg',
    servicePerformed: '04. Coloración / Iluminación',
    executionTime: '90 min',
    guardSpec: 'Global Ice + Taper en sienes y nuca',
    productApplied: 'Protector Plex + Sellador ácido',
    toolsUsed: 'Colorimetría técnica + Trimmer DLC',
    authorNote:
      'Platinado frío uniforme protegiendo la elasticidad del pelo desde el primer minuto.',
  },
  {
    id: 'lb-4',
    title: 'Taper Clásico & Textura a Tijera',
    category: 'Tapers & Caída',
    imageUrl: '/src/assets/images/urban_textured_crop_1793929259231.jpg',
    servicePerformed: '01. Corte de Autor / Clásico',
    executionTime: '45 min',
    guardSpec: 'Tijera en capas + Contornos limpios',
    productApplied: 'Arcilla mate de fijación flexible',
    toolsUsed: 'Tijera hoja japonesa 6.0"',
    authorNote:
      'Ideal para quienes buscan un corte con caída natural que se acomode solo todos los días.',
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
      { text: 'La mejor atención de Venado Tuerto. ' },
      { text: 'Llegás a tu hora en Vuelta de Obligado 931 y te atienden al toque', highlight: true },
      { text: '. Rodrigo tiene una mano increíble para el fade y el corte mantiene la forma semanas enteras.' },
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
      { text: 'Excelente el ' },
      { text: 'degradé y el perfilado de barba con toalla tibia', highlight: true },
      { text: '. El estudio en Rodrigo Cutsss tiene toda la onda y sacar turno desde la web en 1 minuto es un golazo.' },
    ],
  },
  {
    id: 'rev-3',
    authorName: 'Julián Méndez',
    authorInitials: 'JM',
    relativeDate: 'Hace 2 semanas',
    rating: 5,
    serviceTag: 'Coloración / Iluminación',
    textParts: [
      { text: 'Me hice unos reflejos y corte completo: ' },
      { text: 'el pelo quedó impecable y súper sano', highlight: true },
      { text: '. Se nota cuando alguien trabaja sin apuro y con productos de primera.' },
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
      { text: 'Puntualidad total y ' },
      { text: 'un asesoramiento muy claro según tus facciones', highlight: true },
      { text: '. Sin dudas mi peluquería fija en Venado Tuerto.' },
    ],
  },
];

export const INITIAL_CLIENT_NOTES: ClientFormulaNote[] = [
  {
    id: 'crm-1',
    clientName: 'Ignacio Varela',
    whatsapp: '+54 9 3462 521984',
    formulaSpec: 'Mid Drop Fade desde 0.0mm · Arriba 4cm a tijera con point cutting · Remolino en coronilla derecha (dejar 1cm extra de peso).',
    hairType: 'Ondulado densidad media',
    preferredProducts: 'Polvo voluminizador mate',
    updatedAt: 'Última visita registrada',
  },
  {
    id: 'crm-2',
    clientName: 'Lautaro Rossi',
    whatsapp: '+54 9 3462 609341',
    formulaSpec: 'Low Taper en patillas y nuca · Barba rebajada a #2 en mejillas con mentón proyectado · Toalla tibia y óleo de cedro.',
    hairType: 'Lacio grueso + Barba tupida',
    preferredProducts: 'Arcilla mate + Óleo de jojoba',
    updatedAt: 'Cliente frecuente (cada 15 días)',
  },
  {
    id: 'crm-3',
    clientName: 'Santiago Romero',
    whatsapp: '+54 9 3462 489023',
    formulaSpec: 'Skin Fade alto comprimido · Textura crop frontal · Perfilado angular en pómulos.',
    hairType: 'Lacio fino',
    preferredProducts: 'Pomada mate base agua',
    updatedAt: 'Cliente verificado',
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
    name: 'Arcilla Mate Rodrigo Cutsss',
    category: 'Grooming',
    price: 14500,
    badge: 'Uso Diario',
    description: 'Arcilla al agua de fijación firme y acabado mate sin residuos.',
    spec: '90g · Base Agua · Acabado Mate',
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
