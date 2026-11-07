import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { useStudio, normalizeSectionOrder } from '../context/StudioContext';
import { GalleryItemCategory } from '../data/studioData';
import { HomeSectionId } from '../data/studioStore';
import {
  formatPriceARS,
  getStudioLiveStatus,
  getNextAvailableSlotInfo,
  resolveInstagramInfo,
  resolveWhatsAppInfo,
} from '../utils/bookingEngine';
import { ThermalReceiptBooking } from '../components/ThermalReceiptBooking';
import { ClientVoices } from '../components/ClientVoices';
import {
  EditorialRotatingBanner,
  MaskRevealImage,
  MagneticButton,
  EditorialBeforeAfterSlider,
} from '../components/EditorialEffects';
import {
  Clock,
  MapPin,
  ArrowRight,
  Check,
  Navigation,
  MessageCircle,
  Instagram,
  Sparkles,
  Heart,
} from 'lucide-react';

const GALLERY_CATEGORIES: ('Todas' | GalleryItemCategory)[] = [
  'Todas',
  'Cortes & Fades',
  'El Estudio & Local',
  'Máquinas & Setup',
  'Color & Diseños',
  'Cultura & Streetwear',
];

const SECTION_TAB_LABELS: Record<HomeSectionId, string> = {
  booking: 'Reservar Turno',
  services: 'Catálogo de Servicios',
  beforeAfter: 'Antes & Después',
  gallery: 'Obras & Portafolio',
  reviews: 'Voces del Estudio',
  barber: 'El Estudio & Manifiesto',
  location: 'Ubicación & Horarios',
};

export const HomePage: React.FC = () => {
  const {
    config,
    services,
    galleryItems,
    appointments,
    blockedSlots,
    setSelectedServiceIds,
    setPreselectedSlot,
    likedGalleryIds,
    toggleLikeGalleryItem,
  } = useStudio();

  const visibleServices = useMemo(
    () => services.filter((s) => !s.hidden),
    [services]
  );

  const visibleGallery = useMemo(
    () => galleryItems.filter((g) => !g.hidden),
    [galleryItems]
  );

  // Active service in the Interactive Editorial Catalog
  const [focusedServiceId, setFocusedServiceId] = useState<string>(
    () => visibleServices[0]?.id || 'srv-01'
  );

  // Active category filter in Gallery
  const [selectedGalleryCategory, setSelectedGalleryCategory] =
    useState<'Todas' | GalleryItemCategory>('Todas');

  const filteredGallery = useMemo(() => {
    if (!config.showGalleryFilter || selectedGalleryCategory === 'Todas') {
      return visibleGallery;
    }
    return visibleGallery.filter((item) => item.category === selectedGalleryCategory);
  }, [visibleGallery, selectedGalleryCategory, config.showGalleryFilter]);

  const focusedService = useMemo(
    () =>
      visibleServices.find((s) => s.id === focusedServiceId) ||
      visibleServices[0],
    [visibleServices, focusedServiceId]
  );

  const liveStatus = useMemo(
    () =>
      getStudioLiveStatus(
        new Date(),
        config.openingHour,
        config.closingHour,
        config.openDays
      ),
    [
      config.openingHour,
      config.closingHour,
      config.openDays,
    ]
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

  // Ordered & active sections according to Admin Panel
  const activeOrderedSections = useMemo(() => {
    const order = normalizeSectionOrder(config.sectionOrder);
    const visibilityMap: Record<HomeSectionId, boolean> = {
      booking: config.showBookingSection !== false,
      services: config.showServicesSection !== false,
      beforeAfter: config.showBeforeAfterSection !== false,
      gallery: config.showGallerySection !== false,
      reviews: config.showReviewsSection !== false,
      barber: config.showBarberSection !== false,
      location: config.showLocationSection !== false,
    };
    return order.filter((secId) => visibilityMap[secId]);
  }, [
    config.sectionOrder,
    config.showBookingSection,
    config.showServicesSection,
    config.showBeforeAfterSection,
    config.showGallerySection,
    config.showReviewsSection,
    config.showBarberSection,
    config.showLocationSection,
  ]);

  const [activeTabSection, setActiveTabSection] = useState<HomeSectionId>(
    () => activeOrderedSections[0] || 'booking'
  );

  useEffect(() => {
    if (
      activeOrderedSections.length > 0 &&
      !activeOrderedSections.includes(activeTabSection)
    ) {
      setActiveTabSection(activeOrderedSections[0]);
    }
  }, [activeOrderedSections, activeTabSection]);

  // Smooth Parallax for Hero Portrait
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroImageY = useTransform(heroScroll, [0, 1], ['0%', '12%']);

  const scrollToTurnero = () => {
    if (config.layoutMode === 'tabs' && activeOrderedSections.includes('booking')) {
      setActiveTabSection('booking');
    }
    setTimeout(() => {
      const el = document.getElementById('turnero');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
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

  const handleBookNextSlot = () => {
    if (nextAvailableSlot) {
      setPreselectedSlot({
        date: nextAvailableSlot.dateISO,
        time: nextAvailableSlot.time,
      });
    }
    scrollToTurnero();
  };

  // Renderers for each section so Admin sectionOrder & layoutMode work seamlessly
  const renderBarberManifestoSection = () => (
    <section
      key="sec-barber"
      id="estudio"
      data-testid="section-barber"
      className="relative max-w-[1320px] mx-auto px-5 sm:px-8 py-20 lg:py-28 border-b border-[#171513]/12 scroll-mt-20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left 7 Columns: Wide Photographic Block with Curtain Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55 }}
          className="lg:col-span-7 relative"
        >
          <MaskRevealImage
            src={
              config.spaceImage ||
              '/src/assets/images/space_private_atelier_1793889688437.jpg'
            }
            alt={`Interior del estudio privado en ${config.address}, ${config.neighborhood}`}
            aspectClassName="aspect-[16/11] border border-[#171513]/15"
          />
          <p className="font-display italic text-xs text-[#655E57] mt-3">
            Fig. 02 — Nuestro espacio de atención individual en {config.address},{' '}
            {config.neighborhood}.
          </p>
        </motion.div>

        {/* Right 5 Columns: Overlapping Magazine Manifesto Sheet */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="lg:col-span-5 lg:-ml-12 relative z-10 bg-[#F7F4EE] border border-[#171513]/15 p-8 sm:p-10 lg:p-12 shadow-[0_20px_50px_rgba(23,21,19,0.06)] space-y-6"
        >
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#96734E] font-medium">
            <span>Manifiesto</span>
            <span aria-hidden="true">·</span>
            <span>El Estudio de {config.authorName}</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl font-medium text-[#171513] leading-[1.1] text-balance">
            Un refugio pensado para cortar con la prisa cotidiana.
          </h2>

          <p className="text-sm sm:text-base text-[#4A443E] leading-relaxed editorial-dropcap">
            {config.bio ||
              `Creemos que un buen corte nace de saber escuchar. En nuestro estudio de ${config.address} trabajamos exclusivamente con turnos individuales: sin salas de espera ruidosas, sin miradas apuradas y con el tiempo necesario para cuidar cada detalle.`}
          </p>

          <blockquote className="py-4 border-t border-b border-[#171513]/12 font-display italic text-xl text-[#171513]">
            “Si venís con una idea definida, la perfeccionamos; si buscás un cambio, diseñamos
            juntos el corte que mejor acompañe tus facciones.”
          </blockquote>

          <div className="space-y-3 pt-1 text-xs text-[#4A443E]">
            <div className="flex items-baseline justify-between border-b border-[#171513]/10 pb-2">
              <span className="font-semibold text-[#171513]">01. Trato uno a uno</span>
              <span>Puntualidad real y privacidad</span>
            </div>
            <div className="flex items-baseline justify-between border-b border-[#171513]/10 pb-2">
              <span className="font-semibold text-[#171513]">02. Oficio a medida</span>
              <span>Tijera, máquina y visagismo</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-semibold text-[#171513]">03. Ambiente relajado</span>
              <span>Café de cortesía y música suave</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );

  const renderServicesCatalogSection = () => (
    <section
      key="sec-services"
      id="servicios"
      data-testid="section-services"
      className="relative max-w-[1320px] mx-auto px-5 sm:px-8 py-20 lg:py-28 border-b border-[#171513]/12 scroll-mt-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.45 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#96734E] font-medium">
            <span>Carta del Estudio</span>
            <span aria-hidden="true">·</span>
            <span>Servicios Reales</span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-medium text-[#171513] leading-tight">
            Catálogo de Servicios
          </h2>
        </div>
        <p className="text-sm text-[#575049] max-w-md">
          Elegí el servicio que deseás realizar para ver su proceso detallado o preseleccionarlo
          directamente en el turnero.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left 7 Columns: Interactive Editorial Menu List */}
        <div className="lg:col-span-7 divide-y divide-[#171513]/15 border-t border-b border-[#171513]/15">
          {visibleServices.map((service, index) => {
            const isFocused = focusedService?.id === service.id;
            const showPrice = config.showServicePrice && !service.hidePrice;
            const showBuyBtn = config.showServiceBookingButton && !service.hideBuyButton;

            return (
              <motion.div
                key={service.id}
                data-testid={`catalog-service-${service.id}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                onMouseEnter={() => setFocusedServiceId(service.id)}
                onClick={() => setFocusedServiceId(service.id)}
                className={`py-7 px-5 sm:px-6 transition-colors duration-200 cursor-pointer ${
                  isFocused ? 'bg-[#EFEAE1]' : 'hover:bg-[#EFEAE1]/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-xs text-[#96734E] font-medium tabular-nums">
                      {service.index}.
                    </span>
                    <h3 className="font-display text-2xl sm:text-3xl font-medium text-[#171513] transition-colors">
                      {service.name}
                    </h3>
                  </div>

                  <div className="flex items-baseline gap-3 sm:shrink-0 pl-8 sm:pl-0">
                    {config.showServiceDuration && (
                      <span className="text-xs text-[#655E57] font-mono tabular-nums">
                        {service.durationMinutes} min
                      </span>
                    )}
                    {config.showServiceDuration && showPrice && (
                      <span className="text-[#C5BBAE]" aria-hidden="true">
                        ·
                      </span>
                    )}
                    {showPrice && (
                      <span className="font-mono text-lg font-semibold text-[#171513] tabular-nums">
                        {formatPriceARS(service.price)}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-[#4A443E] leading-relaxed mt-3 pl-8 max-w-2xl">
                  {service.shortDescription}
                </p>

                {/* Expandable Technical Detail & Direct Action */}
                <div className="mt-5 pl-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {config.showServiceProducts ? (
                    <span className="text-xs text-[#655E57] leading-relaxed">
                      Incluye:{' '}
                      <strong className="font-medium text-[#171513]">
                        {service.productsUsed}
                      </strong>
                    </span>
                  ) : (
                    <span />
                  )}

                  {showBuyBtn && (
                    <MagneticButton
                      testId={`catalog-book-${service.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectServiceAndBook(service.id);
                      }}
                      className="shrink-0 self-start sm:self-auto px-4 py-2 bg-[#171513] hover:bg-[#96734E] text-[#F7F4EE] text-xs font-medium uppercase tracking-wider transition-colors whitespace-nowrap"
                    >
                      <span>Elegir servicio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </MagneticButton>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right 5 Columns: Sticky Synchronized Visual Preview Card with Optical Blur Transition */}
        <div className="lg:col-span-5 lg:sticky lg:top-28">
          {focusedService && (
            <AnimatePresence mode="wait">
              <motion.div
                key={focusedService.id}
                initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                transition={{ duration: 0.28 }}
                className="bg-[#EFEAE1] border border-[#171513]/15 overflow-hidden shadow-[0_16px_44px_rgba(23,21,19,0.06)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#171513]">
                  <img
                    src={
                      focusedService.imageUrl ||
                      '/src/assets/images/lookbook_classic_scissoring_1793889690402.jpg'
                    }
                    alt={focusedService.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#171513]/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5 text-[#F7F4EE] flex items-baseline justify-between">
                    <span className="font-display text-2xl font-medium">
                      {focusedService.name}
                    </span>
                    {config.showServiceDuration && (
                      <span className="font-mono text-sm text-[#E4DDD1] tabular-nums">
                        {focusedService.durationMinutes} min
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 sm:p-7 space-y-5">
                  <div>
                    <span className="text-[11px] uppercase tracking-widest text-[#96734E] font-medium block mb-2">
                      Etapas de la sesión en el estudio
                    </span>
                    <ul className="space-y-2 text-xs text-[#4A443E]">
                      {focusedService.executionSteps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#3D4F43] shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-[#171513]/12 flex items-center justify-between gap-4">
                    {config.showServicePrice && !focusedService.hidePrice ? (
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-[#655E57] block">
                          Valor del servicio
                        </span>
                        <span className="font-mono text-xl font-semibold text-[#171513] tabular-nums">
                          {formatPriceARS(focusedService.price)}
                        </span>
                      </div>
                    ) : (
                      <div />
                    )}

                    {config.showServiceBookingButton && !focusedService.hideBuyButton && (
                      <MagneticButton
                        onClick={() => handleSelectServiceAndBook(focusedService.id)}
                        className="px-5 py-3 bg-[#171513] hover:bg-[#96734E] text-[#F7F4EE] text-xs font-medium uppercase tracking-wider transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Reservar este servicio</span>
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
    <EditorialBeforeAfterSlider
      key="sec-beforeAfter"
      onSelectServiceAndBook={handleSelectServiceAndBook}
    />
  );

  const renderGalleryPortfolioSection = () => (
    <section
      key="sec-gallery"
      id="obras"
      data-testid="section-gallery"
      className="relative max-w-[1320px] mx-auto px-5 sm:px-8 py-20 lg:py-28 border-b border-[#171513]/12 scroll-mt-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.45 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#96734E] font-medium">
            <span>Archivo Visual</span>
            <span aria-hidden="true">·</span>
            <span>Trabajos Reales</span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-medium text-[#171513] leading-tight">
            Obras &amp; Detalles de Autor
          </h2>
        </div>
        <p className="text-sm text-[#575049] max-w-md">
          Cortes a tijera, perfilados de barba e iluminaciones trabajadas en nuestro estudio de{' '}
          {config.neighborhood}.
        </p>
      </motion.div>

      {/* Optional Category Filter Bar (Controlled by config.showGalleryFilter in Admin) */}
      {config.showGalleryFilter && (
        <div className="flex flex-wrap items-center gap-2 mb-10">
          {GALLERY_CATEGORIES.map((cat) => {
            const isActive = selectedGalleryCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedGalleryCategory(cat)}
                className={`px-4 py-2 text-xs font-mono uppercase tracking-wider border transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#171513] text-[#F7F4EE] border-[#171513]'
                    : 'bg-[#EFEAE1] text-[#4A443E] border-[#171513]/15 hover:border-[#171513]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredGallery.slice(0, 9).map((item, idx) => {
          const showPriceBadge =
            config.showGalleryPriceBadge && !item.hidePrice && Boolean(item.priceLabel);
          const showBuyBtn =
            config.showGalleryBookingButton && !item.hideBuyButton;
          const showTechSpec =
            config.showGalleryTechnicalSpec && !item.hideSpec && Boolean(item.technicalSpec);
          const isLiked = Boolean(likedGalleryIds[item.id]);

          return (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: idx * 0.06 }}
              className="group bg-[#EFEAE1] border border-[#171513]/12 flex flex-col justify-between overflow-hidden"
            >
              <div>
                <MaskRevealImage
                  src={item.imageUrl}
                  alt={item.title}
                  aspectClassName="aspect-[4/3]"
                  imgClassName="group-hover:scale-105"
                >
                  {config.showGalleryLikes && (
                    <button
                      type="button"
                      aria-label={`Me gusta en ${item.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLikeGalleryItem(item.id);
                      }}
                      className="absolute top-3 right-3 z-30 px-2.5 py-1 bg-[#F7F4EE]/90 backdrop-blur-xs border border-[#171513]/15 text-[#171513] text-xs font-mono inline-flex items-center gap-1.5 cursor-pointer hover:bg-[#171513] hover:text-[#F7F4EE] transition-colors"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          isLiked ? 'fill-[#A65D43] text-[#A65D43]' : ''
                        }`}
                      />
                      <span>{item.likes}</span>
                    </button>
                  )}
                </MaskRevealImage>

                <div className="p-6 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-[#655E57]">
                    <span>{item.dateLabel}</span>
                    {showPriceBadge && (
                      <span className="font-mono text-[#171513] font-medium tabular-nums">
                        {item.priceLabel}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-2xl font-medium text-[#171513]">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4A443E] leading-relaxed">
                    {item.description}
                  </p>

                  {config.showGalleryTags && item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-mono text-[#655E57] bg-[#E4DDD1] px-2 py-0.5"
                        >
                          #{t.replace(/^#/, '')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {(showTechSpec || showBuyBtn) && (
                <div className="px-6 pb-6 pt-3 border-t border-[#171513]/10 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-[#655E57] truncate">
                    {showTechSpec ? item.technicalSpec : config.studioTitle}
                  </span>
                  {showBuyBtn && (
                    <button
                      type="button"
                      onClick={() =>
                        handleSelectServiceAndBook(
                          item.serviceId || visibleServices[0]?.id || 'srv-01'
                        )
                      }
                      className="text-xs font-medium uppercase tracking-wider text-[#96734E] hover:text-[#171513] inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <span>Reservar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </motion.article>
          );
        })}
      </div>
    </section>
  );

  const renderReviewsSection = () => (
    <div key="sec-reviews" data-testid="section-reviews">
      <ClientVoices />
    </div>
  );

  const renderBookingSection = () => (
    <section
      key="sec-booking"
      id="turnero"
      data-testid="section-booking"
      className="relative max-w-[1320px] mx-auto px-5 sm:px-8 py-20 lg:py-28 border-b border-[#171513]/12 scroll-mt-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.45 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#96734E] font-medium">
            <span>Agenda en Tiempo Real</span>
            <span aria-hidden="true">·</span>
            <span>{config.address}</span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-medium text-[#171513] leading-tight">
            Reservá tu lugar en el estudio
          </h2>
        </div>
        <p className="text-sm text-[#575049] max-w-md">
          Completá tu reserva en tres pasos simples o consultá tu turno activo ingresando tu
          número de WhatsApp.
        </p>
      </motion.div>

      <ThermalReceiptBooking />
    </section>
  );

  const renderLocationSection = () => (
    <section
      key="sec-location"
      id="ubicacion"
      data-testid="section-location"
      className="relative max-w-[1320px] mx-auto px-5 sm:px-8 py-20 lg:py-28 scroll-mt-20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
        {/* Left 5 Columns: Direct Local Information */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-8 bg-[#EFEAE1] border border-[#171513]/12 p-8 sm:p-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#96734E] font-medium">
              <MapPin className="w-3.5 h-3.5" />
              <span>Ubicación del Estudio</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-medium text-[#171513] leading-tight">
              {config.address}, {config.neighborhood}
            </h2>
            <p className="text-sm text-[#4A443E] leading-relaxed">
              Estudio privado de fácil acceso en {config.neighborhood}, con estacionamiento libre
              sobre la cuadra y atención puntual por turno.
            </p>
          </div>

          <dl className="space-y-4 text-sm border-t border-b border-[#171513]/12 py-6">
            <div>
              <dt className="text-xs uppercase tracking-wider text-[#655E57]">
                Horarios de atención
              </dt>
              <dd className="font-medium text-[#171513] mt-0.5">{config.scheduleDisplay}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-[#655E57]">
                WhatsApp directo
              </dt>
              <dd className="font-mono text-[#171513] mt-0.5">{waInfo.display}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-[#655E57]">Instagram</dt>
              <dd className="text-[#171513] mt-0.5">{igInfo.handle}</dd>
            </div>
            {config.transferAlias && (
              <div>
                <dt className="text-xs uppercase tracking-wider text-[#655E57]">
                  Alias para seña ({config.depositPercentage}%)
                </dt>
                <dd className="font-mono text-[#171513] mt-0.5">{config.transferAlias}</dd>
              </div>
            )}
          </dl>

          <div className="flex flex-wrap gap-3">
            <a
              href={config.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 bg-[#171513] hover:bg-[#96734E] text-[#F7F4EE] text-xs font-medium uppercase tracking-wider inline-flex items-center gap-2 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              <span>Abrir en Google Maps</span>
            </a>
            <a
              href={config.wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 border border-[#171513]/25 hover:border-[#171513] text-[#171513] text-xs font-medium uppercase tracking-wider inline-flex items-center gap-2 transition-colors"
            >
              <Navigation className="w-4 h-4 text-[#96734E]" />
              <span>Waze</span>
            </a>
            <a
              href={waInfo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 border border-[#171513]/25 hover:border-[#171513] text-[#171513] text-xs font-medium uppercase tracking-wider inline-flex items-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#3D4F43]" />
              <span>Consultar por WhatsApp</span>
            </a>
            <a
              href={igInfo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 border border-[#171513]/25 hover:border-[#171513] text-[#171513] text-xs font-medium uppercase tracking-wider inline-flex items-center gap-2 transition-colors"
            >
              <Instagram className="w-4 h-4 text-[#96734E]" />
              <span>Instagram</span>
            </a>
          </div>
        </div>

        {/* Right 7 Columns: Clean Architectural Location Map */}
        <div className="lg:col-span-7 relative min-h-[380px] bg-[#171513] border border-[#171513]/15 overflow-hidden flex flex-col justify-between p-8 text-[#F7F4EE]">
          <svg
            className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
            viewBox="0 0 800 500"
            preserveAspectRatio="xMidYMid slice"
            role="img"
            aria-label={`Plano de ubicación en ${config.address}, ${config.neighborhood}`}
          >
            <g stroke="#C8A97E" strokeWidth="1">
              <line x1="0" y1="100" x2="800" y2="100" />
              <line x1="0" y1="250" x2="800" y2="250" strokeWidth="2.5" />
              <line x1="0" y1="400" x2="800" y2="400" />
              <line x1="180" y1="0" x2="180" y2="500" />
              <line x1="400" y1="0" x2="400" y2="500" strokeWidth="2" />
              <line x1="620" y1="0" x2="620" y2="500" />
            </g>
            <circle
              cx="400"
              cy="250"
              r="48"
              fill="none"
              stroke="#C8A97E"
              strokeWidth="1.5"
              strokeDasharray="6 6"
            />
            <circle cx="400" cy="250" r="9" fill="#C8A97E" />
            <text
              x="418"
              y="242"
              fill="#F7F4EE"
              fontSize="13"
              fontFamily="monospace"
              letterSpacing="2"
            >
              {config.address.toUpperCase()}
            </text>
          </svg>

          <div className="relative z-10 flex items-center justify-between text-xs uppercase tracking-widest text-[#C8A97E]">
            <span>Plano de Referencia · {config.neighborhood}</span>
            <span className="font-mono">-33.7456, -61.9688</span>
          </div>

          <div className="relative z-10 bg-[#23201D]/90 backdrop-blur-md border border-[#F7F4EE]/15 p-6 max-w-md space-y-1.5">
            <span className="text-[11px] uppercase tracking-widest text-[#C8A97E] block">
              Punto de Encuentro
            </span>
            <p className="font-display text-2xl font-medium text-[#F7F4EE]">{config.address}</p>
            <p className="text-xs text-[#D8D0C5]">
              {config.neighborhood} · Atención personalizada con reserva previa.
            </p>
          </div>
        </div>
      </div>
    </section>
  );

  const renderSectionById = (secId: HomeSectionId) => {
    switch (secId) {
      case 'barber':
        return renderBarberManifestoSection();
      case 'services':
        return renderServicesCatalogSection();
      case 'beforeAfter':
        return renderBeforeAfterSection();
      case 'gallery':
        return renderGalleryPortfolioSection();
      case 'reviews':
        return renderReviewsSection();
      case 'booking':
        return renderBookingSection();
      case 'location':
        return renderLocationSection();
      default:
        return null;
    }
  };

  return (
    <div className="atelier-paper-surface text-[#171513] overflow-hidden">
      {/* 1. HERO EDITORIAL — ASYMMETRIC ATELIER COMPOSITION (Controlled by config.showHeroSection) */}
      {config.showHeroSection !== false && (
        <section
          ref={heroRef}
          id="inicio"
          data-testid="section-hero"
          className="relative max-w-[1320px] mx-auto px-5 sm:px-8 pt-10 pb-20 lg:pt-16 lg:pb-28 border-b border-[#171513]/12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Left 7 Columns: High-Contrast Serif Typography & Real-Time Availability */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 space-y-8"
            >
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-[#655E57] font-medium">
                <span className="text-[#96734E]">
                  {config.brandKicker || 'Estudio de Corte & Autor'}
                </span>
                <span aria-hidden="true">·</span>
                <span>{config.address}</span>
                <span aria-hidden="true">·</span>
                <span>{config.neighborhood}</span>
              </div>

              <h1 className="font-display text-5xl sm:text-6xl lg:text-[4.35rem] font-normal text-[#171513] leading-[1.03] tracking-tight text-balance">
                {config.tagline &&
                config.tagline !== 'El arte del corte a medida, en calma y sin apuros.' ? (
                  config.tagline
                ) : (
                  <>
                    El arte del corte a medida, en{' '}
                    <span className="italic font-normal text-[#96734E]">calma</span> y sin apuros.
                  </>
                )}
              </h1>

              <p className="text-base sm:text-lg text-[#4A443E] leading-relaxed max-w-xl font-normal">
                {config.heroSubtitle}
              </p>

              {/* Real-Time Next Open Slot Indicator */}
              {nextAvailableSlot && config.walkInStatus === 'available' ? (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleBookNextSlot}
                    className="group inline-flex flex-wrap items-center gap-3 px-4 py-3 bg-[#EFEAE1] hover:bg-[#E4DDD1] border border-[#171513]/15 transition-colors text-left cursor-pointer"
                  >
                    <span className="inline-flex items-center gap-2 text-xs font-mono text-[#171513]">
                      <Clock className="w-3.5 h-3.5 text-[#96734E]" />
                      <strong className="font-medium">{nextAvailableSlot.label}</strong>
                    </span>
                    <span className="text-xs font-medium uppercase tracking-wider text-[#96734E] group-hover:text-[#171513] inline-flex items-center gap-1">
                      <span>Reservar este horario</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </button>
                </div>
              ) : (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={scrollToTurnero}
                    className="inline-flex items-center gap-3 px-4 py-3 bg-[#EFEAE1] border border-[#171513]/15 text-xs font-mono text-[#655E57] cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 text-[#A65D43]" />
                    <span>Agenda de hoy completa · Consultar próximos días disponibles →</span>
                  </button>
                </div>
              )}

              {/* Primary CTA & Service Catalog Anchor */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <MagneticButton
                  onClick={scrollToTurnero}
                  className="px-8 py-4 bg-[#171513] hover:bg-[#96734E] text-[#F7F4EE] text-xs font-medium uppercase tracking-[0.16em] transition-colors duration-200"
                >
                  <span>Reservá tu lugar</span>
                  <ArrowRight className="w-4 h-4" />
                </MagneticButton>

                <a
                  href="#servicios"
                  className="px-6 py-4 border border-[#171513]/25 hover:border-[#171513] text-[#171513] text-xs font-medium uppercase tracking-[0.14em] transition-colors"
                >
                  Explorar servicios
                </a>
              </div>

              {/* Quiet Operational Strip */}
              <div className="pt-6 border-t border-[#171513]/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#575049]">
                <div>
                  <span className="uppercase tracking-wider text-[#8C8379] block mb-0.5">
                    Modalidad
                  </span>
                  <span className="font-medium text-[#171513]">
                    Atención individual uno a uno
                  </span>
                </div>
                <div>
                  <span className="uppercase tracking-wider text-[#8C8379] block mb-0.5">
                    Horarios de estudio
                  </span>
                  <span className="font-medium text-[#171513]">{config.scheduleDisplay}</span>
                </div>
                <div>
                  <span className="uppercase tracking-wider text-[#8C8379] block mb-0.5">
                    Estado actual
                  </span>
                  <span className="font-medium text-[#3D4F43]">
                    {config.walkInStatus === 'available'
                      ? liveStatus.headline
                      : 'Agenda de hoy completa'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Right 5 Columns: Asymmetric Editorial Portrait with Smooth Parallax & Curtain Reveal */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 relative"
            >
              <div className="relative overflow-hidden bg-[#EFEAE1] border border-[#171513]/15 aspect-[3/4] shadow-[0_24px_60px_rgba(23,21,19,0.08)]">
                <motion.img
                  style={{ y: config.enableParallax ? heroImageY : 0 }}
                  src={
                    config.heroImage ||
                    '/src/assets/images/hero_studio_portrait_1793889687375.jpg'
                  }
                  alt={`${config.authorName} realizando un corte a tijera con luz natural en ${config.neighborhood}`}
                  className="w-full h-[112%] -mt-[6%] object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#171513]/55 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-[#F7F4EE] flex items-end justify-between gap-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-widest text-[#E4DDD1] block">
                      Oficio &amp; Precisión · {config.authorName}
                    </span>
                    <p className="font-display italic text-xl">
                      Sastrería capilar en {config.neighborhood}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-[#E4DDD1] tabular-nums">
                    {config.mainPriceDisplay}
                  </span>
                </div>
              </div>

              <p className="font-display italic text-xs text-[#655E57] mt-3">
                Fig. 01 — Trabajo a tijera y peine con iluminación natural en {config.address}.
              </p>
            </motion.div>
          </div>
        </section>
      )}

      {/* ARCHITECTURAL PARALLAX ROTATING TICKER DIVIDER */}
      <EditorialRotatingBanner variant="divider" onBookClick={scrollToTurnero} />

      {/* DYNAMIC SECTIONS: FULL LANDING FLOW vs INDIVIDUAL TABS MODE */}
      {config.layoutMode === 'tabs' ? (
        <div>
          {/* Editorial Tab Navigation Bar */}
          <div className="max-w-[1320px] mx-auto px-5 sm:px-8 pt-10">
            <div
              role="tablist"
              aria-label="Secciones del estudio"
              className="flex flex-wrap items-center gap-2 border-b border-[#171513]/15 pb-4"
            >
              {activeOrderedSections.map((secId, idx) => {
                const isSelected = activeTabSection === secId;
                return (
                  <button
                    key={secId}
                    role="tab"
                    aria-selected={isSelected}
                    type="button"
                    onClick={() => setActiveTabSection(secId)}
                    className={`px-5 py-3 text-xs font-mono uppercase tracking-wider border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#171513] text-[#F7F4EE] border-[#171513]'
                        : 'bg-[#EFEAE1] text-[#4A443E] border-[#171513]/15 hover:border-[#171513]'
                    }`}
                  >
                    0{idx + 1}. {SECTION_TAB_LABELS[secId]}
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTabSection}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {renderSectionById(activeTabSection)}
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        <div>{activeOrderedSections.map((secId) => renderSectionById(secId))}</div>
      )}
    </div>
  );
};
