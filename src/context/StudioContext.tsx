import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  StudioService,
  LookbookItem,
  GoogleReview,
  AppointmentRecord,
  StudioGalleryItem,
  STUDIO_SERVICES,
  LOOKBOOK_ITEMS,
  GOOGLE_REVIEWS,
  STUDIO_GALLERY_ITEMS,
} from '../data/studioData';
import { StudioConfig, INITIAL_STUDIO_CONFIG, INITIAL_APPOINTMENTS_STORE, INITIAL_BLOCKED_SLOTS } from '../data/studioStore';
import { db } from '../lib/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';

export interface BlockedSlot {
  id: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  reason: string;
}

export type AppPage = 'home' | 'services' | 'lookbook' | 'experience' | 'booking' | 'location' | 'admin';

interface StudioContextType {
  config: StudioConfig;
  updateConfig: (partial: Partial<StudioConfig>) => void;
  resetConfig: () => void;
  services: StudioService[];
  addService: (service: StudioService) => void;
  updateService: (id: string, service: Partial<StudioService>) => void;
  deleteService: (id: string) => void;
  galleryItems: StudioGalleryItem[];
  addGalleryItem: (item: StudioGalleryItem) => Promise<void>;
  deleteGalleryItem: (id: string) => Promise<void>;
  toggleLikeGalleryItem: (id: string) => void;
  likedGalleryIds: Record<string, boolean>;
  lookbook: LookbookItem[];
  addLookbookItem: (item: LookbookItem) => void;
  updateLookbookItem: (id: string, item: Partial<LookbookItem>) => void;
  deleteLookbookItem: (id: string) => void;
  reviews: GoogleReview[];
  addReview: (review: GoogleReview) => void;
  deleteReview: (id: string) => void;
  appointments: AppointmentRecord[];
  addAppointment: (appointment: AppointmentRecord) => void;
  updateAppointmentStatus: (id: string, status: 'confirmed' | 'completed') => void;
  cancelAppointment: (id: string) => void;
  blockedSlots: BlockedSlot[];
  addBlockedSlot: (slot: BlockedSlot) => void;
  deleteBlockedSlot: (id: string) => void;
  isAdminAuthenticated: boolean;
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  currentPage: AppPage;
  navigateTo: (page: AppPage, sectionId?: string) => void;
  selectedServiceIds: string[];
  toggleSelectService: (id: string) => void;
  setSelectedServiceIds: React.Dispatch<React.SetStateAction<string[]>>;
  isDark: boolean;
  setIsDark: React.Dispatch<React.SetStateAction<boolean>>;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

const ADMIN_PIN = '1234';

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<AppPage>(() => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    if (['home', 'services', 'lookbook', 'experience', 'booking', 'location', 'admin'].includes(hash)) {
      return hash as AppPage;
    }
    return 'home';
  });

  const [isDark, setIsDark] = useState<boolean>(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('vm_admin_auth') === 'true';
  });

  const [config, setConfig] = useState<StudioConfig>(() => {
    try {
      const saved = localStorage.getItem('vm_urban_v4_config');
      if (saved) return JSON.parse(saved);
    } catch { /* fallback */ }
    return INITIAL_STUDIO_CONFIG;
  });

  const [services, setServices] = useState<StudioService[]>(() => {
    try {
      const saved = localStorage.getItem('vm_urban_v4_services');
      if (saved) return JSON.parse(saved);
    } catch { /* fallback */ }
    return STUDIO_SERVICES;
  });

  const [galleryItems, setGalleryItems] = useState<StudioGalleryItem[]>(() => {
    try {
      const saved = localStorage.getItem('vm_urban_v4_gallery');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { /* fallback */ }
    return STUDIO_GALLERY_ITEMS;
  });

  const [likedGalleryIds, setLikedGalleryIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('vm_urban_v4_gallery_likes');
      if (saved) return JSON.parse(saved);
    } catch { /* fallback */ }
    return {};
  });

  const [lookbook, setLookbook] = useState<LookbookItem[]>(() => {
    try {
      const saved = localStorage.getItem('vm_urban_v4_lookbook');
      if (saved) return JSON.parse(saved);
    } catch { /* fallback */ }
    return LOOKBOOK_ITEMS;
  });

  const [reviews, setReviews] = useState<GoogleReview[]>(() => {
    try {
      const saved = localStorage.getItem('vm_urban_v4_reviews');
      if (saved) return JSON.parse(saved);
    } catch { /* fallback */ }
    return GOOGLE_REVIEWS;
  });

  const [appointments, setAppointments] = useState<AppointmentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('vm_urban_v4_appointments');
      if (saved) return JSON.parse(saved);
    } catch { /* fallback */ }
    return INITIAL_APPOINTMENTS_STORE;
  });

  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>(() => {
    try {
      const saved = localStorage.getItem('vm_urban_v4_blocked_slots');
      if (saved) return JSON.parse(saved);
    } catch { /* fallback */ }
    return INITIAL_BLOCKED_SLOTS;
  });

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(['srv-mid-fade-crop']);

  // Sync with Firestore studio_gallery collection if available
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      const q = query(collection(db, 'studio_gallery'), orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteItems: StudioGalleryItem[] = snapshot.docs.map((d) => {
              const data = d.data();
              return {
                id: d.id,
                title: data.title || 'Trabajo en el Estudio',
                category: data.category || 'Cortes & Fades',
                imageUrl: data.imageUrl || '/src/assets/images/urban_streetwear_haircut_1793930882291.jpg',
                description: data.description || '',
                dateLabel: data.dateLabel || 'Reciente',
                tags: Array.isArray(data.tags) ? data.tags : ['#RodrigoCutsss', '#VenadoTuerto'],
                technicalSpec: data.technicalSpec,
                serviceId: data.serviceId,
                priceLabel: data.priceLabel,
                likes: typeof data.likes === 'number' ? data.likes : 42,
                featured: !!data.featured,
              };
            });

            setGalleryItems((prev) => {
              const remoteIds = new Set(remoteItems.map((r) => r.id));
              const localSeed = prev.filter((item) => !remoteIds.has(item.id));
              return [...remoteItems, ...localSeed];
            });
          }
        },
        () => {
          // Graceful fallback to local storage if Firestore rules restrict read
        }
      );
    } catch {
      // Offline / local fallback
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('vm_urban_v4_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('vm_urban_v4_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    try {
      localStorage.setItem('vm_urban_v4_gallery', JSON.stringify(galleryItems));
    } catch {
      // Handle storage quota gracefully
    }
  }, [galleryItems]);

  useEffect(() => {
    localStorage.setItem('vm_urban_v4_gallery_likes', JSON.stringify(likedGalleryIds));
  }, [likedGalleryIds]);

  useEffect(() => {
    localStorage.setItem('vm_urban_v4_lookbook', JSON.stringify(lookbook));
  }, [lookbook]);

  useEffect(() => {
    localStorage.setItem('vm_urban_v4_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('vm_urban_v4_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('vm_urban_v4_blocked_slots', JSON.stringify(blockedSlots));
  }, [blockedSlots]);

  // Dark mode effect
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  // History & Section Navigation sync
  const navigateTo = (page: AppPage, sectionId?: string) => {
    setCurrentPage(page);
    window.location.hash = `#/${page}`;
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 80);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (['home', 'services', 'lookbook', 'experience', 'booking', 'location', 'admin'].includes(hash)) {
        setCurrentPage(hash as AppPage);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const loginAdmin = (pin: string): boolean => {
    if (pin.trim() === ADMIN_PIN) {
      setIsAdminAuthenticated(true);
      localStorage.setItem('vm_admin_auth', 'true');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('vm_admin_auth');
  };

  const updateConfig = (partial: Partial<StudioConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  };

  const resetConfig = () => {
    setConfig(INITIAL_STUDIO_CONFIG);
  };

  const addService = (service: StudioService) => {
    setServices((prev) => [...prev, service]);
  };

  const updateService = (id: string, updated: Partial<StudioService>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    setSelectedServiceIds((prev) => prev.filter((sId) => sId !== id));
  };

  const addGalleryItem = async (item: StudioGalleryItem) => {
    setGalleryItems((prev) => [item, ...prev]);
    try {
      await addDoc(collection(db, 'studio_gallery'), {
        title: item.title,
        category: item.category,
        imageUrl: item.imageUrl,
        description: item.description,
        dateLabel: item.dateLabel,
        tags: item.tags,
        technicalSpec: item.technicalSpec || '',
        serviceId: item.serviceId || '',
        priceLabel: item.priceLabel || '',
        likes: item.likes || 1,
        featured: !!item.featured,
        createdAt: serverTimestamp(),
      });
    } catch {
      // Already saved in local state & localStorage
    }
  };

  const deleteGalleryItem = async (id: string) => {
    setGalleryItems((prev) => prev.filter((item) => item.id !== id));
    try {
      await deleteDoc(doc(db, 'studio_gallery', id));
    } catch {
      // Handled locally
    }
  };

  const toggleLikeGalleryItem = (id: string) => {
    setLikedGalleryIds((prev) => {
      const isLiked = !!prev[id];
      const next = { ...prev, [id]: !isLiked };
      setGalleryItems((items) =>
        items.map((item) =>
          item.id === id
            ? { ...item, likes: Math.max(0, item.likes + (isLiked ? -1 : 1)) }
            : item
        )
      );
      return next;
    });
  };

  const addLookbookItem = (item: LookbookItem) => {
    setLookbook((prev) => [item, ...prev]);
  };

  const updateLookbookItem = (id: string, updated: Partial<LookbookItem>) => {
    setLookbook((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)));
  };

  const deleteLookbookItem = (id: string) => {
    setLookbook((prev) => prev.filter((item) => item.id !== id));
  };

  const addReview = (review: GoogleReview) => {
    setReviews((prev) => [review, ...prev]);
  };

  const deleteReview = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const addAppointment = (appointment: AppointmentRecord) => {
    setAppointments((prev) => [appointment, ...prev]);
  };

  const updateAppointmentStatus = (id: string, status: 'confirmed' | 'completed') => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const cancelAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  const addBlockedSlot = (slot: BlockedSlot) => {
    setBlockedSlots((prev) => [...prev, slot]);
  };

  const deleteBlockedSlot = (id: string) => {
    setBlockedSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleSelectService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <StudioContext.Provider
      value={{
        config,
        updateConfig,
        resetConfig,
        services,
        addService,
        updateService,
        deleteService,
        galleryItems,
        addGalleryItem,
        deleteGalleryItem,
        toggleLikeGalleryItem,
        likedGalleryIds,
        lookbook,
        addLookbookItem,
        updateLookbookItem,
        deleteLookbookItem,
        reviews,
        addReview,
        deleteReview,
        appointments,
        addAppointment,
        updateAppointmentStatus,
        cancelAppointment,
        blockedSlots,
        addBlockedSlot,
        deleteBlockedSlot,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        currentPage,
        navigateTo,
        selectedServiceIds,
        toggleSelectService,
        setSelectedServiceIds,
        isDark,
        setIsDark,
      }}
    >
      {children}
    </StudioContext.Provider>
  );
};

export const useStudio = () => {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return context;
};
