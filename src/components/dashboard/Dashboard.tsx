import React, { useState } from 'react';
import { useLang } from '../../i18n/LangContext';
import { UserSession, FeaturesState } from '../../types';
import { Header } from './Header';
import { TabBar, TabId } from './TabBar';
import { HomeTab } from './HomeTab';
import { FeaturesTab } from './FeaturesTab';
import { ManageTab } from './ManageTab';
import { UpdatesModal } from '../modals/UpdatesModal';
import { SetupGuideModal } from '../modals/SetupGuideModal';
import { ResetDeviceModal } from '../modals/ResetDeviceModal';

interface DashboardProps {
  session: UserSession;
  features: FeaturesState;
  token: string;
  onLogout: () => void;
  onUpdateFeatures: (updated: FeaturesState, featureId: string) => Promise<boolean>;
  onResetDevice: () => Promise<boolean>;
}

export const Dashboard: React.FC<DashboardProps> = ({
  session,
  features,
  token,
  onLogout,
  onUpdateFeatures,
  onResetDevice,
}) => {
  const { t } = useLang();
  const [currentTab, setCurrentTab] = useState<TabId>('home');
  const [updatesOpen, setUpdatesOpen] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const tabTitles: Record<TabId, string> = {
    home: '',
    features: t.features,
    manage: t.manage,
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
        {/* Top Header */}
        <Header
          title={tabTitles[currentTab]}
          hasUpdates={true}
          onOpenUpdates={() => setUpdatesOpen(true)}
          showBack={currentTab !== 'home'}
          onBack={() => setCurrentTab('home')}
        />

        {/* Tab Viewport */}
        <main
          className="ph-view"
          style={{
            flex: 1,
            padding: '4px 16px 20px',
            overflowY: 'auto',
          }}
        >
          {currentTab === 'home' && (
            <HomeTab
              session={session}
              onOpenSetup={() => setSetupOpen(true)}
              onOpenResetDevice={() => setResetOpen(true)}
            />
          )}

          {currentTab === 'features' && (
            <FeaturesTab
              features={features}
              onUpdateFeature={onUpdateFeatures}
            />
          )}

          {currentTab === 'manage' && (
            <ManageTab
              session={session}
              onOpenUpdates={() => setUpdatesOpen(true)}
              onOpenSetup={() => setSetupOpen(true)}
              onOpenResetDevice={() => setResetOpen(true)}
              onLogout={onLogout}
            />
          )}
        </main>

        {/* Bottom Tab Bar */}
        <TabBar currentTab={currentTab} onChangeTab={setCurrentTab} />

        {/* Scanlines Effect Overlay */}
        <div className="ph-scanlines" />

        {/* Modals */}
        <UpdatesModal
          isOpen={updatesOpen}
          onClose={() => setUpdatesOpen(false)}
        />
        <SetupGuideModal
          isOpen={setupOpen}
          onClose={() => setSetupOpen(false)}
          accessKey={session.key}
          subscriptionUrl={session.subscription_url}
        />
        <ResetDeviceModal
          isOpen={resetOpen}
          onClose={() => setResetOpen(false)}
          device={[session.device_model, session.device_os].filter(Boolean).join(' · ')}
          onConfirmReset={onResetDevice}
        />
      </div>
    </div>
  );
};
