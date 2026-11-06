import React from 'react';
import { Check, Plus, X, ArrowRight } from 'lucide-react';
import { StudioService } from '../data/studioData';
import { formatPriceARS } from '../utils/bookingEngine';

interface ServicesSectionProps {
  services: StudioService[];
  selectedServiceIds: string[];
  onToggleService: (serviceId: string) => void;
  activeDrawerService: StudioService | null;
  onOpenDrawer: (service: StudioService) => void;
  onCloseDrawer: () => void;
  onSelectAndBookFromDrawer: (serviceId: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  selectedServiceIds,
  onToggleService,
  activeDrawerService,
  onOpenDrawer,
  onCloseDrawer,
  onSelectAndBookFromDrawer,
}) => {
  return (
    <section
      id="servicios"
      className="py-20 md:py-28 border-b border-stone-300/70 dark:border-white/[0.08]"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <p className="font-mono-tech text-xs uppercase tracking-widest text-[#9A7B4F] dark:text-[#C5A880] mb-3">
              02. Carta de Servicios &amp; Tiempos Blindados
            </p>
            <h2 className="font-editorial text-3xl md:text-5xl font-normal leading-[1.12] text-[#141415] dark:text-[#F4F4F6]">
              Duraciones exactas para una atención sin apuros.
            </h2>
          </div>
          <p className="text-sm text-stone-600 dark:text-[#8E8E93] max-w-[44ch]">
            Podés combinar múltiples servicios en una misma sesión. El motor de agenda sumará automáticamente
            los minutos exactos más 10 minutos de sanitización privada.
          </p>
        </div>

        {/* Structured Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => {
            const isSelected = selectedServiceIds.includes(service.id);

            return (
              <article
                key={service.id}
                className={`p-7 rounded-sm border transition-colors flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#9A7B4F] dark:border-[#C5A880] bg-white dark:bg-[#1B1B1E]'
                    : 'border-stone-300 dark:border-white/[0.08] bg-white/70 dark:bg-[#161618]'
                }`}
              >
                <div>
                  {/* Clean Unboxed Metadata Row */}
                  <div className="flex items-center justify-between gap-4 text-xs text-stone-500 dark:text-[#8E8E93] mb-3 font-mono-tech">
                    <div className="flex items-center gap-2">
                      <span className="text-[#9A7B4F] dark:text-[#C5A880] font-semibold">
                        {service.index}.
                      </span>
                      <span>{service.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{service.durationMinutes} min exactos</span>
                    </div>
                    <span className="text-base font-medium text-[#141415] dark:text-[#F4F4F6]">
                      {formatPriceARS(service.price)}
                    </span>
                  </div>

                  {/* Service Title */}
                  <h3 className="font-editorial text-2xl md:text-3xl font-normal text-[#141415] dark:text-[#F4F4F6] mb-3">
                    {service.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm leading-relaxed text-stone-600 dark:text-[#8E8E93] mb-6">
                    {service.shortDescription}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-5 border-t border-stone-200 dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onOpenDrawer(service)}
                    className="text-xs font-medium text-stone-600 dark:text-[#8E8E93] hover:text-[#141415] dark:hover:text-[#F4F4F6] underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Ver detalles y preparación
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleService(service.id)}
                    aria-pressed={isSelected}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-[#9A7B4F] dark:bg-[#C5A880] text-[#0C0C0D]'
                        : 'border border-stone-300 dark:border-white/[0.15] text-[#141415] dark:text-[#F4F4F6] hover:border-[#C5A880]'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Seleccionado</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Sumar al Turno</span>
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Service Detail & Pre-Appointment Preparation Drawer */}
      {activeDrawerService && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="service-drawer-title"
          className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg bg-[#F7F5F0] dark:bg-[#161618] text-[#141415] dark:text-[#F4F4F6] h-full overflow-y-auto p-6 md:p-8 border-l border-stone-300 dark:border-white/[0.1] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-5 mb-6 border-b border-stone-300 dark:border-white/[0.08]">
                <div className="font-mono-tech text-xs text-[#9A7B4F] dark:text-[#C5A880]">
                  <span>FICHA TÉCNICA DE SERVICIO</span>
                  <span aria-hidden="true"> · </span>
                  <span>{activeDrawerService.durationMinutes} MIN</span>
                </div>
                <button
                  type="button"
                  onClick={onCloseDrawer}
                  aria-label="Cerrar detalle de servicio"
                  className="p-2 rounded-sm border border-stone-300 dark:border-white/[0.12] hover:border-[#C5A880] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h3
                id="service-drawer-title"
                className="font-editorial text-3xl font-normal mb-2"
              >
                {activeDrawerService.index}. {activeDrawerService.name}
              </h3>

              <p className="font-mono-tech text-lg text-[#9A7B4F] dark:text-[#C5A880] mb-6">
                {formatPriceARS(activeDrawerService.price)} · Duración bloqueada: {activeDrawerService.durationMinutes} min
              </p>

              <div className="space-y-6 text-sm">
                <div>
                  <h4 className="font-mono-tech text-xs uppercase tracking-wider text-stone-500 dark:text-[#8E8E93] mb-2">
                    Preparación Previa Recomendada
                  </h4>
                  <ul className="space-y-2 text-stone-700 dark:text-[#F4F4F6]/90">
                    {activeDrawerService.preparation.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-stone-300/60 dark:border-white/[0.08]">
                  <h4 className="font-mono-tech text-xs uppercase tracking-wider text-stone-500 dark:text-[#8E8E93] mb-2">
                    Estructura de la Sesión Minuto a Minuto
                  </h4>
                  <ul className="space-y-2 font-mono-tech text-xs text-stone-700 dark:text-[#F4F4F6]/85">
                    {activeDrawerService.executionSteps.map((step, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-stone-300/60 dark:border-white/[0.08]">
                  <h4 className="font-mono-tech text-xs uppercase tracking-wider text-stone-500 dark:text-[#8E8E93] mb-1">
                    Productos de Estudio Aplicados
                  </h4>
                  <p className="text-stone-700 dark:text-[#F4F4F6]/90">
                    {activeDrawerService.productsUsed}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-300/60 dark:border-white/[0.08]">
                  <h4 className="font-mono-tech text-xs uppercase tracking-wider text-stone-500 dark:text-[#8E8E93] mb-1">
                    Mantenimiento Post-Sesión
                  </h4>
                  <p className="text-stone-700 dark:text-[#F4F4F6]/90">
                    {activeDrawerService.aftercare}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-8 border-t border-stone-300 dark:border-white/[0.08] flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={onCloseDrawer}
                className="px-4 py-3 text-xs font-medium border border-stone-300 dark:border-white/[0.15] rounded-sm whitespace-nowrap shrink-0 cursor-pointer"
              >
                Volver a la carta
              </button>
              <button
                type="button"
                onClick={() => onSelectAndBookFromDrawer(activeDrawerService.id)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider bg-[#141415] text-[#F4F4F6] dark:bg-[#C5A880] dark:text-[#0C0C0D] rounded-sm whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Seleccionar para mi turno</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
