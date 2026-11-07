import React from 'react';
import { useStudio } from '../context/StudioContext';
import { ThermalReceiptBooking } from '../components/ThermalReceiptBooking';

export const BookingPage: React.FC = () => {
  const { config } = useStudio();

  return (
    <div className="py-12 md:py-20 max-w-[1320px] mx-auto px-5 sm:px-8 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#171513]/12">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#96734E] font-medium">
            <span>Agenda en Vivo</span>
            <span aria-hidden="true">·</span>
            <span>{config.address}, {config.neighborhood}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-medium text-[#171513]">
            Reservá tu lugar en el estudio
          </h1>
        </div>
        <p className="text-sm text-[#575049] max-w-md">
          Seleccioná tu servicio, fecha y horario disponible en tres pasos simples.
        </p>
      </div>

      <ThermalReceiptBooking />
    </div>
  );
};
