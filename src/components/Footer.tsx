import React from 'react';
import { useStudio } from '../context/StudioContext';
import { MapPin, Navigation, ArrowUp, MessageCircle, Lock, Radio } from 'lucide-react';

export const Footer: React.FC = () => {
  const { config, navigateTo, setIsStyleFinderOpen } = useStudio();

  const scrollToTop = () => {
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
              <span className="w-6 h-6 rounded bg-[#D4FF00] text-black font-extrabold flex items-center justify-center text-[10px] font-mono">
                MU
              </span>
              <span className="font-display text-2xl font-black tracking-tight text-white uppercase">
                MORETTI <span className="text-[#D4FF00]">// STUDIO</span>
              </span>
            </div>
            <p className="text-xs uppercase tracking-widest font-mono text-[#D4FF00]">
              Cortes Masculinos &amp; Tapers de Autor · 1 a 1
            </p>
            <p className="text-sm text-zinc-400 max-w-[46ch] leading-relaxed">
              Estudio privado de barbería para hombres en Palermo Soho. Atención dedicada sin salas de espera repletas ni barberos apurados. Máquinas desinfectadas, fade al milímetro y café o cerveza mientras te cortás.
            </p>
            
            {/* Studio Vibe Badge */}
            <div className="pt-2 flex items-center gap-3 text-xs font-mono text-zinc-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#171822] border border-[#272938] text-white">
                <Radio className="w-3.5 h-3.5 text-[#D4FF00] animate-pulse" />
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
                <button onClick={() => navigateTo('home')} className="hover:text-[#D4FF00] transition-colors cursor-pointer">
                  Portada &amp; Vibe
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('services')} className="hover:text-[#D4FF00] transition-colors cursor-pointer">
                  Carta de Cortes &amp; Fades
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('lookbook')} className="hover:text-[#D4FF00] transition-colors cursor-pointer">
                  Lookbook Urbano Masculino
                </button>
              </li>
              <li>
                <button onClick={() => setIsStyleFinderOpen(true)} className="hover:text-[#D4FF00] transition-colors cursor-pointer text-[#D4FF00]">
                  Asesor de Corte Interactivo
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('experience')} className="hover:text-[#D4FF00] transition-colors cursor-pointer">
                  El Estudio &amp; Equipamiento
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('location')} className="hover:text-[#D4FF00] transition-colors cursor-pointer">
                  Ubicación Palermo Soho
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('booking')} className="hover:text-[#D4FF00] transition-colors cursor-pointer text-white font-bold">
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#272938] bg-[#14151E] text-xs font-mono text-zinc-300 hover:text-white hover:border-[#D4FF00] transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-[#D4FF00]" />
                <span>Maps</span>
              </a>
              <a
                href={config.wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#272938] bg-[#14151E] text-xs font-mono text-zinc-300 hover:text-white hover:border-[#D4FF00] transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-[#D4FF00]" />
                <span>Waze</span>
              </a>
              <a
                href={`https://wa.me/${config.whatsappRaw}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#272938] bg-[#14151E] text-xs font-mono text-zinc-300 hover:text-white hover:border-[#D4FF00] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#D4FF00]" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Direct Barbero Admin Gateway */}
            <div className="pt-3 border-t border-[#1E202B]">
              <button
                onClick={() => navigateTo('admin')}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-[#D4FF00] transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-[#D4FF00]" />
                <span>Panel del Barbero / Admin (PIN: 1234)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <p>© {new Date().getFullYear()} MORETTI STUDIO. Grooming urbano masculino de alta precisión.</p>
          <div className="flex items-center gap-4">
            <span>Gorriti 4820 · Piso 2 B</span>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-zinc-400 hover:text-[#D4FF00] transition-colors cursor-pointer"
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
