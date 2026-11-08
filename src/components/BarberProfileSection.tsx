import React from 'react';
import { useStudio } from '../context/StudioContext';
import {
  Instagram,
  MessageCircle,
  MapPin,
  ExternalLink,
  Zap,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { resolveInstagramInfo, resolveWhatsAppInfo } from '../utils/bookingEngine';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';
import { RetroCornerBandaBookmark } from './RetroPaperBanda';

export const BarberProfileSection: React.FC = () => {
  const { config } = useStudio();
  const igInfo = resolveInstagramInfo(config.instagram);
  const waInfo = resolveWhatsAppInfo(config.phoneDisplay, config.whatsappRaw);

  return (
    <section
      id="barbero"
      className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-20 scroll-mt-24"
    >
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-5 border-b border-[#C8BBA4]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#9E2A2B] font-semibold">
            <span>Oficio &amp; Estudio Privado</span>
            <span aria-hidden="true">╱</span>
            <span className="text-[#5C5346]">{config.neighborhood}</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#181512] tracking-tight leading-tight">
            Conocé a{' '}
            <span className="font-editorial italic font-normal text-[#9E2A2B]">
              {config.authorName}
            </span>{' '}
            &amp; El Estudio
          </h2>
        </div>
        <p className="text-xs sm:text-sm font-mono text-[#4F463B] max-w-md">
          Técnica de precisión, ambiente tranquilo y tiempo exclusivo para cada cliente en{' '}
          {config.address}.
        </p>
      </div>

      {/* 12-COLUMN AGED-PAPER ATELIER DOSSIER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border border-[#C8BBA4] rounded-xl bg-[#FAF6EE] shadow-[0_16px_40px_rgba(24,21,18,0.08)] relative overflow-hidden">
        <RetroCornerBandaBookmark size="lg" />

        {/* Left 5 Cols: Barber & Studio Visual Mounted on Aged Paper */}
        <div className="lg:col-span-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#C8BBA4] p-3 sm:p-4 bg-[#EAE0CE]">
          <div className="relative overflow-hidden rounded-lg border border-[#C8BBA4] bg-[#181512] flex-1 min-h-[410px] group">
            <img
              src="/src/assets/images/urban_barber_hero_1793929257447.jpg"
              alt={`${config.authorName} trabajando en su estudio privado en ${config.neighborhood}`}
              className="absolute inset-0 w-full h-full object-cover sepia-[0.12] contrast-[1.03] group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />

            {/* Top Barber Header Info */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
              <span className="px-3 py-1.5 rounded bg-[#FAF6EE]/95 border border-[#C8BBA4] text-[#181512] text-xs font-mono font-bold uppercase tracking-wider">
                {config.studioTitle}
              </span>
              <span className="px-2.5 py-1 rounded bg-[#9E2A2B] text-[#FAF6EE] font-mono text-[10px] font-semibold uppercase tracking-wider">
                Atención 1 a 1
              </span>
            </div>

            {/* Bottom Gradient Overlay with Studio Identity */}
            <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-[#181512]/95 via-[#181512]/75 to-transparent z-10">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#E8DFCE] font-semibold mb-1">
                <MapPin className="w-3.5 h-3.5 text-[#9E2A2B]" />
                <span>
                  {config.address} · {config.neighborhood}
                </span>
              </div>
              <h3 className="text-xl font-display font-bold text-[#FAF6EE]">
                {config.authorName} · Peluquero &amp; Barbero
              </h3>
              <p className="text-xs text-[#E8DFCE]/85 font-mono mt-1">
                Cortes de autor, fades limpios, colorimetría y perfilado de barba.
              </p>
            </div>
          </div>

          {/* Studio Secondary Card */}
          <div className="mt-3 p-4 rounded-lg bg-[#FAF6EE] border border-[#C8BBA4] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded bg-[#9E2A2B]/15 border border-[#9E2A2B]/40 text-[#9E2A2B] flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-[#181512] uppercase block">
                  Herramientas de Precisión &amp; Shaver Titanio
                </span>
                <span className="text-[11px] font-mono text-[#5C5346] block">
                  Pulido al ras 0.0 mm hipoalergénico · Cero irritación y esterilización continua
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Bio, Concept & Direct Communication */}
        <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 space-y-6 bg-[#FAF6EE]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-[#9E2A2B] text-xs font-mono font-bold uppercase tracking-[0.16em]">
              <UserCheck className="w-3.5 h-3.5 text-[#9E2A2B]" />
              <span>Filosofía de Trabajo &amp; Oficio</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#181512] leading-tight">
              Si venís con una idea, la trabajamos al detalle; si no, diseñamos juntos el corte que
              mejor te queda.
            </h3>

            <p className="text-[#4F463B] text-sm sm:text-base leading-relaxed">{config.bio}</p>

            <p className="text-[#5C5346] text-sm leading-relaxed">
              Trabajamos con{' '}
              <strong className="text-[#181512]">
                clippers profesionales, trimmers de precisión, shavers de lámina de titanio
                hipoalergénica a 0.0 mm y tijeras de diseño
              </strong>
              , logrando transiciones limpias, textura natural y un acabado al ras suave sin irritar
              tu piel.
            </p>
          </div>

          {/* 4 Value Pillars on Aged Paper */}
          <div className="grid grid-cols-1 sm:grid-cols-2 border border-[#C8BBA4] rounded-xl overflow-hidden bg-[#F3ECE0]">
            <div className="p-4 border-b sm:border-r border-[#C8BBA4] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#9E2A2B] uppercase">
                  01. Visagismo &amp; Diseño a Medida
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#9E2A2B]" />
              </div>
              <p className="text-xs text-[#4F463B] leading-relaxed">
                Adaptamos la altura del fade, la caída superior y los ángulos a tus facciones y tipo
                de pelo.
              </p>
            </div>

            <div className="p-4 border-b border-[#C8BBA4] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#181512] uppercase">
                  02. Precisión a Máquina &amp; Tijera
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#9E2A2B]" />
              </div>
              <p className="text-xs text-[#4F463B] leading-relaxed">
                Definición de contornos y rasurado 0.0 mm con Trimmers y Shaver de Titanio:
                prolijidad sin ardor.
              </p>
            </div>

            <div className="p-4 border-b sm:border-b-0 sm:border-r border-[#C8BBA4] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#9E2A2B] uppercase">
                  03. Estudio Privado 1 a 1
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#9E2A2B]" />
              </div>
              <p className="text-xs text-[#4F463B] leading-relaxed">
                Puntualidad real en {config.address}. Sin salas de espera llenas ni interrupciones
                mientras te atendés.
              </p>
            </div>

            <div className="p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#181512] uppercase">
                  04. Crecimiento Prolijo
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#9E2A2B]" />
              </div>
              <p className="text-xs text-[#4F463B] leading-relaxed">
                Corte estructurado para que mantenga su forma durante semanas y sea fácil de peinar
                todos los días.
              </p>
            </div>
          </div>

          {/* DIRECT COMMUNICATION CHANNELS */}
          <div className="p-5 rounded-xl bg-[#EAE0CE] border border-[#C8BBA4] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#C8BBA4]">
              <div>
                <span className="text-[11px] font-mono text-[#9E2A2B] font-bold uppercase tracking-wider block">
                  Contacto directo con {config.authorName}
                </span>
                <h4 className="text-base font-bold text-[#181512]">
                  ¿Tenés una foto de referencia o duda sobre un servicio?
                </h4>
              </div>
              <span className="text-xs font-mono text-[#5C5346]">{config.scheduleDisplay}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={igInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={playMechanicalHover}
                onClick={playMechanicalClick}
                className="group flex items-center justify-center gap-2.5 px-4 py-3.5 rounded bg-[#9E2A2B] hover:bg-[#822021] text-[#FAF6EE] font-mono text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                <Instagram className="w-4 h-4" />
                <span>Instagram {igInfo.handle}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-75" />
              </a>

              <a
                href={`${waInfo.url}?text=${encodeURIComponent(
                  `Hola ${config.authorName}! Vi tu presentación en la web de ${config.studioTitle} y quiero hacerte una consulta`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={playMechanicalHover}
                onClick={playMechanicalClick}
                className="group flex items-center justify-center gap-2.5 px-4 py-3.5 rounded bg-[#FAF6EE] hover:bg-[#F3ECE0] border border-[#C8BBA4] hover:border-[#9E2A2B] text-[#181512] font-mono text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#9E2A2B]" />
                <span>WhatsApp: {waInfo.display}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
