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
import { MessageCircle, Scissors } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col justify-between overflow-x-hidden bg-[#0C0D12] text-zinc-100 dark:bg-[#0C0D12] dark:text-zinc-100 transition-colors selection:bg-[#D4FF00] selection:text-black">
      {/* Top Application Header */}
      <Header />

      {/* Global Interactive Style Finder Modal */}
      <StyleFinderModal />

      {/* Main Dynamic Viewport */}
      <main className="flex-1">
        {renderCurrentView()}
      </main>

      {/* Modern Studio Footer */}
      <Footer />

      {/* Urban Studio Boombox & Ambient Beat Generator */}
      {currentPage !== 'admin' && <UrbanBoombox />}

      {/* Mobile Floating Bottom Bar (Only on mobile <lg, unless in admin page) */}
      {currentPage !== 'admin' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 px-4 bg-[#0C0D12]/95 backdrop-blur-md border-t border-[#222432] flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigateTo('booking')}
            className="flex-1 h-11 bg-[#D4FF00] text-black text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-md"
          >
            Reservar Turno
          </button>
          <a
            href={`https://wa.me/${config.whatsappRaw}?text=Hola%20${encodeURIComponent(config.authorName)},%20tengo%20una%20consulta%20antes%20de%20reservar`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Consultar por WhatsApp"
            className="h-11 px-4 border border-[#272938] bg-[#14151E] text-white rounded-xl inline-flex items-center justify-center gap-1.5 text-xs font-mono font-bold whitespace-nowrap shrink-0 hover:border-[#D4FF00]"
          >
            <MessageCircle className="w-4 h-4 text-[#D4FF00]" />
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
