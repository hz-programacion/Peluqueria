import React from 'react';
import { MapPin, Navigation, ArrowUp, MessageCircle, Clock, CalendarX2, UserCheck } from 'lucide-react';
import { STUDIO_INFO } from '../data/studioData';

interface ProtocolAndLocationSectionProps {
  liveStatus: {
    isOpen: boolean;
    headline: string;
    subline: string;
  };
  onJumpToBooking: () => void;
}

export const ProtocolAndLocationSection: React.FC<ProtocolAndLocationSectionProps> = ({
  liveStatus,
  onJumpToBooking,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* SECTION 6: Protocolo del Estudio & Reglas de Convivencia */}
      <section className="py-20 md:py-28 border-b border-stone-300/70 dark:border-white/[0.08]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-14">
            <p className="font-mono-tech text-xs uppercase tracking-widest text-[#9A7B4F] dark:text-[#C5A880] mb-3">
              06. Protocolo del Estudio &amp; Reglas de Convivencia
            </p>
            <h2 className="font-editorial text-3xl md:text-5xl font-normal leading-[1.12] text-[#141415] dark:text-[#F4F4F6]">
              Cuidamos tu tiempo tanto como el del cliente que sigue.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="p-7 rounded-sm border border-stone-300 dark:border-white/[0.08] bg-white/70 dark:bg-[#161618]">
              <div className="flex items-center justify-between font-mono-tech text-xs text-[#9A7B4F] dark:text-[#C5A880] mb-4">
                <span>REGLA 01 · PUNTUALIDAD</span>
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="font-editorial text-2xl text-[#141415] dark:text-[#F4F4F6] mb-2">
                10 minutos de cortesía máxima
              </h3>
              <p className="text-sm leading-relaxed text-stone-600 dark:text-[#8E8E93]">
                Cada bloque está milimétricamente calculado. Pasados los 10 minutos de tolerancia, la sesión
                se adapta al tiempo restante o se reprograma para no retrasar jamás al siguiente turno.
              </p>
            </article>

            <article className="p-7 rounded-sm border border-stone-300 dark:border-white/[0.08] bg-white/70 dark:bg-[#161618]">
              <div className="flex items-center justify-between font-mono-tech text-xs text-[#9A7B4F] dark:text-[#C5A880] mb-4">
                <span>REGLA 02 · REPROGRAMACIONES</span>
                <CalendarX2 className="w-4 h-4" />
              </div>
              <h3 className="font-editorial text-2xl text-[#141415] dark:text-[#F4F4F6] mb-2">
                Aviso con 24 hs de antelación
              </h3>
              <p className="text-sm leading-relaxed text-stone-600 dark:text-[#8E8E93]">
                El mensaje de confirmación que recibís en tu WhatsApp incluye un enlace directo de autogestión
                para reprogramar o cancelar sin cargo hasta 24 horas antes de tu cita.
              </p>
            </article>

            <article className="p-7 rounded-sm border border-stone-300 dark:border-white/[0.08] bg-white/70 dark:bg-[#161618]">
              <div className="flex items-center justify-between font-mono-tech text-xs text-[#9A7B4F] dark:text-[#C5A880] mb-4">
                <span>REGLA 03 · PRIVACIDAD</span>
                <UserCheck className="w-4 h-4" />
              </div>
              <h3 className="font-editorial text-2xl text-[#141415] dark:text-[#F4F4F6] mb-2">
                Sin acompañantes en el estudio
              </h3>
              <p className="text-sm leading-relaxed text-stone-600 dark:text-[#8E8E93]">
                Para preservar la atmósfera silenciosa e íntima del atelier, el acceso es exclusivo para la
                persona que tiene el turno reservado en esa franja horaria.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* SECTION 7: Ubicación, Horarios en Tiempo Real & Mapa Monocromático */}
      <section
        id="ubicacion"
        className="py-20 md:py-28 border-b border-stone-300/70 dark:border-white/[0.08]"
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            {/* Left 5 Columns: Live Hours & Address */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <p className="font-mono-tech text-xs uppercase tracking-widest text-[#9A7B4F] dark:text-[#C5A880] mb-3">
                  07. Ubicación &amp; Horarios en Tiempo Real
                </p>
                <h2 className="font-editorial text-3xl md:text-5xl font-normal leading-[1.12] text-[#141415] dark:text-[#F4F4F6] mb-6">
                  Palermo Soho, a puertas cerradas.
                </h2>

                {/* Live Schedule Status Card */}
                <div className="p-5 rounded-sm border border-stone-300 dark:border-white/[0.08] bg-white/80 dark:bg-[#161618] mb-6">
                  <p className="font-mono-tech text-xs uppercase text-[#9A7B4F] dark:text-[#C5A880] mb-1">
                    DETECCIÓN HORARIA EN VIVO
                  </p>
                  <p className="text-sm font-semibold text-[#141415] dark:text-[#F4F4F6]">
                    {liveStatus.headline}
                  </p>
                  <p className="text-xs text-stone-600 dark:text-[#8E8E93] mt-1">
                    {liveStatus.subline}
                  </p>
                </div>

                {/* Structured Schedule Table */}
                <dl className="space-y-3 font-mono-tech text-xs border-t border-stone-300/70 dark:border-white/[0.08] pt-5 mb-8">
                  <div className="flex justify-between">
                    <dt className="text-stone-600 dark:text-[#8E8E93]">Martes a Viernes</dt>
                    <dd className="text-[#141415] dark:text-[#F4F4F6]">10:00 – 20:00 hs</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-stone-600 dark:text-[#8E8E93]">Sábados</dt>
                    <dd className="text-[#141415] dark:text-[#F4F4F6]">10:00 – 19:00 hs</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-stone-600 dark:text-[#8E8E93]">Domingos y Lunes</dt>
                    <dd className="text-stone-500 dark:text-[#8E8E93]">Cerrado (Descanso)</dd>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-stone-200 dark:border-white/[0.06]">
                    <dt className="text-stone-600 dark:text-[#8E8E93]">Dirección Exacta</dt>
                    <dd className="text-[#141415] dark:text-[#F4F4F6]">{STUDIO_INFO.address}</dd>
                  </div>
                </dl>
              </div>

              {/* Direct Navigation Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={STUDIO_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 text-xs font-semibold uppercase tracking-wider bg-[#141415] text-[#F4F4F6] dark:bg-[#C5A880] dark:text-[#0C0C0D] rounded-sm whitespace-nowrap shrink-0"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Abrir en Google Maps</span>
                </a>
                <a
                  href={STUDIO_INFO.wazeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-xs font-medium border border-stone-300 dark:border-white/[0.15] text-[#141415] dark:text-[#F4F4F6] hover:border-[#C5A880] rounded-sm whitespace-nowrap shrink-0"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Abrir en Waze</span>
                </a>
              </div>
            </div>

            {/* Right 7 Columns: Custom Monochromatic Tonal Architectural Map */}
            <div className="lg:col-span-7">
              <div className="relative h-full min-h-[380px] rounded-sm overflow-hidden border border-stone-300 dark:border-white/[0.08] bg-[#121214] p-6 flex flex-col justify-between">
                {/* Architectural SVG Street Grid of Palermo Soho (Gorriti & Armenia) */}
                <svg
                  viewBox="0 0 800 450"
                  aria-label="Mapa monocromático personalizado de Gorriti 4820, Palermo Soho"
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                >
                  <rect width="800" height="450" fill="#101012" />
                  {/* City Blocks */}
                  <g stroke="#242428" strokeWidth="1.5" fill="#161619">
                    <rect x="40" y="30" width="190" height="160" rx="2" />
                    <rect x="260" y="30" width="220" height="160" rx="2" />
                    <rect x="510" y="30" width="240" height="160" rx="2" />
                    <rect x="40" y="230" width="190" height="180" rx="2" />
                    <rect x="260" y="230" width="220" height="180" rx="2" />
                    <rect x="510" y="230" width="240" height="180" rx="2" />
                  </g>
                  {/* Main Avenue Corridors */}
                  <line x1="0" y1="210" x2="800" y2="210" stroke="#C5A880" strokeWidth="2" strokeOpacity="0.4" />
                  <line x1="245" y1="0" x2="245" y2="450" stroke="#8E8E93" strokeWidth="1.5" strokeOpacity="0.25" />
                  <line x1="495" y1="0" x2="495" y2="450" stroke="#8E8E93" strokeWidth="1.5" strokeOpacity="0.25" />

                  {/* Street Labels */}
                  <text x="65" y="204" fill="#C5A880" fontSize="11" fontFamily="JetBrains Mono, monospace" letterSpacing="2">
                    GORRITI
                  </text>
                  <text x="252" y="100" fill="#8E8E93" fontSize="10" fontFamily="JetBrains Mono, monospace" letterSpacing="1.5" transform="rotate(90 252,100)">
                    ARMENIA
                  </text>
                  <text x="502" y="100" fill="#8E8E93" fontSize="10" fontFamily="JetBrains Mono, monospace" letterSpacing="1.5" transform="rotate(90 502,100)">
                    GURRUCHAGA
                  </text>

                  {/* Studio Pin Location */}
                  <circle cx="370" cy="210" r="28" fill="#C5A880" fillOpacity="0.14" />
                  <circle cx="370" cy="210" r="8" fill="#C5A880" />
                  <circle cx="370" cy="210" r="3" fill="#0C0C0D" />
                </svg>

                {/* Top Overlay Coordinates */}
                <div className="relative z-10 flex items-center justify-between text-xs font-mono-tech text-[#8E8E93]">
                  <span className="px-3 py-1.5 rounded-sm bg-[#0C0C0D]/90 border border-white/[0.08] text-[#F4F4F6]">
                    PALERMO SOHO · C1414BHC
                  </span>
                  <span className="px-3 py-1.5 rounded-sm bg-[#0C0C0D]/90 border border-white/[0.08] text-[#C5A880]">
                    ESTACIONAMIENTO PRIVADO A 50M
                  </span>
                </div>

                {/* Bottom Studio Card Inside Map */}
                <div className="relative z-10 p-5 rounded-sm bg-[#0C0C0D]/90 border border-white/[0.1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-editorial text-xl text-[#F4F4F6]">
                      Valentín Moretti · Estudio B
                    </p>
                    <p className="text-xs font-mono-tech text-[#8E8E93] mt-0.5">
                      Gorriti 4820 (entre Armenia y Gurruchaga) · Timbre enviando código QR al reservar
                    </p>
                  </div>
                  <span className="font-mono-tech text-xs text-[#C5A880] whitespace-nowrap shrink-0">
                    -34.5889, -58.4305
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: Quiet Editorial Footer */}
      <footer className="py-14 pb-28 md:pb-14 bg-[#F7F5F0] dark:bg-[#0C0C0D]">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <p className="font-editorial text-2xl uppercase tracking-[0.14em] text-[#141415] dark:text-[#F4F4F6]">
              Valentín Moretti
            </p>
            <p className="text-xs text-stone-500 dark:text-[#8E8E93] mt-1">
              © {new Date().getFullYear()} Estudio Privado de Peluquería &amp; Colorimetría. Todos los derechos reservados.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-stone-600 dark:text-[#8E8E93]">
            <a href="#espacio" className="hover:text-[#141415] dark:hover:text-[#F4F4F6] transition-colors">
              El Espacio
            </a>
            <a href="#servicios" className="hover:text-[#141415] dark:hover:text-[#F4F4F6] transition-colors">
              Servicios
            </a>
            <a href="#lookbook" className="hover:text-[#141415] dark:hover:text-[#F4F4F6] transition-colors">
              Lookbook
            </a>
            <a href="#resenas" className="hover:text-[#141415] dark:hover:text-[#F4F4F6] transition-colors">
              Reseñas Google
            </a>
            <a
              href={`https://wa.me/${STUDIO_INFO.whatsappRaw}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#141415] dark:hover:text-[#F4F4F6] transition-colors"
            >
              WhatsApp Directo
            </a>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Volver al inicio de la página"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-mono-tech uppercase border border-stone-300 dark:border-white/[0.12] text-[#141415] dark:text-[#F4F4F6] hover:border-[#C5A880] transition-colors rounded-sm whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Subir</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Bar (64px height, visible only on mobile <md) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 px-4 bg-[#F7F5F0]/95 dark:bg-[#0C0C0D]/95 backdrop-blur-md border-t border-stone-300 dark:border-white/[0.1] flex items-center gap-3">
        <button
          type="button"
          onClick={onJumpToBooking}
          className="flex-1 h-11 bg-[#141415] text-[#F4F4F6] dark:bg-[#C5A880] dark:text-[#0C0C0D] text-xs font-semibold uppercase tracking-wider rounded-sm whitespace-nowrap cursor-pointer"
        >
          Reservar Cita
        </button>
        <a
          href={`https://wa.me/${STUDIO_INFO.whatsappRaw}?text=Hola%20Valent%C3%ADn,%20tengo%20una%20consulta%20t%C3%A9cnica%20antes%20de%20reservar`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Consultar duda técnica por WhatsApp"
          className="h-11 px-4 border border-stone-300 dark:border-white/[0.18] bg-white dark:bg-[#161618] text-[#141415] dark:text-[#F4F4F6] rounded-sm inline-flex items-center justify-center gap-1.5 text-xs font-mono-tech whitespace-nowrap shrink-0"
        >
          <MessageCircle className="w-4 h-4 text-[#9A7B4F] dark:text-[#C5A880]" />
          <span>WhatsApp</span>
        </a>
      </div>
    </>
  );
};
