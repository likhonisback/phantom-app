import React from 'react';
import { BRAND } from '../../config/brand';

interface BrandMarkProps {
  size?: 'xl' | 'lg' | 'md' | 'sm';
  showTitle?: boolean;
  glow?: boolean;
  color?: string;
  style?: React.CSSProperties;
  className?: string;
}

export const PhantomMark: React.FC<{
  size?: number;
  color?: string;
  glow?: boolean;
  style?: React.CSSProperties;
  className?: string;
}> = ({
  size = 104,
  color = 'var(--ph-accent)',
  glow = true,
  style,
  className = '',
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label="PHANTOM mark"
      className={`transition-all duration-300 ${className}`}
      style={{
        filter: glow
          ? `drop-shadow(0 0 ${Math.round(size / 5)}px var(--ph-accent-glow))`
          : undefined,
        ...style,
      }}
    >
      <path
        d="M50 4C76 4 92 21 92 46V96L81 86 71 96 60.5 86 50 96 39.5 86 29 96 19 86 8 96V46C8 21 24 4 50 4Z M20 42 44 49 42 60 32 64 22 61 18 53Z M80 42 56 49 58 60 68 64 78 61 82 53Z M50 60 55 69 50 67 45 69Z M32 74 38 79 44 74 50 79 56 74 62 79 68 74 68 77.5 62 82.5 56 77.5 50 82.5 44 77.5 38 82.5 32 77.5Z"
        fill={color}
        fillRule="evenodd"
      />
    </svg>
  );
};

export const Wordmark: React.FC<{ name: string; size?: number }> = ({ name, size = 46 }) => {
  const dotSize = Math.round(size / 4);
  return (
    <div
      dir="ltr"
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: Math.round(size / 7),
        fontFamily: 'var(--ph-font-display)',
        fontSize: size,
        fontWeight: 900,
        fontStretch: '75%',
        textTransform: 'uppercase',
        lineHeight: 0.85,
      }}
    >
      <span>{name}</span>
      <span
        style={{
          flex: 'none',
          width: dotSize,
          height: dotSize,
          marginBottom: Math.round(size / 15),
          background: 'var(--ph-accent)',
        }}
      />
    </div>
  );
};

export const BrandMark: React.FC<BrandMarkProps> = ({
  size = 'xl',
  showTitle,
  glow = true,
  color,
  style,
  className = '',
}) => {
  const sizeMap = {
    xl: { svgSize: 180, wordSize: 46 },
    lg: { svgSize: 170, wordSize: 42 },
    md: { svgSize: 104, wordSize: 26 },
    sm: { svgSize: 52, wordSize: 18 },
  };

  const { svgSize, wordSize } = sizeMap[size];
  const shouldShowTitle = showTitle ?? size === 'xl';

  if (BRAND.markType === 'image' && BRAND.logoImg) {
    return (
      <img
        src={BRAND.logoImg}
        alt={BRAND.name}
        style={{ height: svgSize, width: 'auto', ...style }}
        className={className}
      />
    );
  }

  if (BRAND.markType === 'wordmark') {
    return <Wordmark name={BRAND.name} size={wordSize} />;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: size === 'xl' ? 22 : 14,
        ...style,
      }}
      className={className}
    >
      <PhantomMark size={svgSize} glow={glow} color={color} />
      {shouldShowTitle && (
        <div
          dir="ltr"
          style={{
            font: 'var(--ph-type-wordmark)',
            letterSpacing: 'var(--ph-track-wordmark)',
            marginInlineEnd: '-.16em',
            textTransform: 'uppercase',
          }}
        >
          {BRAND.name}
        </div>
      )}
    </div>
  );
};
