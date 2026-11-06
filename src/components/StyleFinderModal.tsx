import React, { useState } from 'react';
import { X, ArrowRight, Scissors, Check } from 'lucide-react';
import { useStudio } from '../context/StudioContext';

interface HairOption {
  id: string;
  label: string;
  description: string;
}

interface VibeOption {
  id: string;
  label: string;
  tagline: string;
}

export const StyleFinderModal: React.FC = () => {
  const { isStyleFinderOpen, setIsStyleFinderOpen, services, setSelectedServiceIds, navigateTo } = useStudio();

  const [hairType, setHairType] = useState<string>('lacio');
  const [vibe, setVibe] = useState<string>('crop');
  const [step, setStep] = useState<1 | 2>(1);

  if (!isStyleFinderOpen) return null;

  const hairOptions: HairOption[] = [
    { id: 'lacio', label: 'Lacio / Liso', description: 'Caída recta, dócil o con tendencia a aplastarse' },
    { id: 'ondas', label: 'Ondulado', description: 'Con movimiento natural y textura intermedia' },
    { id: 'rulos', label: 'Rizado / Afro', description: 'Volumen marcado, rulos definidos o espiralados' },
    { id: 'fino', label: 'Fino / Poco volumen', description: 'Requiere técnica de tijera para generar densidad' },
  ];

  const vibeOptions: VibeOption[] = [
    { id: 'crop', label: 'Textured Crop Urbano', tagline: 'Descontracturado, flequillo corto y fade limpio' },
    { id: 'taper', label: 'Taper Fade con Caída', tagline: 'Laterales limpios en patillas y nuca, sin rapar arriba' },
    { id: 'full', label: 'Full Combo: Corte + Barba', tagline: 'Corte completo con perfilado a navaja y toalla caliente' },
    { id: 'bleach', label: 'Bleach & Buzz Platinado', tagline: 'Rapado homogéneo con decoloración blanca polar' },
  ];

  // Match recommendation
  const getRecommendation = () => {
    if (vibe === 'bleach') {
      const match = services.find(s => s.id === 'srv-bleach-buzz') || services[0];
      return {
        service: match,
        cutName: 'Bleach & Buzz Platinado Polar',
        barberFormula: 'Rapado uniforme al 2.5 + Doble decoloración con Plex y matiz plata',
        product: 'Matizador violeta sin sulfatos + cera mate',
        vibeSummary: 'Actitud streetwear pura. Ilumina las facciones y resalta cadenas o piercings.',
      };
    }
    if (vibe === 'full') {
      const match = services.find(s => s.id === 'srv-full-experience') || services[0];
      return {
        service: match,
        cutName: 'Full Experience: Corte + Barba Esculpida',
        barberFormula: 'Mid Fade comprimido + degradé invertido en barba y navaja libre',
        product: 'Polvo voluminizador para el pelo + bálsamo de sándalo en barba',
        vibeSummary: 'El servicio más completo. Te sentás y salís con cada ángulo milimétricamente alineado.',
      };
    }
    if (vibe === 'taper' || hairType === 'rulos') {
      const match = services.find(s => s.id === 'srv-taper-lineup') || services[0];
      return {
        service: match,
        cutName: 'Taper Fade & Line Up Quirúrgico',
        barberFormula: '0 mm focalizado en nuca y patillas · Cúspide intacta con peso orgánico',
        product: 'Activador de rulos o crema de peinado mate base agua',
        vibeSummary: 'El corte favorito del streetwear moderno. Conserva tu textura natural pero con bordes a navaja.',
      };
    }
    // Default crop
    const match = services.find(s => s.id === 'srv-mid-fade-crop') || services[0];
    return {
      service: match,
      cutName: 'Mid Fade & Crop Texturizado',
      barberFormula: 'Skin fade a shaver (0 mm) + cúspide picada a tijera para textura mate',
      product: 'Polvo voluminizador mate (Slick Gorilla o similar)',
      vibeSummary: 'Cero mantenimiento diario: te tirás dos toques de polvo seco y queda listo en 10 segundos.',
    };
  };

  const rec = getRecommendation();

  const handleSelectAndBook = () => {
    setSelectedServiceIds([rec.service.id]);
    setIsStyleFinderOpen(false);
    navigateTo('booking');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-xl bg-[#121318] text-[#F3F3F5] rounded-2xl border border-[#272935] shadow-2xl overflow-hidden p-6 md:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="style-finder-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#232530]">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#D4FF00] text-black">
              <Scissors className="w-4 h-4 stroke-[2.5]" />
            </span>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-widest text-[#D4FF00]">Asesor Urbano Interactivo</p>
              <h2 id="style-finder-title" className="text-xl font-bold font-display tracking-tight text-white">
                Encontrá tu Corte Ideal en 2 Pasos
              </h2>
            </div>
          </div>
          <button
            onClick={() => setIsStyleFinderOpen(false)}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Cerrar asesor de corte"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 my-5 text-xs font-mono">
          <button
            onClick={() => setStep(1)}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              step === 1 ? 'bg-[#D4FF00] text-black' : 'bg-[#1C1D26] text-zinc-400 hover:text-white'
            }`}
          >
            1. Tipo de Pelo
          </button>
          <span className="text-zinc-600">/</span>
          <button
            onClick={() => setStep(2)}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              step === 2 ? 'bg-[#D4FF00] text-black' : 'bg-[#1C1D26] text-zinc-400 hover:text-white'
            }`}
          >
            2. Vibe &amp; Estilo
          </button>
        </div>

        {/* Step 1: Hair Type */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <p className="text-sm text-zinc-400">¿Cómo describirías tu cabello naturalmente?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {hairOptions.map((h) => {
                const isSelected = hairType === h.id;
                return (
                  <button
                    key={h.id}
                    onClick={() => {
                      setHairType(h.id);
                    }}
                    className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#D4FF00] bg-[#181A22] text-white shadow-[0_0_15px_rgba(212,255,0,0.1)]'
                        : 'border-[#232530] bg-[#14151C] text-zinc-300 hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-white">{h.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-[#D4FF00]" />}
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{h.description}</p>
                  </button>
                );
              })}
            </div>
            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#D4FF00] text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#bce400] transition-colors cursor-pointer"
              >
                Siguiente Paso
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Vibe Options & Match */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <p className="text-sm text-zinc-400">¿Qué tipo de resultado buscás llevarte del local?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {vibeOptions.map((v) => {
                const isSelected = vibe === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setVibe(v.id)}
                    className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#D4FF00] bg-[#181A22] text-white shadow-[0_0_15px_rgba(212,255,0,0.1)]'
                        : 'border-[#232530] bg-[#14151C] text-zinc-300 hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-white">{v.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-[#D4FF00]" />}
                    </div>
                    <p className="text-xs text-zinc-400">{v.tagline}</p>
                  </button>
                );
              })}
            </div>

            {/* Recommendation Box */}
            <div className="mt-4 p-4 rounded-xl bg-[#171821] border border-[#2B2E3D]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#D4FF00] uppercase">
                  Recomendación para Vos
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  {rec.service.durationMinutes} min · ${rec.service.price.toLocaleString('es-AR')}
                </span>
              </div>
              <h3 className="text-base font-bold font-display text-white mb-1">{rec.cutName}</h3>
              <p className="text-xs text-zinc-300 mb-2 leading-relaxed">{rec.vibeSummary}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#252735] text-[11px] text-zinc-400 font-mono">
                <div>
                  <span className="text-zinc-500 block">Fórmula técnica:</span>
                  <span className="text-zinc-200">{rec.barberFormula}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Producto sugerido:</span>
                  <span className="text-zinc-200">{rec.product}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="text-xs text-zinc-400 hover:text-white underline transition-colors cursor-pointer"
              >
                Volver a cambiar pelo
              </button>
              <button
                onClick={handleSelectAndBook}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#D4FF00] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl hover:bg-[#bce400] transition-colors shadow-lg cursor-pointer"
              >
                Agendar Este Corte
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
