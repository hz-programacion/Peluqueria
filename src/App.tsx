import React from 'react';
import { StudioProvider, useStudio } from './context/StudioContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { LookbookPage } from './pages/LookbookPage';
import { ExperiencePage } from './pages/ExperiencePage';
import { LocationPage } from './pages/LocationPage';
import { BookingPage } from './pages/BookingPage';
import { AdminPage } from './pages/AdminPage';
import { UrbanBoombox } from './components/UrbanBoombox';
import { UrbanParallaxBackground } from './components/UrbanParallaxBackground';
import { MessageCircle, Scissors, Instagram } from 'lucide-react';
import { resolveInstagramInfo, resolveWhatsAppInfo } from './utils/bookingEngine';
import { playMechanicalHover, playMechanicalClick } from './utils/audioFeedback';

const AppContent: React.FC = () => {
  const { currentPage, navigateTo, config } = useStudio();
  const igInfo = resolveInstagramInfo(config.instagram);
  const waInfo = resolveWhatsAppInfo(config.phoneDisplay, config.whatsappRaw);

  const renderCurrentView = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'services':
        return <ServicesPage />;
      case 'lookbook':
        return <LookbookPage />;
      case 'experience':
        return <ExperiencePage />;
      case 'location':
        return <LocationPage />;
      case 'booking':
        return <BookingPage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-[#0A0B0E] text-zinc-100 transition-colors selection:bg-[#D4A373] selection:text-zinc-950">
      {/* Clean Subtle Architectural Background */}
      <UrbanParallaxBackground />

      {/* Top Application Header */}
      <Header />

      {/* Main Dynamic Viewport */}
      <main className="relative z-10 flex-1">{renderCurrentView()}</main>

      {/* Modern Studio Footer */}
      <Footer />

      {/* Floating "Bienvenido" Audio Button */}
      {currentPage !== 'admin' && <UrbanBoombox />}

      {/* Mobile Floating Bottom Bar (Only on mobile <lg, unless in admin page) */}
      {currentPage !== 'admin' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 px-3 bg-[#0A0B0E]/95 backdrop-blur-md border-t border-[#232730] flex items-center gap-2">
          <button
            type="button"
            onMouseEnter={playMechanicalHover}
            onClick={() => {
              playMechanicalClick();
              navigateTo('booking');
            }}
            className="flex-1 h-11 bg-[#D4A373] text-zinc-950 text-xs font-mono font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Reservar ({config.mainPriceDisplay})</span>
          </button>

          <a
            href={igInfo.url}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={playMechanicalHover}
            onClick={playMechanicalClick}
            aria-label="Escribir por Instagram DM"
            className="h-11 w-11 border border-[#282D37] bg-[#111318] text-[#D4A373] rounded-xl inline-flex items-center justify-center shrink-0 hover:border-[#D4A373] active:scale-95 transition-all"
          >
            <Instagram className="w-4 h-4" />
          </a>

          <a
            href={`${waInfo.url}?text=${encodeURIComponent(
              `Hola ${config.authorName}, tengo una consulta antes de reservar`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={playMechanicalHover}
            onClick={playMechanicalClick}
            aria-label="Consultar por WhatsApp"
            className="h-11 px-3.5 border border-[#282D37] bg-[#111318] text-white rounded-xl inline-flex items-center justify-center gap-1.5 text-xs font-mono font-bold whitespace-nowrap shrink-0 hover:border-[#D4A373] active:scale-98 transition-all"
          >
            <MessageCircle className="w-4 h-4 text-[#D4A373]" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <StudioProvider>
      <AppContent />
    </StudioProvider>
  );
}
