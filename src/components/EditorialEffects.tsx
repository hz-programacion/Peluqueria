import React, { useState, useRef, useMemo } from 'react';
import {
  motion,
  useScroll,
  useVelocity,
  useTransform,
  useSpring,
  useMotionValue,
  useAnimationFrame,
} from 'motion/react';
import { useStudio } from '../context/StudioContext';
import {
  formatPriceARS,
  getNextAvailableSlotInfo,
  resolveWhatsAppInfo,
} from '../utils/bookingEngine';
import {
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  MoveHorizontal,
  Scissors,
} from 'lucide-react';

/**
 * 1. EDITORIAL ROTATING PROMOTIONAL BANNER WITH SCROLL-VELOCITY PARALLAX
 * Rotates continuously and accelerates/shifts smoothly with the user's scroll velocity.
 * Dynamically reflects every change made in Admin (prices, address, schedule, promo text, WhatsApp).
 */
export const EditorialRotatingBanner: React.FC<{
  variant?: 'top' | 'divider';
  onBookClick?: () => void;
}> = ({ variant = 'top', onBookClick }) => {
  const { config, services, appointments, blockedSlots } = useStudio();
  const [isHovered, setIsHovered] = useState(false);

  const visibleServices = useMemo(
    () => services.filter((s) => !s.hidden),
    [services]
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

  const waInfo = resolveWhatsAppInfo(config.phoneDisplay, config.whatsappRaw);

  // Build dynamic ticker items reflecting live Admin state
  const tickerItems = useMemo(() => {
    const items: { label: string; highlight?: string; tag?: string }[] = [];

    if (config.promoBannerText && config.promoBannerText.trim()) {
      items.push({
        tag: 'Destacado',
        label: config.promoBannerText.trim(),
      });
    }

    items.push({
      tag: 'Dirección',
      label: `${config.address}, ${config.neighborhood}`,
      highlight: 'Estudio Privado 1 a 1',
    });

    items.push({
      tag: 'Valor Base',
      label: `Corte en Estudio desde ${config.mainPriceDisplay}`,
    });

    visibleServices.slice(0, 4).forEach((srv) => {
      if (!srv.hidePrice && config.showServicePrice) {
        items.push({
          tag: `Servicio ${srv.index}`,
          label: srv.name,
          highlight: `${formatPriceARS(srv.price)} · ${srv.durationMinutes} min`,
        });
      } else {
        items.push({
          tag: `Servicio ${srv.index}`,
          label: `${srv.name} (${srv.durationMinutes} min)`,
        });
      }
    });

    if (nextAvailableSlot && config.walkInStatus === 'available') {
      items.push({
        tag: 'Agenda Hoy',
        label: nextAvailableSlot.label,
        highlight: 'Reservar ahora →',
      });
    }

    items.push({
      tag: 'Horarios',
      label: config.scheduleDisplay,
      highlight: `WhatsApp ${waInfo.display}`,
    });

    return items;
  }, [
    config.promoBannerText,
    config.address,
    config.neighborhood,
    config.mainPriceDisplay,
    config.showServicePrice,
    config.walkInStatus,
    config.scheduleDisplay,
    visibleServices,
    nextAvailableSlot,
    waInfo.display,
  ]);

  // Scroll-velocity parallax physics
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 45,
    stiffness: 320,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 3.5], {
    clamp: false,
  });

  const baseX = useMotionValue(0);
  const directionFactor = useRef<number>(1);

  useAnimationFrame((_, delta) => {
    if (isHovered) return;
    const baseSpeed = variant === 'top' ? -2.2 : -3.0;
    let moveBy = directionFactor.current * baseSpeed * (delta / 1000);

    if (config.enableParallax) {
      const vf = velocityFactor.get();
      if (vf < 0) {
        directionFactor.current = -1;
      } else if (vf > 0) {
        directionFactor.current = 1;
      }
      moveBy += directionFactor.current * moveBy * Math.min(Math.abs(vf), 4);
    }

    let next = baseX.get() + moveBy;
    if (next <= -50) {
      next += 50;
    } else if (next > 0) {
      next -= 50;
    }
    baseX.set(next);
  });

  const xPercent = useTransform(baseX, (v) => `${v}%`);

  if (variant === 'top' && !config.showPromoBanner) {
    return null;
  }

  const repeatedItems = [...tickerItems, ...tickerItems];

  if (variant === 'top') {
    return (
      <div
        data-testid="editorial-promo-banner-top"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onBookClick}
        className="w-full bg-[#E8DFCE] text-[#181512] border-b border-[#C5B79F] overflow-hidden py-1.5 cursor-pointer select-none relative z-30"
      >
        <motion.div
          style={{ x: xPercent }}
          className="flex items-center whitespace-nowrap w-max"
        >
          {repeatedItems.map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className="inline-flex items-center gap-2.5 px-6 text-xs tracking-wide"
            >
              {item.tag && (
                <span className="text-[#9E2A2B] text-[10px] font-mono uppercase tracking-[0.16em] font-bold">
                  {item.tag}
                </span>
              )}
              <span className="text-[#2C2620] font-medium">{item.label}</span>
              {item.highlight && (
                <span className="font-mono text-[11px] text-[#9E2A2B] font-semibold tabular-nums">
                  · {item.highlight}
                </span>
              )}
              <span className="text-[#9E2A2B]/65 pl-3 font-serif italic" aria-hidden="true">
                ╱
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    );
  }

  // Subtle Retro Aged-Paper Parallax Divider Variant
  return (
    <section
      aria-label="Información destacada de Rodrigo Cutsss, precios y ubicación"
      data-testid="editorial-promo-banner-divider"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full bg-[#EAE0CE] text-[#181512] border-y-2 border-[#C5B79F] py-3.5 overflow-hidden relative select-none shadow-inner"
    >
      {/* Subtle Carmine Pinstripe along the top of the divider */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#9E2A2B]/60 to-transparent" />
      <motion.div
        style={{ x: xPercent }}
        className="flex items-center whitespace-nowrap w-max"
      >
        {repeatedItems.map((item, idx) => (
          <button
            key={`div-${item.label}-${idx}`}
            type="button"
            onClick={onBookClick}
            className="inline-flex items-center gap-3.5 px-8 group cursor-pointer text-left"
          >
            <span className="text-[#9E2A2B] text-[10px] uppercase tracking-[0.18em] font-mono font-bold">
              {item.tag}
            </span>
            <span className="font-display font-bold uppercase tracking-tight text-base sm:text-lg text-[#181512] group-hover:text-[#9E2A2B] transition-colors">
              {item.label}
            </span>
            {item.highlight && (
              <span className="font-mono text-xs text-[#6B5E4E] font-semibold tabular-nums">
                · {item.highlight}
              </span>
            )}
            <span className="text-[#9E2A2B]/70 pl-4 font-serif italic text-base" aria-hidden="true">
              ╱
            </span>
          </button>
        ))}
      </motion.div>
    </section>
  );
};

/**
 * 2. EDITORIAL MASK WIPE IMAGE ("Cortina Editorial" + Analog Leica Film-to-Warm Tone)
 */
export const MaskRevealImage: React.FC<{
  src: string;
  alt: string;
  aspectClassName?: string;
  imgClassName?: string;
  parallaxY?: any;
  children?: React.ReactNode;
}> = ({
  src,
  alt,
  aspectClassName = 'aspect-[4/3]',
  imgClassName = '',
  parallaxY,
  children,
}) => {
  const { config } = useStudio();
  const filmEffectClass = config.enableDripTrail
    ? 'grayscale-[35%] contrast-[1.03] group-hover:grayscale-0 transition-all duration-700'
    : 'transition-transform duration-700';

  return (
    <div
      className={`group relative overflow-hidden bg-[#EFEAE1] ${aspectClassName}`}
    >
      {/* Animated Editorial Curtain Overlay that wipes away on viewport entry */}
      <motion.div
        initial={{ scaleX: 1 }}
        whileInView={{ scaleX: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: 'right' }}
        className="absolute inset-0 z-20 bg-[#E4DDD1] pointer-events-none"
      />

      <motion.img
        initial={{ scale: 1.08 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={parallaxY ? { y: parallaxY } : undefined}
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        className={`w-full h-full object-cover ${filmEffectClass} ${imgClassName}`}
      />
      {children}
    </div>
  );
};

/**
 * 3. MAGNETIC PULL & BRONZE SWEEP BUTTON
 */
export const MagneticButton: React.FC<{
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  testId?: string;
}> = ({
  children,
  onClick,
  className = '',
  type = 'button',
  disabled = false,
  testId,
}) => {
  const { config } = useStudio();
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 18 });
  const springY = useSpring(y, { stiffness: 220, damping: 18 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!config.enableDripTrail || !ref.current || disabled) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.16);
    y.set((e.clientY - centerY) * 0.22);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      data-testid={testId}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative overflow-hidden group cursor-pointer ${className}`}
    >
      <span className="relative z-10 inline-flex items-center justify-center gap-2.5">
        {children}
      </span>
    </motion.button>
  );
};

/**
 * 4. EDITORIAL BEFORE / AFTER CURTAIN COMPARATOR ("Sastrería Capilar")
 * Controlled by config.showBeforeAfterSection in Admin.
 */
interface TransformationCase {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  beforeLabel: string;
  afterLabel: string;
  beforeImage: string;
  afterImage: string;
  description: string;
  technique: string;
  serviceId: string;
}

const TRANSFORMATION_CASES: TransformationCase[] = [
  {
    id: 'case-01',
    number: '01',
    title: 'Corte de Autor a Tijera & Textura Natural',
    subtitle: 'Redefinición de estructura, caída y movimiento sin rigidez',
    beforeLabel: 'Diagnóstico Inicial · Crecimiento sin estructura',
    afterLabel: 'Resultado en Estudio · Corte a tijera y acabado mate',
    beforeImage: '/src/assets/images/lookbook_long_layers_1793889692727.jpg',
    afterImage: '/src/assets/images/lookbook_classic_scissoring_1793889690402.jpg',
    description:
      'Equilibramos los volúmenes laterales respetando los remolinos naturales para que el corte mantenga su forma durante semanas con un peinado mínimo.',
    technique: 'Tijera de hoja japonesa · Desfilado orgánico · Arcilla botánica',
    serviceId: 'srv-01',
  },
  {
    id: 'case-02',
    number: '02',
    title: 'Corte Contemporáneo & Perfilado de Barba',
    subtitle: 'Armonía entre contornos limpios y barba esculpida con toalla tibia',
    beforeLabel: 'Estado Previo · Laterales y barba sin proporción',
    afterLabel: 'Resultado Final · Transición limpia y barba hidratada',
    beforeImage: '/src/assets/images/hero_studio_portrait_1793889687375.jpg',
    afterImage: '/src/assets/images/lookbook_skin_fade_crop_1793889691565.jpg',
    description:
      'Integración gradual entre laterales y barba, definiendo pómulos y cuello con compresa tibia aromática y óleo de jojoba y cedro.',
    technique: 'Degradé sutil · Compresa tibia · Óleo botánico de cedro',
    serviceId: 'srv-02',
  },
  {
    id: 'case-03',
    number: '03',
    title: 'Iluminación Sutil & Nutrición Capilar',
    subtitle: 'Relieve dimensión cálida con protección de fibra y baño de brillo',
    beforeLabel: 'Base Apagada · Fibra deshidratada sin relieve',
    afterLabel: 'Resultado en Estudio · Iluminación tono sobre tono',
    beforeImage: '/src/assets/images/lookbook_classic_scissoring_1793889690402.jpg',
    afterImage: '/src/assets/images/lookbook_tonal_color_1793889692797.jpg',
    description:
      'Reflejos trabajados tono sobre tono junto con nuestro ritual de nutrición profunda para devolver suavidad, cuerpo y luminosidad natural.',
    technique: 'Coloración sin amoníaco · Protector Plex · Baño de aminoácidos',
    serviceId: 'srv-04',
  },
];

export const EditorialBeforeAfterSlider: React.FC<{
  onSelectServiceAndBook: (serviceId: string) => void;
}> = ({ onSelectServiceAndBook }) => {
  const { config, services } = useStudio();
  const [activeIdx, setActiveIdx] = useState(0);
  const [sliderPercent, setSliderPercent] = useState(52);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const currentCase = TRANSFORMATION_CASES[activeIdx] || TRANSFORMATION_CASES[0];
  const matchedService = services.find((s) => s.id === currentCase.serviceId) || services[0];

  const updateFromClientX = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSliderPercent(Math.max(8, Math.min(92, Math.round(pct))));
  };

  return (
    <section
      id="transformaciones"
      data-testid="section-beforeAfter"
      className="relative max-w-[1320px] mx-auto px-5 sm:px-8 py-20 lg:py-28 border-b border-[#171513]/12 scroll-mt-20"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#96734E] font-medium">
            <Scissors className="w-3.5 h-3.5" />
            <span>Archivo de Transformaciones</span>
            <span aria-hidden="true">·</span>
            <span>Sastrería Capilar</span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-medium text-[#171513] leading-tight">
            Comparador Antes &amp; Después
          </h2>
        </div>

        {/* Case Selector Tabs */}
        <div className="flex flex-wrap gap-2">
          {TRANSFORMATION_CASES.map((c, idx) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setActiveIdx(idx);
                setSliderPercent(52);
              }}
              className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider border transition-colors cursor-pointer ${
                activeIdx === idx
                  ? 'bg-[#171513] text-[#F7F4EE] border-[#171513]'
                  : 'bg-[#EFEAE1] text-[#4A443E] border-[#171513]/15 hover:border-[#171513]'
              }`}
            >
              {c.number}. {c.title.split('&')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left 7 Columns: Interactive Curtain Comparator */}
        <div className="lg:col-span-7">
          <div
            ref={containerRef}
            onPointerDown={(e) => {
              isDraggingRef.current = true;
              updateFromClientX(e.clientX);
            }}
            onPointerMove={(e) => {
              if (!isDraggingRef.current) return;
              updateFromClientX(e.clientX);
            }}
            onPointerUp={() => {
              isDraggingRef.current = false;
            }}
            onPointerLeave={() => {
              isDraggingRef.current = false;
            }}
            className="relative aspect-[16/11] bg-[#171513] border border-[#171513]/15 overflow-hidden select-none cursor-ew-resize shadow-[0_20px_50px_rgba(23,21,19,0.08)]"
          >
            {/* AFTER IMAGE (Full Background) */}
            <img
              src={currentCase.afterImage}
              alt={currentCase.afterLabel}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />

            {/* BEFORE IMAGE (Clipped by sliderPercent) */}
            <div
              style={{ clipPath: `inset(0 ${100 - sliderPercent}% 0 0)` }}
              className="absolute inset-0 overflow-hidden pointer-events-none"
            >
              <img
                src={currentCase.beforeImage}
                alt={currentCase.beforeLabel}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover grayscale contrast-110 brightness-90"
              />
              <div className="absolute inset-0 bg-[#171513]/25" />
            </div>

            {/* Labels */}
            <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-[#171513]/85 backdrop-blur-xs text-[#F7F4EE] text-[10px] font-mono uppercase tracking-widest border border-[#F7F4EE]/15">
              Antes · Diagnóstico
            </div>
            <div className="absolute top-4 right-4 z-10 px-3 py-1.5 bg-[#F7F4EE]/92 backdrop-blur-xs text-[#171513] text-[10px] font-mono uppercase tracking-widest border border-[#171513]/15">
              Después · Resultado en Estudio
            </div>

            {/* 1px Matte Bronze Curtain Line & Tactile Handle */}
            <div
              style={{ left: `${sliderPercent}%` }}
              className="absolute top-0 bottom-0 z-20 w-[1.5px] bg-[#C8A97E] pointer-events-none"
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-[#F7F4EE] border border-[#171513] text-[#171513] shadow-lg flex items-center justify-center">
                <MoveHorizontal className="w-4 h-4 text-[#96734E]" />
              </div>
            </div>
          </div>

          {/* Accessible Range Input for Keyboard & Fine Adjustment */}
          <div className="mt-3 flex items-center justify-between gap-4 text-xs text-[#655E57]">
            <span className="font-display italic">
              Deslizá el divisor para comparar el diagnóstico previo y el trabajo terminado.
            </span>
            <input
              type="range"
              aria-label="Porcentaje de comparación Antes y Después"
              min={8}
              max={92}
              value={sliderPercent}
              onChange={(e) => setSliderPercent(Number(e.target.value))}
              className="w-36 accent-[#96734E] cursor-pointer"
            />
          </div>
        </div>

        {/* Right 5 Columns: Editorial Case Study Sheet */}
        <div className="lg:col-span-5 bg-[#EFEAE1] border border-[#171513]/15 p-8 sm:p-10 space-y-6">
          <div className="flex items-center justify-between text-xs font-mono text-[#96734E]">
            <span>ESTUDIO DE CASO {currentCase.number}</span>
            {matchedService && config.showServicePrice && (
              <span className="text-[#171513] font-semibold">
                {formatPriceARS(matchedService.price)} · {matchedService.durationMinutes} min
              </span>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-display text-3xl font-medium text-[#171513] leading-tight">
              {currentCase.title}
            </h3>
            <p className="font-display italic text-lg text-[#655E57]">
              {currentCase.subtitle}
            </p>
          </div>

          <p className="text-sm text-[#4A443E] leading-relaxed">
            {currentCase.description}
          </p>

          <div className="pt-4 border-t border-[#171513]/12 space-y-2 text-xs">
            <span className="uppercase tracking-widest text-[#8C8379] block">
              Técnica &amp; Cuidado Aplicado
            </span>
            <p className="font-medium text-[#171513]">{currentCase.technique}</p>
          </div>

          {config.showServiceBookingButton && (
            <div className="pt-2">
              <MagneticButton
                onClick={() => onSelectServiceAndBook(currentCase.serviceId)}
                className="w-full py-4 px-6 bg-[#171513] hover:bg-[#96734E] text-[#F7F4EE] text-xs font-medium uppercase tracking-[0.16em] transition-colors"
              >
                <span>Reservar este servicio en el turnero</span>
                <ArrowRight className="w-4 h-4" />
              </MagneticButton>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
