import Stripe from 'stripe';
import { readEnvVar } from './env';

export const DEFAULT_UZS_PER_USD = 12800;

export function getStripeSecretKey(): string | null {
  const key = readEnvVar('STRIPE_SECRET_KEY');
  return key || null;
}

export function getStripeWebhookSecret(): string | null {
  const secret = readEnvVar('STRIPE_WEBHOOK_SECRET');
  return secret || null;
}

export function getStripeClient(): Stripe | null {
  const secretKey = getStripeSecretKey();
  if (!secretKey) return null;
  return new Stripe(secretKey);
}

export function getStripeCurrencyConfig(): { currency: 'usd' | 'uzs'; uzsPerUsd: number } {
  const rawCurrency = (readEnvVar('STRIPE_CURRENCY') || 'usd').toLowerCase();
  const currency: 'usd' | 'uzs' = rawCurrency === 'uzs' ? 'uzs' : 'usd';
  const parsedRate = Number(readEnvVar('STRIPE_UZS_PER_USD'));
  const uzsPerUsd = Number.isFinite(parsedRate) && parsedRate > 1000 ? parsedRate : DEFAULT_UZS_PER_USD;
  return { currency, uzsPerUsd };
}

/**
 * Converts a UZS amount into Stripe's smallest integer unit safely.
 * Defaults to USD cents (12,800 UZS/USD) so high-ticket PC components never exceed Stripe's 32-bit/digit unit caps.
 */
export function convertUzsToStripeUnitAmount(
  priceUzs: number,
  currency: 'usd' | 'uzs',
  uzsPerUsd: number
): number {
  if (currency === 'uzs') {
    return Math.max(100, Math.round(priceUzs * 100));
  }
  const usdCents = Math.round((priceUzs / uzsPerUsd) * 100);
  return Math.max(50, usdCents);
}

/**
 * Resolves the canonical public origin URL for Stripe return URLs.
 */
export function getAppBaseUrl(request: Request): string {
  const originHeader = request.headers.get('origin');
  if (originHeader && /^https?:\/\//i.test(originHeader)) {
    return originHeader.replace(/\/$/, '');
  }

  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`.replace(/\/$/, '');
  }

  const envUrl = readEnvVar('NEXT_PUBLIC_APP_URL');
  if (envUrl && /^https?:\/\//i.test(envUrl)) {
    return envUrl.replace(/\/$/, '');
  }

  return 'http://localhost:3000';
}
