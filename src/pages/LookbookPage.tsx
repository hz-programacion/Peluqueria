import React from 'react';
import { StudioMultiGallery } from '../components/StudioMultiGallery';
import { Instagram, ExternalLink, ArrowLeft } from 'lucide-react';
import { resolveInstagramInfo } from '../utils/bookingEngine';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';
import { useStudio } from '../context/StudioContext';

export const LookbookPage: React.FC = () => {
  const { config, navigateTo } = useStudio();
  const igInfo = resolveInstagramInfo(config.instagram);

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
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#9E2A2B] font-semibold">
            <span>Archivo Fotográfico del Estudio</span>
            <span aria-hidden="true">╱</span>
            <span className="text-[#5C5346]">{config.address}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-[#181512] tracking-tight">
            Galería de Fotos{' '}
            <span className="font-editorial italic font-normal text-[#9E2A2B]">
              &amp; Postal del Estudio
            </span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <p className="text-xs font-mono text-[#4F463B] max-w-[44ch]">
            Explorá las fotos subidas por {config.authorName}: cortes al detalle, el estudio por
            dentro y las herramientas de precisión.
          </p>
          <a
            href={igInfo.url}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={playMechanicalHover}
            onClick={playMechanicalClick}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FAF6EE] border border-[#C8BBA4] hover:border-[#9E2A2B] text-xs font-mono font-bold text-[#181512] transition-all whitespace-nowrap shadow-2xs"
          >
            <Instagram className="w-4 h-4 text-[#9E2A2B]" />
            <span>{igInfo.handle}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>
      </div>

      <StudioMultiGallery />
    </div>
  );
};
