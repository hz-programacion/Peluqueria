import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { Crosshair, Ruler, Scissors, Sparkles, Check, ArrowRight } from 'lucide-react';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';

interface StencilPreset {
  id: string;
  name: string;
  serviceId: string;
  subtitle: string;
  image: string;
  guardSpecs: {
    zone: string;
    tool: string;
    length: string;
    yPct: number;
  }[];
  notes: string;
  stylingTip: string;
}

const PRESETS: StencilPreset[] = [
  {
    id: 'crop',
    name: 'Mid Fade & Crop Texturizado',
    serviceId: 'srv-mid-fade-crop',
    subtitle: 'El corte de autor por excelencia del streetwear',
    image: '/src/assets/images/urban_streetwear_haircut_1793930882291.jpg',
    guardSpecs: [
      { zone: 'Cúspide Texturizada', tool: 'Tijera Kasho 5.5"', length: '35 - 45 mm', yPct: 18 },
      { zone: 'Borde Frontal Recto', tool: 'Navaja Feather Libre', length: 'Escuadra 90°', yPct: 32 },
      { zone: 'Graduación Lateral', tool: 'Wahl Cordless Senior', length: '1.5 - 3.0 mm', yPct: 44 },
      { zone: 'Base Skin Fade', tool: 'Babyliss FX3 Shaver', length: '0.0 mm al ras', yPct: 62 },
    ],
    notes: 'Desvanecido diagonal que despeja el lateral y resalta la mandíbula. Ideal para usar con buzos oversized y cadenas.',
    stylingTip: 'Aplicar 2 toques de Slick Gorilla Powder en cabello seco y desarmar con los dedos hacia adelante.',
  },
  {
    id: 'taper',
    name: 'Low Taper Fade & Caída Libre',
    serviceId: 'srv-taper-lineup',
    subtitle: 'Conserva el volumen y define los límites anatómicos',
    image: '/src/assets/images/urban_taper_curls_1793929259459.jpg',
    guardSpecs: [
      { zone: 'Volumen y Rulos Superiores', tool: 'Peine Afro + Tijera', length: '60 - 80 mm', yPct: 20 },
      { zone: 'Perfilado de Patilla', tool: 'Skeleton Trimmer FX', length: '0.5 mm comprimido', yPct: 40 },
      { zone: 'Nuca Baja en Degradé', tool: 'Shaver Metálica', length: '0.0 mm a piel', yPct: 75 },
    ],
    notes: 'No vacía los costados, por lo que el cabello tiene movimiento orgánico. Perfecto para quienes prefieren rulos o textura media.',
    stylingTip: 'Crema hidratante ligera sin enjuague para definir rizos sin sensación pesada ni acartonada.',
  },
  {
    id: 'beard',
    name: 'Full Combo: Fade + Barba Esculpida',
    serviceId: 'srv-full-experience',
    subtitle: 'Conexión geométrica entre cabello y mandíbula',
    image: '/src/assets/images/urban_barber_hands_detail_1793930883253.jpg',
    guardSpecs: [
      { zone: 'Transición Temporal', tool: 'Wahl Senior Palanca Abierta', length: '1.0 mm', yPct: 28 },
      { zone: 'Línea de Mejilla a Navaja', tool: 'Shavette Japonesa 30°', length: 'Navaja pura', yPct: 52 },
      { zone: 'Cuerpo de Barba Graduado', tool: 'Peine sobre Máquina', length: '9.0 - 12 mm', yPct: 68 },
    ],
    notes: 'Ritual con doble toalla térmica a vapor aromatizada con eucalipto para evitar irritación en pieles sensibles.',
    stylingTip: '3 gotas de aceite botánico frotadas entre las palmas, masajeando desde la raíz hacia las puntas.',
  },
];

export const FadeStencilStudio: React.FC = () => {
  const { navigateTo, setSelectedServiceIds } = useStudio();
  const [activePresetId, setActivePresetId] = useState('crop');
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [showCrosshairs, setShowCrosshairs] = useState(true);
  const [activeFinish, setActiveFinish] = useState<'matte' | 'shine'>('matte');

  const preset = PRESETS.find((p) => p.id === activePresetId) || PRESETS[0];

  const handleBookSetup = () => {
    playMechanicalClick();
    setSelectedServiceIds([preset.serviceId]);
    navigateTo('booking');
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#222432]">
      {/* Editorial Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 bg-[#00F0FF] inline-block shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
            <span className="text-xs font-mono font-bold tracking-widest text-[#00F0FF] uppercase">
              Laboratorio Técnico // Stencil Studio
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white font-display">
            Anatomía del Fade Milimétrico
          </h2>
          <p className="mt-3 text-zinc-400 text-base max-w-2xl">
            Inspeccioná las cotas de graduación, herramientas quirúrgicas y el ángulo de navaja antes de sentarte en el sillón.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-[#14151E] border border-[#272938] rounded-xl self-start">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                playMechanicalClick();
                setActivePresetId(p.id);
              }}
              onMouseEnter={playMechanicalHover}
              className={`px-4 py-2 text-xs font-mono font-bold uppercase transition-all rounded-lg cursor-pointer whitespace-nowrap active:scale-95 ${
                activePresetId === p.id
                  ? 'bg-[#00F0FF] text-black shadow-lg font-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {p.name.split('&')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left: Viewport with Interactive Overlays */}
        <div className="lg:col-span-7 relative bg-[#12131C] border border-[#272938] rounded-2xl overflow-hidden group min-h-[460px] sm:min-h-[540px]">
          {/* Main Photo Asset */}
          <img
            src={preset.image}
            alt={preset.name}
            className="w-full h-full object-cover filter contrast-[1.05]"
            referrerPolicy="no-referrer"
          />

          {/* Vignette & Gritty Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0D12] via-transparent to-black/30 pointer-events-none" />

          {/* Stencil Grid Crosshairs */}
          {showCrosshairs && (
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
              <div className="flex justify-between items-center text-[10px] font-mono text-[#00F0FF]/80">
                <span>[X: 33.7456° S]</span>
                <span>[Y: 61.9688° W · VT]</span>
              </div>
              <div className="absolute top-1/2 left-0 right-0 h-px bg-[#00F0FF]/20 border-b border-dashed border-[#00F0FF]/30" />
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#00F0FF]/20 border-r border-dashed border-[#00F0FF]/30" />
              <div className="flex justify-between items-center text-[10px] font-mono text-[#00F0FF]/80">
                <span>GRID: ANATOMICAL 1:1</span>
                <span>CALIBRATION: 0.0 MM</span>
              </div>
            </div>
          )}

          {/* Visual Millimeter Measurement Markers */}
          {showMeasurements && (
            <div className="absolute inset-0 pointer-events-none">
              {preset.guardSpecs.map((spec, i) => (
                <div
                  key={i}
                  className="absolute left-4 sm:left-8 right-4 sm:right-8 flex items-center gap-3 transition-all"
                  style={{ top: `${spec.yPct}%` }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] shadow-[0_0_12px_#00F0FF] shrink-0" />
                  <div className="h-px flex-1 bg-gradient-to-r from-[#00F0FF]/80 via-[#00F0FF]/30 to-transparent" />
                  <div className="bg-[#0C0D12]/90 border border-[#00F0FF]/40 backdrop-blur-md px-3 py-1 rounded text-right shadow-xl">
                    <div className="text-[11px] font-mono font-bold text-[#00F0FF]">
                      {spec.zone} · {spec.length}
                    </div>
                    <div className="text-[9px] font-mono text-zinc-400">
                      {spec.tool}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Live Controller Floating Pill */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 bg-[#0C0D12]/90 backdrop-blur-md border border-[#272938] p-2.5 rounded-xl">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  playMechanicalClick();
                  setShowMeasurements(!showMeasurements);
                }}
                onMouseEnter={playMechanicalHover}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 ${
                  showMeasurements
                    ? 'bg-[#00F0FF] text-black font-black'
                    : 'bg-[#1C1E2B] text-zinc-400 hover:text-white'
                }`}
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Cotas (mm)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playMechanicalClick();
                  setShowCrosshairs(!showCrosshairs);
                }}
                onMouseEnter={playMechanicalHover}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 ${
                  showCrosshairs
                    ? 'bg-[#00F0FF] text-black font-black'
                    : 'bg-[#1C1E2B] text-zinc-400 hover:text-white'
                }`}
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Retícula</span>
              </button>
            </div>

            <div className="text-[11px] font-mono text-zinc-400 hidden sm:block">
              RODRIGO CUTSSS // ATELIER
            </div>
          </div>
        </div>

        {/* Right: Technical Blueprint Specs & Booking Integration */}
        <div className="lg:col-span-5 bg-[#14151E] border border-[#272938] rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#222432] pb-4 mb-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                  Ficha Técnica de Autor
                </span>
                <h3 className="text-2xl font-bold text-white font-display mt-0.5">
                  {preset.name}
                </h3>
              </div>
              <span className="px-2.5 py-1 bg-[#202230] text-[#00F0FF] font-mono text-xs font-bold rounded">
                CALIDAD 2026
              </span>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed mb-6">
              {preset.notes}
            </p>

            {/* Guard Table */}
            <div className="space-y-3 mb-6">
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-bold">
                Graduación por Secciones
              </div>
              {preset.guardSpecs.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-[#0C0D12] border border-[#222432] rounded-lg text-xs font-mono"
                >
                  <span className="text-zinc-400">{s.zone}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 text-[10px] hidden sm:inline">{s.tool}</span>
                    <span className="text-[#00F0FF] font-bold">{s.length}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Styling Product Selection */}
            <div className="p-4 bg-[#1C1E2B] border border-[#272938] rounded-xl mb-6">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00F0FF] mb-2 uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Recomendación de Styling</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {preset.stylingTip}
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-6 border-t border-[#222432]">
            <button
              type="button"
              onClick={handleBookSetup}
              onMouseEnter={playMechanicalHover}
              className="w-full h-13 bg-[#00F0FF] text-black font-mono font-black text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 hover:bg-[#00D5E5] transition-all cursor-pointer shadow-xl active:scale-95"
            >
              <Scissors className="w-4 h-4" />
              <span>Agendar este Setup ({preset.name.split('&')[0].trim()})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-center text-[11px] font-mono text-zinc-500 mt-2">
              Se aplica directamente al sillón · 1 solo cliente por turno
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
