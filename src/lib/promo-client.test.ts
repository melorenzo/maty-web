import { describe, expect, it, vi } from 'vitest';
import {
  canjearCodigo,
  challengeVigente,
  pedirChallenge,
  type Challenge,
  type WinStats,
} from './promo-client';

const stats: WinStats = { score: 420, durationMs: 30_000, shots: 24, hits: 24 };

const reto: Challenge = { token: 'tok', seed: 'seed', issuedAt: 1_000_000 };

function respuesta(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('promo-client', () => {
  it('un reto vigente se acepta', () => {
    expect(challengeVigente(reto, 1_000_000)).toBe(true);
  });

  it('un reto viejo se descarta', () => {
    expect(challengeVigente(reto, 1_000_000 + 11 * 60 * 1000)).toBe(false);
  });

  it('un reto ausente no es vigente', () => {
    expect(challengeVigente(null)).toBe(false);
  });

  it('pedirChallenge devuelve el reto firmado', async () => {
    const fetchImpl = vi.fn(async (_url: string, _init?: RequestInit) => respuesta(reto));
    await expect(pedirChallenge(fetchImpl as unknown as typeof fetch)).resolves.toEqual(reto);
  });

  it('pedirChallenge devuelve null si el servidor falla', async () => {
    const fetchImpl = vi.fn(async (_url: string, _init?: RequestInit) => respuesta({}, 503));
    await expect(pedirChallenge(fetchImpl as unknown as typeof fetch)).resolves.toBeNull();
  });

  it('canjea con el reto vigente sin pedir otro', async () => {
    const fetchImpl = vi.fn(async (_url: string, _init?: RequestInit) =>
      respuesta({
        code: 'MATE-AUTO-ABCD',
        servicio: 'automatizacion',
        descuento: 10,
        sesionMinutos: 30,
        expira: '2026-12-01',
      }),
    );

    const outcome = await canjearCodigo(
      stats,
      reto,
      fetchImpl as unknown as typeof fetch,
      () => 1_000_000,
    );

    expect(outcome.ok).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl.mock.calls[0][0]).toBe('/api/promo/redeem');
  });

  it('pide un reto nuevo si no hay ninguno y canjea', async () => {
    const fetchImpl = vi
      .fn<(url: string, init?: RequestInit) => Promise<Response>>()
      .mockResolvedValueOnce(respuesta(reto))
      .mockResolvedValueOnce(
        respuesta({ code: 'MATE-AUTO-ABCD', servicio: 'automatizacion', descuento: 10, sesionMinutos: 30, expira: '2026-12-01' }),
      );

    const outcome = await canjearCodigo(
      stats,
      null,
      fetchImpl as unknown as typeof fetch,
      () => 1_000_000,
    );

    expect(outcome.ok).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(fetchImpl.mock.calls[0][0]).toBe('/api/promo/challenge');
    expect(fetchImpl.mock.calls[1][0]).toBe('/api/promo/redeem');
  });

  it('reintenta con un reto nuevo si el servidor dice que expiró', async () => {
    const fetchImpl = vi
      .fn<(url: string, init?: RequestInit) => Promise<Response>>()
      .mockResolvedValueOnce(respuesta({ mensaje: 'La partida no está firmada o expiró' }, 403))
      .mockResolvedValueOnce(respuesta(reto))
      .mockResolvedValueOnce(
        respuesta({ code: 'MATE-DISE-WXYZ', servicio: 'diseno-web', descuento: 10, sesionMinutos: 30, expira: '2026-12-01' }),
      );

    const outcome = await canjearCodigo(
      stats,
      reto,
      fetchImpl as unknown as typeof fetch,
      () => 1_000_000,
    );

    expect(outcome.ok).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it('devuelve el mensaje del servidor si rechaza la partida', async () => {
    const fetchImpl = vi.fn(async (_url: string, _init?: RequestInit) =>
      respuesta({ mensaje: 'La partida fue demasiado corta' }, 422),
    );

    const outcome = await canjearCodigo(
      stats,
      reto,
      fetchImpl as unknown as typeof fetch,
      () => 1_000_000,
    );

    expect(outcome).toEqual({ ok: false, mensaje: 'La partida fue demasiado corta' });
  });

  it('avisa si no hay conexión con el servidor de códigos', async () => {
    const fetchImpl = vi.fn(async (_url: string, _init?: RequestInit) => {
      throw new Error('offline');
    });

    const outcome = await canjearCodigo(
      stats,
      reto,
      fetchImpl as unknown as typeof fetch,
      () => 1_000_000,
    );

    expect(outcome).toEqual({ ok: false, mensaje: 'Sin conexión con el servidor de códigos.' });
  });
});
