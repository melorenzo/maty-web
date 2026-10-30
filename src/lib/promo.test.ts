import { describe, expect, it } from 'vitest';
import {
  CHALLENGE_TTL_MS,
  MAX_WIN_DURATION_MS,
  MIN_WIN_DURATION_MS,
  dayKey,
  emailKey,
  generateCode,
  globalKey,
  ipKey,
  isPlausibleWin,
  pickService,
  promoConfigFromEnv,
  promoKey,
  signChallenge,
  verifyChallenge,
} from './promo';

const SECRET = 'secreto-de-prueba';
const MAX_SCORE = 420;
const TOTAL_INVADERS = 24;

const WIN = {
  score: MAX_SCORE,
  hits: TOTAL_INVADERS,
  shots: 40,
  durationMs: 90_000,
};

describe('promoConfigFromEnv', () => {
  it('usa valores por defecto cuando no hay variables', () => {
    expect(promoConfigFromEnv({})).toEqual({
      secret: '',
      discount: 10,
      sessionMinutes: 30,
      ttlDays: 30,
      dailyCap: 50,
    });
  });

  it('lee las variables del entorno', () => {
    expect(
      promoConfigFromEnv({
        PROMO_SECRET: 'abc',
        PROMO_DISCOUNT: '15',
        PROMO_SESSION_MINUTES: '45',
        PROMO_TTL_DAYS: '10',
        PROMO_DAILY_CAP: '20',
      }),
    ).toEqual({
      secret: 'abc',
      discount: 15,
      sessionMinutes: 45,
      ttlDays: 10,
      dailyCap: 20,
    });
  });
});

describe('challenge', () => {
  it('firma y verifica un reto válido', async () => {
    const issuedAt = Date.now();
    const token = await signChallenge(SECRET, 'seed-1', issuedAt);

    await expect(verifyChallenge(SECRET, token, 'seed-1', issuedAt)).resolves.toBe(true);
  });

  it('rechaza un reto firmado con otro secreto', async () => {
    const issuedAt = Date.now();
    const token = await signChallenge('otro-secreto', 'seed-1', issuedAt);

    await expect(verifyChallenge(SECRET, token, 'seed-1', issuedAt)).resolves.toBe(false);
  });

  it('rechaza un reto con otra semilla', async () => {
    const issuedAt = Date.now();
    const token = await signChallenge(SECRET, 'seed-1', issuedAt);

    await expect(verifyChallenge(SECRET, token, 'seed-2', issuedAt)).resolves.toBe(false);
  });

  it('rechaza un reto alterado', async () => {
    const issuedAt = Date.now();
    const token = await signChallenge(SECRET, 'seed-1', issuedAt);
    const alterado = `${token.slice(0, -1)}${token.endsWith('a') ? 'b' : 'a'}`;

    await expect(verifyChallenge(SECRET, alterado, 'seed-1', issuedAt)).resolves.toBe(false);
  });

  it('rechaza un reto vencido', async () => {
    const issuedAt = Date.now() - CHALLENGE_TTL_MS - 1_000;
    const token = await signChallenge(SECRET, 'seed-1', issuedAt);

    await expect(verifyChallenge(SECRET, token, 'seed-1', issuedAt)).resolves.toBe(false);
  });

  it('rechaza un reto emitido en el futuro', async () => {
    const issuedAt = Date.now() + 120_000;
    const token = await signChallenge(SECRET, 'seed-1', issuedAt);

    await expect(verifyChallenge(SECRET, token, 'seed-1', issuedAt)).resolves.toBe(false);
  });

  it('rechaza entradas vacías', async () => {
    await expect(verifyChallenge('', '', '', Date.now())).resolves.toBe(false);
    await expect(verifyChallenge(SECRET, '', 'seed', Date.now())).resolves.toBe(false);
  });
});

describe('isPlausibleWin', () => {
  it('acepta una partida completa', () => {
    expect(isPlausibleWin(WIN, MAX_SCORE, TOTAL_INVADERS).ok).toBe(true);
  });

  it('rechaza un puntaje que no es el de una oleada completa', () => {
    const result = isPlausibleWin({ ...WIN, score: 400 }, MAX_SCORE, TOTAL_INVADERS);

    expect(result.ok).toBe(false);
    expect(result.motivo).toMatch(/puntaje/i);
  });

  it('rechaza invasores sin destruir', () => {
    const result = isPlausibleWin({ ...WIN, hits: 23 }, MAX_SCORE, TOTAL_INVADERS);

    expect(result.ok).toBe(false);
    expect(result.motivo).toMatch(/invasores/i);
  });

  it('rechaza una cantidad de disparos inverosímil', () => {
    expect(isPlausibleWin({ ...WIN, shots: 10 }, MAX_SCORE, TOTAL_INVADERS).ok).toBe(false);
    expect(isPlausibleWin({ ...WIN, shots: 10_000 }, MAX_SCORE, TOTAL_INVADERS).ok).toBe(false);
  });

  it('rechaza una partida demasiado corta', () => {
    const result = isPlausibleWin(
      { ...WIN, durationMs: MIN_WIN_DURATION_MS - 1 },
      MAX_SCORE,
      TOTAL_INVADERS,
    );

    expect(result.ok).toBe(false);
    expect(result.motivo).toMatch(/corta/i);
  });

  it('rechaza una partida demasiado larga', () => {
    const result = isPlausibleWin(
      { ...WIN, durationMs: MAX_WIN_DURATION_MS + 1 },
      MAX_SCORE,
      TOTAL_INVADERS,
    );

    expect(result.ok).toBe(false);
    expect(result.motivo).toMatch(/demasiado/i);
  });
});

describe('pickService', () => {
  it('elige entre los tres servicios según el número aleatorio', () => {
    expect(pickService(() => 0)).toBe('asesoria');
    expect(pickService(() => 0.5)).toBe('diseno-web');
    expect(pickService(() => 0.99)).toBe('automatizacion');
  });
});

describe('generateCode', () => {
  it('usa el prefijo del servicio', () => {
    expect(generateCode('asesoria', () => 0)).toMatch(/^MATE-ASES-[A-Z2-9]{4}$/);
    expect(generateCode('diseno-web', () => 0)).toMatch(/^MATE-DISE-[A-Z2-9]{4}$/);
    expect(generateCode('automatizacion', () => 0)).toMatch(/^MATE-AUTO-[A-Z2-9]{4}$/);
  });

  it('nunca usa letras ambiguas', () => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    for (let index = 0; index < 200; index += 1) {
      const suffix = generateCode('asesoria').split('-')[2] ?? '';
      for (const char of suffix) {
        expect(alphabet).toContain(char);
      }
    }
  });
});

describe('claves de almacenamiento', () => {
  it('dayKey devuelve el día en UTC', () => {
    expect(dayKey(Date.UTC(2026, 0, 2, 23, 59))).toBe('2026-01-02');
  });

  it('arma las claves con los prefijos esperados', () => {
    expect(promoKey('MATE-ASES-ABCD')).toBe('promo:code:MATE-ASES-ABCD');
    expect(ipKey('1.2.3.4', '2026-01-02')).toBe('promo:ip:1.2.3.4:2026-01-02');
    expect(globalKey('2026-01-02')).toBe('promo:global:2026-01-02');
  });
});

describe('emailKey', () => {
  it('normaliza el email', async () => {
    const a = await emailKey('  Persona@Ejemplo.COM ');
    const b = await emailKey('persona@ejemplo.com');

    expect(a).toBe(b);
  });

  it('no guarda el email en claro', async () => {
    const key = await emailKey('persona@example.com');

    expect(key).toMatch(/^promo:email:[a-f0-9]{64}$/);
    expect(key).not.toContain('persona');
  });

  it('distingue emails distintos', async () => {
    expect(await emailKey('a@example.com')).not.toBe(await emailKey('b@example.com'));
  });
});
