import React, { useState } from 'react';
import { X, ArrowUpRight, Sparkles } from 'lucide-react';
import { LookbookItem } from '../data/studioData';

interface LookbookSectionProps {
  items: LookbookItem[];
  onBookStyle: (servicePerformed: string) => void;
}

const CATEGORIES = [
  'Todos',
  'Corte Clásico',
  'Fades & Texturas',
  'Largo & Medios',
  'Color',
] as const;

export const LookbookSection: React.FC<LookbookSectionProps> = ({ items, onBookStyle }) => {
  const [activeFilter, setActiveFilter] = useState<string>('Todos');
  const [inspectedItem, setInspectedItem] = useState<LookbookItem | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const filteredItems =
    activeFilter === 'Todos'
      ? items
      : items.filter((item) => item.category === activeFilter);

  return (
    <section
      id="lookbook"
      className="py-20 md:py-28 border-b border-stone-300/70 dark:border-white/[0.08]"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header & Interactive Segmented Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div>
            <p className="font-mono-tech text-xs uppercase tracking-widest text-[#9A7B4F] dark:text-[#C5A880] mb-3">
              03. Lookbook &amp; Archivo Técnico
            </p>
            <h2 className="font-editorial text-3xl md:text-5xl font-normal leading-[1.12] text-[#141415] dark:text-[#F4F4F6]">
              Trabajos seleccionados y fichas de ejecución.
            </h2>
          </div>

          {/* Interactive Filter Controls (Functional Buttons) */}
          <div
            role="tablist"
            aria-label="Filtrar trabajos por técnica o textura"
            className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-sm border border-stone-300 dark:border-white/[0.08] bg-stone-200/60 dark:bg-[#161618]"
          >
            {CATEGORIES.map((category) => {
              const active = activeFilter === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveFilter(category)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#141415] text-[#F4F4F6] dark:bg-[#C5A880] dark:text-[#0C0C0D]'
                      : 'text-stone-600 dark:text-[#8E8E93] hover:text-[#141415] dark:hover:text-[#F4F4F6]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Asymmetric Masonry / Bento Grid (2 cols on mobile, 3 on desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, idx) => {
            const isWide = idx === 0 && activeFilter === 'Todos';
            const hasFailed = failedImages[item.id];

            return (
              <article
                key={item.id}
                className={`group relative rounded-sm overflow-hidden border border-stone-300 dark:border-white/[0.08] bg-[#161618] flex flex-col ${
                  isWide ? 'sm:col-span-2 lg:col-span-2' : 'col-span-1'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setInspectedItem(item)}
                  aria-label={`Inspeccionar ficha técnica de ${item.title}`}
                  className="relative w-full h-[380px] md:h-[430px] overflow-hidden text-left cursor-pointer focus:outline-none"
                >
                  {!hasFailed ? (
                    <img
                      src={item.imageUrl}
                      alt={`${item.title} — ${item.servicePerformed}`}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setFailedImages((prev) => ({ ...prev, [item.id]: true }))
                      }
                      className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#161618] text-[#F4F4F6]">
                      <Sparkles className="w-6 h-6 text-[#C5A880] mb-2" />
                      <span className="font-editorial text-xl">{item.title}</span>
                    </div>
                  )}

                  {/* Measured Gradient Scrim + Technical Data Sheet Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent p-6 flex flex-col justify-end">
                    <div className="flex items-center gap-2 text-xs font-mono-tech text-[#C5A880] mb-1">
                      <span>{item.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.executionTime}</span>
                    </div>

                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <h3 className="font-editorial text-2xl text-[#F4F4F6] leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-xs text-[#F4F4F6]/80 mt-1">
                          {item.servicePerformed} · {item.productApplied}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-mono-tech uppercase tracking-wider text-[#C5A880] whitespace-nowrap shrink-0">
                        <span>Ficha</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </button>
              </article>
            );
          })}
        </div>
      </div>

      {/* High-Resolution Technical Inspection Modal */}
      {inspectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="lookbook-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-xs"
        >
          <div className="w-full max-w-4xl bg-[#F7F5F0] dark:bg-[#161618] text-[#141415] dark:text-[#F4F4F6] border border-stone-300 dark:border-white/[0.12] rounded-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 max-h-[90vh] overflow-y-auto">
            {/* Image Column */}
            <div className="md:col-span-6 bg-[#0C0C0D] min-h-[320px]">
              <img
                src={inspectedItem.imageUrl}
                alt={inspectedItem.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Technical Sheet Column */}
            <div className="md:col-span-6 p-6 md:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-4 pb-4 mb-5 border-b border-stone-300 dark:border-white/[0.08]">
                  <span className="font-mono-tech text-xs text-[#9A7B4F] dark:text-[#C5A880]">
                    INSPECCIÓN TÉCNICA · {inspectedItem.category.toUpperCase()}
                  </span>
                  <button
                    type="button"
                    onClick={() => setInspectedItem(null)}
                    aria-label="Cerrar inspección de lookbook"
                    className="p-1.5 rounded-sm border border-stone-300 dark:border-white/[0.15] hover:border-[#C5A880] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <h3
                  id="lookbook-modal-title"
                  className="font-editorial text-3xl font-normal mb-4"
                >
                  {inspectedItem.title}
                </h3>

                <dl className="space-y-4 text-sm">
                  <div className="pb-3 border-b border-stone-300/60 dark:border-white/[0.08]">
                    <dt className="font-mono-tech text-xs uppercase text-stone-500 dark:text-[#8E8E93]">
                      Servicio Realizado
                    </dt>
                    <dd className="font-medium mt-0.5">{inspectedItem.servicePerformed}</dd>
                  </div>

                  <div className="pb-3 border-b border-stone-300/60 dark:border-white/[0.08]">
                    <dt className="font-mono-tech text-xs uppercase text-stone-500 dark:text-[#8E8E93]">
                      Tiempo de Ejecución en Estudio
                    </dt>
                    <dd className="font-mono-tech mt-0.5">{inspectedItem.executionTime}</dd>
                  </div>

                  <div className="pb-3 border-b border-stone-300/60 dark:border-white/[0.08]">
                    <dt className="font-mono-tech text-xs uppercase text-stone-500 dark:text-[#8E8E93]">
                      Producto de Acabado Aplicado
                    </dt>
                    <dd className="mt-0.5">{inspectedItem.productApplied}</dd>
                  </div>

                  <div className="pb-3 border-b border-stone-300/60 dark:border-white/[0.08]">
                    <dt className="font-mono-tech text-xs uppercase text-stone-500 dark:text-[#8E8E93]">
                      Instrumental &amp; Técnica
                    </dt>
                    <dd className="font-mono-tech text-xs mt-0.5">{inspectedItem.toolsUsed}</dd>
                  </div>

                  <div>
                    <dt className="font-mono-tech text-xs uppercase text-stone-500 dark:text-[#8E8E93]">
                      Nota del Autor
                    </dt>
                    <dd className="text-stone-600 dark:text-[#8E8E93] leading-relaxed mt-1">
                      {inspectedItem.authorNote}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="pt-6 mt-6 border-t border-stone-300 dark:border-white/[0.08] flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setInspectedItem(null)}
                  className="px-4 py-3 text-xs font-medium border border-stone-300 dark:border-white/[0.15] rounded-sm whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const serviceRef = inspectedItem.servicePerformed;
                    setInspectedItem(null);
                    onBookStyle(serviceRef);
                  }}
                  className="flex-1 px-5 py-3 text-xs font-semibold uppercase tracking-wider bg-[#141415] text-[#F4F4F6] dark:bg-[#C5A880] dark:text-[#0C0C0D] rounded-sm whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Agendar este Servicio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
