import React from 'react';
import { useStudio } from '../context/StudioContext';
import {
  MapPin,
  Navigation,
  ArrowUp,
  MessageCircle,
  Lock,
  Instagram,
  ExternalLink,
} from 'lucide-react';
import { resolveInstagramInfo, resolveWhatsAppInfo } from '../utils/bookingEngine';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';

export const Footer: React.FC = () => {
  const { config, navigateTo } = useStudio();

  const igInfo = resolveInstagramInfo(config.instagram);
  const waInfo = resolveWhatsAppInfo(config.phoneDisplay, config.whatsappRaw);
  const tiktokClean = (config.tiktok || '@rodrigo.cutsss_vt').replace(/^@/, '');
  const tiktokDisplay = (config.tiktok || '@rodrigo.cutsss_vt').startsWith('@')
    ? config.tiktok || '@rodrigo.cutsss_vt'
    : `@${config.tiktok}`;

  const scrollToTop = () => {
    playMechanicalClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-[#232730] bg-[#0A0B0E] pt-16 pb-24 md:pb-16 text-zinc-300 transition-colors">
      <div className="max-w-[1360px] mx-auto px-6">
        {/* Top Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#1E222B]">
          {/* Brand & Author Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#D4A373] text-zinc-950 font-extrabold flex items-center justify-center text-[10px] font-mono shadow-sm">
                RC
              </span>
              <span className="font-display text-2xl font-black tracking-tight text-white uppercase">
                {config.authorName.toUpperCase()}{' '}
                <span className="text-[#D4A373]">CUTSSS</span>
              </span>
            </div>
            <p className="text-xs uppercase tracking-widest font-mono text-[#D4A373] font-bold">
              Cortes Masculinos &amp; Tapers de Autor · 1 a 1
            </p>
            <p className="text-sm text-zinc-400 max-w-[46ch] leading-relaxed">
              Estudio privado de barbería para hombres en{' '}
              <strong className="text-zinc-200">{config.neighborhood}</strong>. Atención dedicada sin salas de espera repletas ni barberos apurados. Servicio principal:{' '}
              {config.mainPriceDisplay} en{' '}
              <strong className="text-zinc-200">{config.address}</strong>.
            </p>
          </div>

          {/* Site Navigation */}
          <div className="lg:col-span-3 space-y-3">
            <p className="font-mono text-xs uppercase text-zinc-500 tracking-wider mb-4">
              Mapa del Sitio
            </p>
            <ul className="space-y-2 text-xs tracking-wider uppercase font-semibold text-zinc-400">
              <li>
                <button
                  onClick={() => {
                    playMechanicalClick();
                    navigateTo('home');
                  }}
                  onMouseEnter={playMechanicalHover}
                  className="hover:text-[#D4A373] transition-colors cursor-pointer"
                >
                  Inicio &amp; Módulos
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    playMechanicalClick();
                    navigateTo('services');
                  }}
                  onMouseEnter={playMechanicalHover}
                  className="hover:text-[#D4A373] transition-colors cursor-pointer"
                >
                  Carta de Cortes &amp; Fades
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    playMechanicalClick();
                    navigateTo('lookbook');
                  }}
                  onMouseEnter={playMechanicalHover}
                  className="hover:text-[#D4A373] transition-colors cursor-pointer"
                >
                  Galería de Fotos
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    playMechanicalClick();
                    navigateTo('experience');
                  }}
                  onMouseEnter={playMechanicalHover}
                  className="hover:text-[#D4A373] transition-colors cursor-pointer"
                >
                  El Barbero &amp; Equipamiento
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    playMechanicalClick();
                    navigateTo('location');
                  }}
                  onMouseEnter={playMechanicalHover}
                  className="hover:text-[#D4A373] transition-colors cursor-pointer"
                >
                  Ubicación {config.neighborhood}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    playMechanicalClick();
                    navigateTo('booking');
                  }}
                  onMouseEnter={playMechanicalHover}
                  className="hover:text-[#D4A373] transition-colors cursor-pointer text-white font-bold"
                >
                  Reservar Turno Online ({config.mainPriceDisplay})
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
              <p className="text-zinc-400 mt-2">WhatsApp: {waInfo.display}</p>
              <p className="text-zinc-400">Instagram: {igInfo.handle}</p>
              <p className="text-zinc-500 text-[11px]">{config.scheduleDisplay}</p>
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
              <a
                href={config.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={playMechanicalHover}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#282D37] bg-[#111318] text-xs font-mono text-zinc-300 hover:text-white hover:border-[#D4A373] transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>Maps</span>
              </a>
              <a
                href={config.wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={playMechanicalHover}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#282D37] bg-[#111318] text-xs font-mono text-zinc-300 hover:text-white hover:border-[#D4A373] transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>Waze</span>
              </a>
              <a
                href={waInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={playMechanicalHover}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#282D37] bg-[#111318] text-xs font-mono text-zinc-300 hover:text-white hover:border-[#D4A373] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Direct Barbero Admin Gateway */}
            <div className="pt-3 border-t border-[#1E222B]">
              <button
                onClick={() => {
                  playMechanicalClick();
                  navigateTo('admin');
                }}
                onMouseEnter={playMechanicalHover}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-[#D4A373] transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>Panel del Barbero / Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Social Media Connection Bar */}
        <div className="py-6 border-b border-[#1E222B] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#D4A373]" />
            <span className="font-mono text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Comunidad &amp; Historias Diarias:
            </span>
            <span className="hidden sm:inline text-xs text-zinc-500 font-mono">
              Fotos reales de cortes, disponibilidad de turnos y novedades
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Instagram Link */}
            <a
              href={igInfo.url}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={playMechanicalHover}
              onClick={playMechanicalClick}
              aria-label={`Instagram ${igInfo.handle}`}
              className="group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#111318] border border-[#282D37] hover:border-[#D4A373] text-xs font-mono font-bold transition-all active:scale-95"
            >
              <Instagram className="w-4 h-4 text-[#D4A373]" />
              <span className="text-zinc-200 group-hover:text-white">
                {igInfo.handle} (DM Directo)
              </span>
              <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-[#D4A373]" />
            </a>

            {/* TikTok Link */}
            <a
              href={`https://tiktok.com/@${tiktokClean}`}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={playMechanicalHover}
              onClick={playMechanicalClick}
              aria-label={`TikTok ${tiktokDisplay}`}
              className="group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#111318] border border-[#282D37] hover:border-[#D4A373] text-xs font-mono font-bold transition-all active:scale-95"
            >
              <span className="text-zinc-200 group-hover:text-white">{tiktokDisplay}</span>
              <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-[#D4A373]" />
            </a>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <p>
            © {new Date().getFullYear()} {config.studioTitle.toUpperCase()}. Barbería contemporánea masculina en {config.neighborhood}.
          </p>
          <div className="flex items-center gap-4">
            <span>{config.address}</span>
            <button
              onClick={scrollToTop}
              onMouseEnter={playMechanicalHover}
              className="inline-flex items-center gap-1 text-zinc-400 hover:text-[#D4A373] transition-colors cursor-pointer"
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
