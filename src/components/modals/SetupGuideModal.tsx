import React, { useState } from 'react';
import { useLang } from '../../i18n/LangContext';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessKey: string;
  subscriptionUrl?: string;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({
  isOpen,
  onClose,
  accessKey,
  subscriptionUrl,
}) => {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const hiddifyDeepLink =
    subscriptionUrl ||
    `hiddify://install-sub?url=${encodeURIComponent(
      `https://likhonsesni.xo.je/sub/${accessKey}`
    )}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(hiddifyDeepLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <div className="ph-scrim ph-scrim--center">
      <div className="ph-modal ph-cut-lg">
        <div className="ph-modal__head">
          <div className="ph-modal__title">{t.guide}</div>
          <button type="button" className="ph-iconbtn" onClick={onClose}>
            <Icon name="close" size={16} />
          </button>
        </div>

        <div className="ph-modal__body">
          {/* Notice: Time is frozen */}
          <div className="ph-notice ph-notice--info">
            <div className="ph-notice__inner">
              <span className="ph-notice__dot" />
              <div>
                <div className="ph-notice__title">{t.setupThawT}</div>
                <div className="ph-notice__body">{t.setupThawB}</div>
              </div>
            </div>
          </div>

          {/* Step 1: Install Hiddify */}
          <div className="ph-feature ph-cut-md">
            <div className="ph-feature__body ph-cut-md" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span className="ph-feature__index">01</span>
                <span className="ph-feature__name">{t.setup1T}</span>
              </div>
              <div className="ph-feature__desc">{t.setup1B}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                <a
                  href="https://apps.apple.com/app/hiddify-proxy-vpn/id6593660983"
                  target="_blank"
                  rel="noreferrer"
                  className="ph-btn ph-cut-xs"
                  style={{ textDecoration: 'none' }}
                >
                  <Icon name="phone" size={16} />
                  <span>{t.iphone}</span>
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=app.hiddify.com"
                  target="_blank"
                  rel="noreferrer"
                  className="ph-btn ph-cut-xs"
                  style={{ textDecoration: 'none' }}
                >
                  <Icon name="play" size={16} />
                  <span>{t.android}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Step 2: Add Subscription */}
          <div className="ph-feature ph-cut-md">
            <div className="ph-feature__body ph-cut-md" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span className="ph-feature__index">02</span>
                <span className="ph-feature__name">{t.setup2T}</span>
              </div>
              <div className="ph-feature__desc">{t.setup2Hint}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                <a
                  href={hiddifyDeepLink}
                  className="ph-btn ph-btn--primary ph-cut-sm ph-btn--block"
                  style={{ textDecoration: 'none' }}
                >
                  <Icon name="plus" size={18} />
                  <span>{t.setup2Btn}</span>
                </a>
                <button
                  type="button"
                  className="ph-btn ph-cut-xs ph-btn--block"
                  onClick={handleCopyLink}
                >
                  <Icon name={copied ? 'check' : 'copy'} size={16} />
                  <span>{copied ? t.setup2Copied : t.setup2Copy}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Step 3: Turn it on */}
          <div className="ph-feature ph-cut-md">
            <div className="ph-feature__body ph-cut-md" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span className="ph-feature__index">03</span>
                <span className="ph-feature__name">{t.setup3T}</span>
              </div>
              <div className="ph-feature__desc">{t.setup3B}</div>
            </div>
          </div>

          {/* Troubleshooting */}
          <div style={{ marginTop: 8 }}>
            <div className="ph-label" style={{ marginBottom: 8 }}>{t.tshoot}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className="ph-notify">
                <div className="ph-notify__title">{t.ts_noint_t}</div>
                <div className="ph-notify__body">{t.ts_noint_b}</div>
              </div>
              <div className="ph-notify">
                <div className="ph-notify__title">{t.ts_locked_t}</div>
                <div className="ph-notify__body">{t.ts_locked_b}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <Button variant="secondary" block onClick={onClose}>
            {t.n_close}
          </Button>
        </div>
      </div>
    </div>
  );
};
