import React from 'react';

interface TimeRingProps {
  progress?: number;
  color?: string;
  glow?: string;
  height?: number;
  children?: React.ReactNode;
}

export const TimeRing: React.FC<TimeRingProps> = ({
  progress = 0,
  color = 'var(--ph-accent)',
  glow,
  height = 332,
  children,
}) => {
  const activeTicks = Math.round(60 * Math.max(0, Math.min(1, progress)));
  let activePath = '';
  let inactivePath = '';

  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * 2 * Math.PI - Math.PI / 2;
    const innerRadius = i % 5 ? 129 : 119;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const pathSeg = `M${(150 + 141 * cos).toFixed(1)} ${(150 + 141 * sin).toFixed(1)}L${(150 + innerRadius * cos).toFixed(1)} ${(150 + innerRadius * sin).toFixed(1)}`;
    if (i < activeTicks) {
      activePath += pathSeg;
    } else {
      inactivePath += pathSeg;
    }
  }

  return (
    <div
      className="ph-hud"
      style={{
        height,
        background: `radial-gradient(circle at 50% 50%, ${glow || `color-mix(in oklch, ${color} 16%, transparent)`} 0%, transparent 64%)`,
      }}
    >
      <span className="ph-hud__corner" />
      <span className="ph-hud__corner" />
      <span className="ph-hud__corner" />
      <span className="ph-hud__corner" />
      <svg
        viewBox="0 0 300 300"
        width="300"
        height="300"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          margin: '-150px 0 0 -150px',
        }}
        aria-hidden="true"
      >
        {inactivePath && (
          <path d={inactivePath} stroke="#1f1f24" strokeWidth="3.2" fill="none" />
        )}
        {activePath && (
          <path d={activePath} stroke={color} strokeWidth="3.2" fill="none" />
        )}
      </svg>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          textAlign: 'center',
          maxWidth: 200,
        }}
      >
        {children}
      </div>
    </div>
  );
};
