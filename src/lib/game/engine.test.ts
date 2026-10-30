import { describe, expect, it } from 'vitest';
import {
  createGame,
  drainEvents,
  fire,
  movePlayer,
  resetGame,
  startGame,
  step,
  togglePause,
  collectStats,
} from './engine';
import { DEFAULT_CONFIG, INITIAL_LIVES, maxScore, totalInvaders } from './constants';

const config = DEFAULT_CONFIG;

describe('createGame', () => {
  it('arma la grilla completa y arranca en idle', () => {
    const state = createGame(config);
    expect(state.status).toBe('idle');
    expect(state.invaders).toHaveLength(totalInvaders(config));
    expect(state.invaders.every((invader) => invader.alive)).toBe(true);
    expect(state.player.lives).toBe(INITIAL_LIVES);
    expect(state.score).toBe(0);
  });
});

describe('movePlayer', () => {
  it('no mueve si la partida no está en curso', () => {
    const state = createGame(config);
    const x = state.player.x;
    movePlayer(state, 100, config);
    expect(state.player.x).toBe(x);
  });

  it('mueve dentro de los límites', () => {
    const state = createGame(config);
    startGame(state);
    movePlayer(state, -10_000, config);
    expect(state.player.x).toBe(0);
    movePlayer(state, 10_000, config);
    expect(state.player.x).toBe(config.canvasWidth - config.playerWidth);
  });
});

describe('fire', () => {
  it('dispara una bala y cuenta el disparo', () => {
    const state = createGame(config);
    startGame(state);
    fire(state, config);
    expect(state.bullets).toHaveLength(1);
    expect(state.shots).toBe(1);
  });

  it('respeta el cooldown', () => {
    const state = createGame(config);
    startGame(state);
    fire(state, config);
    fire(state, config);
    expect(state.shots).toBe(1);
  });

  it('deja disparar de nuevo pasado el cooldown', () => {
    const state = createGame(config);
    startGame(state);
    fire(state, config);
    for (let i = 0; i < 10; i += 1) step(state, config.maxDeltaMs, config);
    fire(state, config);
    expect(state.shots).toBe(2);
  });
});

describe('step', () => {
  it('no avanza si la partida está pausada', () => {
    const state = createGame(config);
    startGame(state);
    togglePause(state);
    const elapsed = state.elapsedMs;
    step(state, 100, config);
    expect(state.elapsedMs).toBe(elapsed);
  });

  it('mueve las balas hacia arriba', () => {
    const state = createGame(config);
    startGame(state);
    fire(state, config);
    const y = state.bullets[0].y;
    step(state, 16, config);
    expect(state.bullets[0].y).toBeLessThan(y);
  });

  it('acorta el delta máximo para no saltar el juego', () => {
    const state = createGame(config);
    startGame(state);
    step(state, 100_000, config);
    expect(state.elapsedMs).toBe(config.maxDeltaMs);
  });
});

describe('colisiones', () => {
  it('una bala sobre un invasor lo mata y suma puntos', () => {
    const state = createGame(config);
    startGame(state);
    const target = state.invaders[0];
    state.bullets.push({ x: target.x + 5, y: target.y + config.invaderHeight - 2, alive: true });

    step(state, 16, config);

    expect(target.alive).toBe(false);
    expect(state.score).toBe(30);
    expect(state.hits).toBe(1);
    expect(drainEvents(state)).toContain('invaderKilled');
  });

  it('las filas valen puntos distintos', () => {
    const state = createGame(config);
    startGame(state);
    const rowTwo = state.invaders.find((invader) => invader.row === 2)!;
    state.bullets.push({ x: rowTwo.x + 5, y: rowTwo.y + config.invaderHeight - 2, alive: true });

    step(state, 16, config);

    expect(state.score).toBe(10);
  });
});

describe('rondas y puntos', () => {
  it('limpiar la grilla gana y da el máximo de puntos', () => {
    const state = createGame(config);
    startGame(state);
    for (const invader of state.invaders) invader.alive = false;

    step(state, 16, config);

    expect(state.status).toBe('won');
    expect(drainEvents(state)).toContain('won');
  });

  it('el máximo de puntos coincide con la suma de la grilla', () => {
    expect(maxScore(config)).toBe(420);
  });
});

describe('vidas', () => {
  it('una bomba quita una vida', () => {
    const state = createGame(config);
    startGame(state);
    state.bombs.push({ x: state.player.x + 5, y: state.player.y + 2, alive: true });

    step(state, 16, config);

    expect(state.player.lives).toBe(INITIAL_LIVES - 1);
    expect(drainEvents(state)).toContain('playerHit');
  });

  it('sin vidas la partida termina', () => {
    const state = createGame(config);
    startGame(state);
    state.player.lives = 1;
    state.bombs.push({ x: state.player.x + 5, y: state.player.y + 2, alive: true });

    step(state, 16, config);

    expect(state.status).toBe('gameover');
    expect(drainEvents(state)).toContain('gameover');
  });
});

describe('resetGame', () => {
  it('deja el estado como al principio', () => {
    const state = createGame(config);
    startGame(state);
    state.score = 100;
    state.player.lives = 1;

    resetGame(state, config);

    expect(state.score).toBe(0);
    expect(state.player.lives).toBe(INITIAL_LIVES);
    expect(state.status).toBe('idle');
  });
});

describe('collectStats', () => {
  it('devuelve las métricas que se envían al servidor', () => {
    const state = createGame(config);
    startGame(state);
    fire(state, config);
    step(state, 500, config);

    const stats = collectStats(state, config);
    expect(stats.shots).toBe(1);
    expect(stats.maxScore).toBe(420);
    expect(stats.totalInvaders).toBe(24);
    expect(stats.durationMs).toBeGreaterThan(0);
  });
});
