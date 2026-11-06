import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Dices, Layers, Sliders, Eye, EyeOff, SprayCan as SprayIcon } from 'lucide-react';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';

type MuralStyle = 'cyber' | 'wildstyle' | 'drips';
type MuralIntensity = 'subtle' | 'balanced' | 'intense';

interface Splatter {
  id: string;
  cx: number;
  cy: number;
  r: number;
  color: string;
  opacity: number;
  satellites: { dx: number; dy: number; r: number; opacity: number }[];
}

interface Drip {
  id: string;
  x: number;
  y: number;
  width: number;
  length: number;
  color: string;
  delay: number;
}

interface SprayDot {
  x: number;
  y: number;
  r: number;
  opacity: number;
  color: string;
}

interface StencilDecal {
  id: string;
  type: 'comb' | 'scissors' | 'crown' | 'barcode' | 'tag' | 'crosshair';
  x: number;
  y: number;
  scale: number;
  rotate: number;
  opacity: number;
  color: string;
}

// Pseudo-Random Number Generator (Mulberry32) for deterministic mural generation
function createPrng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface UrbanGraffitiMuralProps {
  className?: string;
  showControls?: boolean;
}

export const UrbanGraffitiMural: React.FC<UrbanGraffitiMuralProps> = ({
  className = '',
  showControls = true,
}) => {
  const [seed, setSeed] = useState<number>(420931);
  const [style, setStyle] = useState<MuralStyle>('cyber');
  const [intensity, setIntensity] = useState<MuralIntensity>('balanced');
  const [isControlsOpen, setIsControlsOpen] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [sprayBurst, setSprayBurst] = useState<{ x: number; y: number; id: number } | null>(null);

  // Synthesize graffiti spray sound effect
  const playSprayAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const bufferSize = ctx.sampleRate * 0.22; // 220ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Pink/White noise generation for aerosol can hiss
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3200, ctx.currentTime);
      filter.Q.setValueAtTime(1.8, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.045, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch {
      // Graceful fallback if audio is blocked
    }
  };

  const handleRegenerate = () => {
    playMechanicalClick();
    playSprayAudio();
    setSeed(Math.floor(Math.random() * 999999) + 1);
  };

  // Listen for global regeneration triggers (e.g. from Hero badge)
  useEffect(() => {
    const handleGlobalRegenerate = () => {
      handleRegenerate();
    };
    window.addEventListener('regenerate-graffiti-mural', handleGlobalRegenerate);
    return () => window.removeEventListener('regenerate-graffiti-mural', handleGlobalRegenerate);
  }, []);

  // Generate procedural elements based on seed and chosen style
  const muralData = useMemo(() => {
    const prng = createPrng(seed);

    // Color palette variations (Artistic Streetwear & Urban Graffiti: Acid Violet, Flame Coral, Magenta, Titanium)
    const violet = '#A855F7';
    const flameCoral = '#FF4655';
    const magenta = '#EC4899';
    const titanium = '#FFFFFF';
    const iceViolet = '#C084FC';
    const deepPlum = '#7E22CE';
    const palette = [violet, flameCoral, magenta, titanium, iceViolet, deepPlum];

    // 1. GENERATIVE SPRAY SPLATTERS
    const splatterCount = style === 'wildstyle' ? 18 : style === 'drips' ? 14 : 12;
    const splatters: Splatter[] = [];

    // Distribute splatters across left flank, top, right flank, and center
    for (let i = 0; i < splatterCount; i++) {
      let cx = 0;
      let cy = 60 + prng() * 780;

      // Ensure rich distribution framing the sides and top
      if (i % 3 === 0) {
        // Left flank
        cx = 30 + prng() * 280;
      } else if (i % 3 === 1) {
        // Right flank
        cx = 1120 + prng() * 280;
      } else {
        // Top and center scatter
        cx = 150 + prng() * 1100;
        cy = 50 + prng() * 250;
      }

      const r = 24 + prng() * 55;
      const color = palette[Math.floor(prng() * palette.length)];
      const opacity = 0.45 + prng() * 0.45;

      const satelliteCount = 7 + Math.floor(prng() * 10);
      const satellites: { dx: number; dy: number; r: number; opacity: number }[] = [];
      for (let s = 0; s < satelliteCount; s++) {
        const angle = prng() * Math.PI * 2;
        const dist = r * (1.1 + prng() * 2.4);
        satellites.push({
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist,
          r: 2.5 + prng() * 7,
          opacity: opacity * (0.5 + prng() * 0.5),
        });
      }

      splatters.push({ id: `sp-${i}`, cx, cy, r, color, opacity, satellites });
    }

    // 2. GENERATIVE PAINT DRIPS
    const dripCount = style === 'drips' ? 32 : style === 'wildstyle' ? 20 : 15;
    const drips: Drip[] = [];
    for (let i = 0; i < dripCount; i++) {
      // Distribute drips prominently on flanks and headers
      let x = 0;
      if (i % 2 === 0) {
        x = 40 + prng() * 320;
      } else {
        x = 1080 + prng() * 320;
      }
      const y = 60 + prng() * 450;
      const length = 50 + prng() * (style === 'drips' ? 220 : 120);
      const width = 3.5 + prng() * 6;
      const color = prng() > 0.6 ? flameCoral : prng() > 0.3 ? violet : titanium;
      const delay = prng() * 1.6;

      drips.push({ id: `dr-${i}`, x, y, width, length, color, delay });
    }

    // 3. GENERATIVE SPRAY MIST PARTICLES
    const mistPoints: SprayDot[] = [];
    const mistClusters = style === 'wildstyle' ? 12 : 8;
    for (let c = 0; c < mistClusters; c++) {
      const clusterX = c % 2 === 0 ? 50 + prng() * 300 : 1050 + prng() * 320;
      const clusterY = 80 + prng() * 750;
      const clusterRadius = 70 + prng() * 120;
      const dotsInCluster = 35 + Math.floor(prng() * 40);
      const clusterColor = prng() > 0.5 ? violet : prng() > 0.25 ? flameCoral : magenta;

      for (let d = 0; d < dotsInCluster; d++) {
        const angle = prng() * Math.PI * 2;
        const distance = Math.pow(prng(), 1.5) * clusterRadius;
        mistPoints.push({
          x: clusterX + Math.cos(angle) * distance,
          y: clusterY + Math.sin(angle) * distance,
          r: 1.5 + prng() * 3.5,
          opacity: 0.25 + prng() * 0.45,
          color: clusterColor,
        });
      }
    }

    // 4. GENERATIVE STENCILS & STREET DECALS
    const decalTypes: StencilDecal['type'][] = ['comb', 'scissors', 'crown', 'barcode', 'tag', 'crosshair'];
    const decals: StencilDecal[] = [];
    const decalCount = style === 'cyber' ? 10 : 8;

    for (let i = 0; i < decalCount; i++) {
      let x = 0;
      if (i % 2 === 0) {
        x = 50 + prng() * 280;
      } else {
        x = 1100 + prng() * 290;
      }
      decals.push({
        id: `dec-${i}`,
        type: decalTypes[i % decalTypes.length],
        x,
        y: 100 + prng() * 700,
        scale: 0.85 + prng() * 0.6,
        rotate: (prng() - 0.5) * 45,
        opacity: 0.55 + prng() * 0.4,
        color: prng() > 0.5 ? violet : flameCoral,
      });
    }

    return { splatters, drips, mistPoints, decals };
  }, [seed, style]);

  // Overall opacity factor based on intensity
  const opacityMultiplier = intensity === 'subtle' ? 0.6 : intensity === 'intense' ? 1.0 : 0.85;

  return (
    <div
      className={`relative w-full overflow-hidden select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* ========================================================================= */}
      {/* 1. PROCEDURAL GENERATIVE SVG MURAL CANVAS                                 */}
      {/* ========================================================================= */}
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={`mural-${seed}-${style}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: opacityMultiplier }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full h-full relative"
          >
            <svg
              viewBox="0 0 1440 900"
              preserveAspectRatio="xMidYMid slice"
              className="w-full h-full min-h-[550px] md:min-h-[750px] object-cover"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>

                {/* Halftone Pattern for Urban Screen Print Effect */}
                <pattern id="graffiti-halftone" width="18" height="18" patternUnits="userSpaceOnUse">
                  <circle cx="9" cy="9" r="1.8" fill="#A855F7" fillOpacity="0.14" />
                </pattern>

                {/* Spray Can Radial Gradient */}
                <radialGradient id="sprayRadial" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#A855F7" stopOpacity="0.35" />
                  <stop offset="45%" stopColor="#FF4655" stopOpacity="0.14" />
                  <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Background Halftone Spray Texture */}
              <rect width="1440" height="900" fill="url(#graffiti-halftone)" opacity="0.6" />

              {/* =================================================================== */}
              {/* LARGE BACKGROUND GRAFFITI WILDSTYLE LETTERS ("CUTSSS" / "RODRIGO") */}
              {/* =================================================================== */}
              <g className="graffiti-aerosol-float">
                {/* 3D Wildstyle Block Extrusion: CUTSSS */}
                <path
                  d="M 120 420 L 260 360 L 390 380 L 520 330 L 680 370 L 840 330 L 1020 390 L 1260 320 L 1380 430 L 1350 480 L 1150 460 L 980 510 L 800 470 L 640 520 L 480 470 L 320 530 L 150 490 Z"
                  fill="none"
                  stroke="#FF4655"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                  opacity="0.22"
                />

                {/* Giant Outlined Throw-up Tag: "CUTSSS" */}
                <text
                  x="720"
                  y="460"
                  textAnchor="middle"
                  fontFamily="'Outfit', -apple-system, sans-serif"
                  fontWeight="900"
                  fontSize="175"
                  letterSpacing="-0.06em"
                  fill="none"
                  stroke="#A855F7"
                  strokeWidth="3.5"
                  strokeLinejoin="bevel"
                  strokeLinecap="round"
                  opacity="0.22"
                  transform="rotate(-4 720 460)"
                >
                  CUTSSS
                </text>

                {/* Secondary Offset Drop-Shadow for 3D Street Graffiti Feel */}
                <text
                  x="728"
                  y="468"
                  textAnchor="middle"
                  fontFamily="'Outfit', -apple-system, sans-serif"
                  fontWeight="900"
                  fontSize="175"
                  letterSpacing="-0.06em"
                  fill="none"
                  stroke="#FF4655"
                  strokeWidth="1.6"
                  opacity="0.14"
                  transform="rotate(-4 720 460)"
                >
                  CUTSSS
                </text>

                {/* Chisel-tip Marker Street Tag: "Rodrigo" with sweeping calligraphy underline */}
                <g transform="translate(180, 220) rotate(-7)">
                  <path
                    d="M 20 80 Q 40 10 70 30 T 90 90 M 70 40 Q 110 30 130 65 Q 140 100 110 110 Q 75 110 90 70 M 140 60 L 140 105 M 155 60 Q 180 50 195 80 Q 200 110 170 110 M 215 50 L 215 105 M 230 75 Q 255 55 280 80 Q 285 110 250 110 Q 225 105 240 75 M 295 75 Q 320 50 345 80 Q 350 110 315 110 Q 285 105 305 75"
                    fill="none"
                    stroke="#A855F7"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.34"
                  />
                  {/* Street Underline Swoosh with Arrow */}
                  <path
                    d="M 10 125 Q 180 145 370 120 L 350 105 M 370 120 L 345 135"
                    fill="none"
                    stroke="#FF4655"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.38"
                  />
                  {/* Double Halo / Street Crown above "Rodrigo" */}
                  <path
                    d="M 50 15 L 75 30 L 100 10 L 125 30 L 150 15 L 140 38 L 60 38 Z"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    opacity="0.35"
                  />
                </g>

                {/* Stencil Sub-tag: "VT // 931" */}
                <g transform="translate(1040, 260) rotate(5)">
                  <rect x="-10" y="-10" width="220" height="60" fill="none" stroke="#FF4655" strokeWidth="1.5" strokeDasharray="12 6" opacity="0.45" />
                  <text
                    x="100"
                    y="32"
                    textAnchor="middle"
                    fontFamily="'JetBrains Mono', monospace"
                    fontWeight="800"
                    fontSize="32"
                    letterSpacing="0.2em"
                    fill="#FF4655"
                    opacity="0.5"
                  >
                    VT 931
                  </text>
                  <text
                    x="100"
                    y="46"
                    textAnchor="middle"
                    fontFamily="'JetBrains Mono', monospace"
                    fontWeight="700"
                    fontSize="9"
                    letterSpacing="0.25em"
                    fill="#FFFFFF"
                    opacity="0.3"
                  >
                    VENADO TUERTO // SF
                  </text>
                </g>
              </g>

              {/* =================================================================== */}
              {/* 2. GENERATIVE AEROSOL MIST CLOUDS                                  */}
              {/* =================================================================== */}
              <g className="graffiti-mist">
                {muralData.mistPoints.map((pt, idx) => (
                  <circle
                    key={`mist-${idx}`}
                    cx={pt.x}
                    cy={pt.y}
                    r={pt.r}
                    fill={pt.color}
                    opacity={pt.opacity}
                  />
                ))}
              </g>

              {/* =================================================================== */}
              {/* 3. GENERATIVE PAINT SPLATTERS & SATELLITE BURSTS                    */}
              {/* =================================================================== */}
              <g className="graffiti-splatters">
                {muralData.splatters.map((sp) => (
                  <g key={sp.id} transform={`translate(${sp.cx}, ${sp.cy})`}>
                    {/* Radial Spray Mist Aura */}
                    <circle cx="0" cy="0" r={sp.r * 1.8} fill="url(#sprayRadial)" />
                    
                    {/* Organic Main Splatter Blob */}
                    <path
                      d={`M -${sp.r * 0.9} 0 Q -${sp.r * 0.5} -${sp.r * 1.1} 0 -${sp.r} Q ${sp.r * 1.2} -${sp.r * 0.6} ${sp.r * 0.9} 0 Q ${sp.r * 0.7} ${sp.r * 1.2} 0 ${sp.r * 0.9} Q -${sp.r * 1.1} ${sp.r * 0.5} -${sp.r * 0.9} 0 Z`}
                      fill={sp.color}
                      opacity={sp.opacity}
                    />
                    
                    {/* Satellite Droplets */}
                    {sp.satellites.map((sat, sIdx) => (
                      <circle
                        key={`sat-${sIdx}`}
                        cx={sat.dx}
                        cy={sat.dy}
                        r={sat.r}
                        fill={sp.color}
                        opacity={sat.opacity}
                      />
                    ))}
                  </g>
                ))}
              </g>

              {/* =================================================================== */}
              {/* 4. GENERATIVE PAINT DRIPS RUNNING DOWN                             */}
              {/* =================================================================== */}
              <g className="graffiti-drips">
                {muralData.drips.map((drip) => (
                  <g
                    key={drip.id}
                    className="graffiti-drip-animated"
                    style={{ animationDelay: `${drip.delay}s` }}
                  >
                    {/* Vertical Drip Line */}
                    <line
                      x1={drip.x}
                      y1={drip.y}
                      x2={drip.x}
                      y2={drip.y + drip.length}
                      stroke={drip.color}
                      strokeWidth={drip.width}
                      strokeLinecap="round"
                      opacity="0.45"
                    />
                    {/* Teardrop Bulb at Bottom */}
                    <circle
                      cx={drip.x}
                      cy={drip.y + drip.length + 2}
                      r={drip.width * 0.95}
                      fill={drip.color}
                      opacity="0.6"
                    />
                  </g>
                ))}
              </g>

              {/* =================================================================== */}
              {/* 5. GENERATIVE URBAN & BARBER STENCILS                               */}
              {/* =================================================================== */}
              <g className="graffiti-stencils">
                {muralData.decals.map((decal) => (
                  <g
                    key={decal.id}
                    transform={`translate(${decal.x}, ${decal.y}) rotate(${decal.rotate}) scale(${decal.scale})`}
                    opacity={decal.opacity}
                  >
                    {/* BARBER COMB & CLIPPER GUARD STENCIL */}
                    {decal.type === 'comb' && (
                      <g fill="none" stroke={decal.color} strokeWidth="2">
                        <rect x="-35" y="-14" width="70" height="10" rx="2" />
                        <line x1="-28" y1="-4" x2="-28" y2="14" strokeWidth="2" />
                        <line x1="-18" y1="-4" x2="-18" y2="14" strokeWidth="2" />
                        <line x1="-8" y1="-4" x2="-8" y2="14" strokeWidth="2" />
                        <line x1="2" y1="-4" x2="2" y2="14" strokeWidth="2" />
                        <line x1="12" y1="-4" x2="12" y2="14" strokeWidth="2" />
                        <line x1="22" y1="-4" x2="22" y2="14" strokeWidth="2" />
                        <line x1="30" y1="-4" x2="30" y2="14" strokeWidth="2" />
                      </g>
                    )}

                    {/* CROSSED SCISSORS STENCIL */}
                    {decal.type === 'scissors' && (
                      <g fill="none" stroke={decal.color} strokeWidth="2.2" strokeLinecap="round">
                        <circle cx="-16" cy="18" r="8" />
                        <circle cx="16" cy="18" r="8" />
                        <line x1="-12" y1="12" x2="20" y2="-22" />
                        <line x1="12" y1="12" x2="-20" y2="-22" />
                        <circle cx="0" cy="0" r="2.5" fill={decal.color} />
                      </g>
                    )}

                    {/* STREET CROWN STENCIL */}
                    {decal.type === 'crown' && (
                      <path
                        d="M -30 15 L -20 -15 L 0 5 L 20 -15 L 30 15 Z"
                        fill="none"
                        stroke={decal.color}
                        strokeWidth="2.5"
                        strokeLinejoin="bevel"
                      />
                    )}

                    {/* BARCODE STENCIL */}
                    {decal.type === 'barcode' && (
                      <g fill={decal.color}>
                        <rect x="-30" y="-15" width="3" height="30" />
                        <rect x="-24" y="-15" width="6" height="30" />
                        <rect x="-15" y="-15" width="2" height="30" />
                        <rect x="-10" y="-15" width="5" height="30" />
                        <rect x="-2" y="-15" width="8" height="30" />
                        <rect x="9" y="-15" width="3" height="30" />
                        <rect x="15" y="-15" width="7" height="30" />
                        <rect x="25" y="-15" width="4" height="30" />
                        <text
                          x="0"
                          y="24"
                          textAnchor="middle"
                          fontSize="7"
                          fontFamily="monospace"
                          fontWeight="700"
                        >
                          0.0MM // SHARP
                        </text>
                      </g>
                    )}

                    {/* STREET CROSSHAIR / RETICLE */}
                    {decal.type === 'crosshair' && (
                      <g stroke={decal.color} strokeWidth="1.5" fill="none">
                        <circle cx="0" cy="0" r="18" strokeDasharray="4 3" />
                        <circle cx="0" cy="0" r="4" fill={decal.color} />
                        <line x1="-24" y1="0" x2="-8" y2="0" />
                        <line x1="8" y1="0" x2="24" y2="0" />
                        <line x1="0" y1="-24" x2="0" y2="-8" />
                        <line x1="0" y1="8" x2="0" y2="24" />
                      </g>
                    )}

                    {/* STREET ARTIST TAG */}
                    {decal.type === 'tag' && (
                      <text
                        x="0"
                        y="0"
                        textAnchor="middle"
                        fontFamily="'JetBrains Mono', monospace"
                        fontWeight="900"
                        fontSize="14"
                        letterSpacing="0.1em"
                        fill={decal.color}
                      >
                        [RC·ESTUDIO]
                      </text>
                    )}
                  </g>
                ))}
              </g>

              {/* Technical Grid Accent Lines in Corners */}
              <g stroke="#A855F7" strokeWidth="0.8" opacity="0.2">
                <line x1="40" y1="40" x2="160" y2="40" />
                <line x1="40" y1="40" x2="40" y2="160" />
                <line x1="1400" y1="40" x2="1280" y2="40" />
                <line x1="1400" y1="40" x2="1400" y2="160" />
                <line x1="40" y1="860" x2="160" y2="860" />
                <line x1="40" y1="860" x2="40" y2="740" />
                <line x1="1400" y1="860" x2="1280" y2="860" />
                <line x1="1400" y1="860" x2="1400" y2="740" />
              </g>
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE CONTROLLER DOCK (ARTISTIC AGENCY & SEED REGENERATION)      */}
      {/* ========================================================================= */}
      {showControls && (
        <div className="pointer-events-auto fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-30">
          <div className="flex items-center gap-2">
            
            {/* Expanded Controls Drawer */}
            <AnimatePresence>
              {isControlsOpen && (
                <motion.div
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-[#0C0D14]/95 border border-[#A855F7]/40 backdrop-blur-md rounded-2xl p-3 shadow-[0_0_25px_rgba(168,85,247,0.2)] flex flex-wrap sm:flex-nowrap items-center gap-3 text-xs font-mono"
                >
                  {/* Style Presets */}
                  <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-[#1E2230]">
                    {(['cyber', 'wildstyle', 'drips'] as MuralStyle[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onMouseEnter={playMechanicalHover}
                        onClick={() => {
                          playMechanicalClick();
                          playSprayAudio();
                          setStyle(st);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                          style === st
                            ? 'bg-gradient-to-r from-[#A855F7] to-[#FF4655] text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {st === 'cyber' ? 'STENCIL' : st === 'wildstyle' ? 'WILD' : 'DRIPS'}
                      </button>
                    ))}
                  </div>

                  {/* Intensity Toggles */}
                  <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-[#1E2230]">
                    {(['subtle', 'balanced', 'intense'] as MuralIntensity[]).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onMouseEnter={playMechanicalHover}
                        onClick={() => {
                          playMechanicalClick();
                          setIntensity(lvl);
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                          intensity === lvl
                            ? 'bg-zinc-200 text-black'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {lvl === 'subtle' ? 'SUAVE' : lvl === 'balanced' ? 'MED' : 'MAX'}
                      </button>
                    ))}
                  </div>

                  {/* Seed Badge */}
                  <div className="hidden sm:block text-[9px] text-zinc-500 font-bold px-1.5 uppercase">
                    SEED #{seed.toString().slice(-4)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Regenerate Action Button */}
            <button
              type="button"
              onMouseEnter={playMechanicalHover}
              onClick={handleRegenerate}
              title="Regenerar Mural Callejero (Nuevo Seed)"
              aria-label="Regenerar mural de graffiti"
              className="h-10 px-3 bg-[#0C0D14]/90 border border-[#A855F7]/40 hover:border-[#A855F7] text-[#A855F7] hover:bg-[#A855F7]/15 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.18)] cursor-pointer active:scale-95 transition-all text-xs font-mono font-black"
            >
              <Dices className="w-4 h-4 text-[#FF4655] animate-spin-slow" />
              <span className="hidden sm:inline uppercase tracking-wider text-[11px]">REGENERAR MURAL</span>
            </button>

            {/* Toggle Controls Drawer Button */}
            <button
              type="button"
              onMouseEnter={playMechanicalHover}
              onClick={() => {
                playMechanicalClick();
                setIsControlsOpen(!isControlsOpen);
              }}
              aria-label="Ajustes de Mural de Graffiti"
              className={`w-10 h-10 rounded-xl flex items-center justify-center border backdrop-blur-md cursor-pointer active:scale-95 transition-all ${
                isControlsOpen
                  ? 'bg-gradient-to-r from-[#A855F7] to-[#FF4655] text-white border-transparent shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                  : 'bg-[#0C0D14]/90 border-[#222536] text-zinc-300 hover:text-[#A855F7] hover:border-[#A855F7]/50'
              }`}
            >
              <SprayIcon className="w-4 h-4" />
            </button>

            {/* Toggle Mural Visibility */}
            <button
              type="button"
              onMouseEnter={playMechanicalHover}
              onClick={() => {
                playMechanicalClick();
                setIsVisible(!isVisible);
              }}
              title={isVisible ? 'Ocultar Mural' : 'Mostrar Mural'}
              aria-label="Alternar visibilidad del mural"
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#0C0D14]/90 border border-[#222536] text-zinc-400 hover:text-white hover:border-zinc-500 backdrop-blur-md cursor-pointer active:scale-95 transition-all"
            >
              {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
