import React from 'react';

interface OliveOrangeLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  variant?: 'full' | 'icon' | 'badge' | 'horizontal' | 'compact';
  theme?: 'light' | 'dark';
  className?: string;
  showTagline?: boolean;
}

export const OliveOrangeLogo: React.FC<OliveOrangeLogoProps> = ({
  size = 'md',
  variant = 'horizontal',
  theme = 'light',
  className = '',
  showTagline = false,
}) => {
  // Dimension mapping
  let pixelSize = 40;
  if (typeof size === 'number') {
    pixelSize = size;
  } else {
    switch (size) {
      case 'xs': pixelSize = 24; break;
      case 'sm': pixelSize = 32; break;
      case 'md': pixelSize = 44; break;
      case 'lg': pixelSize = 64; break;
      case 'xl': pixelSize = 96; break;
    }
  }

  // The Two Interlocking 'OO' Rings Icon Component
  const OOEmblem = ({ emblemSize = 48, showRingFrame = false }: { emblemSize?: number; showRingFrame?: boolean }) => (
    <svg
      width={emblemSize}
      height={emblemSize}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 overflow-visible drop-shadow-xs"
    >
      <defs>
        {/* Outer Circle Ring Gradient */}
        <linearGradient id="ooRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EA580C" />
          <stop offset="30%" stopColor="#F97316" />
          <stop offset="70%" stopColor="#657B23" />
          <stop offset="100%" stopColor="#3D4A1E" />
        </linearGradient>

        {/* Orange Slice Gradients */}
        <radialGradient id="orangeRind" cx="50%" cy="50%" r="50%">
          <stop offset="82%" stopColor="#EA580C" />
          <stop offset="92%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#FB923C" />
        </radialGradient>
        <radialGradient id="orangePith" cx="50%" cy="50%" r="50%">
          <stop offset="75%" stopColor="#FED7AA" />
          <stop offset="85%" stopColor="#FFF7ED" />
          <stop offset="100%" stopColor="#FB923C" />
        </radialGradient>
        <linearGradient id="orangePulpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF7A00" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>

        {/* Olive Torus 3D Gradient */}
        <linearGradient id="oliveTorus" x1="20%" y1="15%" x2="80%" y2="85%">
          <stop offset="0%" stopColor="#8DA336" />
          <stop offset="25%" stopColor="#6D8525" />
          <stop offset="60%" stopColor="#4D6018" />
          <stop offset="90%" stopColor="#2F3C0E" />
          <stop offset="100%" stopColor="#1E2808" />
        </linearGradient>
        <radialGradient id="oliveGloss" cx="35%" cy="30%" r="40%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <radialGradient id="oliveFruitGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#A3BE38" />
          <stop offset="40%" stopColor="#6D8525" />
          <stop offset="85%" stopColor="#3B4A13" />
          <stop offset="100%" stopColor="#25300B" />
        </radialGradient>

        {/* Leaf Gradients */}
        <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#558B2F" />
          <stop offset="50%" stopColor="#33691E" />
          <stop offset="100%" stopColor="#1B5E20" />
        </linearGradient>
        <linearGradient id="orangeLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#689F38" />
          <stop offset="100%" stopColor="#33691E" />
        </linearGradient>

        {/* Smile Arc Gradient */}
        <linearGradient id="smileGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#EA580C" />
          <stop offset="50%" stopColor="#F97316" />
          <stop offset="50.1%" stopColor="#4D6018" />
          <stop offset="100%" stopColor="#3D4A1E" />
        </linearGradient>
      </defs>

      {/* Optional Outer Ring */}
      {showRingFrame && (
        <circle
          cx="100"
          cy="100"
          r="95"
          stroke="url(#ooRingGrad)"
          strokeWidth="3.5"
          fill="white"
        />
      )}

      <g transform={showRingFrame ? 'translate(0, -10)' : 'translate(0, 0)'}>
        {/* ================= LEFT: ORANGE SLICE RING ================= */}
        <g id="orange-slice">
          {/* Orange Top Leaf & Stem */}
          <path
            d="M62 48 C 65 32, 78 26, 92 31 C 86 42, 75 48, 62 48 Z"
            fill="url(#orangeLeafGrad)"
          />
          <path
            d="M66 46 C 74 38, 85 34, 91 32"
            stroke="#AEDB75"
            strokeWidth="1"
            fill="none"
          />
          {/* Small Stem */}
          <path
            d="M74 48 C 76 42, 80 40, 83 40"
            stroke="#4D6018"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Outer Orange Rind Ring */}
          <circle cx="70" cy="85" r="38" fill="url(#orangeRind)" />
          {/* White Pith Ring */}
          <circle cx="70" cy="85" r="34.5" fill="#FFF7ED" />
          {/* Inner Orange Pulp Area */}
          <circle cx="70" cy="85" r="32" fill="url(#orangePulpGrad)" />
          {/* Inner Hole Background (Hollow) */}
          <circle cx="70" cy="85" r="19" fill="#FFFFFF" />
          {/* Inner White Pith Edge */}
          <circle cx="70" cy="85" r="20.5" stroke="#FFF7ED" strokeWidth="1.5" fill="none" />

          {/* Citrus Segments Rays */}
          {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((deg) => (
            <line
              key={deg}
              x1="70"
              y1="85"
              x2={70 + 32 * Math.cos((deg * Math.PI) / 180)}
              y2={85 + 32 * Math.sin((deg * Math.PI) / 180)}
              stroke="#FFEDD5"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          ))}

          {/* Pulp Grain Highlights */}
          <circle cx="70" cy="85" r="26" stroke="#FED7AA" strokeWidth="0.8" strokeDasharray="2 3" fill="none" opacity="0.6" />
        </g>

        {/* ================= RIGHT: GLOSSY OLIVE RING ================= */}
        <g id="olive-ring">
          {/* Olive Torus Body */}
          <circle cx="130" cy="85" r="36" fill="url(#oliveTorus)" />
          {/* Olive Hollow Center */}
          <circle cx="130" cy="85" r="18" fill="#FFFFFF" />
          {/* Olive Inner Shadow Ring */}
          <circle cx="130" cy="85" r="18" stroke="#2F3C0E" strokeWidth="3" fill="none" opacity="0.7" />

          {/* Gloss Specular Highlight on Torus */}
          <path
            d="M106 72 C 114 60, 142 58, 154 70"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity="0.65"
          />
          <path
            d="M110 74 C 118 64, 138 62, 148 72"
            stroke="white"
            strokeWidth="1"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />

          {/* Branch & Olive Leaves */}
          <path
            d="M142 62 C 146 45, 147 30, 147 22 C 151 32, 155 45, 146 58"
            fill="url(#leafGrad)"
          />
          {/* Right Leaf 1 */}
          <path
            d="M148 55 C 160 48, 172 50, 178 54 C 168 62, 156 62, 148 55 Z"
            fill="url(#leafGrad)"
          />
          {/* Right Leaf 2 (top) */}
          <path
            d="M146 42 C 158 35, 170 38, 175 42 C 165 48, 154 48, 146 42 Z"
            fill="url(#leafGrad)"
          />

          {/* Olive Berry hanging */}
          <g transform="translate(156, 68) rotate(15)">
            {/* Olive Fruit Body */}
            <ellipse cx="0" cy="0" rx="9" ry="12" fill="url(#oliveFruitGrad)" />
            {/* Olive Fruit Highlight */}
            <ellipse cx="-2.5" cy="-3" rx="3.5" ry="5.5" fill="white" opacity="0.45" />
            <circle cx="-3" cy="-4" r="1.5" fill="white" opacity="0.8" />
          </g>
        </g>

        {/* ================= SMILE ARC ================= */}
        <path
          d="M80 128 C 94 138, 106 138, 120 128"
          stroke="url(#smileGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );

  // Full Badge (The complete circular emblem exactly like the provided image)
  if (variant === 'badge') {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div
          className="relative rounded-full bg-white flex flex-col items-center justify-center p-3 shadow-lg border border-amber-200/60"
          style={{ width: pixelSize, height: pixelSize }}
        >
          {/* Emblem */}
          <div className="w-1/2 h-1/2 flex items-center justify-center">
            <OOEmblem emblemSize={pixelSize * 0.48} />
          </div>

          {/* Brand Name */}
          <div className="mt-1 text-center leading-none">
            <span className="font-serif font-black tracking-tight text-[#3D4A1E]" style={{ fontSize: `${pixelSize * 0.08}px` }}>
              Olive<span className="text-[#EA580C]">Orange</span>
            </span>
          </div>

          {/* TECHNOLOGIES Sub-banner */}
          <div className="flex items-center justify-center gap-1 w-3/4 my-0.5">
            <div className="h-[0.5px] bg-[#3D4A1E] flex-1 opacity-60" />
            <span className="font-bold uppercase tracking-[0.2em] text-[#3D4A1E]" style={{ fontSize: `${Math.max(pixelSize * 0.035, 7)}px` }}>
              TECHNOLOGIES
            </span>
            <div className="h-[0.5px] bg-[#3D4A1E] flex-1 opacity-60" />
          </div>

          {/* Slogan */}
          {showTagline && (
            <div className="flex items-center justify-center gap-1 w-5/6">
              <div className="h-[0.5px] bg-[#EA580C] w-3" />
              <span className="text-gray-700 italic font-medium" style={{ fontSize: `${Math.max(pixelSize * 0.03, 6)}px` }}>
                Every Problem Has a Solution.
              </span>
              <div className="h-[0.5px] bg-[#3D4A1E] w-3" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Icon Only
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <OOEmblem emblemSize={pixelSize} />
      </div>
    );
  }

  // Compact Header / Nav / Sidebar Variant
  if (variant === 'compact') {
    const isDark = theme === 'dark';
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        <div className="shrink-0">
          <OOEmblem emblemSize={pixelSize} />
        </div>
        <div className="flex flex-col leading-none">
          <div className="font-serif font-black tracking-tight flex items-center text-sm sm:text-base">
            <span className={isDark ? 'text-amber-200' : 'text-[#3D4A1E]'}>Olive</span>
            <span className="text-[#EA580C]">Orange</span>
          </div>
          <span className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${isDark ? 'text-amber-200/70' : 'text-[#3D4A1E]/70'}`}>
            Stock & ERP
          </span>
        </div>
      </div>
    );
  }

  // Horizontal Full Logo (Default)
  const isDark = theme === 'dark';
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className="shrink-0">
        <OOEmblem emblemSize={pixelSize} />
      </div>
      <div className="flex flex-col">
        <div className="flex items-baseline font-serif font-black tracking-tight leading-none text-base sm:text-xl">
          <span className={isDark ? 'text-white' : 'text-[#3D4A1E]'}>Olive</span>
          <span className="text-[#EA580C]">Orange</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <div className={`h-[1px] w-2.5 ${isDark ? 'bg-amber-400/60' : 'bg-[#3D4A1E]/60'}`} />
          <span className={`text-[9px] font-extrabold uppercase tracking-[0.2em] leading-none ${isDark ? 'text-amber-200/80' : 'text-[#3D4A1E]/80'}`}>
            TECHNOLOGIES
          </span>
          <div className={`h-[1px] w-2.5 ${isDark ? 'bg-amber-400/60' : 'bg-[#3D4A1E]/60'}`} />
        </div>
        {showTagline && (
          <p className={`text-[10px] mt-1 italic font-medium leading-none ${isDark ? 'text-amber-100/70' : 'text-gray-500'}`}>
            Every Problem Has a Solution.
          </p>
        )}
      </div>
    </div>
  );
};

export default OliveOrangeLogo;
