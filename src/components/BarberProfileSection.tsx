import React from 'react';
import { motion } from 'framer-motion';
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
    <motion.section
      id="barbero"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="relative z-10 max-w-[1380px] mx-auto px-4 sm:px-6 scroll-mt-24"
    >
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-4 border-b border-[#232730]">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#D4A373] font-bold mb-2">
            <span>PERFIL &amp; ESTUDIO</span>
            <span aria-hidden="true">·</span>
            <span className="text-zinc-400">ATENCIÓN 1 A 1 EN {config.neighborhood.toUpperCase()}</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            Conocé a <span className="text-[#D4A373]">{config.authorName}</span> &amp; El Estudio
          </h2>
        </div>
        <p className="text-xs sm:text-sm font-mono text-zinc-400 max-w-md">
          Arte urbano, técnica de precisión y tiempo exclusivo para cada cliente en {config.address}.
        </p>
      </div>

      {/* BARBER BIOGRAPHY & STUDIO PRESENTATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left: High-Impact Barber & Studio Visual */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-5 relative flex flex-col justify-between gap-4"
        >
          <div className="relative rounded-2xl overflow-hidden border border-[#282D37] bg-[#111318] flex-1 min-h-[420px] shadow-2xl group">
            <img
              src="/src/assets/images/urban_barber_hero_1793929257447.jpg"
              alt={`${config.authorName} trabajando con clipper de precisión en su estudio privado en ${config.neighborhood}`}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />

            {/* Top Barber Header Info */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
              <span className="px-3 py-1.5 rounded-xl bg-[#0A0B0E]/90 backdrop-blur-md border border-[#282D37] text-[#D4A373] text-xs font-mono font-bold uppercase tracking-wider shadow-lg">
                {config.studioTitle.toUpperCase()}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#D4A373] text-zinc-950 font-mono text-[10px] font-black uppercase tracking-wider shadow-md">
                ATENCIÓN 1 A 1
              </span>
            </div>

            {/* Bottom Gradient Overlay with Studio Identity */}
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-[#0A0B0E] via-[#0A0B0E]/85 to-transparent z-10">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#D4A373] font-bold mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  {config.address.toUpperCase()} · {config.neighborhood.toUpperCase()}
                </span>
              </div>
              <h3 className="text-xl font-display font-black text-white uppercase">
                {config.authorName} · Fundador &amp; Barbero Principal
              </h3>
              <p className="text-xs text-zinc-300 font-mono mt-1">
                Cortes de autor, fades milimétricos, colorimetría y perfilado de barba.
              </p>
            </div>
          </div>

          {/* Studio Secondary Card: Clipper & Shaver Tech */}
          <div className="p-4 rounded-2xl bg-[#111318] border border-[#232730] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4A373]/15 border border-[#D4A373]/30 text-[#D4A373] flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold text-white uppercase block">
                  Tecnología Clipper, Trimmer &amp; Shaver Titanio
                </span>
                <span className="text-[11px] font-mono text-zinc-400 block">
                  Pulido al ras 0.0 mm hipoalergénico · Cero irritación y esterilización UV
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Bio, Business Concept & Direct Communication Hub */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="lg:col-span-7 flex flex-col justify-between space-y-6"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-[#D4A373] text-xs font-mono font-bold uppercase tracking-wider">
              <UserCheck className="w-3.5 h-3.5" />
              <span>FILOSOFÍA DEL ESTUDIO &amp; OFICIO URBANO</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-display font-black text-white leading-tight uppercase">
              Si venís con una idea, la sacamos; si no, diseñamos juntos el corte que mejor te queda.
            </h3>

            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">{config.bio}</p>

            <p className="text-zinc-400 text-sm leading-relaxed">
              Trabajamos íntegramente con{' '}
              <strong className="text-zinc-200">
                clippers profesionales, trimmers de precisión (cuchilla en T), shavers de lámina de titanio hipoalergénica a 0.0 mm y tijeras de diseño
              </strong>
              , logrando transiciones limpias, textura natural y un acabado al ras suave sin irritar tu piel.
            </p>
          </div>

          {/* 4 Clear Value Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div className="p-4 rounded-2xl bg-[#111318] border border-[#232730] hover:border-[#D4A373]/40 transition-colors space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#D4A373] uppercase">
                  01. Visagismo &amp; Diseño a Medida
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#D4A373]" />
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Adaptamos la altura del fade, la caída superior y los ángulos a tu estructura craneal y tipo de pelo.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#111318] border border-[#232730] hover:border-[#D4A373]/40 transition-colors space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#D4A373] uppercase">
                  02. Precisión a Máquina &amp; Shaver
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#D4A373]" />
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Definición de contornos y rasurado 0.0 mm con Trimmers Skeleton y Shaver de Titanio: prolijidad extrema sin ardor.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#111318] border border-[#232730] hover:border-[#D4A373]/40 transition-colors space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#D4A373] uppercase">
                  03. Estudio Privado 1 a 1
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#D4A373]" />
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Puntualidad real en {config.address}. Sin salas de espera llenas ni interrupciones mientras estás en el sillón.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#111318] border border-[#232730] hover:border-[#D4A373]/40 transition-colors space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-white uppercase">
                  04. Acabado &amp; Durabilidad
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Corte pensado para que crezca parejo durante semanas y puedas peinarlo en segundos con polvo texturizante mate.
              </p>
            </div>
          </div>

          {/* DIRECT COMMUNICATION CHANNELS: INSTAGRAM & WHATSAPP */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#111318] border border-[#282D37] shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1E222B]">
              <div>
                <span className="text-[11px] font-mono text-[#D4A373] font-bold uppercase tracking-wider block">
                  CONSULTA PERSONALIZADA CON {config.authorName.toUpperCase()}
                </span>
                <h4 className="text-base font-bold text-white">
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
                className="group flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-[#D4A373] hover:bg-[#C89562] text-zinc-950 font-mono text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
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
                className="group flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-[#161920] hover:bg-[#1C2029] border border-[#282D37] hover:border-[#D4A373] text-zinc-200 hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#D4A373]" />
                <span>WhatsApp: {waInfo.display}</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};
