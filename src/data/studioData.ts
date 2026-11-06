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
  guardSpec: string; // e.g. "0 a 1.5mm shaver"
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

export const STUDIO_INFO = {
  authorName: 'Rodrigo',
  studioTitle: 'RODRIGO CUTSSS',
  brandKicker: 'ESTUDIO DE CORTES MASCULINOS // VENADO TUERTO',
  tagline: 'Cortes urbanos, tapers quirúrgicos y estilo de autor para hombres.',
  bio: 'Atención exclusiva de 1 solo cliente por turno en Venado Tuerto, Santa Fe. Sin filas de espera, sin ruido caótico ni interrupciones telefónicas mientras estás en el sillón.',
  address: 'Vuelta de Obligado 931',
  neighborhood: 'Venado Tuerto, Santa Fe',
  phoneDisplay: '+54 9 3462 55-4421',
  whatsappRaw: '5493462554421',
  instagram: '@rodrigocutsss',
  spotifyPlaylistUrl: 'https://open.spotify.com',
  currentVibeTrack: 'Trap & Drill Sessions 2026',
  googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Vuelta+de+Obligado+931+Venado+Tuerto+Santa+Fe',
  wazeUrl: 'https://waze.com/ul?q=Vuelta+de+Obligado+931+Venado+Tuerto+Santa+Fe',
  googleReviewShortlink: 'https://g.page/r/RodrigoCutsss/review',
  heroImage: '/src/assets/images/urban_barber_hero_1793929257447.jpg',
  spaceImage: '/src/assets/images/urban_barber_hero_1793929257447.jpg',
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
      'Corte de pelo completo y personalizado: degradé milimétrico (Low, Mid, High o Skin Fade) o corte clásico con tijera, navaja de precisión y peinado con polvo texturizante mate.',
    preparation: [
      'Venir con el cabello lavado dentro de las 24 horas previas para ver la caída natural.',
      'Si tenés fotos o referencias del estilo que buscás, mostralas al sentarte para adaptar el visagismo.',
    ],
    executionSteps: [
      '05 min · Diagnóstico visagista de facciones, remolinos y forma craneal.',
      '15 min · Apertura de guías milimétricas con clipper y afeitado en cero con shaver.',
      '15 min · Trabajo de cúspide con tijera japonesa entresacada para textura descontracturada.',
      '05 min · Limpieza a contrapelo con shavette y sellado con polvo voluminizador mate.',
    ],
    aftercare:
      'El fade mantiene su nitidez óptima durante 10 a 14 días. Para peinarlo a diario, usá 2 toques de polvo mate en seco.',
    productsUsed: 'Babyliss Pro FX Shaver · Polvo Texturizante Slick Gorilla · Tijera Japonesa',
  },
  {
    id: 'srv-taper-lineup',
    index: '02',
    category: 'Fades & Cortes',
    name: 'Taper Fade & Line Up',
    durationMinutes: 40,
    price: 12000,
    shortDescription:
      'Desvanecido focalizado exclusivamente en patillas y nuca baja, conservando la masa lateral y marcando contornos frontales a navaja.',
    preparation: [
      'Ideal si te gusta llevar el cabello con ondas, rulos o caída natural sin vaciar los laterales.',
      'No afeitarse las patillas ni la línea del cuello 3 días antes para dejar bordes limpios.',
    ],
    executionSteps: [
      '05 min · Seccionamiento anatómico del parietal y control de densidad.',
      '15 min · Taper fade comprimido de 0 a 1.5mm en nuca y patillas con trimmer.',
      '15 min · Ajuste de largo superior respetando rulos u ondas naturales.',
      '05 min · Perfilado de contornos a navaja con gel transparente de afeitado.',
    ],
    aftercare:
      'Estilo muy versátil que envejece de forma orgánica hasta por 4 semanas sin desarmarse.',
    productsUsed: 'Wahl Cordless Senior · Trimmer Skeleton · Pomada Base Agua Mate',
  },
  {
    id: 'srv-full-experience',
    index: '03',
    category: 'Corte & Barba',
    name: 'Corte de Pelo + Ritual de Barba Completa',
    durationMinutes: 60,
    price: 17000,
    popularTag: 'Combo Completo',
    shortDescription:
      'Corte de pelo urbano completo, degradé de barba conectado a las patillas, toalla caliente al vapor con aceites esenciales, afeitado a navaja y café de bienvenida.',
    preparation: [
      'Dejar crecer la barba al menos 5 a 7 días para poder definir los ángulos y el degradé de mejilla.',
      'Si tenés piel reactiva o foliculitis, se aplica aceite calmante de árbol de té previo a la toalla.',
    ],
    executionSteps: [
      '30 min · Corte de pelo y degradé personalizado según tu estilo craneal.',
      '15 min · Esculpido de barba, rebajado progresivo y toalla caliente vaporizada con aceites esenciales.',
      '10 min · Afeitado de contornos a navaja libre con gel refrigerante y toalla fría tonificante.',
      '05 min · Bálsamo hidratante de barba, aftershave sin ardor y styling final.',
    ],
    aftercare:
      'Hidratar la barba 1 vez al día con bálsamo en seco para mantener la suavidad de las cerdas.',
    productsUsed: 'Navaja Feather Japonesa · Proraso Eucalyptus · Bálsamo Reuzel Wood',
  },
  {
    id: 'srv-bleach-buzz',
    index: '04',
    category: 'Color & Platinados',
    name: 'Corte de Pelo + Platinado Global / Color',
    durationMinutes: 90,
    price: 28000,
    shortDescription:
      'Corte buzz uniforme o con fade + doble decoloración técnica con plex protector y matizador ceniza / plata frío sin amarillo residual.',
    preparation: [
      'No lavar el cabello las 48 horas previas para proteger el cuero cabelludo con los aceites naturales.',
      'Informar si tenés tintura previa o aplicaciones caseras de henna.',
    ],
    executionSteps: [
      '15 min · Corte rapado o fade a medida con limpieza de nuca a trimmer.',
      '45 min · Decoloración técnica en 2 tiempos con aditivo reconstructor de enlaces.',
      '20 min · Matiz tonal frío (Platino Ártico, Blanco Hielo o Gris Plata).',
      '10 min · Mascarilla ácida selladora de cutícula y styling con cera mate.',
    ],
    aftercare:
      'Usar shampoo matizador violeta cada 5 días y mascarilla hidratante 1 vez por semana.',
    productsUsed: 'Schwarzkopf Blondme 9+ · Olaplex · Matizador Fanola No Yellow',
  },
  {
    id: 'srv-beard-sculpt',
    index: '05',
    category: 'Detalles & Barba',
    name: 'Perfilado de Barba a Navaja & Toalla Térmica',
    durationMinutes: 25,
    price: 7000,
    shortDescription:
      'Rebaje parejo, degradado en pómulos, ritual de toalla caliente para abrir poros, perfilado milimétrico de líneas y bálsamo hidratante.',
    preparation: [
      'No tocar las líneas de cuello antes de venir para corregir cualquier asimetría previa.',
    ],
    executionSteps: [
      '10 min · Reducción volumétrica con máquina sobre peine según forma mandibular.',
      '05 min · Toalla caliente y aplicación de aceite pre-shave.',
      '05 min · Navajazo preciso en pómulos y cuello.',
      '05 min · Compresa fría de cierre y bálsamo perfumado.',
    ],
    aftercare:
      'Cepillar con cerda de jabalí para orientar el crecimiento y distribuir los aceites.',
    productsUsed: 'Aceite de Argán Prensado · Shavette Parker · Tónico Refrescante',
  },
  {
    id: 'srv-freestyle-lines',
    index: '06',
    category: 'Detalles & Barba',
    name: 'Líneas Freestyle a Navaja & Detalle de Ceja',
    durationMinutes: 15,
    price: 5000,
    shortDescription:
      'Diseño geométrico a navaja en lateral/nuca o corte de ceja con navaja descartable para un acabado urbano de alto impacto.',
    preparation: [
      'Puede agregarse a cualquier corte o realizarse como retoque exprés.',
    ],
    executionSteps: [
      '05 min · Marcado simétrico con lápiz dermográfico según tus facciones.',
      '05 min · Trazo quirúrgico a navaja con gel translúcido.',
      '05 min · Limpieza antiséptica y sellador calmante.',
    ],
    aftercare:
      'Dura 7-10 días antes de que vuelva a brotar el vello.',
    productsUsed: 'Trimmer Skeleton FX · Alcohol Isopropílico · Gel Hipolergénico',
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
    description: 'Fórmula al agua de fijación indestructible para texturas marcadas. Se retira fácilmente con agua bajo la ducha.',
    spec: '113g · Base Agua · Aroma Manzana/Azúcar',
  },
  {
    id: 'drop-tee',
    name: 'RODRIGO CUTSSS // Heavy Tee',
    category: 'Apparel',
    price: 24000,
    badge: 'Drop Limitado',
    description: 'Remera pesada corte boxy fit en algodón peinado 280 GSM. Serigrafía con tipografía stencil y coordenadas de Venado Tuerto.',
    spec: '280 GSM French Terry · Talles 1 al 4 · Negro Grafito',
  },
  {
    id: 'drop-razor',
    name: 'Shavette Japonesa Edición Carbono',
    category: 'Herramientas',
    price: 26000,
    badge: 'Pieza de Autor',
    description: 'Porta-navajas equilibrado en acero quirúrgico con pavonado negro mate y grabado láser RODRIGO CUTSSS.',
    spec: 'Acero Quirúrgico · Cierre magnético · Incluye funda de cuero',
  },
];

export const LOOKBOOK_ITEMS: LookbookItem[] = [
  {
    id: 'lb-urban-streetwear-poster',
    title: 'Textured Crop Urbano & Temple Line-Up',
    category: 'Texturizados',
    imageUrl: '/src/assets/images/urban_streetwear_haircut_1793930882291.jpg',
    servicePerformed: '01. Mid / Low Fade & Crop Texturizado',
    executionTime: '45 min',
    guardSpec: 'Guía 0.5 a navaja · Frontal recto a escuadra',
    productApplied: 'Slick Gorilla Powder + Fijador mate',
    toolsUsed: 'Babyliss Gold FX Shaver · Tijera Kasho 5.5"',
    authorNote:
      'Estética urbana cruda inspirada en el streetwear londinense. Transición a navaja pura desde la patilla y línea frontal milimétricamente escuadrada.',
    featuredSpan: true,
  },
  {
    id: 'lb-urban-razor-detail',
    title: 'Precisión Quirúrgica: Perfilado a Navaja Libre',
    category: 'Barba & Perfilado',
    imageUrl: '/src/assets/images/urban_barber_hands_detail_1793930883253.jpg',
    servicePerformed: '05. Perfilado de Barba a Navaja & Toalla Térmica',
    executionTime: '30 min',
    guardSpec: 'Ángulo de 30° con navaja japonesa · Toalla a vapor',
    productApplied: 'Aceite botánico pre-shave + Bálsamo amaderado',
    toolsUsed: 'Shavette Feather de acero · Navaja japonesa descartable',
    authorNote:
      'Detalle del pulso y tensión de piel necesarios para lograr líneas de mejilla y sien que se ven como trazadas con regla.',
  },
  {
    id: 'lb-urban-station-vibe',
    title: 'El Puesto del Estudio: Estación Subte Buenos Aires',
    category: 'Skin Fades',
    imageUrl: '/src/assets/images/urban_graffiti_mirror_1793930882309.jpg',
    servicePerformed: '03. Full Experience: Corte Urbano + Barba Esculpida',
    executionTime: '60 min',
    guardSpec: 'Espacio de trabajo 1 a 1 · Espejo con stickers urbanos',
    productApplied: 'Café de especialidad tostado & Cerveza fría',
    toolsUsed: 'Manta de cuero · Desinfección UV · Audio lo-fi envolvente',
    authorNote:
      'Paredes de hormigón expuesto, stickers de streetwear coleccionados y luz de neón. El ambiente donde la técnica se junta con el arte callejero.',
    featuredSpan: true,
  },
  {
    id: 'lb-urban-crop',
    title: 'Mid Fade & Crop Texturizado Clásico',
    category: 'Texturizados',
    imageUrl: '/src/assets/images/urban_textured_crop_1793929259231.jpg',
    servicePerformed: '01. Mid / Low Fade & Crop Texturizado',
    executionTime: '45 min',
    guardSpec: 'Guía 0.5 a navaja · Tijera de entresacar',
    productApplied: 'Polvo voluminizador mate + Cera al agua',
    toolsUsed: 'Babyliss Pro Gold FX · Tijera Kasho 5.5"',
    authorNote:
      'Desvanecido comprimido que arranca en 0 mm en la patilla y sube en diagonal. Cúspide picada en seco a tijera para caída con volumen natural.',
  },
  {
    id: 'lb-urban-taper',
    title: 'Low Taper Fade con Rulos Orgánicos',
    category: 'Tapers & Caída',
    imageUrl: '/src/assets/images/urban_taper_curls_1793929259459.jpg',
    servicePerformed: '02. Taper Fade & Line Up Quirúrgico',
    executionTime: '45 min',
    guardSpec: '0 mm nuca baja y patilla · Laterales con peso',
    productApplied: 'Crema definidora de rulos & Activador de ondas',
    toolsUsed: 'Wahl Cordless Senior · Peine Afro de Metal',
    authorNote:
      'El corte ideal para el que no quiere raparse los costados pero busca bordes ultra limpios. La masa de rulos arriba mantiene su identidad urbana.',
  },
  {
    id: 'lb-urban-platinum',
    title: 'Platinado Hielo & Buzz Cut Minimalista',
    category: 'Platinados & Buzz',
    imageUrl: '/src/assets/images/urban_platinum_buzz_1793929260240.jpg',
    servicePerformed: '04. Bleach & Buzz: Platinado Global Urbano',
    executionTime: '90 min',
    guardSpec: 'Rapado homogéneo al 2.5 + Detalle de ceja',
    productApplied: 'Matizador plata frío + Sérum de brillo anti-frizz',
    toolsUsed: 'Wahl Magic Clip · Pincel Framar · Navaja Feather',
    authorNote:
      'Doble proceso de decoloración sin castigar el cuero cabelludo. Tono blanco puro sin tonos mantecosos y detalle de ceja marcado al milímetro.',
  },
  {
    id: 'lb-urban-beard',
    title: 'Mid Fade con Barba Esculpida al Ras',
    category: 'Barba & Perfilado',
    imageUrl: '/src/assets/images/urban_beard_fade_1793929260672.jpg',
    servicePerformed: '03. Full Experience: Corte Urbano + Barba Esculpida',
    executionTime: '60 min',
    guardSpec: 'Desvanecido 0 a 2mm con conexión de patilla',
    productApplied: 'Bálsamo para barba Reuzel + Polvo Mate',
    toolsUsed: 'Babyliss FX Trimmer · Shavette de precisión · Shaver de titanio',
    authorNote:
      'La desconexión suave entre el fade del pelo y el degradé invertido de la barba estiliza la línea mandibular y da un look sobrio e impecable.',
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
    serviceTag: 'Taper Fade & Line Up',
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
    serviceTag: 'Corte de Pelo + Ritual de Barba',
    textParts: [
      { text: 'La ' },
      { text: 'toalla caliente y el afeitado a navaja libre', highlight: true },
      { text: ' te reinician el día. Cero espera, te sentás al minuto que reservaste en Vuelta de Obligado 931. El mejor de Venado Tuerto sin dudas.' },
    ],
  },
];
