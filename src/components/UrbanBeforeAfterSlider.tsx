import React, { useState, useRef } from 'react';
import { Scissors, MoveHorizontal, Sparkles, CheckCircle2 } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';
import { RetroCornerBandaBookmark } from './RetroPaperBanda';

interface TransformationCase {
  id: string;
  title: string;
  tag: string;
  serviceId: string;
  priceDisplay: string;
  duration: string;
  beforeLabel: string;
  beforeDetail: string;
  afterLabel: string;
  afterDetail: string;
  beforeImage: string;
  afterImage: string;
  formulaSteps: string[];
  accentColor: string;
}

const TRANSFORMATION_CASES: TransformationCase[] = [
  {
    id: 'trans-crop-fade',
    title: 'De Largo Sin Estructura a Burst Fade 0.0mm & Textured Crop',
    tag: 'ARCHIVO 01 · CAMBIO DE ESTRUCTURA',
    serviceId: 'srv-01',
    priceDisplay: '$12.000 ARS',
    duration: '45 min',
    beforeLabel: 'ANTES · 6 SEMANAS DE CRECIMIENTO',
    beforeDetail: 'Laterales abultados sin forma, nuca desprolija y peso excesivo en la cúspide.',
    afterLabel: 'DESPUÉS · SKIN FADE 0.0MM & CROP MATE',
    afterDetail: 'Pulido al ras con Shaver de Titanio 0.0mm, textura a tijera y polvo mate.',
    beforeImage: '/src/assets/images/urban_barber_hero_1793929257447.jpg',
    afterImage: '/src/assets/images/urban_textured_crop_1793929259231.jpg',
    formulaSteps: [
      'Apertura de guía a clipper y rasurado hipoalergénico 0.0 mm con shaver de lámina de titanio.',
      'Descarga de peso en cúspide con tijera de esculpir para lograr movimiento orgánico.',
      'Marcado frontal a escuadra con Trimmer Skeleton y sellado con polvo texturizante mate.',
    ],
    accentColor: '#9E2A2B',
  },
  {
    id: 'trans-platinum-ice',
    title: 'De Base Oscura a Platinado Hielo Ceniza + High Skin Fade',
    tag: 'ARCHIVO 02 · COLORIMETRÍA DE AUTOR',
    serviceId: 'srv-04',
    priceDisplay: '$28.000 ARS',
    duration: '90 min',
    beforeLabel: 'ANTES · TONO NATURAL SIN CONTRASTE',
    beforeDetail: 'Cabello oscuro uniforme sin definición en contornos ni contraste lateral.',
    afterLabel: 'DESPUÉS · PLATINADO CENIZA FRÍO + FADE',
    afterDetail: 'Decoloración protegida con Plex, matiz blanco hielo sin reflejos amarillos.',
    beforeImage: '/src/assets/images/urban_textured_crop_1793929259231.jpg',
    afterImage: '/src/assets/images/urban_platinum_buzz_1793929260240.jpg',
    formulaSteps: [
      'Protección lipídica del cuero cabelludo y decoloración controlada con Blondme 9+ y Plex.',
      'Matizado técnico plata ceniza frío para neutralizar por completo tonos cálidos.',
      'High Skin Fade 0.0 mm en laterales para resaltar el contraste del corte.',
    ],
    accentColor: '#9E2A2B',
  },
  {
    id: 'trans-taper-beard',
    title: 'De Rulos & Barba Desconectada a Low Taper + Barba al Vapor',
    tag: 'ARCHIVO 03 · VISAGISMO COMPLETO',
    serviceId: 'srv-02',
    priceDisplay: '$17.000 ARS',
    duration: '60 min',
    beforeLabel: 'ANTES · RULOS Y BARBA SIN LÍNEA',
    beforeDetail: 'Volumen descontrolado en patillas y barba sin ángulo mandibular definido.',
    afterLabel: 'DESPUÉS · LOW TAPER & BARBA ESCULPIDA',
    afterDetail: 'Transición limpia en sienes, barba perfilada al vapor y contornos a trimmer.',
    beforeImage: '/src/assets/images/urban_taper_curls_1793929259459.jpg',
    afterImage: '/src/assets/images/urban_beard_fade_1793929260672.jpg',
    formulaSteps: [
      'Low Taper comprimido en patillas y nuca baja conservando la caída natural superior.',
      'Esculpido geométrico de barba con toalla caliente al vapor y bálsamo hidratante.',
      'Limpieza al ras en cuello y pómulos con Shaver de Titanio 0.0 mm.',
    ],
    accentColor: '#9E2A2B',
  },
];

export const UrbanBeforeAfterSlider: React.FC = () => {
  const { setSelectedServiceIds, navigateTo, config } = useStudio();
  const [activeCaseIndex, setActiveCaseIndex] = useState<number>(0);
  const [sliderPosition, setSliderPosition] = useState<number>(52);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeCase = TRANSFORMATION_CASES[activeCaseIndex];
  const sprayColor = activeCase.accentColor;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons !== 1 && e.pointerType === 'mouse') return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = Math.round((x / (rect.width || 1)) * 100);
    setSliderPosition(Math.max(5, Math.min(95, percent)));
  };

  const handleBookTransformation = () => {
    playMechanicalClick();
    setSelectedServiceIds([activeCase.serviceId]);
    window.dispatchEvent(
      new CustomEvent('urban-section-transition', { detail: { sectionId: 'reservar' } })
    );
    const el = document.getElementById('reservar');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigateTo('booking');
    }
  };

  return (
    <section
      id="transformaciones"
      className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-20 scroll-mt-24"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 pb-5 border-b border-[#C8BBA4]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#9E2A2B] font-semibold">
            <span>Archivo de Transformaciones</span>
            <span>╱</span>
            <span className="text-[#5C5346]">Comparador Antes y Después</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#181512] tracking-tight leading-tight">
            Transformaciones{' '}
            <span className="font-editorial italic font-normal text-[#9E2A2B]">reales</span> en el
            Sillón
          </h2>
        </div>

        {/* Case Selector Tabs on Aged Paper */}
        <div
          className="flex flex-wrap items-center border border-[#C8BBA4] rounded-lg overflow-hidden bg-[#FAF6EE]"
          role="tablist"
          aria-label="Elegir caso de transformación Antes y Después"
        >
          {TRANSFORMATION_CASES.map((item, idx) => {
            const isSelected = activeCaseIndex === idx;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onMouseEnter={playMechanicalHover}
                onClick={() => {
                  playMechanicalClick();
                  setActiveCaseIndex(idx);
                  setSliderPosition(52);
                }}
                className={`px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer border-r last:border-r-0 border-[#D5C9B4] ${
                  isSelected
                    ? 'bg-[#9E2A2B] text-[#FAF6EE]'
                    : 'text-[#4F463B] hover:text-[#181512] hover:bg-[#EFE7D6]'
                }`}
              >
                <span>
                  0{idx + 1}.{' '}
                  {item.id === 'trans-crop-fade'
                    ? 'Burst Fade & Crop'
                    : item.id === 'trans-platinum-ice'
                    ? 'Platinado Hielo'
                    : 'Low Taper & Barba'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 12-Col Aged-Paper Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border border-[#C8BBA4] rounded-xl overflow-hidden bg-[#FAF6EE] shadow-[0_16px_40px_rgba(24,21,18,0.08)] relative">
        <RetroCornerBandaBookmark size="md" />

        {/* Left 7 Cols: Interactive Before/After Viewport */}
        <div className="lg:col-span-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#C8BBA4]">
          <div
            ref={containerRef}
            onPointerDown={handlePointerMove}
            onPointerMove={handlePointerMove}
            className="relative h-[380px] sm:h-[460px] overflow-hidden bg-[#181512] select-none cursor-ew-resize group touch-none"
          >
            {/* AFTER IMAGE */}
            <img
              src={activeCase.afterImage}
              alt={`Después: ${activeCase.title}`}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none sepia-[0.08]"
              referrerPolicy="no-referrer"
            />

            {/* BEFORE IMAGE (Clipped by sliderPosition) */}
            <div
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              className="absolute inset-0 overflow-hidden pointer-events-none"
            >
              <img
                src={activeCase.beforeImage}
                alt={`Antes: ${activeCase.title}`}
                className="absolute inset-0 w-full h-full object-cover grayscale contrast-115 brightness-85 scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-black/25" />
            </div>

            {/* Top Floating Labels: ANTES vs DESPUÉS */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none">
              <span className="px-3 py-1.5 rounded bg-[#FAF6EE]/95 border border-[#C8BBA4] text-[#181512] font-mono text-[11px] font-semibold uppercase tracking-wider shadow-xs">
                {activeCase.beforeLabel}
              </span>
            </div>

            <div className="absolute top-4 right-4 z-20 pointer-events-none">
              <span className="px-3 py-1.5 rounded bg-[#9E2A2B] text-[#FAF6EE] font-mono text-[11px] font-semibold uppercase tracking-wider shadow-xs">
                {activeCase.afterLabel}
              </span>
            </div>

            {/* DIVIDER LINE + DRAG HANDLE */}
            <div
              style={{ left: `${sliderPosition}%` }}
              className="absolute top-0 bottom-0 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center justify-center"
            >
              <div
                className="w-0.5 h-full relative"
                style={{
                  backgroundColor: sprayColor,
                }}
              />

              <div
                className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#FAF6EE] border-2 flex items-center justify-center shadow-lg"
                style={{
                  borderColor: sprayColor,
                }}
              >
                <MoveHorizontal className="w-4 h-4 text-[#9E2A2B]" />
              </div>
            </div>

            {/* Bottom Overlay Comparison Bar */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#181512]/90 via-[#181512]/65 to-transparent flex items-center justify-between text-xs font-mono text-[#FAF6EE] z-20 pointer-events-none">
              <span>Deslizá el divisor para comparar el cambio</span>
              <span className="font-semibold text-[#E8DFCE] tabular-nums">
                DESPUÉS: {100 - sliderPosition}% VISIBLE
              </span>
            </div>
          </div>

          {/* Range Control + Quick Comparison Presets on Aged Paper */}
          <div className="p-4 bg-[#EAE0CE] border-t border-[#C8BBA4] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <label
                htmlFor="aerosol-before-after-range"
                className="text-xs font-mono font-semibold text-[#181512] uppercase whitespace-nowrap"
              >
                Comparador:
              </label>
              <input
                id="aerosol-before-after-range"
                type="range"
                min={5}
                max={95}
                value={sliderPosition}
                aria-label="Deslizador de comparación Antes y Después"
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="w-full accent-[#9E2A2B] cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {[
                { label: 'Ver Antes', pos: 85 },
                { label: '50 / 50', pos: 50 },
                { label: 'Ver Resultado', pos: 15 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    playMechanicalClick();
                    setSliderPosition(preset.pos);
                  }}
                  className={`px-3 py-1.5 rounded font-mono text-[11px] font-semibold uppercase cursor-pointer transition-colors border ${
                    Math.abs(sliderPosition - preset.pos) <= 8
                      ? 'bg-[#9E2A2B] text-[#FAF6EE] border-[#9E2A2B]'
                      : 'bg-[#FAF6EE] border-[#C8BBA4] text-[#4F463B] hover:border-[#9E2A2B]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Technical Breakdown & 1-Click Booking on Aged Paper */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 bg-[#FAF6EE] space-y-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-[#D5C9B4]">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#9E2A2B]">
                {activeCase.tag}
              </span>
              <span className="px-3 py-1 rounded bg-[#EAE0CE] border border-[#C8BBA4] text-[#181512] font-mono text-xs font-bold tabular-nums">
                {activeCase.priceDisplay} · {activeCase.duration}
              </span>
            </div>

            <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#181512] leading-tight">
              {activeCase.title}
            </h3>

            {/* Before vs After Diagnostic Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-4 rounded-lg bg-[#F3ECE0] border border-[#C8BBA4] space-y-1.5">
                <span className="text-[#6E6355] font-bold uppercase block text-[10px] tracking-widest">
                  ESTADO INICIAL (ANTES)
                </span>
                <p className="text-[#4F463B] leading-relaxed">{activeCase.beforeDetail}</p>
              </div>

              <div className="p-4 rounded-lg bg-[#EFE7D6] border border-[#9E2A2B]/45 space-y-1.5">
                <span className="font-bold uppercase block text-[10px] tracking-widest text-[#9E2A2B]">
                  RESULTADO EN ESTUDIO (DESPUÉS)
                </span>
                <p className="text-[#181512] font-medium leading-relaxed">{activeCase.afterDetail}</p>
              </div>
            </div>

            {/* Execution Steps */}
            <div className="space-y-2.5 pt-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#9E2A2B] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#9E2A2B]" />
                <span>Proceso en {config.address}:</span>
              </span>
              <ul className="space-y-2 text-xs text-[#4F463B] font-mono">
                {activeCase.formulaSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#9E2A2B]" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-5 border-t border-[#D5C9B4] space-y-2.5">
            <button
              type="button"
              onMouseEnter={playMechanicalHover}
              onClick={handleBookTransformation}
              className="w-full py-3.5 px-5 rounded bg-[#9E2A2B] hover:bg-[#822021] text-[#FAF6EE] font-mono text-xs font-semibold uppercase tracking-[0.14em] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Scissors className="w-4 h-4" />
              <span>Reservar este servicio ({activeCase.priceDisplay})</span>
            </button>
            <p className="text-[11px] font-mono text-[#6E6355] text-center">
              Atención 1 a 1 con {config.authorName} · {config.address}, {config.neighborhood}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
