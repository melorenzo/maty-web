import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { z } from 'astro/zod';
import {
  dayKey,
  generateCode,
  globalKey,
  ipKey,
  isPlausibleWin,
  pickService,
  promoConfigFromEnv,
  promoKey,
  verifyChallenge,
  type PromoRecord,
} from '../../../lib/promo';

export const prerender = false;

const MAX_SCORE = 420;
const TOTAL_INVADERS = 24;

const payloadSchema = z.object({
  token: z.string().max(256),
  seed: z.string().max(64),
  issuedAt: z.number().int().positive(),
  score: z.number().int().min(0).max(100_000),
  durationMs: z.number().int().min(0).max(3_600_000),
  shots: z.number().int().min(0).max(100_000),
  hits: z.number().int().min(0).max(100_000),
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const config = promoConfigFromEnv(env);

  if (!config.secret) {
    return json({ mensaje: 'El servicio de códigos no está configurado' }, 503);
  }

  let parsed: z.infer<typeof payloadSchema>;
  try {
    parsed = payloadSchema.parse(await request.json());
  } catch {
    return json({ mensaje: 'Datos de partida inválidos' }, 400);
  }

  const validChallenge = await verifyChallenge(
    config.secret,
    parsed.token,
    parsed.seed,
    parsed.issuedAt,
  );

  if (!validChallenge) {
    return json({ mensaje: 'La partida no está firmada o expiró' }, 403);
  }

  const plausible = isPlausibleWin(
    {
      score: parsed.score,
      durationMs: parsed.durationMs,
      shots: parsed.shots,
      hits: parsed.hits,
    },
    MAX_SCORE,
    TOTAL_INVADERS,
  );

  if (!plausible.ok) {
    return json({ mensaje: plausible.motivo ?? 'Partida no válida' }, 422);
  }

  const ip = clientAddress ?? 'desconocida';
  const day = dayKey();

  if (env.PROMO_RATE_LIMIT) {
    const { success } = await env.PROMO_RATE_LIMIT.limit({ key: `promo:${ip}` });
    if (!success) {
      return json({ mensaje: 'Ya pediste un código hoy. Mañana podés jugar de nuevo.' }, 429);
    }
  }

  if (env.PROMO) {
    const daily = Number((await env.PROMO.get(globalKey(day))) ?? '0');
    if (daily >= config.dailyCap) {
      return json({ mensaje: 'Se alcanzó el tope de códigos de hoy. Probá mañana.' }, 429);
    }

    const ipCount = Number((await env.PROMO.get(ipKey(ip, day))) ?? '0');
    if (ipCount >= 1) {
      return json({ mensaje: 'Ya pediste un código hoy. Mañana podés jugar de nuevo.' }, 429);
    }

    await env.PROMO.put(ipKey(ip, day), String(ipCount + 1), { expirationTtl: 86_400 });
  }

  const servicio = pickService();
  const code = generateCode(servicio);
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + config.ttlDays * 86_400_000);

  const record: PromoRecord = {
    code,
    servicio,
    descuento: config.discount,
    sesionMinutos: config.sessionMinutes,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    used: false,
  };

  if (env.PROMO) {
    await env.PROMO.put(promoKey(code), JSON.stringify(record), {
      expirationTtl: config.ttlDays * 86_400,
    });
    const daily = Number((await env.PROMO.get(globalKey(day))) ?? '0');
    await env.PROMO.put(globalKey(day), String(daily + 1), { expirationTtl: 86_400 });
  }

  return json({
    code,
    servicio,
    descuento: config.discount,
    sesionMinutos: config.sessionMinutes,
    expira: record.expiresAt,
  });
};
