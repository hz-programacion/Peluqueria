import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { useStudio, normalizeSectionOrder } from '../context/StudioContext';
import { HomeSectionId } from '../data/studioStore';
import {
  formatPriceARS,
  getStudioLiveStatus,
  getNextAvailableSlotInfo,
  resolveInstagramInfo,
  resolveWhatsAppInfo,
  resolveTikTokInfo,
  resolveFacebookInfo,
  resolveYouTubeInfo,
} from '../utils/bookingEngine';
import { ThermalReceiptBooking } from '../components/ThermalReceiptBooking';
import { ClientVoices } from '../components/ClientVoices';
import { UrbanBeforeAfterSlider } from '../components/UrbanBeforeAfterSlider';
import { StudioMultiGallery } from '../components/StudioMultiGallery';
import { BarberProfileSection } from '../components/BarberProfileSection';
import { UrbanParallaxBackground } from '../components/UrbanParallaxBackground';
import { UrbanGraffitiMural } from '../components/UrbanGraffitiMural';
import { GraffitiDripTrail } from '../components/GraffitiDripTrail';
import { MagneticButton } from '../components/EditorialEffects';
import { RetroCornerBandaBookmark, RetroRiverCrestBadge } from '../components/RetroPaperBanda';
import {
  Clock,
  MapPin,
  ArrowRight,
  Check,
  Navigation,
  MessageCircle,
  Instagram,
  Sparkles,
  Scissors,
  Copy,
  Share2,
} from 'lucide-react';

const SECTION_TAB_LABELS: Record<HomeSectionId, string> = {
  booking: 'Sacar Turno',
  services: 'Servicios & Precios',
  beforeAfter: 'Antes & Después',
  gallery: 'Galería & Trabajos',
  reviews: 'Reseñas',
  barber: 'Conocé al Barbero',
  location: 'Ubicación & Horarios',
};

export const HomePage: React.FC = () => {
  const {
    config,
    updateConfig,
    services,
    appointments,
    blockedSlots,
    setSelectedServiceIds,
    setPreselectedSlot,
    setActiveSeoSection,
    triggerCurtainTransition,
  } = useStudio();

  const visibleServices = useMemo(
    () => services.filter((s) => !s.hidden),
    [services]
  );

  const [hoveredServiceId, setHoveredServiceId] = useState<string>(
    () => visibleServices[0]?.id || 'srv-01'
  );
  const [copiedKey, setCopiedKey] = useState<'alias' | 'address' | null>(null);

  const handleCopyText = (text: string, key: 'alias' | 'address') => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2200);
  };

  const orderedSections = useMemo(
    () => normalizeSectionOrder(config.sectionOrder),
    [config.sectionOrder]
  );

  const enabledSections = useMemo(() => {
    return orderedSections.filter((secId) => {
      if (secId === 'booking') return config.showBookingSection !== false;
      if (secId === 'services') return config.showServicesSection !== false;
      if (secId === 'beforeAfter') return config.showBeforeAfterSection !== false;
      if (secId === 'gallery') return config.showGallerySection !== false;
      if (secId === 'reviews') return config.showReviewsSection !== false;
      if (secId === 'barber') return config.showBarberSection !== false;
      if (secId === 'location') return config.showLocationSection !== false;
      return true;
    });
  }, [
    orderedSections,
    config.showBookingSection,
    config.showServicesSection,
    config.showBeforeAfterSection,
    config.showGallerySection,
    config.showReviewsSection,
    config.showBarberSection,
    config.showLocationSection,
  ]);

  const [activeTabSection, setActiveTabSection] = useState<HomeSectionId>(
    () => enabledSections[0] || 'booking'
  );

  useEffect(() => {
    if (
      enabledSections.length > 0 &&
      !enabledSections.includes(activeTabSection)
    ) {
      setActiveTabSection(enabledSections[0]);
    }
  }, [enabledSections, activeTabSection]);

  useEffect(() => {
    const mapAnchorToSecId: Record<string, HomeSectionId> = {
      turnero: 'booking',
      reservar: 'booking',
      servicios: 'services',
      transformaciones: 'beforeAfter',
      obras: 'gallery',
      opiniones: 'reviews',
      estudio: 'barber',
      ubicacion: 'location',
    };
    const onActivateSection = (e: Event) => {
      const detail = (e as CustomEvent<{ sectionId?: string }>).detail;
      const secId = detail?.sectionId ? mapAnchorToSecId[detail.sectionId] : undefined;
      if (secId && enabledSections.includes(secId)) {
        setActiveTabSection(secId);
      }
    };
    window.addEventListener('atelier:activate-home-section', onActivateSection);
    return () => window.removeEventListener('atelier:activate-home-section', onActivateSection);
  }, [enabledSections]);

  const liveStatus = useMemo(
    () =>
      getStudioLiveStatus(
        new Date(),
        config.openingHour,
        config.closingHour,
        config.openDays
      ),
    [config.openingHour, config.closingHour, config.openDays]
  );

  const nextAvailableSlot = useMemo(
    () =>
      getNextAvailableSlotInfo(
        appointments,
        blockedSlots,
        config.openingHour,
        config.closingHour,
        config.openDays,
        45 + config.cleanBufferMinutes
      ),
    [
      appointments,
      blockedSlots,
      config.openingHour,
      config.closingHour,
      config.openDays,
      config.cleanBufferMinutes,
    ]
  );

  const igInfo = resolveInstagramInfo(config.instagram);
  const waInfo = resolveWhatsAppInfo(config.phoneDisplay, config.whatsappRaw);
  const tkInfo = resolveTikTokInfo(config.tiktok);
  const fbInfo = resolveFacebookInfo(config.facebook);
  const ytInfo = resolveYouTubeInfo(config.youtube);

  // Parallax Scroll Hooks
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroImgY = useTransform(
    heroScroll,
    [0, 1],
    ['0%', config.enableParallax ? '10%' : '0%']
  );

  const scrollToTurnero = () => {
    setActiveSeoSection('turnero');
    if (config.layoutMode === 'tabs') {
      setActiveTabSection('booking');
    }
    setTimeout(() => {
      const target = document.getElementById('turnero');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 30);
  };

  const handleSelectServiceAndBook = (serviceId: string) => {
    setSelectedServiceIds([serviceId]);
    window.dispatchEvent(
      new CustomEvent('atelier:select-service-and-advance', {
        detail: { serviceId },
      })
    );
    scrollToTurnero();
  };

  const handleHeroQuickSlot = () => {
    if (nextAvailableSlot) {
      setPreselectedSlot({
        date: nextAvailableSlot.dateISO,
        time: nextAvailableSlot.time,
      });
    }
    scrollToTurnero();
  };

  const focusedService =
    visibleServices.find((s) => s.id === hoveredServiceId) ||
    visibleServices[0];

  // ============================================================================
  // DYNAMIC SECTION RENDERERS (Aged Paper & Subtle Retro Carmine Sash Aesthetic)
  // ============================================================================

  const renderBookingSection = () => (
    <section
      key="sec-booking"
      id="turnero"
      data-testid="section-booking"
      className="relative py-16 sm:py-24 scroll-mt-20 border-t border-[#C8BBA4]"
    >
      <div id="reservar" className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#9E2A2B] font-semibold">
              <span>Registro de Turnos en Vivo</span>
              <span aria-hidden="true">╱</span>
              <span className="text-[#5C5346]">{config.address}</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#181512] leading-tight">
              Reservá tu lugar en{' '}
              <span className="font-editorial italic font-normal text-[#9E2A2B]">
                {config.studioTitle}
              </span>
            </h2>
          </div>

          <p className="text-sm text-[#4F463B] max-w-[46ch] leading-relaxed">
            Elegí tu servicio, día y horario disponible en tres pasos o consultá tu turno confirmado
            con tu número de WhatsApp.
          </p>
        </div>

        <ThermalReceiptBooking />
      </div>
    </section>
  );

  const renderServicesCatalogSection = () => (
    <section
      key="sec-services"
      id="servicios"
      data-testid="section-services"
      className="relative max-w-7xl mx-auto px-4 sm:px-8 py-16 lg:py-24 z-10 border-t border-[#C8BBA4] scroll-mt-20"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#9E2A2B] font-semibold">
            <Scissors className="w-3.5 h-3.5 text-[#9E2A2B]" />
            <span>Carta de Oficio · {config.studioTitle}</span>
            <span aria-hidden="true">╱</span>
            <span className="text-[#5C5346]">Valores Oficiales en ARS</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#181512] leading-tight">
            Servicios{' '}
            <span className="font-editorial italic font-normal text-[#9E2A2B]">
              &amp; Tarifario de Época
            </span>
          </h2>
        </div>
        <p className="text-sm text-[#4F463B] max-w-[44ch]">
          Seleccioná cualquier servicio de la carta para preseleccionarlo directamente en el
          boleto de reserva online.
        </p>
      </div>

      {/* 12-Column Interactive Menu + Pinned Aged-Paper Service Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left 7 Columns: Aged-Paper Menu Rows */}
        <div className="lg:col-span-7 divide-y divide-[#D5C9B4] border border-[#C8BBA4] rounded-xl overflow-hidden bg-[#FAF6EE] shadow-[0_12px_32px_rgba(24,21,18,0.06)]">
          {visibleServices.map((service, idx) => {
            const isFocused = focusedService?.id === service.id;
            const showPrice = config.showServicePrice && !service.hidePrice;
            const showDuration = config.showServiceDuration;
            const showProducts =
              config.showServiceProducts && !service.hideProducts;
            const showBookBtn =
              config.showServiceBookingButton && !service.hideBuyButton;

            return (
              <motion.article
                key={service.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{
                  duration: 0.35,
                  delay: idx * 0.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
                onMouseEnter={() => setHoveredServiceId(service.id)}
                onFocus={() => setHoveredServiceId(service.id)}
                onClick={() => setHoveredServiceId(service.id)}
                className={`group py-5 sm:py-6 px-4 sm:px-7 transition-all duration-200 cursor-pointer ${
                  isFocused
                    ? 'bg-[#EFE7D6] border-l-[4px] border-l-[#9E2A2B]'
                    : 'hover:bg-[#F4EDE0]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 max-w-[52ch]">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded bg-[#EAE0CE] border border-[#C8BBA4] font-mono text-xs text-[#9E2A2B] font-bold">
                        {service.index}
                      </span>
                      <h3 className="font-display text-lg sm:text-2xl font-bold tracking-tight text-[#181512] group-hover:text-[#9E2A2B] transition-colors">
                        {service.name}
                      </h3>
                      {showDuration && (
                        <span className="text-xs font-mono text-[#6E6355] tabular-nums">
                          · {service.durationMinutes} min
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-[#4F463B] leading-relaxed">
                      {service.shortDescription}
                    </p>

                    {showProducts && service.productsUsed && (
                      <div className="pt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono text-[#6E6355]">
                        <span className="uppercase tracking-wider text-[#9E2A2B] font-semibold">
                          Insumos:
                        </span>
                        <span>{service.productsUsed}</span>
                      </div>
                    )}

                    {/* Mobile Inline Protocol Preview (< lg) when service is tapped */}
                    {isFocused && (
                      <div className="lg:hidden mt-3 pt-3 border-t border-dashed border-[#C8BBA4] space-y-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#9E2A2B] font-semibold block">
                          Protocolo en {config.studioTitle}:
                        </span>
                        <ul className="space-y-1 text-xs text-[#4F463B]">
                          {service.executionSteps.map((step, stepIdx) => (
                            <li key={stepIdx} className="flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-[#9E2A2B] shrink-0 mt-0.5" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Price & Direct Preselect Action */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#D5C9B4]">
                    {showPrice && (
                      <span className="font-mono text-xl font-bold text-[#181512] tabular-nums">
                        {formatPriceARS(service.price)}
                      </span>
                    )}

                    {showBookBtn && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectServiceAndBook(service.id);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#9E2A2B] hover:bg-[#822021] text-[#FAF6EE] text-xs font-mono font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap shadow-xs"
                      >
                        <span>Elegir turno</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Right 5 Columns: Sticky Aged-Paper Service Dossier Card */}
        <div className="lg:col-span-5 lg:sticky lg:top-28">
          {focusedService && (
            <AnimatePresence mode="wait">
              <motion.div
                key={focusedService.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="rounded-xl bg-[#FAF6EE] border border-[#C8BBA4] overflow-hidden shadow-[0_18px_40px_rgba(24,21,18,0.09)] relative"
              >
                <RetroCornerBandaBookmark size="md" />

                <div className="aspect-[16/10] overflow-hidden bg-[#E8DFCE] relative p-2.5 pb-0">
                  <div className="w-full h-full overflow-hidden rounded-t-lg border border-[#C8BBA4] relative">
                    <img
                      src={
                        focusedService.imageUrl ||
                        '/src/assets/images/urban_barber_hero_1793929257447.jpg'
                      }
                      alt={focusedService.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover sepia-[0.1] contrast-[1.03] transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181512]/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded bg-[#FAF6EE]/95 border border-[#C8BBA4] text-[11px] font-mono font-semibold uppercase tracking-wider text-[#181512]">
                        Ficha N° {focusedService.index}
                      </span>
                      {config.showServiceDuration && (
                        <span className="px-2.5 py-1 rounded bg-[#9E2A2B] font-mono text-xs text-[#FAF6EE] font-semibold tabular-nums">
                          {focusedService.durationMinutes} min
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-7 space-y-5">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#9E2A2B] font-semibold block mb-2.5">
                      Protocolo en {config.studioTitle}
                    </span>
                    <ul className="space-y-2 text-xs text-[#4F463B]">
                      {focusedService.executionSteps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#9E2A2B] shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-[#D5C9B4] flex items-center justify-between gap-4">
                    {config.showServicePrice && !focusedService.hidePrice ? (
                      <div>
                        <span className="text-[11px] font-mono uppercase tracking-wider text-[#6E6355] block">
                          Valor del servicio
                        </span>
                        <span className="font-mono text-2xl font-bold text-[#181512] tabular-nums">
                          {formatPriceARS(focusedService.price)}
                        </span>
                      </div>
                    ) : (
                      <div />
                    )}

                    {config.showServiceBookingButton && !focusedService.hideBuyButton && (
                      <MagneticButton
                        onClick={() => handleSelectServiceAndBook(focusedService.id)}
                        className="px-5 py-3 rounded bg-[#9E2A2B] hover:bg-[#822021] text-[#FAF6EE] text-xs font-mono font-semibold uppercase tracking-wider transition-colors shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Reservar ahora</span>
                      </MagneticButton>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );

  const renderBeforeAfterSection = () => (
    <div
      key="sec-beforeAfter"
      id="transformaciones"
      data-testid="section-beforeAfter"
      className="border-t border-[#C8BBA4] scroll-mt-20"
    >
      <UrbanBeforeAfterSlider />
    </div>
  );

  const renderGalleryPortfolioSection = () => (
    <section
      key="sec-gallery"
      id="obras"
      data-testid="section-gallery"
      className="relative max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-20 z-10 border-t border-[#C8BBA4] scroll-mt-20"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#9E2A2B] font-semibold mb-2">
            <span>Archivo Fotográfico en Papel</span>
            <span>╱</span>
            <span className="text-[#5C5346]">{config.studioTitle}</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#181512] leading-tight">
            Galería de Fotos{' '}
            <span className="font-editorial italic font-normal text-[#9E2A2B]">
              &amp; Postal del Estudio
            </span>
          </h2>
        </div>
        <p className="text-xs sm:text-sm font-mono text-[#4F463B] max-w-md">
          Mirá las fotos del estudio y trabajos realizados en {config.address}, o subí directamente
          nuevas fotos al álbum.
        </p>
      </div>
      <StudioMultiGallery />
    </section>
  );

  const renderReviewsSection = () => (
    <div
      key="sec-reviews"
      data-testid="section-reviews"
      className="border-t border-[#C8BBA4]"
    >
      <ClientVoices />
    </div>
  );

  const renderBarberManifestoSection = () => (
    <div
      key="sec-barber"
      id="estudio"
      data-testid="section-barber"
      className="border-t border-[#C8BBA4] scroll-mt-20"
    >
      <BarberProfileSection />
    </div>
  );

  const renderLocationSection = () => (
    <section
      key="sec-location"
      id="ubicacion"
      data-testid="section-location"
      className="relative max-w-7xl mx-auto px-4 sm:px-8 py-16 lg:py-24 z-10 border-t border-[#C8BBA4] scroll-mt-20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-6 space-y-6 bg-[#FAF6EE] border border-[#C8BBA4] rounded-xl p-6 sm:p-10 shadow-[0_14px_34px_rgba(24,21,18,0.06)] relative overflow-hidden">
          <RetroCornerBandaBookmark size="md" />

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#9E2A2B] font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              <span>Ubicación del Estudio · {config.studioTitle}</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#181512] leading-tight">
              {config.address}, {config.neighborhood}
            </h2>
            <p className="text-sm text-[#4F463B] max-w-[46ch] leading-relaxed">
              Estudio privado de fácil acceso en Venado Tuerto, Santa Fe, con estacionamiento libre
              sobre la cuadra y atención puntual por turno.
            </p>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#D5C9B4] text-sm">
            <div>
              <dt className="text-xs font-mono uppercase tracking-wider text-[#6E6355]">
                Horarios de atención
              </dt>
              <dd className="font-semibold text-[#181512] mt-1">
                {config.scheduleDisplay}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-mono uppercase tracking-wider text-[#6E6355]">
                WhatsApp directo
              </dt>
              <dd className="font-mono font-bold text-[#9E2A2B] mt-1">
                {waInfo.display}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-mono uppercase tracking-wider text-[#6E6355]">
                Dirección exacta
              </dt>
              <dd className="mt-1 flex items-center gap-2">
                <span className="font-semibold text-[#181512]">{config.address}</span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(`${config.address}, ${config.neighborhood}`, 'address')
                  }
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#EAE0CE] hover:bg-[#9E2A2B] text-[#181512] hover:text-[#FAF6EE] border border-[#C8BBA4] text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {copiedKey === 'address' ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-mono uppercase tracking-wider text-[#6E6355]">
                Alias para seña ({config.depositPercentage}%)
              </dt>
              <dd className="mt-1 flex items-center gap-2">
                <span className="font-mono font-bold text-[#181512]">
                  {config.transferAlias}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyText(config.transferAlias, 'alias')}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#EAE0CE] hover:bg-[#9E2A2B] text-[#181512] hover:text-[#FAF6EE] border border-[#C8BBA4] text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {copiedKey === 'alias' ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </dd>
            </div>
          </dl>

          <div className="pt-2 flex flex-wrap gap-2.5">
            <a
              href={config.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded bg-[#9E2A2B] hover:bg-[#822021] text-[#FAF6EE] text-xs font-mono font-semibold uppercase tracking-wider transition-colors shadow-[0_3px_0_#5E1516]"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Abrir en Google Maps</span>
            </a>

            <a
              href={config.wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-3 rounded border border-[#C8BBA4] bg-[#F3ECE0] hover:border-[#9E2A2B] text-[#181512] text-xs font-mono font-semibold uppercase tracking-wider transition-colors"
            >
              <span>Waze</span>
            </a>

            <a
              href={waInfo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-3 rounded border border-[#C8BBA4] bg-[#F3ECE0] hover:border-[#9E2A2B] text-[#181512] text-xs font-mono font-semibold uppercase tracking-wider transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#9E2A2B]" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Dedicated Social Media Channels Strip */}
          <div className="pt-4 border-t border-dashed border-[#C8BBA4] space-y-2.5">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#9E2A2B] font-semibold flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5" />
              Seguinos en Redes Sociales
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <a
                href={igInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] hover:border-[#9E2A2B] text-xs font-mono font-semibold text-[#181512] transition-colors"
              >
                <Instagram className="w-3.5 h-3.5 text-[#9E2A2B] shrink-0" />
                <span className="truncate">{igInfo.handle}</span>
              </a>

              <a
                href={tkInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] hover:border-[#9E2A2B] text-xs font-mono font-semibold text-[#181512] transition-colors"
              >
                <span className="text-[#9E2A2B] font-bold shrink-0">♪</span>
                <span className="truncate">TikTok</span>
              </a>

              <a
                href={fbInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] hover:border-[#9E2A2B] text-xs font-mono font-semibold text-[#181512] transition-colors"
              >
                <span className="text-[#9E2A2B] font-bold shrink-0">f</span>
                <span className="truncate">Facebook</span>
              </a>

              <a
                href={ytInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] hover:border-[#9E2A2B] text-xs font-mono font-semibold text-[#181512] transition-colors"
              >
                <span className="text-[#9E2A2B] font-bold shrink-0">▶</span>
                <span className="truncate">YouTube</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right 6 Columns: Aged-Paper Cartographic Plan with Subtle Diagonal Carmine Sash */}
        <div className="lg:col-span-6">
          <div className="relative min-h-[300px] sm:aspect-[16/11] bg-[#EAE0CE] border border-[#C8BBA4] rounded-xl overflow-hidden p-5 sm:p-7 flex flex-col justify-between shadow-[0_14px_34px_rgba(24,21,18,0.06)]">
            <RetroCornerBandaBookmark size="md" />

            <svg
              aria-label={`Plano de ubicación en ${config.address}, ${config.neighborhood}`}
              className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
              viewBox="0 0 600 420"
              fill="none"
            >
              {/* Subtle Diagonal Carmine Heritage Avenue ("La Banda") */}
              <polygon
                points="-40,60 40,-20 640,360 560,440"
                fill="#9E2A2B"
                fillOpacity="0.09"
              />
              <line
                x1="-40"
                y1="60"
                x2="560"
                y2="440"
                stroke="#9E2A2B"
                strokeWidth="1"
                strokeOpacity="0.3"
                strokeDasharray="6 4"
              />
              <line
                x1="40"
                y1="-20"
                x2="640"
                y2="360"
                stroke="#9E2A2B"
                strokeWidth="1"
                strokeOpacity="0.3"
                strokeDasharray="6 4"
              />

              {/* Vintage City Grid */}
              <line x1="0" y1="90" x2="600" y2="90" stroke="#B5A48B" strokeWidth="1" />
              <line x1="0" y1="210" x2="600" y2="210" stroke="#9E2A2B" strokeWidth="2.5" />
              <line x1="0" y1="330" x2="600" y2="330" stroke="#B5A48B" strokeWidth="1" />
              <line x1="140" y1="0" x2="140" y2="420" stroke="#B5A48B" strokeWidth="1" />
              <line x1="320" y1="0" x2="320" y2="420" stroke="#8C7A62" strokeWidth="2" />
              <line x1="480" y1="0" x2="480" y2="420" stroke="#B5A48B" strokeWidth="1" />
              <circle
                cx="320"
                cy="210"
                r="26"
                stroke="#9E2A2B"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <circle cx="320" cy="210" r="7" fill="#9E2A2B" />
              <text
                x="336"
                y="202"
                fill="#181512"
                fontSize="12"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {config.studioTitle.toUpperCase()} · {config.address.toUpperCase()}
              </text>
            </svg>

            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#5C5346]">
              <span className="px-2.5 py-1 rounded bg-[#FAF6EE] border border-[#C8BBA4] text-[#9E2A2B] font-semibold">
                Plano Catastral · Venado Tuerto, Santa Fe
              </span>
              <span className="bg-[#FAF6EE]/80 px-2 py-0.5 rounded border border-[#C8BBA4]">
                -33.7456, -61.9688
              </span>
            </div>

            <div className="relative z-10 bg-[#FAF6EE]/95 backdrop-blur-md border border-[#C8BBA4] rounded-lg p-4 sm:p-5 max-w-sm mt-16 sm:mt-0 shadow-sm">
              <div className="flex items-center gap-3">
                <RetroRiverCrestBadge size="sm" />
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#9E2A2B] font-semibold block">
                    Punto de Encuentro · {config.studioTitle}
                  </span>
                  <p className="font-display text-xl sm:text-2xl font-bold text-[#181512] mt-0.5">
                    {config.address}
                  </p>
                </div>
              </div>
              <p className="text-xs text-[#4F463B] mt-2">
                {config.neighborhood} · Atención personalizada uno a uno con reserva previa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const renderSectionById = (secId: HomeSectionId) => {
    switch (secId) {
      case 'booking':
        return renderBookingSection();
      case 'services':
        return renderServicesCatalogSection();
      case 'beforeAfter':
        return renderBeforeAfterSection();
      case 'gallery':
        return renderGalleryPortfolioSection();
      case 'reviews':
        return renderReviewsSection();
      case 'barber':
        return renderBarberManifestoSection();
      case 'location':
        return renderLocationSection();
      default:
        return null;
    }
  };

  return (
    <div className="relative bg-[#F3ECE0] text-[#181512] overflow-hidden">
      {/* Subtle Aged-Paper & Carmine Diagonal Weave Parallax Background */}
      <UrbanParallaxBackground />

      {/* Expressive Aerosol Drip Trail (Controlled by Admin config.enableDripTrail) */}
      {config.enableDripTrail && <GraffitiDripTrail />}

      {/* 1. HERO EN PAPEL ENVEJECIDO & LA BANDA SUTIL ("RODRIGO CUTSSS · ESTILO DE ÉPOCA") */}
      {config.showHeroSection !== false && (
        <section
          ref={heroRef}
          id="inicio"
          data-testid="section-hero"
          className="relative max-w-7xl mx-auto px-4 sm:px-8 pt-10 pb-16 lg:pt-14 lg:pb-22 z-10"
        >
          {/* Subtle Diagonal Carmine Sash Watermark */}
          <div className="absolute inset-0 -z-10 opacity-60 pointer-events-none overflow-hidden rounded-3xl">
            <UrbanGraffitiMural />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left 7 Columns: Vintage Print Typography & Aged-Paper Ticket Stub */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 space-y-6"
            >
              {/* Unboxed Vintage Print Kicker */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono uppercase tracking-[0.18em]">
                <span className="font-bold text-[#9E2A2B]">{config.studioTitle}</span>
                <span className="text-[#9E2A2B]" aria-hidden="true">
                  ╱
                </span>
                <span className="text-[#4F463B] font-medium">
                  {config.address}, {config.neighborhood}
                </span>
              </div>

              <h1
                style={{ textWrap: 'balance' }}
                className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#181512] leading-[1.04] tracking-tight"
              >
                {config.tagline ? (
                  <>
                    {config.tagline.split(',').map((chunk, i) =>
                      i === 0 ? (
                        <span key={i} className="block">
                          {chunk}
                          {config.tagline.includes(',') ? ',' : ''}
                        </span>
                      ) : (
                        <span
                          key={i}
                          className="block font-editorial italic font-normal text-[#9E2A2B] mt-1"
                        >
                          {chunk}
                        </span>
                      )
                    )}
                  </>
                ) : (
                  <>
                    Fades limpios,{' '}
                    <span className="font-editorial italic font-normal text-[#9E2A2B]">
                      textura real y oficio clásico
                    </span>{' '}
                    en cada corte.
                  </>
                )}
              </h1>

              <p className="text-base sm:text-lg text-[#4F463B] max-w-[54ch] leading-relaxed font-normal">
                {config.heroSubtitle}
              </p>

              {/* Real-Time Availability Aged-Paper Ticket Stub */}
              {nextAvailableSlot && config.walkInStatus === 'available' && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleHeroQuickSlot}
                    className="group inline-flex items-center gap-3 px-4 py-2.5 rounded bg-[#FAF6EE] border border-[#C8BBA4] border-l-4 border-l-[#9E2A2B] hover:border-[#9E2A2B] text-left transition-colors cursor-pointer shadow-xs"
                  >
                    <Clock className="w-3.5 h-3.5 text-[#9E2A2B] shrink-0" />
                    <span className="text-xs font-mono text-[#4F463B]">
                      <strong className="font-semibold text-[#181512]">
                        {nextAvailableSlot.label}
                      </strong>
                    </span>
                    <span className="text-xs font-mono text-[#9E2A2B] font-bold uppercase tracking-wider inline-flex items-center gap-1 pl-2 border-l border-[#D5C9B4]">
                      <span>Reservar ahora</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </button>
                </div>
              )}

              {/* Primary & Secondary Actions */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <MagneticButton
                  onClick={scrollToTurnero}
                  className="px-7 py-4 rounded bg-[#9E2A2B] hover:bg-[#822021] text-[#FAF6EE] border border-[#781D1E] shadow-[0_4px_0_#5E1516] text-xs font-mono font-semibold uppercase tracking-[0.16em] transition-all duration-200"
                >
                  <span>Sacar Turno Online</span>
                  <ArrowRight className="w-4 h-4" />
                </MagneticButton>

                {config.showServicesSection !== false && (
                  <a
                    href="#servicios"
                    onClick={(e) => {
                      if (config.layoutMode === 'tabs') {
                        e.preventDefault();
                        setActiveTabSection('services');
                      }
                    }}
                    className="inline-flex items-center gap-2 px-6 py-4 rounded border border-[#B8AA93] bg-[#FAF6EE] hover:border-[#9E2A2B] text-[#181512] text-xs font-mono font-semibold uppercase tracking-[0.16em] transition-colors"
                  >
                    <span>Ver precios ({config.mainPriceDisplay})</span>
                  </a>
                )}
              </div>

              {/* Studio Facts Bar on Aged Paper */}
              <div className="pt-6 border-t border-[#C8BBA4] grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-[#5C5346]">
                <div>
                  <span className="font-mono uppercase tracking-wider text-[#9E2A2B] font-semibold block mb-0.5">
                    Atención
                  </span>
                  <strong className="font-semibold text-[#181512]">
                    1 a 1 · Sin esperas
                  </strong>
                </div>
                <div>
                  <span className="font-mono uppercase tracking-wider text-[#9E2A2B] font-semibold block mb-0.5">
                    Horarios
                  </span>
                  <strong className="font-semibold text-[#181512]">
                    {config.scheduleDisplay}
                  </strong>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="font-mono uppercase tracking-wider text-[#9E2A2B] font-semibold block mb-0.5">
                    Estado hoy
                  </span>
                  <strong className="font-semibold text-[#181512]">
                    {liveStatus.availabilityLabel}
                  </strong>
                </div>
              </div>
            </motion.div>

            {/* Right 5 Columns: Mounted Vintage Photograph on Aged Cardstock with Subtle Carmine Sash */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5"
            >
              <div className="p-3 sm:p-4 rounded-xl bg-[#FAF6EE] border border-[#C8BBA4] shadow-[0_22px_50px_rgba(24,21,18,0.12)] relative">
                {/* Subtle Aged-Paper Corner Ribbon simulating River Plate's diagonal red sash */}
                <RetroCornerBandaBookmark size="lg" />

                <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-[#E8DFCE] border border-[#C8BBA4]">
                  <motion.img
                    style={{ y: heroImgY }}
                    src={
                      config.heroImage ||
                      '/src/assets/images/urban_barber_hero_1793929257447.jpg'
                    }
                    alt={`${config.authorName} en ${config.studioTitle}, ${config.neighborhood}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-[112%] object-cover object-center sepia-[0.12] contrast-[1.03] -mt-[4%]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#181512]/80 via-transparent to-transparent" />

                  <div className="absolute bottom-4 left-4 right-4 bg-[#FAF6EE]/95 backdrop-blur-md border border-[#C8BBA4] rounded-lg p-4 flex items-center justify-between gap-4 shadow-md">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#9E2A2B] font-bold block">
                        {config.studioTitle} · {config.authorName}
                      </span>
                      <p className="font-editorial italic text-lg text-[#181512]">
                        Oficio clásico y precisión actual
                      </p>
                    </div>
                    <span className="font-mono text-sm font-bold text-[#9E2A2B] tabular-nums shrink-0">
                      {config.mainPriceDisplay}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* INTERACTIVE VIEW NAVIGATION BAR (Allows switching between Continuous Scroll & App Curtain Tabs) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-2 pb-4 relative z-20">
        <div className="p-3 sm:p-4 rounded-xl bg-[#FAF6EE] border border-[#C8BBA4] shadow-[0_8px_24px_rgba(24,21,18,0.05)] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="Secciones del estudio"
            className="flex flex-wrap items-center gap-1.5"
          >
            {enabledSections.map((secId, idx) => {
              const isSelected =
                config.layoutMode === 'tabs'
                  ? activeTabSection === secId
                  : false;
              const anchorMap: Record<HomeSectionId, string> = {
                booking: 'turnero',
                services: 'servicios',
                beforeAfter: 'transformaciones',
                gallery: 'obras',
                reviews: 'opiniones',
                barber: 'estudio',
                location: 'ubicacion',
              };
              return (
                <button
                  key={secId}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => {
                    const label = SECTION_TAB_LABELS[secId];
                    triggerCurtainTransition(
                      label,
                      `${config.studioTitle} · ${config.address}`
                    );
                    setActiveTabSection(secId);
                    setActiveSeoSection(anchorMap[secId]);
                    if (config.layoutMode !== 'tabs') {
                      setTimeout(() => {
                        const el = document.getElementById(anchorMap[secId]);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 110);
                    }
                  }}
                  className={`relative px-3.5 py-2 rounded-lg text-[11px] font-mono font-semibold uppercase tracking-[0.12em] border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-[#9E2A2B] text-[#FAF6EE] border-[#9E2A2B] shadow-xs'
                      : 'bg-[#F3ECE0] text-[#4F463B] border-[#C8BBA4] hover:border-[#9E2A2B] hover:text-[#181512]'
                  }`}
                >
                  <span className="opacity-65 mr-1">0{idx + 1}.</span>
                  <span>{SECTION_TAB_LABELS[secId]}</span>
                </button>
              );
            })}
          </div>

          {/* Quick View Mode Toggle: Scroll Continuo vs. Modo App por Vistas */}
          <div className="flex items-center gap-1.5 self-start lg:self-auto shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#D5C9B4] w-full lg:w-auto justify-end">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#6E6355] mr-1">
              Navegación:
            </span>
            <button
              type="button"
              onClick={() => {
                triggerCurtainTransition(
                  'Flujo Continuo Editorial',
                  `${config.studioTitle} · Vista Completa`
                );
                updateConfig({ layoutMode: 'landing' });
              }}
              className={`px-3 py-1.5 rounded text-[11px] font-mono font-semibold uppercase tracking-wider border transition-colors cursor-pointer whitespace-nowrap ${
                (config.layoutMode || 'landing') === 'landing'
                  ? 'bg-[#181512] text-[#FAF6EE] border-[#181512]'
                  : 'bg-[#F3ECE0] text-[#4F463B] border-[#C8BBA4] hover:text-[#181512]'
              }`}
            >
              Continua
            </button>
            <button
              type="button"
              data-testid="toggle-app-tabs-mode"
              onClick={() => {
                triggerCurtainTransition(
                  SECTION_TAB_LABELS[activeTabSection],
                  `${config.studioTitle} · Modo App por Vistas`
                );
                updateConfig({ layoutMode: 'tabs' });
              }}
              className={`px-3 py-1.5 rounded text-[11px] font-mono font-semibold uppercase tracking-wider border transition-colors cursor-pointer whitespace-nowrap ${
                config.layoutMode === 'tabs'
                  ? 'bg-[#9E2A2B] text-[#FAF6EE] border-[#9E2A2B]'
                  : 'bg-[#F3ECE0] text-[#4F463B] border-[#C8BBA4] hover:text-[#181512]'
              }`}
            >
              Por Vistas (Telón)
            </button>
          </div>
        </div>
      </div>

      {/* LAYOUT MODE SWITCH: LANDING SCROLL VS ANIMATED CURTAIN TABS */}
      {config.layoutMode === 'tabs' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-16">
          <motion.div
            key={activeTabSection}
            initial={{ opacity: 0, y: 22, scale: 0.992 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            {renderSectionById(activeTabSection)}
          </motion.div>
        </div>
      ) : (
        <>{enabledSections.map((secId) => renderSectionById(secId))}</>
      )}

    </div>
  );
};
