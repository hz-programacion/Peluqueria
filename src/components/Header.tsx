import React, { useState, useEffect, useMemo } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { useStudio, AppPage } from '../context/StudioContext';
import { EditorialRotatingBanner, MagneticButton } from './EditorialEffects';

export const Header: React.FC = () => {
  const { config, currentPage, navigateTo } = useStudio();
  const [isScrolled, setIsScrolled] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    restDelta: 0.001,
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 36);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = useMemo(() => {
    const list: { id: AppPage; sectionId: string; label: string; enabled: boolean }[] = [
      {
        id: 'experience',
        sectionId: 'estudio',
        label: 'El Estudio',
        enabled: config.showBarberSection !== false,
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
        label: 'Obras',
        enabled: config.showGallerySection !== false,
      },
      {
        id: 'booking',
        sectionId: 'turnero',
        label: 'Turnero',
        enabled: config.showBookingSection !== false,
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
    config.showBarberSection,
    config.showServicesSection,
    config.showGallerySection,
    config.showBookingSection,
    config.showLocationSection,
  ]);

  const handleNavClick = (item: { id: AppPage; sectionId: string }) => {
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
    if (currentPage === 'home') {
      const target = document.getElementById('turnero');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    navigateTo('home', 'turnero');
  };

  return (
    <div className="sticky top-0 z-50 w-full">
      {/* Rotating Promotional Banner with Scroll-Velocity Parallax (controlled by Admin) */}
      {currentPage !== 'admin' && (
        <EditorialRotatingBanner variant="top" onBookClick={handleBookNow} />
      )}

      <header
        className={`relative w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#F7F4EE]/92 backdrop-blur-md border-b border-[#171513]/12 py-3 shadow-[0_4px_24px_rgba(23,21,19,0.04)]'
            : 'bg-[#F7F4EE]/80 backdrop-blur-sm border-b border-[#171513]/8 py-4.5'
        }`}
      >
        <div className="max-w-[1320px] mx-auto px-5 sm:px-8 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="font-display text-2xl sm:text-[1.7rem] font-semibold tracking-tight text-[#171513] hover:text-[#96734E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {config.studioTitle || 'Rodrigo Estudio'}
          </button>

          {/* Zone 2: Concise single-line text navigation links */}
          <nav
            aria-label="Navegación principal"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#575049]"
          >
            {navItems.map((item) => (
              <button
                key={item.sectionId}
                type="button"
                onClick={() => handleNavClick(item)}
                className="relative py-1 text-[#4A443E] hover:text-[#171513] transition-colors whitespace-nowrap shrink-0 cursor-pointer after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[1px] after:bg-[#96734E] after:origin-right after:scale-x-0 hover:after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-200"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <MagneticButton
              onClick={handleBookNow}
              className="px-5 py-2.5 bg-[#171513] hover:bg-[#96734E] text-[#F7F4EE] text-xs font-medium tracking-wider uppercase transition-colors duration-200 whitespace-nowrap shrink-0"
            >
              Reservá tu lugar
            </MagneticButton>
          </div>
        </div>

        {/* Scroll-Linked Matte Bronze Reading Progress Line */}
        {currentPage === 'home' && (
          <motion.div
            style={{ scaleX, transformOrigin: '0%' }}
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#96734E] pointer-events-none"
          />
        )}
      </header>
    </div>
  );
};
