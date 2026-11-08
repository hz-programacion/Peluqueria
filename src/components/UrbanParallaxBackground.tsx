import React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useStudio } from '../context/StudioContext';

/**
 * Subtle Aged-Paper & Vintage Carmine Diagonal Weave Parallax Background.
 * Evokes historical 1950s–1970s editorial match programs & classic River Plate heritage on aged paper.
 */
export const UrbanParallaxBackground: React.FC = () => {
  const { config } = useStudio();
  const { scrollY } = useScroll();

  const ySlow = useTransform(scrollY, [0, 3000], [0, -140]);
  const yMedium = useTransform(scrollY, [0, 3000], [0, -240]);

  if (!config.enableParallax) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* Layer 1: Warm Aged Parchment & Subtle Carmine Ambient Wash */}
      <motion.div style={{ y: ySlow }} className="absolute -inset-24 opacity-45">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 16% 18%, rgba(158, 42, 43, 0.06) 0%, transparent 44%),
              radial-gradient(circle at 84% 48%, rgba(184, 145, 70, 0.08) 0%, transparent 42%),
              radial-gradient(circle at 30% 82%, rgba(158, 42, 43, 0.05) 0%, transparent 48%)
            `,
          }}
        />
      </motion.div>

      {/* Layer 2: Subtle Diagonal Carmine & Sepia Pinstripe Weave ("La Banda" Sastrería) */}
      <motion.div style={{ y: yMedium }} className="absolute inset-0 opacity-[0.065]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="retro-paper-banda-weave"
              width="140"
              height="140"
              patternTransform="rotate(38 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="140" stroke="#9E2A2B" strokeWidth="1.2" />
              <line x1="8" y1="0" x2="8" y2="140" stroke="#8A6E4B" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#retro-paper-banda-weave)" />
        </svg>
      </motion.div>
    </div>
  );
};
