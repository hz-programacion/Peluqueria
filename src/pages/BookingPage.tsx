import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { ThermalReceiptBooking } from '../components/ThermalReceiptBooking';

export const BookingPage: React.FC = () => {
  const { config, navigateTo } = useStudio();

  return (
    <div className="py-10 md:py-16 max-w-7xl mx-auto px-4 sm:px-8 space-y-10 text-[#181512]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#C8BBA4]">
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#9E2A2B] hover:underline font-semibold cursor-pointer mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Portada</span>
          </button>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#9E2A2B] font-semibold">
            <span>Registro de Turnos en Vivo</span>
            <span aria-hidden="true">╱</span>
            <span className="text-[#5C5346]">
              {config.address}, {config.neighborhood}
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-[#171513] tracking-tight">
            Reservá tu lugar en{' '}
            <span className="font-editorial italic font-normal text-[#9E2A2B]">
              {config.studioTitle}
            </span>
          </h1>
        </div>
        <p className="text-sm text-[#4F463B] max-w-md">
          Seleccioná tu servicio, fecha y horario disponible en tres pasos simples o consultá tu
          turno confirmado.
        </p>
      </div>

      <ThermalReceiptBooking />
    </div>
  );
};
