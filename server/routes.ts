import { Router, Request, Response, NextFunction } from 'express';
import { keysDatabase, findOrCreateKey, KeyRecord } from './keys';
import { createToken, verifyToken } from './auth';
import { FeaturesState } from '../src/types';

export const apiRouter = Router();

// Active SSE client connections keyed by user access key
const sseClients = new Map<string, Set<Response>>();

// Broadcast an event to all SSE connections for a specific key
export function broadcastSSE(key: string, eventName: string, data: any = {}) {
  const clients = sseClients.get(key);
  if (!clients || clients.size === 0) return;

  const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of Array.from(clients)) {
    try {
      if (!client.writableEnded && !client.destroyed) {
        client.write(payload);
      } else {
        clients.delete(client);
      }
    } catch {
      clients.delete(client);
    }
  }
}

// Helper to extract session token from cookies, headers, or query
function extractToken(req: Request): string | null {
  // 1. Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  // 2. Custom header
  const customHeader = req.headers['x-session-token'] as string;
  if (customHeader) {
    return customHeader.trim();
  }

  // 3. Cookie header ph_session=<token>
  if (req.headers.cookie) {
    const parts = req.headers.cookie.split(';');
    for (const part of parts) {
      const [k, v] = part.trim().split('=');
      if (k === 'ph_session' && v) {
        return decodeURIComponent(v);
      }
    }
  }

  // 4. Query param token (used for SSE EventSource)
  if (req.query.token && typeof req.query.token === 'string') {
    return req.query.token.trim();
  }

  return null;
}

// Middleware to authenticate session
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ ok: false, error: 'Invalid or expired session' });
  }

  const record = keysDatabase.get(payload.key);
  if (!record) {
    return res.status(401).json({ ok: false, error: 'Session key not found' });
  }

  (req as any).userRecord = record;
  (req as any).token = token;
  next();
}

function buildSessionObject(record: KeyRecord) {
  const subBase = process.env.VITE_APP_URL || 'https://likhonsesni.xo.je';
  const rawSubUrl = `${subBase}/sub/${record.key}`;
  return {
    key: record.key,
    status: record.status,
    online: record.online,
    expires_at: record.expires_at,
    last_seen_at: record.last_seen_at,
    lock_until: record.lock_until,
    bound_hwid: record.bound_hwid,
    device_os: record.device_os,
    device_model: record.device_model,
    reset_after: record.reset_after,
    subscription_url: `hiddify://install-sub?url=${encodeURIComponent(rawSubUrl)}`,
    raw_sub_url: rawSubUrl,
  };
}

/**
 * POST /api/redeem and POST /api/unlock
 * Body: { key: string, device_model?: string, device_os?: string, raw_hwid?: string }
 */
function handleRedeem(req: Request, res: Response) {
  const { key, device_model, device_os, raw_hwid } = req.body;

  if (!key || typeof key !== 'string') {
    return res.status(400).json({ ok: false, error: 'Key is required' });
  }

  const normalized = key.trim().toUpperCase();

  // Validate format PREFIX-XXXX-XXXX-XXXX
  const prefix = process.env.VITE_KEY_PREFIX || 'PH';
  const pattern = new RegExp(`^${prefix}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$`);

  if (!pattern.test(normalized)) {
    return res.status(400).json({
      ok: false,
      error: "this key doesn't exist. check it and try again.",
    });
  }

  const record = findOrCreateKey(normalized);

  // If previous session is active on another browser/device, broadcast logout to old sessions
  broadcastSSE(record.key, 'logout', { reason: 'kicked' });

  // If client provided detected device and record is not bound or new, bind it
  if (device_model && device_os) {
    if (!record.bound_hwid) {
      record.bound_hwid = raw_hwid || `hwid_${Date.now()}`;
      record.device_model = device_model;
      record.device_os = device_os;
    }
  }

  // Check key expiration
  if (record.status === 'expired') {
    return res.status(401).json({
      ok: false,
      error: 'this key has expired. get a new one from your seller.',
    });
  }

  // Issue session token
  const token = createToken(record.key);

  // Set HTTP cookie for seamless browser navigation
  res.setHeader(
    'Set-Cookie',
    `ph_session=${encodeURIComponent(token)}; Path=/; SameSite=Lax; HttpOnly`
  );

  const session = buildSessionObject(record);

  return res.json({
    ok: true,
    token,
    session,
    me: session,
    features: record.features,
  });
}

apiRouter.post('/redeem', handleRedeem);
apiRouter.post('/unlock', handleRedeem);

/**
 * GET /api/me
 * Retrieves current user session and features
 */
apiRouter.get('/me', requireAuth, (req: Request, res: Response) => {
  const record: KeyRecord = (req as any).userRecord;
  record.last_seen_at = new Date().toISOString();

  const session = buildSessionObject(record);

  return res.json({
    ok: true,
    session,
    me: session,
    features: record.features,
  });
});

/**
 * PATCH & POST /api/features
 * Body: { features: FeaturesState }
 */
function handleFeatures(req: Request, res: Response) {
  const record: KeyRecord = (req as any).userRecord;
  const { features } = req.body;

  if (!features || typeof features !== 'object') {
    return res.status(400).json({ ok: false, error: 'Invalid features payload' });
  }

  // Merge features safely
  record.features = {
    ...record.features,
    ...features,
  };

  return res.json({
    ok: true,
    features: record.features,
  });
}

apiRouter.patch('/features', requireAuth, handleFeatures);
apiRouter.post('/features', requireAuth, handleFeatures);

/**
 * GET /api/events (SSE)
 * Real-time event stream for session management (e.g. kicks, expiry)
 */
apiRouter.get('/events', (req: Request, res: Response) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).send('Unauthorized');
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).send('Invalid session');
  }

  const key = payload.key;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  if (!sseClients.has(key)) {
    sseClients.set(key, new Set());
  }
  const clientSet = sseClients.get(key)!;
  clientSet.add(res);

  // Send initial connected event
  res.write(`event: ready\ndata: ${JSON.stringify({ status: 'connected' })}\n\n`);

  // Heartbeat ping every 15s to keep connection alive
  const pingInterval = setInterval(() => {
    try {
      if (!res.writableEnded && !res.destroyed) {
        res.write(': ping\n\n');
      } else {
        clearInterval(pingInterval);
      }
    } catch {
      clearInterval(pingInterval);
    }
  }, 15000);

  const cleanup = () => {
    clearInterval(pingInterval);
    clientSet.delete(res);
    if (clientSet.size === 0) {
      sseClients.delete(key);
    }
  };

  req.on('close', cleanup);
  req.on('error', cleanup);
  res.on('error', cleanup);
});

/**
 * POST /api/link
 * Generates subscription link for Hiddify
 */
apiRouter.post('/link', requireAuth, (req: Request, res: Response) => {
  const record: KeyRecord = (req as any).userRecord;
  const session = buildSessionObject(record);

  return res.json({
    ok: true,
    url: session.raw_sub_url,
    deep_link: session.subscription_url,
  });
});

/**
 * POST /api/relink
 * Refreshes subscription link
 */
apiRouter.post('/relink', requireAuth, (req: Request, res: Response) => {
  const record: KeyRecord = (req as any).userRecord;
  const session = buildSessionObject(record);

  return res.json({
    ok: true,
    url: session.raw_sub_url,
    deep_link: session.subscription_url,
  });
});

/**
 * POST /api/reset-device
 * Resets bound hardware id for the authenticated key
 */
apiRouter.post('/reset-device', requireAuth, (req: Request, res: Response) => {
  const record: KeyRecord = (req as any).userRecord;

  // Check 7 days cooldown if reset_after is set
  if (record.reset_after && new Date(record.reset_after).getTime() > Date.now()) {
    return res.status(429).json({
      ok: false,
      error: 'cooldown',
      reset_after: record.reset_after,
      message: 'You can only reset your device once every 7 days.',
    });
  }

  // Unbind device
  record.bound_hwid = null;
  record.device_model = null;
  record.device_os = null;
  // Set next reset cooldown to 7 days from now
  record.reset_after = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();

  return res.json({
    ok: true,
    message: 'Device reset successfully',
    reset_after: record.reset_after,
  });
});

/**
 * POST /api/logout
 */
apiRouter.post('/logout', (req: Request, res: Response) => {
  const token = extractToken(req);
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      broadcastSSE(payload.key, 'logout', { reason: 'manual' });
    }
  }

  // Clear session cookie
  res.setHeader(
    'Set-Cookie',
    'ph_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly'
  );

  return res.json({ ok: true });
});

/**
 * GET /api/brand
 * Returns public brand info
 */
apiRouter.get('/brand', (req: Request, res: Response) => {
  return res.json({
    ok: true,
    name: process.env.VITE_BRAND_NAME || 'PHANTOM',
    slug: process.env.VITE_BRAND_SLUG || 'phantom',
    prefix: process.env.VITE_KEY_PREFIX || 'PH',
    accent: process.env.VITE_ACCENT_COLOR || '#ededed',
    links: {
      discord: 'https://discord.gg/UsmvXdDfVT',
      whatsapp: 'https://wa.me/8801319885254',
      whatsapp_phone: '01319885254',
      telegram: '',
    },
  });
});
