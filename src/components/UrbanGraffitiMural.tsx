import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices, Eye, EyeOff, SprayCan as SprayIcon } from 'lucide-react';
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
  const [seed, setSeed] = useState<number>(420931);
  const [style, setStyle] = useState<MuralStyle>('cyber');
  const [intensity, setIntensity] = useState<MuralIntensity>('subtle');
  const [isControlsOpen, setIsControlsOpen] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(true);

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
          prev === 'cyber' ? 'wildstyle' : prev === 'wildstyle' ? 'drips' : 'cyber'
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

  // Generate procedural elements using an artistic urban studio palette
  const muralData = useMemo(() => {
    const prng = createPrng(seed);

    const warmBronze = '#D4A373';
    const mutedTerracotta = '#C87D65';
    const stoneSilver = '#A1A1AA';
    const boneWhite = '#E4E4E7';
    const warmSand = '#E0B083';
    const zincSlate = '#71717A';
    const palette = [warmBronze, mutedTerracotta, stoneSilver, boneWhite, warmSand, zincSlate];

    const splatterCount = style === 'wildstyle' ? 14 : style === 'drips' ? 12 : 10;
    const splatters: Splatter[] = [];

    for (let i = 0; i < splatterCount; i++) {
      let cx = 0;
      let cy = 60 + prng() * 580;

      if (i % 3 === 0) {
        cx = 40 + prng() * 260;
      } else if (i % 3 === 1) {
        cx = 1140 + prng() * 260;
      } else {
        cx = 200 + prng() * 1040;
        cy = 50 + prng() * 220;
      }

      const r = 20 + prng() * 42;
      const color = palette[Math.floor(prng() * palette.length)];
      const opacity = 0.16 + prng() * 0.18;

      const satelliteCount = 5 + Math.floor(prng() * 6);
      const satellites: { dx: number; dy: number; r: number; opacity: number }[] = [];
      for (let s = 0; s < satelliteCount; s++) {
        const angle = prng() * Math.PI * 2;
        const dist = r * (1.1 + prng() * 2.0);
        satellites.push({
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist,
          r: 2 + prng() * 5,
          opacity: opacity * (0.45 + prng() * 0.4),
        });
      }

      splatters.push({ id: `sp-${i}`, cx, cy, r, color, opacity, satellites });
    }

    const dripCount = style === 'drips' ? 18 : 10;
    const drips: Drip[] = [];
    for (let i = 0; i < dripCount; i++) {
      const x = i % 2 === 0 ? 50 + prng() * 300 : 1090 + prng() * 300;
      const y = 60 + prng() * 360;
      const length = 45 + prng() * 110;
      const width = 2.5 + prng() * 4;
      const color = prng() > 0.5 ? warmBronze : stoneSilver;
      const delay = prng() * 1.4;

      drips.push({ id: `dr-${i}`, x, y, width, length, color, delay });
    }

    const mistPoints: SprayDot[] = [];
    const mistClusters = 6;
    for (let c = 0; c < mistClusters; c++) {
      const clusterX = c % 2 === 0 ? 60 + prng() * 280 : 1080 + prng() * 280;
      const clusterY = 80 + prng() * 520;
      const clusterRadius = 60 + prng() * 90;
      const dotsInCluster = 24 + Math.floor(prng() * 24);
      const clusterColor = prng() > 0.5 ? warmBronze : mutedTerracotta;

      for (let d = 0; d < dotsInCluster; d++) {
        const angle = prng() * Math.PI * 2;
        const distance = Math.pow(prng(), 1.5) * clusterRadius;
        mistPoints.push({
          x: clusterX + Math.cos(angle) * distance,
          y: clusterY + Math.sin(angle) * distance,
          r: 1.2 + prng() * 2.5,
          opacity: 0.14 + prng() * 0.22,
          color: clusterColor,
        });
      }
    }

    const decalTypes: StencilDecal['type'][] = [
      'comb',
      'scissors',
      'crown',
      'barcode',
      'tag',
      'crosshair',
    ];
    const decals: StencilDecal[] = [];
    const decalCount = 6;

    for (let i = 0; i < decalCount; i++) {
      const x = i % 2 === 0 ? 60 + prng() * 250 : 1120 + prng() * 250;
      decals.push({
        id: `dec-${i}`,
        type: decalTypes[i % decalTypes.length],
        x,
        y: 90 + prng() * 520,
        scale: 0.8 + prng() * 0.45,
        rotate: (prng() - 0.5) * 30,
        opacity: 0.22 + prng() * 0.2,
        color: prng() > 0.5 ? warmBronze : stoneSilver,
      });
    }

    return { splatters, drips, mistPoints, decals };
  }, [seed, style]);

  const opacityMultiplier = intensity === 'subtle' ? 0.55 : intensity === 'intense' ? 0.85 : 0.7;

  return (
    <div
      className={`relative w-full overflow-hidden select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={`mural-${seed}-${style}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: opacityMultiplier }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
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
                  width="22"
                  height="22"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="11" cy="11" r="1.2" fill="#D4A373" fillOpacity="0.08" />
                </pattern>

                <radialGradient id="sprayRadial" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#D4A373" stopOpacity="0.16" />
                  <stop offset="55%" stopColor="#C87D65" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="#D4A373" stopOpacity="0" />
                </radialGradient>
              </defs>

              <rect width="1440" height="720" fill="url(#graffiti-halftone)" opacity="0.5" />

              {/* Subtle Outlined Architectural Graffiti Watermark */}
              <g className="graffiti-aerosol-float">
                <text
                  x="720"
                  y="340"
                  textAnchor="middle"
                  fontFamily="'Outfit', -apple-system, sans-serif"
                  fontWeight="900"
                  fontSize="155"
                  letterSpacing="-0.05em"
                  fill="none"
                  stroke="#D4A373"
                  strokeWidth="2"
                  opacity="0.09"
                  transform="rotate(-3 720 340)"
                >
                  CUTSSS
                </text>

                <g transform="translate(140, 150) rotate(-5)">
                  <path
                    d="M 10 110 Q 160 128 330 105"
                    fill="none"
                    stroke="#D4A373"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.18"
                  />
                  <path
                    d="M 45 20 L 68 34 L 90 14 L 112 34 L 135 20 L 126 40 L 54 40 Z"
                    fill="none"
                    stroke="#E4E4E7"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                    opacity="0.18"
                  />
                </g>
              </g>

              {/* Aerosol Mist Clouds */}
              <g>
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

              {/* Paint Splatters */}
              <g>
                {muralData.splatters.map((sp) => (
                  <g key={sp.id} transform={`translate(${sp.cx}, ${sp.cy})`}>
                    <circle cx="0" cy="0" r={sp.r * 1.6} fill="url(#sprayRadial)" />
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
              </g>

              {/* Vertical Paint Drips */}
              <g>
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
                      opacity="0.28"
                    />
                    <circle
                      cx={drip.x}
                      cy={drip.y + drip.length + 2}
                      r={drip.width * 0.9}
                      fill={drip.color}
                      opacity="0.35"
                    />
                  </g>
                ))}
              </g>

              {/* Barber & Street Stencils */}
              <g>
                {muralData.decals.map((decal) => (
                  <g
                    key={decal.id}
                    transform={`translate(${decal.x}, ${decal.y}) rotate(${decal.rotate}) scale(${decal.scale})`}
                    opacity={decal.opacity}
                  >
                    {decal.type === 'comb' && (
                      <g fill="none" stroke={decal.color} strokeWidth="1.8">
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
                      <g fill="none" stroke={decal.color} strokeWidth="2" strokeLinecap="round">
                        <circle cx="-14" cy="16" r="7" />
                        <circle cx="14" cy="16" r="7" />
                        <line x1="-10" y1="10" x2="18" y2="-20" />
                        <line x1="10" y1="10" x2="-18" y2="-20" />
                      </g>
                    )}

                    {decal.type === 'crown' && (
                      <path
                        d="M -26 14 L -18 -14 L 0 4 L 18 -14 L 26 14 Z"
                        fill="none"
                        stroke={decal.color}
                        strokeWidth="2"
                        strokeLinejoin="bevel"
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
                      <g stroke={decal.color} strokeWidth="1.4" fill="none">
                        <circle cx="0" cy="0" r="15" strokeDasharray="4 3" />
                        <circle cx="0" cy="0" r="3" fill={decal.color} />
                      </g>
                    )}

                    {decal.type === 'tag' && (
                      <text
                        x="0"
                        y="0"
                        textAnchor="middle"
                        fontFamily="'JetBrains Mono', monospace"
                        fontWeight="800"
                        fontSize="12"
                        letterSpacing="0.08em"
                        fill={decal.color}
                      >
                        [RC·931]
                      </text>
                    )}
                  </g>
                ))}
              </g>
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {showControls && (
        <div className="pointer-events-auto fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-30">
          <div className="flex items-center gap-2">
            {isControlsOpen && (
              <div className="bg-[#111318]/95 border border-[#2A2F3A] backdrop-blur-md rounded-xl p-2.5 flex items-center gap-2 text-xs font-mono">
                {(['cyber', 'wildstyle', 'drips'] as MuralStyle[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStyle(st)}
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      style === st ? 'bg-[#D4A373] text-zinc-950' : 'text-zinc-400'
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
              className="h-9 px-3 bg-[#111318]/90 border border-[#2A2F3A] text-[#D4A373] rounded-xl flex items-center gap-1.5 text-xs font-mono font-bold cursor-pointer"
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
