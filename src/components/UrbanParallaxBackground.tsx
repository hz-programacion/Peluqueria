import React, { useEffect } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
} from 'framer-motion';
import { useStudio } from '../context/StudioContext';

export const UrbanParallaxBackground: React.FC = () => {
  const { uvNeonMode } = useStudio();

  // Normalized mouse coordinates (-0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics for responsive urban parallax
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 22, mass: 0.75 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 22, mass: 0.75 });

  // Vertical scroll parallax
  const { scrollYProgress } = useScroll();
  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 65,
    damping: 26,
    restDelta: 0.001,
  });

  // Layer 1: Deep Aerosol Aura Clouds (Mouse + Scroll)
  const layer1X = useTransform(smoothX, [-0.5, 0.5], [-42, 42]);
  const layer1Y = useTransform(smoothY, [-0.5, 0.5], [-34, 34]);
  const scrollAuraY = useTransform(smoothScroll, [0, 1], [0, -160]);

  // Layer 2: Street-Art Graffiti Wall Murals & Stencil Watermarks (Counter-Parallax + Scroll)
  const layer2X = useTransform(smoothX, [-0.5, 0.5], [36, -36]);
  const layer2Y = useTransform(smoothY, [-0.5, 0.5], [26, -26]);
  const scrollMuralY = useTransform(smoothScroll, [0, 1], [0, -240]);

  // Layer 3: Paint Splatters & Drips
  const layer3X = useTransform(smoothX, [-0.5, 0.5], [-54, 54]);
  const layer3Y = useTransform(smoothY, [-0.5, 0.5], [-40, 40]);

  // Layer 4: Architectural Concrete Grid
  const gridX = useTransform(smoothX, [-0.5, 0.5], [-14, 14]);
  const gridY = useTransform(smoothY, [-0.5, 0.5], [-14, 14]);

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

  const primaryStroke = uvNeonMode ? '#00F0FF' : '#F59E0B';
  const secondaryStroke = uvNeonMode ? '#CCFF00' : '#00F0FF';
  const tertiaryStroke = uvNeonMode ? '#FF007F' : '#FF5500';

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
    >
      {/* Deep Asphalt & Concrete Studio Canvas */}
      <div className={`absolute inset-0 ${uvNeonMode ? 'bg-[#05060B]' : 'bg-[#07080C]'}`} />

      {/* Parallax Depth Layer 1: Multi-Tone Street Aerosol Aura Clouds */}
      <motion.div
        style={{ x: layer1X, y: layer1Y, translateY: scrollAuraY }}
        className="absolute inset-0"
      >
        <div
          className="absolute -top-32 -left-32 w-[42rem] h-[42rem] rounded-full blur-[135px]"
          style={{
            backgroundColor: uvNeonMode
              ? 'rgba(0, 240, 255, 0.13)'
              : 'rgba(245, 158, 11, 0.10)',
          }}
        />
        <div
          className="absolute top-1/4 -right-36 w-[38rem] h-[38rem] rounded-full blur-[145px]"
          style={{
            backgroundColor: uvNeonMode
              ? 'rgba(204, 255, 0, 0.10)'
              : 'rgba(0, 240, 255, 0.08)',
          }}
        />
        <div
          className="absolute -bottom-36 left-1/4 w-[38rem] h-[38rem] rounded-full blur-[145px]"
          style={{
            backgroundColor: uvNeonMode
              ? 'rgba(255, 0, 127, 0.10)'
              : 'rgba(255, 85, 0, 0.08)',
          }}
        />
        <div
          className="absolute top-2/3 right-1/4 w-[26rem] h-[26rem] rounded-full blur-[130px]"
          style={{
            backgroundColor: uvNeonMode
              ? 'rgba(168, 85, 247, 0.11)'
              : 'rgba(204, 255, 0, 0.05)',
          }}
        />
      </motion.div>

      {/* Parallax Depth Layer 2: Expressive Street-Art Graffiti Wall & Stencils */}
      <motion.div
        style={{ x: layer2X, y: layer2Y, translateY: scrollMuralY }}
        className="absolute -inset-16"
      >
        <svg
          viewBox="0 0 1600 1200"
          className={`w-full h-full ${uvNeonMode ? 'opacity-[0.34]' : 'opacity-[0.24]'}`}
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="urbanTagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={primaryStroke} stopOpacity="0.9" />
              <stop offset="50%" stopColor={tertiaryStroke} stopOpacity="0.75" />
              <stop offset="100%" stopColor={secondaryStroke} stopOpacity="0.85" />
            </linearGradient>
          </defs>

          {/* Left Margin Vertical Street Stencil & Crown */}
          <g transform="translate(55, 220)">
            <path
              d="M 0 42 L 10 6 L 28 28 L 46 2 L 64 28 L 82 6 L 92 42 Z"
              fill="none"
              stroke={primaryStroke}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <line x1="4" y1="50" x2="88" y2="50" stroke={secondaryStroke} strokeWidth="2" />
            <text
              x="35"
              y="260"
              transform="rotate(-90 35 260)"
              fontFamily="'Outfit', sans-serif"
              fontWeight="900"
              fontSize="44"
              letterSpacing="0.14em"
              fill="none"
              stroke="url(#urbanTagGrad)"
              strokeWidth="1.6"
            >
              ATELIER URBANO // 931
            </text>
          </g>

          {/* Right Margin Wildstyle Tag & Crosshairs */}
          <g transform="translate(1485, 360)">
            <circle
              cx="28"
              cy="28"
              r="34"
              fill="none"
              stroke={tertiaryStroke}
              strokeWidth="1.6"
              strokeDasharray="8 6"
            />
            <circle cx="28" cy="28" r="5" fill={secondaryStroke} />
            <text
              x="32"
              y="320"
              transform="rotate(90 32 320)"
              fontFamily="'Outfit', sans-serif"
              fontWeight="900"
              fontSize="42"
              letterSpacing="0.16em"
              fill="none"
              stroke={secondaryStroke}
              strokeWidth="1.5"
            >
              FRESH FADES · 0.0MM
            </text>
          </g>

          {/* Diagonal Street-Art Throw-up Watermark */}
          <text
            x="800"
            y="840"
            textAnchor="middle"
            transform="rotate(-6 800 840)"
            fontFamily="'Outfit', sans-serif"
            fontWeight="900"
            fontSize="160"
            letterSpacing="-0.03em"
            fill="none"
            stroke={primaryStroke}
            strokeWidth="1.5"
            strokeOpacity="0.36"
          >
            RODRIGO CUTSSS
          </text>
        </svg>
      </motion.div>

      {/* Parallax Depth Layer 3: Counter-Moving Paint Splatters & Vertical Drips */}
      <motion.div style={{ x: layer3X, y: layer3Y }} className="absolute -inset-12">
        <svg
          viewBox="0 0 1440 900"
          className={`w-full h-full ${uvNeonMode ? 'opacity-[0.38]' : 'opacity-[0.28]'}`}
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Left Spray Splatters & Drips */}
          <g fill={primaryStroke}>
            <circle cx="88" cy="140" r="9" opacity="0.65" />
            <circle cx="102" cy="128" r="3.5" opacity="0.8" />
            <circle cx="76" cy="155" r="2.5" opacity="0.7" />
            <line
              x1="88"
              y1="145"
              x2="88"
              y2="235"
              stroke={primaryStroke}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="88" cy="240" r="3" />
          </g>

          {/* Right Cyan Aerosol Splatter & Drip */}
          <g fill={secondaryStroke}>
            <circle cx="1365" cy="210" r="8" opacity="0.6" />
            <circle cx="1380" cy="198" r="3" opacity="0.75" />
            <line
              x1="1365"
              y1="215"
              x2="1365"
              y2="310"
              stroke={secondaryStroke}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle cx="1365" cy="316" r="2.8" />
          </g>

          {/* Bottom Left Crimson/Spray Tag Drip */}
          <g fill={tertiaryStroke}>
            <circle cx="115" cy="680" r="7" opacity="0.55" />
            <line
              x1="115"
              y1="684"
              x2="115"
              y2="765"
              stroke={tertiaryStroke}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="115" cy="770" r="2.5" />
          </g>
        </svg>
      </motion.div>

      {/* Parallax Depth Layer 4: Architectural Concrete Stencil Grid */}
      <motion.div
        style={{
          x: gridX,
          y: gridY,
          backgroundImage: uvNeonMode
            ? 'linear-gradient(to right, rgba(0, 240, 255, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(204, 255, 0, 0.35) 1px, transparent 1px)'
            : 'linear-gradient(to right, rgba(245, 158, 11, 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 240, 255, 0.25) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
        className="absolute -inset-8 opacity-[0.045]"
      />
    </div>
  );
};
