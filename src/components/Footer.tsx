import React from 'react';
import { useStudio } from '../context/StudioContext';
import { MapPin, Navigation, ArrowUp, MessageCircle, Lock, Radio } from 'lucide-react';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';

export const Footer: React.FC = () => {
  const { config, navigateTo, setIsStyleFinderOpen } = useStudio();

  const scrollToTop = () => {
    playMechanicalClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-[#232532] bg-[#0A0B10] pt-16 pb-24 md:pb-16 text-zinc-300 transition-colors">
      <div className="max-w-[1360px] mx-auto px-6">
        
        {/* Top Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#1E202B]">
          
          {/* Brand & Author Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-[#00F0FF] text-black font-extrabold flex items-center justify-center text-[10px] font-mono shadow-[0_0_8px_#00F0FF]">
                RC
              </span>
              <span className="font-display text-2xl font-black tracking-tight text-white uppercase">
                RODRIGO <span className="text-[#00F0FF]">CUTSSS</span>
              </span>
            </div>
            <p className="text-xs uppercase tracking-widest font-mono text-[#00F0FF] font-bold">
              Cortes Masculinos &amp; Tapers de Autor · 1 a 1
            </p>
            <p className="text-sm text-zinc-400 max-w-[46ch] leading-relaxed">
              Estudio privado de barbería para hombres en Venado Tuerto, Santa Fe. Atención dedicada sin salas de espera repletas ni barberos apurados. Fade milimétrico por 12 mil pesos en Vuelta de Obligado 931.
            </p>
            
            {/* Studio Vibe Badge */}
            <div className="pt-2 flex items-center gap-3 text-xs font-mono text-zinc-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#171822] border border-[#272938] text-white">
                <Radio className="w-3.5 h-3.5 text-[#00F0FF] animate-pulse" />
                <span>Sonando: {config.currentVibeTrack}</span>
              </span>
            </div>
          </div>

          {/* Site Navigation */}
          <div className="lg:col-span-3 space-y-3">
            <p className="font-mono text-xs uppercase text-zinc-500 tracking-wider mb-4">
              Mapa del Sitio
            </p>
            <ul className="space-y-2 text-xs tracking-wider uppercase font-semibold text-zinc-400">
              <li>
                <button
                  onClick={() => { playMechanicalClick(); navigateTo('home'); }}
                  onMouseEnter={playMechanicalHover}
                  className="hover:text-[#00F0FF] transition-colors cursor-pointer"
                >
                  Portada &amp; Vibe
                </button>
              </li>
              <li>
                <button
                  onClick={() => { playMechanicalClick(); navigateTo('services'); }}
                  onMouseEnter={playMechanicalHover}
                  className="hover:text-[#00F0FF] transition-colors cursor-pointer"
                >
                  Carta de Cortes &amp; Fades
                </button>
              </li>
              <li>
                <button
                  onClick={() => { playMechanicalClick(); navigateTo('lookbook'); }}
                  onMouseEnter={playMechanicalHover}
                  className="hover:text-[#00F0FF] transition-colors cursor-pointer"
                >
                  Lookbook Urbano Masculino
                </button>
              </li>
              <li>
                <button
                  onClick={() => { playMechanicalClick(); setIsStyleFinderOpen(true); }}
                  onMouseEnter={playMechanicalHover}
                  className="hover:text-[#00F0FF] transition-colors cursor-pointer text-[#00F0FF]"
                >
                  Asesor de Corte Interactivo
                </button>
              </li>
              <li>
                <button
                  onClick={() => { playMechanicalClick(); navigateTo('experience'); }}
                  onMouseEnter={playMechanicalHover}
                  className="hover:text-[#00F0FF] transition-colors cursor-pointer"
                >
                  El Estudio &amp; Equipamiento
                </button>
              </li>
              <li>
                <button
                  onClick={() => { playMechanicalClick(); navigateTo('location'); }}
                  onMouseEnter={playMechanicalHover}
                  className="hover:text-[#00F0FF] transition-colors cursor-pointer"
                >
                  Ubicación Venado Tuerto
                </button>
              </li>
              <li>
                <button
                  onClick={() => { playMechanicalClick(); navigateTo('booking'); }}
                  onMouseEnter={playMechanicalHover}
                  className="hover:text-[#00F0FF] transition-colors cursor-pointer text-white font-bold"
                >
                  Reservar Turno Online
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Map Links */}
          <div className="lg:col-span-4 space-y-4">
            <p className="font-mono text-xs uppercase text-zinc-500 tracking-wider mb-4">
              Local &amp; Contacto
            </p>
            <div className="space-y-1 text-xs font-mono text-zinc-300">
              <p className="font-bold text-sm text-white">{config.address}</p>
              <p className="text-zinc-400">{config.neighborhood}</p>
              <p className="text-zinc-400 mt-2">WhatsApp: {config.phoneDisplay}</p>
              <p className="text-zinc-500 text-[11px]">Martes a Sábados · 11:00 a 21:00</p>
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
              <a
                href={config.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={playMechanicalHover}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#272938] bg-[#14151E] text-xs font-mono text-zinc-300 hover:text-white hover:border-[#00F0FF] transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span>Maps</span>
              </a>
              <a
                href={config.wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={playMechanicalHover}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#272938] bg-[#14151E] text-xs font-mono text-zinc-300 hover:text-white hover:border-[#00F0FF] transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span>Waze</span>
              </a>
              <a
                href={`https://wa.me/${config.whatsappRaw}`}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={playMechanicalHover}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#272938] bg-[#14151E] text-xs font-mono text-zinc-300 hover:text-white hover:border-[#00F0FF] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Direct Barbero Admin Gateway */}
            <div className="pt-3 border-t border-[#1E202B]">
              <button
                onClick={() => { playMechanicalClick(); navigateTo('admin'); }}
                onMouseEnter={playMechanicalHover}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-[#00F0FF] transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span>Panel del Barbero / Admin (PIN: 1234)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <p>© {new Date().getFullYear()} RODRIGO CUTSSS. Barbería contemporánea masculina en Venado Tuerto.</p>
          <div className="flex items-center gap-4">
            <span>Vuelta de Obligado 931</span>
            <button
              onClick={scrollToTop}
              onMouseEnter={playMechanicalHover}
              className="inline-flex items-center gap-1 text-zinc-400 hover:text-[#00F0FF] transition-colors cursor-pointer"
            >
              <span>Subir</span>
              <ArrowUp className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
