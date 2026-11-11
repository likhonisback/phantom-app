import React from 'react';
import { useLang } from '../../i18n/LangContext';
import { UserSession } from '../../types';
import { BRAND } from '../../config/brand';
import { Tag } from '../ui/Tag';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';
import { UPDATES_LIST } from '../modals/UpdatesModal';
import { detectDevice } from '../../utils/deviceDetector';

interface ManageTabProps {
  session: UserSession;
  onOpenUpdates: () => void;
  onOpenSetup: () => void;
  onOpenResetDevice: () => void;
  onLogout: () => void;
}

export const ManageTab: React.FC<ManageTabProps> = ({
  session,
  onOpenUpdates,
  onOpenSetup,
  onOpenResetDevice,
  onLogout,
}) => {
  const { t } = useLang();

  // Smart device detection: if session has a bound device use it, otherwise detect client device!
  const detected = detectDevice();
  const isBound = Boolean(session.bound_hwid);
  const deviceModel = session.device_model || (isBound ? detected.device_model : '');
  const deviceOs = session.device_os || (isBound ? detected.device_os : '');
  const deviceDisplayName = [deviceModel, deviceOs].filter(Boolean).join(' · ');

  const latestUpdate = UPDATES_LIST[0];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        minHeight: '100%',
        paddingBottom: 24,
      }}
    >
      {/* Device Lock Info Card */}
      <div className="ph-feature ph-cut-md">
        <div
          className="ph-feature__body ph-cut-md"
          style={{
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              className="ph-label"
              style={{
                fontSize: 10.5,
                color: 'var(--ph-text-5)',
                letterSpacing: '0.12em',
              }}
            >
              {t.thisDevice}
            </span>
            {isBound ? (
              <Tag tone="new">{t.lockedTo}</Tag>
            ) : (
              <Tag tone="soon">{t.notLockedTag}</Tag>
            )}
          </div>

          <div
            className="ph-display"
            style={{
              fontSize: 22,
              letterSpacing: '0.04em',
              color: '#ffffff',
              lineHeight: 1.15,
            }}
          >
            {isBound && deviceDisplayName ? deviceDisplayName : t.noDevice}
          </div>

          <span
            className="ph-row__sub"
            style={{
              color: 'var(--ph-text-5)',
              fontSize: 13,
            }}
          >
            {isBound ? t.keyOnOne : t.noDeviceSub}
          </span>

          {isBound && (
            <div style={{ marginTop: 6 }}>
              <button
                type="button"
                className="ph-btn ph-cut-sm ph-btn--block"
                onClick={onOpenResetDevice}
                style={{
                  background: '#131317',
                  border: '1px solid #1f1f26',
                  color: '#ededed',
                  gap: 8,
                  fontSize: 11.5,
                  letterSpacing: '0.1em',
                }}
              >
                <Icon name="refresh" size={15} strokeWidth={2.4} />
                <span>{t.resetDevice}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Latest Update Row */}
      <button
        type="button"
        className="ph-feature ph-cut-md"
        onClick={onOpenUpdates}
        style={{
          padding: 1,
          textAlign: 'start',
          cursor: 'pointer',
          border: 0,
        }}
      >
        <div
          className="ph-feature__body ph-cut-md"
          style={{
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              className="ph-label"
              style={{
                fontSize: 10.5,
                color: 'var(--ph-text-5)',
                letterSpacing: '0.12em',
              }}
            >
              {t.updates}
            </span>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                color: 'var(--ph-text-6)',
              }}
            >
              <span className="ph-label" style={{ fontSize: 10 }}>
                {t.allUpdates}
              </span>
              <Icon name="chevron" size={14} />
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span
              className="ph-display"
              dir="ltr"
              style={{ fontSize: 20, color: 'var(--ph-accent)' }}
            >
              {latestUpdate.version}
            </span>
            <span
              className="ph-display"
              style={{
                fontSize: 15.5,
                color: '#ffffff',
                letterSpacing: '0.04em',
              }}
            >
              {latestUpdate.title}
            </span>
          </div>

          <span
            style={{
              font: 'var(--ph-type-body-sm)',
              color: 'var(--ph-text-5)',
              textAlign: 'start',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.45,
            }}
          >
            {latestUpdate.body}
          </span>
        </div>
      </button>

      {/* Setup Guide Row */}
      <button
        type="button"
        className="ph-row ph-cut-sm"
        onClick={onOpenSetup}
        style={{
          minHeight: 64,
          padding: '12px 16px',
        }}
      >
        <div
          className="ph-row__icon ph-cut-xs"
          style={{
            background: '#16161b',
            color: '#ffffff',
          }}
        >
          <Icon name="play" size={16} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ph-row__title" style={{ color: '#ffffff', fontSize: 14.5 }}>
            {t.guide}
          </div>
          <div className="ph-row__sub">{t.guideSub}</div>
        </div>
        <div className="ph-row__trail">
          <Icon name="chevron" size={16} />
        </div>
      </button>

      {/* Community Section: ONLY Discord and WhatsApp (Telegram Removed) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
        <div
          className="ph-label"
          style={{
            fontSize: 10.5,
            letterSpacing: '0.12em',
            color: 'var(--ph-text-5)',
            padding: '2px 4px',
          }}
        >
          {t.community}
        </div>

        {/* Discord */}
        <a
          href={BRAND.links.discord || 'https://discord.gg/UsmvXdDfVT'}
          target="_blank"
          rel="noreferrer"
          className="ph-row ph-cut-sm"
          style={{
            textDecoration: 'none',
            minHeight: 64,
            padding: '12px 16px',
          }}
        >
          <div
            className="ph-row__icon ph-cut-xs"
            style={{
              background: '#16161b',
              color: '#ffffff',
              fontWeight: 900,
            }}
          >
            D
          </div>
          <div style={{ flex: 1 }}>
            <div className="ph-row__title" style={{ color: '#ffffff', fontSize: 14.5 }}>
              Discord
            </div>
            <div className="ph-row__sub">Community & Support</div>
          </div>
          <div className="ph-row__trail">
            <Icon name="external" size={16} />
          </div>
        </a>

        {/* WhatsApp */}
        <a
          href={BRAND.links.whatsapp || 'https://wa.me/8801319885254'}
          target="_blank"
          rel="noreferrer"
          className="ph-row ph-cut-sm"
          style={{
            textDecoration: 'none',
            minHeight: 64,
            padding: '12px 16px',
          }}
        >
          <div
            className="ph-row__icon ph-cut-xs"
            style={{
              background: '#16161b',
              color: '#ffffff',
              fontWeight: 900,
            }}
          >
            W
          </div>
          <div style={{ flex: 1 }}>
            <div className="ph-row__title" style={{ color: '#ffffff', fontSize: 14.5 }}>
              WhatsApp
            </div>
            <div className="ph-row__sub">Official Channel · 01319885254</div>
          </div>
          <div className="ph-row__trail">
            <Icon name="external" size={16} />
          </div>
        </a>
      </div>

      {/* Logout Button */}
      <div style={{ marginTop: 'auto', paddingTop: 18 }}>
        <Button
          variant="danger-soft"
          block
          icon={<Icon name="logout" size={16} flip />}
          onClick={onLogout}
        >
          {t.logout}
        </Button>
      </div>
    </div>
  );
};
