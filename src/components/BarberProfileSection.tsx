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

export const BarberProfileSection: React.FC = () => {
  const { config } = useStudio();
  const igInfo = resolveInstagramInfo(config.instagram);
  const waInfo = resolveWhatsAppInfo(config.phoneDisplay, config.whatsappRaw);

  return (
    <section
      id="barbero"
      className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-8 scroll-mt-24"
    >
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-5 border-b border-white/15">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#F59E0B] font-bold">
            <span>SECCIÓN // 05</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="text-zinc-400">ATELIER DE AUTOR EN {config.neighborhood.toUpperCase()}</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-[#F4EFE6] uppercase tracking-tight leading-[0.95]">
            Conocé a <span className="font-editorial italic font-normal text-[#F59E0B] lowercase">{config.authorName}</span> &amp; El Atelier
          </h2>
        </div>
        <p className="text-xs sm:text-sm font-mono text-zinc-400 max-w-md">
          Escultura capilar, técnica de precisión y tiempo exclusivo para cada cliente en {config.address}.
        </p>
      </div>

      {/* ARCHITECTURAL 12-COLUMN ATELIER DOSSIER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border border-white/15 bg-[#090A0E] shadow-2xl">
        {/* Left 5 Cols: High-Impact Barber & Studio Visual */}
        <div className="lg:col-span-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/15">
          <div className="relative overflow-hidden bg-[#050608] flex-1 min-h-[420px] group">
            <img
              src="/src/assets/images/urban_barber_hero_1793929257447.jpg"
              alt={`${config.authorName} trabajando con clipper de precisión en su estudio privado en ${config.neighborhood}`}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />

            {/* Top Barber Header Info */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
              <span className="px-3 py-1.5 bg-[#070709]/90 backdrop-blur-md border border-white/20 text-[#F59E0B] text-xs font-mono font-bold uppercase tracking-wider">
                {config.studioTitle.toUpperCase()}
              </span>
              <span className="px-2.5 py-1 bg-[#F59E0B] text-zinc-950 font-mono text-[10px] font-black uppercase tracking-wider">
                ATENCIÓN 1 A 1
              </span>
            </div>

            {/* Bottom Gradient Overlay with Studio Identity */}
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-[#070709] via-[#070709]/90 to-transparent z-10">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#F59E0B] font-bold mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  {config.address.toUpperCase()} · {config.neighborhood.toUpperCase()}
                </span>
              </div>
              <h3 className="text-xl font-display font-extrabold text-[#F4EFE6] uppercase">
                {config.authorName} · Fundador &amp; Director Técnico
              </h3>
              <p className="text-xs text-zinc-300 font-mono mt-1">
                Cortes de autor, fades milimétricos, colorimetría y perfilado de barba.
              </p>
            </div>
          </div>

          {/* Studio Secondary Card: Clipper & Shaver Tech */}
          <div className="p-5 bg-[#0B0C10] border-t border-white/15 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#F59E0B] flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-[#F4EFE6] uppercase block">
                  Tecnología Clipper, Trimmer &amp; Shaver Titanio
                </span>
                <span className="text-[11px] font-mono text-zinc-400 block">
                  Pulido al ras 0.0 mm hipoalergénico · Cero irritación y esterilización UV
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Bio, Business Concept & Direct Communication Hub */}
        <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-[#F59E0B] text-xs font-mono font-bold uppercase tracking-[0.16em]">
              <UserCheck className="w-3.5 h-3.5" />
              <span>FILOSOFÍA DEL ATELIER &amp; OFICIO URBANO</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-[#F4EFE6] leading-tight uppercase">
              Si venís con una idea, la sacamos; si no, diseñamos juntos el corte que mejor te queda.
            </h3>

            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">{config.bio}</p>

            <p className="text-zinc-400 text-sm leading-relaxed">
              Trabajamos íntegramente con{' '}
              <strong className="text-[#F4EFE6]">
                clippers profesionales, trimmers de precisión (cuchilla en T), shavers de lámina de titanio hipoalergénica a 0.0 mm y tijeras de diseño
              </strong>
              , logrando transiciones limpias, textura natural y un acabado al ras suave sin irritar tu piel.
            </p>
          </div>

          {/* 4 Clear Value Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 border border-white/15 bg-[#070709]">
            <div className="p-4 border-b sm:border-r border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#F59E0B] uppercase">
                  01. Visagismo &amp; Diseño a Medida
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Adaptamos la altura del fade, la caída superior y los ángulos a tu estructura craneal y tipo de pelo.
              </p>
            </div>

            <div className="p-4 border-b border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#F59E0B] uppercase">
                  02. Precisión a Máquina &amp; Shaver
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Definición de contornos y rasurado 0.0 mm con Trimmers Skeleton y Shaver de Titanio: prolijidad extrema sin ardor.
              </p>
            </div>

            <div className="p-4 border-b sm:border-b-0 sm:border-r border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#F59E0B] uppercase">
                  03. Estudio Privado 1 a 1
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Puntualidad real en {config.address}. Sin salas de espera llenas ni interrupciones mientras estás en el sillón.
              </p>
            </div>

            <div className="p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#00F0FF] uppercase">
                  04. Acabado &amp; Durabilidad
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#00F0FF]" />
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Corte pensado para que crezca parejo durante semanas y puedas peinarlo en segundos con polvo texturizante mate.
              </p>
            </div>
          </div>

          {/* DIRECT COMMUNICATION CHANNELS: INSTAGRAM & WHATSAPP */}
          <div className="p-5 bg-[#070709] border border-white/15 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div>
                <span className="text-[11px] font-mono text-[#F59E0B] font-bold uppercase tracking-wider block">
                  CONSULTA DIRECTA CON {config.authorName.toUpperCase()}
                </span>
                <h4 className="text-base font-bold text-[#F4EFE6]">
                  ¿Tenés una foto de referencia o duda sobre color/fades?
                </h4>
              </div>
              <span className="text-xs font-mono text-zinc-400">{config.scheduleDisplay}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={igInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={playMechanicalHover}
                onClick={playMechanicalClick}
                className="group flex items-center justify-center gap-2.5 px-4 py-3.5 bg-[#F59E0B] hover:bg-[#F4EFE6] text-zinc-950 font-mono text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                <Instagram className="w-4 h-4" />
                <span>Instagram {igInfo.handle}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-75" />
              </a>

              <a
                href={`${waInfo.url}?text=${encodeURIComponent(
                  `Hola ${config.authorName}! Vi tu presentación en la web y quiero hacerte una consulta`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={playMechanicalHover}
                onClick={playMechanicalClick}
                className="group flex items-center justify-center gap-2.5 px-4 py-3.5 bg-[#0B0C10] hover:bg-white/[0.06] border border-white/20 hover:border-[#F59E0B] text-[#F4EFE6] font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#F59E0B]" />
                <span>WhatsApp: {waInfo.display}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
