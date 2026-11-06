import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Sun, Moon, ArrowDownRight, Star, Clock, ShieldCheck } from 'lucide-react';
import { STUDIO_INFO } from '../data/studioData';

interface HeroSectionProps {
  availabilityLabel: string;
  isDark: boolean;
  onToggleTheme: () => void;
  onJumpToBooking: () => void;
  onOpenAgendaModal: () => void;
  bookedCountToday: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  availabilityLabel,
  isDark,
  onToggleTheme,
  onJumpToBooking,
  onOpenAgendaModal,
  bookedCountToday,
}) => {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [imgError, setImgError] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const toggleAmbientAudio = () => {
    if (audioPlaying) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setAudioPlaying(false);
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.035;
      masterGain.connect(ctx.destination);

      // Warm analog studio chord pad (A minor 9th warm frequencies)
      const freqs = [110, 164.81, 220, 261.63, 329.63];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.value = f;
        filter.type = 'lowpass';
        filter.frequency.value = 420;
        osc.connect(filter);
        filter.connect(masterGain);
        osc.start();
      });

      audioCtxRef.current = ctx;
      gainNodeRef.current = masterGain;
      setAudioPlaying(true);
    } catch {
      setAudioPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <section id="top" className="pt-28 pb-16 md:pt-32 md:pb-24 border-b border-stone-300/70 dark:border-white/[0.08] bg-editorial-grain">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Studio Workspace Utility Bar (Live Status, Ambient Audio, Theme Selector, Agenda Inspector) */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-stone-300/60 dark:border-white/[0.08] text-xs text-stone-600 dark:text-[#8E8E93]">
          <div className="flex flex-wrap items-center gap-2 font-mono-tech">
            <span className="text-[#9A7B4F] dark:text-[#C5A880] font-medium">ESTADO DEL ESTUDIO</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#141415] dark:text-[#F4F4F6]">{availabilityLabel}</span>
            <span aria-hidden="true">·</span>
            <span>Palermo Soho, CABA</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleAmbientAudio}
              aria-pressed={audioPlaying}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border border-stone-300 dark:border-white/[0.12] bg-white/60 dark:bg-[#161618] text-[#141415] dark:text-[#F4F4F6] hover:border-[#C5A880] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {audioPlaying ? <Volume2 className="w-3.5 h-3.5 text-[#C5A880]" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{audioPlaying ? 'Audio Ambiental: Activo' : 'Audio Ambiental: Silencio'}</span>
            </button>

            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={isDark ? 'Cambiar a modo claro editorial' : 'Cambiar a modo oscuro basalto'}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border border-stone-300 dark:border-white/[0.12] bg-white/60 dark:bg-[#161618] text-[#141415] dark:text-[#F4F4F6] hover:border-[#C5A880] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-[#C5A880]" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{isDark ? ' Luz Papel' : ' Modo Basalto'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenAgendaModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-stone-300 dark:border-white/[0.12] bg-white/60 dark:bg-[#161618] text-[#141415] dark:text-[#F4F4F6] hover:border-[#C5A880] transition-colors font-mono-tech whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Agenda en Vivo ({bookedCountToday})</span>
            </button>
          </div>
        </div>

        {/* Asymmetric Editorial Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Column: Editorial Typography & Value Proposition */}
          <div className="lg:col-span-7 flex flex-col justify-between py-2">
            <div>
              {/* Micro-badge Social Proof Anchor */}
              <a
                href="#resenas"
                className="inline-flex flex-wrap items-center gap-2 text-xs md:text-sm text-stone-600 dark:text-[#8E8E93] hover:text-[#141415] dark:hover:text-[#F4F4F6] transition-colors mb-6 group"
              >
                <span className="inline-flex items-center gap-1 text-[#9A7B4F] dark:text-[#C5A880] font-mono-tech font-medium">
                  <Star className="w-3.5 h-3.5 fill-current" /> 5.0
                </span>
                <span>(128 reseñas en Google)</span>
                <span aria-hidden="true">·</span>
                <span className="italic font-editorial text-base text-[#141415] dark:text-[#F4F4F6] group-hover:underline">
                  &ldquo;El mejor servicio 1 a 1 de la ciudad&rdquo;
                </span>
              </a>

              {/* Main Editorial Display Headline */}
              <h1 className="font-editorial text-[clamp(2.4rem,4.5vw,4.1rem)] leading-[1.06] font-normal tracking-tight text-[#141415] dark:text-[#F4F4F6] mb-6">
                Cortes de precisión y colorimetría a medida por{' '}
                <span className="italic font-normal text-[#9A7B4F] dark:text-[#C5A880]">
                  {STUDIO_INFO.authorName}
                </span>
                .
              </h1>

              {/* Value Statement */}
              <p className="text-base md:text-lg leading-relaxed text-stone-600 dark:text-[#8E8E93] max-w-[62ch] mb-8">
                Atención exclusiva de un solo cliente por franja horaria en un estudio privado a puertas cerradas.
                Sin esperas, sin rotación de asistentes y con reserva automatizada en tiempo real para que la sesión
                transcurra sin una sola interrupción telefónica.
              </p>
            </div>

            <div className="space-y-8">
              {/* Primary Action & Secondary Link */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={onJumpToBooking}
                  className="inline-flex items-center gap-3 px-7 py-4 text-sm font-semibold tracking-wider uppercase bg-[#141415] text-[#F4F4F6] dark:bg-[#C5A880] dark:text-[#0C0C0D] hover:opacity-90 transition-opacity rounded-sm whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Ver Disponibilidad</span>
                  <ArrowDownRight className="w-4 h-4" />
                </button>

                <a
                  href="#servicios"
                  className="px-6 py-4 text-sm font-medium border border-stone-300 dark:border-white/[0.14] text-[#141415] dark:text-[#F4F4F6] hover:border-[#C5A880] transition-colors rounded-sm whitespace-nowrap shrink-0"
                >
                  Carta de Servicios y Tiempos
                </a>
              </div>

              {/* Unboxed Editorial Guarantees */}
              <div className="pt-6 border-t border-stone-300/60 dark:border-white/[0.08] flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-stone-600 dark:text-[#8E8E93]">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#9A7B4F] dark:text-[#C5A880]" />
                  Atención 1 a 1 sin acompañantes
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#9A7B4F] dark:text-[#C5A880]" />
                  10 min de sanitización entre clientes
                </span>
                <span aria-hidden="true">·</span>
                <span>Confirmación instantánea vía WhatsApp</span>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Portrait / Loop Frame */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="relative flex-1 min-h-[420px] lg:h-full rounded-sm overflow-hidden border border-stone-300 dark:border-white/[0.08] bg-[#161618]">
              {!imgError ? (
                <img
                  src={STUDIO_INFO.heroImage}
                  alt="Valentín Moretti realizando corte de precisión a tijera sobre cabello húmedo en estudio privado"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover object-center contrast-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#161618] to-[#0C0C0D] text-[#F4F4F6]">
                  <span className="font-editorial text-2xl italic text-[#C5A880] mb-2">
                    Valentín Moretti Atelier
                  </span>
                  <span className="text-xs font-mono-tech text-[#8E8E93]">
                    Estudio Privado de Peluquería · Palermo Soho
                  </span>
                </div>
              )}

              {/* Measured Scrim & Technical Caption */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent p-5 pt-12 flex items-end justify-between gap-4">
                <div className="text-xs text-[#F4F4F6]">
                  <p className="font-mono-tech uppercase tracking-wider text-[#C5A880]">
                    SESIÓN PRIVADA · SILLÓN ÚNICO
                  </p>
                  <p className="text-[#F4F4F6] mt-0.5">
                    Arquitectura de corte a tijera sobre cabello húmedo
                  </p>
                </div>
                <span className="font-mono-tech text-[11px] text-[#F4F4F6]/85 shrink-0">
                  34°35&apos;20&quot;S 58°25&apos;50&quot;W
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Architectural Metrics Row Below Hero Split */}
        <div className="mt-12 pt-8 border-t border-stone-300/70 dark:border-white/[0.08] grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="font-mono-tech text-2xl md:text-3xl font-medium text-[#141415] dark:text-[#F4F4F6]">
              1 : 1
            </p>
            <p className="text-xs text-stone-600 dark:text-[#8E8E93] mt-1">
              Un único cliente en todo el estudio durante tu bloque horario
            </p>
          </div>
          <div>
            <p className="font-mono-tech text-2xl md:text-3xl font-medium text-[#141415] dark:text-[#F4F4F6]">
              0 min
            </p>
            <p className="text-xs text-stone-600 dark:text-[#8E8E93] mt-1">
              Tiempo de espera en recepción; tu turno inicia a la hora exacta
            </p>
          </div>
          <div>
            <p className="font-mono-tech text-2xl md:text-3xl font-medium text-[#141415] dark:text-[#F4F4F6]">
              100%
            </p>
            <p className="text-xs text-stone-600 dark:text-[#8E8E93] mt-1">
              Ejecutado de principio a fin por el autor sin delegar en asistentes
            </p>
          </div>
          <div>
            <p className="font-mono-tech text-2xl md:text-3xl font-medium text-[#9A7B4F] dark:text-[#C5A880]">
              5.0 ★
            </p>
            <p className="text-xs text-stone-600 dark:text-[#8E8E93] mt-1">
              Calificación perfecta en Google Maps sobre 128 clientes verificados
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
