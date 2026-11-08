import React, { useRef } from 'react';
import { useStudio } from '../context/StudioContext';
import { MapPin, Navigation, ArrowUp, MessageCircle, Instagram, Shield } from 'lucide-react';
import { resolveInstagramInfo, resolveWhatsAppInfo } from '../utils/bookingEngine';
import { RetroFooterBandaMonument, RetroRiverCrestBadge } from './RetroPaperBanda';

export const Footer: React.FC = () => {
  const { config, navigateTo, isAdminAuthenticated } = useStudio();
  const copyrightClicksRef = useRef<{ count: number; lastTime: number }>({
    count: 0,
    lastTime: 0,
  });

  const igInfo = resolveInstagramInfo(config.instagram);
  const waInfo = resolveWhatsAppInfo(config.phoneDisplay, config.whatsappRaw);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigateTo('home', sectionId);
    }
  };

  // Discreet triple-click handler on copyright line for the studio owner
  const handleSecretCopyrightClick = () => {
    const now = Date.now();
    if (now - copyrightClicksRef.current.lastTime < 650) {
      copyrightClicksRef.current.count += 1;
    } else {
      copyrightClicksRef.current.count = 1;
    }
    copyrightClicksRef.current.lastTime = now;

    if (copyrightClicksRef.current.count >= 3) {
      copyrightClicksRef.current.count = 0;
      navigateTo('admin');
    }
  };

  return (
    <footer className="relative bg-[#E8DFCE] text-[#181512] pt-12 sm:pt-14 pb-8 border-t-2 border-[#C5B79F] overflow-hidden">
      {/* Subtle Aged-Paper & Carmine Double Top Rule */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#C5B79F] via-[#9E2A2B] to-[#C5B79F]" />

      {/* Decorative Aged-Paper & Subtle River Plate Diagonal Red Sash Monument */}
      <RetroFooterBandaMonument
        studioTitle={config.studioTitle || 'Rodrigo Cutsss'}
        address={config.address || 'Vuelta de Obligado 931'}
        neighborhood={config.neighborhood || 'Venado Tuerto, Santa Fe'}
        onBookClick={() => scrollToSection('turnero')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-10 border-b border-[#C5B79F]">
          {/* Brand & Studio Summary */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-3">
              <RetroRiverCrestBadge size="md" />
              <span className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#181512] block">
                {config.studioTitle || 'Rodrigo Cutsss'}
              </span>
            </div>

            <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#9E2A2B] font-semibold">
              Peluquería &amp; Barbería de Autor · Venado Tuerto
            </p>
            <p className="text-sm text-[#4F463B] max-w-[44ch] leading-relaxed">
              Atención personalizada uno a uno, fades de precisión, corte a tijera y perfilado de
              barba en <strong className="text-[#181512] font-semibold">{config.address}</strong>,{' '}
              {config.neighborhood}.
            </p>
          </div>

          {/* Curated Navigation */}
          <div className="lg:col-span-3 space-y-3">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#9E2A2B] font-semibold">
              Índice del Estudio
            </p>
            <ul className="space-y-2.5 text-sm text-[#4F463B]">
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('turnero')}
                  className="hover:text-[#9E2A2B] transition-colors cursor-pointer font-semibold text-[#181512]"
                >
                  Sacar Turno Online
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('servicios')}
                  className="hover:text-[#9E2A2B] transition-colors cursor-pointer"
                >
                  Carta de Servicios &amp; Precios
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('transformaciones')}
                  className="hover:text-[#9E2A2B] transition-colors cursor-pointer"
                >
                  Antes &amp; Después
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('obras')}
                  className="hover:text-[#9E2A2B] transition-colors cursor-pointer"
                >
                  Archivo Fotográfico
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('estudio')}
                  className="hover:text-[#9E2A2B] transition-colors cursor-pointer"
                >
                  Conocé a {config.authorName}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('ubicacion')}
                  className="hover:text-[#9E2A2B] transition-colors cursor-pointer"
                >
                  Ubicación &amp; Horarios
                </button>
              </li>
            </ul>
          </div>

          {/* Direct Local Contact in Venado Tuerto */}
          <div className="lg:col-span-4 space-y-3">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#9E2A2B] font-semibold">
              Estudio &amp; Contacto Directo
            </p>
            <div className="space-y-1 text-sm text-[#4F463B]">
              <p className="font-semibold text-[#181512]">{config.address}</p>
              <p className="text-[#5C5346]">{config.neighborhood}</p>
              <p className="text-[#5C5346] pt-1">{config.scheduleDisplay}</p>
              <p className="font-mono text-xs text-[#9E2A2B] font-semibold pt-1">
                WhatsApp: {waInfo.display}
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
              <a
                href={waInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded border border-[#C5B79F] bg-[#FAF6EE] hover:border-[#9E2A2B] text-xs font-mono font-semibold text-[#181512] transition-colors shadow-2xs"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#9E2A2B]" />
                <span>WhatsApp</span>
              </a>
              <a
                href={igInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded border border-[#C5B79F] bg-[#FAF6EE] hover:border-[#9E2A2B] text-xs font-mono font-semibold text-[#181512] transition-colors shadow-2xs"
              >
                <Instagram className="w-3.5 h-3.5 text-[#9E2A2B]" />
                <span>{igInfo.handle}</span>
              </a>
              <a
                href={config.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded border border-[#C5B79F] bg-[#FAF6EE] hover:border-[#9E2A2B] text-xs font-mono font-semibold text-[#181512] transition-colors shadow-2xs"
              >
                <MapPin className="w-3.5 h-3.5 text-[#9E2A2B]" />
                <span>Google Maps</span>
              </a>
              <a
                href={config.wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded border border-[#C5B79F] bg-[#FAF6EE] hover:border-[#9E2A2B] text-xs font-mono font-semibold text-[#181512] transition-colors shadow-2xs"
              >
                <Navigation className="w-3.5 h-3.5 text-[#9E2A2B]" />
                <span>Waze</span>
              </a>
            </div>
          </div>
        </div>

        {/* Quiet Bottom Strip (Stealth Admin via triple-click on copyright; zero visible Admin button for regular visitors) */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6E6355] font-mono">
          <p
            onClick={handleSecretCopyrightClick}
            className="select-none cursor-default"
            title={`© ${new Date().getFullYear()} ${config.studioTitle}`}
          >
            © {new Date().getFullYear()} {config.studioTitle} · {config.address},{' '}
            {config.neighborhood}.
          </p>

          <div className="flex items-center gap-5">
            {isAdminAuthenticated && (
              <button
                type="button"
                onClick={() => navigateTo('admin')}
                className="inline-flex items-center gap-1.5 text-[#9E2A2B] hover:text-[#181512] font-semibold transition-colors cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Sesión Admin Activa · Abrir Panel</span>
              </button>
            )}

            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-[#5C5346] hover:text-[#181512] font-semibold transition-colors cursor-pointer"
            >
              <span>Volver arriba</span>
              <ArrowUp className="w-3.5 h-3.5 text-[#9E2A2B]" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
