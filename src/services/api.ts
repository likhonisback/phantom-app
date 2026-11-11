import { UserSession, FeaturesState } from '../types';

const TOKEN_KEY = 'ph_auth_token';

export const authStorage = {
  getToken: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken: (token: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {}
  },
  clearToken: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
  },
};

/**
 * Redeem or unlock access key
 * Calls /api/redeem with fallback to /api/unlock
 */
export async function apiRedeem(
  key: string,
  deviceMeta?: { device_model?: string; device_os?: string; raw_hwid?: string }
): Promise<{
  ok: boolean;
  token?: string;
  session?: UserSession;
  features?: FeaturesState;
  error?: string;
}> {
  try {
    const res = await fetch('/api/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key,
        device_model: deviceMeta?.device_model,
        device_os: deviceMeta?.device_os,
        raw_hwid: deviceMeta?.raw_hwid,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok) {
      if (data.token) {
        authStorage.setToken(data.token);
      }
      return {
        ok: true,
        token: data.token,
        session: data.session || data.me,
        features: data.features,
      };
    }

    return {
      ok: false,
      error: typeof data.error === 'string' ? data.error : 'Redeem failed',
    };
  } catch (err: any) {
    return {
      ok: false,
      error: err?.message || 'Network error',
    };
  }
}

// Keep apiUnlock as identical alias
export const apiUnlock = apiRedeem;

/**
 * Retrieve current user session and features
 */
export async function apiGetMe(): Promise<{
  ok: boolean;
  session?: UserSession;
  features?: FeaturesState;
  error?: string;
}> {
  const token = authStorage.getToken();

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch('/api/me', { headers });
    if (res.status === 401) {
      authStorage.clearToken();
      return { ok: false, error: 'Unauthorized' };
    }
    const data = await res.json().catch(() => ({}));
    return {
      ok: res.ok && data.ok,
      session: data.session || data.me,
      features: data.features,
      error: data.error,
    };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Network error' };
  }
}

/**
 * Update feature state
 * Sends PATCH to /api/features
 */
export async function apiUpdateFeatures(features: FeaturesState): Promise<{
  ok: boolean;
  features?: FeaturesState;
  error?: string;
}> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch('/api/features', {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ features }),
    });

    if (res.status === 401) {
      return { ok: false, error: 'Unauthorized' };
    }

    const data = await res.json().catch(() => null);
    return {
      ok: res.ok,
      features: data?.features ?? features,
      error: data?.error,
    };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Network error' };
  }
}

/**
 * Generates subscription link for Hiddify
 */
export async function apiGetLink(): Promise<{
  ok: boolean;
  url?: string;
  deep_link?: string;
  reason?: string;
  device_os?: string;
  device_model?: string;
}> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch('/api/link', {
      method: 'POST',
      headers,
    });
    return res.json().catch(() => ({ ok: false }));
  } catch {
    return { ok: false };
  }
}

/**
 * Re-add/refresh subscription link
 */
export async function apiRelink(): Promise<{
  ok: boolean;
  url?: string;
  deep_link?: string;
  error?: string;
}> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch('/api/relink', {
      method: 'POST',
      headers,
    });
    return res.json().catch(() => ({ ok: false }));
  } catch {
    return { ok: false };
  }
}

/**
 * Reset bound hardware id
 */
export async function apiResetDevice(): Promise<{
  ok: boolean;
  reset_after?: string;
  error?: string;
  status?: number;
}> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch('/api/reset-device', {
      method: 'POST',
      headers,
    });
    const data = await res.json().catch(() => ({}));
    return {
      ok: res.ok,
      status: res.status,
      reset_after: data?.reset_after,
      error: data?.error,
    };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Network error' };
  }
}

/**
 * Logout and clear session
 */
export async function apiLogout(): Promise<void> {
  const token = authStorage.getToken();
  try {
    await fetch('/api/logout', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch {}
  authStorage.clearToken();
}

/**
 * Connect to SSE events
 */
export function connectEvents(onLogout: () => void): () => void {
  const token = authStorage.getToken();
  const url = token ? `/api/events?token=${encodeURIComponent(token)}` : '/api/events';

  let eventSource: EventSource | null = null;
  try {
    eventSource = new EventSource(url);
    eventSource.addEventListener('logout', () => {
      eventSource?.close();
      try {
        localStorage.setItem('ph_kicked', '1');
      } catch {}
      onLogout();
    });
  } catch {}

  return () => {
    if (eventSource) {
      eventSource.close();
    }
  };
}
