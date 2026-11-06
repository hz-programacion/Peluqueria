import React, { useState, useRef } from 'react';
import { useStudio } from '../context/StudioContext';
import {
  Scissors,
  ArrowRight,
  Star,
  MapPin,
  Sparkles,
  ShieldCheck,
  Clock,
  Volume2,
  VolumeX,
  Radio,
  Barcode,
  Disc3,
  Sliders,
  Check,
} from 'lucide-react';
import { FadeStencilStudio } from '../components/FadeStencilStudio';
import { StreetwearDrops } from '../components/StreetwearDrops';
import { ThermalReceiptBooking } from '../components/ThermalReceiptBooking';
import { formatPriceARS } from '../utils/bookingEngine';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';

export const HomePage: React.FC = () => {
  const {
    config,
    services,
    lookbook,
    reviews,
    navigateTo,
    setSelectedServiceIds,
    setIsStyleFinderOpen,
  } = useStudio();

  const [activePhoto, setActivePhoto] = useState<'streetwear' | 'station' | 'hands'>('streetwear');
  const [buzzerPlaying, setBuzzerPlaying] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Synthesize realistic barber clipper buzz via Web Audio API
  const playClipperSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;

      if (ctx.state === 'suspended') ctx.resume();

      setBuzzerPlaying(true);
      const now = ctx.currentTime;

      // Clipper motor oscillator
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(118, now); // 118Hz hum of a professional magnetic clipper
      osc.frequency.linearRampToValueAtTime(124, now + 0.3);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);

      setTimeout(() => setBuzzerPlaying(false), 450);
    } catch {
      setBuzzerPlaying(false);
    }
  };

  const photoAssets = {
    streetwear: {
      src: '/src/assets/images/urban_streetwear_haircut_1793930882291.jpg',
      tag: 'TEXTURA & POSTER WALL',
      title: 'Crop Texturizado & Streetwear Fit',
      spec: 'Frontal recto a escuadra · Guía 0.5 a navaja',
    },
    station: {
      src: '/src/assets/images/urban_graffiti_mirror_1793930882309.jpg',
      tag: 'ESTACIÓN UNDERGROUND',
      title: 'El Espejo Intervenido con Stickers',
      spec: 'Hormigón crudo · Neón cálido · Sillón hidráulico',
    },
    hands: {
      src: '/src/assets/images/urban_barber_hands_detail_1793930883253.jpg',
      tag: 'PRECISIÓN QUIRÚRGICA',
      title: 'Perfilado a Navaja Libre & Vapor',
      spec: 'Ángulo 30° · Shavette Feather Japonesa',
    },
  };

  return (
    <div className="space-y-20 md:space-y-32 pb-24 overflow-x-hidden">
      
      {/* 1. KINETIC TICKER (MARQUEE) */}
      <div className="w-full bg-[#00F0FF] text-black py-2.5 font-mono text-xs font-black uppercase tracking-wider overflow-hidden border-b border-black select-none">
        <div className="animate-marquee whitespace-nowrap">
          <span className="mx-4">⚡ RODRIGO CUTSSS // VENADO TUERTO</span>
          <span className="mx-4">·</span>
          <span className="mx-4">CORTE DE PELO: $12.000 ARS</span>
          <span className="mx-4">·</span>
          <span className="mx-4">VUELTA DE OBLIGADO 931</span>
          <span className="mx-4">·</span>
          <span className="mx-4">1 CLIENTE POR TURNO (SIN FILAS)</span>
          <span className="mx-4">·</span>
          <span className="mx-4">0.0 MM SHAVER DE TITANIO &amp; NAVAJA LIBRE</span>
          <span className="mx-4">·</span>
          <span className="mx-4">DESPACHO INMEDIATO A WHATSAPP</span>
          <span className="mx-4">·</span>
          <span className="mx-4">⚡ RODRIGO CUTSSS // VENADO TUERTO</span>
          <span className="mx-4">·</span>
          <span className="mx-4">CORTE DE PELO: $12.000 ARS</span>
          <span className="mx-4">·</span>
          <span className="mx-4">VUELTA DE OBLIGADO 931</span>
          <span className="mx-4">·</span>
          <span className="mx-4">1 CLIENTE POR TURNO (SIN FILAS)</span>
          <span className="mx-4">·</span>
        </div>
      </div>

      {/* 2. REVOLUTIONARY URBAN POSTER HERO */}
      <section className="max-w-[1380px] mx-auto px-4 sm:px-6 pt-4 sm:pt-8">
        <div className="relative rounded-3xl bg-[#0F1017] border-2 border-[#242738] p-6 sm:p-10 lg:p-12 overflow-hidden shadow-2xl bg-halftone-grid concrete-overlay distressed-surface">
          
          {/* Caution Tape Diagonal Decal */}
          <div className="absolute -top-10 -right-10 w-60 h-10 bg-[#00F0FF] text-black font-mono font-black text-xs uppercase flex items-center justify-center transform rotate-45 shadow-lg pointer-events-none select-none tracking-widest z-10">
            CAUTION // RAZOR SHARP
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            
            {/* Left Content: Huge Typography & Street Culture */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                <span className="px-3 py-1 bg-black border border-[#00F0FF] text-[#00F0FF] font-black uppercase rounded tracking-wider shadow-[0_0_12px_rgba(0,240,255,0.15)]">
                  [ATELIER URBANO 1 A 1]
                </span>
                <span className="text-zinc-500">·</span>
                <span className="text-zinc-300 font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-[#00F0FF] text-[#00F0FF]" />
                  5.0 ★ (Venado Tuerto)
                </span>
                <span className="text-zinc-500">·</span>
                <span className="text-[#00F0FF] font-bold">Vuelta de Obligado 931</span>
              </div>

              {/* Giant Poster Headline with Main Service & Price */}
              <div className="space-y-3">
                <h1 className="font-display text-[clamp(2.5rem,5.8vw,5rem)] font-black uppercase leading-[0.92] tracking-tighter text-white">
                  CORTES DE AUTOR <br />
                  <span className="text-[#00F0FF] bg-black px-2 py-0.5 inline-block my-1 border border-[#00F0FF]/40 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                    FADES A NAVAJA
                  </span> <br />
                  EN VENADO TUERTO.
                </h1>
                
                {/* Headline Badge: Main Service Price */}
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-[#141622] border border-[#00F0FF]/40 font-mono text-xs font-bold text-zinc-200">
                  <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-ping" />
                  <span>SERVICIO PRINCIPAL: <strong className="text-[#00F0FF] font-black">CORTE DE PELO $12.000 ARS</strong></span>
                </div>
              </div>

              <p className="text-base sm:text-lg text-zinc-300 max-w-xl font-normal leading-relaxed">
                Estudio de barbería contemporáneo exclusivo para hombres en Venado Tuerto. Sin salas de espera abarrotadas, sin demoras y con atención dedicada 1 a 1 en Vuelta de Obligado 931.
              </p>

              {/* Interactive Audio Tester & Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => {
                    playMechanicalClick();
                    navigateTo('booking');
                  }}
                  onMouseEnter={playMechanicalHover}
                  className="px-8 py-4 bg-[#00F0FF] text-black font-mono font-black text-xs uppercase tracking-wider rounded-xl hover:bg-[#00D5E5] transition-all flex items-center gap-2.5 cursor-pointer shadow-[0_0_30px_rgba(0,240,255,0.25)] active:scale-95"
                >
                  <Scissors className="w-4 h-4" />
                  <span>Emitir Ticket &amp; Reservar</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>

                {/* Tactile Clipper Buzz Button */}
                <button
                  type="button"
                  onClick={() => {
                    playMechanicalClick();
                    playClipperSound();
                  }}
                  onMouseEnter={playMechanicalHover}
                  className={`px-5 py-4 border rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 active:scale-95 ${
                    buzzerPlaying
                      ? 'border-[#00F0FF] bg-[#00F0FF] text-black scale-95 shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                      : 'border-[#2D3042] bg-[#161722] text-zinc-300 hover:text-white hover:border-[#00F0FF]'
                  }`}
                  title="Presioná para escuchar el motor calibrado de la máquina"
                >
                  <Volume2 className={`w-4 h-4 ${buzzerPlaying ? 'text-black' : 'text-[#00F0FF]'}`} />
                  <span>{buzzerPlaying ? 'Clippers FX 118Hz' : 'Probar Clipper'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playMechanicalClick();
                    setIsStyleFinderOpen(true);
                  }}
                  onMouseEnter={playMechanicalHover}
                  className="px-5 py-4 border border-[#2D3042] bg-[#161722] text-zinc-300 hover:text-white hover:border-[#00F0FF] rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-[#00F0FF]" />
                  <span>Asesor de Fade</span>
                </button>
              </div>

              {/* Quick Spec Strip */}
              <div className="pt-4 border-t border-[#222432] grid grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <span className="text-[#00F0FF] font-black block text-sm">CORTE $12K</span>
                  <span className="text-zinc-400 text-[11px]">Precio transparente</span>
                </div>
                <div>
                  <span className="text-white font-black block text-sm">1 CLIENTE</span>
                  <span className="text-zinc-400 text-[11px]">Privacidad 100%</span>
                </div>
                <div>
                  <span className="text-[#00F0FF] font-black block text-sm">WHATSAPP</span>
                  <span className="text-zinc-400 text-[11px]">Confirmación directa</span>
                </div>
              </div>
            </div>

            {/* Right: Interactive 3-Way Photo Switcher */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#2F3246] bg-black h-[480px] shadow-2xl group">
                <img
                  src={photoAssets[activePhoto].src}
                  alt={photoAssets[activePhoto].title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />

                {/* Stencil Overlay Info */}
                <div className="absolute top-4 left-4 bg-black/85 border border-[#00F0FF]/50 backdrop-blur-md px-3 py-1.5 rounded-lg text-left shadow-lg">
                  <span className="text-[10px] font-mono font-black text-[#00F0FF] block tracking-wider">
                    {photoAssets[activePhoto].tag}
                  </span>
                  <span className="text-[11px] font-mono text-white font-bold">
                    {photoAssets[activePhoto].title}
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex items-end justify-between">
                  <div className="font-mono text-xs">
                    <span className="text-zinc-400 block text-[10px] uppercase">Especificación:</span>
                    <span className="text-zinc-200 font-bold">{photoAssets[activePhoto].spec}</span>
                  </div>
                  <span className="px-2 py-1 bg-[#00F0FF] text-black font-mono font-black text-[10px] rounded uppercase">
                    RODRIGO CUTSSS
                  </span>
                </div>
              </div>

              {/* Photo Selector Buttons */}
              <div className="flex gap-2 mt-3">
                {(['streetwear', 'station', 'hands'] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      playMechanicalClick();
                      setActivePhoto(key);
                    }}
                    onMouseEnter={playMechanicalHover}
                    className={`flex-1 py-2 px-2 rounded-lg font-mono text-[11px] font-bold uppercase transition-all cursor-pointer active:scale-95 ${
                      activePhoto === key
                        ? 'bg-[#00F0FF] text-black shadow-md'
                        : 'bg-[#151722] border border-[#272938] text-zinc-400 hover:text-white'
                    }`}
                  >
                    {key === 'streetwear' ? '01. Fit' : key === 'station' ? '02. Estudio' : '03. Navaja'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FADE STENCIL STUDIO (ANATOMICAL VISAGISMO LAB) */}
      <FadeStencilStudio />

      {/* 4. POPULAR CUTS MATRIX (RAW STREET POSTER CARDS) */}
      <section className="max-w-[1380px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-4 border-b border-[#222432]">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#00F0FF] font-bold block mb-1">
              ARSENAL DE CORTES // MEN ONLY
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Los Cortes Más Pedidos
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              playMechanicalClick();
              navigateTo('services');
            }}
            onMouseEnter={playMechanicalHover}
            className="text-xs font-mono font-bold uppercase tracking-wider text-[#00F0FF] hover:underline cursor-pointer"
          >
            Ver Carta Completa de Servicios &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.slice(0, 4).map((srv) => (
            <div
              key={srv.id}
              className="bg-[#11121A] border-2 border-[#202230] rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-[#00F0FF]/60 transition-all group relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-3">
                  <span className="px-2 py-0.5 bg-[#1C1E2B] text-zinc-300 rounded font-semibold">
                    {srv.category} · {srv.durationMinutes} min
                  </span>
                  <span className="text-xl font-black text-white font-mono">
                    {formatPriceARS(srv.price)}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-display text-2xl font-bold text-white group-hover:text-[#00F0FF] transition-colors">
                    {srv.name}
                  </h3>
                  {srv.popularTag && (
                    <span className="px-2 py-0.5 bg-[#00F0FF]/15 border border-[#00F0FF]/30 text-[#00F0FF] text-[10px] font-mono font-bold rounded">
                      {srv.popularTag}
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  {srv.shortDescription}
                </p>

                <div className="p-3 bg-[#0A0B10] border border-[#1C1E28] rounded-xl mb-6 text-xs font-mono">
                  <span className="text-[10px] text-zinc-500 block uppercase">Herramientas &amp; Producto:</span>
                  <span className="text-zinc-300 font-bold">{srv.productsUsed}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1C1E28] flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => {
                    playMechanicalClick();
                    navigateTo('services');
                  }}
                  onMouseEnter={playMechanicalHover}
                  className="text-xs font-mono text-zinc-400 hover:text-white underline cursor-pointer"
                >
                  Ver Ficha Técnica
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playMechanicalClick();
                    setSelectedServiceIds([srv.id]);
                    navigateTo('booking');
                  }}
                  onMouseEnter={playMechanicalHover}
                  className="px-5 py-2.5 bg-[#00F0FF] text-black font-mono text-xs font-black uppercase tracking-wider rounded-xl hover:bg-[#00D5E5] transition-all cursor-pointer shadow-md active:scale-95"
                >
                  Agendar este Corte
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. STREETWEAR DROPS & GROOMING */}
      <StreetwearDrops />

      {/* 6. INSTANT THERMAL RECEIPT BOOKING ENGINE EMBEDDED */}
      <section className="max-w-[1380px] mx-auto px-4 sm:px-6">
        <div className="mb-10 pb-4 border-b border-[#222432]">
          <div className="flex items-center gap-2 mb-1">
            <Barcode className="w-5 h-5 text-[#00F0FF]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#00F0FF] font-bold">
              MOTOR DE DESPACHO INMEDIATO // CERO LLAMADAS
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            Emití tu Ticket de Turno en Vivo
          </h2>
          <p className="text-zinc-400 text-sm mt-1 max-w-xl">
            Elegí tus servicios, fecha y hora disponible. El sistema calcula los slots continuos y genera tu ticket con confirmación automática a WhatsApp.
          </p>
        </div>

        <ThermalReceiptBooking />
      </section>

      {/* 7. REAL GOOGLE REVIEWS STRIP */}
      <section className="max-w-[1380px] mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-10 rounded-3xl border border-[#232532] bg-[#101118] concrete-overlay distressed-surface">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#1E202B]">
            <div>
              <span className="text-xs font-mono uppercase text-[#00F0FF] font-bold tracking-wider">
                OPINIONES REALES EN VENADO TUERTO
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">
                La Experiencia en Rodrigo Cutsss
              </h3>
            </div>
            <div className="flex items-center gap-4 font-mono">
              <div className="text-right">
                <span className="text-2xl font-black text-white block">5.0 ★</span>
                <span className="text-[10px] text-zinc-500">100% RECOMENDADO</span>
              </div>
              <a
                href={config.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={playMechanicalHover}
                className="px-4 py-2 bg-[#181A26] border border-[#2C2E40] text-zinc-200 hover:text-white hover:border-[#00F0FF] rounded-xl text-xs font-bold uppercase transition-colors"
              >
                Abrir Maps
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-6 rounded-2xl bg-[#141520] border border-[#202230] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{rev.authorName}</h4>
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
      </section>
    </div>
  );
};
