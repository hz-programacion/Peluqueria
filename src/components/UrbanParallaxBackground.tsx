import React from 'react';

export const UrbanParallaxBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
    >
      {/* Matte Obsidian Studio Canvas */}
      <div className="absolute inset-0 bg-[#0A0B0E]" />

      {/* Subtle Desaturated Ambient Lighting Orbs */}
      <div className="absolute -top-48 -left-48 w-[34rem] h-[34rem] rounded-full bg-[#D4A373]/[0.045] blur-[140px]" />
      <div className="absolute top-1/3 -right-48 w-[32rem] h-[32rem] rounded-full bg-[#71717A]/[0.04] blur-[150px]" />
      <div className="absolute -bottom-48 left-1/4 w-[30rem] h-[30rem] rounded-full bg-[#C87D65]/[0.03] blur-[140px]" />

      {/* Ultra-Subtle Architectural Grid Lines (Zero floating text that bleeds behind content) */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />
    </div>
  );
};
