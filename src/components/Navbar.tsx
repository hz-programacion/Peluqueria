import React, { useEffect, useState } from 'react';

interface NavbarProps {
  selectedCount: number;
  onJumpToBooking: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ selectedCount, onJumpToBooking }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 border-b border-stone-300/70 dark:border-white/[0.08] bg-[#F7F5F0]/85 dark:bg-[#0C0C0D]/85 backdrop-blur-md ${
        scrolled ? 'py-3' : 'py-5'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 flex items-center justify-between gap-3 md:gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          className="font-editorial text-base sm:text-xl md:text-2xl font-semibold tracking-[0.08em] md:tracking-[0.14em] uppercase text-[#141415] dark:text-[#F4F4F6] whitespace-nowrap shrink-0"
        >
          Valentín Moretti
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav
          aria-label="Navegación principal"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600 dark:text-[#8E8E93]"
        >
          <a
            href="#espacio"
            className="hover:text-[#141415] dark:hover:text-[#F4F4F6] underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
          >
            El Espacio
          </a>
          <a
            href="#servicios"
            className="hover:text-[#141415] dark:hover:text-[#F4F4F6] underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
          >
            Servicios
          </a>
          <a
            href="#lookbook"
            className="hover:text-[#141415] dark:hover:text-[#F4F4F6] underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
          >
            Lookbook
          </a>
          <a
            href="#resenas"
            className="hover:text-[#141415] dark:hover:text-[#F4F4F6] underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
          >
            Reseñas
          </a>
          <a
            href="#ubicacion"
            className="hover:text-[#141415] dark:hover:text-[#F4F4F6] underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
          >
            Ubicación
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onJumpToBooking}
            className="px-3.5 py-2 md:px-5 md:py-2.5 text-[11px] md:text-xs font-semibold tracking-wider uppercase bg-[#141415] text-[#F4F4F6] dark:bg-[#C5A880] dark:text-[#0C0C0D] hover:opacity-90 transition-opacity rounded-sm whitespace-nowrap shrink-0 cursor-pointer"
          >
            {selectedCount > 0 ? `Reservar Turno (${selectedCount})` : 'Reservar Turno'}
          </button>
        </div>
      </div>
    </header>
  );
};
