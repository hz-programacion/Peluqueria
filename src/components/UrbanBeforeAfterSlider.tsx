import React, { useState, useRef } from 'react';
import { Scissors, MoveHorizontal, Sparkles, CheckCircle2, Flame } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';

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
    tag: 'ARCHIVO #01 · CAMBIO DE ESTRUCTURA',
    serviceId: 'srv-01',
    priceDisplay: '$12.000 ARS',
    duration: '40 min',
    beforeLabel: 'ANTES · 6 SEMANAS DE CRECIMIENTO',
    beforeDetail: 'Laterales abultados sin forma, nuca desprolija y peso excesivo en la cúspide.',
    afterLabel: 'DESPUÉS · SKIN FADE 0.0MM & CROP MATE',
    afterDetail: 'Pulido al ras con Shaver de Titanio 0.0mm, textura a tijera y polvo mate.',
    beforeImage: '/src/assets/images/urban_barber_hero_1793929257447.jpg',
    afterImage: '/src/assets/images/urban_streetwear_haircut_1793930882291.jpg',
    formulaSteps: [
      'Apertura de guía a clipper y rasurado hipoalergénico 0.0 mm con shaver de lámina de titanio.',
      'Descarga de peso en cúspide con tijera de esculpir para lograr movimiento orgánico.',
      'Marcado frontal a escuadra con Trimmer Skeleton y sellado con polvo texturizante mate.',
    ],
    accentColor: '#F59E0B',
  },
  {
    id: 'trans-platinum-ice',
    title: 'De Base Oscura a Platinado Hielo Ceniza + High Skin Fade',
    tag: 'ARCHIVO #02 · COLORIMETRÍA URBANA',
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
      'High Skin Fade 0.0 mm en laterales para resaltar el contraste urbano.',
    ],
    accentColor: '#00F0FF',
  },
  {
    id: 'trans-taper-beard',
    title: 'De Rulos & Barba Desconectada a Low Taper + Barba al Vapor',
    tag: 'ARCHIVO #03 · VISAGISMO COMPLETO',
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
    accentColor: '#CCFF00',
  },
];

export const UrbanBeforeAfterSlider: React.FC = () => {
  const { setSelectedServiceIds, navigateTo, uvNeonMode, config } = useStudio();
  const [activeCaseIndex, setActiveCaseIndex] = useState<number>(0);
  const [sliderPosition, setSliderPosition] = useState<number>(52);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeCase = TRANSFORMATION_CASES[activeCaseIndex];
  const sprayColor = uvNeonMode ? '#00F0FF' : activeCase.accentColor;

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
      className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-8 scroll-mt-24"
    >
      {/* Architectural Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 pb-5 border-b border-white/15">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#F59E0B] font-bold">
            <Flame className="w-3.5 h-3.5" />
            <span>SECCIÓN // 03</span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-400">COMPARADOR INTERACTIVO ANTES / DESPUÉS</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-[#F4EFE6] uppercase tracking-tight leading-[0.95]">
            Transformaciones <span className="font-editorial italic font-normal text-[#F59E0B] lowercase">reales</span> en el Sillón
          </h2>
        </div>

        {/* Case Selector Tabs */}
        <div
          className="flex flex-wrap items-center border border-white/15 bg-[#090A0E]"
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
                className={`px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-r last:border-r-0 border-white/10 ${
                  isSelected
                    ? 'bg-[#F59E0B] text-zinc-950 font-black'
                    : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'
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

      {/* Main Architectural 12-Col Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border border-white/15 bg-[#090A0E] shadow-2xl">
        {/* Left 7 Cols: Interactive Aerosol Before/After Viewport */}
        <div className="lg:col-span-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/15">
          <div
            ref={containerRef}
            onPointerDown={handlePointerMove}
            onPointerMove={handlePointerMove}
            className="relative h-[380px] sm:h-[470px] overflow-hidden bg-[#050608] select-none cursor-ew-resize group touch-none"
          >
            {/* AFTER IMAGE (Full Background) */}
            <img
              src={activeCase.afterImage}
              alt={`Después: ${activeCase.title}`}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
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
                className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 brightness-75 scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30" />
            </div>

            {/* Top Floating Labels: ANTES vs DESPUÉS */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none">
              <span className="px-3 py-1.5 bg-[#070709]/90 border border-white/20 text-[#F4EFE6] font-mono text-[11px] font-bold uppercase tracking-wider">
                {activeCase.beforeLabel}
              </span>
            </div>

            <div className="absolute top-4 right-4 z-20 pointer-events-none">
              <span
                className="px-3 py-1.5 text-zinc-950 font-mono text-[11px] font-black uppercase tracking-wider"
                style={{ backgroundColor: sprayColor }}
              >
                {activeCase.afterLabel}
              </span>
            </div>

            {/* AEROSOL SPRAY DIVIDER LINE + DRAG HANDLE */}
            <div
              style={{ left: `${sliderPosition}%` }}
              className="absolute top-0 bottom-0 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center justify-center"
            >
              <div
                className="w-0.5 h-full relative"
                style={{
                  backgroundColor: sprayColor,
                  boxShadow: `0 0 18px ${sprayColor}, 0 0 32px ${sprayColor}`,
                }}
              >
                <svg
                  viewBox="0 0 40 460"
                  className="absolute -left-5 top-0 w-11 h-full overflow-visible"
                  aria-hidden="true"
                >
                  <circle cx="8" cy="65" r="3" fill={sprayColor} opacity="0.85" />
                  <circle cx="32" cy="95" r="2.2" fill="#00F0FF" opacity="0.8" />
                  <circle cx="6" cy="180" r="2.5" fill={sprayColor} opacity="0.75" />
                  <circle cx="34" cy="260" r="3.2" fill="#FF4D1C" opacity="0.85" />
                  <circle cx="9" cy="340" r="2.4" fill="#CCFF00" opacity="0.8" />
                  <circle cx="31" cy="395" r="2.8" fill={sprayColor} opacity="0.85" />
                </svg>
              </div>

              <div
                className="absolute top-1/2 -translate-y-1/2 w-11 h-11 bg-[#070709] border-2 flex items-center justify-center shadow-2xl"
                style={{
                  borderColor: sprayColor,
                  boxShadow: `0 0 22px ${sprayColor}66`,
                }}
              >
                <MoveHorizontal className="w-5 h-5" style={{ color: sprayColor }} />
              </div>
            </div>

            {/* Bottom Overlay Comparison Bar */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#070709] via-[#070709]/85 to-transparent flex items-center justify-between text-xs font-mono text-zinc-200 z-20 pointer-events-none">
              <span>Arrastrá el divisor de aerosol para comparar</span>
              <span className="font-black text-[#F59E0B] tabular-nums">
                DESPUÉS: {100 - sliderPosition}% VISIBLE
              </span>
            </div>
          </div>

          {/* Accessible Range Control + Quick Comparison Presets */}
          <div className="p-4 bg-[#0B0C10] border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <label
                htmlFor="aerosol-before-after-range"
                className="text-xs font-mono font-bold text-zinc-300 uppercase whitespace-nowrap"
              >
                Barrido Spray:
              </label>
              <input
                id="aerosol-before-after-range"
                type="range"
                min={5}
                max={95}
                value={sliderPosition}
                aria-label="Deslizador de comparación Antes y Después"
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="w-full accent-[#F59E0B] cursor-pointer"
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
                  className={`px-3 py-1.5 font-mono text-[11px] font-bold uppercase cursor-pointer transition-colors border ${
                    Math.abs(sliderPosition - preset.pos) <= 8
                      ? 'bg-[#F59E0B] text-zinc-950 border-[#F59E0B] font-black'
                      : 'bg-[#070709] border-white/15 text-zinc-300 hover:border-[#F59E0B]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Technical Breakdown & 1-Click Booking */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 bg-[#090A0E] space-y-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/10">
              <span
                className="font-mono text-xs font-black uppercase tracking-wider"
                style={{ color: sprayColor }}
              >
                {activeCase.tag}
              </span>
              <span className="px-3 py-1 bg-[#070709] border border-white/15 text-[#F4EFE6] font-mono text-xs font-black tabular-nums">
                {activeCase.priceDisplay} · {activeCase.duration}
              </span>
            </div>

            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#F4EFE6] uppercase leading-tight">
              {activeCase.title}
            </h3>

            {/* Before vs After Diagnostic Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-4 bg-[#070709] border border-white/10 space-y-1.5">
                <span className="text-zinc-500 font-bold uppercase block text-[10px] tracking-widest">
                  DIAGNÓSTICO INICIAL (ANTES)
                </span>
                <p className="text-zinc-300 leading-relaxed">{activeCase.beforeDetail}</p>
              </div>

              <div
                className="p-4 bg-[#070709] border space-y-1.5"
                style={{ borderColor: `${sprayColor}66` }}
              >
                <span
                  className="font-black uppercase block text-[10px] tracking-widest"
                  style={{ color: sprayColor }}
                >
                  RESULTADO EN ATELIER (DESPUÉS)
                </span>
                <p className="text-[#F4EFE6] font-medium leading-relaxed">{activeCase.afterDetail}</p>
              </div>
            </div>

            {/* Execution Steps */}
            <div className="space-y-2.5 pt-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Protocolo Técnico en {config.address}:</span>
              </span>
              <ul className="space-y-2 text-xs text-zinc-300 font-mono">
                {activeCase.formulaSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2
                      className="w-4 h-4 shrink-0 mt-0.5"
                      style={{ color: sprayColor }}
                    />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-5 border-t border-white/10 space-y-2.5">
            <button
              type="button"
              onMouseEnter={playMechanicalHover}
              onClick={handleBookTransformation}
              className="w-full py-4 px-5 bg-[#F59E0B] hover:bg-[#F4EFE6] text-zinc-950 font-mono text-xs font-black uppercase tracking-[0.14em] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Scissors className="w-4 h-4" />
              <span>Agendar Esta Transformación ({activeCase.priceDisplay})</span>
            </button>
            <p className="text-[11px] font-mono text-zinc-400 text-center">
              Atención 1 a 1 con {config.authorName} · Sin filas de espera en {config.address}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
