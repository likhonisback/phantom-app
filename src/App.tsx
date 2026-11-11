import React, { useState, useEffect } from 'react';
import { KeyGate } from './components/auth/KeyGate';
import { Dashboard } from './components/dashboard/Dashboard';
import { UserSession, FeaturesState } from './types';
import {
  apiGetMe,
  apiUpdateFeatures,
  apiResetDevice,
  apiLogout,
  connectEvents,
  authStorage,
} from './services/api';
import { defaultFeatures } from '../server/keys';
import { Spinner } from './components/ui/Spinner';

export const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [features, setFeatures] = useState<FeaturesState>(defaultFeatures);

  // Check saved session on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = authStorage.getToken();
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await apiGetMe();
        if (res.ok && res.session) {
          setToken(savedToken);
          setSession(res.session);
          if (res.features) setFeatures(res.features);
        } else {
          authStorage.clearToken();
        }
      } catch {
        authStorage.clearToken();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const handleLogout = async () => {
    await apiLogout();
    setToken(null);
    setSession(null);
  };

  // Subscribe to SSE events for real-time remote kicks / logouts
  useEffect(() => {
    if (!token) return;
    const disconnect = connectEvents(handleLogout);
    return () => disconnect();
  }, [token]);

  const handleUnlockSuccess = (
    newSession: UserSession,
    newToken: string,
    initialFeatures?: FeaturesState
  ) => {
    authStorage.setToken(newToken);
    setToken(newToken);
    setSession(newSession);
    if (initialFeatures) setFeatures(initialFeatures);
  };

  const handleUpdateFeatures = async (
    updated: FeaturesState,
    _featureId: string
  ): Promise<boolean> => {
    setFeatures(updated);
    try {
      const res = await apiUpdateFeatures(updated);
      if (res.ok && res.features) {
        setFeatures(res.features);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleResetDevice = async (): Promise<boolean> => {
    try {
      const res = await apiResetDevice();
      if (res.ok) {
        setSession((prev) =>
          prev
            ? {
                ...prev,
                bound_hwid: null,
                device_model: null,
                device_os: null,
                reset_after: res.reset_after || null,
              }
            : null
        );
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  if (loading) {
    return (
      <div className="ph-viewport" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size={28} />
      </div>
    );
  }

  if (!token || !session) {
    return <KeyGate onUnlockSuccess={handleUnlockSuccess} />;
  }

  return (
    <Dashboard
      session={session}
      features={features}
      token={token}
      onLogout={handleLogout}
      onUpdateFeatures={handleUpdateFeatures}
      onResetDevice={handleResetDevice}
    />
  );
};

export default App;
