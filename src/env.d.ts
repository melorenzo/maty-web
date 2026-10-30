/// <reference types="astro/client" />

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

interface RateLimit {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

interface Env {
  PROMO?: KVNamespace;
  PROMO_RATE_LIMIT?: RateLimit;
  RESEND_API_KEY?: string;
  TURNSTILE_SECRET?: string;
  MAIL_TO?: string;
  MAIL_FROM?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  PROMO_SECRET?: string;
  PROMO_DISCOUNT?: string;
  PROMO_SESSION_MINUTES?: string;
  PROMO_TTL_DAYS?: string;
  PROMO_DAILY_CAP?: string;
  ALLOWED_HOSTNAMES?: string;
}

declare module 'cloudflare:workers' {
  export const env: Env;
}
