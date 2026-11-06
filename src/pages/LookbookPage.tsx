import React from 'react';
import { StudioMultiGallery } from '../components/StudioMultiGallery';
import { Instagram, ExternalLink, Camera } from 'lucide-react';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';

export const LookbookPage: React.FC = () => {
  return (
    <div className="py-8 md:py-16 max-w-[1380px] mx-auto px-4 sm:px-6 space-y-10">
      
      {/* Title & Multi-Category Gallery Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#23273A]">
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-mono text-xs">
            <span className="w-2.5 h-2.5 bg-[#FF4655] rounded-sm shadow-[0_0_8px_#FF4655]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#FF4655] font-bold">
              GALERÍA DEL ESTUDIO // CORTES, LOCAL, MÁQUINAS Y CULTURA
            </span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-400 font-bold">Vuelta de Obligado 931</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
            Mural &amp; Galería Multimedia
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <p className="text-xs font-mono text-zinc-400 max-w-[44ch]">
            Explorá fotos de cortes, el estudio por dentro, las máquinas de trabajo y diseños. También podés subir nuevas fotos en cualquier categoría.
          </p>
          <a
            href="https://instagram.com/rodrigo.cutsss"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={playMechanicalHover}
            onClick={playMechanicalClick}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#141624] border border-[#D946EF]/50 text-xs font-mono font-bold text-white hover:bg-[#D946EF]/20 transition-all shadow-[0_0_15px_rgba(217,70,239,0.2)] active:scale-95 whitespace-nowrap"
          >
            <Instagram className="w-4 h-4 text-[#D946EF]" />
            <span>@rodrigo.cutsss</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>
      </div>

      {/* Multi-Category Gallery with Upload Support */}
      <StudioMultiGallery />
    </div>
  );
};
