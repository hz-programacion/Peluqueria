import React, { useState, useMemo, useEffect } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import { Dices, Eye, EyeOff, SprayCan as SprayIcon } from 'lucide-react';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';
import { useStudio } from '../context/StudioContext';

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
  type: 'comb' | 'scissors' | 'crown' | 'barcode' | 'tag' | 'crosshair' | 'arrow';
  x: number;
  y: number;
  scale: number;
  rotate: number;
  opacity: number;
  color: string;
}

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
  showControls = false,
}) => {
  const { uvNeonMode } = useStudio();
  const [seed, setSeed] = useState<number>(420931);
  const [style, setStyle] = useState<MuralStyle>('wildstyle');
  const [intensity, setIntensity] = useState<MuralIntensity>('balanced');
  const [isControlsOpen, setIsControlsOpen] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  // Mouse-reactive parallax for the generative mural layers
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, { stiffness: 52, damping: 22, mass: 0.7 });
  const smoothY = useSpring(mouseY, { stiffness: 52, damping: 22, mass: 0.7 });

  const watermarkX = useTransform(smoothX, [-0.5, 0.5], [-24, 24]);
  const watermarkY = useTransform(smoothY, [-0.5, 0.5], [-16, 16]);

  const splatterX = useTransform(smoothX, [-0.5, 0.5], [34, -34]);
  const splatterY = useTransform(smoothY, [-0.5, 0.5], [22, -22]);

  const stencilX = useTransform(smoothX, [-0.5, 0.5], [-44, 44]);
  const stencilY = useTransform(smoothY, [-0.5, 0.5], [-26, 26]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const nx = e.clientX / (window.innerWidth || 1) - 0.5;
      const ny = e.clientY / (window.innerHeight || 1) - 0.5;
      mouseX.set(nx);
      mouseY.set(ny);
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const handleRegenerate = () => {
    playMechanicalClick();
    setSeed(Math.floor(Math.random() * 999999) + 1);
  };

  useEffect(() => {
    const handleGlobalRegenerate = () => {
      handleRegenerate();
    };
    const handleGlobalStyleChange = (e: Event) => {
      const custom = e as CustomEvent<{ style?: MuralStyle }>;
      if (custom.detail?.style) {
        setStyle(custom.detail.style);
      } else {
        setStyle((prev) =>
          prev === 'wildstyle' ? 'cyber' : prev === 'cyber' ? 'drips' : 'wildstyle'
        );
      }
      setSeed(Math.floor(Math.random() * 999999) + 1);
    };
    window.addEventListener('regenerate-graffiti-mural', handleGlobalRegenerate);
    window.addEventListener('change-graffiti-style', handleGlobalStyleChange);
    return () => {
      window.removeEventListener('regenerate-graffiti-mural', handleGlobalRegenerate);
      window.removeEventListener('change-graffiti-style', handleGlobalStyleChange);
    };
  }, []);

  // Generate procedural elements using a vibrant non-pastel Urban Street-Art or UV Blacklight palette
  const muralData = useMemo(() => {
    const prng = createPrng(seed);

    const streetAmber = '#F59E0B';
    const sprayOrange = '#FF5500';
    const electricCyan = '#00F0FF';
    const crimsonTag = '#F43F5E';
    const acidVolt = '#CCFF00';
    const uvMagenta = '#FF007F';
    const uvPurple = '#A855F7';
    const chalkWhite = '#F4F4F5';

    const palette = uvNeonMode
      ? [electricCyan, acidVolt, uvMagenta, uvPurple, chalkWhite]
      : style === 'cyber'
      ? [electricCyan, streetAmber, sprayOrange, chalkWhite]
      : style === 'drips'
      ? [streetAmber, sprayOrange, crimsonTag, electricCyan]
      : [streetAmber, electricCyan, sprayOrange, acidVolt, crimsonTag, chalkWhite];

    const splatterCount = style === 'wildstyle' ? 18 : style === 'drips' ? 15 : 14;
    const splatters: Splatter[] = [];

    for (let i = 0; i < splatterCount; i++) {
      let cx = 0;
      let cy = 40 + prng() * 620;

      if (i % 3 === 0) {
        cx = 25 + prng() * 290;
      } else if (i % 3 === 1) {
        cx = 1120 + prng() * 290;
      } else {
        cx = 160 + prng() * 1120;
        cy = 30 + prng() * 240;
      }

      const r = 24 + prng() * 48;
      const color = palette[Math.floor(prng() * palette.length)];
      const opacity = (uvNeonMode ? 0.36 : 0.28) + prng() * 0.26;

      const satelliteCount = 6 + Math.floor(prng() * 7);
      const satellites: { dx: number; dy: number; r: number; opacity: number }[] = [];
      for (let s = 0; s < satelliteCount; s++) {
        const angle = prng() * Math.PI * 2;
        const dist = r * (1.1 + prng() * 2.1);
        satellites.push({
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist,
          r: 2.2 + prng() * 5.5,
          opacity: opacity * (0.55 + prng() * 0.4),
        });
      }

      splatters.push({ id: `sp-${i}`, cx, cy, r, color, opacity, satellites });
    }

    const dripCount = style === 'drips' ? 24 : 14;
    const drips: Drip[] = [];
    for (let i = 0; i < dripCount; i++) {
      const x = i % 2 === 0 ? 35 + prng() * 320 : 1080 + prng() * 320;
      const y = 40 + prng() * 420;
      const length = 55 + prng() * 130;
      const width = 2.8 + prng() * 4.2;
      const color = palette[Math.floor(prng() * palette.length)];
      const delay = prng() * 1.2;

      drips.push({ id: `dr-${i}`, x, y, width, length, color, delay });
    }

    const mistPoints: SprayDot[] = [];
    const mistClusters = 8;
    for (let c = 0; c < mistClusters; c++) {
      const clusterX = c % 2 === 0 ? 45 + prng() * 300 : 1090 + prng() * 300;
      const clusterY = 60 + prng() * 560;
      const clusterRadius = 70 + prng() * 100;
      const dotsInCluster = 28 + Math.floor(prng() * 26);
      const clusterColor = palette[c % palette.length];

      for (let d = 0; d < dotsInCluster; d++) {
        const angle = prng() * Math.PI * 2;
        const distance = Math.pow(prng(), 1.4) * clusterRadius;
        mistPoints.push({
          x: clusterX + Math.cos(angle) * distance,
          y: clusterY + Math.sin(angle) * distance,
          r: 1.4 + prng() * 2.8,
          opacity: (uvNeonMode ? 0.3 : 0.22) + prng() * 0.28,
          color: clusterColor,
        });
      }
    }

    const decalTypes: StencilDecal['type'][] = [
      'crown',
      'scissors',
      'comb',
      'arrow',
      'barcode',
      'tag',
      'crosshair',
    ];
    const decals: StencilDecal[] = [];
    const decalCount = 9;

    for (let i = 0; i < decalCount; i++) {
      const x = i % 2 === 0 ? 45 + prng() * 270 : 1125 + prng() * 270;
      decals.push({
        id: `dec-${i}`,
        type: decalTypes[i % decalTypes.length],
        x,
        y: 70 + prng() * 560,
        scale: 0.9 + prng() * 0.55,
        rotate: (prng() - 0.5) * 32,
        opacity: (uvNeonMode ? 0.45 : 0.36) + prng() * 0.28,
        color: palette[i % palette.length],
      });
    }

    return { splatters, drips, mistPoints, decals };
  }, [seed, style, uvNeonMode]);

  const opacityMultiplier = intensity === 'subtle' ? 0.72 : intensity === 'intense' ? 0.96 : 0.88;

  return (
    <div
      className={`relative w-full overflow-hidden select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={`mural-${seed}-${style}-${uvNeonMode ? 'uv' : 'raw'}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: opacityMultiplier, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="w-full h-full relative"
          >
            <svg
              viewBox="0 0 1440 720"
              preserveAspectRatio="xMidYMid slice"
              className="w-full h-full min-h-[420px] md:min-h-[560px] object-cover"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="graffiti-halftone"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <circle
                    cx="10"
                    cy="10"
                    r="1.4"
                    fill={uvNeonMode ? '#00F0FF' : '#F59E0B'}
                    fillOpacity="0.18"
                  />
                </pattern>

                <radialGradient id="sprayRadial" cx="50%" cy="50%" r="50%">
                  <stop
                    offset="0%"
                    stopColor={uvNeonMode ? '#00F0FF' : '#F59E0B'}
                    stopOpacity="0.32"
                  />
                  <stop
                    offset="50%"
                    stopColor={uvNeonMode ? '#FF007F' : '#FF5500'}
                    stopOpacity="0.14"
                  />
                  <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
                </radialGradient>

                <linearGradient id="wildstyleStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={uvNeonMode ? '#00F0FF' : '#F59E0B'} />
                  <stop offset="50%" stopColor={uvNeonMode ? '#CCFF00' : '#FF5500'} />
                  <stop offset="100%" stopColor={uvNeonMode ? '#FF007F' : '#00F0FF'} />
                </linearGradient>
              </defs>

              <rect width="1440" height="720" fill="url(#graffiti-halftone)" opacity="0.65" />

              {/* Parallax Layer 1: Outlined Street-Art Graffiti Murals & Crowns */}
              <motion.g
                style={{ x: watermarkX, y: watermarkY }}
                className="graffiti-aerosol-float"
              >
                <text
                  x="720"
                  y="330"
                  textAnchor="middle"
                  fontFamily="'Outfit', -apple-system, sans-serif"
                  fontWeight="900"
                  fontSize="175"
                  letterSpacing="-0.04em"
                  fill="none"
                  stroke="url(#wildstyleStroke)"
                  strokeWidth="2.4"
                  opacity={uvNeonMode ? '0.32' : '0.24'}
                  transform="rotate(-3 720 330)"
                >
                  CUTSSS 931
                </text>

                {/* Left Street Crown & Aerosol Swooshes */}
                <g transform="translate(85, 95) rotate(-6)">
                  <path
                    d="M 10 115 Q 165 138 345 102"
                    fill="none"
                    stroke="#00F0FF"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    opacity="0.48"
                  />
                  <path
                    d="M 25 126 Q 175 146 310 118"
                    fill="none"
                    stroke={uvNeonMode ? '#FF007F' : '#FF5500'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.4"
                  />
                  <path
                    d="M 42 16 L 68 36 L 94 10 L 120 36 L 146 16 L 135 46 L 53 46 Z"
                    fill="none"
                    stroke={uvNeonMode ? '#CCFF00' : '#F59E0B'}
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    opacity="0.54"
                  />
                </g>

                {/* Right Street-Art Throw-up Tag */}
                <g transform="translate(1150, 110) rotate(5)">
                  <text
                    x="0"
                    y="0"
                    fontFamily="'Outfit', sans-serif"
                    fontWeight="900"
                    fontSize="34"
                    letterSpacing="0.08em"
                    fill="none"
                    stroke="#00F0FF"
                    strokeWidth="1.8"
                    opacity="0.45"
                  >
                    ARTE URBANO
                  </text>
                  <path
                    d="M -10 14 Q 95 28 210 8"
                    fill="none"
                    stroke="#CCFF00"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.45"
                  />
                </g>
              </motion.g>

              {/* Parallax Layer 2: Aerosol Mist Clouds & Multi-Color Paint Splatters */}
              <motion.g style={{ x: splatterX, y: splatterY }}>
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

                {muralData.splatters.map((sp) => (
                  <g key={sp.id} transform={`translate(${sp.cx}, ${sp.cy})`}>
                    <circle cx="0" cy="0" r={sp.r * 1.75} fill="url(#sprayRadial)" />
                    <path
                      d={`M -${sp.r * 0.85} 0 Q -${sp.r * 0.45} -${sp.r} 0 -${sp.r * 0.9} Q ${sp.r} -${sp.r * 0.5} ${sp.r * 0.85} 0 Q ${sp.r * 0.6} ${sp.r} 0 ${sp.r * 0.85} Q -${sp.r} ${sp.r * 0.45} -${sp.r * 0.85} 0 Z`}
                      fill={sp.color}
                      opacity={sp.opacity}
                    />
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
              </motion.g>

              {/* Parallax Layer 3: Animated Vertical Paint Drips & Barber Street Stencils */}
              <motion.g style={{ x: stencilX, y: stencilY }}>
                {muralData.drips.map((drip) => (
                  <g
                    key={drip.id}
                    className="graffiti-drip-animated"
                    style={{ animationDelay: `${drip.delay}s` }}
                  >
                    <line
                      x1={drip.x}
                      y1={drip.y}
                      x2={drip.x}
                      y2={drip.y + drip.length}
                      stroke={drip.color}
                      strokeWidth={drip.width}
                      strokeLinecap="round"
                      opacity="0.5"
                    />
                    <circle
                      cx={drip.x}
                      cy={drip.y + drip.length + 3}
                      r={drip.width * 1.05}
                      fill={drip.color}
                      opacity="0.6"
                    />
                  </g>
                ))}

                {muralData.decals.map((decal) => (
                  <g
                    key={decal.id}
                    transform={`translate(${decal.x}, ${decal.y}) rotate(${decal.rotate}) scale(${decal.scale})`}
                    opacity={decal.opacity}
                  >
                    {decal.type === 'comb' && (
                      <g fill="none" stroke={decal.color} strokeWidth="2">
                        <rect x="-32" y="-12" width="64" height="9" rx="2" />
                        <line x1="-24" y1="-3" x2="-24" y2="12" />
                        <line x1="-14" y1="-3" x2="-14" y2="12" />
                        <line x1="-4" y1="-3" x2="-4" y2="12" />
                        <line x1="6" y1="-3" x2="6" y2="12" />
                        <line x1="16" y1="-3" x2="16" y2="12" />
                        <line x1="26" y1="-3" x2="26" y2="12" />
                      </g>
                    )}

                    {decal.type === 'scissors' && (
                      <g fill="none" stroke={decal.color} strokeWidth="2.2" strokeLinecap="round">
                        <circle cx="-14" cy="16" r="7" />
                        <circle cx="14" cy="16" r="7" />
                        <line x1="-10" y1="10" x2="18" y2="-20" />
                        <line x1="10" y1="10" x2="-18" y2="-20" />
                      </g>
                    )}

                    {decal.type === 'crown' && (
                      <path
                        d="M -28 14 L -18 -16 L 0 4 L 18 -16 L 28 14 Z"
                        fill="none"
                        stroke={decal.color}
                        strokeWidth="2.4"
                        strokeLinejoin="bevel"
                      />
                    )}

                    {decal.type === 'arrow' && (
                      <path
                        d="M -25 0 L 22 0 M 10 -12 L 24 0 L 10 12"
                        fill="none"
                        stroke={decal.color}
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {decal.type === 'barcode' && (
                      <g fill={decal.color}>
                        <rect x="-24" y="-12" width="2" height="24" />
                        <rect x="-18" y="-12" width="5" height="24" />
                        <rect x="-10" y="-12" width="2" height="24" />
                        <rect x="-5" y="-12" width="4" height="24" />
                        <rect x="2" y="-12" width="6" height="24" />
                        <rect x="11" y="-12" width="3" height="24" />
                        <rect x="17" y="-12" width="5" height="24" />
                      </g>
                    )}

                    {decal.type === 'crosshair' && (
                      <g stroke={decal.color} strokeWidth="1.8" fill="none">
                        <circle cx="0" cy="0" r="16" strokeDasharray="4 3" />
                        <circle cx="0" cy="0" r="3.5" fill={decal.color} />
                      </g>
                    )}

                    {decal.type === 'tag' && (
                      <text
                        x="0"
                        y="0"
                        textAnchor="middle"
                        fontFamily="'JetBrains Mono', monospace"
                        fontWeight="800"
                        fontSize="13"
                        letterSpacing="0.08em"
                        fill={decal.color}
                      >
                        [RC·931]
                      </text>
                    )}
                  </g>
                ))}
              </motion.g>
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {showControls && (
        <div className="pointer-events-auto fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-30">
          <div className="flex items-center gap-2">
            {isControlsOpen && (
              <div className="bg-[#111318]/95 border border-[#2A2F3A] backdrop-blur-md rounded-xl p-2.5 flex items-center gap-2 text-xs font-mono">
                {(['wildstyle', 'cyber', 'drips'] as MuralStyle[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStyle(st)}
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      style === st ? 'bg-[#F59E0B] text-zinc-950' : 'text-zinc-400'
                    }`}
                  >
                    {st}
                  </button>
                ))}
                {(['subtle', 'balanced', 'intense'] as MuralIntensity[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setIntensity(lvl)}
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      intensity === lvl ? 'bg-zinc-200 text-zinc-950' : 'text-zinc-400'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              onMouseEnter={playMechanicalHover}
              onClick={handleRegenerate}
              className="h-9 px-3 bg-[#111318]/90 border border-[#2A2F3A] text-[#F59E0B] rounded-xl flex items-center gap-1.5 text-xs font-mono font-bold cursor-pointer"
            >
              <Dices className="w-3.5 h-3.5" />
              <span>Mural</span>
            </button>
            <button
              type="button"
              onClick={() => setIsControlsOpen(!isControlsOpen)}
              className="w-9 h-9 rounded-xl bg-[#111318]/90 border border-[#2A2F3A] text-zinc-300 flex items-center justify-center cursor-pointer"
            >
              <SprayIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsVisible(!isVisible)}
              className="w-9 h-9 rounded-xl bg-[#111318]/90 border border-[#2A2F3A] text-zinc-400 flex items-center justify-center cursor-pointer"
            >
              {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
