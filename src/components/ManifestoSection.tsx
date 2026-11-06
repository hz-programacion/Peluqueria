import React, { useState } from 'react';
import { STUDIO_INFO } from '../data/studioData';

export const ManifestoSection: React.FC = () => {
  const [imgError, setImgError] = useState(false);

  return (
    <section
      id="espacio"
      className="py-20 md:py-28 border-b border-stone-300/70 dark:border-white/[0.08]"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-14">
          <div className="lg:col-span-5">
            <p className="font-mono-tech text-xs uppercase tracking-widest text-[#9A7B4F] dark:text-[#C5A880] mb-3">
              01. Manifiesto &amp; El Espacio
            </p>
            <h2 className="font-editorial text-3xl md:text-5xl font-normal leading-[1.12] text-[#141415] dark:text-[#F4F4F6]">
              Por qué trabajar a solas transforma el resultado de tu corte.
            </h2>
          </div>
          <div className="lg:col-span-7 flex items-end">
            <p className="text-base md:text-lg leading-relaxed text-stone-600 dark:text-[#8E8E93] max-w-[65ch]">
              Las peluquerías tradicionales operan bajo volumen: música estridente, tres clientes en simultáneo
              y asistentes rotando en el lavacabezas. Este estudio nació como la antítesis exacta: un espacio
              arquitectónico privado donde tu diagnóstico, lavado, corte y acabado reciben atención indivisa.
            </p>
          </div>
        </div>

        {/* Wide Studio Interior Visual + 3 Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-7">
            <div className="relative h-full min-h-[340px] rounded-sm overflow-hidden border border-stone-300 dark:border-white/[0.08] bg-[#161618]">
              {!imgError ? (
                <img
                  src={STUDIO_INFO.spaceImage}
                  alt="Interior del estudio privado Valentín Moretti con sillón único, paredes de basalto y barra de café de especialidad"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-8 bg-[#161618] text-[#F4F4F6]">
                  <span className="font-editorial text-xl italic text-[#C5A880]">
                    Atelier Privado · Sillón Único · Palermo Soho
                  </span>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5">
                <p className="text-xs font-mono-tech text-[#C5A880]">
                  GORRITI 4820 · PISO 2 ESTUDIO B
                </p>
                <p className="text-sm text-[#F4F4F6] mt-0.5">
                  Luz natural orientada al norte, acústica tratada, vinilos seleccionados y café de especialidad.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            <div className="p-6 rounded-sm border border-stone-300 dark:border-white/[0.08] bg-white/70 dark:bg-[#161618]">
              <p className="font-mono-tech text-xs text-[#9A7B4F] dark:text-[#C5A880] mb-2">
                PILAR I · CONTINUIDAD TÉCNICA
              </p>
              <h3 className="text-lg font-semibold text-[#141415] dark:text-[#F4F4F6] mb-2">
                Cero rotación de personal
              </h3>
              <p className="text-sm leading-relaxed text-stone-600 dark:text-[#8E8E93]">
                El servicio empieza y termina con el autor. Quien analiza tus remolinos en seco es quien realiza el
                lavado craneal, ejecuta la estructura a tijera y texturiza el secado final.
              </p>
            </div>

            <div className="p-6 rounded-sm border border-stone-300 dark:border-white/[0.08] bg-white/70 dark:bg-[#161618]">
              <p className="font-mono-tech text-xs text-[#9A7B4F] dark:text-[#C5A880] mb-2">
                PILAR II · ATMÓSFERA CALMA
              </p>
              <h3 className="text-lg font-semibold text-[#141415] dark:text-[#F4F4F6] mb-2">
                Sin teléfonos ni interrupciones
              </h3>
              <p className="text-sm leading-relaxed text-stone-600 dark:text-[#8E8E93]">
                Toda la gestión de citas, recordatorios y reprogramaciones está automatizada en esta plataforma.
                Mientras estás en el sillón, el teléfono no suena y nadie toca el timbre sin turno.
              </p>
            </div>

            <div className="p-6 rounded-sm border border-stone-300 dark:border-white/[0.08] bg-white/70 dark:bg-[#161618]">
              <p className="font-mono-tech text-xs text-[#9A7B4F] dark:text-[#C5A880] mb-2">
                PILAR III · HOSPITALIDAD DE ESTUDIO
              </p>
              <h3 className="text-lg font-semibold text-[#141415] dark:text-[#F4F4F6] mb-2">
                Café de especialidad &amp; curaduría sonora
              </h3>
              <p className="text-sm leading-relaxed text-stone-600 dark:text-[#8E8E93]">
                Cada sesión incluye espresso recién molido, agua mineral en vidrio o bourbon de cortesía en turnos
                vespertinos, acompañado de una selección de jazz modal y ambient en vinilo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
