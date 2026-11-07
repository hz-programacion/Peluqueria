import React from 'react';
import { useStudio } from '../context/StudioContext';
import { MapPin, Navigation } from 'lucide-react';
import { getStudioLiveStatus } from '../utils/bookingEngine';
import { playMechanicalHover } from '../utils/audioFeedback';

export const LocationPage: React.FC = () => {
  const { config } = useStudio();
  const liveStatus = getStudioLiveStatus(
    new Date(),
    config.openingHour,
    config.closingHour,
    config.openDays
  );

  return (
    <div className="py-8 md:py-16 max-w-[1360px] mx-auto px-4 sm:px-6 space-y-12">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#232730]">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#F59E0B] font-bold block mb-1">
            LOCALIZACIÓN &amp; ATENCIÓN 1 A 1
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
            Ubicación {config.neighborhood}
          </h1>
        </div>
        <p className="text-xs font-mono text-zinc-400 max-w-[42ch]">
          Atención privada 1 a 1 en {config.address}. Sin demoras ni esperas telefónicas: tu turno queda agendado al instante por la web.
        </p>
      </div>

      {/* Grid: Info + Monochromatic Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Hours & Status */}
        <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Live Clock Card */}
            <div className="p-5 rounded-2xl border border-[#282D37] bg-[#111318] text-white shadow-lg">
              <span className="font-mono text-xs uppercase text-[#F59E0B] font-bold block">
                ESTADO DEL LOCAL EN VIVO
              </span>
              <h2 className="font-display text-2xl font-bold mt-1 mb-1">
                {liveStatus.headline}
              </h2>
              <p className="text-xs font-mono text-zinc-400">{liveStatus.subline}</p>
            </div>

            {/* Schedule Table */}
            <div className="p-5 rounded-2xl border border-[#232730] bg-[#111318] space-y-3.5">
              <h3 className="font-mono text-xs uppercase text-zinc-400 font-bold">
                Horarios de Corte
              </h3>
              <dl className="space-y-2 font-mono text-xs">
                <div className="flex justify-between pb-2 border-b border-[#1E222B]">
                  <dt className="text-zinc-400">Lunes a Viernes</dt>
                  <dd className="font-bold text-white">10:00 – 21:00 hs</dd>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#1E222B]">
                  <dt className="text-zinc-400">Sábados</dt>
                  <dd className="font-bold text-[#F59E0B]">10:00 – 20:00 hs</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-400">Domingos</dt>
                  <dd className="text-zinc-500">Cerrado</dd>
                </div>
              </dl>
            </div>

            {/* Address & Instructions */}
            <div className="p-5 rounded-2xl border border-[#232730] bg-[#111318] space-y-2">
              <h3 className="font-mono text-xs uppercase text-zinc-400 font-bold">
                Dirección
              </h3>
              <p className="font-display text-xl font-bold text-white">{config.address}</p>
              <p className="text-xs font-mono text-[#F59E0B] font-bold">
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
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-mono font-black uppercase tracking-wider bg-[#F59E0B] text-zinc-950 rounded-xl hover:bg-[#D97706] transition-all shadow-sm active:scale-95"
            >
              <MapPin className="w-4 h-4" />
              <span>Google Maps</span>
            </a>
            <a
              href={config.wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={playMechanicalHover}
              className="px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider border border-[#282D37] bg-[#161920] text-zinc-200 hover:text-white hover:border-[#F59E0B] rounded-xl transition-all active:scale-95"
            >
              <Navigation className="w-4 h-4 text-[#F59E0B]" />
              <span>Waze</span>
            </a>
          </div>
        </div>

        {/* Right Column: Custom Monochromatic SVG Map */}
        <div className="lg:col-span-7">
          <div className="relative h-full min-h-[420px] rounded-2xl overflow-hidden border border-[#232730] bg-[#0C0E12] p-5 flex flex-col justify-between shadow-xl">
            <svg
              viewBox="0 0 800 450"
              aria-label="Mapa urbano de Vuelta de Obligado 931, Venado Tuerto, Santa Fe"
              className="absolute inset-0 w-full h-full object-cover opacity-85"
            >
              <rect width="800" height="450" fill="#0B0D11" />
              <g stroke="#1E222B" strokeWidth="1.5" fill="#12151C">
                <rect x="40" y="30" width="190" height="160" rx="4" />
                <rect x="260" y="30" width="220" height="160" rx="4" />
                <rect x="510" y="30" width="240" height="160" rx="4" />
                <rect x="40" y="230" width="190" height="180" rx="4" />
                <rect x="260" y="230" width="220" height="180" rx="4" />
                <rect x="510" y="230" width="240" height="180" rx="4" />
              </g>
              <line
                x1="0"
                y1="210"
                x2="800"
                y2="210"
                stroke="#F59E0B"
                strokeWidth="2.5"
                strokeOpacity="0.8"
              />
              <line
                x1="245"
                y1="0"
                x2="245"
                y2="450"
                stroke="#3A3F4D"
                strokeWidth="1.5"
                strokeOpacity="0.4"
              />
              <line
                x1="495"
                y1="0"
                x2="495"
                y2="450"
                stroke="#3A3F4D"
                strokeWidth="1.5"
                strokeOpacity="0.4"
              />

              <text
                x="65"
                y="202"
                fill="#F59E0B"
                fontSize="11"
                fontFamily="JetBrains Mono, monospace"
                letterSpacing="2"
                fontWeight="bold"
              >
                CALLE VUELTA DE OBLIGADO (N° 931)
              </text>

              <circle cx="370" cy="210" r="28" fill="#F59E0B" fillOpacity="0.2" />
              <circle cx="370" cy="210" r="9" fill="#F59E0B" />
              <circle cx="370" cy="210" r="3.5" fill="#0A0B0E" />
            </svg>

            <div className="relative z-10 flex items-center justify-between text-xs font-mono">
              <span className="px-3 py-1.5 rounded-lg bg-[#0A0B0E]/90 border border-[#282D37] text-white font-bold">
                VENADO TUERTO · SANTA FE
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-[#0A0B0E]/90 border border-[#F59E0B]/40 text-[#F59E0B] font-bold">
                {config.studioTitle.toUpperCase()}
              </span>
            </div>

            <div className="relative z-10 p-4 rounded-xl bg-[#0A0B0E]/90 border border-[#282D37] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
              <div>
                <p className="font-display text-xl font-bold">{config.address}</p>
                <p className="text-xs font-mono text-zinc-400">
                  {config.neighborhood} · Atención exclusiva 1 a 1
                </p>
              </div>
              <span className="font-mono text-xs text-[#F59E0B] font-bold">
                -33.7456, -61.9688
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Studio Protocol Rules */}
      <div className="pt-4">
        <div className="mb-6">
          <span className="font-mono text-xs uppercase text-[#F59E0B] font-bold block mb-1">
            REGLAS DEL LOCAL
          </span>
          <h2 className="font-display text-3xl font-extrabold text-white">
            Para Cuidar el Tiempo de Todos
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-[#232730] bg-[#111318] space-y-2.5">
            <span className="font-mono text-xs text-[#F59E0B] font-bold">
              REGLA 01 · PUNTUALIDAD
            </span>
            <h3 className="font-display text-xl font-bold text-white">
              {config.maxCourtesyMinutes} minutos de tolerancia
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Si llegás más de {config.maxCourtesyMinutes} min tarde se recortan los detalles finales o se reprograma el turno para no perjudicar al cliente que reservó después de vos.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-[#232730] bg-[#111318] space-y-2.5">
            <span className="font-mono text-xs text-[#F59E0B] font-bold">
              REGLA 02 · CANCELACIÓN
            </span>
            <h3 className="font-display text-xl font-bold text-white">Avisar con anticipación</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Si necesitás cambiar de día u hora, podés liberar tu turno desde la web o avisar por WhatsApp para que otro cliente pueda aprovechar el horario.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-[#232730] bg-[#111318] space-y-2.5">
            <span className="font-mono text-xs text-[#F59E0B] font-bold">
              REGLA 03 · ESPACIO
            </span>
            <h3 className="font-display text-xl font-bold text-white">Atención 1 a 1</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Como el estudio es privado 1 a 1, no hay sala de espera comunitaria. Es un espacio tranquilo pensado para que te relajes durante tu corte.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
