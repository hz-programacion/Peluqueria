import React from 'react';
import { useStudio } from '../context/StudioContext';
import { MapPin, Navigation, ArrowLeft, MessageCircle } from 'lucide-react';
import { getStudioLiveStatus, resolveWhatsAppInfo } from '../utils/bookingEngine';
import { RetroCornerBandaBookmark, RetroRiverCrestBadge } from '../components/RetroPaperBanda';

export const LocationPage: React.FC = () => {
  const { config, navigateTo } = useStudio();
  const liveStatus = getStudioLiveStatus(
    new Date(),
    config.openingHour,
    config.closingHour,
    config.openDays
  );
  const waInfo = resolveWhatsAppInfo(config.phoneDisplay, config.whatsappRaw);

  return (
    <div className="py-10 md:py-16 max-w-7xl mx-auto px-4 sm:px-8 space-y-12 text-[#181512]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#C8BBA4]">
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#9E2A2B] hover:underline font-semibold cursor-pointer mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Portada</span>
          </button>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#9E2A2B] font-semibold block">
            Localización &amp; Atención 1 a 1 · {config.studioTitle}
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-[#181512] tracking-tight">
            {config.address},{' '}
            <span className="font-editorial italic font-normal text-[#9E2A2B]">
              {config.neighborhood}
            </span>
          </h1>
        </div>
        <p className="text-xs font-mono text-[#4F463B] max-w-[42ch]">
          Atención privada 1 a 1 en {config.address}. Sin demoras ni esperas: tu turno queda
          registrado al instante por la web.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="p-6 rounded-xl border border-[#C8BBA4] bg-[#FAF6EE] relative overflow-hidden">
              <RetroCornerBandaBookmark size="sm" />
              <span className="font-mono text-xs uppercase text-[#9E2A2B] font-semibold block">
                ESTADO DEL ESTUDIO EN VIVO
              </span>
              <h2 className="font-display text-2xl font-bold mt-1 mb-1 text-[#181512]">
                {liveStatus.headline}
              </h2>
              <p className="text-xs font-mono text-[#4F463B]">{liveStatus.subline}</p>
            </div>

            <div className="p-6 rounded-xl border border-[#C8BBA4] bg-[#FAF6EE] space-y-3.5">
              <h3 className="font-mono text-xs uppercase text-[#9E2A2B] font-semibold">
                Horarios de Atención
              </h3>
              <p className="text-sm font-semibold text-[#181512]">{config.scheduleDisplay}</p>
              <p className="text-xs font-mono text-[#4F463B]">
                WhatsApp directo: <strong className="text-[#9E2A2B]">{waInfo.display}</strong>
              </p>
              <p className="text-xs font-mono text-[#4F463B]">
                Alias transferencia: <strong className="text-[#181512]">{config.transferAlias}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-2">
            <a
              href={config.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-mono font-semibold uppercase tracking-wider bg-[#9E2A2B] text-[#FAF6EE] rounded-lg hover:bg-[#822021] transition-all shadow-[0_3px_0_#5E1516]"
            >
              <MapPin className="w-4 h-4" />
              <span>Google Maps</span>
            </a>
            <a
              href={config.wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 text-xs font-mono font-semibold uppercase tracking-wider border border-[#C8BBA4] bg-[#FAF6EE] text-[#181512] hover:border-[#9E2A2B] rounded-lg transition-all inline-flex items-center gap-2"
            >
              <Navigation className="w-4 h-4 text-[#9E2A2B]" />
              <span>Waze</span>
            </a>
            <a
              href={waInfo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 text-xs font-mono font-semibold uppercase tracking-wider border border-[#C8BBA4] bg-[#FAF6EE] text-[#181512] hover:border-[#9E2A2B] rounded-lg transition-all inline-flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-[#9E2A2B]" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="relative h-full min-h-[360px] bg-[#EAE0CE] border border-[#C8BBA4] rounded-xl overflow-hidden p-6 flex flex-col justify-between shadow-[0_14px_34px_rgba(24,21,18,0.06)]">
            <RetroCornerBandaBookmark size="md" />
            <div className="relative z-10 flex items-center justify-between text-xs font-mono">
              <span className="px-3 py-1.5 rounded bg-[#FAF6EE] border border-[#C8BBA4] text-[#9E2A2B] font-semibold">
                PLANO CATASTRAL · VENADO TUERTO
              </span>
              <span className="px-3 py-1.5 rounded bg-[#FAF6EE] border border-[#C8BBA4] text-[#181512] font-semibold">
                {config.studioTitle.toUpperCase()}
              </span>
            </div>

            <div className="relative z-10 p-5 rounded-xl bg-[#FAF6EE]/95 border border-[#C8BBA4] flex items-center gap-4">
              <RetroRiverCrestBadge size="md" />
              <div>
                <p className="font-display text-2xl font-bold text-[#181512]">{config.address}</p>
                <p className="text-xs font-mono text-[#4F463B]">
                  {config.neighborhood} · Atención exclusiva 1 a 1 con turno previo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
