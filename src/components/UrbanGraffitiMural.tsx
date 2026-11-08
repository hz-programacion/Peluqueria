import React from 'react';
import { useStudio } from '../context/StudioContext';

/**
 * Subtle Aged-Paper Diagonal Carmine Sash Watermark behind the Hero section.
 */
export const UrbanGraffitiMural: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { config } = useStudio();
  const primaryColor = '#9E2A2B';
  const secondaryColor = '#B89146';

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none overflow-hidden ${className}`}
    >
      <svg
        viewBox="0 0 1200 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full opacity-35"
      >
        <defs>
          <linearGradient id="mural-sash-paper" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.14" />
            <stop offset="50%" stopColor={primaryColor} stopOpacity="0.22" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* Subtle Weathered Diagonal Sash ("La Banda") across Hero backdrop */}
        <polygon
          points="560,-40 730,-40 380,460 210,460"
          fill="url(#mural-sash-paper)"
        />
        <line
          x1="560"
          y1="-40"
          x2="210"
          y2="460"
          stroke={primaryColor}
          strokeWidth="1.5"
          strokeDasharray="8 4"
          strokeOpacity="0.35"
        />
        <line
          x1="730"
          y1="-40"
          x2="380"
          y2="460"
          stroke={primaryColor}
          strokeWidth="1.5"
          strokeDasharray="8 4"
          strokeOpacity="0.35"
        />

        {/* Fine Vintage Drafting Arc */}
        <path
          d="M 80 350 C 310 170, 560 400, 860 150 S 1100 280, 1170 95"
          stroke={secondaryColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="6 6"
          opacity="0.35"
        />

        {config.studioTitle && (
          <title>{config.studioTitle}</title>
        )}
      </svg>
    </div>
  );
};
