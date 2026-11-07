import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { StudioProvider, useStudio } from './context/StudioContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { LookbookPage } from './pages/LookbookPage';
import { ExperiencePage } from './pages/ExperiencePage';
import { BookingPage } from './pages/BookingPage';
import { LocationPage } from './pages/LocationPage';
import { AdminPage } from './pages/AdminPage';

const AppShell: React.FC = () => {
  const { currentPage } = useStudio();

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
    <div className="min-h-screen flex flex-col bg-[#F7F4EE] text-[#171513] selection:bg-[#96734E] selection:text-[#F7F4EE] relative overflow-x-hidden">
      <Header />

      <main className="flex-grow relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
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
