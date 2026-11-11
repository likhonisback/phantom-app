import React, { useState } from 'react';
import { useLang } from '../../i18n/LangContext';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

interface Spot {
  id: string;
  name: string;
  x: number; // % 0..100
  y: number; // % 0..100
}

const PRESET_SPOTS: Spot[] = [
  { id: 'clock-tower', name: 'Clock Tower', x: 38, y: 52 },
  { id: 'pochinok', name: 'Pochinok', x: 50, y: 64 },
  { id: 'factory', name: 'Factory', x: 55, y: 48 },
  { id: 'peak', name: 'Peak', x: 48, y: 38 },
  { id: 'bimasakti', name: 'Bimasakti Strip', x: 44, y: 44 },
  { id: 'observatory', name: 'Observatory', x: 26, y: 34 },
  { id: 'katulistiwa', name: 'Katulistiwa', x: 38, y: 26 },
  { id: 'mars-electric', name: 'Mars Electric', x: 62, y: 78 },
  { id: 'mill', name: 'Mill', x: 74, y: 28 },
  { id: 'shipyard', name: 'Shipyard', x: 58, y: 18 },
];

interface LandingMapModalProps {
  isOpen: boolean;
  selectedSpot: { x: number; y: number; name?: string } | null;
  onSelect: (spot: { x: number; y: number; name: string }) => void;
  onClose: () => void;
}

export const LandingMapModal: React.FC<LandingMapModalProps> = ({
  isOpen,
  selectedSpot,
  onSelect,
  onClose,
}) => {
  const { t } = useLang();
  const [active, setActive] = useState<Spot>(() => {
    if (selectedSpot?.name) {
      const match = PRESET_SPOTS.find((s) => s.name === selectedSpot.name);
      if (match) return match;
    }
    return PRESET_SPOTS[3]; // Default to Peak
  });

  if (!isOpen) return null;

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Find nearest preset spot
    let nearest = PRESET_SPOTS[0];
    let minDist = 999999;
    for (const spot of PRESET_SPOTS) {
      const dist = Math.hypot(spot.x - clickX, spot.y - clickY);
      if (dist < minDist) {
        minDist = dist;
        nearest = spot;
      }
    }
    setActive(nearest);
  };

  return (
    <div className="ph-scrim ph-scrim--center">
      <div className="ph-modal ph-cut-lg">
        <div className="ph-modal__head">
          <div className="ph-modal__title">{t.mapTitle}</div>
          <button type="button" className="ph-iconbtn" onClick={onClose}>
            <Icon name="close" size={16} />
          </button>
        </div>

        <div className="ph-label" style={{ color: 'var(--ph-text-6)' }}>
          {t.mapHint}
        </div>

        {/* Map grid area */}
        <div
          className="ph-map ph-cut-md"
          onClick={handleMapClick}
          style={{
            width: '100%',
            height: 280,
            cursor: 'crosshair',
          }}
        >
          {PRESET_SPOTS.map((spot) => {
            const isSelected = spot.id === active.id;
            return (
              <div
                key={spot.id}
                className="ph-map__spot"
                aria-selected={isSelected}
                style={{
                  left: `${spot.x}%`,
                  top: `${spot.y}%`,
                }}
                title={spot.name}
              />
            );
          })}
        </div>

        {/* Selected Spot Details */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '4px 0',
          }}
        >
          <span className="ph-label">{t.landingSpot}</span>
          <span
            className="ph-display"
            style={{ fontSize: 16, color: 'var(--ph-accent)' }}
          >
            {active.name}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <Button variant="secondary" block onClick={onClose}>
            {t.cancel}
          </Button>
          <Button
            variant="primary"
            block
            onClick={() => {
              onSelect({ x: active.x, y: active.y, name: active.name });
              onClose();
            }}
          >
            {t.landHere}
          </Button>
        </div>
      </div>
    </div>
  );
};
