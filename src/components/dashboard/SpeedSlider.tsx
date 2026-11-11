import React, { useRef, useState } from 'react';
import { Icon } from '../ui/Icon';

interface SpeedSliderProps {
  value: number; // 1.0 to 1.5
  onCommit: (val: number) => void;
  failed?: boolean;
  label?: string;
  cautionText?: string;
  rtl?: boolean;
}

const STOPS = [1.0, 1.1, 1.2, 1.3, 1.4, 1.5];

export const SpeedSlider: React.FC<SpeedSliderProps> = ({
  value,
  onCommit,
  label = 'speed',
  cautionText,
}) => {
  const [currentVal, setCurrentVal] = useState(value);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const min = 1.0;
  const max = 1.5;
  const pct = Math.max(0, Math.min(1, (currentVal - min) / (max - min)));

  const updateFromPointer = (e: React.PointerEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const rawVal = min + ratio * (max - min);

    // Snap to nearest 0.1
    let closest = STOPS[0];
    let minDiff = 999;
    for (const s of STOPS) {
      const diff = Math.abs(s - rawVal);
      if (diff < minDiff) {
        minDiff = diff;
        closest = s;
      }
    }
    setCurrentVal(Number(closest.toFixed(1)));
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
      onCommit(currentVal);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="ph-label">{label}</span>
        <span
          className="ph-slider__value"
          style={{
            font: 'var(--ph-type-angle)',
            color: currentVal > 1.4 ? 'var(--ph-bad)' : 'var(--ph-accent)',
          }}
        >
          ×{currentVal.toFixed(1)}
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
            width: `${pct * 100}%`,
            background: currentVal > 1.4 ? 'var(--ph-bad)' : 'var(--ph-accent)',
          }}
        />

        {/* Stop ticks */}
        {STOPS.map((s) => {
          const tickPct = (s - min) / (max - min);
          return (
            <div
              key={s}
              className="ph-slider__tick"
              style={{
                left: `${tickPct * 100}%`,
                top: 18,
                height: 12,
              }}
            />
          );
        })}

        {/* Thumb */}
        <div
          className="ph-slider__thumb"
          style={{
            left: `${pct * 100}%`,
            background: currentVal > 1.4 ? 'var(--ph-bad)' : 'var(--ph-text-1)',
          }}
        />
      </div>

      {currentVal > 1.4 && cautionText && (
        <div className="ph-aim__note">
          <Icon name="alert" size={15} />
          <span>{cautionText}</span>
        </div>
      )}
    </div>
  );
};
