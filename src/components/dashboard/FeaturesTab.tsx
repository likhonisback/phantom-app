import React, { useState } from 'react';
import { useLang } from '../../i18n/LangContext';
import { FeaturesState, TagTone } from '../../types';
import { Switch } from '../ui/Switch';
import { Tag } from '../ui/Tag';
import { ChipGroup } from '../ui/ChipGroup';
import { AimSlider } from './AimSlider';
import { SpeedSlider } from './SpeedSlider';
import { AngleDial } from './AngleDial';
import { LandingMapModal } from './LandingMapModal';
import { MARKER_TYPES } from '../../config/brand';
import { Icon } from '../ui/Icon';

interface FeaturesTabProps {
  features: FeaturesState;
  onUpdateFeature: (updated: FeaturesState, featureId: string) => Promise<boolean>;
}

export const FeaturesTab: React.FC<FeaturesTabProps> = ({
  features,
  onUpdateFeature,
}) => {
  const { t } = useLang();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [failedId, setFailedId] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);

  const handleToggle = async (key: keyof FeaturesState, enabled: boolean) => {
    setSavingId(key);
    setFailedId(null);
    const updated: FeaturesState = {
      ...features,
      [key]: {
        ...(features[key] as any),
        enabled,
      },
    };
    const ok = await onUpdateFeature(updated, key);
    setSavingId(null);
    if (!ok) setFailedId(key);
  };

  const handleSubChange = async (key: keyof FeaturesState, payload: any) => {
    setSavingId(key);
    setFailedId(null);
    const updated: FeaturesState = {
      ...features,
      [key]: {
        ...(features[key] as any),
        ...payload,
      },
    };
    const ok = await onUpdateFeature(updated, key);
    setSavingId(null);
    if (!ok) setFailedId(key);
  };

  const featureCards: {
    id: keyof FeaturesState;
    index: number;
    name: string;
    desc: string;
    enabled: boolean;
    tag?: TagTone;
    content?: React.ReactNode;
  }[] = [
    {
      id: 'marker',
      index: 1,
      name: t.f_marker,
      desc: t.d_marker,
      enabled: features.marker.enabled,
      tag: 'hot',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span className="ph-label" style={{ fontSize: 10.5, letterSpacing: '0.12em', color: 'var(--ph-text-5)' }}>
            {t.markStyle}
          </span>
          <ChipGroup
            options={MARKER_TYPES.map((m) => ({
              value: m,
              label: m === 'Dreamland' ? 'DREAM' : m.toUpperCase(),
            }))}
            value={features.marker.type}
            onChange={(val) => handleSubChange('marker', { type: val, enabled: true })}
          />
        </div>
      ),
    },
    {
      id: 'aimpoint',
      index: 2,
      name: t.f_aimpoint,
      desc: t.d_aimHeight,
      enabled: features.aimpoint.enabled,
      tag: 'beta',
      content: (
        <AimSlider
          value={features.aimpoint.aim}
          onCommit={(val) => handleSubChange('aimpoint', { aim: val, enabled: true })}
          cautionText={t.aimCaution}
        />
      ),
    },
    {
      id: 'speed',
      index: 3,
      name: t.f_speed,
      desc: t.d_speed,
      enabled: features.speed.enabled,
      tag: 'new',
      content: (
        <SpeedSlider
          value={features.speed.scale}
          onCommit={(val) => handleSubChange('speed', { scale: val, enabled: true })}
          cautionText={t.speedCaution}
        />
      ),
    },
    {
      id: 'aimLag',
      index: 4,
      name: t.f_aimlag,
      desc: t.d_aimlag,
      enabled: features.aimLag.enabled,
      tag: 'risk',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            type="button"
            className="ph-subswitch"
            onClick={() =>
              handleSubChange('aimLag', { onFire: !features.aimLag.onFire })
            }
          >
            <span>{t.whenFiring}</span>
            <Switch checked={features.aimLag.onFire} asIndicator size="sm" />
          </button>
          <button
            type="button"
            className="ph-subswitch"
            onClick={() =>
              handleSubChange('aimLag', { onScope: !features.aimLag.onScope })
            }
          >
            <span>{t.whenScoping}</span>
            <Switch checked={features.aimLag.onScope} asIndicator size="sm" />
          </button>
        </div>
      ),
    },
    {
      id: 'gloo',
      index: 5,
      name: t.f_gloo,
      desc: t.d_gloo,
      enabled: features.gloo.enabled,
      content: (
        <AngleDial
          value={features.gloo.yawDeg}
          onCommit={(val) => handleSubChange('gloo', { yawDeg: val })}
        />
      ),
    },
    {
      id: 'fastRevive',
      index: 6,
      name: t.f_revive,
      desc: t.d_revive,
      enabled: features.fastRevive.enabled,
    },
    {
      id: 'fastLanding',
      index: 7,
      name: t.f_landing,
      desc: t.d_landing,
      enabled: features.fastLanding.enabled,
      tag: 'soon',
      content: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="ph-label">{t.landingSpot}</div>
            <div
              className="ph-display"
              style={{ fontSize: 16, color: 'var(--ph-accent)', marginTop: 2 }}
            >
              {features.fastLanding.spot?.name || 'Clock Tower'}
            </div>
          </div>
          <button
            type="button"
            className="ph-btn ph-cut-xs"
            onClick={() => setMapOpen(true)}
          >
            <Icon name="globe" size={16} />
            <span>{t.change}</span>
          </button>
        </div>
      ),
    },
  ];

  const totalCount = featureCards.length;
  const enabledCount = featureCards.filter((c) => c.enabled).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Subheader with Active Count */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '2px 2px 6px',
        }}
      >
        <span style={{ font: 'var(--ph-type-body)', color: 'var(--ph-text-5)', fontSize: 13 }}>
          {t.featuresSub}
        </span>
        <div
          className="ph-display"
          dir="ltr"
          style={{ fontSize: 16, letterSpacing: '0.04em' }}
        >
          <span style={{ color: '#ffffff' }}>{enabledCount}</span>
          <span style={{ color: '#52525b' }}>/{totalCount}</span>
        </div>
      </div>

      {/* Feature Cards List */}
      {featureCards.map((card) => {
        const isSaving = savingId === card.id;
        const isFailed = failedId === card.id;

        return (
          <div
            key={card.id}
            className="ph-feature ph-cut-md"
            data-on={card.enabled ? '' : undefined}
            data-failed={isFailed ? '' : undefined}
          >
            <div className="ph-feature__body ph-cut-md">
              {/* Head */}
              <div
                className="ph-feature__head"
                onClick={() => handleToggle(card.id, !card.enabled)}
              >
                <span
                  className="ph-feature__index"
                  style={{
                    color: card.enabled ? 'var(--ph-accent-text)' : '#44444d',
                    fontWeight: 700,
                    marginTop: 3,
                  }}
                >
                  {String(card.index).padStart(2, '0')}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 5,
                    }}
                  >
                    <span
                      className="ph-feature__name"
                      style={{
                        color: '#ffffff',
                        fontSize: 16,
                      }}
                    >
                      {card.name}
                    </span>
                    {card.tag && (
                      <Tag tone={card.tag}>
                        {String((t as Record<string, any>)[`tag_${card.tag}`] || card.tag).toUpperCase()}
                      </Tag>
                    )}
                  </div>
                  <div
                    className="ph-feature__desc"
                    style={{
                      color: '#71717a',
                      fontSize: 13,
                      lineHeight: 1.45,
                    }}
                  >
                    {card.desc}
                  </div>
                </div>

                <Switch
                  checked={card.enabled}
                  saving={isSaving}
                  onChange={(val) => handleToggle(card.id, val)}
                  label={card.name}
                />
              </div>

              {/* Collapsible Tray for sliders/chips — always show when feature has content */}
              {card.content && (card.enabled || card.id === 'aimpoint') && (
                <div className="ph-feature__tray">{card.content}</div>
              )}
            </div>
          </div>
        );
      })}

      {/* Landing Waypoint Modal */}
      <LandingMapModal
        isOpen={mapOpen}
        selectedSpot={features.fastLanding.spot}
        onSelect={(spot) =>
          handleSubChange('fastLanding', { spot, enabled: true })
        }
        onClose={() => setMapOpen(false)}
      />
    </div>
  );
};
