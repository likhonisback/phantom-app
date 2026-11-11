export type UserStatus = 'active' | 'offline' | 'expired' | 'paused' | 'unactivated';

export type TagTone = 'new' | 'paused' | 'risk' | 'beta' | 'hot' | 'soon';

export interface UserSession {
  key: string;
  status: UserStatus;
  online: boolean;
  expires_at: string | null;
  last_seen_at: string | null;
  lock_until: string | null;
  bound_hwid: string | null;
  device_os: string | null;
  device_model: string | null;
  reset_after: string | null;
  subscription_url?: string;
}

export type AimZone = 'chest' | 'upperChest' | 'shoulders' | 'neck' | 'head';

export interface MarkerFeature {
  enabled: boolean;
  type: 'Dreamland' | 'Dot' | 'Box' | 'Cross';
}

export interface AimpointFeature {
  enabled: boolean;
  aim: number; // 0.5 to 1.0
}

export interface SpeedFeature {
  enabled: boolean;
  scale: number; // 1.0 to 1.5
}

export interface AimLagFeature {
  enabled: boolean;
  onFire: boolean;
  onScope: boolean;
}

export interface GlooFeature {
  enabled: boolean;
  yawDeg: number; // -180 to 180
}

export interface FastReviveFeature {
  enabled: boolean;
}

export interface FastLandingFeature {
  enabled: boolean;
  spot: {
    x: number;
    y: number;
    name?: string;
  } | null;
}

export interface FeaturesState {
  marker: MarkerFeature;
  aimpoint: AimpointFeature;
  speed: SpeedFeature;
  aimLag: AimLagFeature;
  gloo: GlooFeature;
  fastRevive: FastReviveFeature;
  fastLanding: FastLandingFeature;
}

export interface UpdateItem {
  version: string;
  title: string;
  body: string;
}

export interface BrandConfig {
  slug: string;
  name: string;
  prefix: string;
  logoImg: string | null;
  markType: 'mark' | 'image' | 'wordmark';
  links: {
    telegram: string;
    discord: string;
    whatsapp: string;
  };
}
