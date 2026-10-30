export interface GameConfig {
  cols: number;
  rows: number;
  canvasWidth: number;
  canvasHeight: number;
  invaderWidth: number;
  invaderHeight: number;
  gapX: number;
  gapY: number;
  startX: number;
  startY: number;
  playerWidth: number;
  playerHeight: number;
  playerSpeed: number;
  bulletSpeed: number;
  bombSpeed: number;
  fireCooldownMs: number;
  invaderStepMs: number;
  bombChance: number;
  maxDeltaMs: number;
}

export const DEFAULT_CONFIG: GameConfig = {
  cols: 6,
  rows: 4,
  canvasWidth: 320,
  canvasHeight: 360,
  invaderWidth: 28,
  invaderHeight: 20,
  gapX: 10,
  gapY: 12,
  startX: 26,
  startY: 48,
  playerWidth: 30,
  playerHeight: 12,
  playerSpeed: 0.22,
  bulletSpeed: 0.42,
  bombSpeed: 0.18,
  fireCooldownMs: 320,
  invaderStepMs: 620,
  bombChance: 0.22,
  maxDeltaMs: 48,
};

export const ROW_POINTS = [30, 20, 10, 10] as const;

export const INITIAL_LIVES = 3;

export const MAX_BOMBS = 3;

export const SCORE_PER_ROW: Record<number, number> = {
  0: ROW_POINTS[0],
  1: ROW_POINTS[1],
  2: ROW_POINTS[2],
  3: ROW_POINTS[3],
};

export function totalInvaders(config: GameConfig): number {
  return config.cols * config.rows;
}

export function maxScore(config: GameConfig): number {
  let total = 0;
  for (let row = 0; row < config.rows; row += 1) {
    total += config.cols * (SCORE_PER_ROW[row] ?? 10);
  }
  return total;
}
