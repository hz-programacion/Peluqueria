import React from 'react';
import { useStudio } from '../context/StudioContext';
import { Star, Volume2, ArrowRight, Zap, Beer } from 'lucide-react';
import { BarberProfileSection } from '../components/BarberProfileSection';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';

export const ExperiencePage: React.FC = () => {
  const { config, reviews, navigateTo } = useStudio();

  return (
    <div className="py-8 md:py-16 max-w-[1380px] mx-auto px-4 sm:px-6 space-y-16 md:space-y-20">
      {/* Title & Philosophy */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#232730]">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#F59E0B] font-bold block mb-1">
            CONCEPTO &amp; CULTURA DE ESTUDIO // ATENCIÓN 1 A 1
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
            {config.authorName} &amp; El Estudio Privado 1 a 1
          </h1>
        </div>
        <p className="text-xs font-mono text-zinc-400 max-w-[44ch]">
          &ldquo;{config.heroSubtitle}&rdquo;
        </p>
      </div>

      {/* Full Barber Profile & Business Presentation */}
      <BarberProfileSection />

      {/* Main Visual & Urban Street Manifesto */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pt-4 border-t border-[#232730]">
        <div className="lg:col-span-6 space-y-6">
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white leading-tight uppercase">
            Por qué cortarse en un estudio a puertas cerradas cambia todo el juego.
          </h2>
          <p className="text-zinc-300 leading-relaxed text-sm md:text-base">
            En las barberías convencionales suele haber 4 o 5 sillones amontonados, gente esperando pegada a vos y barberos atendiendo llamadas o apurados mientras te pasan la máquina.
          </p>
          <p className="text-zinc-300 leading-relaxed text-sm md:text-base">
            Acá la experiencia es 1 a 1 real: llegás a {config.address} y el espacio es 100% tuyo durante tu turno. Trabajamos con clippers profesionales, trimmers de precisión (cuchilla T), tijeras de esculpir y shaver de lámina de titanio 0.0 mm hipoalergénica, cuidando tu piel y logrando degradés perfectos por {config.mainPriceDisplay}.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono text-[#F59E0B]">
            <span className="bg-[#111318] px-3 py-1.5 rounded-lg border border-[#232730]">
              {config.address.toUpperCase()}
            </span>
            <span>·</span>
            <span className="bg-[#111318] px-3 py-1.5 rounded-lg border border-[#232730]">
              {config.neighborhood.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="relative rounded-2xl overflow-hidden border border-[#232730] bg-[#111318] h-[460px] group shadow-2xl">
            <img
              src="/src/assets/images/urban_barber_hands_detail_1793930883253.jpg"
              alt={`${config.authorName} trabajando con trimmer de precisión y shaver de titanio en ${config.neighborhood}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
            />
            <div className="absolute top-4 left-4 bg-[#0A0B0E]/90 border border-[#282D37] backdrop-blur-md px-3 py-1.5 rounded-lg text-left shadow-lg">
              <span className="text-[10px] font-mono font-bold text-[#F59E0B] block">
                PULSO &amp; TECNOLOGÍA
              </span>
              <span className="text-[10px] font-mono text-zinc-300">
                TRIMMER SKELETON &amp; SHAVER TITANIO 0.0MM
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-[#0A0B0E] via-[#0A0B0E]/80 to-transparent text-white font-mono text-xs">
              <span className="text-[#F59E0B] font-bold block mb-1">
                EQUIPAMIENTO &amp; ATMÓSFERA
              </span>
              <p className="text-zinc-300">
                Sillón hidráulico ergonómico, sonido curado y máquinas desinfectadas con radiación UV entre cada cliente.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* The 3 Urban Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 md:p-8 rounded-2xl border border-[#232730] bg-[#111318] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#F59E0B] flex items-center justify-center font-bold">
            <Zap className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="font-mono text-[11px] uppercase text-[#F59E0B] font-bold block">
            Pilar 01
          </span>
          <h3 className="font-display text-xl font-bold text-white">
            Precisión Clipper &amp; Shaver
          </h3>
          <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
            Clippers Babyliss Pro FX3, Wahl Cordless y Shaver de lámina de titanio calibradas a 0.0 mm para un degradé limpio, duradero y sin irritación.
          </p>
        </div>

        <div className="p-6 md:p-8 rounded-2xl border border-[#232730] bg-[#111318] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#F59E0B] flex items-center justify-center font-bold">
            <Volume2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="font-mono text-[11px] uppercase text-[#F59E0B] font-bold block">
            Pilar 02
          </span>
          <h3 className="font-display text-xl font-bold text-white">Vibe &amp; Cero Teléfonos</h3>
          <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
            La web gestiona toda la agenda automáticamente. Nadie interrumpe tu corte para responder llamadas ni coordinar señas.
          </p>
        </div>

        <div className="p-6 md:p-8 rounded-2xl border border-[#232730] bg-[#111318] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#F59E0B] flex items-center justify-center font-bold">
            <Beer className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="font-mono text-[11px] uppercase text-[#F59E0B] font-bold block">
            Pilar 03
          </span>
          <h3 className="font-display text-xl font-bold text-white">Comodidad Total</h3>
          <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
            Café de especialidad o bebida fría de cortesía en cada corte, buena música y atención 100% dedicada a tu estilo.
          </p>
        </div>
      </div>

      {/* Google Reviews Verification */}
      <div className="p-6 md:p-10 rounded-2xl border border-[#232730] bg-[#111318] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase text-[#F59E0B] font-bold">
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
            className="px-4 py-2 text-xs font-mono font-bold rounded-xl border border-[#282D37] bg-[#161920] text-zinc-200 hover:text-white hover:border-[#F59E0B] transition-colors"
          >
            Ver Todas las Reseñas
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-xl bg-[#0C0E12] border border-[#1E222B] space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">{rev.authorName}</h4>
                  <p className="text-[11px] font-mono text-zinc-500">
                    {rev.relativeDate} · {rev.serviceTag}
                  </p>
                </div>
                <div className="flex text-[#F59E0B]">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed italic">
                &ldquo;
                {rev.textParts.map((t, idx) => (
                  <span key={idx} className={t.highlight ? 'font-bold text-white' : ''}>
                    {t.text}
                  </span>
                ))}
                &rdquo;
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
          className="px-8 py-3.5 bg-[#F59E0B] text-zinc-950 text-xs uppercase tracking-wider font-black rounded-xl hover:bg-[#D97706] transition-all cursor-pointer inline-flex items-center gap-2 shadow-md active:scale-95"
        >
          <span>Ir a Reservar Turno</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
