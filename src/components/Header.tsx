import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useStudio, AppPage } from '../context/StudioContext';
import { Menu, X, Lock, Scissors } from 'lucide-react';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';

interface NavItem {
  label: string;
  page: AppPage;
  sectionId: string;
  enabledKey:
    | 'showHeroSection'
    | 'showServicesSection'
    | 'showBookingSection'
    | 'showGallerySection'
    | 'showBarberSection'
    | 'showLocationSection';
}

export const Header: React.FC = () => {
  const {
    config,
    currentPage,
    navigateTo,
    selectedServiceIds,
    isAdminAuthenticated,
  } = useStudio();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string>('inicio');

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  const navItems: NavItem[] = [
    {
      label: 'Inicio',
      page: 'home',
      sectionId: 'inicio',
      enabledKey: 'showHeroSection',
    },
    {
      label: 'Servicios',
      page: 'services',
      sectionId: 'servicios',
      enabledKey: 'showServicesSection',
    },
    {
      label: 'Reservar',
      page: 'booking',
      sectionId: 'reservar',
      enabledKey: 'showBookingSection',
    },
    {
      label: 'Galería',
      page: 'lookbook',
      sectionId: 'galeria',
      enabledKey: 'showGallerySection',
    },
    {
      label: 'El Barbero',
      page: 'experience',
      sectionId: 'barbero',
      enabledKey: 'showBarberSection',
    },
    {
      label: 'Ubicación',
      page: 'location',
      sectionId: 'ubicacion',
      enabledKey: 'showLocationSection',
    },
  ];

  // Track active section while scrolling on HomePage
  useEffect(() => {
    if (currentPage !== 'home') return;
    const sectionOrder = ['inicio', 'servicios', 'reservar', 'galeria', 'barbero', 'opiniones', 'ubicacion'];
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (let i = sectionOrder.length - 1; i >= 0; i--) {
        const id = sectionOrder[i];
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSectionId(id === 'opiniones' ? 'barbero' : id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage]);

  const handleNavItemClick = (item: NavItem) => {
    playMechanicalClick();
    setMobileMenuOpen(false);

    const isSectionVisibleOnHome = config[item.enabledKey] !== false;

    if (isSectionVisibleOnHome) {
      if (currentPage === 'home') {
        setActiveSectionId(item.sectionId);
        if (item.sectionId === 'inicio') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const el = document.getElementById(item.sectionId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
          }
        }
      } else {
        setActiveSectionId(item.sectionId);
        navigateTo('home', item.sectionId === 'inicio' ? undefined : item.sectionId);
        return;
      }
    }

    navigateTo(item.page);
  };

  const handlePrimaryBookClick = () => {
    playMechanicalClick();
    setMobileMenuOpen(false);
    if (config.showBookingSection !== false) {
      if (currentPage === 'home') {
        const el = document.getElementById('reservar');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      } else {
        navigateTo('home', 'reservar');
        return;
      }
    }
    navigateTo('booking');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#232730] bg-[#0A0B0E]/92 backdrop-blur-xl transition-colors text-white">
      {/* Smooth Scroll Progress Indicator */}
      <motion.div
        style={{ scaleX }}
        className="h-[2px] bg-gradient-to-r from-[#D4A373] via-[#E5B88B] to-[#C87D65] origin-left"
      />

      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onMouseEnter={playMechanicalHover}
          onClick={() => {
            playMechanicalClick();
            setActiveSectionId('inicio');
            navigateTo('home');
          }}
          className="text-left group cursor-pointer focus:outline-none flex items-center gap-2.5 whitespace-nowrap shrink-0 active:scale-95 transition-transform"
        >
          <span className="w-8 h-8 rounded-xl bg-[#D4A373] text-zinc-950 font-black flex items-center justify-center text-xs font-mono tracking-tighter shadow-sm">
            RC
          </span>
          <span className="font-display text-base sm:text-lg font-black tracking-wider uppercase text-white group-hover:text-[#D4A373] transition-colors whitespace-nowrap">
            {config.authorName.toUpperCase()}{' '}
            <span className="text-[#D4A373] font-mono text-xs font-bold">CUTSSS</span>
          </span>
        </button>

        {/* Zone 2: Clean Single-Line Navigation Links */}
        <nav
          aria-label="Navegación principal"
          className="hidden lg:flex items-center gap-7 text-xs font-mono font-bold uppercase tracking-wider text-zinc-400"
        >
          {navItems.map((item) => {
            const isActive =
              currentPage === 'home'
                ? activeSectionId === item.sectionId
                : currentPage === item.page;

            return (
              <button
                key={item.sectionId}
                type="button"
                onMouseEnter={playMechanicalHover}
                onClick={() => handleNavItemClick(item)}
                className={`relative transition-colors whitespace-nowrap shrink-0 py-1.5 cursor-pointer active:scale-95 ${
                  isActive ? 'text-[#D4A373] font-black' : 'hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="header-active-underline"
                    className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-[#D4A373] rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Admin Access & Primary CTA */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Barber Private Portal */}
          <button
            type="button"
            onMouseEnter={playMechanicalHover}
            onClick={() => {
              playMechanicalClick();
              navigateTo('admin');
            }}
            aria-label="Acceso privado del barbero"
            className={`hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-mono rounded-xl border transition-all cursor-pointer active:scale-95 whitespace-nowrap shrink-0 ${
              currentPage === 'admin'
                ? 'border-[#D4A373] bg-[#D4A373] text-zinc-950 font-bold'
                : isAdminAuthenticated
                ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                : 'border-[#282D37] bg-[#111318] text-zinc-400 hover:text-white hover:border-[#D4A373]/50'
            }`}
          >
            <Lock
              className={`w-3 h-3 ${
                currentPage === 'admin' ? 'text-zinc-950' : 'text-[#D4A373]'
              }`}
            />
            <span className="font-bold">Admin</span>
          </button>

          {/* Primary CTA: Reservar Turno */}
          <button
            type="button"
            onMouseEnter={playMechanicalHover}
            onClick={handlePrimaryBookClick}
            className="hidden sm:flex px-4 sm:px-5 py-2.5 text-xs font-mono font-black tracking-wider uppercase bg-[#D4A373] hover:bg-[#C89562] text-zinc-950 active:scale-95 transition-all rounded-xl whitespace-nowrap shrink-0 cursor-pointer shadow-sm items-center gap-1.5"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>
              {selectedServiceIds.length > 0
                ? `Reservar Turno (${selectedServiceIds.length})`
                : 'Reservar Turno'}
            </span>
          </button>

          {/* Mobile Hamburger Menu */}
          <button
            type="button"
            onMouseEnter={playMechanicalHover}
            onClick={() => {
              playMechanicalClick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            aria-label="Abrir menú"
            className="lg:hidden w-9 h-9 rounded-xl border border-[#282D37] bg-[#111318] flex items-center justify-center cursor-pointer text-white hover:border-[#D4A373] active:scale-90 transition-all"
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4 text-[#D4A373]" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#232730] bg-[#111318] px-5 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const isActive =
                currentPage === 'home'
                  ? activeSectionId === item.sectionId
                  : currentPage === item.page;
              return (
                <button
                  key={item.sectionId}
                  type="button"
                  onMouseEnter={playMechanicalHover}
                  onClick={() => handleNavItemClick(item)}
                  className={`p-3 text-left text-xs uppercase tracking-wider font-mono font-bold rounded-xl border transition-all cursor-pointer active:scale-95 ${
                    isActive
                      ? 'border-[#D4A373] bg-[#181B22] text-[#D4A373]'
                      : 'border-[#232730] bg-[#0C0E12] text-zinc-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#232730] flex items-center justify-between text-xs">
            <span className="font-mono text-zinc-500">
              {config.address} · {config.neighborhood}
            </span>
            <button
              type="button"
              onMouseEnter={playMechanicalHover}
              onClick={() => {
                playMechanicalClick();
                navigateTo('admin');
                setMobileMenuOpen(false);
              }}
              className="text-[#D4A373] font-mono flex items-center gap-1 font-bold cursor-pointer hover:underline"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Portal Barbero</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
