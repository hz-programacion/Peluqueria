import React, { useState } from 'react';
import { useStudio, AppPage } from '../context/StudioContext';
import { Sun, Moon, Menu, X, Sparkles, Lock, Scissors } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentPage,
    navigateTo,
    isDark,
    setIsDark,
    selectedServiceIds,
    isAdminAuthenticated,
    setIsStyleFinderOpen,
  } = useStudio();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { label: string; page: AppPage }[] = [
    { label: 'Cortes & Fades', page: 'services' },
    { label: 'Lookbook Zine', page: 'lookbook' },
    { label: 'El Estudio', page: 'experience' },
    { label: 'Ubicación', page: 'location' },
    { label: 'Reservar Turno', page: 'booking' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#22242F] bg-[#0A0B10]/95 backdrop-blur-md transition-colors text-white">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        
        {/* Zone 1: Brand Wordmark with Urban Coordinates */}
        <button
          type="button"
          onClick={() => navigateTo('home')}
          className="text-left group cursor-pointer focus:outline-none flex items-center gap-3 whitespace-nowrap shrink-0"
        >
          <span className="w-8 h-8 rounded-lg bg-[#D4FF00] text-black font-extrabold flex items-center justify-center text-xs font-mono tracking-tighter">
            MU
          </span>
          <div>
            <span className="font-display text-base sm:text-lg font-black tracking-wider uppercase text-white group-hover:text-[#D4FF00] transition-colors block leading-tight">
              MORETTI <span className="text-[#D4FF00] font-mono text-xs font-semibold">// STUDIO</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-500 hidden sm:block">
              PALERMO SOHO · 34.58° S
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
          {navLinks.map((link) => {
            const isActive = currentPage === link.page;
            return (
              <button
                key={link.page}
                type="button"
                onClick={() => navigateTo(link.page)}
                className={`transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
                  isActive
                    ? 'text-[#D4FF00] font-black border-b-2 border-[#D4FF00]'
                    : 'hover:text-white'
                }`}
              >
                {link.label}
              </button>
            );
          })}

          {/* Interactive Style Finder */}
          <button
            type="button"
            onClick={() => setIsStyleFinderOpen(true)}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-[#D4FF00] transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4FF00]" />
            <span>Asesor Stencil</span>
          </button>
        </nav>

        {/* Zone 3: Actions + Theme + Admin */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Theme Switcher */}
          <button
            type="button"
            onClick={() => setIsDark(!isDark)}
            aria-label="Cambiar tema visual"
            className="w-9 h-9 rounded-xl border border-[#262836] bg-[#14151D] text-zinc-300 flex items-center justify-center hover:text-white hover:border-zinc-500 transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-[#D4FF00]" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Barber Private Portal */}
          <button
            type="button"
            onClick={() => navigateTo('admin')}
            aria-label="Acceso privado del barbero"
            className={`hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-mono rounded-xl border transition-colors cursor-pointer ${
              currentPage === 'admin'
                ? 'border-[#D4FF00] bg-[#D4FF00] text-black font-bold'
                : isAdminAuthenticated
                ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                : 'border-[#262836] bg-[#14151D] text-zinc-400 hover:text-white hover:border-zinc-500'
            }`}
          >
            <Lock className="w-3 h-3 text-[#D4FF00]" />
            <span className="whitespace-nowrap font-bold">Admin</span>
          </button>

          {/* Primary CTA: Emitir Ticket */}
          <button
            type="button"
            onClick={() => navigateTo('booking')}
            className="px-4 sm:px-5 py-2.5 text-xs font-mono font-black tracking-wider uppercase bg-[#D4FF00] text-black hover:bg-[#bde400] transition-colors rounded-xl whitespace-nowrap shrink-0 cursor-pointer shadow-md flex items-center gap-1.5"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>{selectedServiceIds.length > 0 ? `Turnos (${selectedServiceIds.length})` : 'Emitir Ticket'}</span>
          </button>

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menú"
            className="lg:hidden w-9 h-9 rounded-xl border border-[#262836] bg-[#14151D] flex items-center justify-center cursor-pointer text-white"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#22242F] bg-[#0E0F16] px-5 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <button
                key={link.page}
                type="button"
                onClick={() => {
                  navigateTo(link.page);
                  setMobileMenuOpen(false);
                }}
                className={`p-3 text-left text-xs uppercase tracking-wider font-mono font-bold rounded-xl border transition-colors cursor-pointer ${
                  currentPage === link.page
                    ? 'border-[#D4FF00] bg-[#181924] text-[#D4FF00]'
                    : 'border-[#20222D] bg-[#12131C] text-zinc-400 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setIsStyleFinderOpen(true);
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-[#181A24] border border-[#2B2D3D] text-xs font-mono font-bold text-zinc-200 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#D4FF00]" />
            <span>Abrir Asesor Stencil</span>
          </button>

          <div className="pt-3 border-t border-[#22242F] flex items-center justify-between text-xs">
            <span className="font-mono text-zinc-500">Palermo Soho · Solo Hombres</span>
            <button
              type="button"
              onClick={() => {
                navigateTo('admin');
                setMobileMenuOpen(false);
              }}
              className="text-[#D4FF00] font-mono flex items-center gap-1 font-bold cursor-pointer"
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
