import React from 'react';
import { useStudio } from '../context/StudioContext';
import { ThermalReceiptBooking } from '../components/ThermalReceiptBooking';

export const BookingPage: React.FC = () => {
  const { config } = useStudio();

  return (
    <div className="py-8 md:py-16 max-w-[1360px] mx-auto px-4 sm:px-6 space-y-10">
      {/* Editorial Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#232730]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#D4A373]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#D4A373] font-bold">
              DESPACHO AUTOMATIZADO 100% // {config.neighborhood.toUpperCase()}
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
            Emisión de Ticket &amp; Reserva
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-[#111318] border border-[#D4A373]/40 text-xs font-mono font-bold text-[#D4A373] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4A373]" />
            <span>CORTE DE PELO: {config.mainPriceDisplay} · 1 A 1</span>
          </div>
        </div>
      </div>

      {/* Embedded Modern Thermal Booking Engine */}
      <ThermalReceiptBooking />
    </div>
  );
};
