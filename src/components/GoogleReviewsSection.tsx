import React, { useState } from 'react';
import { Star, ExternalLink, MessageSquare, Send } from 'lucide-react';
import { GOOGLE_REVIEWS, STUDIO_INFO } from '../data/studioData';
import { buildAutomatedWhatsAppMessages } from '../utils/bookingEngine';

export const GoogleReviewsSection: React.FC = () => {
  const [showLoopSimulator, setShowLoopSimulator] = useState(false);
  const [previewClientName, setPreviewClientName] = useState('Mateo');

  const simulatedMessages = buildAutomatedWhatsAppMessages({
    clientFirstName: previewClientName || 'Cliente',
    date: 'Hoy',
    time: '16:00',
    endTime: '16:55',
    serviceNames: ['Corte Signature & Lavado'],
    reviewShortlink: STUDIO_INFO.googleReviewShortlink,
  });

  return (
    <section
      id="resenas"
      className="py-20 md:py-28 border-b border-stone-300/70 dark:border-white/[0.08]"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section Kicker & Title */}
        <div className="mb-12">
          <p className="font-mono-tech text-xs uppercase tracking-widest text-[#9A7B4F] dark:text-[#C5A880] mb-3">
            04. Google Social Proof &amp; Reputación Verificada
          </p>
          <h2 className="font-editorial text-3xl md:text-5xl font-normal leading-[1.12] text-[#141415] dark:text-[#F4F4F6]">
            Lo que dicen quienes ya experimentaron el formato 1 a 1.
          </h2>
        </div>

        {/* Metric Header Card (Puntaje Promedio + Desglose de Confianza + Acciones) */}
        <div className="p-6 md:p-8 rounded-sm border border-stone-300 dark:border-white/[0.08] bg-white/80 dark:bg-[#161618] mb-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Score Block */}
          <div className="lg:col-span-4 flex items-center gap-5 border-b lg:border-b-0 lg:border-r border-stone-300/70 dark:border-white/[0.08] pb-6 lg:pb-0 lg:pr-6">
            <div className="font-mono-tech text-5xl md:text-6xl font-medium text-[#141415] dark:text-[#F4F4F6]">
              5.0
            </div>
            <div>
              <div className="flex items-center gap-1 text-[#9A7B4F] dark:text-[#C5A880] mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs font-mono-tech text-stone-600 dark:text-[#8E8E93]">
                128 reseñas en Google Maps
              </p>
              <p className="text-xs text-stone-500 dark:text-[#8E8E93] mt-0.5">
                Caché local sincronizado cada 24 hs (0 ms latencia)
              </p>
            </div>
          </div>

          {/* Trust Metrics Breakdown */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-4">
            <div>
              <p className="font-mono-tech text-xl font-medium text-[#141415] dark:text-[#F4F4F6]">
                100%
              </p>
              <p className="text-xs text-stone-600 dark:text-[#8E8E93] mt-0.5">
                Puntualidad estricta de inicio
              </p>
            </div>
            <div>
              <p className="font-mono-tech text-xl font-medium text-[#141415] dark:text-[#F4F4F6]">
                1 a 1
              </p>
              <p className="text-xs text-stone-600 dark:text-[#8E8E93] mt-0.5">
                Atención exclusiva sin esperas
              </p>
            </div>
            <div>
              <p className="font-mono-tech text-xl font-medium text-[#141415] dark:text-[#F4F4F6]">
                100%
              </p>
              <p className="text-xs text-stone-600 dark:text-[#8E8E93] mt-0.5">
                Higiene clínica del estudio
              </p>
            </div>
          </div>

          {/* Outline Actions */}
          <div className="lg:col-span-3 flex flex-col gap-2.5">
            <a
              href={STUDIO_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium border border-stone-300 dark:border-white/[0.16] text-[#141415] dark:text-[#F4F4F6] hover:border-[#C5A880] transition-colors rounded-sm whitespace-nowrap shrink-0"
            >
              <span>Ver todas en Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={() => setShowLoopSimulator((prev) => !prev)}
              aria-expanded={showLoopSimulator}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-mono-tech border border-stone-300 dark:border-white/[0.16] text-[#9A7B4F] dark:text-[#C5A880] hover:border-[#C5A880] transition-colors rounded-sm whitespace-nowrap shrink-0 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{showLoopSimulator ? 'Ocultar Bucle Post-Turno' : 'Inspector Bucle Reseñas 2hs'}</span>
            </button>
          </div>
        </div>

        {/* Optional Automated Review Collection Loop Inspector */}
        {showLoopSimulator && (
          <div className="mb-8 p-6 rounded-sm border border-[#9A7B4F]/50 dark:border-[#C5A880]/40 bg-white dark:bg-[#161618]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-stone-300/60 dark:border-white/[0.08]">
              <div>
                <p className="font-mono-tech text-xs uppercase text-[#9A7B4F] dark:text-[#C5A880]">
                  AUTOMATIZACIÓN POST-CITA · GOOGLE LOCAL PACK ENGINE
                </p>
                <h3 className="font-editorial text-2xl text-[#141415] dark:text-[#F4F4F6]">
                  Disparo programado por WhatsApp 2 horas después del cierre de turno
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="sim-client-name" className="text-xs font-mono-tech text-stone-600 dark:text-[#8E8E93]">
                  Nombre del cliente:
                </label>
                <input
                  id="sim-client-name"
                  type="text"
                  value={previewClientName}
                  onChange={(e) => setPreviewClientName(e.target.value)}
                  className="px-3 py-1.5 text-xs font-mono-tech rounded-sm border border-stone-300 dark:border-white/[0.15] bg-transparent text-[#141415] dark:text-[#F4F4F6] w-36"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-sm border border-stone-200 dark:border-white/[0.08] bg-stone-100/70 dark:bg-[#0C0C0D]">
                <p className="font-mono-tech text-[#9A7B4F] dark:text-[#C5A880] mb-1">
                  1. CIERRE DE CITA EN ESTUDIO
                </p>
                <p className="text-stone-600 dark:text-[#8E8E93] leading-relaxed">
                  Al cumplirse la hora de finalización del turno, el webhook registra el estado completado sin que Valentín toque su teléfono.
                </p>
              </div>
              <div className="p-4 rounded-sm border border-stone-200 dark:border-white/[0.08] bg-stone-100/70 dark:bg-[#0C0C0D]">
                <p className="font-mono-tech text-[#9A7B4F] dark:text-[#C5A880] mb-1">
                  2. TIMER +120 MINUTOS
                </p>
                <p className="text-stone-600 dark:text-[#8E8E93] leading-relaxed">
                  Dos horas después, cuando el cliente ya llegó a su casa y vio el resultado frente a su espejo, se dispara el mensaje cálido.
                </p>
              </div>
              <div className="p-4 rounded-sm border border-stone-200 dark:border-white/[0.08] bg-stone-100/70 dark:bg-[#0C0C0D]">
                <p className="font-mono-tech text-[#9A7B4F] dark:text-[#C5A880] mb-1 flex items-center gap-1.5">
                  <Send className="w-3 h-3" /> 3. MENSAJE CON SHORTLINK DIRECTO
                </p>
                <p className="font-mono-tech text-[#141415] dark:text-[#F4F4F6] leading-relaxed">
                  &ldquo;{simulatedMessages.reviewRequest2HoursAfter}&rdquo;
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bento Grid of Verified Google Maps Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {GOOGLE_REVIEWS.map((review) => (
            <article
              key={review.id}
              className="p-6 md:p-7 rounded-sm border border-stone-300 dark:border-white/[0.08] bg-white/70 dark:bg-[#161618] flex flex-col justify-between"
            >
              <div>
                {/* Top Author & Stars Row */}
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      aria-hidden="true"
                      className="w-10 h-10 rounded-full border border-stone-300 dark:border-white/[0.15] bg-stone-200 dark:bg-[#0C0C0D] flex items-center justify-center font-mono-tech text-xs font-semibold text-[#141415] dark:text-[#C5A880]"
                    >
                      {review.authorInitials}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#141415] dark:text-[#F4F4F6]">
                        {review.authorName}
                      </h3>
                      {/* Unboxed Metadata with typographic separators */}
                      <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-[#8E8E93]">
                        <span>Reseña en Google Maps</span>
                        <span aria-hidden="true">·</span>
                        <span>{review.relativeDate}</span>
                      </div>
                    </div>
                  </div>

                  <div
                    aria-label={`${review.rating} de 5 estrellas`}
                    className="flex items-center gap-0.5 text-[#9A7B4F] dark:text-[#C5A880]"
                  >
                    {Array.from({ length: review.rating }).map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>

                {/* Review Body with subtle bold keywords */}
                <p className="text-sm leading-relaxed text-stone-700 dark:text-[#F4F4F6]/90 mb-4">
                  &ldquo;
                  {review.textParts.map((part, idx) =>
                    part.highlight ? (
                      <strong
                        key={idx}
                        className="font-semibold text-[#141415] dark:text-[#C5A880]"
                      >
                        {part.text}
                      </strong>
                    ) : (
                      <span key={idx}>{part.text}</span>
                    )
                  )}
                  &rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-stone-200/70 dark:border-white/[0.06] text-xs font-mono-tech text-stone-500 dark:text-[#8E8E93]">
                Servicio verificado: {review.serviceTag}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
