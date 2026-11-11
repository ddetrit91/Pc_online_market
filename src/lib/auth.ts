import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { prisma } from './prisma';

const AUTH_COOKIE_NAME = 'auth_session';

const globalForAuth = globalThis as unknown as {
  ephemeralAuthSecret?: string;
};

/**
 * Reads ADMIN_SECRET_KEY from environment or local .env files.
 * Returns null if not configured so callers never fall back to a public hardcoded string.
 */
export function getAdminSecretKey(): string | null {
  let secret = process.env.ADMIN_SECRET_KEY || '';
  if (!secret) {
    try {
      for (const file of ['.env.local', '.env']) {
        const envPath = path.resolve(process.cwd(), file);
        if (fs.existsSync(envPath)) {
          const content = fs.readFileSync(envPath, 'utf8');
          const match = content.match(/^ADMIN_SECRET_KEY=["']?([^"'\r\n]+)["']?/m);
          if (match?.[1]) {
            secret = match[1].trim();
            break;
          }
        }
      }
    } catch {}
  }
  const cleaned = secret.trim().replace(/^["']|["']$/g, '');
  return cleaned || null;
}

function getSecretKey(): string {
  const configured = process.env.AUTH_SECRET || getAdminSecretKey();
  if (configured) return configured;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET or ADMIN_SECRET_KEY environment variable is required');
  }

  if (!globalForAuth.ephemeralAuthSecret) {
    globalForAuth.ephemeralAuthSecret = crypto.randomBytes(32).toString('hex');
  }
  return globalForAuth.ephemeralAuthSecret;
}

/**
 * Hashes a plain text password with a secure random salt using scrypt.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Constant-time verification of password against salt:hash string.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) return false;
    const computed = crypto.scryptSync(password, salt, 64).toString('hex');
    const hashBuf = Buffer.from(hash, 'hex');
    const compBuf = Buffer.from(computed, 'hex');
    if (hashBuf.length !== compBuf.length) return false;
    return crypto.timingSafeEqual(hashBuf, compBuf);
  } catch {
    return false;
  }
}

export interface SessionPayload {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  phone?: string | null;
  exp: number;
}

/**
 * Creates a signed session token with HMAC-SHA256 signature and expiration timestamp.
 */
export function createSessionToken(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string | null;
}): string {
  const payload: SessionPayload = {
    id: user.id,
    email: user.email.toLowerCase(),
    name: user.name,
    role: user.role === 'ADMIN' ? 'ADMIN' : 'USER',
    phone: user.phone || null,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', getSecretKey()).update(data).digest('base64url');
  return `${data}.${signature}`;
}

/**
 * Verifies the signed session token and checks expiration.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;

    const expected = crypto.createHmac('sha256', getSecretKey()).update(data).digest('base64url');
    if (signature.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

    const payload: SessionPayload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies the current session user from an HTTP Request.
 */
export function getUserFromRequest(request: Request): SessionPayload | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${AUTH_COOKIE_NAME}=([^;]+)`));
  if (!match || !match[1]) return null;

  return verifySessionToken(match[1]);
}

/**
 * Verifies whether the incoming HTTP Request carries an authenticated ADMIN session.
 */
export function isAdminRequest(request: Request): boolean {
  const user = getUserFromRequest(request);
  if (user && user.role === 'ADMIN') return true;

  const adminSecret = getAdminSecretKey();
  if (!adminSecret) return false;

  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/(?:^|;\s*)admin_session=([^;]+)/);
  if (!match?.[1] || match[1].length !== adminSecret.length) return false;

  return crypto.timingSafeEqual(Buffer.from(match[1]), Buffer.from(adminSecret));
}

/**
 * Ensures an initial Administrator account exists when ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD are configured in env.
 */
export async function ensureDefaultAdmin(): Promise<void> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const initialPassword = process.env.ADMIN_INITIAL_PASSWORD?.trim();
    if (!adminEmail || !initialPassword) return;

    const existing = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existing) {
      await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash: hashPassword(initialPassword),
          name: 'Главный Администратор',
          role: 'ADMIN',
        },
      });
    } else if (existing.role !== 'ADMIN') {
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: 'ADMIN' },
      });
    }
  } catch (err) {
    console.warn('Could not auto-seed admin user:', err);
  }
}

export { AUTH_COOKIE_NAME };
