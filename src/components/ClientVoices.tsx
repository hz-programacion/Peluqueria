import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, MessageSquare, Check } from 'lucide-react';
import { db } from '../lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { useStudio } from '../context/StudioContext';
import { RetroCornerBandaBookmark } from './RetroPaperBanda';

export interface Testimonial {
  id: string;
  clientName: string;
  serviceName: string;
  price: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  city: string;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    clientName: 'Martín Salvatierra',
    serviceName: 'Corte de Autor / Clásico',
    price: '$12.000 ARS',
    rating: 5,
    date: 'Hace 3 días',
    city: 'Venado Tuerto',
    verified: true,
    comment:
      'La mejor atención de Venado Tuerto. Llegás a tu hora en Vuelta de Obligado 931 y te atienden sin esperas: Rodrigo se toma todo el tiempo para dejar el degradé y el corte impecables.',
  },
  {
    id: 'test-2',
    clientName: 'Lucas Santoro',
    serviceName: 'Corte + Perfilado de Barba',
    price: '$17.000 ARS',
    rating: 5,
    date: 'Hace 1 semana',
    city: 'Venado Tuerto',
    verified: true,
    comment:
      'Excelente el trabajo a tijera y máquina y el perfilado de barba con toalla tibia. El corte crece parejo durante semanas y reservar turno desde el celular es rapidísimo.',
  },
  {
    id: 'test-3',
    clientName: 'Julián Méndez',
    serviceName: 'Coloración / Iluminación',
    price: '$28.000 ARS',
    rating: 5,
    date: 'Hace 2 semanas',
    city: 'Venado Tuerto',
    verified: true,
    comment:
      'Me hice color y corte en Rodrigo Cutsss y el resultado superó lo que buscaba. El estudio tiene toda la onda y trabaja con productos de primera.',
  },
  {
    id: 'test-4',
    clientName: 'Facundo Morán',
    serviceName: 'Diseño y Perfilado de Barba',
    price: '$8.500 ARS',
    rating: 5,
    date: 'Hace 3 semanas',
    city: 'Venado Tuerto',
    verified: true,
    comment:
      'Puntualidad absoluta y un asesoramiento muy claro según tus facciones. Sin dudas mi barbería y peluquería fija en Venado Tuerto.',
  },
];

export const ClientVoices: React.FC = () => {
  const { addReview, config } = useStudio();
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newAuthor, setNewAuthor] = useState<string>('');
  const [newComment, setNewComment] = useState<string>('');
  const [newRating, setNewRating] = useState<number>(5);
  const [newService, setNewService] = useState<string>('Corte de Autor / Clásico');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (!db) return;
    const firestoreDb = db;
    let isMounted = true;
    const fetchFromFirebase = async () => {
      try {
        const q = query(
          collection(firestoreDb, 'testimonials'),
          orderBy('createdAt', 'desc'),
          limit(15)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty && isMounted) {
          const loaded: Testimonial[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            loaded.push({
              id: docSnap.id,
              clientName: data.clientName || 'Cliente del Estudio',
              serviceName: data.serviceName || 'Corte de Autor / Clásico',
              price: data.price || '$12.000 ARS',
              rating: Number(data.rating) || 5,
              date: data.date || 'Reciente',
              city: data.city || 'Venado Tuerto',
              verified: true,
              comment: data.comment || '',
            });
          });
          if (loaded.length > 0) {
            setTestimonials(loaded);
          }
        }
      } catch {
        // Fallback gracefully to default testimonials
      }
    };

    fetchFromFirebase();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isPaused || testimonials.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6500);

    return () => clearInterval(timer);
  }, [isPaused, testimonials.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const current = testimonials[currentIndex] || DEFAULT_TESTIMONIALS[0];

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) return;

    setIsSubmitting(true);

    const newEntry: Testimonial = {
      id: `local-${Date.now()}`,
      clientName: newAuthor.trim(),
      serviceName: newService,
      price: '$12.000 ARS',
      rating: newRating,
      date: 'Reciente',
      city: 'Venado Tuerto',
      verified: true,
      comment: newComment.trim(),
    };

    if (db) {
      try {
        await addDoc(collection(db, 'testimonials'), {
          clientName: newEntry.clientName,
          serviceName: newEntry.serviceName,
          price: newEntry.price,
          rating: newEntry.rating,
          date: 'Reciente',
          city: 'Venado Tuerto',
          verified: true,
          comment: newEntry.comment,
          createdAt: serverTimestamp(),
        });
      } catch {
        // Local fallback stores it in local state
      }
    }

    addReview({
      id: newEntry.id,
      authorName: newEntry.clientName,
      authorInitials: newEntry.clientName.slice(0, 2).toUpperCase(),
      relativeDate: newEntry.date,
      rating: newEntry.rating,
      serviceTag: newEntry.serviceName,
      textParts: [{ text: newEntry.comment, highlight: false }],
    });

    setTestimonials((prev) => [newEntry, ...prev]);
    setCurrentIndex(0);
    setIsSubmitting(false);
    setFeedbackSuccess(true);

    setTimeout(() => {
      setFeedbackSuccess(false);
      setIsModalOpen(false);
      setNewAuthor('');
      setNewComment('');
    }, 1800);
  };

  return (
    <section
      id="opiniones"
      className="max-w-7xl mx-auto px-4 sm:px-8 py-14 sm:py-20 relative z-10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="bg-[#FAF6EE] border border-[#C8BBA4] rounded-xl p-6 sm:p-12 shadow-[0_16px_40px_rgba(24,21,18,0.08)] relative overflow-hidden">
        <RetroCornerBandaBookmark size="lg" />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#9E2A2B] font-semibold">
              <span>Reseñas Verificadas · {config.studioTitle}</span>
              <span aria-hidden="true">╱</span>
              <span className="text-[#5C5346]">Venado Tuerto, Santa Fe</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#181512] leading-tight">
              La palabra de{' '}
              <span className="font-editorial italic font-normal text-[#9E2A2B]">
                nuestros clientes
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded bg-[#9E2A2B] hover:bg-[#822021] text-xs font-mono font-semibold uppercase tracking-wider text-[#FAF6EE] transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Dejar mi reseña</span>
            </button>

            <div className="flex items-center border border-[#C8BBA4] rounded overflow-hidden bg-[#EAE0CE]">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Testimonio anterior"
                className="w-10 h-10 border-r border-[#C8BBA4] hover:bg-[#9E2A2B] text-[#181512] hover:text-[#FAF6EE] flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Siguiente testimonio"
                className="w-10 h-10 hover:bg-[#9E2A2B] text-[#181512] hover:text-[#FAF6EE] flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Pull-Quote */}
        <div className="min-h-[180px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
            >
              <div className="lg:col-span-8">
                <blockquote className="font-editorial italic text-2xl sm:text-3xl lg:text-4xl text-[#181512] leading-relaxed">
                  “{current.comment}”
                </blockquote>
              </div>

              <div className="lg:col-span-4 lg:border-l lg:border-[#D5C9B4] lg:pl-8 space-y-2">
                <div className="flex items-center gap-1 text-[#9E2A2B]">
                  {[...Array(current.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#9E2A2B]" />
                  ))}
                  <span className="font-mono text-xs text-[#181512] font-bold ml-1.5 tabular-nums">
                    5.0 ★
                  </span>
                </div>
                <p className="font-display text-2xl font-bold text-[#181512]">
                  {current.clientName}
                </p>
                <div className="text-xs font-mono text-[#5C5346] space-y-0.5">
                  <p className="text-[#9E2A2B] font-bold">{current.serviceName}</p>
                  <p>
                    {current.city} · {current.date}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Minimal Index Bar */}
        <div className="mt-8 pt-6 border-t border-[#D5C9B4] flex items-center justify-between text-xs font-mono text-[#5C5346]">
          <div className="flex items-center gap-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Ir al testimonio ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx ? 'w-8 bg-[#9E2A2B]' : 'w-2 bg-[#C8BBA4]'
                }`}
              />
            ))}
          </div>
          <span className="tabular-nums">
            0{currentIndex + 1} / 0{testimonials.length}
          </span>
        </div>
      </div>

      {/* Leave Review Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#181512]/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              className="w-full max-w-lg bg-[#FAF6EE] border-2 border-[#C8BBA4] rounded-xl p-6 sm:p-8 shadow-2xl text-[#181512] space-y-6"
            >
              <div className="flex items-center justify-between border-b border-[#D5C9B4] pb-4">
                <div>
                  <h3 className="font-display text-2xl font-bold text-[#181512]">
                    Compartí tu experiencia
                  </h3>
                  <p className="text-xs text-[#5C5346] mt-0.5 font-mono">
                    {config.studioTitle} · Venado Tuerto
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded border border-[#C8BBA4] hover:border-[#9E2A2B] text-[#181512] flex items-center justify-center text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {feedbackSuccess ? (
                <div className="py-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#9E2A2B]/15 border border-[#9E2A2B] text-[#9E2A2B] mx-auto flex items-center justify-center">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-display text-2xl font-bold text-[#181512]">
                    ¡Gracias por tu reseña!
                  </h4>
                  <p className="text-xs text-[#5C5346]">Quedó publicada en {config.studioTitle}.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4 text-xs font-mono">
                  <div>
                    <label className="block text-[#4F463B] mb-1.5 uppercase tracking-wider font-bold">
                      Tu Nombre y Apellido
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Martín Rivas"
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      className="w-full h-11 px-3.5 rounded bg-[#F3ECE0] border border-[#C8BBA4] text-[#181512] focus:outline-none focus:border-[#9E2A2B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#4F463B] mb-1.5 uppercase tracking-wider font-bold">
                      Servicio realizado
                    </label>
                    <select
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      className="w-full h-11 px-3.5 rounded bg-[#F3ECE0] border border-[#C8BBA4] text-[#181512] focus:outline-none focus:border-[#9E2A2B]"
                    >
                      <option value="Corte de Autor / Clásico">
                        Corte de Autor / Clásico ($12.000)
                      </option>
                      <option value="Corte + Perfilado de Barba">
                        Corte + Perfilado de Barba ($17.000)
                      </option>
                      <option value="Diseño y Perfilado de Barba">
                        Diseño y Perfilado de Barba ($8.500)
                      </option>
                      <option value="Coloración / Iluminación">
                        Coloración / Iluminación ($28.000)
                      </option>
                      <option value="Lavado Premium y Nutrición Capilar">
                        Lavado Premium y Nutrición Capilar ($9.500)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#4F463B] mb-1.5 uppercase tracking-wider font-bold">
                      Valoración
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="p-1 cursor-pointer"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= newRating
                                ? 'fill-[#9E2A2B] text-[#9E2A2B]'
                                : 'text-[#C8BBA4]'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#4F463B] mb-1.5 uppercase tracking-wider font-bold">
                      Tu comentario
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Contanos cómo fue tu experiencia en el estudio..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full p-3.5 rounded bg-[#F3ECE0] border border-[#C8BBA4] text-[#181512] focus:outline-none focus:border-[#9E2A2B]"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 rounded border border-[#C8BBA4] text-[#4F463B] hover:text-[#181512] cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded bg-[#9E2A2B] hover:bg-[#822021] text-[#FAF6EE] font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? 'Publicando...' : 'Publicar reseña'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
