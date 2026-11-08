import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useStudio } from '../context/StudioContext';
import { RetroRiverCrestBadge } from './RetroPaperBanda';

/**
 * Multi-layer Framer Motion Curtain & Page Transition System ("Telón La Banda")
 * Provides both an editorial curtain sweep on navigation and smooth exit/enter
 * fade-and-slide view transitions.
 */
export const PageTransitionCurtain: React.FC = () => {
  const { curtainTransition, config } = useStudio();
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <AnimatePresence>
      {curtainTransition && (
        <motion.div
          key={curtainTransition.id}
          data-testid="page-transition-curtain"
          aria-hidden="true"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[90] pointer-events-none overflow-hidden flex items-center justify-center"
        >
          {/* Layer 1: Carmine Heritage Lead Curtain */}
          <motion.div
            initial={{ scaleY: 0, originY: 1 }}
            animate={{
              scaleY: [0, 1, 1, 0],
              originY: [1, 1, 0, 0],
            }}
            transition={{
              duration: 0.48,
              times: [0, 0.36, 0.64, 1],
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute inset-0 bg-[#9E2A2B]"
          />

          {/* Layer 2: Aged-Paper & Subtle Diagonal Sash Curtain */}
          <motion.div
            initial={{ scaleY: 0, originY: 1 }}
            animate={{
              scaleY: [0, 1, 1, 0],
              originY: [1, 1, 0, 0],
            }}
            transition={{
              duration: 0.46,
              delay: 0.03,
              times: [0, 0.38, 0.62, 1],
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute inset-0 bg-[#FAF6EE] border-y-2 border-[#9E2A2B] flex items-center justify-center overflow-hidden"
          >
            {/* Subtle Diagonal River Plate Sash inside the Curtain */}
            <div
              className="absolute inset-0 opacity-12 pointer-events-none"
              style={{
                background:
                  'linear-gradient(135deg, transparent 42%, #9E2A2B 42%, #9E2A2B 58%, transparent 58%)',
              }}
            />

            {/* Centered Destination Crest & Title */}
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [12, 0, 0, -10],
                scale: [0.96, 1, 1, 0.98],
              }}
              transition={{
                duration: 0.42,
                times: [0, 0.3, 0.72, 1],
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative z-10 flex flex-col items-center text-center px-6 py-4 rounded-xl bg-[#FAF6EE]/95 border border-[#C8BBA4] shadow-[0_16px_40px_rgba(24,21,18,0.12)]"
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <RetroRiverCrestBadge size="sm" />
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#9E2A2B] font-bold">
                  {curtainTransition.subtitle || config.studioTitle}
                </span>
              </div>
              <span className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#181512]">
                {curtainTransition.label}
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface PageViewTransitionWrapperProps {
  pageKey: string;
  children: React.ReactNode;
}

export const PageViewTransitionWrapper: React.FC<PageViewTransitionWrapperProps> = ({
  pageKey,
  children,
}) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      key={pageKey}
      data-testid={`page-view-${pageKey}`}
      initial={
        prefersReducedMotion
          ? { opacity: 1 }
          : { opacity: 0, y: 20, scale: 0.992 }
      }
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.38,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative will-change-transform"
    >
      {/* Subtle Top Curtain Unveil Accent Bar on Enter */}
      {!prefersReducedMotion && (
        <motion.div
          aria-hidden="true"
          initial={{ scaleX: 0, opacity: 0.9 }}
          animate={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: '0% 50%' }}
          className="h-[3px] w-full bg-gradient-to-r from-[#9E2A2B] via-[#B89146] to-[#9E2A2B] pointer-events-none"
        />
      )}
      {children}
    </motion.div>
  );
};

