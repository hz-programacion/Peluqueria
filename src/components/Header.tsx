import React, { useState } from 'react';
import { useStudio, AppPage } from '../context/StudioContext';
import { Sun, Moon, Menu, X, Sparkles, Lock, Scissors, Instagram } from 'lucide-react';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';

export const Header: React.FC = () => {
  const {
    currentPage,
    navigateTo,
    isDark,
    setIsDark,
    selectedServiceIds,
    isAdminAuthenticated,
  } = useStudio();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { label: string; page: AppPage }[] = [
    { label: 'Presentación', page: 'home' },
    { label: 'El Barbero', page: 'experience' },
    { label: 'Galería', page: 'lookbook' },
    { label: 'Servicios ($12K)', page: 'services' },
    { label: 'Ubicación', page: 'location' },
    { label: 'Reservar Turno', page: 'booking' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#23273A] bg-[#0A0B10]/95 backdrop-blur-md transition-colors text-white">
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
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#A855F7] to-[#FF4655] text-white font-extrabold flex items-center justify-center text-xs font-mono tracking-tighter shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            RC
          </span>
          <div>
            <span className="font-display text-base sm:text-lg font-black tracking-wider uppercase text-white group-hover:text-[#A855F7] transition-colors block leading-tight">
              RODRIGO <span className="text-[#FF4655] font-mono text-xs font-bold">CUTSSS</span>
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
                    ? 'text-[#A855F7] font-black border-b-2 border-[#A855F7] drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]'
                    : 'hover:text-white hover:drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions + Instagram + Theme + Admin */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          
          {/* Direct Instagram Link Button */}
          <a
            href="https://instagram.com/rodrigo.cutsss"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={playMechanicalHover}
            onClick={playMechanicalClick}
            aria-label="Instagram @rodrigo.cutsss"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono rounded-xl border border-[#2E334D] bg-[#141624] text-zinc-300 hover:text-white hover:border-[#D946EF] transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            <Instagram className="w-3.5 h-3.5 text-[#D946EF]" />
            <span className="font-bold text-[11px]">@rodrigo.cutsss</span>
          </a>

          {/* Theme Switcher */}
          <button
            type="button"
            onMouseEnter={playMechanicalHover}
            onClick={() => {
              playMechanicalClick();
              setIsDark(!isDark);
            }}
            aria-label="Cambiar tema visual"
            className="w-9 h-9 rounded-xl border border-[#262A3E] bg-[#141622] text-zinc-300 flex items-center justify-center hover:text-white hover:border-[#A855F7]/60 transition-all cursor-pointer active:scale-90"
          >
            {isDark ? <Sun className="w-4 h-4 text-[#FF4655]" /> : <Moon className="w-4 h-4" />}
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
                ? 'border-[#A855F7] bg-[#A855F7] text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.35)]'
                : isAdminAuthenticated
                ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                : 'border-[#262A3E] bg-[#141622] text-zinc-400 hover:text-white hover:border-[#A855F7]/40'
            }`}
          >
            <Lock className="w-3 h-3 text-[#A855F7]" />
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
            className="hidden sm:flex px-4 sm:px-5 py-2.5 text-xs font-mono font-black tracking-wider uppercase bg-gradient-to-r from-[#A855F7] to-[#D946EF] hover:from-[#9333EA] hover:to-[#C026D3] text-white active:scale-95 transition-all rounded-xl whitespace-nowrap shrink-0 cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.3)] items-center gap-1.5"
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
            className="lg:hidden w-9 h-9 rounded-xl border border-[#262A3E] bg-[#141622] flex items-center justify-center cursor-pointer text-white hover:border-[#A855F7] active:scale-90 transition-all"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 text-[#A855F7]" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#22263A] bg-[#0E1018] px-5 py-4 space-y-3">
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
                    ? 'border-[#A855F7] bg-[#1E152E] text-[#A855F7] shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                    : 'border-[#202436] bg-[#131522] text-zinc-400 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Direct Mobile Links */}
          <div className="pt-2 flex flex-col gap-2">
            <a
              href="https://instagram.com/rodrigo.cutsss"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 text-center text-xs font-mono font-bold rounded-xl border border-[#D946EF]/40 bg-[#1D1429] text-white flex items-center justify-center gap-2"
            >
              <Instagram className="w-4 h-4 text-[#D946EF]" />
              <span>Escribir por Instagram DM (@rodrigo.cutsss)</span>
            </a>
          </div>

          <div className="pt-3 border-t border-[#22263A] flex items-center justify-between text-xs">
            <span className="font-mono text-zinc-500">Venado Tuerto · Solo Hombres</span>
            <button
              type="button"
              onMouseEnter={playMechanicalHover}
              onClick={() => {
                playMechanicalClick();
                navigateTo('admin');
                setMobileMenuOpen(false);
              }}
              className="text-[#A855F7] font-mono flex items-center gap-1 font-bold cursor-pointer hover:underline"
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
