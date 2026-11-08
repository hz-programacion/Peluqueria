import React, { useState, useRef, useEffect } from 'react';
import {
  Scissors,
  MoveHorizontal,
  Sparkles,
  CheckCircle2,
  Columns,
  SlidersHorizontal,
  Play,
  Pause,
  UserCheck,
  Settings,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStudio } from '../context/StudioContext';
import { INITIAL_TRANSFORMATION_CASES } from '../data/studioData';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';
import { RetroCornerBandaBookmark } from './RetroPaperBanda';

export const UrbanBeforeAfterSlider: React.FC = () => {
  const {
    transformations,
    setSelectedServiceIds,
    navigateTo,
    config,
    isAdminAuthenticated,
  } = useStudio();

  const casesList =
    transformations && transformations.length > 0
      ? transformations
      : INITIAL_TRANSFORMATION_CASES;

  const [activeCaseIndex, setActiveCaseIndex] = useState<number>(0);
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [viewMode, setViewMode] = useState<'slider' | 'sideBySide'>('slider');
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const safeIndex = activeCaseIndex < casesList.length ? activeCaseIndex : 0;
  const activeCase = casesList[safeIndex] || INITIAL_TRANSFORMATION_CASES[0];

  // Auto-Demo animation for the Before/After divider so users don't even have to drag
  useEffect(() => {
    if (!isAutoPlaying || viewMode !== 'slider') return;
    let direction = 1;
    const interval = setInterval(() => {
      setSliderPosition((prev) => {
        const next = prev + direction * 2;
        if (next >= 86) {
          direction = -1;
          return 86;
        }
        if (next <= 14) {
          direction = 1;
          return 14;
        }
        return next;
      });
    }, 35);
    return () => clearInterval(interval);
  }, [isAutoPlaying, viewMode]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons !== 1 && e.pointerType === 'mouse') return;
    if (!containerRef.current) return;
    setIsAutoPlaying(false);
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = Math.round((x / (rect.width || 1)) * 100);
    setSliderPosition(Math.max(5, Math.min(95, percent)));
  };

  const handleBookTransformation = () => {
    playMechanicalClick();
    setSelectedServiceIds([activeCase.serviceId || 'srv-01']);
    window.dispatchEvent(
      new CustomEvent('atelier:select-service-and-advance', {
        detail: { serviceId: activeCase.serviceId || 'srv-01' },
      })
    );
    const el = document.getElementById('turnero') || document.getElementById('reservar');
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
      {/* Header & Mode Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 pb-5 border-b border-[#C8BBA4]">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#9E2A2B] font-semibold">
            <span>Archivo de Transformaciones</span>
            <span aria-hidden="true">╱</span>
            <span className="text-[#5C5346]">Diagnóstico &amp; Resultado en Sillón</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#181512] tracking-tight leading-tight">
            Antes y Después{' '}
            <span className="font-editorial italic font-normal text-[#9E2A2B]">
              paso a paso
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#4F463B] max-w-[58ch]">
            Compará cómo llega el cabello al estudio y cómo queda terminado. Podés deslizar la
            cortina interactiva, activar la demostración automática o ver ambas fotos lado a lado.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-end">
          {/* View Mode Switcher: Cortina Deslizante vs. Lado a Lado */}
          <div
            className="inline-flex items-center p-1 rounded-lg bg-[#EAE0CE] border border-[#C8BBA4]"
            role="group"
            aria-label="Modo de visualización de transformación"
          >
            <button
              type="button"
              data-testid="transformation-mode-slider"
              onClick={() => {
                playMechanicalClick();
                setViewMode('slider');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'slider'
                  ? 'bg-[#FAF6EE] text-[#181512] shadow-2xs border border-[#C8BBA4]'
                  : 'text-[#4F463B] hover:text-[#181512]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#9E2A2B]" />
              <span>Cortina Interactiva</span>
            </button>

            <button
              type="button"
              data-testid="transformation-mode-sidebyside"
              onClick={() => {
                playMechanicalClick();
                setIsAutoPlaying(false);
                setViewMode('sideBySide');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'sideBySide'
                  ? 'bg-[#FAF6EE] text-[#181512] shadow-2xs border border-[#C8BBA4]'
                  : 'text-[#4F463B] hover:text-[#181512]'
              }`}
            >
              <Columns className="w-3.5 h-3.5 text-[#9E2A2B]" />
              <span>Ver Lado a Lado</span>
            </button>
          </div>

          {isAdminAuthenticated && (
            <button
              type="button"
              onClick={() => navigateTo('admin')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#9E2A2B]/50 bg-[#FAF6EE] hover:bg-[#9E2A2B] text-[#181512] hover:text-[#FAF6EE] font-mono text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Editar Casos en Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Case Selector Tabs on Aged Paper */}
      <div
        className="flex flex-wrap items-center gap-2 mb-6"
        role="tablist"
        aria-label="Elegir caso de transformación Antes y Después"
      >
        {casesList.map((item, idx) => {
          const isSelected = safeIndex === idx;
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
                setSliderPosition(50);
              }}
              className={`px-4 py-2.5 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer border whitespace-nowrap ${
                isSelected
                  ? 'bg-[#9E2A2B] text-[#FAF6EE] border-[#9E2A2B] shadow-xs'
                  : 'bg-[#FAF6EE] text-[#4F463B] border-[#C8BBA4] hover:border-[#9E2A2B] hover:text-[#181512]'
              }`}
            >
              <span>
                0{idx + 1}. {item.shortTabTitle || item.title.slice(0, 22)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main 12-Col Aged-Paper Frame */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeCase.id}-${viewMode}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 lg:grid-cols-12 border border-[#C8BBA4] rounded-xl overflow-hidden bg-[#FAF6EE] shadow-[0_16px_40px_rgba(24,21,18,0.08)] relative"
        >
          <RetroCornerBandaBookmark size="md" />

          {/* Left 7 Cols: Interactive Before/After Viewport OR Side-by-Side Postcard View */}
          <div className="lg:col-span-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#C8BBA4]">
            {viewMode === 'slider' ? (
              <>
                <div
                  ref={containerRef}
                  onPointerDown={handlePointerMove}
                  onPointerMove={handlePointerMove}
                  className="relative h-[360px] sm:h-[460px] overflow-hidden bg-[#181512] select-none cursor-ew-resize group touch-none"
                >
                  {/* AFTER IMAGE */}
                  <img
                    src={activeCase.afterImage}
                    alt={`Después: ${activeCase.title}`}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none sepia-[0.06]"
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
                      className="absolute inset-0 w-full h-full object-cover grayscale contrast-110 brightness-90"
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
                    <div className="w-0.5 h-full relative bg-[#9E2A2B]" />

                    <div className="absolute top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#FAF6EE] border-2 border-[#9E2A2B] flex items-center justify-center shadow-lg">
                      <MoveHorizontal className="w-4 h-4 text-[#9E2A2B]" />
                    </div>
                  </div>

                  {/* Bottom Overlay Comparison Bar */}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#181512]/90 via-[#181512]/65 to-transparent flex items-center justify-between text-xs font-mono text-[#FAF6EE] z-20 pointer-events-none">
                    <span>Arrastrá el círculo central o usá los botones inferiores</span>
                    <span className="font-semibold text-[#E8DFCE] tabular-nums">
                      RESULTADO: {100 - sliderPosition}%
                    </span>
                  </div>
                </div>

                {/* Range Control + Auto-Demo + Quick Comparison Presets on Aged Paper */}
                <div className="p-4 bg-[#EAE0CE] border-t border-[#C8BBA4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-1">
                    <button
                      type="button"
                      onClick={() => setIsAutoPlaying((prev) => !prev)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-[11px] font-semibold uppercase border transition-colors cursor-pointer shrink-0 ${
                        isAutoPlaying
                          ? 'bg-[#9E2A2B] text-[#FAF6EE] border-[#9E2A2B]'
                          : 'bg-[#FAF6EE] text-[#181512] border-[#C8BBA4] hover:border-[#9E2A2B]'
                      }`}
                    >
                      {isAutoPlaying ? (
                        <>
                          <Pause className="w-3 h-3" />
                          <span>Pausar</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 text-[#9E2A2B]" />
                          <span>Auto-Demo</span>
                        </>
                      )}
                    </button>

                    <input
                      id="aerosol-before-after-range"
                      type="range"
                      min={5}
                      max={95}
                      value={sliderPosition}
                      aria-label="Deslizador de comparación Antes y Después"
                      onChange={(e) => {
                        setIsAutoPlaying(false);
                        setSliderPosition(Number(e.target.value));
                      }}
                      className="w-full accent-[#9E2A2B] cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {[
                      { label: '1. Ver Antes', pos: 88 },
                      { label: '2. Mitad (50/50)', pos: 50 },
                      { label: '3. Ver Resultado', pos: 12 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          playMechanicalClick();
                          setIsAutoPlaying(false);
                          setSliderPosition(preset.pos);
                        }}
                        className={`px-2.5 py-1.5 rounded font-mono text-[11px] font-semibold uppercase cursor-pointer transition-colors border whitespace-nowrap ${
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
              </>
            ) : (
              /* SIDE-BY-SIDE POSTCARD MODE (No dragging needed, super clear on mobile & desktop) */
              <div className="p-4 sm:p-6 bg-[#EAE0CE]/60 flex-1 flex flex-col justify-between gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                  {/* Left Card: ANTES */}
                  <div className="rounded-lg border border-[#C8BBA4] bg-[#FAF6EE] p-2.5 flex flex-col justify-between shadow-xs">
                    <div className="relative aspect-[4/5] rounded overflow-hidden bg-[#181512]">
                      <img
                        src={activeCase.beforeImage}
                        alt={`Antes: ${activeCase.title}`}
                        className="w-full h-full object-cover grayscale contrast-110 brightness-90"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-[#FAF6EE]/95 border border-[#C8BBA4] text-[#181512] font-mono text-[10px] font-bold uppercase tracking-wider">
                        {activeCase.beforeLabel}
                      </span>
                    </div>
                    <div className="pt-3 px-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#6E6355] font-semibold block">
                        Diagnóstico Inicial
                      </span>
                      <p className="text-xs text-[#4F463B] mt-0.5 leading-relaxed">
                        {activeCase.beforeDetail}
                      </p>
                    </div>
                  </div>

                  {/* Right Card: DESPUÉS */}
                  <div className="rounded-lg border-2 border-[#9E2A2B]/60 bg-[#FAF6EE] p-2.5 flex flex-col justify-between shadow-sm">
                    <div className="relative aspect-[4/5] rounded overflow-hidden bg-[#181512]">
                      <img
                        src={activeCase.afterImage}
                        alt={`Después: ${activeCase.title}`}
                        className="w-full h-full object-cover sepia-[0.06]"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-[#9E2A2B] text-[#FAF6EE] font-mono text-[10px] font-bold uppercase tracking-wider">
                        {activeCase.afterLabel}
                      </span>
                    </div>
                    <div className="pt-3 px-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#9E2A2B] font-semibold block">
                        Resultado Terminado
                      </span>
                      <p className="text-xs text-[#181512] font-medium mt-0.5 leading-relaxed">
                        {activeCase.afterDetail}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#C8BBA4] text-xs font-mono text-[#4F463B]">
                  <span>Vista comparativa lado a lado en papel</span>
                  <button
                    type="button"
                    onClick={() => setViewMode('slider')}
                    className="text-[#9E2A2B] font-semibold underline cursor-pointer"
                  >
                    Cambiar a cortina interactiva &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right 5 Cols: Technical Breakdown, Ideal Client Profile & 1-Click Booking */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 bg-[#FAF6EE] space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-[#D5C9B4]">
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

              {/* Recommended Hair/Face Type Callout */}
              {activeCase.idealFor && (
                <div className="p-3.5 rounded-lg bg-[#F3ECE0] border border-[#C8BBA4] flex items-start gap-2.5 text-xs">
                  <UserCheck className="w-4 h-4 text-[#9E2A2B] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#9E2A2B] font-bold block">
                      ¿Para quién es ideal este trabajo?
                    </span>
                    <p className="text-[#4F463B] mt-0.5 leading-relaxed">{activeCase.idealFor}</p>
                  </div>
                </div>
              )}

              {/* Before vs After Diagnostic Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-lg bg-[#F3ECE0] border border-[#C8BBA4] space-y-1">
                  <span className="text-[#6E6355] font-bold uppercase block text-[10px] tracking-widest">
                    1. ESTADO INICIAL (ANTES)
                  </span>
                  <p className="text-[#4F463B] leading-relaxed">{activeCase.beforeDetail}</p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#EFE7D6] border border-[#9E2A2B]/45 space-y-1">
                  <span className="font-bold uppercase block text-[10px] tracking-widest text-[#9E2A2B]">
                    2. RESULTADO (DESPUÉS)
                  </span>
                  <p className="text-[#181512] font-medium leading-relaxed">
                    {activeCase.afterDetail}
                  </p>
                </div>
              </div>

              {/* Execution Steps */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#9E2A2B] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#9E2A2B]" />
                  <span>Paso a paso realizado en {config.studioTitle}:</span>
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
                className="w-full py-3.5 px-5 rounded bg-[#9E2A2B] hover:bg-[#822021] text-[#FAF6EE] font-mono text-xs font-semibold uppercase tracking-[0.14em] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-[0_3px_0_#5E1516]"
              >
                <Scissors className="w-4 h-4" />
                <span>Reservar este cambio ({activeCase.priceDisplay})</span>
              </button>
              <p className="text-[11px] font-mono text-[#6E6355] text-center">
                Atención 1 a 1 con {config.authorName} · {config.address}, {config.neighborhood}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};
