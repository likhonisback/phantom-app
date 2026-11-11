import React, { useState, useEffect } from 'react';
import { useLang } from '../../i18n/LangContext';
import { UserSession } from '../../types';
import { TimeRing } from './TimeRing';
import { BrandMark } from '../ui/BrandMark';
import { StatusPill } from '../ui/StatusPill';
import { Icon } from '../ui/Icon';
import { Notice } from '../ui/Notice';

interface HomeTabProps {
  session: UserSession;
  onOpenSetup: () => void;
  onOpenResetDevice: () => void;
}

export function formatDuration(ms: number, t: any): string {
  if (ms <= 0) return t.expiredWord;
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  if (days > 0) return `${days}${t.u_d} ${hours}${t.u_h}`;
  if (hours > 0) return `${hours}${t.u_h} ${minutes}${t.u_m}`;
  return `${minutes}${t.u_m} ${String(seconds).padStart(2, '0')}${t.u_s}`;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  session,
  onOpenSetup,
}) => {
  const { t } = useLang();
  const [now, setNow] = useState(() => Date.now());
  const [copiedKey, setCopiedKey] = useState(false);

  const isActive = session.status === 'active';
  const isExpired = session.status === 'expired';
  const isPaused = session.status === 'paused';
  const isUnact = session.status === 'unactivated';

  // Live timer tick every 1s
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  const expiresTime = session.expires_at ? new Date(session.expires_at).getTime() : 0;
  const remainingMs = Math.max(0, expiresTime - now);
  // Default max duration = 30 days
  const progress = isActive && !isExpired ? Math.min(1, remainingMs / (30 * 86400 * 1000)) : 0;

  let statusTone: 'ok' | 'warn' | 'bad' | undefined;
  let statusText = '';

  if (isActive) {
    if (session.online) {
      statusTone = 'ok';
      statusText = t.sConnected;
    } else {
      statusTone = undefined;
      statusText = t.sOffline;
    }
  } else if (isExpired) {
    statusTone = 'bad';
    statusText = t.sExpired;
  } else if (isPaused) {
    statusTone = 'warn';
    statusText = t.sPaused;
  } else {
    statusTone = 'bad';
    statusText = t.sUnact;
  }

  let timeDisplay = '—';
  let timeSub = t.startsOnConnect;
  let timeColor = 'var(--ph-text-1)';

  if (isExpired) {
    timeDisplay = t.expiredWord.toUpperCase();
    timeColor = 'var(--ph-bad-text)';
    timeSub = '';
  } else if (isPaused) {
    timeDisplay = t.sPaused.toUpperCase();
    timeColor = 'var(--ph-warn)';
    timeSub = '';
  } else if (isUnact) {
    timeDisplay = '—';
    timeSub = t.notActiveLbl;
  } else if (isActive && session.expires_at) {
    timeDisplay = formatDuration(remainingMs, t);
    timeSub = t.timeLeft;
  }

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(session.key);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } catch {}
  };

  const hiddifyLink =
    session.subscription_url ||
    `hiddify://install-sub?url=${encodeURIComponent(
      `https://likhonsesni.xo.je/sub/${session.key}`
    )}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Status Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 0 2px',
        }}
      >
        <StatusPill tone={statusTone}>{statusText}</StatusPill>
        <span className="ph-label" style={{ color: 'var(--ph-text-7)' }}>
          {session.last_seen_at
            ? t.lastRefreshed.replace('{t}', t.justNow)
            : t.never}
        </span>
      </div>

      {/* Hero TimeRing HUD */}
      <TimeRing
        progress={progress}
        color={isExpired ? 'var(--ph-bad)' : 'var(--ph-accent)'}
        glow={
          isExpired
            ? 'color-mix(in oklch, var(--ph-bad) 25%, transparent)'
            : 'color-mix(in oklch, var(--ph-accent) 25%, transparent)'
        }
      >
        <BrandMark size="md" showTitle={false} />
        <div className="ph-ring__time" style={{ color: timeColor }}>
          {timeDisplay}
        </div>
        {timeSub && (
          <div
            className="ph-label"
            style={{ fontSize: 10.5, color: 'var(--ph-text-6)' }}
          >
            {timeSub}
          </div>
        )}
      </TimeRing>

      {/* Online indicator */}
      {isActive && session.online && (
        <div
          style={{
            textAlign: 'center',
            font: 'var(--ph-type-body)',
            color: 'var(--ph-text-5)',
            marginTop: -4,
          }}
        >
          {t.openFreeFire}
        </div>
      )}

      {/* Warnings & Notices */}
      {isExpired && (
        <Notice tone="bad" title={t.n_expired_t}>
          {t.n_expired_b}
        </Notice>
      )}
      {isPaused && (
        <Notice tone="warn" title={t.n_paused_t}>
          {t.n_paused_b}
        </Notice>
      )}
      {isUnact && (
        <Notice tone="bad" title={t.n_unact_t}>
          {t.n_unact_b}
        </Notice>
      )}

      {/* Connect / Add Subscription Button */}
      <div className="ph-connect-dock">
        <a
          href={isActive ? hiddifyLink : undefined}
          className="ph-connect ph-cut-md btn-glow"
          style={{ textDecoration: 'none' }}
          onClick={(e) => {
            if (!isActive) {
              e.preventDefault();
              onOpenSetup();
            }
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="ph-connect__label">{t.connect}</div>
            <div className="ph-connect__sub">
              {isActive ? t.connectSub : t.disabledSub}
            </div>
          </div>
          <div className="ph-connect__icon ph-cut-sm">
            <Icon name="plus" size={24} strokeWidth={2.6} />
          </div>
        </a>
      </div>

      {/* Key Chip with copy button */}
      <button
        type="button"
        className="ph-keychip ph-cut-sm"
        data-copied={copiedKey ? '' : undefined}
        onClick={handleCopyKey}
      >
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          <span className="ph-label" style={{ fontSize: 9.5 }}>
            {t.keyLbl}
          </span>
          <span className="ph-keychip__value">{session.key}</span>
        </div>
        <span className="ph-keychip__action ph-cut-xs">
          <Icon name={copiedKey ? 'check' : 'copy'} size={15} />
          <span>{copiedKey ? t.copied : t.tapCopy}</span>
        </span>
      </button>

      {/* Setup Guide Link card */}
      <button
        type="button"
        className="ph-row ph-cut-sm"
        onClick={onOpenSetup}
      >
        <div className="ph-row__icon ph-cut-xs">
          <Icon name="play" size={18} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ph-row__title">{t.guide}</div>
          <div className="ph-row__sub">{t.guideSub}</div>
        </div>
        <div className="ph-row__trail">
          <Icon name="chevron" size={16} />
        </div>
      </button>
    </div>
  );
};
