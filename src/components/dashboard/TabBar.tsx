import React from 'react';
import { useLang } from '../../i18n/LangContext';
import { Icon, IconName } from '../ui/Icon';

export type TabId = 'home' | 'features' | 'manage';

interface TabBarProps {
  currentTab: TabId;
  onChangeTab: (tab: TabId) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ currentTab, onChangeTab }) => {
  const { t } = useLang();

  const tabs: { id: TabId; label: string; icon: IconName }[] = [
    { id: 'home', label: t.home, icon: 'home' },
    { id: 'features', label: t.features, icon: 'features' },
    { id: 'manage', label: t.manage, icon: 'manage' },
  ];

  return (
    <footer style={{ background: 'var(--ph-bg)', position: 'sticky', bottom: 0, zIndex: 30 }}>
      <nav className="ph-tabbar" style={{ '--n': tabs.length } as React.CSSProperties}>
        {tabs.map((tab) => {
          const isSelected = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className="ph-tab"
              aria-selected={isSelected}
              onClick={() => onChangeTab(tab.id)}
            >
              <Icon name={tab.icon} size={20} strokeWidth={2.2} />
              <span style={{ fontSize: 9.5, letterSpacing: '0.12em', fontWeight: 700 }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
      {/* iOS Home Indicator Bar */}
      <div style={{ paddingBottom: 6, display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            width: 110,
            height: 3.5,
            background: '#ffffff',
            borderRadius: 999,
            opacity: 0.65,
          }}
        />
      </div>
    </footer>
  );
};
