import React from 'react';
import { useStudio } from '../context/StudioContext';
import { ThermalReceiptBooking } from '../components/ThermalReceiptBooking';
import { Sparkles, Barcode } from 'lucide-react';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';

export const BookingPage: React.FC = () => {
  return (
    <div className="py-8 md:py-16 max-w-[1360px] mx-auto px-4 sm:px-6 space-y-10">
      {/* Editorial Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#222432]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 bg-[#A855F7] inline-block shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#A855F7] font-bold">
              DESPACHO AUTOMATIZADO 100% // VENADO TUERTO
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
            Emisión de Ticket &amp; Reserva
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-[#13151F] border border-[#FF4655]/40 text-xs font-mono font-bold text-[#FF4655] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF4655] animate-pulse" />
            <span>CORTE DE PELO: $12.000 ARS · 1 A 1</span>
          </div>
        </div>
      </div>

      {/* Embedded Modern Thermal Booking Engine */}
      <ThermalReceiptBooking />
    </div>
  );
};
