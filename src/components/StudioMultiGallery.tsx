import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  X,
  Instagram,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Shield,
  Scissors,
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { GalleryItemCategory, StudioGalleryItem } from '../data/studioData';
import { resolveInstagramInfo, resolveWhatsAppInfo } from '../utils/bookingEngine';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';

const GALLERY_FILTERS: { id: 'Todas' | GalleryItemCategory; label: string }[] = [
  { id: 'Todas', label: 'Todas las Creaciones' },
  { id: 'Cortes & Fades', label: 'Cortes & Fades 2026' },
  { id: 'Color & Diseños', label: 'Color & Platinados' },
  { id: 'El Estudio & Local', label: 'El Estudio' },
  { id: 'Máquinas & Setup', label: 'Máquinas & Setup' },
  { id: 'Cultura & Streetwear', label: 'Cultura Urbana' },
];

const URBAN_CARD_ACCENTS = [
  {
    color: '#9E2A2B',
    badgeBg: 'bg-[#9E2A2B] text-[#F3EFE6]',
    borderHover: 'hover:border-[#9E2A2B]',
    trendTag: 'ARCHIVO · CROP & SKIN FADE',
  },
  {
    color: '#C5A059',
    badgeBg: 'bg-[#1A1816] border border-[#C5A059]/50 text-[#C5A059]',
    borderHover: 'hover:border-[#C5A059]',
    trendTag: 'ESTUDIO PRIVADO 1 A 1',
  },
  {
    color: '#9E2A2B',
    badgeBg: 'bg-[#9E2A2B] text-[#F3EFE6]',
    borderHover: 'hover:border-[#9E2A2B]',
    trendTag: 'ARCHIVO · LOW TAPER RULOS',
  },
  {
    color: '#C5A059',
    badgeBg: 'bg-[#1A1816] border border-[#C5A059]/50 text-[#C5A059]',
    borderHover: 'hover:border-[#C5A059]',
    trendTag: 'PRECISIÓN 0.0MM TITANIO',
  },
  {
    color: '#9E2A2B',
    badgeBg: 'bg-[#9E2A2B] text-[#F3EFE6]',
    borderHover: 'hover:border-[#9E2A2B]',
    trendTag: 'COLORIMETRÍA · PLATINADO',
  },
  {
    color: '#C5A059',
    badgeBg: 'bg-[#1A1816] border border-[#C5A059]/50 text-[#C5A059]',
    borderHover: 'hover:border-[#C5A059]',
    trendTag: 'RODRIGO CUTSSS · VT',
  },
];

export const StudioMultiGallery: React.FC = () => {
  const {
    galleryItems,
    toggleLikeGalleryItem,
    likedGalleryIds,
    navigateTo,
    setSelectedServiceIds,
    config,
    isAdminAuthenticated,
  } = useStudio();

  const [selectedCategory, setSelectedCategory] = useState<'Todas' | GalleryItemCategory>('Todas');
  const [activeLightboxItem, setActiveLightboxItem] = useState<StudioGalleryItem | null>(null);

  const visibleItems = galleryItems.filter((item) => !item.hidden);

  const filteredItems =
    !config.showGalleryFilter || selectedCategory === 'Todas'
      ? visibleItems
      : visibleItems.filter((item) => item.category === selectedCategory);

  const igInfo = resolveInstagramInfo(config.instagram);
  const waInfo = resolveWhatsAppInfo(config.phoneDisplay, config.whatsappRaw);

  useEffect(() => {
    if (!activeLightboxItem) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveLightboxItem(null);
      } else if (e.key === 'ArrowRight') {
        const idx = filteredItems.findIndex((i) => i.id === activeLightboxItem.id);
        if (idx !== -1 && filteredItems.length > 1) {
          setActiveLightboxItem(filteredItems[(idx + 1) % filteredItems.length]);
        }
      } else if (e.key === 'ArrowLeft') {
        const idx = filteredItems.findIndex((i) => i.id === activeLightboxItem.id);
        if (idx !== -1 && filteredItems.length > 1) {
          setActiveLightboxItem(
            filteredItems[(idx - 1 + filteredItems.length) % filteredItems.length]
          );
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxItem, filteredItems]);

  return (
    <div className="space-y-8">
      {/* Aged-Paper Segmented Filter Bar */}
      {(config.showGalleryFilter || isAdminAuthenticated) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#C8BBA4]">
          {config.showGalleryFilter ? (
            <div
              className="inline-flex items-center gap-1.5 p-1.5 rounded-xl bg-[#EAE0CE] border border-[#C8BBA4] overflow-x-auto max-w-full"
              role="tablist"
              aria-label="Filtrar fotos de la galería"
            >
              {GALLERY_FILTERS.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const count =
                  cat.id === 'Todas'
                    ? visibleItems.length
                    : visibleItems.filter((i) => i.category === cat.id).length;

                if (cat.id !== 'Todas' && count === 0) return null;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onMouseEnter={playMechanicalHover}
                    onClick={() => {
                      playMechanicalClick();
                      setSelectedCategory(cat.id);
                    }}
                    className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#9E2A2B] text-[#FAF6EE] shadow-xs'
                        : 'text-[#4F463B] hover:text-[#181512] hover:bg-[#FAF6EE]'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`ml-1.5 text-[11px] tabular-nums ${
                        isSelected ? 'text-[#FAF6EE]/90 font-black' : 'text-[#6E6355]'
                      }`}
                    >
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-xs font-mono text-[#5C5346]">
              Mostrando {visibleItems.length} creaciones reales del estudio
            </div>
          )}

          {/* Discreet Admin Shortcut ONLY visible when the Barber is logged in */}
          {isAdminAuthenticated && (
            <button
              type="button"
              onMouseEnter={playMechanicalHover}
              onClick={() => {
                playMechanicalClick();
                navigateTo('admin');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FAF6EE] hover:bg-[#9E2A2B] hover:text-[#FAF6EE] border border-[#9E2A2B]/50 text-[#181512] font-mono text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer self-start sm:self-auto"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Subir / Editar Fotos en Admin</span>
            </button>
          )}
        </div>
      )}

      {/* Real Creations & 2026 Trends Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 rounded-2xl border border-[#232730] bg-[#111318] text-center space-y-2">
          <p className="font-display text-lg font-bold text-white">No hay fotos en esta vista</p>
          <p className="text-xs font-mono text-zinc-400">
            Seleccioná &ldquo;Todas las Creaciones&rdquo; para ver el lookbook completo del estudio.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredItems.map((item, idx) => {
            const isLiked = !!likedGalleryIds[item.id];
            const showPrice =
              config.showGalleryPriceBadge && !item.hidePrice && Boolean(item.priceLabel);
            const showSpec =
              config.showGalleryTechnicalSpec && !item.hideSpec && Boolean(item.technicalSpec);
            const showBuyBtn = config.showGalleryBookingButton && !item.hideBuyButton;
            const accent = URBAN_CARD_ACCENTS[idx % URBAN_CARD_ACCENTS.length];

            return (
              <motion.article
                key={item.id}
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                onClick={() => {
                  playMechanicalClick();
                  setActiveLightboxItem(item);
                }}
                className="group rounded-xl bg-[#FAF6EE] border border-[#C8BBA4] hover:border-[#9E2A2B] transition-all overflow-hidden flex flex-col justify-between shadow-[0_12px_30px_rgba(24,21,18,0.08)] cursor-pointer relative river-banda-corner"
              >
                <div className="relative z-10 p-2.5 pb-0">
                  {/* Mounted Vintage Photograph Frame */}
                  <div className="relative h-64 sm:h-72 overflow-hidden rounded-lg border border-[#C8BBA4] bg-[#181512]">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover sepia-[0.1] contrast-[1.03] group-hover:scale-105 transition-transform duration-700"
                    />

                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#181512]/90 via-[#181512]/45 to-transparent pointer-events-none" />

                    {/* Top Left Archive Badge */}
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded bg-[#FAF6EE]/95 border border-[#C8BBA4] text-[#9E2A2B] font-mono text-[10px] font-bold uppercase tracking-wider shadow-xs">
                        {accent.trendTag}
                      </span>
                    </div>

                    {showPrice && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="px-2.5 py-1 rounded bg-[#9E2A2B] text-[#FAF6EE] font-mono text-xs font-bold tabular-nums shadow-xs">
                          {item.priceLabel}
                        </span>
                      </div>
                    )}

                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-xs font-mono text-[#FAF6EE] z-10">
                      <span className="font-bold uppercase tracking-wider text-[#E8DFCE]">
                        {item.category}
                      </span>
                      <span className="text-[#FAF6EE] font-semibold">
                        Ampliar &rarr;
                      </span>
                    </div>
                  </div>

                  {/* Card Body on Aged Cardstock */}
                  <div className="p-4 sm:p-5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-mono text-[#5C5346]">
                      <span className="text-[#9E2A2B] font-bold">{igInfo.handle}</span>
                      <span>·</span>
                      <span>{item.dateLabel}</span>
                    </div>

                    <h3 className="font-display text-xl font-bold tracking-tight text-[#181512] group-hover:text-[#9E2A2B] transition-colors leading-snug">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-xs sm:text-sm text-[#4F463B] leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    {showSpec && (
                      <div className="p-3 rounded-lg bg-[#EAE0CE] border border-[#C8BBA4] text-xs font-mono text-[#181512]">
                        <span className="font-bold uppercase text-[10px] block mb-0.5 text-[#9E2A2B]">
                          Fórmula &amp; Técnica Real:
                        </span>
                        <span>{item.technicalSpec}</span>
                      </div>
                    )}

                    {config.showGalleryTags && item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] font-mono text-[#5C5346]">
                        {item.tags.slice(0, 3).map((tag, tagIdx) => (
                          <span
                            key={tagIdx}
                            className="px-2 py-0.5 rounded bg-[#EAE0CE] border border-[#C8BBA4]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                {(config.showGalleryLikes || showBuyBtn) && (
                  <div className="px-5 py-3.5 border-t border-[#D5C9B4] bg-[#F3ECE0] flex items-center justify-between gap-2 relative z-10">
                    {config.showGalleryLikes ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playMechanicalClick();
                          toggleLikeGalleryItem(item.id);
                        }}
                        aria-label={`Me gusta ${item.title}`}
                        className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#4F463B] hover:text-[#9E2A2B] transition-colors cursor-pointer"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isLiked ? 'fill-[#9E2A2B] text-[#9E2A2B]' : 'text-[#6E6355]'
                          }`}
                        />
                        <span className="tabular-nums">{item.likes}</span>
                      </button>
                    ) : (
                      <span className="text-xs font-mono text-[#5C5346]">{config.address}</span>
                    )}

                    {showBuyBtn ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playMechanicalClick();
                          window.dispatchEvent(
                            new CustomEvent('urban-section-transition', {
                              detail: { sectionId: 'reservar' },
                            })
                          );
                          if (item.serviceId) {
                            setSelectedServiceIds([item.serviceId]);
                          }
                          const el = document.getElementById('reservar');
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth' });
                          } else {
                            navigateTo('booking');
                          }
                        }}
                        className="px-3.5 py-2 rounded bg-[#9E2A2B] hover:bg-[#822021] text-[#FAF6EE] font-mono text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer shadow-xs"
                      >
                        <Scissors className="w-3.5 h-3.5" />
                        <span>Quiero Este Look</span>
                      </button>
                    ) : (
                      <span className="text-xs font-mono text-[#5C5346]">{config.address}</span>
                    )}
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* FULLSCREEN PHOTO LIGHTBOX                                                 */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {activeLightboxItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setActiveLightboxItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl bg-[#111318] border border-[#282D37] rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 max-h-[90vh]"
            >
              {/* Left Image Area */}
              <div className="md:col-span-7 bg-black flex items-center justify-center relative min-h-[300px]">
                <img
                  src={activeLightboxItem.imageUrl}
                  alt={activeLightboxItem.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain max-h-[78vh]"
                />

                {filteredItems.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const idx = filteredItems.findIndex((i) => i.id === activeLightboxItem.id);
                        setActiveLightboxItem(
                          filteredItems[(idx - 1 + filteredItems.length) % filteredItems.length]
                        );
                      }}
                      aria-label="Foto anterior"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/75 border border-white/15 text-white hover:bg-[#F59E0B] hover:text-zinc-950 flex items-center justify-center cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const idx = filteredItems.findIndex((i) => i.id === activeLightboxItem.id);
                        setActiveLightboxItem(filteredItems[(idx + 1) % filteredItems.length]);
                      }}
                      aria-label="Siguiente foto"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/75 border border-white/15 text-white hover:bg-[#F59E0B] hover:text-zinc-950 flex items-center justify-center cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Right Details Column */}
              <div className="md:col-span-5 p-6 flex flex-col justify-between overflow-y-auto space-y-5 bg-[#111318]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1E222B] pb-3">
                    <span className="font-mono text-xs font-bold text-[#F59E0B]">
                      {activeLightboxItem.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveLightboxItem(null)}
                      aria-label="Cerrar vista ampliada"
                      className="w-8 h-8 rounded-lg bg-[#161920] text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-display text-2xl font-black text-white leading-tight">
                      {activeLightboxItem.title}
                    </h3>
                    <span className="text-xs font-mono text-zinc-400 block mt-1">
                      {config.studioTitle} · {config.address}, {config.neighborhood}
                    </span>
                  </div>

                  {activeLightboxItem.description && (
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                      {activeLightboxItem.description}
                    </p>
                  )}

                  {config.showGalleryTechnicalSpec &&
                    !activeLightboxItem.hideSpec &&
                    activeLightboxItem.technicalSpec && (
                      <div className="p-3.5 rounded-xl bg-[#0C0E12] border border-[#1E222B] font-mono text-xs space-y-1">
                        <span className="text-[11px] text-[#F59E0B] font-bold block">
                          Detalle del Trabajo:
                        </span>
                        <span className="text-white font-semibold block">
                          {activeLightboxItem.technicalSpec}
                        </span>
                      </div>
                    )}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-[#1E222B] space-y-2.5">
                  {config.showGalleryBookingButton && !activeLightboxItem.hideBuyButton && (
                    <button
                      type="button"
                      onClick={() => {
                        const item = activeLightboxItem;
                        setActiveLightboxItem(null);
                        if (item.serviceId) {
                          setSelectedServiceIds([item.serviceId]);
                        }
                        const el = document.getElementById('reservar');
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          navigateTo('booking');
                        }
                      }}
                      className="w-full py-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-zinc-950 font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Reservar Este Look Online</span>
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={igInfo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl bg-[#161920] border border-[#282D37] hover:border-[#F59E0B] text-zinc-200 hover:text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <Instagram className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>Instagram</span>
                    </a>
                    <a
                      href={`${waInfo.url}?text=${encodeURIComponent(
                        `Hola ${config.authorName}! Vi la foto "${activeLightboxItem.title}" en tu galería y te quería consultar`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl bg-[#161920] border border-[#282D37] hover:border-[#F59E0B] text-zinc-200 hover:text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
