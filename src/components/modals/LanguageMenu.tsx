import React, { useRef, useEffect } from 'react';
import { useLang, LANGUAGES, LanguageCode } from '../../i18n/LangContext';
import { Icon } from '../ui/Icon';

interface LanguageMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageMenu: React.FC<LanguageMenuProps> = ({ isOpen, onClose }) => {
  const { lang, setLang } = useLang();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div ref={menuRef} className="ph-menu ph-cut-sm">
      {LANGUAGES.map((item) => {
        const isCurrent = item.id === lang;
        return (
          <button
            key={item.id}
            type="button"
            className="ph-menu__item ph-cut-xs"
            aria-current={isCurrent ? 'true' : undefined}
            onClick={() => {
              setLang(item.id as LanguageCode);
              onClose();
            }}
          >
            <span>{item.label}</span>
            {isCurrent && <Icon name="check" size={16} strokeWidth={2.6} />}
          </button>
        );
      })}
    </div>
  );
};
