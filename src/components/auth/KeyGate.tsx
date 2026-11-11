import React, { useState, useEffect } from 'react';
import { useLang, LANGUAGES } from '../../i18n/LangContext';
import { BRAND } from '../../config/brand';
import { BrandMark } from '../ui/BrandMark';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { KeyInput, formatKey } from './KeyInput';
import { LanguageMenu } from '../modals/LanguageMenu';
import { UserSession, FeaturesState } from '../../types';
import { detectDevice } from '../../utils/deviceDetector';
import { apiRedeem } from '../../services/api';

interface KeyGateProps {
  onUnlockSuccess: (session: UserSession, token: string, features?: FeaturesState) => void;
  maintenance?: boolean;
}

export const KeyGate: React.FC<KeyGateProps> = ({ onUnlockSuccess, maintenance = false }) => {
  const { t, lang } = useLang();
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [kicked, setKicked] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  // Auto-fill key if provided in query string ?key=... and check ph_kicked
  useEffect(() => {
    try {
      if (localStorage.getItem('ph_kicked')) {
        setKicked(true);
        localStorage.removeItem('ph_kicked');
      }
    } catch {}

    try {
      const params = new URLSearchParams(window.location.search);
      const queryKey = params.get('key');
      if (queryKey) {
        setKey(formatKey(queryKey, BRAND.prefix));
      }
    } catch {}
  }, []);

  const currentLangObj = LANGUAGES.find((l) => l.id === lang) || LANGUAGES[0];

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();

    if (maintenance) {
      setError(t.err_maintenance);
      setErrorKey(Date.now().toString());
      return;
    }

    // Key format regex: PREFIX-XXXX-XXXX-XXXX
    const keyPattern = new RegExp(`^${BRAND.prefix}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$`);
    if (!keyPattern.test(key)) {
      setError(t.err_incomplete);
      setErrorKey(Date.now().toString());
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const detected = detectDevice();
      const res = await apiRedeem(key, {
        device_model: detected.device_model,
        device_os: detected.device_os,
        raw_hwid: detected.raw_hwid,
      });

      if (!res.ok || !res.session || !res.token) {
        let msg = t.err_invalid;
        if (res.error?.includes('expired') || res.error === 'expired') msg = t.err_expired;
        else if (res.error?.includes('maintenance') || res.error === 'maintenance') msg = t.err_maintenance;
        else if (res.error) msg = res.error;

        setError(msg);
        setErrorKey(Date.now().toString());
        setLoading(false);
        return;
      }

      // Success!
      onUnlockSuccess(res.session, res.token, res.features);
    } catch {
      setError(t.err_network);
      setErrorKey(Date.now().toString());
      setLoading(false);
    }
  };

  return (
    <div className="ph-viewport">
      <div
        className="ph-app"
        style={{
          minHeight: '100dvh',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Top Header with Language Selector */}
        <header className="ph-header">
          <div style={{ flex: 1 }} />
          <button
            type="button"
            className="ph-lang ph-cut-xs"
            onClick={() => setLangMenuOpen(!langMenuOpen)}
          >
            <Icon name="globe" size={17} />
            <span>{currentLangObj.short}</span>
          </button>
          <LanguageMenu isOpen={langMenuOpen} onClose={() => setLangMenuOpen(false)} />
        </header>

        {/* Kicked or Maintenance Notification Banner */}
        {kicked && (
          <div style={{ padding: '0 20px', marginBottom: 12 }}>
            <div className="ph-banner" role="status">
              <span className="ph-banner__icon ph-cut-xs">!</span>
              <div>
                <strong>{t.kicked}</strong>: {t.kickedBody}
              </div>
            </div>
          </div>
        )}

        {maintenance && (
          <div style={{ padding: '0 20px', marginBottom: 12 }}>
            <div className="ph-banner" role="status">
              <span className="ph-banner__icon ph-cut-xs">!</span>
              <div>{t.banner}</div>
            </div>
          </div>
        )}

        {/* Brand Hero & Tagline */}
        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px 20px 0',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 18,
              marginBottom: 32,
            }}
          >
            <BrandMark size="xl" />
            <div
              className="ph-label"
              style={{
                fontSize: 11.5,
                color: 'var(--ph-text-6)',
                textAlign: 'center',
                maxWidth: 280,
                lineHeight: 1.6,
              }}
            >
              {t.tagline}
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleUnlock}
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              paddingBottom: 24,
            }}
          >
            <KeyInput
              value={key}
              onChange={(val) => {
                setKey(val);
                setError(null);
              }}
              prefix={BRAND.prefix}
              label={t.accessKey}
              pasteLabel={t.paste}
              error={error}
              errorKey={errorKey}
              onSubmit={handleUnlock}
              autoFocus
            />

            <Button
              variant="primary"
              block
              loading={loading}
              onClick={handleUnlock}
              type="submit"
            >
              {loading ? t.unlocking : t.unlock}
            </Button>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
                textAlign: 'center',
                marginTop: 6,
              }}
            >
              <span
                style={{
                  font: 'var(--ph-type-body)',
                  color: 'var(--ph-text-4)',
                }}
              >
                {t.noKey}
              </span>
              <span
                style={{
                  font: 'var(--ph-type-body-sm)',
                  color: 'var(--ph-text-7)',
                }}
              >
                {t.timeStarts}
              </span>
            </div>
          </form>
        </main>

        {/* Scanlines Effect Overlay */}
        <div className="ph-scanlines" />
      </div>
    </div>
  );
};
