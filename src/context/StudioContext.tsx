import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  StudioService,
  LookbookItem,
  GoogleReview,
  AppointmentRecord,
  StudioGalleryItem,
  ClientFormulaNote,
  TransformationCaseRecord,
  STUDIO_SERVICES,
  LOOKBOOK_ITEMS,
  GOOGLE_REVIEWS,
  STUDIO_GALLERY_ITEMS,
  INITIAL_CLIENT_NOTES,
  INITIAL_TRANSFORMATION_CASES,
} from '../data/studioData';
import {
  StudioConfig,
  HomeSectionId,
  DEFAULT_SECTION_ORDER,
  INITIAL_STUDIO_CONFIG,
  INITIAL_APPOINTMENTS_STORE,
  INITIAL_BLOCKED_SLOTS,
} from '../data/studioStore';
import {
  db,
  isFirebaseConfigured,
  StudioUserProfile,
  signInStudioWithGoogle,
  signOutStudioUser,
  syncTransformationToFirestore,
  deleteTransformationFromFirestore,
  subscribeToFirestoreTransformations,
  syncCrmNoteToFirestore,
  deleteCrmNoteFromFirestore,
  subscribeToFirestoreCrmNotes,
  syncGalleryItemToFirestore,
  deleteGalleryItemFromFirestore,
} from '../services/firebase';
import {
  signInWithEmail,
  registerWithEmail,
  initPersistentAuthSession,
  logoutPersistentSession,
} from '../services/auth';
import {
  addAppointmentToDb,
  updateAppointmentInDb,
  deleteAppointmentFromDb,
  subscribeAppointmentsFromDb,
} from '../services/db';
import type { AppointmentStatus } from '../types/appointment';
import {
  collection,
  onSnapshot,
} from 'firebase/firestore';

export interface BlockedSlot {
  id: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  reason: string;
}

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  action: string;
  actor: 'client' | 'admin' | 'system';
  details: string;
}

export interface BackendMetricsSummary {
  todayISO: string;
  todayAppointmentsCount: number;
  totalConfirmedCount: number;
  totalCompletedCount: number;
  todayOccupancyPercentage: number;
  todayEstimatedRevenueARS: number;
  totalEstimatedRevenueARS: number;
  depositAppointmentsCount: number;
  commitmentAppointmentsCount: number;
  topServiceName: string;
  freeSlotsTodayCount: number;
  nextAvailableSlotLabel: string;
}

export type AppPage =
  | 'home'
  | 'services'
  | 'lookbook'
  | 'experience'
  | 'booking'
  | 'location'
  | 'admin'
  | 'voucher'
  | 'chair';

export interface CurtainTransitionState {
  id: number;
  label: string;
  subtitle: string;
}

export function normalizeSectionOrder(order?: HomeSectionId[]): HomeSectionId[] {
  if (!Array.isArray(order) || order.length === 0) {
    return [...DEFAULT_SECTION_ORDER];
  }
  const validSet = new Set(DEFAULT_SECTION_ORDER);
  const filtered = order.filter((id) => validSet.has(id));
  for (const id of DEFAULT_SECTION_ORDER) {
    if (!filtered.includes(id)) {
      filtered.push(id);
    }
  }
  return filtered;
}

interface StudioContextType {
  config: StudioConfig;
  updateConfig: (partial: Partial<StudioConfig>) => void;
  resetConfig: () => void;
  moveSectionInOrder: (sectionId: HomeSectionId, direction: 'up' | 'down') => void;
  services: StudioService[];
  addService: (service: StudioService) => void;
  updateService: (id: string, service: Partial<StudioService>) => void;
  deleteService: (id: string) => void;
  bulkAdjustServicePrices: (percentage: number) => void;
  galleryItems: StudioGalleryItem[];
  addGalleryItem: (item: StudioGalleryItem) => Promise<void>;
  updateGalleryItem: (id: string, partial: Partial<StudioGalleryItem>) => void;
  deleteGalleryItem: (id: string) => Promise<void>;
  toggleLikeGalleryItem: (id: string) => void;
  likedGalleryIds: Record<string, boolean>;
  transformations: TransformationCaseRecord[];
  addTransformation: (item: TransformationCaseRecord) => void;
  updateTransformation: (id: string, partial: Partial<TransformationCaseRecord>) => void;
  deleteTransformation: (id: string) => void;
  resetTransformations: () => void;
  lookbook: LookbookItem[];
  addLookbookItem: (item: LookbookItem) => void;
  updateLookbookItem: (id: string, item: Partial<LookbookItem>) => void;
  deleteLookbookItem: (id: string) => void;
  reviews: GoogleReview[];
  addReview: (review: GoogleReview) => void;
  deleteReview: (id: string) => void;
  appointments: AppointmentRecord[];
  addAppointment: (
    appointment: AppointmentRecord
  ) => Promise<{ ok: boolean; error?: string; appointment?: AppointmentRecord }>;
  rescheduleAppointment: (
    id: string,
    newDate: string,
    newStartTime: string
  ) => Promise<{ ok: boolean; error?: string; appointment?: AppointmentRecord }>;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  cancelAppointment: (id: string) => void;
  blockedSlots: BlockedSlot[];
  addBlockedSlot: (slot: BlockedSlot) => void;
  deleteBlockedSlot: (id: string) => void;
  clientNotes: ClientFormulaNote[];
  saveClientNote: (note: ClientFormulaNote) => void;
  deleteClientNote: (id: string) => void;
  isAdminAuthenticated: boolean;
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  currentPage: AppPage;
  activeTicketId: string | null;
  setActiveTicketId: (ticketId: string | null) => void;
  activeSeoSection: string | null;
  setActiveSeoSection: (sectionId: string | null) => void;
  navigateTo: (page: AppPage, sectionId?: string) => void;
  curtainTransition: CurtainTransitionState | null;
  triggerCurtainTransition: (label: string, subtitle?: string) => void;
  selectedServiceIds: string[];
  toggleSelectService: (id: string) => void;
  setSelectedServiceIds: React.Dispatch<React.SetStateAction<string[]>>;
  isDark: boolean;
  setIsDark: React.Dispatch<React.SetStateAction<boolean>>;
  uvNeonMode: boolean;
  toggleUvNeonMode: () => void;
  preselectedSlot: { date: string; time: string } | null;
  setPreselectedSlot: React.Dispatch<React.SetStateAction<{ date: string; time: string } | null>>;
  backendConnected: boolean;
  firestoreConnected: boolean;
  firebaseUserEmail: string | null;
  firebaseUserDisplayName: string | null;
  firebaseUserProfile: StudioUserProfile | null;
  signInWithGoogleAdmin: () => Promise<boolean>;
  signInWithEmailAdmin: (
    email: string,
    password: string,
    mode?: 'signin' | 'register'
  ) => Promise<{ ok: boolean; error?: string }>;
  signOutGoogleAdmin: () => Promise<void>;
  syncAllToFirestoreCloud: () => Promise<number>;
  backendMetrics: BackendMetricsSummary | null;
  auditLogs: AuditLogRecord[];
  refreshBackendState: () => Promise<void>;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

const DEFAULT_ADMIN_PIN = '1234';

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTicketId, setActiveTicketId] = useState<string | null>(() => {
    const rawHash = window.location.hash.replace('#/', '').replace('#', '');
    if (rawHash.startsWith('turno/')) return rawHash.replace('turno/', '');
    if (rawHash.startsWith('voucher/')) return rawHash.replace('voucher/', '');
    return null;
  });

  const [currentPage, setCurrentPage] = useState<AppPage>(() => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    if (hash.startsWith('turno/') || hash.startsWith('voucher/')) {
      return 'voucher';
    }
    if (hash === 'silla' || hash === 'chair') {
      return 'chair';
    }
    if (
      ['home', 'services', 'lookbook', 'experience', 'booking', 'location', 'admin', 'voucher', 'chair'].includes(hash)
    ) {
      return hash as AppPage;
    }
    return 'home';
  });
  const [activeSeoSection, setActiveSeoSection] = useState<string | null>(() => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    if (
      ['turnero', 'servicios', 'transformaciones', 'obras', 'opiniones', 'estudio', 'ubicacion'].includes(
        hash
      )
    ) {
      return hash;
    }
    return null;
  });

  const [isDark, setIsDark] = useState<boolean>(true);
  const [uvNeonMode, setUvNeonMode] = useState<boolean>(() => {
    return localStorage.getItem('vm_urban_uv_neon') === 'true';
  });
  const [preselectedSlot, setPreselectedSlot] = useState<{ date: string; time: string } | null>(
    null
  );
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('vm_admin_auth') === 'true';
  });
  const [adminToken, setAdminToken] = useState<string>(() => {
    return localStorage.getItem('vm_admin_token') || '';
  });
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [firestoreConnected, setFirestoreConnected] = useState<boolean>(isFirebaseConfigured);
  const [firebaseUserEmail, setFirebaseUserEmail] = useState<string | null>(null);
  const [firebaseUserDisplayName, setFirebaseUserDisplayName] = useState<string | null>(null);
  const [firebaseUserProfile, setFirebaseUserProfile] = useState<StudioUserProfile | null>(null);
  const [backendMetrics, setBackendMetrics] = useState<BackendMetricsSummary | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);

  const [config, setConfig] = useState<StudioConfig>(() => {
    try {
      const saved = localStorage.getItem('vm_atelier_v8_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_STUDIO_CONFIG,
          ...parsed,
          sectionOrder: normalizeSectionOrder(parsed.sectionOrder),
        };
      }
    } catch {
      /* fallback */
    }
    return INITIAL_STUDIO_CONFIG;
  });

  const [services, setServices] = useState<StudioService[]>(() => {
    try {
      const saved = localStorage.getItem('vm_atelier_v8_services');
      if (saved) return JSON.parse(saved);
    } catch {
      /* fallback */
    }
    return STUDIO_SERVICES;
  });

  const [galleryItems, setGalleryItems] = useState<StudioGalleryItem[]>(() => {
    try {
      const saved = localStorage.getItem('vm_atelier_v8_gallery');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      /* fallback */
    }
    return STUDIO_GALLERY_ITEMS;
  });

  const [likedGalleryIds, setLikedGalleryIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('vm_atelier_v8_gallery_likes');
      if (saved) return JSON.parse(saved);
    } catch {
      /* fallback */
    }
    return {};
  });

  const [transformations, setTransformations] = useState<TransformationCaseRecord[]>(() => {
    try {
      const saved = localStorage.getItem('vm_atelier_v8_transformations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      /* fallback */
    }
    return INITIAL_TRANSFORMATION_CASES;
  });

  const [curtainTransition, setCurtainTransition] = useState<CurtainTransitionState | null>(null);

  const triggerCurtainTransition = useCallback((label: string, subtitle?: string) => {
    const id = Date.now();
    setCurtainTransition({
      id,
      label,
      subtitle: subtitle || 'Rodrigo Cutsss · Sastrería Capilar',
    });
    setTimeout(() => {
      setCurtainTransition((prev) => (prev && prev.id === id ? null : prev));
    }, 520);
  }, []);

  const [lookbook, setLookbook] = useState<LookbookItem[]>(() => {
    try {
      const saved = localStorage.getItem('vm_atelier_v8_lookbook');
      if (saved) return JSON.parse(saved);
    } catch {
      /* fallback */
    }
    return LOOKBOOK_ITEMS;
  });

  const [reviews, setReviews] = useState<GoogleReview[]>(() => {
    try {
      const saved = localStorage.getItem('vm_atelier_v8_reviews');
      if (saved) return JSON.parse(saved);
    } catch {
      /* fallback */
    }
    return GOOGLE_REVIEWS;
  });

  const [appointments, setAppointments] = useState<AppointmentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('vm_atelier_v8_appointments');
      if (saved) return JSON.parse(saved);
    } catch {
      /* fallback */
    }
    return INITIAL_APPOINTMENTS_STORE;
  });

  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>(() => {
    try {
      const saved = localStorage.getItem('vm_atelier_v8_blocked_slots');
      if (saved) return JSON.parse(saved);
    } catch {
      /* fallback */
    }
    return INITIAL_BLOCKED_SLOTS;
  });

  const [clientNotes, setClientNotes] = useState<ClientFormulaNote[]>(() => {
    try {
      const saved = localStorage.getItem('vm_atelier_v8_client_notes');
      if (saved) return JSON.parse(saved);
    } catch {
      /* fallback */
    }
    return INITIAL_CLIENT_NOTES;
  });

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(['srv-01']);

  const buildAuthHeaders = useCallback(
    (extra?: Record<string, string>): Record<string, string> => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...extra,
      };
      if (adminToken) {
        headers['x-admin-token'] = adminToken;
      }
      headers['x-admin-pin'] = config.adminPin || DEFAULT_ADMIN_PIN;
      return headers;
    },
    [adminToken, config.adminPin]
  );

  // Hydrate & synchronize state with Full-Stack Express Backend (/api/bootstrap)
  const refreshBackendState = useCallback(async () => {
    try {
      const res = await fetch('/api/bootstrap', {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) return;
      const payload = await res.json();
      if (payload && payload.ok && payload.data) {
        setBackendConnected(true);
        const {
          config: remoteConfig,
          services: remoteServices,
          appointments: remoteAppointments,
          blockedSlots: remoteBlocked,
          galleryItems: remoteGallery,
          reviews: remoteReviews,
          auditLogs: remoteLogs,
          metrics: remoteMetrics,
        } = payload.data;

        if (remoteConfig) {
          setConfig((prev) => ({
            ...prev,
            ...remoteConfig,
            sectionOrder: normalizeSectionOrder(remoteConfig.sectionOrder),
          }));
        }
        if (Array.isArray(remoteServices) && remoteServices.length > 0) {
          setServices(remoteServices);
        }
        if (Array.isArray(remoteAppointments)) {
          setAppointments(remoteAppointments);
        }
        if (Array.isArray(remoteBlocked)) {
          setBlockedSlots(remoteBlocked);
        }
        if (Array.isArray(remoteGallery) && remoteGallery.length > 0) {
          setGalleryItems(remoteGallery);
        }
        if (Array.isArray(remoteReviews) && remoteReviews.length > 0) {
          setReviews(remoteReviews);
        }
        if (Array.isArray(remoteLogs)) {
          setAuditLogs(remoteLogs);
        }
        if (remoteMetrics) {
          setBackendMetrics(remoteMetrics);
        }
      }
    } catch {
      // Offline / local fallback
    }
  }, []);

  useEffect(() => {
    refreshBackendState();
  }, [refreshBackendState]);

  // Sync with Persistent Firebase Auth Session & Real-Time Firestore Collections
  useEffect(() => {
    const unsubAuth = initPersistentAuthSession((session) => {
      if (session) {
        setFirebaseUserEmail(session.email || null);
        setFirebaseUserDisplayName(session.displayName || session.email || null);
        setFirestoreConnected(true);
      } else {
        setFirebaseUserEmail(null);
        setFirebaseUserDisplayName(null);
        setFirebaseUserProfile(null);
      }
    });

    if (!db) {
      return () => {
        unsubAuth();
      };
    }

    let unsubGallery: (() => void) | undefined;
    try {
      unsubGallery = onSnapshot(
        collection(db, 'studio_gallery'),
        (snapshot) => {
          setFirestoreConnected(true);
          if (!snapshot.empty) {
            const remoteItems: StudioGalleryItem[] = snapshot.docs.map((d) => {
              const data = d.data();
              return {
                id: data.id || d.id,
                title: data.title || 'Trabajo en el Estudio',
                category: data.category || 'Cortes & Fades',
                imageUrl:
                  data.imageUrl || '/src/assets/images/urban_streetwear_haircut_1793930882291.jpg',
                description: data.description || '',
                dateLabel: data.dateLabel || 'Reciente',
                tags: Array.isArray(data.tags) ? data.tags : ['#RodrigoCutsss', '#VenadoTuerto'],
                technicalSpec: data.technicalSpec,
                serviceId: data.serviceId,
                priceLabel: data.priceLabel,
                likes: typeof data.likes === 'number' ? data.likes : 42,
                featured: !!data.featured,
                hidden: !!data.hidden,
                hideBuyButton: !!data.hideBuyButton,
                hidePrice: !!data.hidePrice,
                hideSpec: !!data.hideSpec,
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

    const unsubAppointments = subscribeAppointmentsFromDb((remoteAppointments) => {
      setFirestoreConnected(true);
      if (remoteAppointments.length > 0) {
        setAppointments((prev) => {
          const map = new Map<string, AppointmentRecord>();
          for (const a of prev) map.set(a.id, a);
          for (const r of remoteAppointments) map.set(r.id, r);
          return Array.from(map.values());
        });
      }
    });

    const unsubTransformations = subscribeToFirestoreTransformations((remoteTransformations) => {
      setFirestoreConnected(true);
      if (remoteTransformations.length > 0) {
        setTransformations(remoteTransformations);
      }
    });

    const unsubCrm = subscribeToFirestoreCrmNotes((remoteNotes) => {
      if (remoteNotes.length > 0) {
        setClientNotes((prev) => {
          const map = new Map<string, ClientFormulaNote>();
          for (const n of prev) map.set(n.id, n);
          for (const r of remoteNotes) map.set(r.id, r);
          return Array.from(map.values());
        });
      }
    });

    return () => {
      unsubAuth();
      if (unsubGallery) unsubGallery();
      unsubAppointments();
      unsubTransformations();
      unsubCrm();
    };
  }, [firebaseUserEmail]);

  // Cross-tab real-time sync via storage events
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (!e.newValue) return;
      try {
        if (e.key === 'vm_atelier_v8_appointments') {
          setAppointments(JSON.parse(e.newValue));
        } else if (e.key === 'vm_atelier_v8_blocked_slots') {
          setBlockedSlots(JSON.parse(e.newValue));
        } else if (e.key === 'vm_atelier_v8_config') {
          setConfig((prev) => ({ ...prev, ...JSON.parse(e.newValue!) }));
        } else if (e.key === 'vm_atelier_v8_services') {
          setServices(JSON.parse(e.newValue));
        } else if (e.key === 'vm_atelier_v8_gallery') {
          setGalleryItems(JSON.parse(e.newValue));
        } else if (e.key === 'vm_atelier_v8_client_notes') {
          setClientNotes(JSON.parse(e.newValue));
        }
      } catch {
        // Ignore malformed storage payload
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('vm_atelier_v8_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('vm_atelier_v8_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    try {
      localStorage.setItem('vm_atelier_v8_gallery', JSON.stringify(galleryItems));
    } catch {
      // Handle storage quota gracefully
    }
  }, [galleryItems]);

  useEffect(() => {
    localStorage.setItem('vm_atelier_v8_gallery_likes', JSON.stringify(likedGalleryIds));
  }, [likedGalleryIds]);

  useEffect(() => {
    try {
      localStorage.setItem('vm_atelier_v8_transformations', JSON.stringify(transformations));
    } catch {
      // Handle storage quota gracefully
    }
  }, [transformations]);

  useEffect(() => {
    localStorage.setItem('vm_atelier_v8_lookbook', JSON.stringify(lookbook));
  }, [lookbook]);

  useEffect(() => {
    localStorage.setItem('vm_atelier_v8_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('vm_atelier_v8_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('vm_atelier_v8_blocked_slots', JSON.stringify(blockedSlots));
  }, [blockedSlots]);

  useEffect(() => {
    localStorage.setItem('vm_atelier_v8_client_notes', JSON.stringify(clientNotes));
  }, [clientNotes]);

  // Dark mode & River Plate Red / Monumental mode effect
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.urbanTheme = config.urbanTheme || 'crimson';
    if (uvNeonMode || config.urbanTheme === 'uv') {
      root.classList.add('uv-neon-mode');
    } else {
      root.classList.remove('uv-neon-mode');
    }
    localStorage.setItem('vm_urban_uv_neon', uvNeonMode ? 'true' : 'false');
    window.dispatchEvent(
      new CustomEvent('uv-neon-mode-change', { detail: { uvNeonMode } })
    );
  }, [uvNeonMode, config.urbanTheme]);

  const toggleUvNeonMode = () => {
    setUvNeonMode((prev) => {
      const next = !prev;
      const nextTheme = next ? 'uv' : 'crimson';
      setConfig((c) => ({ ...c, urbanTheme: nextTheme }));
      fetch('/api/config', {
        method: 'PUT',
        headers: buildAuthHeaders(),
        body: JSON.stringify({ urbanTheme: nextTheme }),
      }).catch(() => {});
      return next;
    });
  };

  // History & Section Navigation sync with Curtain Reveal
  const navigateTo = useCallback(
    (page: AppPage, sectionId?: string) => {
      const pageLabels: Record<AppPage, string> = {
        home: 'Portada del Estudio',
        booking: 'Registro de Turnos',
        services: 'Carta de Servicios',
        lookbook: 'Galería Fotográfica',
        experience: 'Conocé al Barbero',
        location: 'Ubicación & Horarios',
        admin: 'Escritorio de Dirección',
        voucher: 'Mi Turno · Boleto Oficial',
        chair: 'Modo Silla · Panel de Sillón',
      };
      const sectionLabels: Record<string, string> = {
        turnero: 'Registro de Turnos',
        servicios: 'Carta de Servicios',
        transformaciones: 'Antes & Después',
        obras: 'Galería Fotográfica',
        opiniones: 'Reseñas de Clientes',
        estudio: 'Conocé al Barbero',
        ubicacion: 'Ubicación & Horarios',
      };
      const label =
        (sectionId && sectionLabels[sectionId]) || pageLabels[page] || 'Rodrigo Cutsss';
      triggerCurtainTransition(label, `${config.studioTitle} · ${config.address}`);

      setCurrentPage(page);
      setActiveSeoSection(sectionId || null);
      if (page === 'voucher' && activeTicketId) {
        window.location.hash = `#/turno/${activeTicketId}`;
      } else if (page === 'chair') {
        window.location.hash = '#/silla';
      } else {
        window.location.hash = sectionId && page === 'home' ? `#${sectionId}` : `#/${page}`;
      }
      if (sectionId) {
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 120);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [config.studioTitle, config.address, triggerCurtainTransition, activeTicketId]
  );

  // Discreet Keyboard Shortcut for Admin Access (Ctrl + Shift + A or Alt + A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlShiftA = (e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a';
      const isAltA = e.altKey && !e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'a';
      if (isCtrlShiftA || isAltA) {
        e.preventDefault();
        navigateTo('admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateTo]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash.startsWith('turno/') || hash.startsWith('voucher/')) {
        const id = hash.replace('turno/', '').replace('voucher/', '');
        setActiveTicketId(id);
        setCurrentPage('voucher');
        return;
      }
      if (hash === 'silla' || hash === 'chair') {
        setCurrentPage('chair');
        return;
      }
      if (
        ['home', 'services', 'lookbook', 'experience', 'booking', 'location', 'admin', 'voucher', 'chair'].includes(
          hash
        )
      ) {
        setCurrentPage(hash as AppPage);
        if (hash === 'home') {
          setActiveSeoSection(null);
        }
      } else if (
        ['turnero', 'servicios', 'transformaciones', 'obras', 'opiniones', 'estudio', 'ubicacion'].includes(
          hash
        )
      ) {
        setCurrentPage('home');
        setActiveSeoSection(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const loginAdmin = (pin: string): boolean => {
    const trimmed = pin.trim();
    if (trimmed === (config.adminPin || DEFAULT_ADMIN_PIN) || trimmed === DEFAULT_ADMIN_PIN) {
      setIsAdminAuthenticated(true);
      localStorage.setItem('vm_admin_auth', 'true');
      fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: trimmed }),
      })
        .then((r) => r.json())
        .then((res) => {
          if (res && res.ok && res.token) {
            setAdminToken(res.token);
            localStorage.setItem('vm_admin_token', res.token);
            refreshBackendState();
          }
        })
        .catch(() => {});
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setAdminToken('');
    localStorage.removeItem('vm_admin_auth');
    localStorage.removeItem('vm_admin_token');
  };

  const updateConfig = (partial: Partial<StudioConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial };
      if (partial.urbanTheme) {
        setUvNeonMode(partial.urbanTheme === 'uv');
      }
      return next;
    });
    fetch('/api/config', {
      method: 'PUT',
      headers: buildAuthHeaders(),
      body: JSON.stringify(partial),
    })
      .then(() => refreshBackendState())
      .catch(() => {});
  };

  const moveSectionInOrder = (sectionId: HomeSectionId, direction: 'up' | 'down') => {
    setConfig((prev) => {
      const current = normalizeSectionOrder(prev.sectionOrder);
      const idx = current.indexOf(sectionId);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= current.length) return prev;
      const next = [...current];
      const temp = next[idx];
      next[idx] = next[targetIdx];
      next[targetIdx] = temp;
      return { ...prev, sectionOrder: next };
    });
    fetch('/api/config/section-order', {
      method: 'POST',
      headers: buildAuthHeaders(),
      body: JSON.stringify({ sectionId, direction }),
    })
      .then(() => refreshBackendState())
      .catch(() => {});
  };

  const resetConfig = () => {
    setConfig(INITIAL_STUDIO_CONFIG);
    fetch('/api/config', {
      method: 'PUT',
      headers: buildAuthHeaders(),
      body: JSON.stringify(INITIAL_STUDIO_CONFIG),
    }).catch(() => {});
  };

  const addService = (service: StudioService) => {
    setServices((prev) => [...prev, service]);
    fetch('/api/services', {
      method: 'POST',
      headers: buildAuthHeaders(),
      body: JSON.stringify(service),
    })
      .then(() => refreshBackendState())
      .catch(() => {});
  };

  const updateService = (id: string, updated: Partial<StudioService>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
    fetch(`/api/services/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: buildAuthHeaders(),
      body: JSON.stringify(updated),
    })
      .then(() => refreshBackendState())
      .catch(() => {});
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    setSelectedServiceIds((prev) => prev.filter((sId) => sId !== id));
    fetch(`/api/services/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: buildAuthHeaders(),
    })
      .then(() => refreshBackendState())
      .catch(() => {});
  };

  const bulkAdjustServicePrices = (percentage: number) => {
    if (!Number.isFinite(percentage) || percentage === 0) return;
    const factor = 1 + percentage / 100;
    setServices((prev) =>
      prev.map((s) => {
        const raw = s.price * factor;
        const rounded = Math.max(1000, Math.round(raw / 500) * 500);
        return { ...s, price: rounded };
      })
    );
    fetch('/api/services/bulk-price', {
      method: 'POST',
      headers: buildAuthHeaders(),
      body: JSON.stringify({ percentage }),
    })
      .then(() => refreshBackendState())
      .catch(() => {});
  };

  const addGalleryItem = async (item: StudioGalleryItem) => {
    setGalleryItems((prev) => [item, ...prev]);
    fetch('/api/gallery', {
      method: 'POST',
      headers: buildAuthHeaders(),
      body: JSON.stringify(item),
    })
      .then(() => refreshBackendState())
      .catch(() => {});
    syncGalleryItemToFirestore(item).catch(() => {});
  };

  const updateGalleryItem = (id: string, partial: Partial<StudioGalleryItem>) => {
    setGalleryItems((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...partial } : item));
      const updatedItem = next.find((item) => item.id === id);
      if (updatedItem) {
        syncGalleryItemToFirestore(updatedItem).catch(() => {});
      }
      return next;
    });
    fetch(`/api/gallery/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: buildAuthHeaders(),
      body: JSON.stringify(partial),
    }).catch(() => {});
  };

  const deleteGalleryItem = async (id: string) => {
    setGalleryItems((prev) => prev.filter((item) => item.id !== id));
    fetch(`/api/gallery/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: buildAuthHeaders(),
    }).catch(() => {});
    deleteGalleryItemFromFirestore(id).catch(() => {});
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
    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    })
      .then(() => refreshBackendState())
      .catch(() => {});
  };

  const deleteReview = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    fetch(`/api/reviews/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: buildAuthHeaders(),
    })
      .then(() => refreshBackendState())
      .catch(() => {});
  };

  const addAppointment = async (
    appointment: AppointmentRecord
  ): Promise<{ ok: boolean; error?: string; appointment?: AppointmentRecord }> => {
    setAppointments((prev) => [appointment, ...prev]);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointment),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setAppointments((prev) => prev.filter((a) => a.id !== appointment.id));
        return {
          ok: false,
          error: data?.error || 'El horario seleccionado ya fue ocupado.',
        };
      }
      const created = data.appointment || appointment;
      addAppointmentToDb(created).catch(() => {});
      if (data.metrics) setBackendMetrics(data.metrics);
      refreshBackendState();
      return { ok: true, appointment: created };
    } catch {
      addAppointmentToDb(appointment).catch(() => {});
      return { ok: true, appointment };
    }
  };

  const rescheduleAppointment = async (
    id: string,
    newDate: string,
    newStartTime: string
  ): Promise<{ ok: boolean; error?: string; appointment?: AppointmentRecord }> => {
    const previous = appointments;
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, date: newDate, startTime: newStartTime } : a))
    );
    try {
      const res = await fetch(`/api/appointments/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: newDate, startTime: newStartTime }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setAppointments(previous);
        return {
          ok: false,
          error: data?.error || 'No se pudo reprogramar el turno en ese horario.',
        };
      }
      if (data.appointment) {
        updateAppointmentInDb(id, { date: newDate, startTime: newStartTime }).catch(() => {});
      }
      if (data.metrics) setBackendMetrics(data.metrics);
      refreshBackendState();
      return { ok: true, appointment: data.appointment };
    } catch {
      updateAppointmentInDb(id, { date: newDate, startTime: newStartTime }).catch(() => {});
      return { ok: true };
    }
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, status } : a));
      return next;
    });
    updateAppointmentInDb(id, { status }).catch(() => {});
    fetch(`/api/appointments/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: buildAuthHeaders(),
      body: JSON.stringify({ status }),
    })
      .then(() => refreshBackendState())
      .catch(() => {});
  };

  const cancelAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    deleteAppointmentFromDb(id).catch(() => {});
    fetch(`/api/appointments/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: buildAuthHeaders(),
    })
      .then(() => refreshBackendState())
      .catch(() => {});
  };

  const addBlockedSlot = (slot: BlockedSlot) => {
    setBlockedSlots((prev) => [...prev, slot]);
    fetch('/api/blocked-slots', {
      method: 'POST',
      headers: buildAuthHeaders(),
      body: JSON.stringify(slot),
    })
      .then(() => refreshBackendState())
      .catch(() => {});
  };

  const deleteBlockedSlot = (id: string) => {
    setBlockedSlots((prev) => prev.filter((s) => s.id !== id));
    fetch(`/api/blocked-slots/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: buildAuthHeaders(),
    })
      .then(() => refreshBackendState())
      .catch(() => {});
  };

  const saveClientNote = (note: ClientFormulaNote) => {
    setClientNotes((prev) => {
      const idx = prev.findIndex(
        (n) =>
          n.id === note.id ||
          (note.whatsapp && n.whatsapp.replace(/\D/g, '') === note.whatsapp.replace(/\D/g, ''))
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...note };
        syncCrmNoteToFirestore(next[idx]).catch(() => {});
        return next;
      }
      syncCrmNoteToFirestore(note).catch(() => {});
      return [note, ...prev];
    });
  };

  const deleteClientNote = (id: string) => {
    setClientNotes((prev) => prev.filter((n) => n.id !== id));
    deleteCrmNoteFromFirestore(id).catch(() => {});
  };

  const toggleSelectService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const addTransformation = (item: TransformationCaseRecord) => {
    setTransformations((prev) => [item, ...prev]);
    syncTransformationToFirestore(item).catch(() => {});
  };

  const updateTransformation = (id: string, partial: Partial<TransformationCaseRecord>) => {
    setTransformations((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...partial } : item));
      const updated = next.find((item) => item.id === id);
      if (updated) {
        syncTransformationToFirestore(updated).catch(() => {});
      }
      return next;
    });
  };

  const deleteTransformation = (id: string) => {
    setTransformations((prev) => prev.filter((item) => item.id !== id));
    deleteTransformationFromFirestore(id).catch(() => {});
  };

  const resetTransformations = () => {
    setTransformations(INITIAL_TRANSFORMATION_CASES);
    for (const item of INITIAL_TRANSFORMATION_CASES) {
      syncTransformationToFirestore(item).catch(() => {});
    }
  };

  const signInWithGoogleAdmin = async (): Promise<boolean> => {
    try {
      const { user, profile } = await signInStudioWithGoogle(config.studioTitle);
      setFirebaseUserEmail(user.email || null);
      setFirebaseUserDisplayName(user.displayName || user.email || null);
      setFirebaseUserProfile(profile);
      setIsAdminAuthenticated(true);
      localStorage.setItem('vm_admin_auth', 'true');
      return true;
    } catch {
      return false;
    }
  };

  const signInWithEmailAdmin = async (
    email: string,
    password: string,
    mode: 'signin' | 'register' = 'signin'
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const { user, profile } =
        mode === 'register'
          ? await registerWithEmail(email, password, config.authorName || 'Rodrigo', config.studioTitle)
          : await signInWithEmail(email, password, config.studioTitle);
      setFirebaseUserEmail(user.email || null);
      setFirebaseUserDisplayName(user.displayName || user.email || null);
      if (profile) setFirebaseUserProfile(profile);
      setIsAdminAuthenticated(true);
      localStorage.setItem('vm_admin_auth', 'true');
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'No se pudo autenticar con Email y Contraseña.',
      };
    }
  };

  const signOutGoogleAdmin = async (): Promise<void> => {
    await logoutPersistentSession();
    await signOutStudioUser();
    setFirebaseUserEmail(null);
    setFirebaseUserDisplayName(null);
    setFirebaseUserProfile(null);
  };

  const syncAllToFirestoreCloud = async (): Promise<number> => {
    let syncedCount = 0;
    for (const appItem of appointments) {
      try {
        await addAppointmentToDb(appItem);
        syncedCount++;
      } catch {
        // continue
      }
    }
    for (const trItem of transformations) {
      try {
        await syncTransformationToFirestore(trItem);
        syncedCount++;
      } catch {
        // continue
      }
    }
    for (const galItem of galleryItems) {
      try {
        await syncGalleryItemToFirestore(galItem);
        syncedCount++;
      } catch {
        // continue
      }
    }
    if (firebaseUserEmail) {
      for (const noteItem of clientNotes) {
        try {
          await syncCrmNoteToFirestore(noteItem);
          syncedCount++;
        } catch {
          // continue
        }
      }
    }
    return syncedCount;
  };

  return (
    <StudioContext.Provider
      value={{
        config,
        updateConfig,
        resetConfig,
        moveSectionInOrder,
        services,
        addService,
        updateService,
        deleteService,
        bulkAdjustServicePrices,
        galleryItems,
        addGalleryItem,
        updateGalleryItem,
        deleteGalleryItem,
        toggleLikeGalleryItem,
        likedGalleryIds,
        transformations,
        addTransformation,
        updateTransformation,
        deleteTransformation,
        resetTransformations,
        lookbook,
        addLookbookItem,
        updateLookbookItem,
        deleteLookbookItem,
        reviews,
        addReview,
        deleteReview,
        appointments,
        addAppointment,
        rescheduleAppointment,
        updateAppointmentStatus,
        cancelAppointment,
        blockedSlots,
        addBlockedSlot,
        deleteBlockedSlot,
        clientNotes,
        saveClientNote,
        deleteClientNote,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        currentPage,
        activeTicketId,
        setActiveTicketId,
        activeSeoSection,
        setActiveSeoSection,
        navigateTo,
        curtainTransition,
        triggerCurtainTransition,
        selectedServiceIds,
        toggleSelectService,
        setSelectedServiceIds,
        isDark,
        setIsDark,
        uvNeonMode,
        toggleUvNeonMode,
        preselectedSlot,
        setPreselectedSlot,
        backendConnected,
        firestoreConnected,
        firebaseUserEmail,
        firebaseUserDisplayName,
        firebaseUserProfile,
        signInWithGoogleAdmin,
        signInWithEmailAdmin,
        signOutGoogleAdmin,
        syncAllToFirestoreCloud,
        backendMetrics,
        auditLogs,
        refreshBackendState,
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
