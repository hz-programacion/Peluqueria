import React, { useState } from 'react';
import { STUDIO_DROPS, StreetwearDrop } from '../data/studioData';
import { useStudio } from '../context/StudioContext';
import { ShoppingBag, ArrowUpRight, Check, Sparkles } from 'lucide-react';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';

export const StreetwearDrops: React.FC = () => {
  const { navigateTo } = useStudio();
  const [addedItem, setAddedItem] = useState<string | null>(null);

  const handleAddDropToBooking = (drop: StreetwearDrop) => {
    playMechanicalClick();
    setAddedItem(drop.id);
    setTimeout(() => {
      setAddedItem(null);
      navigateTo('booking');
    }, 900);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#222432]">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 bg-[#00F0FF] inline-block shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
            <span className="text-xs font-mono font-bold tracking-widest text-[#00F0FF] uppercase">
              Curaduría & Arsenal Urbano
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-display">
            Streetwear Drops & Styling
          </h2>
          <p className="mt-2 text-zinc-400 text-sm max-w-xl">
            Ediciones limitadas de productos seleccionados por Rodrigo para mantener la textura mate y el estilo impecable entre turnos.
          </p>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-xs font-mono text-zinc-500 uppercase block">
            Stock en Local
          </span>
          <span className="text-sm font-mono font-bold text-[#00F0FF]">
            VUELTA DE OBLIGADO 931 · VT
          </span>
        </div>
      </div>

      {/* Grid of Urban Drops */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STUDIO_DROPS.map((drop) => {
          const isAdded = addedItem === drop.id;

          return (
            <div
              key={drop.id}
              className="bg-[#12131C] border border-[#272938] rounded-2xl p-6 flex flex-col justify-between hover:border-[#00F0FF]/50 transition-all group relative overflow-hidden"
            >
              {/* Corner Tape Effect for Urban Look */}
              <div className="absolute top-0 right-0 w-16 h-4 bg-[#00F0FF]/10 border-b border-l border-[#00F0FF]/20 transform rotate-12 translate-x-4 -translate-y-1 pointer-events-none" />

              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-[11px] font-mono text-zinc-500 uppercase">
                    {drop.category}
                  </span>
                  {drop.badge && (
                    <span className="px-2 py-0.5 bg-[#1C1E2B] text-[#00F0FF] font-mono text-[10px] font-bold rounded">
                      {drop.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-[#00F0FF] transition-colors font-display mb-2">
                  {drop.name}
                </h3>

                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  {drop.description}
                </p>

                <div className="p-2.5 bg-[#0A0B10] border border-[#1E202B] rounded-lg mb-6">
                  <span className="text-[10px] font-mono text-zinc-400 block">
                    Especificación Técnica:
                  </span>
                  <span className="text-xs font-mono font-bold text-zinc-200">
                    {drop.spec}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-4 border-t border-[#1E202B] pt-4">
                  <span className="text-xs font-mono text-zinc-500">Precio</span>
                  <span className="text-xl font-mono font-black text-white">
                    ${drop.price.toLocaleString('es-AR')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddDropToBooking(drop)}
                  onMouseEnter={playMechanicalHover}
                  className={`w-full py-2.5 px-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${
                    isAdded
                      ? 'bg-emerald-500 text-black font-black'
                      : 'bg-[#1C1E2B] text-zinc-200 hover:bg-[#00F0FF] hover:text-black hover:font-bold border border-[#2B2E40]'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Agregado al Turno</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Retirar en mi Turno</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
