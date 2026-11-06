import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { StudioService } from '../data/studioData';
import { formatPriceARS } from '../utils/bookingEngine';
import { Check, Plus, X, ArrowRight, Clock } from 'lucide-react';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';

export const ServicesPage: React.FC = () => {
  const { config, services, selectedServiceIds, toggleSelectService, navigateTo } = useStudio();
  const [activeDrawer, setActiveDrawer] = useState<StudioService | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories = [
    'Todos',
    'Fades & Cortes',
    'Corte & Barba',
    'Color & Platinados',
    'Detalles & Barba',
  ];

  const visibleServices = services.filter((s) => !s.hidden);
  const filteredServices =
    selectedCategory === 'Todos'
      ? visibleServices
      : visibleServices.filter((s) => s.category === selectedCategory);

  return (
    <div className="py-8 md:py-16 max-w-[1360px] mx-auto px-4 sm:px-6 space-y-12">
      {/* Page Title & Intro */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#232730]">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#D4A373] font-bold block mb-1">
            ESTUDIO EXCLUSIVO PARA HOMBRES · {config.studioTitle.toUpperCase()}
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
            Carta de Cortes &amp; Fades
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <p className="text-xs font-mono text-zinc-400 max-w-[42ch]">
            Cada corte tiene tiempo cronometrado exacto y {config.cleanBufferMinutes} minutos entre turnos para esterilización con luz UV.
          </p>
          {config.showServicePrice && (
            <div className="px-3.5 py-2 rounded-lg bg-[#111318] border border-[#D4A373]/40 font-mono text-xs text-[#D4A373] font-bold">
              SERVICIO PRINCIPAL: {config.mainPriceDisplay}
            </div>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              playMechanicalClick();
              setSelectedCategory(cat);
            }}
            onMouseEnter={playMechanicalHover}
            className={`px-4 py-2 text-xs font-mono font-bold rounded-lg uppercase tracking-wider transition-colors cursor-pointer active:scale-95 ${
              selectedCategory === cat
                ? 'bg-[#D4A373] text-zinc-950 shadow-sm font-black'
                : 'bg-[#111318] border border-[#232730] text-zinc-400 hover:text-white hover:border-zinc-500'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredServices.map((service) => {
          const isSelected = selectedServiceIds.includes(service.id);
          const showPrice = config.showServicePrice && !service.hidePrice;
          const showProducts = config.showServiceProducts && !service.hideProducts;
          const showBuyBtn = config.showServiceBookingButton && !service.hideBuyButton;

          return (
            <article
              key={service.id}
              className={`p-6 md:p-7 rounded-2xl border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-[#D4A373] bg-[#161920] shadow-[0_4px_20px_rgba(212,163,115,0.12)]'
                  : 'border-[#232730] bg-[#111318] hover:border-[#D4A373]/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-2.5">
                  <span className="text-[#D4A373] font-bold">
                    {service.index}. {service.category}
                  </span>
                  {showPrice && (
                    <span className="text-xl font-black text-white">
                      {formatPriceARS(service.price)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <h2 className="font-display text-2xl font-bold text-white">{service.name}</h2>
                  {service.popularTag && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#D4A373]/15 text-[#D4A373] border border-[#D4A373]/30 shrink-0">
                      {service.popularTag}
                    </span>
                  )}
                </div>

                {config.showServiceDuration && (
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-4">
                    <Clock className="w-3.5 h-3.5 text-[#D4A373]" />
                    <span>{service.durationMinutes} minutos en sillón</span>
                  </div>
                )}

                <p className="text-xs md:text-sm text-zinc-300 leading-relaxed mb-5">
                  {service.shortDescription}
                </p>

                {showProducts && (
                  <div className="p-3.5 rounded-xl bg-[#0C0E12] border border-[#1E222B] text-[11px] font-mono text-zinc-400 space-y-1">
                    <p>
                      <span className="text-zinc-500 font-semibold">
                        Herramientas &amp; fijación:
                      </span>{' '}
                      {service.productsUsed}
                    </p>
                    <p>
                      <span className="text-zinc-500 font-semibold">Durabilidad del fade:</span>{' '}
                      {service.aftercare}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-5 mt-5 border-t border-[#1E222B] flex items-center justify-between gap-4">
                <button
                  onClick={() => {
                    playMechanicalClick();
                    setActiveDrawer(service);
                  }}
                  onMouseEnter={playMechanicalHover}
                  className="text-xs font-mono text-zinc-400 hover:text-white underline underline-offset-4 cursor-pointer"
                >
                  Ver Ficha Técnica y Pasos
                </button>

                {showBuyBtn && (
                  <button
                    onClick={() => {
                      playMechanicalClick();
                      toggleSelectService(service.id);
                    }}
                    onMouseEnter={playMechanicalHover}
                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-mono font-black rounded-xl uppercase tracking-wider cursor-pointer transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-[#D4A373] text-zinc-950 shadow-sm'
                        : 'border border-[#282D37] bg-[#161920] text-zinc-200 hover:border-[#D4A373] hover:text-white'
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>{isSelected ? 'Seleccionado' : 'Añadir al Turno'}</span>
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Floating Summary Bar if Services Selected */}
      {selectedServiceIds.length > 0 && (
        <div className="p-5 md:p-6 rounded-2xl border border-[#D4A373] bg-[#111318] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div>
            <p className="font-mono text-xs uppercase text-[#D4A373] font-bold">
              SERVICIOS ELEGIDOS ({selectedServiceIds.length})
            </p>
            <p className="text-sm font-bold text-white">
              ¿Querés elegir fecha y horario libre en el calendario en vivo?
            </p>
          </div>

          <button
            onClick={() => {
              playMechanicalClick();
              navigateTo('booking');
            }}
            onMouseEnter={playMechanicalHover}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-mono font-black uppercase tracking-wider bg-[#D4A373] text-zinc-950 rounded-xl hover:bg-[#C89562] transition-all cursor-pointer shadow-md active:scale-95"
          >
            <span>Continuar al Paso 2 (Horarios)</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      )}

      {/* Drawer for Service Preparation & Details */}
      {activeDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/85 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-[#111318] border-l border-[#282D37] text-white h-full p-6 md:p-8 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#1E222B]">
                <span className="font-mono text-xs font-bold text-[#D4A373]">
                  FICHA TÉCNICA · {activeDrawer.category.toUpperCase()}
                </span>
                <button
                  onClick={() => {
                    playMechanicalClick();
                    setActiveDrawer(null);
                  }}
                  onMouseEnter={playMechanicalHover}
                  className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
                  aria-label="Cerrar ficha técnica"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="font-display text-2xl md:text-3xl font-extrabold text-white mb-1">
                {activeDrawer.name}
              </h3>
              <p className="font-mono text-lg text-[#D4A373] font-bold mb-6">
                {config.showServicePrice && !activeDrawer.hidePrice
                  ? `${formatPriceARS(activeDrawer.price)} · `
                  : ''}
                {activeDrawer.durationMinutes} minutos de sesión
              </p>

              <div className="space-y-6 text-xs font-mono">
                <div>
                  <h4 className="uppercase text-zinc-500 mb-2 font-bold tracking-wider">
                    Cómo Asistir (Preparación)
                  </h4>
                  <ul className="space-y-1.5 text-zinc-300">
                    {activeDrawer.preparation.map((p, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#D4A373]">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="uppercase text-zinc-500 mb-2 font-bold tracking-wider">
                    Pasos de Ejecución en Sillón
                  </h4>
                  <ul className="space-y-1.5 text-zinc-300">
                    {activeDrawer.executionSteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#D4A373]">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="uppercase text-zinc-500 mb-1 font-bold tracking-wider">
                    Herramientas &amp; Productos
                  </h4>
                  <p className="text-zinc-300 bg-[#0C0E12] p-3 rounded-lg border border-[#1E222B]">
                    {activeDrawer.productsUsed}
                  </p>
                </div>

                <div>
                  <h4 className="uppercase text-zinc-500 mb-1 font-bold tracking-wider">
                    Cuidados &amp; Styling Diario
                  </h4>
                  <p className="text-zinc-300 bg-[#0C0E12] p-3 rounded-lg border border-[#1E222B]">
                    {activeDrawer.aftercare}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#1E222B] flex items-center gap-3">
              <button
                onClick={() => {
                  playMechanicalClick();
                  setActiveDrawer(null);
                }}
                onMouseEnter={playMechanicalHover}
                className="px-4 py-2.5 text-xs font-mono border border-[#282D37] rounded-xl text-zinc-400 hover:text-white cursor-pointer"
              >
                Cerrar
              </button>
              {config.showServiceBookingButton && !activeDrawer.hideBuyButton && (
                <button
                  onClick={() => {
                    playMechanicalClick();
                    if (!selectedServiceIds.includes(activeDrawer.id)) {
                      toggleSelectService(activeDrawer.id);
                    }
                    setActiveDrawer(null);
                    navigateTo('booking');
                  }}
                  onMouseEnter={playMechanicalHover}
                  className="flex-1 py-2.5 text-xs font-mono font-black uppercase tracking-wider bg-[#D4A373] text-zinc-950 rounded-xl hover:bg-[#C89562] transition-all cursor-pointer shadow-md active:scale-95"
                >
                  Agendar Este Corte
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
