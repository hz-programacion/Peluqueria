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
      <div className="absolute inset-0 bg-[#08090D] opacity-100" />
      
      {/* Ambient Neon Atmosphere Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#00F0FF]/[0.05] blur-[120px]" />
      <div className="absolute top-1/2 -right-40 w-[30rem] h-[30rem] rounded-full bg-[#00F0FF]/[0.035] blur-[150px]" />
      <div className="absolute -bottom-40 left-1/3 w-[26rem] h-[26rem] rounded-full bg-cyan-400/[0.03] blur-[130px]" />

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
        <div className="flex justify-between items-center px-6 md:px-16 opacity-[0.045] font-mono font-bold text-sm sm:text-lg md:text-xl tracking-widest text-[#00F0FF] uppercase select-none">
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
        <div className="absolute top-28 right-8 md:right-20 border border-[#00F0FF]/25 bg-black/50 backdrop-blur-sm p-3 rounded font-mono text-[10px] text-[#00F0FF]/80 tracking-widest uppercase hidden sm:block shadow-[0_0_15px_rgba(0,240,255,0.08)]">
          <div>LOC: VUELTA DE OBLIGADO 931</div>
          <div className="text-zinc-400 font-semibold mt-0.5">ZONE: VENADO TUERTO · SF</div>
          <div className="mt-1 flex items-center gap-1.5 text-[9px] text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse" />
            <span>ESTUDIO DE AUTOR 1 A 1</span>
          </div>
        </div>

        {/* Left Side Reticle / Crosshair */}
        <div className="absolute top-1/3 left-4 md:left-12 opacity-35 text-[#00F0FF] font-mono text-xs hidden lg:flex flex-col items-center gap-1">
          <div className="w-8 h-8 border border-[#00F0FF]/40 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-[#00F0FF] rounded-full shadow-[0_0_8px_#00F0FF]" />
          </div>
          <span className="text-[9px] tracking-widest text-zinc-400">33.7456° S</span>
        </div>

        {/* Right Center Target Decal */}
        <div className="absolute top-2/3 right-6 md:right-16 opacity-30 text-white font-mono text-xs hidden md:block">
          <div className="border-l-2 border-t-2 border-[#00F0FF] w-6 h-6 mb-1" />
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
        <div className="absolute top-44 left-6 sm:left-16 lg:left-24 px-3.5 py-1.5 rounded-md border border-[#00F0FF]/35 bg-black/70 shadow-[0_0_20px_rgba(0,240,255,0.18)] text-[#00F0FF] font-mono font-black text-[11px] tracking-widest uppercase hidden sm:flex items-center gap-2">
          <span className="w-2 h-2 bg-[#00F0FF] rounded-sm rotate-45 shadow-[0_0_8px_#00F0FF]" />
          <span>CORTE DE PELO: $12.000 ARS</span>
        </div>

        {/* Floating Bottom Left Coordinates */}
        <div className="absolute bottom-24 left-8 md:left-20 hidden lg:block font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
          <span className="text-[#00F0FF] font-bold">#</span> 61.9688° W · SANTA FE · ARG
        </div>

        {/* Small floating graphic razor element */}
        <div className="absolute bottom-40 right-10 md:right-28 opacity-35 text-[#00F0FF] hidden sm:block">
          <svg className="w-12 h-6" viewBox="0 0 60 30" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="2" y="4" width="56" height="22" rx="2" />
            <circle cx="15" cy="15" r="3" />
            <circle cx="45" cy="15" r="3" />
            <line x1="22" y1="15" x2="38" y2="15" strokeWidth="2" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
};
