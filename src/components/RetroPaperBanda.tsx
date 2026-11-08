import React from 'react';

/**
 * Global Aged-Paper Fiber & Weathered Ink Overlay
 * Gives the entire application an authentic, tactile vintage editorial paper texture
 * ("papel envejecido / archivo histórico") without hindering readability or clicks.
 */
export const RetroPaperTextureOverlay: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden select-none"
    >
      {/* SVG Filter Definition for Aged Paper Grain & Weathered Ink Sash */}
      <svg className="w-full h-full opacity-[0.048] mix-blend-multiply">
        <defs>
          <filter id="retro-paper-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.82"
              numOctaves="4"
              seed="14"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  0 0.94 0 0 0  0 0 0.86 0 0  0 0 0 0.55 0"
              in="noise"
              result="coloredNoise"
            />
          </filter>

          {/* Filter used by Header/Footer Banda components for weathered ink-on-paper look */}
          <filter id="retro-banda-distress" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.065"
              numOctaves="3"
              seed="9"
              result="paperRoughness"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="paperRoughness"
              scale="2.2"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter="url(#retro-paper-grain)" />
      </svg>

      {/* Subtle Fine Paper Fiber Mesh */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] mix-blend-multiply">
        <filter id="vintage-paper-fibers">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.02 0.15"
            numOctaves="2"
            seed="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#vintage-paper-fibers)" />
      </svg>

      {/* Subtle warm sepia edge vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 35%, transparent 60%, rgba(138, 114, 84, 0.1) 100%)',
        }}
      />
    </div>
  );
};

/**
 * Bespoke Vintage Shield Crest ("Escudo Retro RC con La Banda")
 * Inspired by classic 1950s Argentine club & sartorial lapel emblems on aged ivory cardstock.
 */
export const RetroRiverCrestBadge: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className = '' }) => {
  const dimensions =
    size === 'sm'
      ? 'w-9 h-10'
      : size === 'lg'
        ? 'w-14 h-16'
        : 'w-10 h-11';

  const fontSize =
    size === 'sm'
      ? 'text-[11px]'
      : size === 'lg'
        ? 'text-base'
        : 'text-xs';

  return (
    <span
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${dimensions} ${className}`}
    >
      <svg
        viewBox="0 0 64 74"
        fill="none"
        className="w-full h-full drop-shadow-[0_2px_4px_rgba(24,21,18,0.14)]"
        aria-hidden="true"
      >
        <defs>
          <clipPath id={`crest-shield-clip-${size}`}>
            <path d="M6 6 H58 V36 C58 53 45 64 32 70 C19 64 6 53 6 36 Z" />
          </clipPath>
        </defs>

        {/* Outer Charcoal Ink Shield Frame */}
        <path
          d="M4 4 H60 V36 C60 55 46 66.5 32 72.5 C18 66.5 4 55 4 36 Z"
          fill="#181512"
        />

        {/* Aged Ivory Cardstock Shield Interior */}
        <g clipPath={`url(#crest-shield-clip-${size})`}>
          <rect x="0" y="0" width="64" height="74" fill="#FAF6EE" />

          {/* Subtle Diagonal Paper Hatching */}
          <path
            d="M0 16 L16 0 M0 32 L32 0 M0 48 L48 0 M0 64 L64 0 M16 74 L74 16 M32 74 L74 32"
            stroke="#D8CCB8"
            strokeWidth="0.75"
            strokeOpacity="0.6"
          />

          {/* The Iconic Diagonal Red Sash ("La Banda") from top-left to bottom-right */}
          <polygon
            points="-6,12 12,-6 70,52 52,70"
            fill="#9E2A2B"
          />

          {/* Fine Sartorial Cream & Brass Edges along the Sash */}
          <line
            x1="-6"
            y1="12"
            x2="52"
            y2="70"
            stroke="#FAF6EE"
            strokeWidth="1.2"
            strokeDasharray="3 1.5"
          />
          <line
            x1="12"
            y1="-6"
            x2="70"
            y2="52"
            stroke="#FAF6EE"
            strokeWidth="1.2"
            strokeDasharray="3 1.5"
          />
        </g>

        {/* Inner Antique Brass Shield Rim */}
        <path
          d="M8.5 8.5 H55.5 V35.5 C55.5 50.5 43.5 60.8 32 66.5 C20.5 60.8 8.5 50.5 8.5 35.5 Z"
          stroke="#B89146"
          strokeWidth="1.2"
          strokeOpacity="0.85"
        />
      </svg>

      {/* Center Monogram Medallion */}
      <span
        className={`relative z-10 font-editorial italic font-bold tracking-tight text-[#181512] bg-[#FAF6EE] px-1 py-0.2 rounded-xs border border-[#181512]/80 shadow-[0_1px_2px_rgba(24,21,18,0.18)] leading-none ${fontSize}`}
      >
        RC
      </span>
    </span>
  );
};

/**
 * Decorative Header Component:
 * Simulates the iconic River Plate diagonal red sash ("La Banda Roja") in a subtle,
 * vintage aged-paper style across the Header bar, with stitched borders and weathered ink texture.
 */
export const RetroHeaderBandaOrnament: React.FC<{
  studioTitle?: string;
  address?: string;
}> = () => {
  return (
    <div
      aria-hidden="true"
      data-testid="retro-header-banda"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
    >
      {/* Background Diagonal Weathered Sash inside the Header */}
      <div className="absolute inset-0 left-1/2 -translate-x-1/2 w-full max-w-7xl overflow-hidden">
        <svg
          viewBox="0 0 1200 84"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full"
        >
          <defs>
            <pattern
              id="header-aged-paper-hatch"
              width="8"
              height="8"
              patternTransform="rotate(35 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="8"
                stroke="#8A6E4B"
                strokeWidth="0.6"
                strokeOpacity="0.14"
              />
            </pattern>
            <linearGradient id="retro-carmine-sash-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9E2A2B" stopOpacity="0.20" />
              <stop offset="50%" stopColor="#8F2425" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#9E2A2B" stopOpacity="0.18" />
            </linearGradient>
          </defs>

          {/* Subtle aged-paper hatch across header */}
          <rect width="1200" height="84" fill="url(#header-aged-paper-hatch)" />

          {/* Primary Iconic Diagonal Red Sash ("La Banda") crossing at a classic sartorial angle */}
          <g filter="url(#retro-banda-distress)">
            {/* Outer vintage ivory seam */}
            <polygon
              points="230,-14 334,-14 252,98 148,98"
              fill="#FAF6EE"
              fillOpacity="0.78"
            />
            {/* Brass hairline accent */}
            <line
              x1="236"
              y1="-14"
              x2="154"
              y2="98"
              stroke="#B89146"
              strokeWidth="0.9"
              strokeOpacity="0.45"
            />
            {/* Main Weathered Carmine Sash */}
            <polygon
              points="244,-14 320,-14 238,98 162,98"
              fill="url(#retro-carmine-sash-grad)"
            />
            {/* Fine Tailored Carmine Edges (Double Chain-Stitch) */}
            <line
              x1="244"
              y1="-14"
              x2="162"
              y2="98"
              stroke="#9E2A2B"
              strokeWidth="1.35"
              strokeOpacity="0.55"
              strokeDasharray="4 2"
            />
            <line
              x1="320"
              y1="-14"
              x2="238"
              y2="98"
              stroke="#9E2A2B"
              strokeWidth="1.35"
              strokeOpacity="0.55"
              strokeDasharray="4 2"
            />
            {/* Center Fine Pinstripe */}
            <line
              x1="282"
              y1="-14"
              x2="200"
              y2="98"
              stroke="#9E2A2B"
              strokeWidth="0.7"
              strokeOpacity="0.3"
            />
          </g>

          {/* Secondary subtle echo ribbon on the right side */}
          <g filter="url(#retro-banda-distress)" opacity="0.65">
            <polygon
              points="962,-14 992,-14 910,98 880,98"
              fill="url(#retro-carmine-sash-grad)"
            />
            <line
              x1="962"
              y1="-14"
              x2="880"
              y2="98"
              stroke="#9E2A2B"
              strokeWidth="1"
              strokeOpacity="0.42"
              strokeDasharray="3 2"
            />
            <line
              x1="992"
              y1="-14"
              x2="910"
              y2="98"
              stroke="#B89146"
              strokeWidth="0.8"
              strokeOpacity="0.4"
            />
          </g>
        </svg>
      </div>

      {/* Top & Bottom Vintage Stitched Paper Rules */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#9E2A2B]/35 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-[3px] border-t border-dashed border-[#B8A88E]/85 bg-[#E6DCCA]/70" />
    </div>
  );
};

/**
 * Decorative Footer Component:
 * An aged-paper archival banner ("Sello de Casa & La Banda Retro") that crowns the Footer
 * with a textured parchment card, a subtle diagonal carmine sash crossing from top-left to bottom-right,
 * a round philatelic postmark for Venado Tuerto, and an optional quick-booking trigger.
 */
export const RetroFooterBandaMonument: React.FC<{
  studioTitle?: string;
  address?: string;
  neighborhood?: string;
  onBookClick?: () => void;
}> = ({
  studioTitle = 'Rodrigo Cutsss',
  address = 'Vuelta de Obligado 931',
  neighborhood = 'Venado Tuerto, Santa Fe',
  onBookClick,
}) => {
  return (
    <div
      data-testid="retro-footer-banda"
      className="relative max-w-7xl mx-auto px-4 sm:px-8 mb-10 sm:mb-12"
    >
      <div className="relative rounded-xl bg-[#EFE7D6] border border-[#C8BBA4] shadow-[0_12px_32px_rgba(24,21,18,0.09)] overflow-hidden p-5 sm:p-8">
        {/* Aged Paper Inner Stitched Frame */}
        <div
          aria-hidden="true"
          className="absolute inset-2 border border-dashed border-[#B9AA90]/80 rounded-lg pointer-events-none"
        />

        {/* Corner Brass Rivet Accents */}
        <span
          aria-hidden="true"
          className="absolute top-3.5 left-3.5 w-1.5 h-1.5 rounded-full bg-[#B89146]/70 pointer-events-none"
        />
        <span
          aria-hidden="true"
          className="absolute top-3.5 right-3.5 w-1.5 h-1.5 rounded-full bg-[#B89146]/70 pointer-events-none"
        />
        <span
          aria-hidden="true"
          className="absolute bottom-3.5 left-3.5 w-1.5 h-1.5 rounded-full bg-[#B89146]/70 pointer-events-none"
        />
        <span
          aria-hidden="true"
          className="absolute bottom-3.5 right-3.5 w-1.5 h-1.5 rounded-full bg-[#B89146]/70 pointer-events-none"
        />

        {/* Subtle Weathered Diagonal Red Sash ("La Banda") crossing the Aged Paper */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1000 180"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <g filter="url(#retro-banda-distress)">
            {/* Cream paper border around sash */}
            <polygon
              points="360,-20 515,-20 645,200 490,200"
              fill="#FAF6EE"
              fillOpacity="0.86"
            />
            {/* Iconic Diagonal Carmine Sash (Muted Retro Tone) */}
            <polygon
              points="382,-20 493,-20 623,200 512,200"
              fill="#9E2A2B"
              fillOpacity="0.19"
            />
            {/* Stitched Tailoring Lines along the Sash */}
            <line
              x1="382"
              y1="-20"
              x2="512"
              y2="200"
              stroke="#9E2A2B"
              strokeWidth="1.6"
              strokeOpacity="0.5"
              strokeDasharray="6 3"
            />
            <line
              x1="493"
              y1="-20"
              x2="623"
              y2="200"
              stroke="#9E2A2B"
              strokeWidth="1.6"
              strokeOpacity="0.5"
              strokeDasharray="6 3"
            />
            {/* Center Antique Brass Pinstripe */}
            <line
              x1="437"
              y1="-20"
              x2="567"
              y2="200"
              stroke="#B89146"
              strokeWidth="0.9"
              strokeOpacity="0.45"
            />
          </g>
        </svg>

        {/* Content Grid on top of the Aged Paper & Diagonal Sash */}
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: Vintage Crest & Editorial Motto */}
          <div className="flex items-start sm:items-center gap-4">
            <RetroRiverCrestBadge size="lg" />

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-[#9E2A2B] font-semibold">
                <span>Sello de Casa · Tradición &amp; Corte</span>
                <span aria-hidden="true" className="hidden sm:inline">
                  ·
                </span>
                <span className="text-[#5C5346]">Estudio N° 931 · Venado Tuerto</span>
              </div>
              <p className="font-editorial italic text-xl sm:text-2xl md:text-3xl text-[#181512] leading-snug">
                “El orgullo por el buen corte y los colores que llevan historia.”
              </p>
            </div>
          </div>

          {/* Right: Vintage Philatelic Postmark / Stamp & Quick Reserve Action */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between lg:justify-end gap-3.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#C8BBA4]/60">
            <div className="px-4 py-2.5 rounded border border-[#9E2A2B]/45 bg-[#FAF6EE]/92 text-left sm:text-right font-mono shadow-2xs">
              <span className="block text-[10px] uppercase tracking-[0.2em] text-[#9E2A2B] font-semibold">
                {studioTitle} · Archivo Oficial
              </span>
              <span className="block text-xs font-bold text-[#181512] mt-0.5">
                {address} · {neighborhood}
              </span>
            </div>

            {onBookClick && (
              <button
                type="button"
                onClick={onBookClick}
                className="px-4 py-3 rounded bg-[#9E2A2B] hover:bg-[#822021] text-[#FAF6EE] border border-[#781D1E] shadow-[0_2px_0_#5E1516] text-xs font-mono font-semibold uppercase tracking-[0.14em] transition-all cursor-pointer text-center whitespace-nowrap"
              >
                Reservar Turno →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Reusable Subtle Corner Ribbon simulating the diagonal red sash on aged paper cards.
 */
export const RetroCornerBandaBookmark: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({
  size = 'md',
}) => {
  const dim =
    size === 'sm'
      ? 'w-14 h-14'
      : size === 'lg'
        ? 'w-24 h-24'
        : 'w-18 h-18';
  return (
    <div
      aria-hidden="true"
      className={`absolute top-0 right-0 ${dim} pointer-events-none overflow-hidden z-20 select-none`}
    >
      {/* Aged parchment backing strip */}
      <div className="w-32 h-5 bg-[#FAF6EE]/95 border-y border-[#C8BBA4] rotate-45 translate-x-5 translate-y-2 shadow-xs flex items-center justify-center">
        {/* Diagonal Weathered Carmine Sash inside the paper ribbon */}
        <div className="w-full h-2.5 bg-[#9E2A2B] border-y border-dashed border-[#FAF6EE]/65" />
      </div>
    </div>
  );
};
