import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Plus,
  Heart,
  Scissors,
  Sparkles,
  Upload,
  X,
  Instagram,
  MessageCircle,
  Check,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Layers,
  Wrench,
  Home,
  Palette,
  Flame,
  Calendar,
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { GalleryItemCategory, StudioGalleryItem } from '../data/studioData';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';

const GALLERY_CATEGORIES: { id: 'Todas' | GalleryItemCategory; label: string; icon: React.ElementType }[] = [
  { id: 'Todas', label: 'Todo el Mural', icon: Layers },
  { id: 'Cortes & Fades', label: 'Cortes & Fades', icon: Scissors },
  { id: 'El Estudio & Local', label: 'El Estudio & Local', icon: Home },
  { id: 'Máquinas & Setup', label: 'Máquinas & Setup', icon: Wrench },
  { id: 'Color & Diseños', label: 'Color & Diseños', icon: Palette },
  { id: 'Cultura & Streetwear', label: 'Cultura & Vibe', icon: Flame },
];

export const StudioMultiGallery: React.FC = () => {
  const {
    galleryItems,
    addGalleryItem,
    deleteGalleryItem,
    toggleLikeGalleryItem,
    likedGalleryIds,
    navigateTo,
    setSelectedServiceIds,
    config,
    isAdminAuthenticated,
  } = useStudio();

  const [selectedCategory, setSelectedCategory] = useState<'Todas' | GalleryItemCategory>('Todas');
  const [activeLightboxItem, setActiveLightboxItem] = useState<StudioGalleryItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Upload form states
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<GalleryItemCategory>('Cortes & Fades');
  const [newDescription, setNewDescription] = useState('');
  const [newSpec, setNewSpec] = useState('');
  const [newTags, setNewTags] = useState('#RodrigoCutsss #VenadoTuerto');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadPreview, setUploadPreview] = useState<string>('');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredItems =
    selectedCategory === 'Todas'
      ? galleryItems
      : galleryItems.filter((item) => item.category === selectedCategory);

  // Keyboard navigation for Lightbox
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
          setActiveLightboxItem(filteredItems[(idx - 1 + filteredItems.length) % filteredItems.length]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxItem, filteredItems]);

  // Compress uploaded image via Canvas so it stores fast in Firestore & localStorage
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor seleccioná un archivo de imagen válido (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 960;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setUploadPreview(compressedDataUrl);
          setNewImageUrl(compressedDataUrl);
        }
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');

    const cleanTitle = newTitle.trim();
    const finalImage = uploadPreview || newImageUrl.trim();

    if (!cleanTitle) {
      setUploadError('Ingresá un título para la foto (ej. Skin Fade, Mi Setup de Máquinas, El Local).');
      return;
    }
    if (!finalImage) {
      setUploadError('Subí una foto desde tu dispositivo o pegá un enlace de imagen.');
      return;
    }

    const parsedTags = newTags
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    const newItem: StudioGalleryItem = {
      id: `gal-custom-${Date.now()}`,
      title: cleanTitle,
      category: newCategory,
      imageUrl: finalImage,
      description:
        newDescription.trim() ||
        `Foto subida a la sección ${newCategory} de Rodrigo Cutsss en Venado Tuerto.`,
      dateLabel: 'Recién subido',
      tags: parsedTags.length > 0 ? parsedTags : ['#RodrigoCutsss', '#VenadoTuerto'],
      technicalSpec: newSpec.trim() || `${newCategory} · Vuelta de Obligado 931`,
      priceLabel: newCategory === 'Cortes & Fades' ? '$12.000 ARS' : undefined,
      serviceId: newCategory === 'Cortes & Fades' ? 'srv-mid-fade-crop' : undefined,
      likes: 1,
      featured: true,
    };

    await addGalleryItem(newItem);
    playMechanicalClick();
    setUploadSuccess(true);

    setTimeout(() => {
      setUploadSuccess(false);
      setIsUploadModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewSpec('');
      setNewImageUrl('');
      setUploadPreview('');
      setSelectedCategory('Todas');
    }, 1100);
  };

  const getCategoryBadgeStyle = (category: GalleryItemCategory) => {
    switch (category) {
      case 'Cortes & Fades':
        return 'bg-[#A855F7]/20 text-[#C084FC] border-[#A855F7]/50';
      case 'El Estudio & Local':
        return 'bg-[#FF4655]/20 text-[#FF4655] border-[#FF4655]/50';
      case 'Máquinas & Setup':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Color & Diseños':
        return 'bg-[#D946EF]/20 text-[#F0ABFC] border-[#D946EF]/50';
      case 'Cultura & Streetwear':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-[#A855F7]/20 text-[#A855F7] border-[#A855F7]/40';
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Controls Bar: Multi-Category Filter Tabs + Upload Button */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#22263A]">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Categorías de la galería">
          {GALLERY_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            const count =
              cat.id === 'Todas'
                ? galleryItems.length
                : galleryItems.filter((i) => i.category === cat.id).length;

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
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#A855F7] to-[#FF4655] text-white shadow-[0_0_18px_rgba(168,85,247,0.35)]'
                    : 'bg-[#121420] border border-[#252A3F] text-zinc-400 hover:text-white hover:border-[#A855F7]/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] ${
                    isSelected ? 'bg-black/30 text-white' : 'bg-[#1A1D2E] text-zinc-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Upload New Photo Action Button */}
        <div className="flex items-center gap-3 self-start lg:self-auto">
          <button
            type="button"
            onMouseEnter={playMechanicalHover}
            onClick={() => {
              playMechanicalClick();
              setIsUploadModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16192B] hover:bg-[#A855F7] border-2 border-[#A855F7] text-white font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.25)] active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#FF4655] group-hover:text-white" />
            <Camera className="w-4 h-4" />
            <span>Subir Foto a la Galería</span>
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const isLiked = !!likedGalleryIds[item.id];
          return (
            <article
              key={item.id}
              onClick={() => {
                playMechanicalClick();
                setActiveLightboxItem(item);
              }}
              className="group rounded-2xl bg-[#0E101A] border-2 border-[#22263A] hover:border-[#A855F7] transition-all overflow-hidden flex flex-col justify-between shadow-xl cursor-pointer relative"
            >
              <div>
                {/* Image Wrapper */}
                <div className="relative h-64 sm:h-72 overflow-hidden bg-black">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Category Badge Top Left */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                    <span
                      className={`px-2.5 py-1 rounded-lg backdrop-blur-md border font-mono text-[10px] font-black uppercase tracking-wider ${getCategoryBadgeStyle(
                        item.category
                      )}`}
                    >
                      {item.category}
                    </span>

                    {item.priceLabel && (
                      <span className="px-2.5 py-1 rounded-lg bg-black/85 border border-white/15 text-white font-mono text-[11px] font-black">
                        {item.priceLabel}
                      </span>
                    )}
                  </div>

                  {/* Delete button if custom uploaded or admin */}
                  {(item.id.startsWith('gal-custom-') || isAdminAuthenticated) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playMechanicalClick();
                        deleteGalleryItem(item.id);
                      }}
                      title="Eliminar foto de la galería"
                      className="absolute bottom-3 left-3 z-20 p-2 rounded-lg bg-red-950/90 border border-red-500/50 text-red-300 hover:bg-red-600 hover:text-white transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Hover Zoom Prompt */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3">
                    <span className="px-3 py-1.5 rounded-lg bg-[#A855F7] text-white font-mono text-[10px] font-black uppercase tracking-wider shadow-lg">
                      Ampliar Foto &amp; Detalles
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                    <span>@rodrigo.cutsss · VT 931</span>
                    <span>{item.dateLabel}</span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-white group-hover:text-[#A855F7] transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>

                  {item.technicalSpec && (
                    <div className="p-2.5 rounded-xl bg-[#090B11] border border-[#1C2032] text-[11px] font-mono text-zinc-300">
                      <span className="text-[#FF4655] font-bold uppercase text-[10px] block">
                        Ficha / Detalle:
                      </span>
                      <span>{item.technicalSpec}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.tags.slice(0, 4).map((tag, idx) => (
                      <span key={idx} className="text-[10px] font-mono text-[#A855F7]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3.5 border-t border-[#1A1E2E] bg-[#0B0D15] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playMechanicalClick();
                    toggleLikeGalleryItem(item.id);
                  }}
                  aria-label="Me gusta esta foto"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-300 hover:text-[#FF4655] transition-colors cursor-pointer"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isLiked ? 'fill-[#FF4655] text-[#FF4655]' : 'text-zinc-400'
                    }`}
                  />
                  <span>{item.likes}</span>
                </button>

                {item.category === 'Cortes & Fades' || item.category === 'Color & Diseños' ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playMechanicalClick();
                      if (item.serviceId) {
                        setSelectedServiceIds([item.serviceId]);
                      }
                      navigateTo('booking');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#A855F7]/20 hover:bg-[#A855F7] text-[#C084FC] hover:text-white border border-[#A855F7]/40 font-mono text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Pedir este estilo
                  </button>
                ) : (
                  <span className="text-[11px] font-mono text-zinc-500">
                    Vuelta de Obligado 931
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: UPLOAD / ADD NEW PHOTO TO GALLERY                                */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="w-full max-w-xl bg-[#0F111C] border-2 border-[#A855F7] rounded-3xl p-6 sm:p-8 text-white shadow-[0_0_50px_rgba(168,85,247,0.3)] my-8"
            >
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#22263A]">
                <div>
                  <span className="font-mono text-[10px] font-black uppercase tracking-widest text-[#FF4655] block">
                    GALERÍA MULTIMEDIA // RODRIGO CUTSSS
                  </span>
                  <h3 className="font-display text-2xl font-black uppercase text-white">
                    Subir Foto a la Galería
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="w-9 h-9 rounded-xl bg-[#181B2B] text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {uploadSuccess ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
                    <Check className="w-7 h-7 stroke-[3]" />
                  </div>
                  <h4 className="font-display text-2xl font-bold text-white">
                    ¡Foto publicada en la galería!
                  </h4>
                  <p className="text-xs font-mono text-zinc-400">
                    Ya está visible en el mural del estudio.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCreateGalleryItem} className="space-y-4 font-mono text-xs">
                  {/* Category Selector */}
                  <div>
                    <label className="block text-zinc-300 font-bold uppercase mb-1.5">
                      1. ¿De qué es la foto? (Categoría)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(
                        [
                          'Cortes & Fades',
                          'El Estudio & Local',
                          'Máquinas & Setup',
                          'Color & Diseños',
                          'Cultura & Streetwear',
                        ] as GalleryItemCategory[]
                      ).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setNewCategory(cat)}
                          className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                            newCategory === cat
                              ? 'border-[#A855F7] bg-[#A855F7]/20 text-white'
                              : 'border-[#252A40] bg-[#141726] text-zinc-400 hover:text-white'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* File Upload or URL */}
                  <div>
                    <label className="block text-zinc-300 font-bold uppercase mb-1.5">
                      2. Elegí una foto de tu celular / PC o pegá un link
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 py-3 px-4 rounded-xl border-2 border-dashed border-[#A855F7]/60 hover:border-[#A855F7] bg-[#151828] text-white font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <Upload className="w-4 h-4 text-[#FF4655]" />
                        <span>Seleccionar Archivo de Imagen</span>
                      </button>
                    </div>

                    <div className="mt-2">
                      <input
                        type="text"
                        value={newImageUrl.startsWith('data:') ? '' : newImageUrl}
                        onChange={(e) => {
                          setNewImageUrl(e.target.value);
                          setUploadPreview(e.target.value);
                        }}
                        placeholder="O pegá acá la URL de una foto (https://...)"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141726] border border-[#262B42] text-white focus:border-[#A855F7] focus:outline-none"
                      />
                    </div>

                    {uploadPreview && (
                      <div className="mt-3 relative rounded-xl overflow-hidden border border-[#A855F7]/50 h-40 bg-black">
                        <img
                          src={uploadPreview}
                          alt="Vista previa"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setUploadPreview('');
                            setNewImageUrl('');
                          }}
                          className="absolute top-2 right-2 px-2 py-1 rounded bg-black/80 text-red-400 text-[10px] font-bold"
                        >
                          Quitar
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-zinc-300 font-bold uppercase mb-1">
                      3. Título de la Foto
                    </label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Ej: Mid Fade Texturizado / Nuevas Clippers Wahl / El Estudio de Noche"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141726] border border-[#262B42] text-white focus:border-[#A855F7] focus:outline-none"
                    />
                  </div>

                  {/* Description & Technical Spec */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-300 font-bold uppercase mb-1">
                        Descripción breve
                      </label>
                      <textarea
                        rows={2}
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Contá algo sobre este corte, herramienta o rincón del local..."
                        className="w-full px-3.5 py-2 rounded-xl bg-[#141726] border border-[#262B42] text-white focus:border-[#A855F7] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-300 font-bold uppercase mb-1">
                        Detalle / Máquinas / Lugar
                      </label>
                      <textarea
                        rows={2}
                        value={newSpec}
                        onChange={(e) => setNewSpec(e.target.value)}
                        placeholder="Ej: Shaver 0.0mm + Tijera / Sillón principal VT"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#141726] border border-[#262B42] text-white focus:border-[#A855F7] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Hashtags */}
                  <div>
                    <label className="block text-zinc-300 font-bold uppercase mb-1">
                      Etiquetas (Hashtags)
                    </label>
                    <input
                      type="text"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#141726] border border-[#262B42] text-white focus:border-[#A855F7] focus:outline-none"
                    />
                  </div>

                  {uploadError && (
                    <p className="text-xs text-[#FF4655] font-bold">{uploadError}</p>
                  )}

                  <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#22263A]">
                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-[#2A3048] text-zinc-400 hover:text-white cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#FF4655] text-white font-black uppercase tracking-wider shadow-lg cursor-pointer active:scale-95"
                    >
                      Publicar en la Galería
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: FULLSCREEN PHOTO LIGHTBOX                                        */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {activeLightboxItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setActiveLightboxItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl bg-[#0F111A] border-2 border-[#A855F7]/50 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.3)] grid grid-cols-1 md:grid-cols-12 max-h-[90vh]"
            >
              {/* Left Image Area */}
              <div className="md:col-span-7 bg-black flex items-center justify-center relative min-h-[300px]">
                <img
                  src={activeLightboxItem.imageUrl}
                  alt={activeLightboxItem.title}
                  className="w-full h-full object-contain max-h-[78vh]"
                />

                {/* Prev / Next Navigation */}
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
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/75 border border-white/15 text-white hover:bg-[#A855F7] flex items-center justify-center cursor-pointer"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/75 border border-white/15 text-white hover:bg-[#A855F7] flex items-center justify-center cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Right Details Column */}
              <div className="md:col-span-5 p-6 flex flex-col justify-between overflow-y-auto space-y-5 bg-[#0D0F18]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1E2234] pb-3">
                    <span
                      className={`px-2.5 py-1 rounded-lg border font-mono text-[10px] font-black uppercase tracking-wider ${getCategoryBadgeStyle(
                        activeLightboxItem.category
                      )}`}
                    >
                      {activeLightboxItem.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveLightboxItem(null)}
                      aria-label="Cerrar vista ampliada"
                      className="w-8 h-8 rounded-lg bg-[#181B2A] text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-display text-2xl font-black text-white uppercase leading-tight">
                      {activeLightboxItem.title}
                    </h3>
                    <span className="text-xs font-mono text-zinc-500 block mt-1">
                      Rodrigo Cutsss · Vuelta de Obligado 931, Venado Tuerto
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {activeLightboxItem.description}
                  </p>

                  {activeLightboxItem.technicalSpec && (
                    <div className="p-3.5 rounded-xl bg-[#141726] border border-[#252A40] font-mono text-xs space-y-1">
                      <span className="text-[10px] text-[#FF4655] font-black uppercase block">
                        ESPECIFICACIÓN / EQUIPAMIENTO:
                      </span>
                      <span className="text-white font-bold block">
                        {activeLightboxItem.technicalSpec}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    {activeLightboxItem.tags.map((tag, i) => (
                      <span key={i} className="text-xs font-mono text-[#A855F7]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-[#1E2234] space-y-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const item = activeLightboxItem;
                      setActiveLightboxItem(null);
                      if (item.serviceId) {
                        setSelectedServiceIds([item.serviceId]);
                      }
                      navigateTo('booking');
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#D946EF] text-white font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Reservar Turno Online ($12.000 ARS)</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href="https://instagram.com/rodrigo.cutsss"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl bg-[#151828] border border-[#2C314A] hover:border-[#D946EF] text-zinc-200 hover:text-white font-mono text-[11px] font-bold flex items-center justify-center gap-1.5"
                    >
                      <Instagram className="w-3.5 h-3.5 text-[#D946EF]" />
                      <span>Instagram DM</span>
                    </a>
                    <a
                      href={`https://wa.me/${config.whatsappRaw}?text=Hola%20Rodrigo!%20Vi%20la%20foto%20"${encodeURIComponent(
                        activeLightboxItem.title
                      )}"%20en%20tu%20galer%C3%ADa%20y%20te%20quer%C3%ADa%20consultar`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl bg-[#151828] border border-[#2C314A] hover:border-[#FF4655] text-zinc-200 hover:text-white font-mono text-[11px] font-bold flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#FF4655]" />
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
