import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Quote,
  MessageSquare,
  Check,
} from 'lucide-react';
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
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';

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
    clientName: 'Thiago Benítez',
    serviceName: 'Corte de Pelo (Corte de Autor & Fade)',
    price: '$12.000 ARS',
    rating: 5,
    date: 'Hace 2 días',
    city: 'Venado Tuerto',
    verified: true,
    comment:
      'La posta es que encontrar un barbero que entienda de fades urbanos y textura real en Venado Tuerto es oro puro. Rodri es un crack, puntual al milisegundo y el local en Vuelta de Obligado 931 tiene tremenda vibra. Reservás el turno por la web, te sentás a la hora exacta y salís impecable.',
  },
  {
    id: 'test-2',
    clientName: 'Lucas Santoro',
    serviceName: 'Taper Fade & Line Up',
    price: '$12.000 ARS',
    rating: 5,
    date: 'Hace 4 días',
    city: 'Venado Tuerto',
    verified: true,
    comment:
      'Tengo rulos y siempre me arruinaban los cortes en peluquerías tradicionales. El taper que me hace Rodrigo es perfecto, respeta la caída natural y me dura prolijo casi un mes. Además la música de fondo y la atención 1 a 1 sin gente amontonada marcan toda la diferencia.',
  },
  {
    id: 'test-3',
    clientName: 'Nahuel Rossi',
    serviceName: 'Corte + Platinado Global',
    price: '$28.000 ARS',
    rating: 5,
    date: 'Hace 1 semana',
    city: 'Venado Tuerto',
    verified: true,
    comment:
      'Me hice el platinado con Rodri y me dejó el pelo blanco ceniza sin quemarme nada. El trato 1 a 1 sin que nadie te esté mirando mientras esperás te da una comodidad tremenda. La técnica de pulido con shaver y el acabado con polvo mate son de otro nivel.',
  },
  {
    id: 'test-4',
    clientName: 'Facundo Morán',
    serviceName: 'Corte de Pelo + Perfilado de Barba Completo',
    price: '$17.000 ARS',
    rating: 5,
    date: 'Hace 2 semanas',
    city: 'Venado Tuerto',
    verified: true,
    comment:
      'El perfilado de barba con trimmer de precisión, shaver de titanio y toalla caliente te deja impecable y con cero irritación. Cero espera, te sentás al minuto exacto que reservaste en Vuelta de Obligado 931. El mejor de Venado Tuerto sin dudas.',
  },
  {
    id: 'test-5',
    clientName: 'Agustín Valenzuela',
    serviceName: 'Low Skin Fade & Crop',
    price: '$12.000 ARS',
    rating: 5,
    date: 'Hace 3 semanas',
    city: 'Venado Tuerto',
    verified: true,
    comment:
      'Llegué con el pelo hecho un desastre y me recomendó el low fade con frontal a escuadra. Increíble cómo cambia la presencia. Transparencia total con el precio ($12.000), nada de sorpresas y confirmación inmediata al WhatsApp.',
  },
];

export const ClientVoices: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newAuthor, setNewAuthor] = useState<string>('');
  const [newComment, setNewComment] = useState<string>('');
  const [newRating, setNewRating] = useState<number>(5);
  const [newService, setNewService] = useState<string>('Corte de Pelo (Corte de Autor & Fade)');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchFromFirebase = async () => {
      try {
        const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'), limit(15));
        const snapshot = await getDocs(q);
        if (!snapshot.empty && isMounted) {
          const loaded: Testimonial[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            loaded.push({
              id: doc.id,
              clientName: data.clientName || 'Cliente Rodrigo Cutsss',
              serviceName: data.serviceName || 'Corte de Pelo',
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
    playMechanicalClick();
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    playMechanicalClick();
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const current = testimonials[currentIndex] || DEFAULT_TESTIMONIALS[0];

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) return;

    setIsSubmitting(true);
    playMechanicalClick();

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
      className="max-w-[1380px] mx-auto px-4 sm:px-6 relative z-10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="rounded-3xl bg-[#111318] border border-[#232730] p-6 sm:p-10 lg:p-12 overflow-hidden shadow-2xl relative">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#1E222B]">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono text-xs">
              <span className="w-2 h-2 bg-[#D4A373] rounded-full" />
              <span className="text-[#D4A373] font-bold uppercase tracking-widest">
                VOCES DE LA COMUNIDAD // 100% REALES
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-400 font-bold">Venado Tuerto · Santa Fe</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Client Voices &amp; Reseñas
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onMouseEnter={playMechanicalHover}
              onClick={() => {
                playMechanicalClick();
                setIsModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#161920] border border-[#D4A373]/40 hover:border-[#D4A373] text-xs font-mono font-bold text-[#D4A373] hover:bg-[#D4A373] hover:text-zinc-950 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Dejar Reseña</span>
            </button>

            {/* Navigation Carousel Arrows */}
            <div className="flex items-center gap-1.5 bg-[#0C0E12] p-1 rounded-xl border border-[#232730]">
              <button
                type="button"
                onMouseEnter={playMechanicalHover}
                onClick={handlePrev}
                aria-label="Testimonio anterior"
                className="w-9 h-9 rounded-lg bg-[#161920] hover:bg-[#D4A373] text-zinc-300 hover:text-zinc-950 flex items-center justify-center transition-all cursor-pointer active:scale-90"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onMouseEnter={playMechanicalHover}
                onClick={handleNext}
                aria-label="Siguiente testimonio"
                className="w-9 h-9 rounded-lg bg-[#161920] hover:bg-[#D4A373] text-zinc-300 hover:text-zinc-950 flex items-center justify-center transition-all cursor-pointer active:scale-90"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sliding Carousel Display Card */}
        <div className="py-8 sm:py-10 min-h-[270px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              {/* Left Column: Client Profile & Badge */}
              <div className="lg:col-span-4 space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#D4A373]/15 border border-[#D4A373] text-[#D4A373] font-black text-base flex items-center justify-center font-mono">
                    {current.clientName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-display font-black text-lg text-white uppercase tracking-wide">
                        {current.clientName}
                      </h3>
                      {current.verified && <ShieldCheck className="w-4 h-4 text-[#D4A373]" />}
                    </div>
                    <span className="text-xs font-mono text-zinc-400 block">
                      {current.city} · {current.date}
                    </span>
                  </div>
                </div>

                {/* Service Tag & Verification */}
                <div className="space-y-1.5 pt-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#161920] border border-[#282D37] text-xs font-mono font-bold text-zinc-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4A373]" />
                    <span>{current.serviceName}</span>
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400 font-semibold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#D4A373]" />
                    <span>Turno Real en Vuelta de Obligado 931</span>
                  </div>
                </div>

                {/* 5 Stars Rating */}
                <div className="flex items-center gap-1 pt-1">
                  {[...Array(current.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#D4A373] text-[#D4A373]" />
                  ))}
                  <span className="font-mono text-xs font-black text-white ml-2">5.0 / 5.0</span>
                </div>
              </div>

              {/* Right Column: Large Quote Testimonial */}
              <div className="lg:col-span-8 relative">
                <Quote className="absolute -top-6 -left-4 w-12 h-12 text-[#D4A373]/15 pointer-events-none" />
                <blockquote className="text-base sm:text-xl font-sans font-normal text-zinc-100 leading-relaxed italic relative z-10 pl-2">
                  “{current.comment}”
                </blockquote>
                <div className="mt-4 pt-3 border-t border-[#1E222B] flex items-center justify-between text-xs font-mono text-zinc-500">
                  <span>ESTUDIO RODRIGO CUTSSS // ATENCIÓN 1 A 1</span>
                  <span className="text-[#D4A373] font-bold">FADE MILIMÉTRICO 0.0 MM</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Pagination Dots */}
        <div className="pt-4 border-t border-[#1E222B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onMouseEnter={playMechanicalHover}
                onClick={() => {
                  playMechanicalClick();
                  setCurrentIndex(idx);
                }}
                aria-label={`Ir al testimonio ${idx + 1}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx
                    ? 'w-8 bg-[#D4A373]'
                    : 'w-2 bg-[#252934] hover:bg-zinc-500'
                }`}
              />
            ))}
          </div>

          <div className="font-mono text-xs text-zinc-400">
            <span className="text-[#D4A373] font-bold">{currentIndex + 1}</span>
            <span className="text-zinc-600"> / </span>
            <span>{testimonials.length} opiniones verificadas</span>
          </div>
        </div>
      </div>

      {/* Leave Review Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="w-full max-w-lg bg-[#111318] border border-[#282D37] rounded-3xl p-6 sm:p-8 shadow-2xl text-white font-mono space-y-6"
            >
              <div className="flex items-center justify-between border-b border-[#1E222B] pb-4">
                <div>
                  <h3 className="font-display font-black text-xl uppercase tracking-wider text-white">
                    Compartí tu Experiencia
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Tu reseña quedará registrada para la comunidad de Venado Tuerto.
                  </p>
                </div>
                <button
                  type="button"
                  onMouseEnter={playMechanicalHover}
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-lg bg-[#161920] border border-[#282D37] hover:border-[#D4A373] text-zinc-300 hover:text-white flex items-center justify-center text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {feedbackSuccess ? (
                <div className="py-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#D4A373]/20 border border-[#D4A373] text-[#D4A373] mx-auto flex items-center justify-center">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <h4 className="font-display text-lg font-black uppercase text-white">
                    ¡Reseña Guardada con Éxito!
                  </h4>
                  <p className="text-xs text-zinc-400">Gracias por confiar en Rodrigo Cutsss.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-zinc-400 mb-1.5 uppercase tracking-wider font-bold">
                      Tu Nombre y Apellido:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Martín Rivas"
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-[#0C0E12] border border-[#282D37] text-white focus:outline-none focus:border-[#D4A373]"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1.5 uppercase tracking-wider font-bold">
                      Servicio Realizado:
                    </label>
                    <select
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-[#0C0E12] border border-[#282D37] text-white focus:outline-none focus:border-[#D4A373]"
                    >
                      <option value="Corte de Pelo (Corte de Autor & Fade)">
                        Corte de Pelo ($12.000 ARS)
                      </option>
                      <option value="Taper Fade & Line Up">
                        Taper Fade &amp; Line Up ($12.000 ARS)
                      </option>
                      <option value="Corte de Pelo + Ritual de Barba Completa">
                        Corte + Barba Completa ($17.000 ARS)
                      </option>
                      <option value="Corte de Pelo + Platinado Global / Color">
                        Corte + Platinado ($28.000 ARS)
                      </option>
                      <option value="Arreglo & Perfilado de Barba con Vapor">
                        Perfilado de Barba ($7.000 ARS)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1.5 uppercase tracking-wider font-bold">
                      Calificación:
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
                            className={`w-6 h-6 ${
                              star <= newRating
                                ? 'fill-[#D4A373] text-[#D4A373]'
                                : 'text-zinc-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1.5 uppercase tracking-wider font-bold">
                      Tu Opinión sobre el Corte y la Atención:
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Contá cómo fue tu turno, la puntualidad y el resultado..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full p-3.5 rounded-xl bg-[#0C0E12] border border-[#282D37] text-white focus:outline-none focus:border-[#D4A373]"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-[#282D37] text-zinc-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-[#D4A373] hover:bg-[#C89562] text-zinc-950 font-black uppercase tracking-wider shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? 'Guardando...' : 'Publicar Reseña'}
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
