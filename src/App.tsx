import React from 'react';
import { StudioProvider, useStudio } from './context/StudioContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { StyleFinderModal } from './components/StyleFinderModal';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { LookbookPage } from './pages/LookbookPage';
import { ExperiencePage } from './pages/ExperiencePage';
import { LocationPage } from './pages/LocationPage';
import { BookingPage } from './pages/BookingPage';
import { AdminPage } from './pages/AdminPage';
import { UrbanBoombox } from './components/UrbanBoombox';
import { UrbanParallaxBackground } from './components/UrbanParallaxBackground';
import { MessageCircle, Scissors } from 'lucide-react';
import { playMechanicalHover, playMechanicalClick } from './utils/audioFeedback';

const AppContent: React.FC = () => {
  const { currentPage, navigateTo, config } = useStudio();

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
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-[#08090D] text-zinc-100 transition-colors selection:bg-[#00F0FF] selection:text-black">
      {/* Subtle Mouse-Reactive Urban Parallax Background with Framer Motion */}
      <UrbanParallaxBackground />

      {/* Top Application Header */}
      <Header />

      {/* Global Interactive Style Finder Modal */}
      <StyleFinderModal />

      {/* Main Dynamic Viewport */}
      <main className="relative z-10 flex-1">
        {renderCurrentView()}
      </main>

      {/* Modern Studio Footer */}
      <Footer />

      {/* Urban Studio Boombox & Ambient Beat Generator */}
      {currentPage !== 'admin' && <UrbanBoombox />}

      {/* Mobile Floating Bottom Bar (Only on mobile <lg, unless in admin page) */}
      {currentPage !== 'admin' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 px-4 bg-[#08090D]/95 backdrop-blur-md border-t border-[#1F2230] flex items-center gap-3">
          <button
            type="button"
            onMouseEnter={playMechanicalHover}
            onClick={() => {
              playMechanicalClick();
              navigateTo('booking');
            }}
            className="flex-1 h-11 bg-[#00F0FF] text-black text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.25)] hover:bg-[#00d8e6] active:scale-98 transition-all"
          >
            Reservar Turno
          </button>
          <a
            href={`https://wa.me/${config.whatsappRaw}?text=Hola%20${encodeURIComponent(config.authorName)},%20tengo%20una%20consulta%20antes%20de%20reservar`}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={playMechanicalHover}
            onClick={playMechanicalClick}
            aria-label="Consultar por WhatsApp"
            className="h-11 px-4 border border-[#272938] bg-[#14151E] text-white rounded-xl inline-flex items-center justify-center gap-1.5 text-xs font-mono font-bold whitespace-nowrap shrink-0 hover:border-[#00F0FF] active:scale-98 transition-all"
          >
            <MessageCircle className="w-4 h-4 text-[#00F0FF]" />
            <span>WhatsApp</span>
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
