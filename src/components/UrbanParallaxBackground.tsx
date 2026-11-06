import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export const UrbanParallaxBackground: React.FC = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Raw mouse coordinates normalized to [-0.5, 0.5]
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for buttery physical glide
  const springConfig = { damping: 30, stiffness: 80, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Parallax transform layers
  // Layer 1: Slow / Distant (Giant typographical background stencils)
  const layer1X = useTransform(smoothX, [-0.5, 0.5], [-25, 25]);
  const layer1Y = useTransform(smoothY, [-0.5, 0.5], [-18, 18]);

  // Layer 2: Mid-Depth (Coordinates, crosshairs, street markers)
  const layer2X = useTransform(smoothX, [-0.5, 0.5], [-50, 50]);
  const layer2Y = useTransform(smoothY, [-0.5, 0.5], [-35, 35]);

  // Layer 3: Near / Floating Accents (Neon glow spots, badges, razor specs)
  const layer3X = useTransform(smoothX, [-0.5, 0.5], [-80, 80]);
  const layer3Y = useTransform(smoothY, [-0.5, 0.5], [-60, 60]);

  useEffect(() => {
    // Detect touch / mobile device
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth) - 0.5;
      const y = (e.clientY / innerHeight) - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none opacity-90"
    >
      {/* Subtle Noise / Concrete Ambient Background Shading */}
      <div className="absolute inset-0 bg-[#0A0B10] opacity-100" />
      
      {/* Ambient Neon Atmosphere Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#A855F7]/[0.06] blur-[120px]" />
      <div className="absolute top-1/2 -right-40 w-[30rem] h-[30rem] rounded-full bg-[#FF4655]/[0.045] blur-[150px]" />
      <div className="absolute -bottom-40 left-1/3 w-[26rem] h-[26rem] rounded-full bg-[#D946EF]/[0.04] blur-[130px]" />

      {/* ================================================================ */}
      {/* LAYER 1: DEEP PARALLAX (Massive Outlined Typography & Watermark) */}
      {/* ================================================================ */}
      <motion.div
        style={!isTouchDevice ? { x: layer1X, y: layer1Y } : undefined}
        animate={isTouchDevice ? { x: [0, 12, -12, 0], y: [0, -8, 8, 0] } : undefined}
        transition={isTouchDevice ? { repeat: Infinity, duration: 16, ease: 'easeInOut' } : undefined}
        className="absolute inset-0 flex flex-col justify-between py-12 pointer-events-none"
      >
        {/* Top Watermark */}
        <div className="flex justify-between items-center px-6 md:px-16 opacity-[0.035] font-display font-black text-6xl sm:text-8xl md:text-9xl tracking-tighter text-white uppercase select-none leading-none">
          <span>RODRIGO</span>
          <span>931</span>
        </div>

        {/* Center Giant Watermark */}
        <div className="w-full text-center opacity-[0.03] font-display font-black text-7xl sm:text-9xl md:text-[14rem] tracking-tight text-white uppercase select-none leading-none">
          CUTSSS
        </div>

        {/* Bottom Location Watermark */}
        <div className="flex justify-between items-center px-6 md:px-16 opacity-[0.045] font-mono font-bold text-sm sm:text-lg md:text-xl tracking-widest text-[#FF4655] uppercase select-none">
          <span>VENADO TUERTO // SANTA FE</span>
          <span>LAT 33.74° S</span>
        </div>
      </motion.div>

      {/* ================================================================ */}
      {/* LAYER 2: MID-DEPTH PARALLAX (Technical Stencils, Grids & Reticles) */}
      {/* ================================================================ */}
      <motion.div
        style={!isTouchDevice ? { x: layer2X, y: layer2Y } : undefined}
        animate={isTouchDevice ? { x: [0, -18, 18, 0], y: [0, 10, -10, 0] } : undefined}
        transition={isTouchDevice ? { repeat: Infinity, duration: 20, ease: 'easeInOut' } : undefined}
        className="absolute inset-0 pointer-events-none"
      >
        {/* Top-Right Technical Grid Tag */}
        <div className="absolute top-28 right-8 md:right-20 border border-[#A855F7]/30 bg-black/60 backdrop-blur-sm p-3 rounded-xl font-mono text-[10px] text-[#A855F7] tracking-widest uppercase hidden sm:block shadow-[0_0_15px_rgba(168,85,247,0.1)]">
          <div>LOC: VUELTA DE OBLIGADO 931</div>
          <div className="text-zinc-400 font-semibold mt-0.5">ZONE: VENADO TUERTO · SF</div>
          <div className="mt-1 flex items-center gap-1.5 text-[9px] text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4655] animate-pulse" />
            <span>ESTUDIO DE AUTOR 1 A 1</span>
          </div>
        </div>

        {/* Left Side Reticle / Crosshair */}
        <div className="absolute top-1/3 left-4 md:left-12 opacity-35 text-[#A855F7] font-mono text-xs hidden lg:flex flex-col items-center gap-1">
          <div className="w-8 h-8 border border-[#A855F7]/40 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-[#FF4655] rounded-full shadow-[0_0_8px_#FF4655]" />
          </div>
          <span className="text-[9px] tracking-widest text-zinc-400">33.7456° S</span>
        </div>

        {/* Right Center Target Decal */}
        <div className="absolute top-2/3 right-6 md:right-16 opacity-30 text-white font-mono text-xs hidden md:block">
          <div className="border-l-2 border-t-2 border-[#FF4655] w-6 h-6 mb-1" />
          <div className="text-[10px] tracking-wider text-zinc-400 font-bold uppercase">
            STENCIL SPEC // 0.0 MM
          </div>
        </div>
      </motion.div>

      {/* ================================================================ */}
      {/* LAYER 3: FOREGROUND ACCENTS (Badges, Floating Specs & Light) */}
      {/* ================================================================ */}
      <motion.div
        style={!isTouchDevice ? { x: layer3X, y: layer3Y } : undefined}
        animate={isTouchDevice ? { x: [0, 20, -20, 0], y: [0, -14, 14, 0] } : undefined}
        transition={isTouchDevice ? { repeat: Infinity, duration: 14, ease: 'easeInOut' } : undefined}
        className="absolute inset-0 pointer-events-none"
      >
        {/* Floating Neon Badge: Service & Price Tag (Desktop/Tablet) */}
        <div className="absolute top-44 left-6 sm:left-16 lg:left-24 px-3.5 py-1.5 rounded-xl border border-[#A855F7]/40 bg-black/75 shadow-[0_0_20px_rgba(168,85,247,0.2)] text-[#A855F7] font-mono font-black text-[11px] tracking-widest uppercase hidden sm:flex items-center gap-2">
          <span className="w-2 h-2 bg-[#FF4655] rounded-sm rotate-45 shadow-[0_0_8px_#FF4655]" />
          <span>CORTE DE PELO: $12.000 ARS</span>
        </div>

        {/* Floating Bottom Left Coordinates */}
        <div className="absolute bottom-24 left-8 md:left-20 hidden lg:block font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
          <span className="text-[#A855F7] font-bold">#</span> 61.9688° W · SANTA FE · ARG
        </div>

        {/* Small floating graphic barber comb element */}
        <div className="absolute bottom-40 right-10 md:right-28 opacity-35 text-[#FF4655] hidden sm:block">
          <svg className="w-12 h-6" viewBox="0 0 60 30" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="2" y="4" width="56" height="8" rx="2" />
            <line x1="8" y1="12" x2="8" y2="26" strokeWidth="1.5" />
            <line x1="16" y1="12" x2="16" y2="26" strokeWidth="1.5" />
            <line x1="24" y1="12" x2="24" y2="26" strokeWidth="1.5" />
            <line x1="32" y1="12" x2="32" y2="26" strokeWidth="1.5" />
            <line x1="40" y1="12" x2="40" y2="26" strokeWidth="1.5" />
            <line x1="48" y1="12" x2="48" y2="26" strokeWidth="1.5" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
};
