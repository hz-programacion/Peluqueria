import React from 'react';
import { StudioProvider, useStudio } from './context/StudioContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { RetroPaperTextureOverlay } from './components/RetroPaperBanda';
import { DynamicSeoManager } from './components/DynamicSeoManager';
import { OfflineIndicator } from './components/PWAInstallButton';
import {
  PageTransitionCurtain,
  PageViewTransitionWrapper,
} from './components/PageTransitionCurtain';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { LookbookPage } from './pages/LookbookPage';
import { ExperiencePage } from './pages/ExperiencePage';
import { BookingPage } from './pages/BookingPage';
import { LocationPage } from './pages/LocationPage';
import { AdminPage } from './pages/AdminPage';

const AppShell: React.FC = () => {
  const { currentPage, config } = useStudio();

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'services':
        return <ServicesPage />;
      case 'lookbook':
        return <LookbookPage />;
      case 'experience':
        return <ExperiencePage />;
      case 'booking':
        return <BookingPage />;
      case 'location':
        return <LocationPage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div
      data-atelier-theme={config.urbanTheme || 'crimson'}
      className="min-h-screen flex flex-col bg-[#F3ECE0] text-[#181512] selection:bg-[#9E2A2B] selection:text-[#FAF6EE] relative overflow-x-hidden transition-colors duration-300"
    >
      {/* Dynamic SEO & OpenGraph Meta Synchronizer */}
      <DynamicSeoManager />

      {/* Global Aged-Paper Fiber & Vintage Vignette Texture */}
      <RetroPaperTextureOverlay />

      {/* Multi-Layer Framer Motion Curtain Transition ("Telón La Banda") */}
      <PageTransitionCurtain />

      <Header />

      <main className="flex-grow relative z-10">
        <PageViewTransitionWrapper pageKey={currentPage}>
          {renderPage()}
        </PageViewTransitionWrapper>
      </main>

      <Footer />

      {/* Non-intrusive PWA Offline Connectivity Indicator */}
      <OfflineIndicator />
    </div>
  );
};

export function App() {
  return (
    <StudioProvider>
      <AppShell />
    </StudioProvider>
  );
}

export default App;
