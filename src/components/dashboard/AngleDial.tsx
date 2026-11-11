import React, { useRef, useState } from 'react';

interface AngleDialProps {
  value: number; // -180 to 180
  onCommit: (val: number) => void;
  label?: string;
  rtl?: boolean;
}

export function formatAngle(deg: number): string {
  if (deg === 0) return '0°';
  if (Math.abs(deg) === 180) return '180°';
  return (deg > 0 ? '+' : '−') + Math.abs(deg) + '°';
}

export const AngleDial: React.FC<AngleDialProps> = ({
  value,
  onCommit,
  label = 'wall angle',
}) => {
  const [currentDeg, setCurrentDeg] = useState(value);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Map -180..+180 to 0..1
  const pct = (currentDeg + 180) / 360;

  const updateFromPointer = (e: React.PointerEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const rawDeg = Math.round(-180 + ratio * 360);
    // Snap to 0, -90, +90, -180, 180 if close
    const snaps = [-180, -90, -45, 0, 45, 90, 180];
    let closest = rawDeg;
    for (const snap of snaps) {
      if (Math.abs(snap - rawDeg) <= 6) {
        closest = snap;
        break;
      }
    }
    setCurrentDeg(closest);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateFromPointer(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging.current) {
      updateFromPointer(e);
    }
  };

  const handlePointerUp = () => {
    if (isDragging.current) {
      isDragging.current = false;
      onCommit(currentDeg);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="ph-label">{label}</span>
        <span className="ph-slider__value" style={{ font: 'var(--ph-type-angle)' }}>
          {formatAngle(currentDeg)}
        </span>
      </div>

      <div
        ref={trackRef}
        className="ph-slider"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="ph-slider__track" />
        <div
          className="ph-slider__fill"
          style={{
            left: `${Math.min(pct, 0.5) * 100}%`,
            width: `${Math.abs(pct - 0.5) * 100}%`,
          }}
        />

        {/* Center tick at 0° */}
        <div
          className="ph-slider__tick"
          style={{
            left: '50%',
            top: 14,
            height: 20,
            background: 'var(--ph-line-4)',
          }}
        />

        {/* Thumb */}
        <div
          className="ph-slider__thumb"
          style={{
            left: `${pct * 100}%`,
          }}
        />
      </div>

      {/* Quick Snap Angle Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
        {[-180, -90, 0, 90, 180].map((ang) => (
          <button
            key={ang}
            type="button"
            className="ph-chip"
            aria-pressed={currentDeg === ang}
            onClick={() => {
              setCurrentDeg(ang);
              onCommit(ang);
            }}
          >
            {formatAngle(ang)}
          </button>
        ))}
      </div>
    </div>
  );
};
