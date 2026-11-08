import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DripNode {
  id: number;
  x: number;
  y: number;
  dripLength: number;
  radius: number;
  color: string;
  hasSecondaryDrip: boolean;
}

const URBAN_DRIP_PALETTE = ['#9E2A2B', '#F3EFE6', '#7A2021', '#C5A059', '#B8B1A4'];

/**
 * Expressive mouse-following graffiti 'drip' trail using SVG paths and framer-motion.
 * Spawns multi-color aerosol mist + vertical paint drip paths as the user moves across sections.
 */
export const GraffitiDripTrail: React.FC = () => {
  const [drips, setDrips] = useState<DripNode[]>([]);
  const lastPosRef = useRef<{ x: number; y: number; time: number }>({
    x: 0,
    y: 0,
    time: 0,
  });
  const counterRef = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      const dx = e.clientX - lastPosRef.current.x;
      const dy = e.clientY - lastPosRef.current.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 56 && now - lastPosRef.current.time > 90) {
        lastPosRef.current = { x: e.clientX, y: e.clientY, time: now };
        const id = ++counterRef.current;
        const color = URBAN_DRIP_PALETTE[id % URBAN_DRIP_PALETTE.length];
        const dripLength = 28 + (id % 4) * 16;
        const radius = 2.6 + (id % 3) * 1.3;

        const nextNode: DripNode = {
          id,
          x: e.clientX,
          y: e.clientY,
          dripLength,
          radius,
          color,
          hasSecondaryDrip: id % 2 === 0,
        };

        setDrips((prev) => [...prev.slice(-12), nextNode]);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Automatically prune expired drip nodes
  useEffect(() => {
    if (drips.length === 0) return;
    const timer = setTimeout(() => {
      setDrips((prev) => prev.slice(1));
    }, 950);
    return () => clearTimeout(timer);
  }, [drips]);

  return (
    <div
      aria-hidden="true"
      data-testid="graffiti-drip-trail"
      className="fixed inset-0 pointer-events-none z-20 overflow-hidden select-none"
    >
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <AnimatePresence>
          {drips.map((node) => (
            <motion.g
              key={node.id}
              initial={{ opacity: 0.72 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.15, ease: 'easeOut' }}
            >
              {/* Aerosol Splatter Origin Dot */}
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={node.radius}
                fill={node.color}
                initial={{ scale: 0.4, opacity: 0.65 }}
                animate={{ scale: 1.25, opacity: 0 }}
                transition={{ duration: 0.85, ease: 'easeOut' }}
              />

              {/* Micro Spray Satellites */}
              <circle
                cx={node.x - 5}
                cy={node.y - 3}
                r={1.1}
                fill={node.color}
                opacity={0.45}
              />
              <circle
                cx={node.x + 4}
                cy={node.y - 4}
                r={0.9}
                fill={node.color}
                opacity={0.4}
              />

              {/* Primary Vertical Graffiti Drip SVG Path */}
              <motion.path
                d={`M ${node.x} ${node.y} Q ${node.x + 0.6} ${
                  node.y + node.dripLength * 0.5
                } ${node.x} ${node.y + node.dripLength}`}
                fill="none"
                stroke={node.color}
                strokeWidth={1.8}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0.65 }}
                animate={{ pathLength: 1, opacity: 0 }}
                transition={{ duration: 0.95, ease: 'easeOut' }}
              />

              {/* Falling Paint Droplet Bead at Tip */}
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={1.8}
                fill={node.color}
                initial={{ y: 0, opacity: 0.7 }}
                animate={{ y: node.dripLength + 5, opacity: 0 }}
                transition={{ duration: 0.95, ease: 'easeOut' }}
              />

              {/* Optional Secondary Micro-Drip Satellite */}
              {node.hasSecondaryDrip && (
                <motion.path
                  d={`M ${node.x + 6} ${node.y + 3} L ${node.x + 6} ${
                    node.y + node.dripLength * 0.58
                  }`}
                  fill="none"
                  stroke={node.color}
                  strokeWidth={1.1}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0.45 }}
                  animate={{ pathLength: 1, opacity: 0 }}
                  transition={{ duration: 0.75, delay: 0.05, ease: 'easeOut' }}
                />
              )}
            </motion.g>
          ))}
        </AnimatePresence>
      </svg>
    </div>
  );
};
