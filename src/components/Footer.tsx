import React from 'react';
import { useStudio } from '../context/StudioContext';
import { MapPin, Navigation, ArrowUp, MessageCircle, Lock, Instagram } from 'lucide-react';
import { resolveInstagramInfo, resolveWhatsAppInfo } from '../utils/bookingEngine';

export const Footer: React.FC = () => {
  const { config, navigateTo } = useStudio();

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

  return (
    <footer className="border-t border-[#171513]/12 bg-[#171513] text-[#EFEAE1] pt-14 pb-10">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#F7F4EE]/12">
          {/* Brand & Manifesto Summary */}
          <div className="lg:col-span-5 space-y-4">
            <span className="font-display text-3xl font-medium tracking-tight text-[#F7F4EE] block">
              {config.studioTitle || 'Rodrigo Estudio'}
            </span>
            <p className="text-xs uppercase tracking-widest text-[#C8A97E]">
              Estudio de Corte &amp; Autor · Atención Personalizada
            </p>
            <p className="text-sm text-[#B8AFA6] max-w-[44ch] leading-relaxed">
              Un espacio privado pensado para el cuidado del detalle, el trato uno a uno y la calma
              en <strong className="text-[#F7F4EE] font-medium">{config.address}</strong>,{' '}
              {config.neighborhood}.
            </p>
          </div>

          {/* Curated Navigation */}
          <div className="lg:col-span-3 space-y-3">
            <p className="text-xs uppercase tracking-widest text-[#C8A97E]">Recorrido</p>
            <ul className="space-y-2.5 text-sm text-[#D8D0C5]">
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('estudio')}
                  className="hover:text-[#C8A97E] transition-colors cursor-pointer"
                >
                  El Estudio &amp; Manifiesto
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('servicios')}
                  className="hover:text-[#C8A97E] transition-colors cursor-pointer"
                >
                  Catálogo de Servicios
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('obras')}
                  className="hover:text-[#C8A97E] transition-colors cursor-pointer"
                >
                  Obras &amp; Crónicas
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('turnero')}
                  className="hover:text-[#C8A97E] transition-colors cursor-pointer font-medium text-[#F7F4EE]"
                >
                  Reservá tu lugar online
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('ubicacion')}
                  className="hover:text-[#C8A97E] transition-colors cursor-pointer"
                >
                  Ubicación &amp; Horarios
                </button>
              </li>
            </ul>
          </div>

          {/* Direct Local Contact in Venado Tuerto */}
          <div className="lg:col-span-4 space-y-3">
            <p className="text-xs uppercase tracking-widest text-[#C8A97E]">
              Ubicación &amp; Contacto
            </p>
            <div className="space-y-1 text-sm text-[#D8D0C5]">
              <p className="font-medium text-[#F7F4EE]">{config.address}</p>
              <p className="text-[#B8AFA6]">{config.neighborhood}</p>
              <p className="text-[#B8AFA6] pt-1">{config.scheduleDisplay}</p>
              <p className="font-mono text-xs text-[#C8A97E] pt-1">WhatsApp: {waInfo.display}</p>
            </div>

            <div className="pt-2 flex flex-wrap gap-2.5">
              <a
                href={waInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#F7F4EE]/20 hover:border-[#C8A97E] text-xs text-[#F7F4EE] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#C8A97E]" />
                <span>WhatsApp</span>
              </a>
              <a
                href={igInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#F7F4EE]/20 hover:border-[#C8A97E] text-xs text-[#F7F4EE] transition-colors"
              >
                <Instagram className="w-3.5 h-3.5 text-[#C8A97E]" />
                <span>{igInfo.handle}</span>
              </a>
              <a
                href={config.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#F7F4EE]/20 hover:border-[#C8A97E] text-xs text-[#F7F4EE] transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-[#C8A97E]" />
                <span>Google Maps</span>
              </a>
              <a
                href={config.wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#F7F4EE]/20 hover:border-[#C8A97E] text-xs text-[#F7F4EE] transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-[#C8A97E]" />
                <span>Waze</span>
              </a>
            </div>
          </div>
        </div>

        {/* Quiet Bottom Strip */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9E958B]">
          <p>
            © {new Date().getFullYear()} {config.studioTitle}. Estudio de corte y cuidado capilar en{' '}
            {config.neighborhood}.
          </p>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => navigateTo('admin')}
              className="inline-flex items-center gap-1.5 hover:text-[#F7F4EE] transition-colors cursor-pointer"
            >
              <Lock className="w-3 h-3 text-[#C8A97E]" />
              <span>Gestión del Estudio</span>
            </button>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 hover:text-[#F7F4EE] transition-colors cursor-pointer"
            >
              <span>Volver arriba</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
