import { UserSession, FeaturesState } from '../src/types';

export interface KeyRecord {
  key: string;
  status: 'active' | 'offline' | 'expired' | 'paused' | 'unactivated';
  online: boolean;
  expires_at: string | null;
  last_seen_at: string | null;
  lock_until: string | null;
  bound_hwid: string | null;
  device_os: string | null;
  device_model: string | null;
  reset_after: string | null;
  features: FeaturesState;
}

export const defaultFeatures: FeaturesState = {
  marker: {
    enabled: true,
    type: 'Dreamland',
  },
  aimpoint: {
    enabled: false,
    aim: 1.0, // Head (100%)
  },
  speed: {
    enabled: false,
    scale: 1.0,
  },
  aimLag: {
    enabled: false,
    onFire: true,
    onScope: true,
  },
  gloo: {
    enabled: false,
    yawDeg: 0,
  },
  fastRevive: {
    enabled: false,
  },
  fastLanding: {
    enabled: false,
    spot: { x: 48, y: 38, name: 'Peak' },
  },
};

// Preset demo keys for immediate testing
export const keysDatabase = new Map<string, KeyRecord>([
  [
    'PH-7K9A-4M2X-8B1P',
    {
      key: 'PH-7K9A-4M2X-8B1P',
      status: 'active',
      online: true,
      expires_at: new Date(Date.now() + 29 * 24 * 3600 * 1000).toISOString(),
      last_seen_at: new Date().toISOString(),
      lock_until: null,
      bound_hwid: 'hwid_iphone15_9934af2',
      device_os: 'iOS 18.2',
      device_model: 'iPhone 15 Pro',
      reset_after: null,
      features: { ...defaultFeatures },
    },
  ],
  [
    'PH-DEMO-2026-PASS',
    {
      key: 'PH-DEMO-2026-PASS',
      status: 'active',
      online: true,
      expires_at: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
      last_seen_at: new Date().toISOString(),
      lock_until: null,
      bound_hwid: 'hwid_iphone16_a7b8c9',
      device_os: 'iOS 18.1',
      device_model: 'iPhone 16 Pro Max',
      reset_after: null,
      features: { ...defaultFeatures },
    },
  ],
  [
    'PH-9999-DEAD-BEEF',
    {
      key: 'PH-9999-DEAD-BEEF',
      status: 'expired',
      online: false,
      expires_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      last_seen_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      lock_until: null,
      bound_hwid: 'hwid_old',
      device_os: 'iOS 17.5',
      device_model: 'iPhone 14',
      reset_after: null,
      features: { ...defaultFeatures },
    },
  ],
  [
    'PH-PAUS-ED00-0001',
    {
      key: 'PH-PAUS-ED00-0001',
      status: 'paused',
      online: false,
      expires_at: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
      last_seen_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      lock_until: null,
      bound_hwid: null,
      device_os: null,
      device_model: null,
      reset_after: null,
      features: { ...defaultFeatures },
    },
  ],
  [
    'PH-NEWW-WAIT-ACT1',
    {
      key: 'PH-NEWW-WAIT-ACT1',
      status: 'unactivated',
      online: false,
      expires_at: null,
      last_seen_at: null,
      lock_until: null,
      bound_hwid: null,
      device_os: null,
      device_model: null,
      reset_after: null,
      features: { ...defaultFeatures },
    },
  ],
]);

// Helper to find or provision a key if user enters any validly formatted PH-XXXX-XXXX-XXXX key
export function findOrCreateKey(key: string): KeyRecord {
  const normalized = key.trim().toUpperCase();
  if (keysDatabase.has(normalized)) {
    return keysDatabase.get(normalized)!;
  }

  // Auto-provision any properly formatted key with 30 days active subscription
  const newRecord: KeyRecord = {
    key: normalized,
    status: 'active',
    online: true,
    expires_at: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    last_seen_at: new Date().toISOString(),
    lock_until: null,
    bound_hwid: 'hwid_' + Math.random().toString(36).substring(2, 9),
    device_os: 'iOS 18.2',
    device_model: 'iPhone 15 Pro',
    reset_after: null,
    features: { ...defaultFeatures },
  };

  keysDatabase.set(normalized, newRecord);
  return newRecord;
}
