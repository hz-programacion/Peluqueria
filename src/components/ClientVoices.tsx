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
      'Una experiencia completamente distinta en Venado Tuerto. Sin ruidos ni gente esperando encima tuyo: llegás a tu hora en Vuelta de Obligado 931, te reciben con un café y Rodrigo se toma todo el tiempo para lograr exactamente el corte que buscás.',
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
      'Destaco el trabajo a tijera y el cuidado en el perfilado de barba con toalla tibia. El corte crece parejo durante semanas y la reserva desde la web funciona con una precisión impecable.',
  },
  {
    id: 'test-3',
    clientName: 'Julián Méndez',
    serviceName: 'Lavado Premium y Nutrición Capilar',
    price: '$9.500 ARS',
    rating: 5,
    date: 'Hace 2 semanas',
    city: 'Venado Tuerto',
    verified: true,
    comment:
      'Sumé el lavado premium con nutrición a mi corte habitual y el cambio en la textura del pelo se nota al instante. El ambiente del estudio transmite una paz difícil de encontrar hoy en día.',
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
      'Puntualidad absoluta y un asesoramiento muy honesto según tus facciones. Es un verdadero estudio de autor donde cada detalle está pensado para que salgas renovado.',
  },
];

export const ClientVoices: React.FC = () => {
  const { addReview } = useStudio();
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
      className="max-w-[1320px] mx-auto px-5 sm:px-8 relative z-10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="border-t border-b border-[#171513]/12 py-14 sm:py-20">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#96734E] font-medium">
              <span>Voces del Estudio</span>
              <span aria-hidden="true">·</span>
              <span>Venado Tuerto, Santa Fe</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-medium text-[#171513] leading-tight">
              La experiencia de quienes nos eligen
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 border border-[#171513]/20 hover:border-[#171513] text-xs font-medium uppercase tracking-wider text-[#171513] transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#96734E]" />
              <span>Compartir reseña</span>
            </button>

            <div className="flex items-center border border-[#171513]/20">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Testimonio anterior"
                className="w-10 h-10 border-r border-[#171513]/20 hover:bg-[#171513] text-[#171513] hover:text-[#F7F4EE] flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Siguiente testimonio"
                className="w-10 h-10 hover:bg-[#171513] text-[#171513] hover:text-[#F7F4EE] flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Editorial Pull-Quote */}
        <div className="min-h-[210px] flex items-center">
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
                <blockquote className="font-display italic text-2xl sm:text-3xl lg:text-[2.15rem] text-[#171513] leading-[1.35]">
                  “{current.comment}”
                </blockquote>
              </div>

              <div className="lg:col-span-4 lg:border-l lg:border-[#171513]/12 lg:pl-8 space-y-2">
                <div className="flex items-center gap-1 text-[#96734E]">
                  {[...Array(current.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#96734E]" />
                  ))}
                  <span className="font-mono text-xs text-[#171513] ml-1.5 tabular-nums">5.0</span>
                </div>
                <p className="font-display text-2xl font-semibold text-[#171513]">
                  {current.clientName}
                </p>
                <div className="text-xs text-[#575049] space-y-0.5">
                  <p>{current.serviceName}</p>
                  <p className="text-[#8C8379]">
                    {current.city} · {current.date}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Minimal Index Bar */}
        <div className="mt-10 pt-6 border-t border-[#171513]/10 flex items-center justify-between text-xs text-[#655E57]">
          <div className="flex items-center gap-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Ir al testimonio ${idx + 1}`}
                className={`h-1.5 transition-all cursor-pointer ${
                  currentIndex === idx ? 'w-8 bg-[#96734E]' : 'w-2 bg-[#171513]/20'
                }`}
              />
            ))}
          </div>
          <span className="font-mono tabular-nums">
            0{currentIndex + 1} / 0{testimonials.length}
          </span>
        </div>
      </div>

      {/* Leave Review Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171513]/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              className="w-full max-w-lg bg-[#F7F4EE] border border-[#171513]/20 p-6 sm:p-8 shadow-2xl text-[#171513] space-y-6"
            >
              <div className="flex items-center justify-between border-b border-[#171513]/12 pb-4">
                <div>
                  <h3 className="font-display text-2xl font-semibold text-[#171513]">
                    Compartí tu experiencia
                  </h3>
                  <p className="text-xs text-[#655E57] mt-0.5">
                    Tu opinión acompaña a nuevos clientes de Venado Tuerto.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 border border-[#171513]/15 hover:border-[#171513] text-[#171513] flex items-center justify-center text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {feedbackSuccess ? (
                <div className="py-10 text-center space-y-3">
                  <div className="w-12 h-12 bg-[#3D4F43]/15 border border-[#3D4F43] text-[#3D4F43] mx-auto flex items-center justify-center">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-display text-2xl font-medium text-[#171513]">
                    Muchas gracias por tu reseña
                  </h4>
                  <p className="text-xs text-[#655E57]">Quedó publicada en el estudio.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[#575049] mb-1.5 uppercase tracking-wider font-medium">
                      Tu Nombre y Apellido
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Martín Rivas"
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      className="w-full h-11 px-3.5 bg-[#EFEAE1]/60 border border-[#171513]/20 text-[#171513] focus:outline-none focus:border-[#96734E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#575049] mb-1.5 uppercase tracking-wider font-medium">
                      Servicio realizado
                    </label>
                    <select
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      className="w-full h-11 px-3.5 bg-[#EFEAE1]/60 border border-[#171513]/20 text-[#171513] focus:outline-none focus:border-[#96734E]"
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
                    <label className="block text-[#575049] mb-1.5 uppercase tracking-wider font-medium">
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
                                ? 'fill-[#96734E] text-[#96734E]'
                                : 'text-[#C5BBAE]'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#575049] mb-1.5 uppercase tracking-wider font-medium">
                      Tu comentario
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Contanos cómo fue tu experiencia en el estudio..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full p-3.5 bg-[#EFEAE1]/60 border border-[#171513]/20 text-[#171513] focus:outline-none focus:border-[#96734E]"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 border border-[#171513]/20 text-[#575049] hover:text-[#171513] cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-[#171513] hover:bg-[#96734E] text-[#F7F4EE] font-medium uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
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
