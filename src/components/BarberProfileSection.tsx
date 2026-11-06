import React from 'react';
import { useStudio } from '../context/StudioContext';
import {
  Scissors,
  Instagram,
  MessageCircle,
  ShieldCheck,
  MapPin,
  ExternalLink,
  Flame,
  Zap,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';

export const BarberProfileSection: React.FC = () => {
  const { config, navigateTo } = useStudio();

  return (
    <section id="barbero" className="relative z-10 max-w-[1380px] mx-auto px-4 sm:px-6 scroll-mt-24">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-4 border-b border-[#23273A]">
        <div>
          <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#A855F7] font-bold mb-2">
            <span className="px-2 py-0.5 rounded bg-[#A855F7]/20 border border-[#A855F7]/40 text-[#C084FC]">
              SECCIÓN 02
            </span>
            <span className="w-2 h-2 rounded-full bg-[#FF4655] animate-pulse" />
            <span>EL BARBERO &amp; EL NEGOCIO // VENADO TUERTO</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
            Conocé a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] via-[#D946EF] to-[#FF4655]">Rodrigo</span> &amp; El Estudio
          </h2>
        </div>
        <p className="text-xs sm:text-sm font-mono text-zinc-400 max-w-md">
          "Estilo propio, cero plantillas. Si venís con una idea, la sacamos. Si no, la armamos juntos."
        </p>
      </div>

      {/* BARBER BIOGRAPHY & STUDIO PRESENTATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left: High-Impact Barber & Studio Visual */}
        <div className="lg:col-span-5 relative flex flex-col justify-between gap-4">
          <div className="relative rounded-3xl overflow-hidden border-2 border-[#292D42] bg-[#121420] flex-1 min-h-[420px] shadow-2xl group concrete-overlay distressed-surface">
            <img
              src="/src/assets/images/urban_barber_hero_1793929257447.jpg"
              alt="Rodrigo trabajando con clipper de precisión y peine en su estudio privado en Venado Tuerto"
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />

            {/* Top Barber Badge */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
              <span className="px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-[#A855F7]/60 text-[#A855F7] text-xs font-mono font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#A855F7] animate-ping" />
                <span>RODRIGO // CUTSSS</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#FF4655] text-white font-mono text-[10px] font-black uppercase tracking-wider shadow-[0_0_12px_rgba(255,70,85,0.4)]">
                ATENCIÓN 1 A 1
              </span>
            </div>

            {/* Bottom Gradient Overlay with Studio Identity */}
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/95 via-black/75 to-transparent z-10">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#FF4655] font-bold mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>VUELTA DE OBLIGADO 931 · VENADO TUERTO</span>
              </div>
              <h3 className="text-xl font-display font-black text-white uppercase">
                Rodrigo · Cortes, Fades, Color &amp; Barba
              </h3>
              <p className="text-xs text-zinc-300 font-mono mt-1">
                Estudio privado con turno previo. Corte de pelo: <strong className="text-white">$12.000 ARS</strong>.
              </p>
            </div>
          </div>

          {/* Studio Secondary Card: No Razors / Pure Clipper & Shaver Tech */}
          <div className="p-4 rounded-2xl bg-[#11131F] border border-[#262B42] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#A855F7]/15 border border-[#A855F7]/40 text-[#A855F7] flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-black text-white uppercase block">
                  Tecnología Clipper, Trimmer &amp; Shaver Titanio
                </span>
                <span className="text-[11px] font-mono text-zinc-400 block">
                  Pulido al ras 0.0 mm hipoalergénico · Cero irritación y máxima higiene
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                playMechanicalClick();
                const el = document.getElementById('galeria');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-1.5 rounded-lg bg-[#1A1E30] hover:bg-[#A855F7] text-xs font-mono font-bold text-zinc-200 hover:text-white transition-colors shrink-0 cursor-pointer"
            >
              Ver Galería &rarr;
            </button>
          </div>
        </div>

        {/* Right: Bio, Business Concept & Direct Communication Hub */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#A855F7]/15 border border-[#A855F7]/40 text-[#A855F7] text-xs font-mono font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-[#FF4655]" />
              <span>IDENTIDAD DEL ESTUDIO &amp; TRATO PERSONALIZADO</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-display font-black text-white leading-tight uppercase">
              "Estilo propio, cero plantillas. Si venís con una idea, la sacamos; si no, la armamos juntos."
            </h3>

            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              <strong>Rodrigo Cutsss</strong> nació en Venado Tuerto para ofrecer algo distinto a las peluquerías tradicionales donde te cortan apurados mientras hay 5 personas mirando y esperando. En <strong>Vuelta de Obligado 931</strong> el turno es 1 a 1: te sentás a la hora pactada y nos enfocamos exclusivamente en tu imagen.
            </p>

            <p className="text-zinc-400 text-sm leading-relaxed">
              Hacemos cortes urbanos, fades milimétricos, color, platinados y arreglo de barba. Trabajamos íntegramente con <strong>clippers profesionales, trimmers de precisión (cuchilla en T), shavers de lámina de titanio hipoalergénica a 0.0 mm y tijeras de diseño</strong>, logrando un pulido al ras suave, seguro y sin irritar la piel.
            </p>
          </div>

          {/* 4 Clear Value Pillars of Rodrigo & The Business */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div className="p-4 rounded-2xl bg-[#131522] border border-[#252A40] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-[#A855F7] uppercase">
                  01 · Estilo a Medida
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#A855F7]" />
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Cero cortes genéricos. Adaptamos el fade, el largo superior y los contornos a tu tipo de pelo y forma de cara.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#131522] border border-[#252A40] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-[#FF4655] uppercase">
                  02 · Precisión a Máquina &amp; Shaver
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#FF4655]" />
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Definición de contornos y rasurado 0.0 mm con Trimmers Skeleton y Shaver de Titanio: prolijidad extrema sin cortes ni ardor.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#131522] border border-[#252A40] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-[#D946EF] uppercase">
                  03 · Estudio Privado 1 a 1
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#D946EF]" />
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Puntualidad real. Sin salas de espera llenas ni interrupciones mientras estás en el sillón.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#131522] border border-[#252A40] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-white uppercase">
                  04 · Valor Claro ($12.000)
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Corte de pelo completo a $12.000 ARS con asesoramiento y styling final con productos mate de primera línea.
              </p>
            </div>
          </div>

          {/* DIRECT COMMUNICATION CHANNELS: INSTAGRAM & WHATSAPP */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#171226] via-[#1A1429] to-[#1E1122] border-2 border-[#A855F7]/50 shadow-[0_0_30px_rgba(168,85,247,0.15)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#2C2442]">
              <div>
                <span className="text-[11px] font-mono text-[#FF4655] font-black uppercase tracking-wider block">
                  CONTACTO DIRECTO CON RODRIGO
                </span>
                <h4 className="text-base font-bold text-white">
                  ¿Venís con una idea o foto de referencia? Escribile directo
                </h4>
              </div>
              <span className="text-xs font-mono text-zinc-400">Atención en el día</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Instagram Direct Link */}
              <a
                href="https://instagram.com/rodrigo.cutsss"
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={playMechanicalHover}
                onClick={playMechanicalClick}
                className="group flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#D946EF] hover:from-[#9333EA] hover:to-[#C026D3] text-white font-mono text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] active:scale-95 cursor-pointer"
              >
                <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Instagram @rodrigo.cutsss</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

              {/* WhatsApp Direct Link */}
              <a
                href={`https://wa.me/${config.whatsappRaw}?text=Hola%20Rodrigo!%20Escuch%C3%A9%20tu%20presentaci%C3%B3n%20en%20la%20web%20y%20quiero%20coordinar%20un%20turno`}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={playMechanicalHover}
                onClick={playMechanicalClick}
                className="group flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-[#181C28] hover:bg-[#202536] border border-[#2E354D] hover:border-[#FF4655] text-zinc-200 hover:text-white font-mono text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#FF4655] group-hover:scale-110 transition-transform" />
                <span>WhatsApp: {config.phoneDisplay}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
