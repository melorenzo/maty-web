import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { promoConfigFromEnv, signChallenge } from '../../../lib/promo';

export const prerender = false;

export const POST: APIRoute = async () => {
  const config = promoConfigFromEnv(env);

  if (!config.secret) {
    return new Response(JSON.stringify({ mensaje: 'El servicio de códigos no está configurado' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const seed = crypto.randomUUID();
  const issuedAt = Date.now();
  const token = await signChallenge(config.secret, seed, issuedAt);

  return new Response(JSON.stringify({ token, seed, issuedAt }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
};
