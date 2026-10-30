import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { z } from 'astro/zod';
import { emailKey, promoKey, type PromoRecord } from '../../../lib/promo';

export const prerender = false;

const payloadSchema = z.object({
  code: z.string().trim().min(4).max(32),
  email: z.email(),
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let parsed: z.infer<typeof payloadSchema>;
  try {
    parsed = payloadSchema.parse(await request.json());
  } catch {
    return json({ ok: false, mensaje: 'Código inválido' }, 400);
  }

  if (!env.PROMO) {
    return json({ ok: false, mensaje: 'El servicio de códigos no está configurado' }, 503);
  }

  const raw = await env.PROMO.get(promoKey(parsed.code.toUpperCase()));
  if (!raw) {
    return json({ ok: false, mensaje: 'Ese código no existe' }, 404);
  }

  let record: PromoRecord;
  try {
    record = JSON.parse(raw) as PromoRecord;
  } catch {
    return json({ ok: false, mensaje: 'Ese código no existe' }, 404);
  }

  if (record.used) {
    return json({ ok: false, mensaje: 'Ese código ya fue usado' }, 409);
  }

  if (new Date(record.expiresAt).getTime() < Date.now()) {
    return json({ ok: false, mensaje: 'Ese código venció' }, 410);
  }

  const emailKeyValue = await emailKey(parsed.email);
  const previous = await env.PROMO.get(emailKeyValue);
  if (previous) {
    return json({ ok: false, mensaje: 'Ya usaste un código promocional' }, 409);
  }

  record.used = true;
  record.usedAt = new Date().toISOString();

  await env.PROMO.put(promoKey(record.code), JSON.stringify(record), {
    expirationTtl: 86_400,
  });
  await env.PROMO.put(emailKeyValue, record.code, { expirationTtl: 86_400 });

  return json({
    ok: true,
    codigo: record.code,
    servicio: record.servicio,
    descuento: record.descuento,
    sesionMinutos: record.sesionMinutos,
  });
};
