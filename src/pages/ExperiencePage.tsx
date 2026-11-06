import React from 'react';
import { useStudio } from '../context/StudioContext';
import { Star, ShieldCheck, Coffee, Volume2, Sparkles, Radio, ArrowRight, Zap, Flame, Beer } from 'lucide-react';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';

export const ExperiencePage: React.FC = () => {
  const { config, reviews, navigateTo } = useStudio();

  return (
    <div className="py-8 md:py-16 max-w-[1360px] mx-auto px-4 sm:px-6 space-y-16 md:space-y-24">
      
      {/* Title & Philosophy */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#222432]">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#00F0FF] font-bold block mb-1">
            CONCEPTO &amp; CULTURA DE ESTUDIO
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
            El Estudio Privado 1 a 1
          </h1>
        </div>
        <p className="text-xs font-mono text-zinc-400 max-w-[42ch]">
          Diseñado para hombres que buscan un corte impecable, sin perder tiempo en salas de espera abarrotadas ni con barberos apurados.
        </p>
      </div>

      {/* Main Visual & Urban Street Manifesto */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 space-y-6">
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white leading-tight uppercase">
            Por qué cortarse en un estudio a puertas cerradas cambia todo el juego.
          </h2>
          <p className="text-zinc-300 leading-relaxed text-sm md:text-base">
            En las barberías convencionales suele haber 4 o 5 sillones amontonados, música al palo sin filtro, gente esperando pegada a vos y barberos atendiendo llamadas o WhatsApps mientras te pasan la máquina.
          </p>
          <p className="text-zinc-300 leading-relaxed text-sm md:text-base">
            Acá la experiencia es 1 a 1 real: llegás a Vuelta de Obligado 931 y el espacio es 100% tuyo durante tu turno. Tenés café espresso o una bebida fría, la música que te gusta y a Rodrigo enfocado exclusivamente en dejarte el fade al milímetro por 12 mil pesos.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono text-[#00F0FF]">
            <span className="bg-[#181A24] px-3 py-1.5 rounded-lg border border-[#272938]">VUELTA DE OBLIGADO 931</span>
            <span>·</span>
            <span className="bg-[#181A24] px-3 py-1.5 rounded-lg border border-[#272938]">VENADO TUERTO</span>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="relative rounded-2xl overflow-hidden border border-[#262836] bg-[#14151E] h-[480px] group shadow-2xl concrete-overlay">
            <img
              src="/src/assets/images/urban_barber_hands_detail_1793930883253.jpg"
              alt="Rodrigo perfilando a navaja libre con vapor caliente y precisión milimétrica"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
            />
            <div className="absolute top-4 left-4 bg-black/80 border border-[#00F0FF]/40 backdrop-blur-md px-3 py-1.5 rounded-lg text-left shadow-lg">
              <span className="text-[10px] font-mono font-bold text-[#00F0FF] block">
                PULSO &amp; PRECISIÓN
              </span>
              <span className="text-[10px] font-mono text-zinc-300">
                NAVAJA JAPONESA FEATHER
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent text-white font-mono text-xs">
              <span className="text-[#00F0FF] font-bold block mb-1">EQUIPAMIENTO &amp; ATMÓSFERA</span>
              <p className="text-zinc-300">Sillón hidráulico ergonómico, sonido curado y herramientas desinfectadas con radiación UV entre cada cliente.</p>
            </div>
          </div>
        </div>
      </div>

      {/* The 3 Urban Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 md:p-8 rounded-xl border border-[#222432] bg-[#111218] space-y-3">
          <div className="w-10 h-10 rounded-lg bg-[#00F0FF] text-black flex items-center justify-center font-bold shadow-[0_0_12px_rgba(0,240,255,0.3)]">
            <Zap className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="font-mono text-[11px] uppercase text-[#00F0FF] font-bold block">Pilar 01</span>
          <h3 className="font-display text-xl font-bold text-white">Precisión Quirúrgica</h3>
          <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
            Clippers Babyliss Pro FX3 y Wahl Cordless calibradas a 0 mm. Pulido con shaver metálica para que el degradé no se desarme a los 3 días.
          </p>
        </div>

        <div className="p-6 md:p-8 rounded-xl border border-[#222432] bg-[#111218] space-y-3">
          <div className="w-10 h-10 rounded-lg bg-[#00F0FF] text-black flex items-center justify-center font-bold shadow-[0_0_12px_rgba(0,240,255,0.3)]">
            <Volume2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="font-mono text-[11px] uppercase text-[#00F0FF] font-bold block">Pilar 02</span>
          <h3 className="font-display text-xl font-bold text-white">Vibe &amp; Cero Teléfonos</h3>
          <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
            La web gestiona toda la agenda automáticamente. Nadie interrumpe tu corte para responder llamadas ni coordinar señas.
          </p>
        </div>

        <div className="p-6 md:p-8 rounded-xl border border-[#222432] bg-[#111218] space-y-3">
          <div className="w-10 h-10 rounded-lg bg-[#00F0FF] text-black flex items-center justify-center font-bold shadow-[0_0_12px_rgba(0,240,255,0.3)]">
            <Beer className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="font-mono text-[11px] uppercase text-[#00F0FF] font-bold block">Pilar 03</span>
          <h3 className="font-display text-xl font-bold text-white">Hospitalidad Callejera</h3>
          <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
            Café de especialidad en grano o cerveza fría de cortesía en cada corte. Toallas calientes vaporizadas con eucalipto y mentol para la barba.
          </p>
        </div>
      </div>

      {/* Google Reviews Verification */}
      <div className="p-6 md:p-10 rounded-2xl border border-[#222432] bg-[#101117] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase text-[#00F0FF] font-bold">
              GOOGLE MAPS VERIFIED (5.0 ★)
            </span>
            <h3 className="font-display text-2xl font-bold text-white mt-1">
              Testimonios de Clientes del Estudio
            </h3>
          </div>
          <a
            href={config.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={playMechanicalHover}
            className="px-4 py-2 text-xs font-mono font-bold rounded-lg border border-[#2B2D3D] bg-[#161722] text-zinc-200 hover:text-white hover:border-[#00F0FF] transition-colors"
          >
            Ver Todas las Reseñas
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="p-5 rounded-xl bg-[#14151E] border border-[#20222C] space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">{rev.authorName}</h4>
                  <p className="text-[11px] font-mono text-zinc-500">{rev.relativeDate} · {rev.serviceTag}</p>
                </div>
                <div className="flex text-[#00F0FF]">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed italic">
                &ldquo;{rev.textParts.map((t, idx) => (
                  <span key={idx} className={t.highlight ? 'font-bold text-white' : ''}>
                    {t.text}
                  </span>
                ))}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Direct CTA */}
      <div className="text-center space-y-4 pt-4">
        <h3 className="font-display text-2xl md:text-3xl font-extrabold text-white">
          Viví la experiencia del estudio en persona
        </h3>
        <p className="text-xs text-zinc-400 font-mono">
          Elegí tu turno online en tiempo real con confirmación automática.
        </p>
        <button
          onClick={() => {
            playMechanicalClick();
            navigateTo('booking');
          }}
          onMouseEnter={playMechanicalHover}
          className="px-8 py-3.5 bg-[#00F0FF] text-black text-xs uppercase tracking-wider font-black rounded-xl hover:bg-[#00D5E5] transition-all cursor-pointer inline-flex items-center gap-2 shadow-lg active:scale-95"
        >
          <span>Ir a Reservar Turno</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
