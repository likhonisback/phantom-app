import React, { useState } from 'react';
import { useLang, LANGUAGES } from '../../i18n/LangContext';
import { Icon } from '../ui/Icon';
import { LanguageMenu } from '../modals/LanguageMenu';

interface HeaderProps {
  title?: string;
  hasUpdates?: boolean;
  onOpenUpdates?: () => void;
  onBack?: () => void;
  showBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title = '',
  hasUpdates = true,
  onOpenUpdates,
  onBack,
  showBack = false,
}) => {
  const { lang } = useLang();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const currentLangObj = LANGUAGES.find((l) => l.id === lang) || LANGUAGES[0];

  return (
    <header className="ph-header">
      {showBack ? (
        <button
          type="button"
          className="ph-iconbtn ph-cut-xs"
          onClick={onBack}
          aria-label="Back"
        >
          <Icon name="chevron" size={16} strokeWidth={2.4} flip={lang === 'ar'} style={{ transform: lang === 'ar' ? 'scaleX(1)' : 'rotate(180deg)' }} />
        </button>
      ) : (
        <div style={{ width: 40 }} />
      )}

      <div className="ph-header__title" style={{ textAlign: 'left', paddingLeft: 6 }}>
        {title && (
          <span
            className="ph-display"
            style={{
              fontSize: 22,
              letterSpacing: '0.04em',
              color: '#ffffff',
            }}
          >
            {title}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {onOpenUpdates && (
          <button
            type="button"
            className="ph-iconbtn ph-cut-xs ph-bell"
            onClick={onOpenUpdates}
            aria-label="Updates"
          >
            <Icon name="bell" size={18} strokeWidth={2.2} />
            {hasUpdates && <span className="ph-bell__dot" />}
          </button>
        )}

        <button
          type="button"
          className="ph-lang ph-cut-xs"
          onClick={() => setLangMenuOpen(!langMenuOpen)}
        >
          <Icon name="globe" size={16} strokeWidth={2} />
          <span style={{ fontWeight: 700, fontSize: 11 }}>{currentLangObj.short}</span>
        </button>
      </div>

      <LanguageMenu isOpen={langMenuOpen} onClose={() => setLangMenuOpen(false)} />
    </header>
  );
};
