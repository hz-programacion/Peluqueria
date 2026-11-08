import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  X,
  Instagram,
  ChevronLeft,
  ChevronRight,
  Camera,
  Upload,
  Trash2,
  Maximize2,
  CheckCircle2,
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { GalleryItemCategory, StudioGalleryItem } from '../data/studioData';
import { resolveInstagramInfo, resolveTikTokInfo } from '../utils/bookingEngine';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';
import { RetroCornerBandaBookmark } from './RetroPaperBanda';

const GALLERY_FILTERS: { id: 'Todas' | GalleryItemCategory; label: string }[] = [
  { id: 'Todas', label: 'Todas las Fotos' },
  { id: 'Cortes & Fades', label: 'Cortes & Fades' },
  { id: 'Color & Diseños', label: 'Color & Platinados' },
  { id: 'El Estudio & Local', label: 'El Estudio' },
  { id: 'Máquinas & Setup', label: 'Herramientas' },
  { id: 'Cultura & Streetwear', label: 'Estilo & Detalles' },
];

const compressUploadedPhoto = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1080;
        const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.84));
      };
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const StudioMultiGallery: React.FC = () => {
  const {
    galleryItems,
    addGalleryItem,
    deleteGalleryItem,
    toggleLikeGalleryItem,
    likedGalleryIds,
    config,
    isAdminAuthenticated,
  } = useStudio();

  const [selectedCategory, setSelectedCategory] = useState<'Todas' | GalleryItemCategory>('Todas');
  const [activeLightboxItem, setActiveLightboxItem] = useState<StudioGalleryItem | null>(null);

  // Direct Photo Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoCategory, setPhotoCategory] = useState<GalleryItemCategory>('Cortes & Fades');
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visibleItems = galleryItems.filter((item) => !item.hidden);

  const filteredItems =
    !config.showGalleryFilter || selectedCategory === 'Todas'
      ? visibleItems
      : visibleItems.filter((item) => item.category === selectedCategory);

  const igInfo = resolveInstagramInfo(config.instagram);
  const tkInfo = resolveTikTokInfo(config.tiktok);

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsCompressing(true);
      const compressedDataUrl = await compressUploadedPhoto(file);
      setPhotoPreviewUrl(compressedDataUrl);
    } catch {
      // ignore error
    } finally {
      setIsCompressing(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoPreviewUrl.trim()) return;

    const newItem: StudioGalleryItem = {
      id: `gal-photo-${Date.now()}`,
      title: photoTitle.trim() || `Postal de ${config.studioTitle || 'Rodrigo Cutsss'}`,
      category: photoCategory,
      imageUrl: photoPreviewUrl.trim(),
      description: '',
      dateLabel: 'Reciente · Rodrigo Cutsss',
      tags: ['#RodrigoCutsss', '#VenadoTuerto'],
      likes: 1,
      hideBuyButton: true,
      hidePrice: true,
      hideSpec: true,
    };

    await addGalleryItem(newItem);
    setPhotoPreviewUrl('');
    setPhotoTitle('');
    setIsUploadModalOpen(false);
    setUploadFeedback('¡Foto subida a la galería!');
    setTimeout(() => setUploadFeedback(''), 3200);
  };

  return (
    <div className="space-y-7">
      {/* Upload Toast Notification */}
      <AnimatePresence>
        {uploadFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            role="status"
            className="p-3.5 rounded-lg bg-[#FAF6EE] border-2 border-[#9E2A2B] text-[#181512] font-mono text-xs font-semibold flex items-center justify-between shadow-md"
          >
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#9E2A2B]" />
              {uploadFeedback}
            </span>
            <button
              type="button"
              onClick={() => setUploadFeedback('')}
              className="text-[#5C5346] hover:text-[#181512] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Aged-Paper Filter Bar + Direct Photo Upload Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#C8BBA4]">
        {config.showGalleryFilter ? (
          <div
            className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[#EAE0CE] border border-[#C8BBA4] overflow-x-auto max-w-full"
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
                  className={`px-3 sm:px-3.5 py-2 rounded-lg text-xs font-mono font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
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
            Archivo visual con {visibleItems.length} fotografías
          </div>
        )}

        {/* Direct Photo Upload Action (Simple & Pure Gallery Upload) */}
        {(config.allowPublicGalleryUpload !== false || isAdminAuthenticated) && (
          <button
            type="button"
            data-testid="gallery-open-upload-btn"
            onClick={() => {
              playMechanicalClick();
              setIsUploadModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#9E2A2B] hover:bg-[#822021] text-[#FAF6EE] border border-[#781D1E] shadow-[0_3px_0_#5E1516] font-mono text-xs font-semibold uppercase tracking-wider whitespace-nowrap shrink-0 transition-all cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>+ Subir Foto</span>
          </button>
        )}
      </div>

      {/* Pure Photo Grid (No booking buttons, no prices — purely visual photographs) */}
      {filteredItems.length === 0 ? (
        <div className="p-10 rounded-xl border border-[#C8BBA4] bg-[#FAF6EE] text-center space-y-3">
          <p className="font-display text-lg font-bold text-[#181512]">
            No hay fotos cargadas en esta categoría
          </p>
          <p className="text-xs font-mono text-[#5C5346]">
            Subí una nueva foto o seleccioná &ldquo;Todas las Fotos&rdquo; para explorar el archivo completo.
          </p>
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-[#9E2A2B] text-[#FAF6EE] font-mono text-xs font-semibold uppercase tracking-wider cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Subir Primera Foto</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isLiked = !!likedGalleryIds[item.id];
            const isUserUploaded = item.id.startsWith('gal-photo-') || item.id.startsWith('gal-admin-');

            return (
              <motion.article
                key={item.id}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                onClick={() => {
                  playMechanicalClick();
                  setActiveLightboxItem(item);
                }}
                className="group rounded-xl bg-[#FAF6EE] border border-[#C8BBA4] hover:border-[#9E2A2B] transition-all overflow-hidden flex flex-col justify-between shadow-[0_12px_30px_rgba(24,21,18,0.07)] cursor-pointer relative"
              >
                <RetroCornerBandaBookmark size="sm" />

                <div className="p-2.5 pb-0">
                  {/* Mounted Vintage Photograph Frame */}
                  <div className="relative aspect-[4/4] sm:aspect-[4/4.2] overflow-hidden rounded-lg border border-[#C8BBA4] bg-[#181512]">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover sepia-[0.08] contrast-[1.03] group-hover:scale-105 transition-transform duration-700"
                    />

                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#181512]/85 via-[#181512]/35 to-transparent pointer-events-none" />

                    {/* Top Left Category Tag */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-2.5 py-1 rounded bg-[#FAF6EE]/95 border border-[#C8BBA4] text-[#9E2A2B] font-mono text-[10px] font-bold uppercase tracking-wider shadow-xs">
                        {item.category}
                      </span>
                    </div>

                    {/* Bottom Overlay inside Photo */}
                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-xs font-mono text-[#FAF6EE] z-10">
                      <span className="text-[11px] text-[#E8DFCE] truncate max-w-[75%]">
                        {item.dateLabel || config.studioTitle}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#FAF6EE] font-semibold">
                        <Maximize2 className="w-3 h-3" />
                        <span>Ver</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Clean Photo Caption & Like Bar (Zero booking / price clutter) */}
                <div className="px-4 py-3.5 flex items-center justify-between gap-3 bg-[#FAF6EE]">
                  <div className="min-w-0">
                    <h3 className="font-display text-base sm:text-lg font-bold tracking-tight text-[#181512] group-hover:text-[#9E2A2B] transition-colors truncate">
                      {item.title}
                    </h3>
                    <span className="text-[11px] font-mono text-[#6E6355] block truncate">
                      {igInfo.handle} · {config.studioTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {config.showGalleryLikes && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playMechanicalClick();
                          toggleLikeGalleryItem(item.id);
                        }}
                        aria-label={`Me gusta ${item.title}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#D5C9B4] bg-[#F3ECE0] text-xs font-mono font-bold text-[#4F463B] hover:border-[#9E2A2B] hover:text-[#9E2A2B] transition-colors cursor-pointer"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            isLiked ? 'fill-[#9E2A2B] text-[#9E2A2B]' : 'text-[#6E6355]'
                          }`}
                        />
                        <span className="tabular-nums">{item.likes}</span>
                      </button>
                    )}

                    {(isAdminAuthenticated || isUserUploaded) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteGalleryItem(item.id);
                        }}
                        title="Eliminar foto de la galería"
                        aria-label={`Eliminar foto ${item.title}`}
                        className="p-1.5 rounded-lg border border-[#D5C9B4] bg-[#F3ECE0] text-[#6E6355] hover:border-[#9E2A2B] hover:text-[#9E2A2B] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL SIMPLE PARA SUBIR FOTOS A LA GALERÍA                                */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#181512]/80 backdrop-blur-xs"
            onClick={() => setIsUploadModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              data-testid="gallery-upload-modal"
              className="w-full max-w-lg rounded-xl bg-[#FAF6EE] border-2 border-[#C8BBA4] shadow-[0_24px_60px_rgba(24,21,18,0.28)] overflow-hidden relative"
            >
              <RetroCornerBandaBookmark size="md" />

              <div className="px-6 py-4 bg-[#EAE0CE] border-b border-[#C8BBA4] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#9E2A2B]" />
                  <h3 className="font-display text-lg font-bold text-[#181512]">
                    Subir Foto a la Galería
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  aria-label="Cerrar ventana de subida"
                  className="w-8 h-8 rounded-lg bg-[#FAF6EE] border border-[#C8BBA4] text-[#4F463B] hover:text-[#9E2A2B] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
                {/* File Dropzone / Picker */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#4F463B] font-semibold mb-1.5">
                    1. Elegí una foto desde tu celular o computadora
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#B8AA93] hover:border-[#9E2A2B] rounded-xl p-4 text-center bg-[#F3ECE0]/70 cursor-pointer transition-colors"
                  >
                    {photoPreviewUrl ? (
                      <div className="space-y-2">
                        <img
                          src={photoPreviewUrl}
                          alt="Vista previa"
                          className="w-full h-48 object-cover rounded-lg border border-[#C8BBA4] mx-auto"
                        />
                        <span className="inline-block text-xs font-mono text-[#9E2A2B] font-semibold">
                          Clic para cambiar imagen
                        </span>
                      </div>
                    ) : (
                      <div className="py-6 space-y-2">
                        <Upload className="w-7 h-7 text-[#9E2A2B] mx-auto" />
                        <p className="text-xs font-mono font-semibold text-[#181512]">
                          {isCompressing
                            ? 'Optimizando imagen...'
                            : 'Tocá acá para seleccionar una foto'}
                        </p>
                        <p className="text-[11px] text-[#6E6355]">
                          JPG, PNG o WebP · Se ajusta automáticamente a la galería
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional URL input */}
                <div>
                  <label
                    htmlFor="gallery-photo-url"
                    className="block text-[11px] font-mono uppercase tracking-wider text-[#6E6355] mb-1"
                  >
                    O pegá el enlace directo de una imagen (opcional)
                  </label>
                  <input
                    id="gallery-photo-url"
                    type="url"
                    value={photoPreviewUrl.startsWith('data:') ? '' : photoPreviewUrl}
                    onChange={(e) => setPhotoPreviewUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full h-10 px-3 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-xs text-[#181512] focus:border-[#9E2A2B] focus:outline-none"
                  />
                </div>

                {/* Optional Title & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="gallery-photo-title"
                      className="block text-xs font-mono uppercase tracking-wider text-[#4F463B] font-semibold mb-1"
                    >
                      Título breve (opcional)
                    </label>
                    <input
                      id="gallery-photo-title"
                      type="text"
                      value={photoTitle}
                      onChange={(e) => setPhotoTitle(e.target.value)}
                      placeholder="Ej. Mid Fade & Textura"
                      className="w-full h-10 px-3 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-xs text-[#181512] focus:border-[#9E2A2B] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="gallery-photo-category"
                      className="block text-xs font-mono uppercase tracking-wider text-[#4F463B] font-semibold mb-1"
                    >
                      Categoría
                    </label>
                    <select
                      id="gallery-photo-category"
                      value={photoCategory}
                      onChange={(e) => setPhotoCategory(e.target.value as GalleryItemCategory)}
                      className="w-full h-10 px-3 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-xs text-[#181512] focus:border-[#9E2A2B] focus:outline-none"
                    >
                      <option value="Cortes & Fades">Cortes &amp; Fades</option>
                      <option value="Color & Diseños">Color &amp; Platinados</option>
                      <option value="El Estudio & Local">El Estudio</option>
                      <option value="Máquinas & Setup">Herramientas</option>
                      <option value="Cultura & Streetwear">Estilo &amp; Detalles</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#D5C9B4]">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-4 py-2.5 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-xs font-mono font-semibold text-[#4F463B] hover:text-[#181512] cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!photoPreviewUrl.trim() || isCompressing}
                    data-testid="gallery-submit-upload-btn"
                    className="px-5 py-2.5 rounded-lg bg-[#9E2A2B] hover:bg-[#822021] disabled:opacity-50 text-[#FAF6EE] text-xs font-mono font-semibold uppercase tracking-wider shadow-[0_2px_0_#5E1516] cursor-pointer"
                  >
                    Publicar Foto
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* FULLSCREEN PHOTO LIGHTBOX (PURE PHOTO VIEWER — NO BOOKING BUTTON)          */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {activeLightboxItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#181512]/90 backdrop-blur-md"
            onClick={() => setActiveLightboxItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl bg-[#FAF6EE] border-2 border-[#C8BBA4] rounded-2xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 max-h-[90vh]"
            >
              {/* Left Image Area */}
              <div className="md:col-span-8 bg-[#181512] flex items-center justify-center relative min-h-[280px] sm:min-h-[380px]">
                <img
                  src={activeLightboxItem.imageUrl}
                  alt={activeLightboxItem.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain max-h-[75vh]"
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
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#FAF6EE]/90 border border-[#C8BBA4] text-[#181512] hover:bg-[#9E2A2B] hover:text-[#FAF6EE] flex items-center justify-center cursor-pointer shadow-md"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#FAF6EE]/90 border border-[#C8BBA4] text-[#181512] hover:bg-[#9E2A2B] hover:text-[#FAF6EE] flex items-center justify-center cursor-pointer shadow-md"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Right Photo Info & Social Links (Zero Booking Buttons) */}
              <div className="md:col-span-4 p-6 flex flex-col justify-between overflow-y-auto space-y-5 bg-[#FAF6EE]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#D5C9B4] pb-3">
                    <span className="font-mono text-xs font-bold text-[#9E2A2B] uppercase tracking-wider">
                      {activeLightboxItem.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveLightboxItem(null)}
                      aria-label="Cerrar vista ampliada"
                      className="w-8 h-8 rounded-lg bg-[#EAE0CE] text-[#4F463B] hover:text-[#9E2A2B] flex items-center justify-center cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-display text-2xl font-bold text-[#181512] leading-tight">
                      {activeLightboxItem.title}
                    </h3>
                    <span className="text-xs font-mono text-[#6E6355] block mt-1">
                      {config.studioTitle} · {config.address}, {config.neighborhood}
                    </span>
                  </div>

                  {activeLightboxItem.description && (
                    <p className="text-xs sm:text-sm text-[#4F463B] leading-relaxed">
                      {activeLightboxItem.description}
                    </p>
                  )}
                </div>

                {/* Likes & Social Media Links */}
                <div className="pt-4 border-t border-[#D5C9B4] space-y-3">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => toggleLikeGalleryItem(activeLightboxItem.id)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#C8BBA4] bg-[#F3ECE0] text-xs font-mono font-bold text-[#181512] hover:border-[#9E2A2B] cursor-pointer"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          likedGalleryIds[activeLightboxItem.id]
                            ? 'fill-[#9E2A2B] text-[#9E2A2B]'
                            : 'text-[#9E2A2B]'
                        }`}
                      />
                      <span>Me gusta ({activeLightboxItem.likes})</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={igInfo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-lg bg-[#EAE0CE] border border-[#C8BBA4] hover:border-[#9E2A2B] text-[#181512] font-mono text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Instagram className="w-3.5 h-3.5 text-[#9E2A2B]" />
                      <span>Instagram</span>
                    </a>
                    <a
                      href={tkInfo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-lg bg-[#EAE0CE] border border-[#C8BBA4] hover:border-[#9E2A2B] text-[#181512] font-mono text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <span className="text-[#9E2A2B] font-bold">♪</span>
                      <span>TikTok</span>
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
