import React from 'react';
import { useStudio } from '../context/StudioContext';
import { MapPin, Navigation, Clock, ShieldAlert, Phone, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';
import { getStudioLiveStatus } from '../utils/bookingEngine';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';

export const LocationPage: React.FC = () => {
  const { config, navigateTo } = useStudio();
  const liveStatus = getStudioLiveStatus(new Date());

  return (
    <div className="py-8 md:py-16 max-w-[1360px] mx-auto px-4 sm:px-6 space-y-12">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#222432]">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#A855F7] font-bold block mb-1">
            LOCALIZACIÓN &amp; ATENCIÓN 1 A 1
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
            Ubicación Venado Tuerto
          </h1>
        </div>
        <p className="text-xs font-mono text-zinc-400 max-w-[42ch]">
          Atención privada 1 a 1 en Vuelta de Obligado 931. Sin demoras ni esperas telefónicas: tu turno queda agendado al instante por la web.
        </p>
      </div>

      {/* Grid: Info + Monochromatic Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Hours & Status */}
        <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            
            {/* Live Clock Card */}
            <div className="p-5 rounded-xl border border-[#A855F7]/40 bg-[#12141D] text-white shadow-lg concrete-overlay distressed-surface">
              <span className="font-mono text-xs uppercase text-[#A855F7] font-bold block">
                ESTADO DEL LOCAL EN VIVO
              </span>
              <h2 className="font-display text-2xl font-bold mt-1 mb-1">
                {liveStatus.headline}
              </h2>
              <p className="text-xs font-mono text-zinc-400">
                {liveStatus.subline}
              </p>
            </div>

            {/* Schedule Table */}
            <div className="p-5 rounded-xl border border-[#232532] bg-[#111218] space-y-3.5 concrete-overlay">
              <h3 className="font-mono text-xs uppercase text-zinc-400 font-bold">
                Horarios de Corte
              </h3>
              <dl className="space-y-2 font-mono text-xs">
                <div className="flex justify-between pb-2 border-b border-[#1E202B]">
                  <dt className="text-zinc-400">Martes a Viernes</dt>
                  <dd className="font-bold text-white">10:00 – 21:00 hs</dd>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#1E202B]">
                  <dt className="text-zinc-400">Sábados</dt>
                  <dd className="font-bold text-[#FF4655]">10:00 – 20:00 hs</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-400">Domingos y Lunes</dt>
                  <dd className="text-zinc-500">Cerrado</dd>
                </div>
              </dl>
            </div>

            {/* Address & Instructions */}
            <div className="p-5 rounded-xl border border-[#232532] bg-[#111218] space-y-2 concrete-overlay">
              <h3 className="font-mono text-xs uppercase text-zinc-400 font-bold">
                Dirección
              </h3>
              <p className="font-display text-xl font-bold text-white">{config.address}</p>
              <p className="text-xs font-mono text-[#A855F7] font-bold">
                {config.neighborhood}
              </p>
              <p className="text-[11px] font-mono text-zinc-400">
                Fácil acceso y estacionamiento cómodo en la cuadra.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-2">
            <a
              href={config.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={playMechanicalHover}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-mono font-black uppercase tracking-wider bg-[#FF4655] text-white rounded-xl hover:bg-[#FF2E40] transition-all shadow-md active:scale-95"
            >
              <MapPin className="w-4 h-4" />
              <span>Google Maps</span>
            </a>
            <a
              href={config.wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={playMechanicalHover}
              className="px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider border border-[#2B2D3D] bg-[#161722] text-zinc-200 hover:text-white hover:border-[#A855F7] rounded-xl transition-all active:scale-95"
            >
              <Navigation className="w-4 h-4 text-[#A855F7]" />
              <span>Waze</span>
            </a>
          </div>
        </div>

        {/* Right Column: Custom Monochromatic SVG Map */}
        <div className="lg:col-span-7">
          <div className="relative h-full min-h-[420px] rounded-2xl overflow-hidden border border-[#232532] bg-[#0E0F15] p-5 flex flex-col justify-between shadow-xl concrete-overlay">
            <svg
              viewBox="0 0 800 450"
              aria-label="Mapa urbano de Vuelta de Obligado 931, Venado Tuerto, Santa Fe"
              className="absolute inset-0 w-full h-full object-cover opacity-85"
            >
              <rect width="800" height="450" fill="#0C0D13" />
              <g stroke="#222430" strokeWidth="1.5" fill="#13141C">
                <rect x="40" y="30" width="190" height="160" rx="4" />
                <rect x="260" y="30" width="220" height="160" rx="4" />
                <rect x="510" y="30" width="240" height="160" rx="4" />
                <rect x="40" y="230" width="190" height="180" rx="4" />
                <rect x="260" y="230" width="220" height="180" rx="4" />
                <rect x="510" y="230" width="240" height="180" rx="4" />
              </g>
              <line x1="0" y1="210" x2="800" y2="210" stroke="#FF4655" strokeWidth="2.5" strokeOpacity="0.8" />
              <line x1="245" y1="0" x2="245" y2="450" stroke="#4A4D60" strokeWidth="1.5" strokeOpacity="0.4" />
              <line x1="495" y1="0" x2="495" y2="450" stroke="#4A4D60" strokeWidth="1.5" strokeOpacity="0.4" />

              <text x="65" y="204" fill="#FF4655" fontSize="11" fontFamily="JetBrains Mono, monospace" letterSpacing="2" fontWeight="bold">
                CALLE VUELTA DE OBLIGADO (N° 931)
              </text>
              <text x="252" y="100" fill="#8E92A8" fontSize="10" fontFamily="JetBrains Mono, monospace" letterSpacing="1.5" transform="rotate(90 252,100)">
                INTERSECCIÓN VT
              </text>
              <text x="502" y="100" fill="#8E92A8" fontSize="10" fontFamily="JetBrains Mono, monospace" letterSpacing="1.5" transform="rotate(90 502,100)">
                SANTA FE
              </text>

              <circle cx="370" cy="210" r="32" fill="#A855F7" fillOpacity="0.2" />
              <circle cx="370" cy="210" r="10" fill="#A855F7" />
              <circle cx="370" cy="210" r="4" fill="#000000" />
            </svg>

            <div className="relative z-10 flex items-center justify-between text-xs font-mono">
              <span className="px-3 py-1.5 rounded-lg bg-black/80 border border-white/10 text-white font-bold">
                VENADO TUERTO · SANTA FE
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-black/80 border border-[#A855F7]/40 text-[#A855F7] font-bold">
                RODRIGO CUTSSS
              </span>
            </div>

            <div className="relative z-10 p-4 rounded-xl bg-black/85 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
              <div>
                <p className="font-display text-xl font-bold">Vuelta de Obligado 931</p>
                <p className="text-xs font-mono text-zinc-400">
                  Venado Tuerto · Atención exclusiva 1 a 1
                </p>
              </div>
              <span className="font-mono text-xs text-[#FF4655] font-bold">
                -33.7456, -61.9688
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Studio Protocol Rules */}
      <div className="pt-4">
        <div className="mb-6">
          <span className="font-mono text-xs uppercase text-[#A855F7] font-bold block mb-1">
            REGLAS DEL LOCAL
          </span>
          <h2 className="font-display text-3xl font-extrabold text-white">
            Para Cuidar el Tiempo de Todos
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-[#222432] bg-[#111218] space-y-2.5">
            <span className="font-mono text-xs text-[#A855F7] font-bold">REGLA 01 · PUNTUALIDAD</span>
            <h3 className="font-display text-xl font-bold text-white">10 minutos de tolerancia</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Si llegás más de 10 min tarde se recortan los detalles finales o se reprograma el turno para no perjudicar al pibe que reservó después de vos.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-[#222432] bg-[#111218] space-y-2.5">
            <span className="font-mono text-xs text-[#FF4655] font-bold">REGLA 02 · CANCELACIÓN</span>
            <h3 className="font-display text-xl font-bold text-white">Avisar 24 hs antes</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              El WhatsApp te manda un link automático para cambiar de día u hora sin costo alguno hasta 24 horas antes del horario fijado.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-[#222432] bg-[#111218] space-y-2.5">
            <span className="font-mono text-xs text-[#D946EF] font-bold">REGLA 03 · ESPACIO</span>
            <h3 className="font-display text-xl font-bold text-white">Vení solo a cortarte</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Como el local es privado 1 a 1, no hay sala de espera comunitaria. Es un espacio tranquilo pensado para que te relajes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
