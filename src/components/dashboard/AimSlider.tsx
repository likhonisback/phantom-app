import React, { useRef, useState } from 'react';
import { useLang } from '../../i18n/LangContext';
import { Icon } from '../ui/Icon';

interface Stop {
  v: number;
  label: string;
  pct?: number; // display percentage override
}

interface AimSliderProps {
  value: number; // 0.5 to 1.0
  onCommit: (val: number) => void;
  failed?: boolean;
  label?: string;
  stops?: Stop[];
  caution?: number;
  cautionText?: string;
}
export const AimSlider: React.FC<AimSliderProps> = ({
  value,
  onCommit,
  failed,
  label = 'aim height',
  stops,
  caution = 0.85,
  cautionText,
}) => {
  const { t } = useLang();
  const defaultStops: Stop[] = stops || [
    { v: 0.5,  label: t.z_chest,      pct: 50  },
    { v: 0.65, label: t.z_upperChest, pct: 65  },
    { v: 0.75, label: t.z_shoulders,  pct: 75  },
    { v: 0.84, label: t.z_neck,       pct: 84  },
    { v: 1.0,  label: t.z_head,       pct: 100 },
  ];

  const [currentVal, setCurrentVal] = useState(value);
  const isDragging = useRef(false);
  const padRef = useRef<HTMLDivElement>(null);

  const isRisk = currentVal >= caution;

  // Total height of track = 170px
  const TRACK_H = 170;
  // Map value [0.5..1.0] -> y pos [TRACK_H..0]
  const valToY = (v: number) => {
    const clamped = Math.max(0.5, Math.min(1.0, v));
    return (1 - (clamped - 0.5) / 0.5) * TRACK_H;
  };

  const yToVal = (y: number) => {
    const ratio = 1 - Math.max(0, Math.min(TRACK_H, y)) / TRACK_H;
    return 0.5 + ratio * 0.5;
  };

  const currentY = valToY(currentVal);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handlePointerMove(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !padRef.current) return;
    const rect = padRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const rawVal = yToVal(y);

    // Snap to nearest stop if within threshold
    let nearest = rawVal;
    for (const stop of defaultStops) {
      if (Math.abs(stop.v - rawVal) < 0.04) {
        nearest = stop.v;
        break;
      }
    }
    setCurrentVal(Number(nearest.toFixed(2)));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging.current) {
      isDragging.current = false;
      // Snap to nearest stop on release
      let nearest = currentVal;
      let minDist = Infinity;
      for (const stop of defaultStops) {
        const dist = Math.abs(stop.v - currentVal);
        if (dist < minDist) { minDist = dist; nearest = stop.v; }
      }
      const snapped = Number(nearest.toFixed(2));
      setCurrentVal(snapped);
      onCommit(snapped);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="ph-label">{label}</span>
        <span
          className="ph-aim__zone"
          data-risk={isRisk ? '' : undefined}
          style={{ font: 'var(--ph-type-chip)', fontSize: 13 }}
        >
          {defaultStops.reduce((prev, curr) =>
            Math.abs(curr.v - currentVal) < Math.abs(prev.v - currentVal) ? curr : prev
          ).label}
        </span>
      </div>

      <div
        className="ph-aim"
        data-risk={isRisk ? '' : undefined}
        style={{
          position: 'relative',
          height: TRACK_H + 20,
          background: 'var(--ph-surface-2)',
          padding: '10px 14px',
          borderRadius: 8,
          userSelect: 'none',
        }}
      >
        {/* Anatomical Torso / Head SVG silhouette */}
        <svg
          viewBox="0 0 85 170"
          width="85"
          height={TRACK_H}
          className="ph-aim__fig"
          style={{ position: 'absolute', left: 14, top: 10 }}
        >
          {/* Head */}
          <path
            d="M 32 8 C 32 3, 52 3, 52 8 C 58 14, 58 28, 52 36 C 46 42, 38 42, 32 36 C 26 28, 26 14, 32 8 Z"
            className="ph-aim__body"
          />
          {/* Neck & Torso */}
          <path
            d="M 36 38 L 48 38 L 50 48 L 74 54 L 80 62 L 72 130 L 62 165 L 22 165 L 12 130 L 4 62 L 10 54 L 34 48 Z"
            className="ph-aim__body"
          />
        </svg>

        {/* Vertical Rail */}
        <div
          className="ph-aim__rail"
          style={{
            position: 'absolute',
            left: 104,
            top: 10,
            height: TRACK_H,
            width: 4,
            background: 'var(--ph-surface-5)',
          }}
        />

        {/* Risk hatched region */}
        <div
          className="ph-aim__risk"
          style={{
            position: 'absolute',
            left: 104,
            top: 10,
            height: valToY(caution),
            width: 4,
          }}
        />

        {/* Active Fill Rail */}
        <div
          className="ph-aim__fill"
          style={{
            position: 'absolute',
            left: 104,
            top: 10 + currentY,
            height: TRACK_H - currentY,
            width: 4,
          }}
        />

        {/* Reticle horizontal dotted line */}
        <div
          className="ph-aim__line"
          style={{
            position: 'absolute',
            left: 14,
            top: 10 + currentY,
            width: 90,
            borderTop: '1px dashed var(--ph-accent)',
          }}
        />

        {/* Reticle target square */}
        <div
          className="ph-aim__reticle"
          style={{
            position: 'absolute',
            left: 54,
            top: 10 + currentY,
          }}
        />

        {/* Slider thumb on rail */}
        <div
          className="ph-aim__thumb"
          style={{
            position: 'absolute',
            left: 94,
            top: 10 + currentY,
          }}
        />

        {/* Interactive Touch Pad */}
        <div
          ref={padRef}
          className="ph-aim__pad"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{
            position: 'absolute',
            left: 14,
            top: 10,
            width: 110,
            height: TRACK_H,
            cursor: 'ns-resize',
            zIndex: 10,
          }}
        />

        {/* Stop markers on the right */}
        {defaultStops.map((stop) => {
          const y = valToY(stop.v);
          const isSelected = Math.abs(stop.v - currentVal) < 0.03;
          return (
            <button
              key={stop.v}
              type="button"
              className="ph-aim__stop"
              aria-pressed={isSelected}
              data-risk={stop.v >= caution ? '' : undefined}
              style={{
                position: 'absolute',
                left: 118,
                top: 10 + y,
              }}
              onClick={() => {
                setCurrentVal(stop.v);
                onCommit(stop.v);
              }}
            >
              <span className="ph-aim__name">{stop.label}</span>
              <span className="ph-aim__pct">{stop.pct ?? Math.round(stop.v * 100)}%</span>
            </button>
          );
        })}
      </div>

      {isRisk && cautionText && (
        <div className="ph-aim__note">
          <Icon name="alert" size={15} />
          <span>{cautionText}</span>
        </div>
      )}
    </div>
  );
};
