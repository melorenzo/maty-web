import {
  DEFAULT_CONFIG,
  INITIAL_LIVES,
  MAX_BOMBS,
  SCORE_PER_ROW,
  maxScore,
  totalInvaders,
  type GameConfig,
} from './constants';

export type GameStatus = 'idle' | 'playing' | 'paused' | 'won' | 'gameover';

export interface Invader {
  row: number;
  col: number;
  x: number;
  y: number;
  alive: boolean;
}

export interface Bullet {
  x: number;
  y: number;
  alive: boolean;
}

export interface Bomb {
  x: number;
  y: number;
  alive: boolean;
}

export interface Player {
  x: number;
  y: number;
  lives: number;
  cooldown: number;
  invulnerable: number;
}

export type GameEvent =
  | 'shot'
  | 'invaderKilled'
  | 'playerHit'
  | 'waveCleared'
  | 'won'
  | 'gameover';

export interface GameState {
  status: GameStatus;
  score: number;
  wave: number;
  elapsedMs: number;
  shots: number;
  hits: number;
  player: Player;
  invaders: Invader[];
  bullets: Bullet[];
  bombs: Bomb[];
  direction: 1 | -1;
  stepTimer: number;
  frame: number;
  events: GameEvent[];
}

export interface GameStats {
  score: number;
  durationMs: number;
  shots: number;
  hits: number;
  maxScore: number;
  totalInvaders: number;
}

function createInvaders(config: GameConfig): Invader[] {
  const invaders: Invader[] = [];
  for (let row = 0; row < config.rows; row += 1) {
    for (let col = 0; col < config.cols; col += 1) {
      invaders.push({
        row,
        col,
        x: config.startX + col * (config.invaderWidth + config.gapX),
        y: config.startY + row * (config.invaderHeight + config.gapY),
        alive: true,
      });
    }
  }
  return invaders;
}

export function createGame(config: GameConfig = DEFAULT_CONFIG): GameState {
  return {
    status: 'idle',
    score: 0,
    wave: 1,
    elapsedMs: 0,
    shots: 0,
    hits: 0,
    player: {
      x: Math.round((config.canvasWidth - config.playerWidth) / 2),
      y: config.canvasHeight - 34,
      lives: INITIAL_LIVES,
      cooldown: 0,
      invulnerable: 0,
    },
    invaders: createInvaders(config),
    bullets: [],
    bombs: [],
    direction: 1,
    stepTimer: 0,
    frame: 0,
    events: [],
  };
}

export function startGame(state: GameState): void {
  state.status = 'playing';
}

export function togglePause(state: GameState): void {
  if (state.status === 'playing') state.status = 'paused';
  else if (state.status === 'paused') state.status = 'playing';
}

export function movePlayer(state: GameState, delta: number, config: GameConfig): void {
  if (state.status !== 'playing') return;
  const maxX = config.canvasWidth - config.playerWidth;
  state.player.x = Math.min(Math.max(state.player.x + delta * config.playerSpeed, 0), maxX);
}

export function fire(state: GameState, config: GameConfig): void {
  if (state.status !== 'playing') return;
  if (state.player.cooldown > 0) return;
  if (state.bullets.length >= 3) return;

  state.bullets.push({
    x: state.player.x + config.playerWidth / 2,
    y: state.player.y - 4,
    alive: true,
  });
  state.player.cooldown = config.fireCooldownMs;
  state.shots += 1;
  state.events.push('shot');
}

function reverseAndDrop(state: GameState, config: GameConfig): void {
  state.direction = state.direction === 1 ? -1 : 1;
  for (const invader of state.invaders) {
    invader.y += config.invaderHeight / 2;
  }
}

function stepInvaders(state: GameState, config: GameConfig): void {
  const alive = state.invaders.filter((invader) => invader.alive);
  if (alive.length === 0) return;

  let edge = false;
  for (const invader of alive) {
    invader.x += state.direction * config.invaderWidth;
    if (invader.x <= 4 || invader.x + config.invaderWidth >= config.canvasWidth - 4) {
      edge = true;
    }
  }

  if (edge) {
    reverseAndDrop(state, config);
    for (const invader of alive) {
      invader.x += state.direction * config.invaderWidth;
    }
  }
}

function maybeDropBomb(state: GameState, config: GameConfig): void {
  const alive = state.invaders.filter((invader) => invader.alive);
  if (alive.length === 0) return;
  if (state.bombs.length >= MAX_BOMBS) return;
  if (Math.random() > config.bombChance) return;

  const shooter = alive[Math.floor(Math.random() * alive.length)];
  state.bombs.push({ x: shooter.x + config.invaderWidth / 2, y: shooter.y + config.invaderHeight, alive: true });
}

function resolveCollisions(state: GameState, config: GameConfig): void {
  for (const bullet of state.bullets) {
    if (!bullet.alive) continue;
    for (const invader of state.invaders) {
      if (!invader.alive) continue;
      const hit =
        bullet.x >= invader.x &&
        bullet.x <= invader.x + config.invaderWidth &&
        bullet.y <= invader.y + config.invaderHeight &&
        bullet.y >= invader.y;
      if (!hit) continue;

      bullet.alive = false;
      invader.alive = false;
      state.hits += 1;
      state.score += SCORE_PER_ROW[invader.row] ?? 10;
      state.events.push('invaderKilled');
      break;
    }
  }

  for (const bomb of state.bombs) {
    if (!bomb.alive) continue;
    const hit =
      bomb.x >= state.player.x &&
      bomb.x <= state.player.x + config.playerWidth &&
      bomb.y >= state.player.y &&
      bomb.y <= state.player.y + config.playerHeight;
    if (!hit) continue;

    bomb.alive = false;
    if (state.player.invulnerable > 0) continue;

    state.player.lives -= 1;
    state.player.invulnerable = 1200;
    state.events.push('playerHit');

    if (state.player.lives <= 0) {
      state.player.lives = 0;
      state.status = 'gameover';
      state.events.push('gameover');
      return;
    }
  }
}

function checkWave(state: GameState): void {
  const alive = state.invaders.some((invader) => invader.alive);
  if (alive) return;

  state.events.push('waveCleared');
  state.status = 'won';
  state.events.push('won');
}

export function step(state: GameState, deltaMs: number, config: GameConfig = DEFAULT_CONFIG): void {
  if (state.status !== 'playing') return;

  const delta = Math.min(deltaMs, config.maxDeltaMs);
  state.elapsedMs += delta;
  state.frame += 1;
  state.player.cooldown = Math.max(0, state.player.cooldown - delta);
  state.player.invulnerable = Math.max(0, state.player.invulnerable - delta);

  for (const bullet of state.bullets) {
    bullet.y -= config.bulletSpeed * delta;
    if (bullet.y < 0) bullet.alive = false;
  }

  for (const bomb of state.bombs) {
    bomb.y += config.bombSpeed * delta;
    if (bomb.y > config.canvasHeight) bomb.alive = false;
  }

  state.stepTimer += delta;
  if (state.stepTimer >= config.invaderStepMs) {
    state.stepTimer = 0;
    stepInvaders(state, config);
  }

  maybeDropBomb(state, config);
  resolveCollisions(state, config);

  if (state.status === 'playing') {
    checkWave(state);
  }

  state.bullets = state.bullets.filter((bullet) => bullet.alive);
  state.bombs = state.bombs.filter((bomb) => bomb.alive);
}

export function drainEvents(state: GameState): GameEvent[] {
  const events = state.events;
  state.events = [];
  return events;
}

export function collectStats(state: GameState, config: GameConfig = DEFAULT_CONFIG): GameStats {
  return {
    score: state.score,
    durationMs: Math.round(state.elapsedMs),
    shots: state.shots,
    hits: state.hits,
    maxScore: maxScore(config),
    totalInvaders: totalInvaders(config),
  };
}

export function resetGame(state: GameState, config: GameConfig = DEFAULT_CONFIG): void {
  const fresh = createGame(config);
  Object.assign(state, fresh);
}
