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
    text: '¡Hey! Bienvenido a Rodrigo Cutsss. Soy Rodrigo.',
    highlight: 'Rodrigo Cutsss',
  },
  {
    id: 'seg-2',
    startTime: 3.8,
    endTime: 8.2,
    text: 'Acá hacemos cortes, fades, color, barba y otros servicios.',
    highlight: 'cortes, fades, color, barba',
  },
  {
    id: 'seg-3',
    startTime: 8.2,
    endTime: 11.2,
    text: 'Arte urbano y precisión a medida en cada corte.',
    highlight: 'precisión a medida',
  },
  {
    id: 'seg-4',
    startTime: 11.2,
    endTime: 15.1,
    text: 'Si venís con una idea, la sacamos. Si no, la armamos juntos.',
    highlight: 'la armamos juntos',
  },
  {
    id: 'seg-5',
    startTime: 15.1,
    endTime: 19.5,
    text: 'Sacá tu turno desde la página o por WhatsApp. Te esperamos.',
    highlight: 'Sacá tu turno',
  },
];

export const STUDIO_INFO = {
  authorName: 'Rodrigo',
  studioTitle: 'RODRIGO CUTSSS',
  brandKicker: 'ESTUDIO DE CORTES MASCULINOS · VENADO TUERTO',
  tagline: 'Arte urbano y precisión a medida. Cortes, fades, color y barba.',
  bio: 'Atención exclusiva 1 a 1 en Venado Tuerto, Santa Fe. Si venís con una idea, la sacamos; si no, la armamos juntos. Sin filas de espera ni demoras.',
  address: 'Vuelta de Obligado 931',
  neighborhood: 'Venado Tuerto, Santa Fe',
  phoneDisplay: '+54 9 3462 55-4421',
  whatsappRaw: '5493462554421',
  instagram: '@rodrigo.cutsss',
  instagramUrl: 'https://instagram.com/rodrigo.cutsss',
  instagramDirectUrl: 'https://ig.me/m/rodrigo.cutsss',
  tiktokUrl: 'https://tiktok.com/@rodrigo.cutsss_vt',
  spotifyPlaylistUrl: 'https://open.spotify.com',
  currentVibeTrack: 'Presentación Rodrigo Cutsss + Trap & Drill Sessions',
  googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Vuelta+de+Obligado+931+Venado+Tuerto+Santa+Fe',
  wazeUrl: 'https://waze.com/ul?q=Vuelta+de+Obligado+931+Venado+Tuerto+Santa+Fe',
  googleReviewShortlink: 'https://g.page/r/RodrigoCutsss/review',
  heroImage: '/src/assets/images/urban_barber_hero_1793929257447.jpg',
  spaceImage: '/src/assets/images/space_private_atelier_1793889688437.jpg',
  presentationAudioUrl: PRESENTATION_AUDIO_URL,
};

export const STUDIO_SERVICES: StudioService[] = [
  {
    id: 'srv-mid-fade-crop',
    index: '01',
    category: 'Fades & Cortes',
    name: 'Corte de Pelo (Corte de Autor & Fade)',
    durationMinutes: 40,
    price: 12000,
    popularTag: 'Servicio Principal',
    shortDescription:
      'Corte de pelo completo y personalizado a tu medida: degradé milimétrico (Low, Mid, High o Skin Fade) con shaver de titanio 0.0mm, trabajo de tijera en cúspide y peinado con polvo texturizante mate.',
    preparation: [
      'Venir con el cabello lavado dentro de las 24 horas previas para apreciar la caída natural.',
      'Si venís con una idea o foto de referencia, la sacamos; si no, la armamos juntos en el sillón.',
    ],
    executionSteps: [
      '05 min · Asesoramiento personalizado según tus facciones, remolinos y estructura craneal.',
      '15 min · Apertura de guías milimétricas con clipper y pulido al ras 0.0 mm con shaver de lámina de titanio.',
      '15 min · Trabajo superior con tijera de diseño y entresacado para lograr textura orgánica.',
      '05 min · Definición limpia de contornos con trimmer Skeleton y acabado con polvo voluminizador mate.',
    ],
    aftercare:
      'El fade mantiene su nitidez óptima durante 10 a 14 días. Para peinarlo a diario, aplicá 2 toques de polvo mate en seco.',
    productsUsed: 'Babyliss Pro FX Shaver Titanio · Clipper Wahl Cordless · Polvo Slick Gorilla · Tijera de Esculpir',
  },
  {
    id: 'srv-taper-lineup',
    index: '02',
    category: 'Fades & Cortes',
    name: 'Taper Fade & Contornos a Trimmer',
    durationMinutes: 40,
    price: 12000,
    shortDescription:
      'Desvanecido focalizado en patillas y nuca baja, conservando el volumen lateral y marcando contornos limpios con trimmer de alta precisión sin irritar la piel.',
    preparation: [
      'Ideal si te gusta llevar el cabello con ondas, rulos o caída natural sin vaciar los laterales.',
      'No recortarse las patillas ni la línea del cuello 3 días antes para lograr bordes bien definidos.',
    ],
    executionSteps: [
      '05 min · Seccionamiento anatómico del parietal y control de densidad.',
      '15 min · Taper fade comprimido de 0.0 mm (shaver) a 1.5 mm en nuca y patillas.',
      '15 min · Ajuste de largo superior a tijera respetando rulos, ondas o caída hacia adelante.',
      '05 min · Marcado de arcos y contornos frontales con trimmer Skeleton calibrada al detalle.',
    ],
    aftercare:
      'Estilo versátil que crece de forma pareja hasta por 3 a 4 semanas manteniendo la estructura.',
    productsUsed: 'Wahl Cordless Senior · Trimmer Skeleton FX · Pomada Base Agua Mate',
  },
  {
    id: 'srv-full-experience',
    index: '03',
    category: 'Corte & Barba',
    name: 'Corte de Pelo + Perfilado de Barba Completo',
    durationMinutes: 60,
    price: 17000,
    popularTag: 'Combo Completo',
    shortDescription:
      'Corte de pelo urbano completo + degradé de barba conectado a las patillas, rebaje simétrico con máquina y tijera, toalla caliente al vapor y limpieza al ras con shaver hipoalergénica.',
    preparation: [
      'Dejar crecer la barba de 5 a 7 días para definir bien los ángulos mandibulares y el degradé.',
      'Cero irritación: trabajamos con trimmers de alta precisión y shaver de lámina de titanio hipoalergénica.',
    ],
    executionSteps: [
      '30 min · Corte de pelo y fade personalizado según tu estilo.',
      '15 min · Esculpido geométrico de barba con máquina sobre peine y degradé progresivo en patillas.',
      '10 min · Toalla tibia aromática y definición de líneas de cuello y pómulos con trimmer y shaver 0.0 mm.',
      '05 min · Aplicación de bálsamo hidratante de barba, tónico refrescante y peinado final.',
    ],
    aftercare:
      'Hidratar la barba una vez al día con aceite o bálsamo para mantener la suavidad y prolijidad.',
    productsUsed: 'Trimmer Babyliss FX · Shaver Titanio · Bálsamo Reuzel Wood & Spice',
  },
  {
    id: 'srv-bleach-buzz',
    index: '04',
    category: 'Color & Platinados',
    name: 'Corte de Pelo + Color / Platinado Global',
    durationMinutes: 90,
    price: 28000,
    shortDescription:
      'Corte personalizado o buzz cut con fade + decoloración cuidada con aditivo protector de fibra y matizado ceniza, plata frío o fantasía.',
    preparation: [
      'No lavar el cabello las 48 horas previas para resguardar el cuero cabelludo con su barrera lipídica natural.',
      'Avisar por Instagram o WhatsApp si tenés restos de tintura oscura previa.',
    ],
    executionSteps: [
      '15 min · Estructura base del corte y limpieza de contornos a trimmer.',
      '45 min · Decoloración controlada con protector plex para cuidar la fibra capilar.',
      '20 min · Aplicación de matiz tonal frío (Blanco Ceniza, Plata Hielo o tono a elección).',
      '10 min · Cierre técnico ácido, hidratación profunda y peinado.',
    ],
    aftercare:
      'Usar shampoo matizador violeta cada 5 días y crema nutritiva una vez por semana.',
    productsUsed: 'Schwarzkopf Blondme 9+ · Protector Plex · Matizador Fanola No Yellow',
  },
  {
    id: 'srv-beard-sculpt',
    index: '05',
    category: 'Detalles & Barba',
    name: 'Arreglo & Perfilado de Barba con Vapor',
    durationMinutes: 25,
    price: 7000,
    shortDescription:
      'Rebaje parejo de volumen, degradado en pómulos, toalla caliente al vapor, marcado milimétrico de contornos con trimmer y limpieza de cuello con shaver.',
    preparation: [
      'Venir con la barba seca y desenredada para evaluar la simetría natural.',
    ],
    executionSteps: [
      '10 min · Reducción volumétrica con máquina sobre peine siguiendo el ángulo del mentón.',
      '05 min · Toalla tibia aromatizada para suavizar el vello.',
      '05 min · Marcado nítido de pómulos y cuello con trimmer Skeleton y shaver de lámina de titanio.',
      '05 min · Cierre con tónico frío y bálsamo nutritivo.',
    ],
    aftercare:
      'Peinar hacia abajo a diario para educar la dirección del vello facial.',
    productsUsed: 'Trimmer Skeleton FX · Shaver Titanio · Aceite de Argán & Tónico',
  },
  {
    id: 'srv-freestyle-lines',
    index: '06',
    category: 'Detalles & Barba',
    name: 'Diseño Freestyle a Trimmer & Perfilado de Ceja',
    durationMinutes: 15,
    price: 5000,
    shortDescription:
      'Líneas geométricas o diseño urbano con trimmer de precisión en lateral/nuca y limpieza prolija de cejas.',
    preparation: [
      'Podés sumarlo como complemento a tu corte o agendarlo para mantener los detalles entre turnos.',
    ],
    executionSteps: [
      '05 min · Boceto simétrico adaptado a la forma de tu corte.',
      '05 min · Definición con cuchilla en T de alta precisión (0.0 mm) sin lastimar la piel.',
      '05 min · Pulido con shaver y loción calmante.',
    ],
    aftercare:
      'Mantiene su definición máxima durante 7 a 10 días.',
    productsUsed: 'Trimmer Babyliss Gold FX · Shaver de Precisión · Gel Calmante',
  },
];

export const STUDIO_GALLERY_ITEMS: StudioGalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Skin Fade Alto & Crop Texturizado',
    category: 'Cortes & Fades',
    imageUrl: '/src/assets/images/urban_streetwear_haircut_1793930882291.jpg',
    description:
      'Degradé alto pulido a 0.0 mm con shaver de titanio y cúspide trabajada a tijera con polvo texturizante mate. Precisión y diseño en cada detalle.',
    dateLabel: 'Destacado del Estudio',
    tags: ['#SkinFade', '#TexturedCrop', '#RodrigoCutsss', '#VenadoTuerto'],
    technicalSpec: 'Shaver Titanio 0.0mm + Tijera de Esculpir + Polvo Mate',
    serviceId: 'srv-mid-fade-crop',
    priceLabel: '$12.000 ARS',
    likes: 194,
    featured: true,
  },
  {
    id: 'gal-2',
    title: 'El Estudio por Dentro · Vuelta de Obligado 931',
    category: 'El Estudio & Local',
    imageUrl: '/src/assets/images/urban_graffiti_mirror_1793930882309.jpg',
    description:
      'Nuestro espacio privado 1 a 1 en Venado Tuerto. Espejo iluminado, estética urbana callejera, buena música y toda la comodidad para que vengas a cortarte tranquilo.',
    dateLabel: 'El Local',
    tags: ['#ElEstudio', '#VueltaDeObligado931', '#Atencion1a1', '#VibeUrbano'],
    technicalSpec: 'Puesto exclusivo 1 a 1 · Iluminación de estudio · Sonido Hi-Fi',
    likes: 238,
    featured: true,
  },
  {
    id: 'gal-3',
    title: 'Low Taper Fade en Rulos Naturales',
    category: 'Cortes & Fades',
    imageUrl: '/src/assets/images/urban_taper_curls_1793929259459.jpg',
    description:
      'Respetando el movimiento y volumen de los rulos arriba, limpiando patillas y nuca baja con trimmer de precisión y shaver.',
    dateLabel: 'Trabajo en Cliente',
    tags: ['#LowTaper', '#Rulos', '#FadeLimpio', '#VenadoTuerto'],
    technicalSpec: 'Guía 0.0 a 1.5mm en sienes y nuca · Crema definidora',
    serviceId: 'srv-taper-lineup',
    priceLabel: '$12.000 ARS',
    likes: 251,
  },
  {
    id: 'gal-4',
    title: 'Precisión en Contornos & Máquinas Calibradas',
    category: 'Máquinas & Setup',
    imageUrl: '/src/assets/images/urban_barber_hands_detail_1793930883253.jpg',
    description:
      'Equipamiento profesional calibrado al milímetro: trimmers Skeleton de cuchilla T y shavers de lámina de titanio hipoalergénica para lograr bordes perfectos cuidando tu piel.',
    dateLabel: 'Equipamiento Pro',
    tags: ['#TrimmerSkeleton', '#ShaverTitanio', '#ClippersPro', '#Precision'],
    technicalSpec: 'Clippers Cordless + Trimmers Cuchilla T + Esterilización UV',
    likes: 176,
  },
  {
    id: 'gal-5',
    title: 'Platinado Global Ceniza + High Fade',
    category: 'Color & Diseños',
    imageUrl: '/src/assets/images/urban_platinum_buzz_1793929260240.jpg',
    description:
      'Decoloración cuidada con aditivo protector y matizado blanco ceniza frío sin reflejos amarillos, acompañado de un fade bien limpio.',
    dateLabel: 'Colorimetría',
    tags: ['#Platinado', '#ColorMasculino', '#BuzzCut', '#EstiloPropio'],
    technicalSpec: 'Blondme 9+ con Plex · Matiz Plata Frío · Fade 0.0mm',
    serviceId: 'srv-bleach-buzz',
    priceLabel: '$28.000 ARS',
    likes: 215,
  },
  {
    id: 'gal-6',
    title: 'Sillón Principal & Atmósfera Privada',
    category: 'El Estudio & Local',
    imageUrl: '/src/assets/images/space_private_atelier_1793889688437.jpg',
    description:
      'Sin gente amontonada esperando ni ruidos molestos. Durante tu turno el estudio es 100% para vos.',
    dateLabel: 'Espacio 1 a 1',
    tags: ['#EstudioPrivado', '#Confort', '#VenadoTuerto', '#RodrigoCutsss'],
    technicalSpec: 'Sillón hidráulico reclinable · Climatización · Café de cortesía',
    likes: 164,
  },
  {
    id: 'gal-7',
    title: 'Combo: Mid Fade Conectado a Barba',
    category: 'Cortes & Fades',
    imageUrl: '/src/assets/images/urban_beard_fade_1793929260672.jpg',
    description:
      'Transición suave desde el corte hacia la barba, perfilada íntegramente con trimmer de precisión, toalla tibia al vapor y bálsamo hidratante.',
    dateLabel: 'Corte + Barba',
    tags: ['#BeardFade', '#BarbaProlija', '#MidFade', '#ComboCompleto'],
    technicalSpec: 'Conexión patilla-barba + Shaver en cuello y pómulos',
    serviceId: 'srv-full-experience',
    priceLabel: '$17.000 ARS',
    likes: 289,
  },
  {
    id: 'gal-8',
    title: 'Mid Fade Clásico & Textura Superior a Tijera',
    category: 'Cortes & Fades',
    imageUrl: '/src/assets/images/urban_textured_crop_1793929259231.jpg',
    description:
      'Si no venís con una idea cerrada, analizamos tu tipo de pelo y la armamos juntos para que te sea fácil peinarte todos los días.',
    dateLabel: 'Visagismo & Corte',
    tags: ['#MidFade', '#TexturaATijera', '#CorteDeAutor', '#RodrigoCutsss'],
    technicalSpec: 'Guía 0.5 a 2mm lateral · Capas texturizadas a tijera',
    serviceId: 'srv-mid-fade-crop',
    priceLabel: '$12.000 ARS',
    likes: 172,
  },
  {
    id: 'gal-9',
    title: 'Cultura Urbana & Detrás de Escena en VT',
    category: 'Cultura & Streetwear',
    imageUrl: '/src/assets/images/urban_barber_hero_1793929257447.jpg',
    description:
      'Rodrigo en plena sesión en Vuelta de Obligado 931. Dedicación total a cada detalle del corte.',
    dateLabel: 'Sesión en Vivo',
    tags: ['#RodrigoCutsss', '#CulturaUrbana', '#VenadoTuerto', '#BarberLife'],
    technicalSpec: 'Sesiones de 40 a 60 min · Turnos puntuales',
    likes: 310,
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
    id: 'drop-powder',
    name: 'Slick Gorilla · Hair Styling Powder',
    category: 'Grooming',
    price: 14500,
    badge: 'Esencial Urbano',
    description: 'Polvo texturizante acabado 100% mate. Aporta fijación invisible y volumen natural para crops y fades sin apelmazar.',
    spec: '20g · Acabado Mate Seco · Origen UK',
  },
  {
    id: 'drop-pomade',
    name: 'Reuzel Extreme Hold Matte Pomade',
    category: 'Grooming',
    price: 18000,
    badge: 'Máxima Fijación',
    description: 'Fórmula al agua de fijación firme para texturas marcadas. Se retira fácilmente con agua bajo la ducha.',
    spec: '113g · Base Agua · Acabado Mate',
  },
  {
    id: 'drop-tee',
    name: 'RODRIGO CUTSSS // Heavy Boxy Tee',
    category: 'Apparel',
    price: 24000,
    badge: 'Drop Limitado',
    description: 'Remera pesada corte boxy fit en algodón peinado 280 GSM. Estampa urbana con coordenadas de Venado Tuerto.',
    spec: '280 GSM Algodón · Talles S al XL · Negro Asfalto',
  },
  {
    id: 'drop-comb',
    name: 'Kit Peine Texturizador Carbono + Bruma Sea Salt',
    category: 'Herramientas',
    price: 16000,
    badge: 'Styling en Casa',
    description: 'Peine de fibra de carbono antiestático de dientes anchos junto con spray de sal marina para lograr textura urbana en 30 segundos.',
    spec: 'Fibra de Carbono + Spray 150ml · Uso Diario',
  },
];

export const LOOKBOOK_ITEMS: LookbookItem[] = [
  {
    id: 'lb-urban-streetwear-poster',
    title: 'Textured Crop Urbano & Fade Pulido',
    category: 'Texturizados',
    imageUrl: '/src/assets/images/urban_streetwear_haircut_1793930882291.jpg',
    servicePerformed: '01. Corte de Pelo (Corte de Autor & Fade)',
    executionTime: '40 min',
    guardSpec: 'Shaver 0.0mm a Trimmer · Frontal recto a escuadra',
    productApplied: 'Slick Gorilla Powder + Fijador mate',
    toolsUsed: 'Babyliss Gold FX Shaver · Tijera de Esculpir 5.5"',
    authorNote:
      'Estética urbana limpia con transición milimétrica desde la patilla usando shaver de titanio y línea frontal definida a trimmer.',
    featuredSpan: true,
  },
  {
    id: 'lb-urban-trimmer-detail',
    title: 'Precisión en Contornos: Trimmer & Shaver 0.0mm',
    category: 'Barba & Perfilado',
    imageUrl: '/src/assets/images/urban_barber_hands_detail_1793930883253.jpg',
    servicePerformed: '05. Arreglo & Perfilado de Barba con Vapor',
    executionTime: '25 min',
    guardSpec: 'Cuchilla T en 0.0 mm · Toalla tibia al vapor',
    productApplied: 'Aceite botánico hidratante + Bálsamo amaderado',
    toolsUsed: 'Trimmer Skeleton FX · Shaver de lámina de titanio',
    authorNote:
      'Definición ultra limpia de contornos y líneas de barba utilizando exclusivamente trimmers de precisión y shaver hipoalergénica, sin irritación.',
  },
  {
    id: 'lb-urban-station-vibe',
    title: 'El Estudio en Vuelta de Obligado 931',
    category: 'Skin Fades',
    imageUrl: '/src/assets/images/urban_graffiti_mirror_1793930882309.jpg',
    servicePerformed: '03. Corte de Pelo + Perfilado de Barba Completo',
    executionTime: '60 min',
    guardSpec: 'Espacio de trabajo 1 a 1 · Ambientación urbana',
    productApplied: 'Café de cortesía & Bebida fría',
    toolsUsed: 'Sillón hidráulico · Desinfección UV · Audio curado',
    authorNote:
      'Hormigón expuesto, arte urbano y atención personalizada sin apuros en Venado Tuerto.',
    featuredSpan: true,
  },
  {
    id: 'lb-urban-crop',
    title: 'Mid Fade & Crop Texturizado a Tijera',
    category: 'Texturizados',
    imageUrl: '/src/assets/images/urban_textured_crop_1793929259231.jpg',
    servicePerformed: '01. Corte de Pelo (Corte de Autor & Fade)',
    executionTime: '40 min',
    guardSpec: 'Guía 0.0 a 1.5mm · Tijera de entresacar',
    productApplied: 'Polvo voluminizador mate + Cera al agua',
    toolsUsed: 'Babyliss Pro Gold FX · Tijera Japonesa 5.5"',
    authorNote:
      'Desvanecido comprimido que arranca en 0.0 mm con shaver y sube en diagonal. Cúspide trabajada en seco a tijera para caída natural.',
  },
  {
    id: 'lb-urban-taper',
    title: 'Low Taper Fade con Rulos Orgánicos',
    category: 'Tapers & Caída',
    imageUrl: '/src/assets/images/urban_taper_curls_1793929259459.jpg',
    servicePerformed: '02. Taper Fade & Contornos a Trimmer',
    executionTime: '40 min',
    guardSpec: '0.0 mm nuca baja y patilla · Laterales con volumen',
    productApplied: 'Crema definidora de rulos & Activador de ondas',
    toolsUsed: 'Wahl Cordless Senior · Trimmer Skeleton',
    authorNote:
      'El corte ideal para el que no quiere raparse los costados pero busca bordes ultra limpios en patillas y nuca.',
  },
  {
    id: 'lb-urban-platinum',
    title: 'Platinado Hielo & Buzz Cut con Fade',
    category: 'Platinados & Buzz',
    imageUrl: '/src/assets/images/urban_platinum_buzz_1793929260240.jpg',
    servicePerformed: '04. Corte de Pelo + Color / Platinado Global',
    executionTime: '90 min',
    guardSpec: 'Superior guía #2 + Skin Fade lateral',
    productApplied: 'Matizador plata frío + Protector Plex',
    toolsUsed: 'Wahl Magic Clip · Trimmer de Precisión',
    authorNote:
      'Decoloración cuidada protegiendo el cuero cabelludo. Tono blanco ceniza parejo y contornos marcados a trimmer.',
  },
  {
    id: 'lb-urban-beard',
    title: 'Mid Fade con Barba Esculpida a Máquina y Shaver',
    category: 'Barba & Perfilado',
    imageUrl: '/src/assets/images/urban_beard_fade_1793929260672.jpg',
    servicePerformed: '03. Corte de Pelo + Perfilado de Barba Completo',
    executionTime: '60 min',
    guardSpec: 'Desvanecido 0 a 2mm con conexión de patilla',
    productApplied: 'Bálsamo para barba Reuzel + Polvo Mate',
    toolsUsed: 'Babyliss FX Trimmer · Shaver de lámina de titanio',
    authorNote:
      'Transición gradual entre el fade del pelo y el degradé de la barba para estilizar las facciones con máxima prolijidad.',
  },
];

export const GOOGLE_REVIEWS: GoogleReview[] = [
  {
    id: 'rev-1',
    authorName: 'Thiago Benítez',
    authorInitials: 'TB',
    relativeDate: 'Hace 2 días',
    rating: 5,
    serviceTag: 'Corte de Pelo (Corte de Autor & Fade)',
    textParts: [
      { text: 'La posta es que encontrar un barbero que entienda de ' },
      { text: 'fades urbanos y textura real', highlight: true },
      { text: ' en Venado Tuerto es oro puro. Rodri es un crack, súper ' },
      { text: 'puntual y el local en Vuelta de Obligado tiene tremenda vibra', highlight: true },
      { text: '. Reservás el turno por la web, te sentás a la hora exacta y salís impecable por 12 mil pesos.' },
    ],
  },
  {
    id: 'rev-2',
    authorName: 'Lucas Santoro',
    authorInitials: 'LS',
    relativeDate: 'Hace 4 días',
    rating: 5,
    serviceTag: 'Taper Fade & Contornos a Trimmer',
    textParts: [
      { text: 'Tengo rulos y siempre me arruinaban los cortes en peluquerías tradicionales. El ' },
      { text: 'taper que me hace Rodrigo es perfecto', highlight: true },
      { text: ', respeta la caída y me dura prolijo casi un mes. Además la música de fondo y la atención 1 a 1 marcan la diferencia.' },
    ],
  },
  {
    id: 'rev-3',
    authorName: 'Nahuel Rossi',
    authorInitials: 'NR',
    relativeDate: 'Hace 1 semana',
    rating: 5,
    serviceTag: 'Corte + Platinado Global',
    textParts: [
      { text: 'Me hice el platinado con Rodri y me dejó el pelo blanco ' },
      { text: 'sin quemarme nada', highlight: true },
      { text: '. El trato 1 a 1 sin gente amontonada mirando te da una comodidad tremenda. 10 de 10.' },
    ],
  },
  {
    id: 'rev-4',
    authorName: 'Facundo Morán',
    authorInitials: 'FM',
    relativeDate: 'Hace 2 semanas',
    rating: 5,
    serviceTag: 'Corte de Pelo + Perfilado de Barba',
    textParts: [
      { text: 'El ' },
      { text: 'perfilado con trimmer y shaver de titanio más la toalla al vapor', highlight: true },
      { text: ' te dejan la barba impecable y sin nada de irritación. Cero espera, te sentás al minuto que reservaste en Vuelta de Obligado 931.' },
    ],
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

