import React, { useState, useEffect } from 'react';
import { useStudio } from '../context/StudioContext';
import {
  Scissors,
  ArrowRight,
  Star,
  MapPin,
  Barcode,
  Instagram,
  MessageCircle,
  Camera,
  UserCheck,
  Sparkles,
  Volume2,
  Calendar,
  Compass,
} from 'lucide-react';
import { VoicePresentationPlayer } from '../components/VoicePresentationPlayer';
import { BarberProfileSection } from '../components/BarberProfileSection';
import { StudioMultiGallery } from '../components/StudioMultiGallery';
import { ClientVoices } from '../components/ClientVoices';
import { ThermalReceiptBooking } from '../components/ThermalReceiptBooking';
import { UrbanGraffitiMural } from '../components/UrbanGraffitiMural';
import { formatPriceARS } from '../utils/bookingEngine';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';

const HOME_SECTIONS = [
  { id: 'inicio', index: '01', label: 'Presentación & Audio', icon: Volume2 },
  { id: 'barbero', index: '02', label: 'Rodrigo & El Negocio', icon: UserCheck },
  { id: 'galeria', index: '03', label: 'Galería Multimedia', icon: Camera },
  { id: 'servicios', index: '04', label: 'Servicios & Precios', icon: Scissors },
  { id: 'opiniones', index: '05', label: 'Opiniones Reales', icon: Star },
  { id: 'reservar', index: '06', label: 'Sacar Turno Online', icon: Calendar },
];

export const HomePage: React.FC = () => {
  const {
    config,
    services,
    navigateTo,
    setSelectedServiceIds,
  } = useStudio();

  const [activeSection, setActiveSection] = useState<string>('inicio');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 220;
      for (let i = HOME_SECTIONS.length - 1; i >= 0; i--) {
        const sec = HOME_SECTIONS[i];
        const el = document.getElementById(sec.id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sec.id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    playMechanicalClick();
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative space-y-20 md:space-y-28 pb-24 overflow-x-hidden">
      
      {/* ARTISTIC GENERATIVE GRAFFITI MURAL BACKGROUND DECORATION */}
      <div className="absolute top-0 left-0 right-0 h-[1120px] pointer-events-none z-0 overflow-hidden">
        <UrbanGraffitiMural className="h-full w-full" showControls={false} />
      </div>

      {/* KINETIC TICKER (MARQUEE) */}
      <div className="relative z-10 w-full bg-gradient-to-r from-[#A855F7] via-[#D946EF] to-[#FF4655] text-white py-2.5 font-mono text-xs font-black uppercase tracking-wider overflow-hidden border-b border-black select-none shadow-[0_0_20px_rgba(168,85,247,0.35)]">
        <div className="animate-marquee whitespace-nowrap">
          <span className="mx-4">⚡ RODRIGO CUTSSS // VENADO TUERTO</span>
          <span className="mx-4">·</span>
          <span className="mx-4">ESTILO PROPIO, CERO PLANTILLAS</span>
          <span className="mx-4">·</span>
          <span className="mx-4">CORTE DE PELO: $12.000 ARS</span>
          <span className="mx-4">·</span>
          <span className="mx-4">VUELTA DE OBLIGADO 931</span>
          <span className="mx-4">·</span>
          <span className="mx-4">CORTES · FADES · COLOR · BARBA</span>
          <span className="mx-4">·</span>
          <span className="mx-4">0.0 MM SHAVER DE TITANIO &amp; TRIMMERS DE PRECISIÓN</span>
          <span className="mx-4">·</span>
          <span className="mx-4">INSTAGRAM DM: @RODRIGO.CUTSSS</span>
          <span className="mx-4">·</span>
          <span className="mx-4">WHATSAPP: {config.phoneDisplay}</span>
          <span className="mx-4">·</span>
        </div>
      </div>

      {/* STICKY RECOMMENDED SECTION NAVIGATOR (ORGANIZED FLOW) */}
      <div className="sticky top-16 z-30 bg-[#0A0B10]/90 backdrop-blur-xl border-b border-[#22263A] py-2.5 px-4 sm:px-6 shadow-lg">
        <div className="max-w-[1380px] mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          <div className="hidden xl:flex items-center gap-2 text-[11px] font-mono font-bold text-zinc-400 shrink-0">
            <Compass className="w-3.5 h-3.5 text-[#A855F7]" />
            <span>RECORRIDO ORDENADO:</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {HOME_SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onMouseEnter={playMechanicalHover}
                  onClick={() => scrollToSection(sec.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#A855F7] to-[#FF4655] text-white shadow-[0_0_15px_rgba(168,85,247,0.35)]'
                      : 'bg-[#121522] border border-[#242940] text-zinc-400 hover:text-white hover:border-[#A855F7]/50'
                  }`}
                >
                  <span className={isActive ? 'text-white font-black' : 'text-[#A855F7]'}>
                    {sec.index}.
                  </span>
                  <Icon className="w-3 h-3 hidden sm:inline" />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 01: BIENVENIDA, PROPUESTA DE VALOR & AUDIO DE PRESENTACIÓN        */}
      {/* ========================================================================= */}
      <section id="inicio" className="relative z-10 max-w-[1380px] mx-auto px-4 sm:px-6 scroll-mt-28">
        <div className="relative rounded-3xl bg-[#0D0F18]/90 backdrop-blur-md border-2 border-[#24283D] p-6 sm:p-10 lg:p-12 overflow-hidden shadow-2xl bg-halftone-grid concrete-overlay distressed-surface">
          
          {/* Internal Graffiti Mural Layer directly decorating the Hero poster */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-25 mix-blend-screen">
            <UrbanGraffitiMural showControls={false} />
          </div>

          {/* Corner Decal in Flame Coral */}
          <div className="absolute -top-10 -right-10 w-64 h-10 bg-[#FF4655] text-white font-mono font-black text-xs uppercase flex items-center justify-center transform rotate-45 shadow-xl pointer-events-none select-none tracking-widest z-10">
            SHAVER 0.0 MM // VT 931
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            
            {/* Left Content: Headline + Audio Presentation Player + Actions */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                <span className="px-2.5 py-1 bg-[#A855F7]/20 border border-[#A855F7] text-[#C084FC] font-black uppercase rounded-lg tracking-wider">
                  SECCIÓN 01 · BIENVENIDA
                </span>
                <span className="text-zinc-500">·</span>
                <span className="text-zinc-300 font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-[#FF4655] text-[#FF4655]" />
                  5.0 ★ (Venado Tuerto)
                </span>
                <span className="text-zinc-500">·</span>
                <span className="text-[#FF4655] font-bold">Vuelta de Obligado 931</span>
                <span className="text-zinc-500 hidden sm:inline">·</span>
                <button
                  type="button"
                  onMouseEnter={playMechanicalHover}
                  onClick={() => {
                    playMechanicalClick();
                    window.dispatchEvent(new CustomEvent('regenerate-graffiti-mural'));
                  }}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#A855F7]/15 border border-[#A855F7]/40 text-[#A855F7] text-[11px] font-bold uppercase tracking-wider hover:bg-[#A855F7]/25 cursor-pointer active:scale-95 transition-all"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4655] animate-pulse" />
                  Mural Graffiti ⚡ [Regenerar]
                </button>
              </div>

              {/* Giant Poster Headline aligned with Rodrigo's Audio */}
              <div className="space-y-3">
                <h1 className="font-display text-[clamp(2.4rem,5.2vw,4.7rem)] font-black uppercase leading-[0.94] tracking-tighter text-white">
                  ESTILO PROPIO, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] via-[#D946EF] to-[#FF4655] bg-black px-2 py-0.5 inline-block my-1 border border-[#A855F7]/40 shadow-[0_0_25px_rgba(168,85,247,0.25)]">
                    CERO PLANTILLAS.
                  </span> <br />
                  CORTES &amp; FADES EN VT.
                </h1>
                
                {/* Headline Badge: Main Service Price */}
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#141624] border border-[#FF4655]/40 font-mono text-xs font-bold text-zinc-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF4655] animate-ping" />
                  <span>SERVICIO PRINCIPAL: <strong className="text-white font-black">CORTE DE PELO COMPLETO</strong> · <strong className="text-[#FF4655] font-black text-sm">$12.000 ARS</strong></span>
                </div>
              </div>

              <p className="text-base sm:text-lg text-zinc-300 max-w-2xl font-normal leading-relaxed">
                Acá hacemos <strong>cortes, fades, color, barba y otros servicios</strong> con atención exclusiva 1 a 1 en <strong>Vuelta de Obligado 931, Venado Tuerto</strong>. Si venís con una idea, la sacamos; si no, la armamos juntos.
              </p>

              {/* EMBEDDED VOICE PRESENTATION PLAYER */}
              <VoicePresentationPlayer variant="hero" />

              {/* Real Value Action Buttons */}
              <div className="pt-1 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => scrollToSection('reservar')}
                  onMouseEnter={playMechanicalHover}
                  className="px-7 py-4 bg-gradient-to-r from-[#A855F7] to-[#D946EF] hover:from-[#9333EA] hover:to-[#C026D3] text-white font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2.5 cursor-pointer shadow-[0_0_25px_rgba(168,85,247,0.35)] active:scale-95"
                >
                  <Scissors className="w-4 h-4" />
                  <span>Sacar Turno Online ($12.000)</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection('galeria')}
                  onMouseEnter={playMechanicalHover}
                  className="px-5 py-4 border border-[#A855F7]/50 bg-[#151828] hover:bg-[#A855F7]/20 text-white rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <Camera className="w-4 h-4 text-[#A855F7]" />
                  <span>Ver Galería &amp; Fotos</span>
                </button>

                {/* Direct WhatsApp Link Button */}
                <a
                  href={`https://wa.me/${config.whatsappRaw}?text=Hola%20Rodrigo!%20Escuch%C3%A9%20tu%20presentaci%C3%B3n%20en%20la%20p%C3%A1gina%20y%20quiero%20sacar%20un%20turno`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={playMechanicalHover}
                  onClick={playMechanicalClick}
                  className="px-5 py-4 border border-[#31364F] bg-[#161826] hover:border-[#FF4655] text-zinc-200 hover:text-white rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 text-[#FF4655]" />
                  <span>WhatsApp Directo</span>
                </a>
              </div>
            </div>

            {/* Right: Atelier Spotlight & Direct Barber Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border-2 border-[#2F344E] bg-black min-h-[490px] shadow-2xl group">
                <img
                  src="/src/assets/images/urban_barber_hero_1793929257447.jpg"
                  alt="Rodrigo trabajando con clipper y peine en su estudio privado en Venado Tuerto"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />

                {/* Top Overlay Info */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                  <div className="bg-black/85 border border-[#A855F7]/60 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg">
                    <span className="text-[10px] font-mono font-black text-[#A855F7] block tracking-wider uppercase">
                      BARBERO &amp; FUNDADOR
                    </span>
                    <span className="text-xs font-mono text-white font-black">
                      Rodrigo · Rodrigo Cutsss
                    </span>
                  </div>
                  <span className="px-2.5 py-1 bg-[#FF4655] text-white font-mono font-black text-[10px] rounded-lg uppercase shadow-md">
                    1 A 1 EXCLUSIVO
                  </span>
                </div>

                {/* Card Footer with Direct Channels */}
                <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/95 via-black/80 to-transparent space-y-3 z-10">
                  <div className="font-mono text-xs text-white">
                    <span className="text-[#FF4655] block text-[10px] font-black uppercase tracking-wider">
                      UBICACIÓN EN VENADO TUERTO:
                    </span>
                    <span className="text-zinc-200 font-bold block text-sm">
                      Vuelta de Obligado 931 · Santa Fe
                    </span>
                    <span className="text-zinc-400 text-[11px] block mt-0.5">
                      Cortes · Fades · Color · Barba · $12.000 ARS
                    </span>
                  </div>

                  {/* Direct Contact Bar right on the photo */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href="https://instagram.com/rodrigo.cutsss"
                      target="_blank"
                      rel="noopener noreferrer"
                      onMouseEnter={playMechanicalHover}
                      onClick={playMechanicalClick}
                      className="py-2.5 px-3 rounded-xl bg-[#1D162B] border border-[#A855F7]/60 hover:bg-[#A855F7] text-white font-mono text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <Instagram className="w-3.5 h-3.5 text-[#D946EF]" />
                      <span>@rodrigo.cutsss</span>
                    </a>

                    <a
                      href={`https://wa.me/${config.whatsappRaw}?text=Hola%20Rodrigo,%20vi%20tu%20p%C3%A1gina%20web%20y%20tengo%20una%20consulta`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onMouseEnter={playMechanicalHover}
                      onClick={playMechanicalClick}
                      className="py-2.5 px-3 rounded-xl bg-[#161C26] border border-[#FF4655]/60 hover:bg-[#FF4655] text-white font-mono text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#FF4655]" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECCIÓN 02: PRESENTACIÓN DE RODRIGO & EL NEGOCIO (SIN NAVAJAS)            */}
      {/* ========================================================================= */}
      <BarberProfileSection />

      {/* ========================================================================= */}
      {/* SECCIÓN 03: GALERÍA MULTIMEDIA DEL ESTUDIO (FOTOS DE DIFERENTES COSAS)    */}
      {/* ========================================================================= */}
      <section id="galeria" className="relative z-10 max-w-[1380px] mx-auto px-4 sm:px-6 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#23273A]">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#FF4655] font-bold mb-2">
              <span className="px-2 py-0.5 rounded bg-[#FF4655]/20 border border-[#FF4655]/40 text-[#FF4655]">
                SECCIÓN 03
              </span>
              <span>MURAL MULTIMEDIA // CORTES, LOCAL, MÁQUINAS Y CULTURA</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
              Galería del <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] via-[#D946EF] to-[#FF4655]">Estudio</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-mono text-zinc-400 max-w-md">
            Fotos reales de cortes, el estudio en Vuelta de Obligado 931, nuestras máquinas de precisión y trabajos de color. Podés filtrar o subir nuevas fotos.
          </p>
        </div>

        <StudioMultiGallery />
      </section>

      {/* ========================================================================= */}
      {/* SECCIÓN 04: CARTA DE SERVICIOS & PRECIOS CLAROS                           */}
      {/* ========================================================================= */}
      <section id="servicios" className="relative z-10 max-w-[1380px] mx-auto px-4 sm:px-6 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-4 border-b border-[#23273A]">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#A855F7] font-bold mb-2">
              <span className="px-2 py-0.5 rounded bg-[#A855F7]/20 border border-[#A855F7]/40 text-[#C084FC]">
                SECCIÓN 04
              </span>
              <span>MENÚ DE SERVICIOS // VALORES TRANSPARENTES</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
              Cortes, Fades, Color &amp; Barba
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              playMechanicalClick();
              navigateTo('services');
            }}
            onMouseEnter={playMechanicalHover}
            className="text-xs font-mono font-bold uppercase tracking-wider text-[#A855F7] hover:text-[#D946EF] hover:underline cursor-pointer flex items-center gap-1.5"
          >
            <span>Ver Fichas Técnicas Completas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="bg-[#121420] border-2 border-[#24283C] rounded-2xl p-6 flex flex-col justify-between hover:border-[#A855F7]/70 transition-all group relative overflow-hidden shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-3">
                  <span className="px-2.5 py-1 bg-[#1C1F32] text-[#C084FC] rounded-lg font-bold">
                    {srv.index}. {srv.category} · {srv.durationMinutes} min
                  </span>
                  <span className="text-xl font-black text-white font-mono">
                    {formatPriceARS(srv.price)}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2.5">
                  <h3 className="font-display text-xl font-bold text-white group-hover:text-[#A855F7] transition-colors">
                    {srv.name}
                  </h3>
                </div>

                {srv.popularTag && (
                  <span className="inline-block mb-3 px-2.5 py-0.5 bg-[#FF4655]/15 border border-[#FF4655]/30 text-[#FF4655] text-[10px] font-mono font-bold rounded">
                    {srv.popularTag}
                  </span>
                )}

                <p className="text-xs text-zinc-400 leading-relaxed mb-5">
                  {srv.shortDescription}
                </p>

                <div className="p-3 bg-[#0B0C14] border border-[#1E2236] rounded-xl mb-5 text-xs font-mono">
                  <span className="text-[10px] text-zinc-500 block uppercase font-bold">
                    Máquinas &amp; Productos:
                  </span>
                  <span className="text-zinc-300 font-semibold">{srv.productsUsed}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1E2236] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    playMechanicalClick();
                    navigateTo('services');
                  }}
                  onMouseEnter={playMechanicalHover}
                  className="text-xs font-mono text-zinc-400 hover:text-white underline cursor-pointer"
                >
                  Paso a paso
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playMechanicalClick();
                    setSelectedServiceIds([srv.id]);
                    scrollToSection('reservar');
                  }}
                  onMouseEnter={playMechanicalHover}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#A855F7] to-[#D946EF] hover:from-[#9333EA] hover:to-[#C026D3] text-white font-mono text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.25)] active:scale-95"
                >
                  Seleccionar Turno
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECCIÓN 05: OPINIONES VERIFICADAS DE CLIENTES (CLIENT VOICES)             */}
      {/* ========================================================================= */}
      <div id="opiniones" className="scroll-mt-24">
        <ClientVoices />
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 06: RESERVA DE TURNO ONLINE & DESPACHO A WHATSAPP                 */}
      {/* ========================================================================= */}
      <section id="reservar" className="max-w-[1380px] mx-auto px-4 sm:px-6 scroll-mt-24">
        <div className="mb-10 pb-4 border-b border-[#23273A]">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded bg-[#FF4655]/20 border border-[#FF4655]/40 text-[#FF4655] font-mono text-xs font-bold">
              SECCIÓN 06
            </span>
            <Barcode className="w-5 h-5 text-[#A855F7]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#FF4655] font-bold">
              RESERVA ONLINE O POR WHATSAPP // VENADO TUERTO
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
            Sacá tu Turno en Vivo
          </h2>
          <p className="text-zinc-400 text-sm mt-1 max-w-xl">
            Elegí tu servicio, fecha y horario disponible en Vuelta de Obligado 931. El sistema arma tu ticket al instante.
          </p>
        </div>

        <ThermalReceiptBooking />
      </section>
    </div>
  );
};
