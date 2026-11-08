import { StudioService } from '../data/studioData';
import { StudioConfig } from '../data/studioStore';

export type SeoViewKey =
  | 'home'
  | 'booking'
  | 'services'
  | 'beforeAfter'
  | 'lookbook'
  | 'reviews'
  | 'experience'
  | 'location'
  | 'admin';

export interface ResolvedSeoMetadata {
  viewKey: SeoViewKey;
  title: string;
  description: string;
  keywords: string;
  robots: string;
  ogType: 'website';
  ogTitle: string;
  ogDescription: string;
  ogSiteName: string;
  ogLocale: string;
  twitterCard: 'summary_large_image';
  twitterTitle: string;
  twitterDescription: string;
  canonicalPath: string;
  jsonLd: Record<string, unknown>;
}

/**
 * Maps any page route or section anchor ID to a canonical SeoViewKey.
 */
export function resolveSeoViewKey(
  currentPage: string,
  activeSectionId?: string | null
): SeoViewKey {
  if (currentPage === 'admin') return 'admin';
  if (currentPage === 'booking') return 'booking';
  if (currentPage === 'services') return 'services';
  if (currentPage === 'lookbook') return 'lookbook';
  if (currentPage === 'experience') return 'experience';
  if (currentPage === 'location') return 'location';

  if (activeSectionId) {
    const normalized = activeSectionId.replace(/^#/, '').trim().toLowerCase();
    if (normalized === 'turnero' || normalized === 'booking') return 'booking';
    if (normalized === 'servicios' || normalized === 'services') return 'services';
    if (normalized === 'transformaciones' || normalized === 'beforeafter')
      return 'beforeAfter';
    if (normalized === 'obras' || normalized === 'gallery' || normalized === 'lookbook')
      return 'lookbook';
    if (normalized === 'opiniones' || normalized === 'reviews') return 'reviews';
    if (
      normalized === 'estudio' ||
      normalized === 'barber' ||
      normalized === 'experience'
    )
      return 'experience';
    if (normalized === 'ubicacion' || normalized === 'location') return 'location';
  }

  return 'home';
}

/**
 * Pure function that builds unique, search-engine-optimized title, description,
 * social card tags, and Schema.org JSON-LD for each view of Rodrigo Cutsss.
 */
export function buildViewSeoMetadata(params: {
  viewKey: SeoViewKey;
  config: StudioConfig;
  services?: StudioService[];
  origin?: string;
}): ResolvedSeoMetadata {
  const { viewKey, config, services = [], origin = 'https://rodrigocutsss.com.ar' } =
    params;

  const studioTitle = config.studioTitle?.trim() || 'Rodrigo Cutsss';
  const address = config.address?.trim() || 'Vuelta de Obligado 931';
  const neighborhood = config.neighborhood?.trim() || 'Venado Tuerto, Santa Fe';
  const authorName = config.authorName?.trim() || 'Rodrigo';
  const mainPrice = config.mainPriceDisplay?.trim() || '$12.000 ARS';
  const schedule = config.scheduleDisplay?.trim() || 'Martes a Sábados · 11:00 a 21:00 hs';

  let title = `${studioTitle} — Peluquería y Barbería en Venado Tuerto`;
  let description = `Estudio privado de peluquería y barbería en ${address}, ${neighborhood}. Fades de precisión, corte a tijera, barba y turnos online 1 a 1.`;
  let canonicalPath = '/';
  let robots = 'index, follow, max-image-preview:large';
  let viewSpecificKeywords =
    'peluquería Venado Tuerto, barbería Venado Tuerto, corte de pelo, fade, barba';

  switch (viewKey) {
    case 'home': {
      title = `${studioTitle} — Peluquería y Barbería en Venado Tuerto`;
      description = `Estudio privado de peluquería y barbería en ${address}, ${neighborhood}. Fades de precisión, corte a tijera, barba y turnos online 1 a 1.`;
      canonicalPath = '/';
      viewSpecificKeywords = `${studioTitle}, peluquería Venado Tuerto, barbería Venado Tuerto, ${address}, corte de autor, fades`;
      break;
    }
    case 'booking': {
      title = `Reservar Turno Online | ${studioTitle} · Venado Tuerto`;
      description = `Sacá tu turno online en ${studioTitle} (${address}, ${neighborhood}). Elegí servicio, fecha y horario disponible en tiempo real sin esperas.`;
      canonicalPath = '/#turnero';
      viewSpecificKeywords = `sacar turno barbería Venado Tuerto, reservar turno ${studioTitle}, turnos peluquería ${address}`;
      break;
    }
    case 'services': {
      title = `Servicios y Precios (${mainPrice}) | ${studioTitle}`;
      description = `Conocé la carta de servicios y tarifas de ${studioTitle} en Venado Tuerto: Corte de Autor, Perfilado de Barba, Coloración e Iluminación.`;
      canonicalPath = '/#servicios';
      viewSpecificKeywords = `precios peluquería Venado Tuerto, valor corte de pelo ${studioTitle}, perfilado de barba, coloración`;
      break;
    }
    case 'beforeAfter': {
      title = `Transformaciones Antes y Después | ${studioTitle} VT`;
      description = `Mirá los cambios reales antes y después en ${studioTitle}, Venado Tuerto. Precisión en skin fades, diseño de barba y visagismo personalizado.`;
      canonicalPath = '/#transformaciones';
      viewSpecificKeywords = `antes y después corte de pelo, cambios de look Venado Tuerto, skin fade ${studioTitle}`;
      break;
    }
    case 'lookbook': {
      title = `Galería de Cortes y Trabajos | ${studioTitle} · Venado Tuerto`;
      description = `Explorá el archivo fotográfico de ${studioTitle} en ${address}, Venado Tuerto: fades limpios, texturas a tijera, platinados y nuestro estudio privado.`;
      canonicalPath = '/#obras';
      viewSpecificKeywords = `fotos de cortes de pelo hombre, galería barbería Venado Tuerto, platinados, low taper ${studioTitle}`;
      break;
    }
    case 'reviews': {
      title = `Opiniones y Reseñas de Clientes | ${studioTitle} VT`;
      description = `Leé las reseñas verificadas de clientes atendidos en ${studioTitle} (${address}, Venado Tuerto). Atención puntual 1 a 1 y cortes de precisión.`;
      canonicalPath = '/#opiniones';
      viewSpecificKeywords = `opiniones ${studioTitle}, reseñas peluquería Venado Tuerto, mejor barbería Venado Tuerto`;
      break;
    }
    case 'experience': {
      title = `Conocé a ${authorName} y El Estudio | ${studioTitle}`;
      description = `Conocé a ${authorName} y la filosofía de trabajo 1 a 1 de ${studioTitle} en ${address}, ${neighborhood}. Oficio clásico, máquinas de precisión y trato exclusivo.`;
      canonicalPath = '/#estudio';
      viewSpecificKeywords = `${authorName} barbero Venado Tuerto, estudio privado barbería, atención 1 a 1 ${studioTitle}`;
      break;
    }
    case 'location': {
      title = `Ubicación y Horarios: ${address} | ${studioTitle}`;
      description = `Encontrá a ${studioTitle} en ${address}, ${neighborhood}. Horario: ${schedule}. Consultá el plano de acceso, Google Maps, Waze y WhatsApp directo.`;
      canonicalPath = '/#ubicacion';
      viewSpecificKeywords = `dirección ${studioTitle}, ${address} Venado Tuerto, horarios peluquería Venado Tuerto, cómo llegar`;
      break;
    }
    case 'admin': {
      title = `Panel de Dirección Privado | ${studioTitle}`;
      description = `Gestión privada de agenda, turnos, fichas técnicas de clientes, caja diaria y configuración de ${studioTitle} en Venado Tuerto.`;
      canonicalPath = '/#/admin';
      robots = 'noindex, nofollow';
      viewSpecificKeywords = `${studioTitle} administración`;
      break;
    }
  }

  const visibleServices = services.filter((s) => !s.hidden);

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    name: studioTitle,
    description,
    url: `${origin.replace(/\/$/, '')}${canonicalPath}`,
    telephone: config.phoneDisplay || '+54 9 3462 55-4421',
    priceRange: mainPrice,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address,
      addressLocality: 'Venado Tuerto',
      addressRegion: 'Santa Fe',
      postalCode: 'S2600',
      addressCountry: 'AR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -33.7456,
      longitude: -61.9688,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: `${String(config.openingHour || 11).padStart(2, '0')}:00`,
        closes: `${String(config.closingHour || 21).padStart(2, '0')}:00`,
      },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `Carta de Servicios · ${studioTitle}`,
      itemListElement: visibleServices.map((srv) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: srv.name,
          description: srv.shortDescription,
        },
        price: String(srv.price),
        priceCurrency: 'ARS',
      })),
    },
  };

  return {
    viewKey,
    title,
    description,
    keywords: viewSpecificKeywords,
    robots,
    ogType: 'website',
    ogTitle: title,
    ogDescription: description,
    ogSiteName: studioTitle,
    ogLocale: 'es_AR',
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    canonicalPath,
    jsonLd,
  };
}
