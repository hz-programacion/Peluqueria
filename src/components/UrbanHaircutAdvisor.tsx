import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scissors,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Sliders,
  Layers,
  Zap,
  Clock,
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { formatPriceARS } from '../utils/bookingEngine';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';

export type HairTextureId = 'straight' | 'wavy' | 'curly' | 'coarse';
export type FaceStructureId = 'angular' | 'oval' | 'round' | 'elongated';
export type StyleGoalId = 'skin_fade' | 'low_taper' | 'fade_beard' | 'platinum_color';

interface VisagismoRecommendation {
  headline: string;
  subheadline: string;
  guardFormula: string;
  maintenanceWindow: string;
  stylingProduct: string;
  matchedServiceKeyword: string;
  defaultServiceId: string;
  badgeColor: string;
}

export function computeVisagismoPrescription(
  texture: HairTextureId,
  face: FaceStructureId,
  goal: StyleGoalId
): VisagismoRecommendation {
  if (goal === 'platinum_color') {
    return {
      headline: 'Platinado Hielo Global / Reflejos + Mid o Burst Fade',
      subheadline:
        'Decoloración controlada por etapas con matizador violeta ceniza y degradé 0.0mm para máximo contraste.',
      guardFormula: 'Shaver 0.0mm → Trimmer T → Alzada #0.5 a #1.5 + Tijera Texturizadora',
      maintenanceWindow: 'Retoque de fade cada 14 días · Matizado cada 25 días',
      stylingProduct: 'Cera Mate + Óleo Nutritivo Post-Color',
      matchedServiceKeyword: 'Platinado',
      defaultServiceId: 'srv-04',
      badgeColor: '#00F0FF',
    };
  }

  if (goal === 'fade_beard') {
    return {
      headline: 'Skin Fade / Crop + Ritual de Barba al Vapor con Toalla Caliente',
      subheadline:
        face === 'round'
          ? 'Ángulos de barba escuadrados en mandíbula y volumen superior para estilizar la estructura facial.'
          : 'Conexión milimétrica entre patilla en fade y perfilado de barba con trimmer en T y shaver hipoalergénica.',
      guardFormula: 'Fade 0.0mm a #2 · Perfilado geométrico de pómulos y cuello con vapor de ozono',
      maintenanceWindow: 'Cada 10 a 14 días para mantener líneas de barba y nuca',
      stylingProduct: 'Polvo Texturizador Mate + Bálsamo Hidratante de Barba',
      matchedServiceKeyword: 'Barba',
      defaultServiceId: 'srv-02',
      badgeColor: '#FF5500',
    };
  }

  if (goal === 'low_taper' || texture === 'curly') {
    return {
      headline:
        texture === 'curly'
          ? 'Low Taper Fade de Precisión + Definición de Rulos / Esponja'
          : 'Low Taper Limpio en Patillas & Nuca + Caída Natural a Tijera',
      subheadline:
        face === 'elongated'
          ? 'Conservamos densidad en los laterales superiores para equilibrar las proporciones del rostro.'
          : 'Desvanecido limpio únicamente en sienes y nuca manteniendo movimiento y textura arriba.',
      guardFormula: 'Shaver 0.0mm en patilla baja → #0.5 → #1.5 + Point Cutting a tijera arriba',
      maintenanceWindow: 'Cada 15 a 20 días (crecimiento muy orgánico)',
      stylingProduct:
        texture === 'curly' ? 'Crema Activadora de Rulos + Difusor' : 'Polvo Voluminizador Mate',
      matchedServiceKeyword: 'Corte',
      defaultServiceId: 'srv-01',
      badgeColor: '#CCFF00',
    };
  }

  // Default: skin_fade / burst fade / textured crop
  return {
    headline:
      face === 'round'
        ? 'Mid-High Skin Fade 0.0mm + French Crop con Volumen Frontal'
        : 'Burst Fade / Mid Skin Fade 0.0mm + Textured Crop 2026',
    subheadline:
      texture === 'straight'
        ? 'Desmechado profundo con tijera de entresacar para romper la rigidez del pelo lacio y lograr capas dinámicas.'
        : 'Arco comprimido detrás de la oreja o caída limpia en nuca con transición sin líneas visibles.',
    guardFormula: 'Shaver Titanio 0.0mm → Clipper 0.2mm → #0.5 → #1.5 abierta + Tijera de Filo Dulce',
    maintenanceWindow: 'Cada 10 a 14 días para conservar el efecto 0.0mm',
    stylingProduct: 'Polvo Texturizador de Efecto Seco (Cero Brillo)',
    matchedServiceKeyword: 'Corte',
    defaultServiceId: 'srv-01',
    badgeColor: '#F59E0B',
  };
}

const TEXTURE_OPTIONS: { id: HairTextureId; label: string; detail: string }[] = [
  { id: 'straight', label: 'Lacio / Fino', detail: 'Requiere textura a tijera y polvo mate' },
  { id: 'wavy', label: 'Ondulado / Medio', detail: 'Ideal para Crops y Burst Fades' },
  { id: 'curly', label: 'Rulos / Afro', detail: 'Especial para Low Taper y esponja' },
  { id: 'coarse', label: 'Grueso / Rebelde', detail: 'Control de volumen y descarga interna' },
];

const FACE_OPTIONS: { id: FaceStructureId; label: string; detail: string }[] = [
  { id: 'oval', label: 'Ovalado / Equilibrado', detail: 'Admite cualquier altura de fade' },
  { id: 'angular', label: 'Angular / Cuadrado', detail: 'Resalta con líneas rectas y Crop' },
  { id: 'round', label: 'Redondo', detail: 'Favorece altura arriba y laterales al ras' },
  { id: 'elongated', label: 'Alargado / Diamante', detail: 'Mejor con Low Taper y flequillo' },
];

const GOAL_OPTIONS: { id: StyleGoalId; label: string; tag: string }[] = [
  { id: 'skin_fade', label: 'Degradé al Ras 0.0mm (Burst / Skin Fade)', tag: 'TENDENCIA #1' },
  { id: 'low_taper', label: 'Caída Natural & Patillas Limpias (Low Taper)', tag: 'CLEAN LOOK' },
  { id: 'fade_beard', label: 'Corte + Ritual de Barba con Toalla al Vapor', tag: 'COMBO COMPLETO' },
  { id: 'platinum_color', label: 'Cambio Radical: Platinado Hielo / Reflejos', tag: 'COLOR ART' },
];

interface UrbanHaircutAdvisorProps {
  onApplyRecommendation?: (serviceId: string) => void;
}

export const UrbanHaircutAdvisor: React.FC<UrbanHaircutAdvisorProps> = ({
  onApplyRecommendation,
}) => {
  const { services, setSelectedServiceIds, config } = useStudio();
  const [texture, setTexture] = useState<HairTextureId>('wavy');
  const [face, setFace] = useState<FaceStructureId>('oval');
  const [goal, setGoal] = useState<StyleGoalId>('skin_fade');

  const prescription = computeVisagismoPrescription(texture, face, goal);

  const visibleServices = services.filter((s) => !s.hidden);
  const matchedService =
    visibleServices.find((s) =>
      s.name.toLowerCase().includes(prescription.matchedServiceKeyword.toLowerCase())
    ) ||
    visibleServices.find((s) => s.id === prescription.defaultServiceId) ||
    visibleServices[0];

  const handleBookRecommended = () => {
    playMechanicalClick();
    if (matchedService) {
      setSelectedServiceIds([matchedService.id]);
      if (onApplyRecommendation) {
        onApplyRecommendation(matchedService.id);
      } else {
        const el = document.getElementById('reservar');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="rounded-2xl bg-[#090B11] border border-[#262C3C] p-5 sm:p-7 shadow-2xl relative overflow-hidden distressed-surface">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 mb-6 border-b border-[#1E2332] relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] font-mono text-[11px] font-black uppercase tracking-widest mb-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>DIAGNÓSTICO INTERACTIVO DE VISAGISMO 2026</span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Asesor de Corte &amp; <span className="urban-aerosol-gradient">Fórmula de Máquina</span>
          </h3>
        </div>
        <p className="text-xs sm:text-sm font-mono text-zinc-300 max-w-md">
          Seleccioná tu tipo de pelo, estructura facial y el estilo que buscás para ver la receta
          técnica que aplica <strong className="text-white">{config.authorName}</strong> en el sillón.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative z-10">
        {/* Left 7 Cols: Interactive 3-Parameter Visagismo Selector */}
        <div className="lg:col-span-7 space-y-5 font-mono text-xs">
          {/* 1. Hair Texture */}
          <div>
            <span className="text-zinc-300 font-bold uppercase tracking-wider block mb-2">
              01. Tu Textura de Pelo:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TEXTURE_OPTIONS.map((opt) => {
                const active = texture === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      playMechanicalClick();
                      setTexture(opt.id);
                    }}
                    onMouseEnter={playMechanicalHover}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      active
                        ? 'bg-[#171B26] border-[#F59E0B] text-white shadow-md'
                        : 'bg-[#0E1118] border-[#222736] text-zinc-400 hover:text-white hover:border-zinc-500'
                    }`}
                  >
                    <span className="font-black block text-xs text-white">{opt.label}</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5 leading-snug">
                      {opt.detail}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Face Structure */}
          <div>
            <span className="text-zinc-300 font-bold uppercase tracking-wider block mb-2">
              02. Formato / Estructura de Rostro:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FACE_OPTIONS.map((opt) => {
                const active = face === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      playMechanicalClick();
                      setFace(opt.id);
                    }}
                    onMouseEnter={playMechanicalHover}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      active
                        ? 'bg-[#171B26] border-[#00F0FF] text-white shadow-md'
                        : 'bg-[#0E1118] border-[#222736] text-zinc-400 hover:text-white hover:border-zinc-500'
                    }`}
                  >
                    <span className="font-black block text-xs text-white">{opt.label}</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5 leading-snug">
                      {opt.detail}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Style Goal */}
          <div>
            <span className="text-zinc-300 font-bold uppercase tracking-wider block mb-2">
              03. Objetivo de Look en el Estudio:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {GOAL_OPTIONS.map((opt) => {
                const active = goal === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      playMechanicalClick();
                      setGoal(opt.id);
                    }}
                    onMouseEnter={playMechanicalHover}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      active
                        ? 'bg-[#171B26] border-[#CCFF00] text-white shadow-md'
                        : 'bg-[#0E1118] border-[#222736] text-zinc-300 hover:text-white hover:border-zinc-500'
                    }`}
                  >
                    <span className="font-bold text-xs">{opt.label}</span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded shrink-0 ${
                        active
                          ? 'bg-[#CCFF00] text-zinc-950'
                          : 'bg-[#181C26] text-zinc-400 border border-[#272D3D]'
                      }`}
                    >
                      {opt.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Live Prescription Output Card */}
        <div className="lg:col-span-5 flex">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${texture}-${face}-${goal}`}
              initial={{ opacity: 0.6, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full rounded-2xl bg-[#111520] border-2 border-[#F59E0B]/70 p-5 sm:p-6 flex flex-col justify-between space-y-5 shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 font-mono text-[11px]">
                  <span
                    className="px-2.5 py-0.5 rounded font-black uppercase tracking-wider text-zinc-950"
                    style={{ backgroundColor: prescription.badgeColor }}
                  >
                    RECETA TÉCNICA RECOMENDADA
                  </span>
                  <span className="text-zinc-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Visagismo 1 a 1</span>
                  </span>
                </div>

                <h4 className="font-display text-xl sm:text-2xl font-black text-white uppercase leading-tight">
                  {prescription.headline}
                </h4>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {prescription.subheadline}
                </p>

                <div className="space-y-2 pt-2 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-[#0A0C12] border border-[#222838]">
                    <span className="text-[10px] uppercase text-[#00F0FF] font-bold flex items-center gap-1 mb-0.5">
                      <Layers className="w-3 h-3" />
                      Fórmula de Alzadas &amp; Tijera:
                    </span>
                    <span className="text-zinc-200 font-semibold block">
                      {prescription.guardFormula}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-[#0A0C12] border border-[#222838]">
                      <span className="text-[10px] uppercase text-[#F59E0B] font-bold flex items-center gap-1 mb-0.5">
                        <Zap className="w-3 h-3" />
                        Acabado Final:
                      </span>
                      <span className="text-zinc-200 text-[11px] font-semibold block">
                        {prescription.stylingProduct}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#0A0C12] border border-[#222838]">
                      <span className="text-[10px] uppercase text-[#CCFF00] font-bold flex items-center gap-1 mb-0.5">
                        <Clock className="w-3 h-3" />
                        Frecuencia Ideal:
                      </span>
                      <span className="text-zinc-200 text-[11px] font-semibold block">
                        {prescription.maintenanceWindow}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {matchedService && (
                <div className="pt-4 border-t border-[#242A3A] space-y-3">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase block">
                        Servicio en Carta sugerido:
                      </span>
                      <span className="font-bold text-white flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#CCFF00]" />
                        {matchedService.name} ({matchedService.durationMinutes} min)
                      </span>
                    </div>
                    <span className="font-mono font-black text-lg text-[#F59E0B] tabular-nums">
                      {formatPriceARS(matchedService.price)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleBookRecommended}
                    onMouseEnter={playMechanicalHover}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-zinc-950 font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95"
                  >
                    <Scissors className="w-4 h-4" />
                    <span>Aplicar Diagnóstico y Reservar Turno</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
