import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { contactReasonLabels, contactSchema } from '../../lib/contact';
import { sendEmail, sendTelegram, type NotifyResult, type PromoSummary } from '../../lib/notify';
import { emailKey, promoKey, type PromoRecord } from '../../lib/promo';
import { parseHostnames, verifyTurnstile } from '../../lib/turnstile';

export const prerender = false;

const TURNSTILE_ACTION = 'contacto';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

async function resolvePromo(code: string, email: string): Promise<PromoSummary | null> {
  if (!code || !env.PROMO) return null;

  const raw = await env.PROMO.get(promoKey(code.toUpperCase()));
  if (!raw) return null;

  let record: PromoRecord;
  try {
    record = JSON.parse(raw) as PromoRecord;
  } catch {
    return null;
  }

  if (record.used) return null;
  if (new Date(record.expiresAt).getTime() < Date.now()) return null;

  const key = await emailKey(email);
  if (await env.PROMO.get(key)) return null;

  record.used = true;
  record.usedAt = new Date().toISOString();

  await env.PROMO.put(promoKey(record.code), JSON.stringify(record), { expirationTtl: 86_400 });
  await env.PROMO.put(key, record.code, { expirationTtl: 86_400 });

  return { code: record.code, servicio: record.servicio, descuento: record.descuento };
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, mensaje: 'No pude leer el formulario' }, 400);
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return json(
      { ok: false, mensaje: first?.message ?? 'Revisá los datos del formulario' },
      400,
    );
  }

  const payload = parsed.data;

  if (payload.website.trim() !== '') {
    return json({ ok: true, mensaje: 'Mensaje recibido' }, 202);
  }

  if (env.TURNSTILE_SECRET) {
    const turnstile = await verifyTurnstile({
      secret: env.TURNSTILE_SECRET,
      token: payload.turnstileToken,
      remoteIp: clientAddress,
      expectedAction: TURNSTILE_ACTION,
      expectedHostnames: parseHostnames(env.ALLOWED_HOSTNAMES),
    });

    if (!turnstile.success) {
      return json(
        { ok: false, mensaje: 'No pude verificar que sos una persona. Probá de nuevo.' },
        403,
      );
    }

    if (turnstile.action !== TURNSTILE_ACTION) {
      return json({ ok: false, mensaje: 'Verificación inválida' }, 403);
    }

    const allowed = parseHostnames(env.ALLOWED_HOSTNAMES);
    if (allowed.length > 0 && !allowed.includes(turnstile.hostname ?? '')) {
      return json({ ok: false, mensaje: 'Verificación inválida' }, 403);
    }
  } else {
    console.warn('[contact] TURNSTILE_SECRET no configurado: se omite la verificación anti-bot');
  }

  const promo = await resolvePromo(payload.code, payload.email);

  const [email, telegram]: [boolean, boolean] = await Promise.all([
    sendEmail(env, payload, promo),
    sendTelegram(env, payload, promo),
  ]);

  const result: NotifyResult = { email, telegram };

  if (!result.email && !result.telegram) {
    return json({ ok: false, mensaje: 'No pude enviar el mensaje. Probá en un rato.' }, 502);
  }

  return json(
    {
      ok: true,
      mensaje: `Mensaje recibido. Te respondo a ${payload.email}.`,
      motivo: contactReasonLabels[payload.reason],
      promo: promo ? { codigo: promo.code, descuento: promo.descuento } : null,
    },
    202,
  );
};
