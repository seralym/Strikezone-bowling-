import React from 'react';

interface BallVisualProps {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  brand?: string;
  name?: string;
  coverstock?: 'Solid' | 'Pearl' | 'Hybrid' | 'Urethane' | 'Plastic';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showHoles?: boolean;
  showLogo?: boolean;
  className?: string;
}

export const BallVisual: React.FC<BallVisualProps> = ({
  primaryColor = '#1e3a8a',
  secondaryColor = '#3b82f6',
  accentColor = '#60a5fa',
  brand = 'Storm',
  name = '',
  coverstock = 'Solid',
  size = 'md',
  showHoles = true,
  showLogo = true,
  className = '',
}) => {
  // Dimensions
  const sizeMap = {
    xs: { px: 28, logoScale: 0.4, holesScale: 0.35 },
    sm: { px: 44, logoScale: 0.6, holesScale: 0.5 },
    md: { px: 72, logoScale: 0.85, holesScale: 0.8 },
    lg: { px: 110, logoScale: 1.1, holesScale: 1.0 },
    xl: { px: 160, logoScale: 1.5, holesScale: 1.3 },
  };

  const { px } = sizeMap[size];
  const isPearl = coverstock === 'Pearl';
  const isUrethane = coverstock === 'Urethane';

  // Generate unique gradient IDs based on properties
  const safeId = `${brand.replace(/[^a-zA-Z0-9]/g, '')}_${size}_${primaryColor.replace('#', '')}_${(secondaryColor || '').replace('#', '')}`;

  // Brand emblem SVG icon renderer
  const renderBrandEmblem = () => {
    if (!showLogo || size === 'xs') return null;

    const lowerBrand = brand.toLowerCase();

    if (lowerBrand.includes('storm')) {
      // Storm lightning / thunderbolt emblem
      return (
        <g transform="translate(50, 48) scale(0.65)" opacity="0.85">
          <path
            d="M -4 -16 L 8 -16 L 0 -2 L 7 -2 L -8 18 L -3 3 L -10 3 Z"
            fill="#ffffff"
            filter="drop-shadow(0 1px 2px rgba(0,0,0,0.6))"
          />
        </g>
      );
    }

    if (lowerBrand.includes('hammer')) {
      // Hammer iconic sledgehammer emblem
      return (
        <g transform="translate(50, 50) rotate(-35) scale(0.6)" opacity="0.9">
          {/* Hammer head */}
          <rect x="-10" y="-12" width="20" height="9" rx="1.5" fill="#f8fafc" stroke="#000000" strokeWidth="0.8" />
          {/* Hammer handle */}
          <rect x="-2" y="-3" width="4" height="20" rx="1" fill="#f8fafc" stroke="#000000" strokeWidth="0.8" />
        </g>
      );
    }

    if (lowerBrand.includes('roto')) {
      // Roto Grip Star / Compass emblem
      return (
        <g transform="translate(50, 48) scale(0.55)" opacity="0.85">
          <polygon
            points="0,-16 4,-5 16,-4 7,4 10,16 0,8 -10,16 -7,4 -16,-4 -4,-5"
            fill="#ffffff"
            filter="drop-shadow(0 1px 2px rgba(0,0,0,0.6))"
          />
          <circle cx="0" cy="0" r="3" fill="#ea580c" />
        </g>
      );
    }

    if (lowerBrand.includes('motiv')) {
      // Motiv winged M emblem
      return (
        <g transform="translate(50, 50) scale(0.6)" opacity="0.85">
          <path
            d="M -16 6 L -10 -12 L -4 2 L 0 -6 L 4 2 L 10 -12 L 16 6 L 10 3 L 5 -5 L 0 3 L -5 -5 L -10 3 Z"
            fill="#ffffff"
            filter="drop-shadow(0 1px 2px rgba(0,0,0,0.6))"
          />
        </g>
      );
    }

    if (lowerBrand.includes('ebonite')) {
      // Ebonite atomic orbital / signature ring
      return (
        <g transform="translate(50, 50) scale(0.55)" opacity="0.85">
          <ellipse cx="0" cy="0" rx="14" ry="6" fill="none" stroke="#ffffff" strokeWidth="2.5" transform="rotate(-25)" />
          <ellipse cx="0" cy="0" rx="14" ry="6" fill="none" stroke="#ffffff" strokeWidth="2.5" transform="rotate(45)" />
          <circle cx="0" cy="0" r="4" fill="#ffffff" />
        </g>
      );
    }

    if (lowerBrand.includes('brunswick')) {
      // Brunswick crown
      return (
        <g transform="translate(50, 50) scale(0.65)" opacity="0.85">
          <path
            d="M -12 8 L -12 -5 L -6 2 L 0 -8 L 6 2 L 12 -5 L 12 8 Z"
            fill="#ffffff"
            filter="drop-shadow(0 1px 2px rgba(0,0,0,0.6))"
          />
        </g>
      );
    }

    // Default monogram emblem
    return (
      <text
        x="50"
        y="53"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#ffffff"
        opacity="0.75"
        fontSize="14"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        {brand.charAt(0)}
      </text>
    );
  };

  return (
    <div
      className={`relative rounded-full select-none shrink-0 transition-transform ${className}`}
      style={{ width: px, height: px }}
      title={`${brand} ${name} (${coverstock})`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full rounded-full shadow-lg shadow-black/60 overflow-hidden"
      >
        <defs>
          {/* Base Sphere 3D shading */}
          <radialGradient id={`sphere_${safeId}`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={isPearl ? '0.4' : '0.2'} />
            <stop offset="25%" stopColor={secondaryColor || primaryColor} stopOpacity="1" />
            <stop offset="65%" stopColor={primaryColor} stopOpacity="1" />
            <stop offset="90%" stopColor="#09090b" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#000000" stopOpacity="1" />
          </radialGradient>

          {/* Marble Swirl Pattern Overlay */}
          <linearGradient id={`swirl_${safeId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accentColor || secondaryColor} stopOpacity="0.65" />
            <stop offset="35%" stopColor={primaryColor} stopOpacity="0.2" />
            <stop offset="70%" stopColor={secondaryColor} stopOpacity="0.75" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0.9" />
          </linearGradient>

          {/* Top-left specular gloss highlight */}
          <radialGradient id={`specular_${safeId}`} cx="28%" cy="25%" r="35%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={isPearl ? '0.85' : isUrethane ? '0.2' : '0.55'} />
            <stop offset="40%" stopColor="#ffffff" stopOpacity={isPearl ? '0.35' : '0.1'} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* Subtle bottom-right bounce reflection */}
          <radialGradient id={`rim_${safeId}`} cx="80%" cy="85%" r="40%">
            <stop offset="0%" stopColor={accentColor || secondaryColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Finger hole 3D bevel and depth */}
          <radialGradient id={`hole_${safeId}`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#18181b" />
            <stop offset="60%" stopColor="#09090b" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
        </defs>

        {/* 1. Base Bowling Ball Sphere */}
        <circle cx="50" cy="50" r="49" fill={`url(#sphere_${safeId})`} />

        {/* 2. Realistic Swirl Veins and Organic Flow */}
        <path
          d="M 10 35 Q 35 15 65 30 T 95 65 Q 80 90 45 80 T 5 55 Z"
          fill={`url(#swirl_${safeId})`}
          opacity="0.7"
        />
        <path
          d="M 20 80 Q 55 95 85 70 T 70 20 Q 40 10 20 40 Z"
          fill={accentColor}
          opacity="0.25"
        />

        {/* 3. Surface Specular Highlight & Sheen */}
        <circle cx="50" cy="50" r="49" fill={`url(#specular_${safeId})`} />
        <circle cx="50" cy="50" r="49" fill={`url(#rim_${safeId})`} />

        {/* 4. Brand Logo in Center/Top */}
        {renderBrandEmblem()}

        {/* 5. Three Drilled Finger Holes (Middle, Ring, Thumb with realistic depth) */}
        {showHoles && size !== 'xs' && (
          <g>
            {/* Middle finger hole (Left) */}
            <g transform="translate(62, 38)">
              {/* Outer grip insert bevel */}
              <circle cx="0" cy="0" r="4" fill="none" stroke="#27272a" strokeWidth="0.8" opacity="0.9" />
              {/* Hole cavity */}
              <circle cx="0" cy="0" r="3.2" fill={`url(#hole_${safeId})`} />
              <circle cx="0.5" cy="0.5" r="2.8" fill="#000000" />
            </g>

            {/* Ring finger hole (Right) */}
            <g transform="translate(73, 44)">
              <circle cx="0" cy="0" r="4" fill="none" stroke="#27272a" strokeWidth="0.8" opacity="0.9" />
              <circle cx="0" cy="0" r="3.2" fill={`url(#hole_${safeId})`} />
              <circle cx="0.5" cy="0.5" r="2.8" fill="#000000" />
            </g>

            {/* Thumb slug hole (Bottom) */}
            <g transform="translate(68, 65)">
              {/* White/colored urethane thumb slug outer ring */}
              <circle cx="0" cy="0" r="6.2" fill="none" stroke="#e4e4e7" strokeWidth="1" opacity="0.85" />
              {/* Deep thumb cavity */}
              <circle cx="0" cy="0" r="5.2" fill={`url(#hole_${safeId})`} />
              <circle cx="0.8" cy="0.8" r="4.6" fill="#000000" />
            </g>
          </g>
        )}

        {/* 6. Realistic 3D perimeter shadow ring */}
        <circle
          cx="50"
          cy="50"
          r="48.5"
          fill="none"
          stroke="#000000"
          strokeWidth="2"
          opacity="0.4"
        />
      </svg>
    </div>
  );
};
