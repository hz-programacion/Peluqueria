import React, { createContext, useContext, useState, useEffect } from 'react';
import { StudioService, LookbookItem, GoogleReview, AppointmentRecord, STUDIO_SERVICES, LOOKBOOK_ITEMS, GOOGLE_REVIEWS } from '../data/studioData';
import { StudioConfig, INITIAL_STUDIO_CONFIG, INITIAL_APPOINTMENTS_STORE, INITIAL_BLOCKED_SLOTS } from '../data/studioStore';

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
  navigateTo: (page: AppPage) => void;
  selectedServiceIds: string[];
  toggleSelectService: (id: string) => void;
  setSelectedServiceIds: React.Dispatch<React.SetStateAction<string[]>>;
  isStyleFinderOpen: boolean;
  setIsStyleFinderOpen: (open: boolean) => void;
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

  const [isStyleFinderOpen, setIsStyleFinderOpen] = useState<boolean>(false);

  const [config, setConfig] = useState<StudioConfig>(() => {
    try {
      const saved = localStorage.getItem('vm_urban_v3_config');
      if (saved) return JSON.parse(saved);
    } catch { /* fallback */ }
    return INITIAL_STUDIO_CONFIG;
  });

  const [services, setServices] = useState<StudioService[]>(() => {
    try {
      const saved = localStorage.getItem('vm_urban_v3_services');
      if (saved) return JSON.parse(saved);
    } catch { /* fallback */ }
    return STUDIO_SERVICES;
  });

  const [lookbook, setLookbook] = useState<LookbookItem[]>(() => {
    try {
      const saved = localStorage.getItem('vm_urban_v3_lookbook');
      if (saved) return JSON.parse(saved);
    } catch { /* fallback */ }
    return LOOKBOOK_ITEMS;
  });

  const [reviews, setReviews] = useState<GoogleReview[]>(() => {
    try {
      const saved = localStorage.getItem('vm_urban_v3_reviews');
      if (saved) return JSON.parse(saved);
    } catch { /* fallback */ }
    return GOOGLE_REVIEWS;
  });

  const [appointments, setAppointments] = useState<AppointmentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('vm_urban_v3_appointments');
      if (saved) return JSON.parse(saved);
    } catch { /* fallback */ }
    return INITIAL_APPOINTMENTS_STORE;
  });

  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>(() => {
    try {
      const saved = localStorage.getItem('vm_urban_v3_blocked_slots');
      if (saved) return JSON.parse(saved);
    } catch { /* fallback */ }
    return INITIAL_BLOCKED_SLOTS;
  });

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(['srv-mid-fade-crop']);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('vm_urban_v3_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('vm_urban_v3_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('vm_urban_v3_lookbook', JSON.stringify(lookbook));
  }, [lookbook]);

  useEffect(() => {
    localStorage.setItem('vm_urban_v3_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('vm_urban_v3_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('vm_urban_v3_blocked_slots', JSON.stringify(blockedSlots));
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

  // History sync
  const navigateTo = (page: AppPage) => {
    setCurrentPage(page);
    window.location.hash = `#/${page}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        isStyleFinderOpen,
        setIsStyleFinderOpen,
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
