import React from 'react';
import { StudioMultiGallery } from '../components/StudioMultiGallery';
import { Instagram, ExternalLink } from 'lucide-react';
import { resolveInstagramInfo } from '../utils/bookingEngine';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';
import { useStudio } from '../context/StudioContext';

export const LookbookPage: React.FC = () => {
  const { config } = useStudio();
  const igInfo = resolveInstagramInfo(config.instagram);

  return (
    <div className="py-8 md:py-16 max-w-[1380px] mx-auto px-4 sm:px-6 space-y-10">
      {/* Title & Multi-Category Gallery Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#232730]">
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-mono text-xs">
            <span className="w-2 h-2 bg-[#D4A373] rounded-full" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#D4A373] font-bold">
              GALERÍA DEL ESTUDIO // CORTES, LOCAL, MÁQUINAS Y CULTURA
            </span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-400 font-bold">{config.address}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
            Mural &amp; Galería Multimedia
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <p className="text-xs font-mono text-zinc-400 max-w-[44ch]">
            Explorá las fotos subidas por {config.authorName}: cortes en detalle, el estudio por dentro y las herramientas de precisión.
          </p>
          <a
            href={igInfo.url}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={playMechanicalHover}
            onClick={playMechanicalClick}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111318] border border-[#282D37] hover:border-[#D4A373] text-xs font-mono font-bold text-white transition-all active:scale-95 whitespace-nowrap"
          >
            <Instagram className="w-4 h-4 text-[#D4A373]" />
            <span>{igInfo.handle}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>
      </div>

      {/* Multi-Category Gallery */}
      <StudioMultiGallery />
    </div>
  );
};
