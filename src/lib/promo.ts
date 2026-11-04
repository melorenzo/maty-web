import type { ServiceItem } from '../data/types';

export interface PromoConfig {
  secret: string;
  discount: number;
  sessionMinutes: number;
  ttlDays: number;
  dailyCap: number;
}

export interface WinStats {
  score: number;
  durationMs: number;
  shots: number;
  hits: number;
}

export interface PromoRecord {
  code: string;
  servicio: ServiceItem['id'];
  descuento: number;
  sesionMinutos: number;
  issuedAt: string;
  expiresAt: string;
  used: boolean;
  usedAt?: string;
}

export interface PromoValidation {
  ok: boolean;
  motivo?: string;
  record?: PromoRecord;
}

export const CHALLENGE_TTL_MS = 10 * 60 * 1000;
export const MIN_WIN_DURATION_MS = 12_000;
export const MAX_WIN_DURATION_MS = 10 * 60 * 1000;

const SERVICE_PREFIX: Record<ServiceItem['id'], string> = {
  asesoria: 'ASES',
  'diseno-web': 'DISE',
  automatizacion: 'AUTO',
};

const SERVICE_IDS: ServiceItem['id'][] = ['asesoria', 'diseno-web', 'automatizacion'];

export function promoConfigFromEnv(env: {
  PROMO_SECRET?: string;
  PROMO_DISCOUNT?: string;
  PROMO_SESSION_MINUTES?: string;
  PROMO_TTL_DAYS?: string;
  PROMO_DAILY_CAP?: string;
}): PromoConfig {
  return {
    secret: env.PROMO_SECRET ?? '',
    discount: Number(env.PROMO_DISCOUNT ?? 10),
    sessionMinutes: Number(env.PROMO_SESSION_MINUTES ?? 30),
    ttlDays: Number(env.PROMO_TTL_DAYS ?? 30),
    dailyCap: Number(env.PROMO_DAILY_CAP ?? 15),
  };
}

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function signChallenge(
  secret: string,
  seed: string,
  issuedAt: number,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${seed}.${issuedAt}`));
  return toHex(signature);
}

export async function verifyChallenge(
  secret: string,
  token: string,
  seed: string,
  issuedAt: number,
  now: number = Date.now(),
): Promise<boolean> {
  if (!secret || !token || !seed || !Number.isFinite(issuedAt)) return false;
  if (now - issuedAt > CHALLENGE_TTL_MS) return false;
  if (issuedAt - now > 60_000) return false;

  const expected = await signChallenge(secret, seed, issuedAt);
  if (expected.length !== token.length) return false;

  let diff = 0;
  for (let index = 0; index < expected.length; index += 1) {
    diff |= expected.charCodeAt(index) ^ token.charCodeAt(index);
  }
  return diff === 0;
}

export function isPlausibleWin(
  stats: WinStats,
  maxScore: number,
  totalInvaders: number,
): PromoValidation {
  if (stats.score !== maxScore) {
    return { ok: false, motivo: 'El puntaje no corresponde a una oleada completa' };
  }
  if (stats.hits !== totalInvaders) {
    return { ok: false, motivo: 'No se destruyeron todos los invasores' };
  }
  if (stats.shots < totalInvaders || stats.shots > totalInvaders * 12) {
    return { ok: false, motivo: 'La cantidad de disparos no es creíble' };
  }
  if (stats.durationMs < MIN_WIN_DURATION_MS) {
    return { ok: false, motivo: 'La partida fue demasiado corta' };
  }
  if (stats.durationMs > MAX_WIN_DURATION_MS) {
    return { ok: false, motivo: 'La partida duró demasiado' };
  }
  return { ok: true };
}

export function pickService(random: () => number = Math.random): ServiceItem['id'] {
  const index = Math.floor(random() * SERVICE_IDS.length);
  return SERVICE_IDS[index] ?? 'asesoria';
}

export function generateCode(
  servicio: ServiceItem['id'],
  random: () => number = Math.random,
): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let index = 0; index < 4; index += 1) {
    suffix += alphabet[Math.floor(random() * alphabet.length)];
  }
  return `MATE-${SERVICE_PREFIX[servicio]}-${suffix}`;
}

export function dayKey(timestamp: number = Date.now()): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export function promoKey(code: string): string {
  return `promo:code:${code}`;
}

export function ipKey(ip: string, day: string): string {
  return `promo:ip:${ip}:${day}`;
}

export function globalKey(day: string): string {
  return `promo:global:${day}`;
}

export async function emailKey(email: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(email.trim().toLowerCase()),
  );
  return `promo:email:${toHex(digest)}`;
}
