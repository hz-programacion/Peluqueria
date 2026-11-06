import React from 'react';
import { useStudio } from '../context/StudioContext';
import { ThermalReceiptBooking } from '../components/ThermalReceiptBooking';
import { Sparkles, Barcode } from 'lucide-react';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';

export const BookingPage: React.FC = () => {
  const { setIsStyleFinderOpen } = useStudio();

  return (
    <div className="py-8 md:py-16 max-w-[1360px] mx-auto px-4 sm:px-6 space-y-10">
      {/* Editorial Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#222432]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 bg-[#00F0FF] inline-block shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#00F0FF] font-bold">
              DESPACHO AUTOMATIZADO 100% // VENADO TUERTO
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
            Emisión de Ticket &amp; Reserva
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              playMechanicalClick();
              setIsStyleFinderOpen(true);
            }}
            onMouseEnter={playMechanicalHover}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#181A24] border border-[#2D3040] text-xs font-mono font-bold text-zinc-200 hover:border-[#00F0FF] hover:text-[#00F0FF] transition-colors whitespace-nowrap cursor-pointer shadow-md active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>¿Dudas con el fade? Abrir Asesor</span>
          </button>
        </div>
      </div>

      {/* Embedded Modern Thermal Booking Engine */}
      <ThermalReceiptBooking />
    </div>
  );
};
