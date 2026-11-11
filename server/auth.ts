import crypto from 'crypto';

const SECRET = process.env.JWT_SECRET || 'phantom_cyberpunk_super_secret_jwt_key_2026';

export interface TokenPayload {
  key: string;
  iat: number;
  exp: number;
}

export function createToken(key: string, expiresInDays = 30): string {
  const payload: TokenPayload = {
    key,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresInDays * 86400,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(body)
    .digest('base64url');
  return `${body}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const [body, signature] = token.split('.');
    if (!body || !signature) return null;

    const expected = crypto
      .createHmac('sha256', SECRET)
      .update(body)
      .digest('base64url');

    if (signature !== expected) return null;

    const payload: TokenPayload = JSON.parse(
      Buffer.from(body, 'base64url').toString('utf8')
    );

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}
