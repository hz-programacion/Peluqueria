import React from 'react';
import { useStudio } from '../context/StudioContext';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { BarberProfileSection } from '../components/BarberProfileSection';
import { ClientVoices } from '../components/ClientVoices';

export const ExperiencePage: React.FC = () => {
  const { config, navigateTo } = useStudio();

  return (
    <div className="py-10 md:py-16 max-w-7xl mx-auto px-4 sm:px-8 space-y-12 text-[#181512]">
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
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#9E2A2B] font-semibold block">
            Oficio &amp; Atención 1 a 1 · {config.studioTitle}
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-[#181512] tracking-tight">
            {config.authorName} &amp;{' '}
            <span className="font-editorial italic font-normal text-[#9E2A2B]">
              El Estudio Privado
            </span>
          </h1>
        </div>
        <p className="text-xs font-mono text-[#4F463B] max-w-[44ch]">
          &ldquo;{config.heroSubtitle}&rdquo;
        </p>
      </div>

      <BarberProfileSection />

      <ClientVoices />

      <div className="text-center space-y-4 pt-4">
        <button
          onClick={() => navigateTo('booking')}
          className="px-7 py-3.5 bg-[#9E2A2B] text-[#FAF6EE] text-xs font-mono uppercase tracking-wider font-semibold rounded-lg hover:bg-[#822021] transition-all cursor-pointer inline-flex items-center gap-2 shadow-[0_3px_0_#5E1516]"
        >
          <span>Ir a Reservar Turno</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
