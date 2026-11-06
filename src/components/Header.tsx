import React, { useState } from 'react';
import { useStudio, AppPage } from '../context/StudioContext';
import { Sun, Moon, Menu, X, Sparkles, Lock, Scissors } from 'lucide-react';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';

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
    <header className="sticky top-0 z-40 w-full border-b border-[#1E212E] bg-[#08090E]/95 backdrop-blur-md transition-colors text-white">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        
        {/* Zone 1: Brand Wordmark with Urban Coordinates */}
        <button
          type="button"
          onMouseEnter={playMechanicalHover}
          onClick={() => {
            playMechanicalClick();
            navigateTo('home');
          }}
          className="text-left group cursor-pointer focus:outline-none flex items-center gap-2.5 sm:gap-3 whitespace-nowrap shrink-0 active:scale-95 transition-transform"
        >
          <span className="w-8 h-8 rounded-lg bg-[#00F0FF] text-black font-extrabold flex items-center justify-center text-xs font-mono tracking-tighter shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            RC
          </span>
          <div>
            <span className="font-display text-base sm:text-lg font-black tracking-wider uppercase text-white group-hover:text-[#00F0FF] transition-colors block leading-tight">
              RODRIGO <span className="text-[#00F0FF] font-mono text-xs font-semibold">CUTSSS</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-500 hidden sm:block">
              VT · VUELTA DE OBLIGADO 931
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links with Tactile Hover Sound */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
          {navLinks.map((link) => {
            const isActive = currentPage === link.page;
            return (
              <button
                key={link.page}
                type="button"
                onMouseEnter={playMechanicalHover}
                onClick={() => {
                  playMechanicalClick();
                  navigateTo(link.page);
                }}
                className={`transition-all whitespace-nowrap shrink-0 py-1 cursor-pointer active:scale-95 ${
                  isActive
                    ? 'text-[#00F0FF] font-black border-b-2 border-[#00F0FF] drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                    : 'hover:text-white hover:drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]'
                }`}
              >
                {link.label}
              </button>
            );
          })}

          {/* Interactive Style Finder */}
          <button
            type="button"
            onMouseEnter={playMechanicalHover}
            onClick={() => {
              playMechanicalClick();
              setIsStyleFinderOpen(true);
            }}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-[#00F0FF] transition-all whitespace-nowrap shrink-0 py-1 cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>Asesor Stencil</span>
          </button>
        </nav>

        {/* Zone 3: Actions + Theme + Admin */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Theme Switcher */}
          <button
            type="button"
            onMouseEnter={playMechanicalHover}
            onClick={() => {
              playMechanicalClick();
              setIsDark(!isDark);
            }}
            aria-label="Cambiar tema visual"
            className="w-9 h-9 rounded-xl border border-[#262836] bg-[#14151D] text-zinc-300 flex items-center justify-center hover:text-white hover:border-[#00F0FF]/50 transition-all cursor-pointer active:scale-90"
          >
            {isDark ? <Sun className="w-4 h-4 text-[#00F0FF]" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Barber Private Portal */}
          <button
            type="button"
            onMouseEnter={playMechanicalHover}
            onClick={() => {
              playMechanicalClick();
              navigateTo('admin');
            }}
            aria-label="Acceso privado del barbero"
            className={`hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-mono rounded-xl border transition-all cursor-pointer active:scale-95 ${
              currentPage === 'admin'
                ? 'border-[#00F0FF] bg-[#00F0FF] text-black font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                : isAdminAuthenticated
                ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                : 'border-[#262836] bg-[#14151D] text-zinc-400 hover:text-white hover:border-[#00F0FF]/40'
            }`}
          >
            <Lock className="w-3 h-3 text-[#00F0FF]" />
            <span className="whitespace-nowrap font-bold">Admin</span>
          </button>

          {/* Primary CTA: Emitir Ticket (Desktop/Tablet) */}
          <button
            type="button"
            onMouseEnter={playMechanicalHover}
            onClick={() => {
              playMechanicalClick();
              navigateTo('booking');
            }}
            className="hidden sm:flex px-4 sm:px-5 py-2.5 text-xs font-mono font-black tracking-wider uppercase bg-[#00F0FF] text-black hover:bg-[#00d5e5] active:scale-95 transition-all rounded-xl whitespace-nowrap shrink-0 cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.25)] items-center gap-1.5"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>{selectedServiceIds.length > 0 ? `Turnos (${selectedServiceIds.length})` : 'Emitir Ticket'}</span>
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
            className="lg:hidden w-9 h-9 rounded-xl border border-[#262836] bg-[#14151D] flex items-center justify-center cursor-pointer text-white hover:border-[#00F0FF] active:scale-90 transition-all"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 text-[#00F0FF]" /> : <Menu className="w-4 h-4" />}
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
                onMouseEnter={playMechanicalHover}
                onClick={() => {
                  playMechanicalClick();
                  navigateTo(link.page);
                  setMobileMenuOpen(false);
                }}
                className={`p-3 text-left text-xs uppercase tracking-wider font-mono font-bold rounded-xl border transition-all cursor-pointer active:scale-95 ${
                  currentPage === link.page
                    ? 'border-[#00F0FF] bg-[#151D24] text-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.15)]'
                    : 'border-[#20222D] bg-[#12131C] text-zinc-400 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onMouseEnter={playMechanicalHover}
            onClick={() => {
              playMechanicalClick();
              setIsStyleFinderOpen(true);
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-[#181A24] border border-[#2B2D3D] text-xs font-mono font-bold text-zinc-200 cursor-pointer hover:border-[#00F0FF] active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#00F0FF]" />
            <span>Abrir Asesor Stencil</span>
          </button>

          <div className="pt-3 border-t border-[#22242F] flex items-center justify-between text-xs">
            <span className="font-mono text-zinc-500">Venado Tuerto · Solo Hombres</span>
            <button
              type="button"
              onMouseEnter={playMechanicalHover}
              onClick={() => {
                playMechanicalClick();
                navigateTo('admin');
                setMobileMenuOpen(false);
              }}
              className="text-[#00F0FF] font-mono flex items-center gap-1 font-bold cursor-pointer hover:underline"
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
