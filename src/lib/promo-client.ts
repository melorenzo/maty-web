import { CHALLENGE_TTL_MS } from './promo';

export interface Challenge {
  token: string;
  seed: string;
  issuedAt: number;
}

export interface WinStats {
  score: number;
  durationMs: number;
  shots: number;
  hits: number;
}

export interface PromoResult {
  code: string;
  servicio: string;
  descuento: number;
  sesionMinutos: number;
  expira: string;
}

export type PromoOutcome =
  | { ok: true; promo: PromoResult }
  | { ok: false; mensaje: string };

type FetchLike = typeof fetch;

const MENSAJE_SIN_SERVICIO = 'El servicio de códigos está fuera de línea, pero podés jugar igual.';

export function challengeVigente(
  challenge: Challenge | null,
  now: number = Date.now(),
): challenge is Challenge {
  return challenge !== null && now - challenge.issuedAt < CHALLENGE_TTL_MS - 30_000;
}

export async function pedirChallenge(fetchImpl: FetchLike = fetch): Promise<Challenge | null> {
  try {
    const response = await fetchImpl('/api/promo/challenge', { method: 'POST' });
    if (!response.ok) return null;
    const data = (await response.json()) as Challenge;
    if (!data?.token || !data?.seed || !Number.isFinite(data?.issuedAt)) return null;
    return data;
  } catch {
    return null;
  }
}

export async function canjearCodigo(
  stats: WinStats,
  challenge: Challenge | null,
  fetchImpl: FetchLike = fetch,
  now: () => number = Date.now,
): Promise<PromoOutcome> {
  let reto = challenge;

  if (!challengeVigente(reto, now())) {
    const nuevo = await pedirChallenge(fetchImpl);
    if (!nuevo) return { ok: false, mensaje: MENSAJE_SIN_SERVICIO };
    reto = nuevo;
  }

  const enviar = (r: Challenge) =>
    fetchImpl('/api/promo/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: r.token,
        seed: r.seed,
        issuedAt: r.issuedAt,
        score: stats.score,
        durationMs: stats.durationMs,
        shots: stats.shots,
        hits: stats.hits,
      }),
    });

  try {
    let response = await enviar(reto);

    if (response.status === 403) {
      const nuevo = await pedirChallenge(fetchImpl);
      if (!nuevo) return { ok: false, mensaje: MENSAJE_SIN_SERVICIO };
      response = await enviar(nuevo);
    }

    const data = (await response.json()) as Partial<PromoResult> & { mensaje?: string };

    if (!response.ok) {
      return { ok: false, mensaje: data.mensaje ?? 'No pudimos emitir el código.' };
    }

    return { ok: true, promo: data as PromoResult };
  } catch {
    return { ok: false, mensaje: 'Sin conexión con el servidor de códigos.' };
  }
}
