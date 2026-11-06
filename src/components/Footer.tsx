import React from 'react';
import { useStudio } from '../context/StudioContext';
import { MapPin, Navigation, ArrowUp, MessageCircle, Lock, Radio, Instagram, ExternalLink } from 'lucide-react';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';

export const Footer: React.FC = () => {
  const { config, navigateTo } = useStudio();

  const scrollToTop = () => {
    playMechanicalClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-[#23273A] bg-[#0A0B10] pt-16 pb-24 md:pb-16 text-zinc-300 transition-colors">
      <div className="max-w-[1360px] mx-auto px-6">
        
        {/* Top Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#1E2234]">
          
          {/* Brand & Author Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#A855F7] to-[#FF4655] text-white font-extrabold flex items-center justify-center text-[10px] font-mono shadow-[0_0_12px_rgba(168,85,247,0.4)]">
                RC
              </span>
              <span className="font-display text-2xl font-black tracking-tight text-white uppercase">
                RODRIGO <span className="text-[#FF4655]">CUTSSS</span>
              </span>
            </div>
            <p className="text-xs uppercase tracking-widest font-mono text-[#A855F7] font-bold">
              Cortes Masculinos &amp; Tapers de Autor · 1 a 1
            </p>
            <p className="text-sm text-zinc-400 max-w-[46ch] leading-relaxed">
              Estudio privado de barbería para hombres en <strong>Venado Tuerto, Santa Fe</strong>. Atención dedicada sin salas de espera repletas ni barberos apurados. Fade milimétrico por 12 mil pesos en <strong>Vuelta de Obligado 931</strong>.
            </p>
            
            {/* Studio Vibe Badge */}
            <div className="pt-2 flex items-center gap-3 text-xs font-mono text-zinc-400">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141624] border border-[#272B40] text-white">
                <Radio className="w-3.5 h-3.5 text-[#FF4655] animate-pulse" />
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
                  className="hover:text-[#A855F7] transition-colors cursor-pointer"
                >
                  Portada &amp; Barbero
                </button>
              </li>
              <li>
                <button
                  onClick={() => { playMechanicalClick(); navigateTo('services'); }}
                  onMouseEnter={playMechanicalHover}
                  className="hover:text-[#A855F7] transition-colors cursor-pointer"
                >
                  Carta de Cortes &amp; Fades
                </button>
              </li>
              <li>
                <button
                  onClick={() => { playMechanicalClick(); navigateTo('lookbook'); }}
                  onMouseEnter={playMechanicalHover}
                  className="hover:text-[#A855F7] transition-colors cursor-pointer"
                >
                  Lookbook &amp; Galería Clientes
                </button>
              </li>
              <li>
                <button
                  onClick={() => { playMechanicalClick(); navigateTo('experience'); }}
                  onMouseEnter={playMechanicalHover}
                  className="hover:text-[#A855F7] transition-colors cursor-pointer"
                >
                  El Estudio &amp; Equipamiento
                </button>
              </li>
              <li>
                <button
                  onClick={() => { playMechanicalClick(); navigateTo('location'); }}
                  onMouseEnter={playMechanicalHover}
                  className="hover:text-[#A855F7] transition-colors cursor-pointer"
                >
                  Ubicación Venado Tuerto
                </button>
              </li>
              <li>
                <button
                  onClick={() => { playMechanicalClick(); navigateTo('booking'); }}
                  onMouseEnter={playMechanicalHover}
                  className="hover:text-[#FF4655] transition-colors cursor-pointer text-white font-bold"
                >
                  Reservar Turno Online ($12.000)
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Map Links */}
          <div className="lg:col-span-4 space-y-4">
            <p className="font-mono text-xs uppercase text-zinc-500 tracking-wider mb-4">
              Local &amp; Contacto Directo
            </p>
            <div className="space-y-1 text-xs font-mono text-zinc-300">
              <p className="font-bold text-sm text-white">{config.address}</p>
              <p className="text-zinc-400">{config.neighborhood}</p>
              <p className="text-zinc-400 mt-2">WhatsApp: {config.phoneDisplay}</p>
              <p className="text-zinc-400">Instagram: @rodrigo.cutsss</p>
              <p className="text-zinc-500 text-[11px]">Martes a Sábados · 11:00 a 21:00</p>
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
              <a
                href={config.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={playMechanicalHover}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#272B40] bg-[#141624] text-xs font-mono text-zinc-300 hover:text-white hover:border-[#A855F7] transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-[#FF4655]" />
                <span>Maps</span>
              </a>
              <a
                href={config.wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={playMechanicalHover}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#272B40] bg-[#141624] text-xs font-mono text-zinc-300 hover:text-white hover:border-[#A855F7] transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-[#FF4655]" />
                <span>Waze</span>
              </a>
              <a
                href={`https://wa.me/${config.whatsappRaw}`}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={playMechanicalHover}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#272B40] bg-[#141624] text-xs font-mono text-zinc-300 hover:text-white hover:border-[#FF4655] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#FF4655]" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Direct Barbero Admin Gateway */}
            <div className="pt-3 border-t border-[#1E2234]">
              <button
                onClick={() => { playMechanicalClick(); navigateTo('admin'); }}
                onMouseEnter={playMechanicalHover}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-[#A855F7] transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-[#A855F7]" />
                <span>Panel del Barbero / Admin (PIN: 1234)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Social Media Connection Bar (Instagram & TikTok in Artistic Street Style) */}
        <div className="py-6 border-b border-[#1E2234] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF4655] animate-pulse shadow-[0_0_8px_#FF4655]" />
            <span className="font-mono text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Comunidad Callejera &amp; Historias Diarias:
            </span>
            <span className="hidden sm:inline text-xs text-zinc-500 font-mono">
              Fotos reales de cortes, cancelaciones de turnos y drops
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Instagram Link */}
            <a
              href="https://instagram.com/rodrigo.cutsss"
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={playMechanicalHover}
              onClick={playMechanicalClick}
              aria-label="Instagram @rodrigo.cutsss"
              className="group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141624] border border-[#282D42] hover:border-[#D946EF] shadow-[0_0_15px_rgba(217,70,239,0.12)] hover:shadow-[0_0_20px_rgba(217,70,239,0.25)] text-xs font-mono font-bold transition-all active:scale-95"
            >
              <Instagram className="w-4 h-4 text-[#D946EF] group-hover:scale-110 transition-transform drop-shadow-[0_0_6px_#D946EF]" />
              <span className="text-zinc-200 group-hover:text-white">@rodrigo.cutsss (DM Directo)</span>
              <ExternalLink className="w-3 h-3 text-[#D946EF]/60 group-hover:text-[#D946EF]" />
            </a>

            {/* TikTok Link */}
            <a
              href="https://tiktok.com/@rodrigo.cutsss_vt"
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={playMechanicalHover}
              onClick={playMechanicalClick}
              aria-label="TikTok @rodrigo.cutsss_vt"
              className="group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141624] border border-[#282D42] hover:border-[#FF4655] shadow-[0_0_15px_rgba(255,70,85,0.12)] hover:shadow-[0_0_20px_rgba(255,70,85,0.25)] text-xs font-mono font-bold transition-all active:scale-95"
            >
              <svg
                className="w-4 h-4 text-[#FF4655] group-hover:scale-110 transition-transform drop-shadow-[0_0_6px_#FF4655]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.35a6.37 6.37 0 0 0-.86-.06A6.34 6.34 0 0 0 3 15.63a6.34 6.34 0 0 0 10.82 4.47V10.8a8.16 8.16 0 0 0 5.77 2.15V9.5a4.84 4.84 0 0 1-.22-.01 4.86 4.86 0 0 1-.78-2.8z" />
              </svg>
              <span className="text-zinc-200 group-hover:text-white">@rodrigo.cutsss_vt</span>
              <ExternalLink className="w-3 h-3 text-[#FF4655]/60 group-hover:text-[#FF4655]" />
            </a>
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
              className="inline-flex items-center gap-1 text-zinc-400 hover:text-[#A855F7] transition-colors cursor-pointer"
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
