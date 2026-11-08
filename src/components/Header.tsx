import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import {
  Shield,
  Menu,
  X,
  Calendar,
  MapPin,
  Clock,
  MessageCircle,
  Instagram,
  ArrowRight,
} from 'lucide-react';
import { useStudio, AppPage } from '../context/StudioContext';
import { EditorialRotatingBanner, MagneticButton } from './EditorialEffects';
import { RetroHeaderBandaOrnament, RetroRiverCrestBadge } from './RetroPaperBanda';
import { resolveInstagramInfo, resolveWhatsAppInfo } from '../utils/bookingEngine';

export const Header: React.FC = () => {
  const { currentPage, navigateTo, isAdminAuthenticated, config } = useStudio();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Stealth triple-click tracker on the brand logo for the Studio Owner
  const logoClickCountRef = useRef<{ count: number; lastTime: number }>({
    count: 0,
    lastTime: 0,
  });

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 28);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer when page changes or viewport widens
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentPage]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const navItems: { id: AppPage; sectionId: string; label: string; enabled: boolean }[] =
    useMemo(() => {
      const list: { id: AppPage; sectionId: string; label: string; enabled: boolean }[] = [
        {
          id: 'booking',
          sectionId: 'turnero',
          label: 'Sacar Turno',
          enabled: config.showBookingSection !== false,
        },
        {
          id: 'services',
          sectionId: 'servicios',
          label: 'Servicios',
          enabled: config.showServicesSection !== false,
        },
        {
          id: 'lookbook',
          sectionId: 'obras',
          label: 'Trabajos',
          enabled: config.showGallerySection !== false,
        },
        {
          id: 'experience',
          sectionId: 'estudio',
          label: 'El Barbero',
          enabled: config.showBarberSection !== false,
        },
        {
          id: 'location',
          sectionId: 'ubicacion',
          label: 'Ubicación',
          enabled: config.showLocationSection !== false,
        },
      ];
      return list.filter((i) => i.enabled);
    }, [
      config.showBookingSection,
      config.showServicesSection,
      config.showGallerySection,
      config.showBarberSection,
      config.showLocationSection,
    ]);

  const handleLogoClick = () => {
    const now = Date.now();
    if (now - logoClickCountRef.current.lastTime < 650) {
      logoClickCountRef.current.count += 1;
    } else {
      logoClickCountRef.current.count = 1;
    }
    logoClickCountRef.current.lastTime = now;

    if (logoClickCountRef.current.count >= 3) {
      logoClickCountRef.current.count = 0;
      setIsMobileMenuOpen(false);
      navigateTo('admin');
      return;
    }

    setIsMobileMenuOpen(false);
    if (currentPage !== 'home') {
      navigateTo('home');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavClick = (item: { id: AppPage; sectionId: string }) => {
    setIsMobileMenuOpen(false);
    if (currentPage === 'home') {
      const target = document.getElementById(item.sectionId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    navigateTo('home', item.sectionId);
  };

  const handleBookNow = () => {
    setIsMobileMenuOpen(false);
    if (currentPage === 'home') {
      const target = document.getElementById('turnero');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    navigateTo('home', 'turnero');
  };

  const waInfo = resolveWhatsAppInfo(config.phoneDisplay, config.whatsappRaw);
  const igInfo = resolveInstagramInfo(config.instagram);

  return (
    <div className="sticky top-0 z-50 w-full">
      {/* Rotating Vintage Print Ticker Banner (controlled by Admin) */}
      {currentPage !== 'admin' && (
        <EditorialRotatingBanner variant="top" onBookClick={handleBookNow} />
      )}

      <header
        className={`relative w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#F5EFE4]/96 backdrop-blur-xl border-b border-[#C5B79F] shadow-[0_8px_24px_rgba(24,21,18,0.08)]'
            : 'bg-[#F3ECE0]/94 backdrop-blur-md border-b border-[#CFC2AC]'
        }`}
      >
        {/* Decorative Aged-Paper & Subtle River Plate Diagonal Red Sash Component */}
        <RetroHeaderBandaOrnament
          studioTitle={config.studioTitle || 'Rodrigo Cutsss'}
          address={config.address || 'Vuelta de Obligado 931'}
        />

        <div
          className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-4 sm:gap-8 transition-all duration-300 ${
            isScrolled ? 'py-2.5' : 'py-3.5'
          }`}
        >
          {/* Zone 1: Brand Wordmark with Vintage Shield & Diagonal Carmine Sash (Triple-click for stealth Admin) */}
          <button
            type="button"
            onClick={handleLogoClick}
            title="Inicio · Rodrigo Cutsss"
            className="group inline-flex items-center gap-2.5 sm:gap-3 text-left whitespace-nowrap shrink-0 cursor-pointer select-none"
          >
            <RetroRiverCrestBadge size="sm" />

            <div className="flex flex-col">
              <span className="font-display text-lg sm:text-2xl font-bold tracking-tight text-[#181512] group-hover:text-[#9E2A2B] transition-colors leading-none">
                {config.studioTitle || 'Rodrigo Cutsss'}
              </span>
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#6B6052] mt-1 hidden sm:block">
                Sastrería Capilar · Venado Tuerto
              </span>
            </div>
          </button>

          {/* Zone 2: Concise single-line navigation links (Desktop) */}
          <nav
            aria-label="Navegación principal"
            className="hidden md:flex items-center gap-6 lg:gap-7 text-xs font-mono uppercase tracking-[0.14em] font-semibold text-[#4A4137]"
          >
            {navItems.map((item) => (
              <button
                key={item.sectionId}
                type="button"
                onClick={() => handleNavClick(item)}
                className="relative py-1 text-[#4A4137] hover:text-[#181512] transition-colors whitespace-nowrap shrink-0 cursor-pointer after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-[#9E2A2B] after:origin-right after:scale-x-0 hover:after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-200"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Primary CTA + Mobile Hamburger Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isAdminAuthenticated && currentPage !== 'admin' && (
              <button
                type="button"
                onClick={() => navigateTo('admin')}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded border border-[#9E2A2B]/50 bg-[#EAE0CE] text-[#181512] hover:bg-[#9E2A2B] hover:text-[#FAF6EE] text-[11px] font-mono font-semibold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Shield className="w-3.5 h-3.5 text-[#9E2A2B]" />
                <span className="hidden lg:inline">Panel Admin</span>
              </button>
            )}

            <MagneticButton
              onClick={handleBookNow}
              className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded bg-[#9E2A2B] hover:bg-[#822021] text-[#FAF6EE] border border-[#781D1E] shadow-[0_3px_0_#5E1516] text-[11px] sm:text-xs font-mono font-semibold tracking-[0.12em] sm:tracking-[0.14em] uppercase transition-all duration-200 whitespace-nowrap shrink-0"
            >
              Reservá tu lugar
            </MagneticButton>

            {/* Mobile Hamburger Button (< md) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
              data-testid="mobile-menu-toggle"
              className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded border border-[#C8BBA4] bg-[#FAF6EE] text-[#181512] hover:border-[#9E2A2B] hover:text-[#9E2A2B] transition-colors cursor-pointer shrink-0"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Subtle Scroll-Linked Carmine Sash Reading Progress Line */}
        {currentPage === 'home' && (
          <motion.div
            style={{ scaleX, transformOrigin: '0%' }}
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#9E2A2B] via-[#B89146] to-[#9E2A2B] pointer-events-none"
          />
        )}
      </header>

      {/* Responsive Aged-Paper Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            data-testid="mobile-menu-drawer"
            className="md:hidden relative w-full bg-[#FAF6EE] border-b-2 border-[#9E2A2B] shadow-[0_20px_45px_rgba(24,21,18,0.18)] overflow-hidden"
          >
            {/* Subtle Diagonal Sash Watermark inside Mobile Menu */}
            <div
              aria-hidden="true"
              className="absolute -right-12 -top-12 w-52 h-52 pointer-events-none opacity-20"
            >
              <div className="w-64 h-8 bg-[#9E2A2B] rotate-45 translate-y-20" />
            </div>

            <div className="relative z-10 px-4 py-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-dashed border-[#C8BBA4]">
                <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#9E2A2B] font-semibold">
                  Índice del Estudio · {config.studioTitle || 'Rodrigo Cutsss'}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#5C5346]">
                  Atención 1 a 1
                </span>
              </div>

              <nav
                aria-label="Navegación móvil"
                className="grid grid-cols-1 gap-1.5"
              >
                {navItems.map((item, idx) => (
                  <button
                    key={item.sectionId}
                    type="button"
                    onClick={() => handleNavClick(item)}
                    className="w-full flex items-center justify-between px-3.5 py-3 rounded-lg bg-[#F3ECE0]/80 hover:bg-[#EAE0CE] border border-[#D5C9B4] text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] font-semibold text-[#9E2A2B]">
                        0{idx + 1}
                      </span>
                      <span className="font-display text-sm font-bold uppercase tracking-wider text-[#181512] group-hover:text-[#9E2A2B] transition-colors">
                        {item.label}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#9E2A2B]" />
                  </button>
                ))}
              </nav>

              {/* Studio Info & Direct Actions inside Mobile Menu */}
              <div className="p-3.5 rounded-lg bg-[#EFE7D6] border border-[#C8BBA4] space-y-2 text-xs text-[#4F463B]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#9E2A2B] shrink-0" />
                  <span className="font-medium text-[#181512]">
                    {config.address}, {config.neighborhood}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#9E2A2B] shrink-0" />
                  <span>{config.scheduleDisplay}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <a
                  href={waInfo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded border border-[#C8BBA4] bg-[#FAF6EE] text-[#181512] hover:border-[#9E2A2B] text-xs font-mono font-semibold uppercase tracking-wider"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#9E2A2B]" />
                  WhatsApp
                </a>
                <a
                  href={igInfo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded border border-[#C8BBA4] bg-[#FAF6EE] text-[#181512] hover:border-[#9E2A2B] text-xs font-mono font-semibold uppercase tracking-wider"
                >
                  <Instagram className="w-3.5 h-3.5 text-[#9E2A2B]" />
                  {igInfo.handle}
                </a>
              </div>

              <button
                type="button"
                onClick={handleBookNow}
                className="w-full py-3 rounded bg-[#9E2A2B] hover:bg-[#822021] text-[#FAF6EE] border border-[#781D1E] shadow-[0_3px_0_#5E1516] text-xs font-mono font-semibold uppercase tracking-[0.16em] inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                Sacar Turno Ahora
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
