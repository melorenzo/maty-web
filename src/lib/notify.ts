import { contactReasonLabels, type ContactReason, type ContactPayload } from './contact';

export interface NotifyEnv {
  RESEND_API_KEY?: string;
  MAIL_TO?: string;
  MAIL_FROM?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
}

export interface PromoSummary {
  code: string;
  servicio: ContactReason;
  descuento: number;
}

export interface NotifyResult {
  email: boolean;
  telegram: boolean;
}

function recipients(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function escapeTelegram(text: string): string {
  return text.replace(/[\\`*_{}[\]()#+\-=|>!.]/g, '\\$&');
}

export async function sendEmail(
  env: NotifyEnv,
  payload: ContactPayload,
  promo: PromoSummary | null,
): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false;

  const to = recipients(env.MAIL_TO);
  if (to.length === 0) return false;

  const motivo = contactReasonLabels[payload.reason];
  const subject = `[Sitio] ${motivo} — ${payload.name}`;

  const lines = [
    `Nombre: ${payload.name}`,
    `Email: ${payload.email}`,
    `Motivo: ${motivo}`,
    '',
    payload.message,
  ];

  if (promo) {
    lines.push('', `Código promocional: ${promo.code} (${promo.servicio}, ${promo.descuento}% de descuento)`);
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.MAIL_FROM ?? 'Maty <no-reply@matiaslorenzo.com.ar>',
        to,
        reply_to: payload.email,
        subject,
        text: lines.join('\n'),
      }),
    });

    if (!response.ok) {
      console.warn(
        `[contact] Resend respondió ${response.status}: ${(await response.text()).slice(0, 200)}`,
      );
      return false;
    }

    return true;
  } catch (error) {
    console.warn(
      `[contact] no se pudo llamar a Resend: ${error instanceof Error ? error.message : String(error)}`,
    );
    return false;
  }
}

export async function sendTelegram(
  env: NotifyEnv,
  payload: ContactPayload,
  promo: PromoSummary | null,
): Promise<boolean> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return false;

  const motivo = contactReasonLabels[payload.reason];
  const text = [
    `*Nuevo contacto desde el sitio*`,
    `Nombre: ${escapeTelegram(payload.name)}`,
    `Email: ${escapeTelegram(payload.email)}`,
    `Motivo: ${escapeTelegram(motivo)}`,
    '',
    escapeTelegram(payload.message),
    promo ? `\nCódigo: ${escapeTelegram(promo.code)} (${escapeTelegram(promo.servicio)})` : '',
  ].join('\n');

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text,
          parse_mode: 'Markdown',
        }),
      },
    );

    return response.ok;
  } catch {
    return false;
  }
}
