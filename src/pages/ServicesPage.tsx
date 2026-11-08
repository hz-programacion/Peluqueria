import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { StudioService } from '../data/studioData';
import { formatPriceARS } from '../utils/bookingEngine';
import { Check, Plus, X, ArrowRight, Clock, ArrowLeft } from 'lucide-react';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';
import { RetroCornerBandaBookmark } from '../components/RetroPaperBanda';

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
    <div className="py-10 md:py-16 max-w-7xl mx-auto px-4 sm:px-8 space-y-10 text-[#181512]">
      {/* Page Title & Intro */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#C8BBA4]">
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#9E2A2B] hover:underline font-semibold cursor-pointer mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Portada</span>
          </button>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#9E2A2B] font-semibold block">
            Carta de Oficio · {config.studioTitle}
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-[#181512] tracking-tight">
            Servicios{' '}
            <span className="font-editorial italic font-normal text-[#9E2A2B]">
              &amp; Tarifario Oficial
            </span>
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <p className="text-xs font-mono text-[#4F463B] max-w-[42ch]">
            Cada sesión cuenta con tiempo cronometrado y {config.cleanBufferMinutes} minutos entre
            turnos para acondicionamiento del estudio.
          </p>
          {config.showServicePrice && (
            <div className="px-3.5 py-2 rounded-lg bg-[#FAF6EE] border border-[#C8BBA4] font-mono text-xs text-[#9E2A2B] font-bold">
              VALOR BASE: {config.mainPriceDisplay}
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
            className={`px-4 py-2 text-xs font-mono font-semibold rounded-lg uppercase tracking-wider transition-colors cursor-pointer border whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-[#9E2A2B] text-[#FAF6EE] border-[#9E2A2B] shadow-2xs'
                : 'bg-[#FAF6EE] border-[#C8BBA4] text-[#4F463B] hover:text-[#181512] hover:border-[#9E2A2B]'
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
              className={`p-6 md:p-7 rounded-xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                isSelected
                  ? 'border-[#9E2A2B] bg-[#FAF6EE] shadow-[0_12px_30px_rgba(158,42,43,0.12)]'
                  : 'border-[#C8BBA4] bg-[#FAF6EE] hover:border-[#9E2A2B]'
              }`}
            >
              <RetroCornerBandaBookmark size="sm" />
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-[#6E6355] mb-2.5 pr-6">
                  <span className="text-[#9E2A2B] font-bold">
                    {service.index}. {service.category}
                  </span>
                  {showPrice && (
                    <span className="text-xl font-bold text-[#181512] tabular-nums">
                      {formatPriceARS(service.price)}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h2 className="font-display text-2xl font-bold text-[#181512]">
                    {service.name}
                  </h2>
                  {service.popularTag && (
                    <span className="text-xs font-mono font-semibold text-[#9E2A2B]">
                      · {service.popularTag}
                    </span>
                  )}
                </div>

                {config.showServiceDuration && (
                  <div className="flex items-center gap-2 text-xs font-mono text-[#6E6355] mb-4">
                    <Clock className="w-3.5 h-3.5 text-[#9E2A2B]" />
                    <span>{service.durationMinutes} minutos en sillón</span>
                  </div>
                )}

                <p className="text-xs md:text-sm text-[#4F463B] leading-relaxed mb-5">
                  {service.shortDescription}
                </p>

                {showProducts && (
                  <div className="p-3.5 rounded-lg bg-[#F3ECE0] border border-[#C8BBA4] text-[11px] font-mono text-[#4F463B] space-y-1">
                    <p>
                      <span className="text-[#9E2A2B] font-semibold">
                        Herramientas &amp; fijación:
                      </span>{' '}
                      {service.productsUsed}
                    </p>
                    <p>
                      <span className="text-[#9E2A2B] font-semibold">Durabilidad:</span>{' '}
                      {service.aftercare}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-5 mt-5 border-t border-[#D5C9B4] flex items-center justify-between gap-4">
                <button
                  onClick={() => {
                    playMechanicalClick();
                    setActiveDrawer(service);
                  }}
                  onMouseEnter={playMechanicalHover}
                  className="text-xs font-mono text-[#4F463B] hover:text-[#9E2A2B] underline underline-offset-4 cursor-pointer"
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
                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-mono font-semibold rounded-lg uppercase tracking-wider cursor-pointer transition-all whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#9E2A2B] text-[#FAF6EE]'
                        : 'border border-[#C8BBA4] bg-[#F3ECE0] text-[#181512] hover:border-[#9E2A2B]'
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-[#9E2A2B]" />
                    )}
                    <span>{isSelected ? 'Seleccionado' : 'Elegir Servicio'}</span>
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Floating Summary Bar if Services Selected */}
      {selectedServiceIds.length > 0 && (
        <div className="p-5 md:p-6 rounded-xl border border-[#9E2A2B] bg-[#FAF6EE] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div>
            <p className="font-mono text-xs uppercase text-[#9E2A2B] font-bold">
              SERVICIOS ELEGIDOS ({selectedServiceIds.length})
            </p>
            <p className="text-sm font-bold text-[#181512]">
              ¿Querés elegir fecha y horario libre en la agenda en vivo?
            </p>
          </div>

          <button
            onClick={() => {
              playMechanicalClick();
              navigateTo('booking');
            }}
            onMouseEnter={playMechanicalHover}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-mono font-semibold uppercase tracking-wider bg-[#9E2A2B] text-[#FAF6EE] rounded-lg hover:bg-[#822021] transition-all cursor-pointer shadow-xs"
          >
            <span>Continuar a Horarios</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Drawer for Service Preparation & Details */}
      {activeDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#181512]/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#FAF6EE] border-l border-[#C8BBA4] text-[#181512] h-full p-6 md:p-8 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#C8BBA4]">
                <span className="font-mono text-xs font-bold text-[#9E2A2B]">
                  FICHA TÉCNICA · {activeDrawer.category.toUpperCase()}
                </span>
                <button
                  onClick={() => {
                    playMechanicalClick();
                    setActiveDrawer(null);
                  }}
                  onMouseEnter={playMechanicalHover}
                  className="p-1 text-[#4F463B] hover:text-[#181512] rounded-lg cursor-pointer"
                  aria-label="Cerrar ficha técnica"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="font-display text-2xl md:text-3xl font-bold text-[#181512] mb-1">
                {activeDrawer.name}
              </h3>
              <p className="font-mono text-lg text-[#9E2A2B] font-bold mb-6 tabular-nums">
                {config.showServicePrice && !activeDrawer.hidePrice
                  ? `${formatPriceARS(activeDrawer.price)} · `
                  : ''}
                {activeDrawer.durationMinutes} minutos de sesión
              </p>

              <div className="space-y-6 text-xs font-mono">
                <div>
                  <h4 className="uppercase text-[#6E6355] mb-2 font-bold tracking-wider">
                    Preparación y Diagnóstico
                  </h4>
                  <ul className="space-y-1.5 text-[#4F463B]">
                    {activeDrawer.preparation.map((p, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#9E2A2B]">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="uppercase text-[#6E6355] mb-2 font-bold tracking-wider">
                    Pasos de Ejecución en Sillón
                  </h4>
                  <ul className="space-y-1.5 text-[#4F463B]">
                    {activeDrawer.executionSteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#9E2A2B]">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="uppercase text-[#6E6355] mb-1 font-bold tracking-wider">
                    Herramientas &amp; Productos
                  </h4>
                  <p className="text-[#181512] bg-[#F3ECE0] p-3 rounded-lg border border-[#C8BBA4]">
                    {activeDrawer.productsUsed}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#C8BBA4] flex items-center gap-3">
              <button
                onClick={() => {
                  playMechanicalClick();
                  setActiveDrawer(null);
                }}
                onMouseEnter={playMechanicalHover}
                className="px-4 py-2.5 text-xs font-mono border border-[#C8BBA4] rounded-lg text-[#4F463B] hover:text-[#181512] cursor-pointer"
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
                  className="flex-1 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider bg-[#9E2A2B] text-[#FAF6EE] rounded-lg hover:bg-[#822021] transition-all cursor-pointer"
                >
                  Agendar Este Servicio
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
