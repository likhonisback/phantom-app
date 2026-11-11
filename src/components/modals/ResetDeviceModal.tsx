import React, { useState } from 'react';
import { useLang } from '../../i18n/LangContext';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';

interface ResetDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: string;
  onConfirmReset: () => Promise<boolean>;
}

export const ResetDeviceModal: React.FC<ResetDeviceModalProps> = ({
  isOpen,
  onClose,
  device,
  onConfirmReset,
}) => {
  const { t } = useLang();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReset = async () => {
    setLoading(true);
    setError(null);
    try {
      const ok = await onConfirmReset();
      if (ok) {
        onClose();
      } else {
        setError(t.resetFailed);
      }
    } catch {
      setError(t.resetFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ph-scrim ph-scrim--center">
      <div className="ph-modal ph-cut-lg">
        <div className="ph-modal__head">
          <div className="ph-modal__title">{t.resetTitle}</div>
          <button type="button" className="ph-iconbtn" onClick={onClose}>
            <Icon name="close" size={16} />
          </button>
        </div>

        <div className="ph-modal__body">
          <p
            style={{
              font: 'var(--ph-type-body-lg)',
              color: 'var(--ph-text-3)',
              lineHeight: 1.6,
            }}
          >
            {t.resetBody.replace('{d}', device || t.thisDevice)}
          </p>

          <div className="ph-notice ph-notice--warn">
            <div className="ph-notice__inner">
              <span className="ph-notice__dot" />
              <div className="ph-notice__body">{t.resetOnce}</div>
            </div>
          </div>

          {error && <div className="ph-fielderror">{error}</div>}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <Button variant="secondary" block onClick={onClose}>
            {t.cancel}
          </Button>
          <Button
            variant="danger"
            block
            loading={loading}
            onClick={handleReset}
          >
            {loading ? t.resetting : t.resetConfirm}
          </Button>
        </div>
      </div>
    </div>
  );
};
