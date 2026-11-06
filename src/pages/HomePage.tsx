import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useStudio } from '../context/StudioContext';
import { StudioService } from '../data/studioData';
import {
  Scissors,
  ArrowRight,
  Star,
  Barcode,
  Instagram,
  MessageCircle,
  MapPin,
  Navigation,
  Clock,
  Shield,
  Dices,
  Sparkles,
  X,
} from 'lucide-react';
import { BarberProfileSection } from '../components/BarberProfileSection';
import { StudioMultiGallery } from '../components/StudioMultiGallery';
import { ClientVoices } from '../components/ClientVoices';
import { ThermalReceiptBooking } from '../components/ThermalReceiptBooking';
import { UrbanGraffitiMural } from '../components/UrbanGraffitiMural';
import {
  formatPriceARS,
  resolveInstagramInfo,
  resolveWhatsAppInfo,
  getStudioLiveStatus,
} from '../utils/bookingEngine';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';

const sectionRevealVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
    },
  },
};

const cardItemVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: 'easeOut',
    },
  },
};

export const HomePage: React.FC = () => {
  const {
    config,
    services,
    navigateTo,
    setSelectedServiceIds,
    isAdminAuthenticated,
  } = useStudio();

  const [activeMuralStyle, setActiveMuralStyle] = useState<'cyber' | 'wildstyle' | 'drips'>('cyber');
  const [selectedServiceDrawer, setSelectedServiceDrawer] = useState<StudioService | null>(null);

  const igInfo = resolveInstagramInfo(config.instagram);
  const waInfo = resolveWhatsAppInfo(config.phoneDisplay, config.whatsappRaw);
  const liveStatus = getStudioLiveStatus(
    new Date(),
    config.openingHour,
    config.closingHour,
    config.openDays
  );

  const scrollToSection = (id: string) => {
    playMechanicalClick();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (id === 'reservar') {
      navigateTo('booking');
    } else if (id === 'galeria') {
      navigateTo('lookbook');
    }
  };

  const handleMuralStyleSelect = (style: 'cyber' | 'wildstyle' | 'drips') => {
    playMechanicalClick();
    setActiveMuralStyle(style);
    window.dispatchEvent(new CustomEvent('change-graffiti-style', { detail: { style } }));
  };

  const visibleServices = services.filter((s) => !s.hidden);

  return (
    <div className="relative space-y-16 md:space-y-24 pb-24 overflow-x-hidden">
      {/* GENERATIVE URBAN GRAFFITI MURAL IN HERO BACKGROUND */}
      <div className="absolute top-0 left-0 right-0 h-[960px] pointer-events-none z-0 overflow-hidden opacity-80">
        <UrbanGraffitiMural className="h-full w-full" showControls={false} />
      </div>

      {/* ========================================================================= */}
      {/* 01. PORTADA PRINCIPAL (CONTROLADA POR showHeroSection)                    */}
      {/* ========================================================================= */}
      {config.showHeroSection !== false && (
        <motion.section
          id="inicio"
          initial="hidden"
          animate="visible"
          variants={sectionRevealVariants}
          className="relative z-10 max-w-[1380px] mx-auto px-4 sm:px-6 pt-6 sm:pt-10 scroll-mt-24"
        >
          <div className="relative rounded-3xl bg-[#111318]/92 border border-[#232730] p-6 sm:p-10 lg:p-12 overflow-hidden shadow-2xl concrete-overlay">
            {/* Subtle top urban caution stripe accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-caution-stripes opacity-80" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              {/* Left Column: Artistic Urban Value Proposition & Booking/Contact Actions */}
              <motion.div
                variants={staggerContainerVariants}
                initial="hidden"
                animate="visible"
                className="lg:col-span-7 space-y-6"
              >
                <motion.div
                  variants={cardItemVariants}
                  className="flex flex-wrap items-center gap-2.5 font-mono text-xs text-zinc-400"
                >
                  <span className="text-[#D4A373] font-bold uppercase tracking-widest">
                    ESTUDIO DE AUTOR 1 A 1
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-zinc-200 font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-[#D4A373] text-[#D4A373]" />
                    5.0 ★ ({config.neighborhood})
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-zinc-300">{config.scheduleDisplay}</span>
                  {isAdminAuthenticated && (
                    <>
                      <span aria-hidden="true">·</span>
                      <button
                        type="button"
                        onClick={() => navigateTo('admin')}
                        className="inline-flex items-center gap-1 text-[#D4A373] hover:underline font-bold cursor-pointer"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Editar en Admin</span>
                      </button>
                    </>
                  )}
                </motion.div>

                {/* Main Expressive Urban Headline (No 'CERO PLANTILLAS') */}
                <motion.div variants={cardItemVariants} className="space-y-4">
                  <h1 className="font-display text-[clamp(2.35rem,4.7vw,4.25rem)] font-black uppercase leading-[0.96] tracking-tight text-white">
                    ARTE URBANO &amp; <br />
                    <span className="text-[#D4A373]">PRECISIÓN A MEDIDA.</span> <br />
                    CORTES &amp; FADES DE AUTOR.
                  </h1>
                </motion.div>

                <motion.p
                  variants={cardItemVariants}
                  className="text-base sm:text-lg text-zinc-300 max-w-2xl font-normal leading-relaxed"
                >
                  {config.heroSubtitle} Atención personalizada por{' '}
                  <strong className="text-white">{config.authorName}</strong> trabajando con
                  clippers de alta precisión, trimmers de cuchilla en T y shaver de lámina de
                  titanio 0.0 mm hipoalergénica.
                </motion.p>

                {/* Focused Action Group: Strictly Booking + Direct Contact (Instagram & WhatsApp) */}
                <motion.div
                  variants={cardItemVariants}
                  className="pt-2 flex flex-wrap items-center gap-3"
                >
                  <button
                    type="button"
                    onClick={() => scrollToSection('reservar')}
                    onMouseEnter={playMechanicalHover}
                    className="px-7 py-4 bg-[#D4A373] hover:bg-[#C89562] text-zinc-950 font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2.5 cursor-pointer shadow-lg active:scale-95 whitespace-nowrap shrink-0"
                  >
                    <Scissors className="w-4 h-4" />
                    <span>Sacar Turno Online ({config.mainPriceDisplay})</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  <a
                    href={igInfo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={playMechanicalHover}
                    onClick={playMechanicalClick}
                    className="px-5 py-4 border border-[#2C313C] bg-[#161920] hover:border-[#D4A373] text-zinc-200 hover:text-white rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 active:scale-95 whitespace-nowrap shrink-0"
                  >
                    <Instagram className="w-4 h-4 text-[#D4A373]" />
                    <span>{igInfo.handle}</span>
                  </a>

                  <a
                    href={`${waInfo.url}?text=${encodeURIComponent(
                      `Hola ${config.authorName}! Vi tu web de ${config.studioTitle} y quiero coordinar un turno.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={playMechanicalHover}
                    onClick={playMechanicalClick}
                    className="px-5 py-4 border border-[#2C313C] bg-[#161920] hover:border-[#D4A373] text-zinc-200 hover:text-white rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 active:scale-95 whitespace-nowrap shrink-0"
                  >
                    <MessageCircle className="w-4 h-4 text-[#D4A373]" />
                    <span>WhatsApp</span>
                  </a>
                </motion.div>
              </motion.div>

              {/* Right Column: Studio Portrait + Interactive Urban Mural Controller */}
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.65, delay: 0.15, ease: 'easeOut' }}
                className="lg:col-span-5 relative"
              >
                <div className="relative rounded-2xl overflow-hidden border border-[#282D37] bg-[#0C0E12] min-h-[460px] shadow-2xl group">
                  <img
                    src="/src/assets/images/urban_barber_hero_1793929257447.jpg"
                    alt={`${config.authorName} trabajando en su estudio privado en ${config.neighborhood}`}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />

                  {/* Top Studio Overlay Header */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    <div className="bg-[#0A0B0E]/90 border border-[#282D37] backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg">
                      <span className="text-[10px] font-mono font-bold text-[#D4A373] block tracking-wider uppercase">
                        ESTUDIO PRIVADO
                      </span>
                      <span className="text-xs font-mono text-white font-bold">
                        {config.address}
                      </span>
                    </div>
                    <span className="px-3 py-1.5 bg-[#D4A373] text-zinc-950 font-mono font-black text-[10px] rounded-lg uppercase shadow-md">
                      {liveStatus.isOpen ? 'ABIERTO AHORA' : 'AGENDA ONLINE'}
                    </span>
                  </div>

                  {/* Bottom Interactive Urban Mural & Equipment Panel (Zero duplicate social links) */}
                  <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-[#0A0B0E] via-[#0A0B0E]/92 to-transparent space-y-3 z-10">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="text-[#D4A373] block text-[10px] font-bold uppercase tracking-wider">
                          EQUIPAMIENTO DE PRECISIÓN
                        </span>
                        <span className="text-zinc-200 font-bold block text-xs">
                          Clippers Cordless · Trimmer Cuchilla T · Shaver 0.0mm
                        </span>
                      </div>
                    </div>

                    {/* Interactive Urban Graffiti Mural Switcher */}
                    <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#D4A373]" />
                        <span>Efecto Mural:</span>
                      </span>

                      <div className="flex items-center gap-1">
                        {(
                          [
                            { id: 'cyber', label: 'Stencil' },
                            { id: 'wildstyle', label: 'Wildstyle' },
                            { id: 'drips', label: 'Drips' },
                          ] as const
                        ).map((st) => (
                          <button
                            key={st.id}
                            type="button"
                            onMouseEnter={playMechanicalHover}
                            onClick={() => handleMuralStyleSelect(st.id)}
                            className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold uppercase transition-colors cursor-pointer whitespace-nowrap ${
                              activeMuralStyle === st.id
                                ? 'bg-[#D4A373] text-zinc-950'
                                : 'bg-[#161920] border border-[#282D37] text-zinc-300 hover:border-[#D4A373]/50'
                            }`}
                          >
                            {st.label}
                          </button>
                        ))}
                        <button
                          type="button"
                          onMouseEnter={playMechanicalHover}
                          onClick={() => {
                            playMechanicalClick();
                            window.dispatchEvent(new CustomEvent('regenerate-graffiti-mural'));
                          }}
                          aria-label="Generar nuevo arte mural"
                          title="Generar nuevo arte mural"
                          className="p-1.5 rounded-lg bg-[#161920] border border-[#282D37] text-[#D4A373] hover:border-[#D4A373] transition-colors cursor-pointer"
                        >
                          <Dices className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Artistic Urban Street Ribbon */}
          <div className="mt-6 rounded-2xl border border-[#232730] bg-[#0E1015]/90 px-5 py-3 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] text-zinc-400">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[#D4A373] font-bold uppercase">RODRIGO CUTSSS ATELIER</span>
              <span aria-hidden="true">·</span>
              <span>CORTES DE AUTOR</span>
              <span aria-hidden="true">·</span>
              <span>SKIN &amp; TAPER FADES 0.0MM</span>
              <span aria-hidden="true">·</span>
              <span>COLORIMETRÍA &amp; PLATINADOS</span>
              <span aria-hidden="true">·</span>
              <span>BARBA AL VAPOR</span>
            </div>
            <span className="text-zinc-300 font-bold tabular-nums">
              SERVICIO PRINCIPAL: {config.mainPriceDisplay}
            </span>
          </div>
        </motion.section>
      )}

      {/* ========================================================================= */}
      {/* 02. CARTA DE SERVICIOS & PRECIOS (CONTROLADA POR showServicesSection)     */}
      {/* ========================================================================= */}
      {config.showServicesSection !== false && (
        <motion.section
          id="servicios"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={sectionRevealVariants}
          className="relative z-10 max-w-[1380px] mx-auto px-4 sm:px-6 scroll-mt-24"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#232730]">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#D4A373] font-bold mb-2">
                <span>MENÚ DE SERVICIOS</span>
                <span aria-hidden="true">·</span>
                <span className="text-zinc-400">VALORES CLAROS &amp; TIEMPO DEDICADO</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
                Cortes, Fades, Color &amp; Barba
              </h2>
            </div>
            <p className="text-xs font-mono text-zinc-400 max-w-md">
              Seleccioná cualquier servicio para agendar tu turno directo o abrí su ficha técnica para ver el paso a paso.
            </p>
          </div>

          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {visibleServices.map((srv) => {
              const showPrice = config.showServicePrice && !srv.hidePrice;
              const showProducts = config.showServiceProducts && !srv.hideProducts;
              const showBuyBtn = config.showServiceBookingButton && !srv.hideBuyButton;

              return (
                <motion.div
                  key={srv.id}
                  variants={cardItemVariants}
                  whileHover={{ y: -4 }}
                  className="bg-[#111318] border border-[#232730] rounded-2xl p-6 flex flex-col justify-between hover:border-[#D4A373]/60 transition-colors group relative overflow-hidden shadow-xl bg-halftone-grid"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-3">
                      <span className="text-[#D4A373] font-bold">
                        {srv.index}. {srv.category}
                        {config.showServiceDuration ? ` · ${srv.durationMinutes} min` : ''}
                      </span>
                      {showPrice && (
                        <span className="text-xl font-black text-white font-mono tabular-nums">
                          {formatPriceARS(srv.price)}
                        </span>
                      )}
                    </div>

                    <h3 className="font-display text-xl font-bold text-white group-hover:text-[#D4A373] transition-colors mb-2">
                      {srv.name}
                    </h3>

                    {srv.popularTag && (
                      <p className="mb-2.5 text-[#D4A373] text-[11px] font-mono font-bold uppercase tracking-wider">
                        ★ {srv.popularTag}
                      </p>
                    )}

                    <p className="text-xs text-zinc-300 leading-relaxed mb-5">
                      {srv.shortDescription}
                    </p>

                    {showProducts && (
                      <div className="p-3 bg-[#0C0E12]/95 border border-[#1E222B] rounded-xl mb-5 text-xs font-mono">
                        <span className="text-[10px] text-zinc-500 block uppercase font-bold mb-0.5">
                          Máquinas &amp; Productos:
                        </span>
                        <span className="text-zinc-300 font-medium">{srv.productsUsed}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#1E222B] flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        playMechanicalClick();
                        setSelectedServiceDrawer(srv);
                      }}
                      onMouseEnter={playMechanicalHover}
                      className="text-xs font-mono text-zinc-400 hover:text-white underline underline-offset-4 cursor-pointer whitespace-nowrap"
                    >
                      Ficha técnica
                    </button>

                    {showBuyBtn && (
                      <button
                        type="button"
                        onClick={() => {
                          playMechanicalClick();
                          setSelectedServiceIds([srv.id]);
                          scrollToSection('reservar');
                        }}
                        onMouseEnter={playMechanicalHover}
                        className="px-4 py-2.5 bg-[#D4A373] hover:bg-[#C89562] text-zinc-950 font-mono text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
                      >
                        Seleccionar Turno
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.section>
      )}

      {/* ========================================================================= */}
      {/* 03. RESERVA DE TURNO & TICKET EN VIVO (CONTROLADA POR showBookingSection) */}
      {/* ========================================================================= */}
      {config.showBookingSection !== false && (
        <motion.section
          id="reservar"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={sectionRevealVariants}
          className="relative z-10 max-w-[1380px] mx-auto px-4 sm:px-6 scroll-mt-24"
        >
          <div className="mb-8 pb-4 border-b border-[#232730]">
            <div className="flex items-center gap-2 mb-2 font-mono text-xs">
              <span className="text-[#D4A373] font-bold uppercase tracking-widest">
                AGENDA EN VIVO
              </span>
              <span aria-hidden="true">·</span>
              <Barcode className="w-4 h-4 text-[#D4A373]" />
              <span className="uppercase tracking-widest text-zinc-400 font-bold">
                RESERVA ONLINE CON CONFIRMACIÓN POR WHATSAPP
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Sacá tu Turno en Vivo
            </h2>
            <p className="text-zinc-400 text-sm mt-1 max-w-2xl">
              Elegí tu servicio, fecha (por defecto hoy) y horario disponible en{' '}
              <strong className="text-zinc-200">{config.address}</strong>. Los horarios libres se
              actualizan al instante según las reservas o cancelaciones.
            </p>
          </div>

          <ThermalReceiptBooking />
        </motion.section>
      )}

      {/* ========================================================================= */}
      {/* 04. GALERÍA DE TRABAJOS (CONTROLADA POR showGallerySection)               */}
      {/* ========================================================================= */}
      {config.showGallerySection !== false && (
        <motion.section
          id="galeria"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={sectionRevealVariants}
          className="relative z-10 max-w-[1380px] mx-auto px-4 sm:px-6 scroll-mt-24"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#232730]">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#D4A373] font-bold mb-2">
                <span>PORTFOLIO &amp; LOCAL</span>
                <span aria-hidden="true">·</span>
                <span className="text-zinc-400">TRABAJOS REALES DEL ESTUDIO</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
                Galería de Trabajos &amp; Espacio
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-mono text-zinc-400 max-w-md">
              Cortes, fades, el estudio en {config.address} y nuestras herramientas de precisión.
            </p>
          </div>

          <StudioMultiGallery />
        </motion.section>
      )}

      {/* ========================================================================= */}
      {/* 05. EL BARBERO & EL ESTUDIO (CONTROLADA POR showBarberSection)            */}
      {/* ========================================================================= */}
      {config.showBarberSection !== false && <BarberProfileSection />}

      {/* ========================================================================= */}
      {/* 06. OPINIONES DE CLIENTES (CONTROLADA POR showReviewsSection)             */}
      {/* ========================================================================= */}
      {config.showReviewsSection !== false && (
        <motion.div
          id="opiniones"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={sectionRevealVariants}
          className="scroll-mt-24"
        >
          <ClientVoices />
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* 07. UBICACIÓN, MAPA URBANO & HORARIOS (CONTROLADA POR showLocationSection) */}
      {/* ========================================================================= */}
      {config.showLocationSection !== false && (
        <motion.section
          id="ubicacion"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={sectionRevealVariants}
          className="relative z-10 max-w-[1380px] mx-auto px-4 sm:px-6 scroll-mt-24"
        >
          <div className="rounded-3xl bg-[#111318] border border-[#232730] p-6 sm:p-10 shadow-2xl space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#1E222B]">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#D4A373] font-bold block mb-1">
                  UBICACIÓN &amp; HORARIOS DE ATENCIÓN
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
                  {config.address} · {config.neighborhood}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <a
                  href={config.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4A373] text-zinc-950 font-mono text-xs font-black uppercase tracking-wider hover:bg-[#C89562] transition-colors whitespace-nowrap"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Abrir Google Maps</span>
                </a>
                <a
                  href={config.wazeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#161920] border border-[#282D37] text-zinc-200 hover:border-[#D4A373] font-mono text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#D4A373]" />
                  <span>Abrir Waze</span>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Info Cards */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-4 font-mono text-xs">
                <div className="p-5 rounded-2xl bg-[#0C0E12] border border-[#1E222B] space-y-1.5">
                  <span className="text-[#D4A373] font-bold uppercase block">
                    01. DIRECCIÓN DEL ESTUDIO
                  </span>
                  <p className="font-display text-xl font-bold text-white">{config.address}</p>
                  <p className="text-zinc-400">{config.neighborhood}</p>
                  <p className="text-zinc-500 text-[11px]">
                    Estudio privado 1 a 1 con fácil estacionamiento en la cuadra.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#0C0E12] border border-[#1E222B] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[#D4A373] font-bold uppercase">
                      02. HORARIOS DE CORTE
                    </span>
                    <Clock className="w-3.5 h-3.5 text-[#D4A373]" />
                  </div>
                  <p className="font-display text-xl font-bold text-white">
                    {config.scheduleDisplay}
                  </p>
                  <p className="text-zinc-400">{liveStatus.headline}</p>
                  <p className="text-zinc-500 text-[11px]">
                    Tolerancia máxima: {config.maxCourtesyMinutes} minutos entre turnos.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#0C0E12] border border-[#1E222B] space-y-1.5">
                  <span className="text-[#D4A373] font-bold uppercase block">
                    03. CANALES DIRECTOS &amp; SEÑAS
                  </span>
                  <p className="text-white font-bold">Instagram: {igInfo.handle}</p>
                  <p className="text-white font-bold">WhatsApp: {waInfo.display}</p>
                  <p className="text-zinc-500 text-[11px]">
                    Alias para señas:{' '}
                    <strong className="text-zinc-300">{config.transferAlias}</strong>
                  </p>
                </div>
              </div>

              {/* Right Interactive Urban Street Map */}
              <div className="lg:col-span-7">
                <div className="relative h-full min-h-[340px] rounded-2xl overflow-hidden border border-[#232730] bg-[#0C0E12] p-5 flex flex-col justify-between shadow-xl">
                  <svg
                    viewBox="0 0 800 450"
                    aria-label="Mapa urbano de Vuelta de Obligado 931, Venado Tuerto, Santa Fe"
                    className="absolute inset-0 w-full h-full object-cover opacity-85"
                  >
                    <rect width="800" height="450" fill="#0B0D11" />
                    <g stroke="#1E222B" strokeWidth="1.5" fill="#12151C">
                      <rect x="40" y="30" width="190" height="160" rx="4" />
                      <rect x="260" y="30" width="220" height="160" rx="4" />
                      <rect x="510" y="30" width="240" height="160" rx="4" />
                      <rect x="40" y="230" width="190" height="180" rx="4" />
                      <rect x="260" y="230" width="220" height="180" rx="4" />
                      <rect x="510" y="230" width="240" height="180" rx="4" />
                    </g>
                    <line
                      x1="0"
                      y1="210"
                      x2="800"
                      y2="210"
                      stroke="#D4A373"
                      strokeWidth="2.5"
                      strokeOpacity="0.85"
                    />
                    <line
                      x1="245"
                      y1="0"
                      x2="245"
                      y2="450"
                      stroke="#3A3F4D"
                      strokeWidth="1.5"
                      strokeOpacity="0.4"
                    />
                    <line
                      x1="495"
                      y1="0"
                      x2="495"
                      y2="450"
                      stroke="#3A3F4D"
                      strokeWidth="1.5"
                      strokeOpacity="0.4"
                    />
                    <text
                      x="65"
                      y="202"
                      fill="#D4A373"
                      fontSize="11"
                      fontFamily="JetBrains Mono, monospace"
                      letterSpacing="2"
                      fontWeight="bold"
                    >
                      CALLE VUELTA DE OBLIGADO (N° 931)
                    </text>
                    <circle cx="370" cy="210" r="28" fill="#D4A373" fillOpacity="0.2" />
                    <circle cx="370" cy="210" r="9" fill="#D4A373" />
                    <circle cx="370" cy="210" r="3.5" fill="#0A0B0E" />
                  </svg>

                  <div className="relative z-10 flex items-center justify-between text-xs font-mono">
                    <span className="px-3 py-1.5 rounded-lg bg-[#0A0B0E]/90 border border-[#282D37] text-white font-bold">
                      VENADO TUERTO · SANTA FE
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-[#0A0B0E]/90 border border-[#D4A373]/40 text-[#D4A373] font-bold">
                      {config.studioTitle.toUpperCase()}
                    </span>
                  </div>

                  <div className="relative z-10 p-4 rounded-xl bg-[#0A0B0E]/90 border border-[#282D37] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
                    <div>
                      <p className="font-display text-lg font-bold">{config.address}</p>
                      <p className="text-xs font-mono text-zinc-400">
                        {config.neighborhood} · Estudio exclusivo con reserva previa
                      </p>
                    </div>
                    <span className="font-mono text-xs text-[#D4A373] font-bold tabular-nums">
                      -33.7456, -61.9688
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* ========================================================================= */}
      {/* INLINE SERVICE TECHNICAL SPEC DRAWER                                      */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedServiceDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedServiceDrawer(null)}
            className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[#111318] border-l border-[#282D37] text-white h-full p-6 md:p-8 overflow-y-auto flex flex-col justify-between shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#1E222B]">
                  <span className="font-mono text-xs font-bold text-[#D4A373]">
                    FICHA TÉCNICA · {selectedServiceDrawer.category.toUpperCase()}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      playMechanicalClick();
                      setSelectedServiceDrawer(null);
                    }}
                    className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
                    aria-label="Cerrar ficha técnica"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="font-display text-2xl md:text-3xl font-extrabold text-white mb-1">
                  {selectedServiceDrawer.name}
                </h3>
                <p className="font-mono text-lg text-[#D4A373] font-bold mb-6 tabular-nums">
                  {config.showServicePrice && !selectedServiceDrawer.hidePrice
                    ? `${formatPriceARS(selectedServiceDrawer.price)} · `
                    : ''}
                  {selectedServiceDrawer.durationMinutes} minutos de sesión
                </p>

                <div className="space-y-6 text-xs font-mono">
                  <div>
                    <h4 className="uppercase text-zinc-400 mb-2 font-bold tracking-wider">
                      Cómo Asistir (Preparación)
                    </h4>
                    <ul className="space-y-1.5 text-zinc-300">
                      {selectedServiceDrawer.preparation.map((p, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#D4A373]">•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="uppercase text-zinc-400 mb-2 font-bold tracking-wider">
                      Pasos de Ejecución en Sillón
                    </h4>
                    <ul className="space-y-1.5 text-zinc-300">
                      {selectedServiceDrawer.executionSteps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#D4A373]">•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="uppercase text-zinc-400 mb-1 font-bold tracking-wider">
                      Herramientas &amp; Productos
                    </h4>
                    <p className="text-zinc-300 bg-[#0C0E12] p-3.5 rounded-xl border border-[#1E222B]">
                      {selectedServiceDrawer.productsUsed}
                    </p>
                  </div>

                  <div>
                    <h4 className="uppercase text-zinc-400 mb-1 font-bold tracking-wider">
                      Cuidados &amp; Styling Diario
                    </h4>
                    <p className="text-zinc-300 bg-[#0C0E12] p-3.5 rounded-xl border border-[#1E222B]">
                      {selectedServiceDrawer.aftercare}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#1E222B] flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    playMechanicalClick();
                    setSelectedServiceDrawer(null);
                  }}
                  className="px-4 py-2.5 text-xs font-mono border border-[#282D37] rounded-xl text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cerrar
                </button>
                {config.showServiceBookingButton && !selectedServiceDrawer.hideBuyButton && (
                  <button
                    type="button"
                    onClick={() => {
                      const srvId = selectedServiceDrawer.id;
                      playMechanicalClick();
                      setSelectedServiceIds([srvId]);
                      setSelectedServiceDrawer(null);
                      scrollToSection('reservar');
                    }}
                    className="flex-1 py-3 text-xs font-mono font-black uppercase tracking-wider bg-[#D4A373] text-zinc-950 rounded-xl hover:bg-[#C89562] transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    Seleccionar y Agendar Turno
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
