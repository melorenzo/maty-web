import { useCallback, useEffect, useRef, useState } from 'react';
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
  type GameState,
} from '../../../lib/game/engine';
import { DEFAULT_CONFIG } from '../../../lib/game/constants';
import { BUG_SPRITES, PLAYER_SPRITE } from '../../../lib/game/sprites';

interface PromoResult {
  code: string;
  servicio: string;
  descuento: number;
  sesionMinutos: number;
  expira: string;
}

type PromoState =
  | { estado: 'inactivo' }
  | { estado: 'cargando' }
  | { estado: 'listo'; token: string; seed: string; issuedAt: number }
  | { estado: 'canjeando' }
  | { estado: 'ganado'; promo: PromoResult }
  | { estado: 'error'; mensaje: string };

const SCALE = 2;

function drawSprite(
  context: CanvasRenderingContext2D,
  rows: string[],
  x: number,
  y: number,
  scale: number,
  color: string,
) {
  context.fillStyle = color;
  rows.forEach((row, rowIndex) => {
    [...row].forEach((pixel, columnIndex) => {
      if (pixel !== '#') return;
      context.fillRect(
        x + columnIndex * scale,
        y + rowIndex * scale,
        scale,
        scale,
      );
    });
  });
}

function render(
  context: CanvasRenderingContext2D,
  state: GameState,
  width: number,
  height: number,
) {
  context.clearRect(0, 0, width, height);
  context.fillStyle = '#050c15';
  context.fillRect(0, 0, width, height);

  context.fillStyle = 'rgba(255,255,255,0.04)';
  for (let y = 0; y < height; y += 16) {
    for (let x = 0; x < width; x += 16) {
      context.fillRect(x, y, 1, 1);
    }
  }

  const frame = Math.floor(state.frame / 18) % 2;

  for (const invader of state.invaders) {
    if (!invader.alive) continue;
    const sprite = BUG_SPRITES[invader.row % BUG_SPRITES.length];
    const rows = sprite.frames[frame % sprite.frames.length];
    drawSprite(context, rows, invader.x, invader.y, SCALE, '#2fd9a8');
  }

  context.fillStyle = '#ffd84d';
  for (const bullet of state.bullets) {
    context.fillRect(Math.round(bullet.x) - 1, Math.round(bullet.y), 2, 6);
  }

  context.fillStyle = '#ff7a4d';
  for (const bomb of state.bombs) {
    context.fillRect(Math.round(bomb.x) - 1, Math.round(bomb.y), 2, 5);
  }

  if (state.player.invulnerable === 0 || Math.floor(state.frame / 6) % 2 === 0) {
    drawSprite(context, PLAYER_SPRITE, state.player.x, state.player.y, 2, '#4d93ff');
  }
}

export default function ArcadeGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<GameState>(createGame(DEFAULT_CONFIG));
  const keysRef = useRef<Record<string, boolean>>({});
  const [hud, setHud] = useState({ score: 0, lives: 3, status: 'idle' as GameState['status'] });
  const [promo, setPromo] = useState<PromoState>({ estado: 'inactivo' });
  const [mensaje, setMensaje] = useState<string | null>(null);

  const pedirChallenge = useCallback(async () => {
    setPromo({ estado: 'cargando' });
    try {
      const response = await fetch('/api/promo/challenge', { method: 'POST' });
      if (!response.ok) throw new Error('challenge');
      const data = (await response.json()) as { token: string; seed: string; issuedAt: number };
      setPromo({ estado: 'listo', token: data.token, seed: data.seed, issuedAt: data.issuedAt });
    } catch {
      setPromo({
        estado: 'error',
        mensaje: 'El servicio de códigos está fuera de línea, pero podés jugar igual.',
      });
    }
  }, []);

  const canjear = useCallback(async () => {
    const state = stateRef.current;
    if (promo.estado !== 'listo') return;

    setPromo({ estado: 'canjeando' });
    const stats = collectStats(state, DEFAULT_CONFIG);

    try {
      const response = await fetch('/api/promo/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: promo.token,
          seed: promo.seed,
          issuedAt: promo.issuedAt,
          score: stats.score,
          durationMs: stats.durationMs,
          shots: stats.shots,
          hits: stats.hits,
        }),
      });

      const data = (await response.json()) as PromoResult & { mensaje?: string };

      if (!response.ok) {
        setPromo({ estado: 'error', mensaje: data.mensaje ?? 'No pudimos emitir el código.' });
        return;
      }

      setPromo({ estado: 'ganado', promo: data });
    } catch {
      setPromo({ estado: 'error', mensaje: 'Sin conexión con el servidor de códigos.' });
    }
  }, [promo]);

  const reiniciar = useCallback(() => {
    resetGame(stateRef.current, DEFAULT_CONFIG);
    setHud({ score: 0, lives: 3, status: 'idle' });
    setPromo({ estado: 'inactivo' });
    setMensaje(null);
    void pedirChallenge();
  }, [pedirChallenge]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let animation = 0;
    let previous = performance.now();

    const loop = (now: number) => {
      const delta = now - previous;
      previous = now;

      const state = stateRef.current;
      const keys = keysRef.current;

      if (state.status === 'playing') {
        if (keys['ArrowLeft']) movePlayer(state, -6, DEFAULT_CONFIG);
        if (keys['ArrowRight']) movePlayer(state, 6, DEFAULT_CONFIG);
        step(state, delta, DEFAULT_CONFIG);
      }

      const events = drainEvents(state);
      if (events.includes('won')) {
        void canjear();
        setMensaje('¡Oleada limpia! Generando tu código…');
      }
      if (events.includes('gameover')) {
        setMensaje('Fin de la partida. Los bugs se llevaron el sistema.');
      }
      if (events.includes('playerHit')) {
        setMensaje('Te froze un bug. Quedan vidas.');
      }

      render(context, state, canvas.width, canvas.height);

      setHud((current) =>
        current.score === state.score &&
        current.lives === state.player.lives &&
        current.status === state.status
          ? current
          : { score: state.score, lives: state.player.lives, status: state.status },
      );

      animation = requestAnimationFrame(loop);
    };

    animation = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animation);
  }, [canjear]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const state = stateRef.current;

      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        keysRef.current[event.key] = true;
        return;
      }

      if (event.key === ' ' || event.key === 'Spacebar') {
        event.preventDefault();
        if (state.status === 'idle') startGame(state);
        fire(state, DEFAULT_CONFIG);
        return;
      }

      if (event.key === 'p' || event.key === 'P') {
        togglePause(state);
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        keysRef.current[event.key] = false;
      }
    };

    const onBlur = () => {
      keysRef.current = {};
      togglePause(stateRef.current);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  const mover = (delta: number) => movePlayer(stateRef.current, delta * 8, DEFAULT_CONFIG);
  const disparar = () => {
    const state = stateRef.current;
    if (state.status === 'idle') startGame(state);
    fire(state, DEFAULT_CONFIG);
  };

  return (
    <div className="terminal-surface p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-slate-400">
        <span>
          score <span className="text-amber-300">{hud.score}</span>
        </span>
        <span>
          vidas{' '}
          <span className="text-emerald-400">
            {'♥'.repeat(hud.lives)}
            {'·'.repeat(Math.max(0, 3 - hud.lives))}
          </span>
        </span>
        <span>
          estado{' '}
          <span className="text-cyan-300">
            {hud.status === 'idle'
              ? 'listo'
              : hud.status === 'playing'
                ? 'jugando'
                : hud.status === 'paused'
                  ? 'pausa'
                  : hud.status === 'won'
                    ? 'victoria'
                    : 'game over'}
          </span>
        </span>
      </div>

      <canvas
        ref={canvasRef}
        width={DEFAULT_CONFIG.canvasWidth * SCALE}
        height={DEFAULT_CONFIG.canvasHeight * SCALE}
        role="img"
        aria-label="Juego de invasores. Usá las flechas izquierda y derecha para moverte y espacio para disparar."
        className="mx-auto block w-full max-w-[320px] touch-none rounded border border-slate-800"
      />

      <p className="mt-3 text-center font-mono text-xs text-slate-400" aria-live="polite">
        {mensaje ?? '← → para moverte · ESPACIO para disparar · P para pausar'}
      </p>

      <div className="mt-3 flex justify-center gap-2 sm:hidden">
        <button
          type="button"
          onClick={() => mover(-1)}
          aria-label="Mover a la izquierda"
          className="rounded border border-slate-700 px-4 py-2 font-mono text-sm text-slate-200"
        >
          ←
        </button>
        <button
          type="button"
          onClick={disparar}
          aria-label="Disparar"
          className="rounded border border-slate-700 px-4 py-2 font-mono text-sm text-slate-200"
        >
          disparar
        </button>
        <button
          type="button"
          onClick={() => mover(1)}
          aria-label="Mover a la derecha"
          className="rounded border border-slate-700 px-4 py-2 font-mono text-sm text-slate-200"
        >
          →
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-3">
        <button
          type="button"
          onClick={() => {
            const state = stateRef.current;
            if (state.status === 'idle') startGame(state);
            else if (state.status === 'won' || state.status === 'gameover') reiniciar();
            else togglePause(state);
          }}
          className="rounded bg-amber-300 px-3 py-1.5 font-mono text-xs font-bold text-slate-900"
        >
          {hud.status === 'won' || hud.status === 'gameover'
            ? 'otra partida'
            : hud.status === 'paused'
              ? 'seguir'
              : hud.status === 'playing'
                ? 'pausa'
                : 'empezar'}
        </button>

        <button
          type="button"
          onClick={reiniciar}
          className="font-mono text-xs text-slate-400 underline hover:text-amber-300"
        >
          reiniciar
        </button>
      </div>

      {promo.estado === 'ganado' && (
        <div className="mt-4 rounded border border-emerald-500/40 bg-emerald-500/10 p-4">
          <p className="font-mono text-xs text-emerald-300">código obtenido</p>
          <p className="mt-1 font-mono text-xl font-bold tracking-widest text-slate-100">
            {promo.promo.code}
          </p>
          <p className="mt-2 text-xs text-slate-300">
            {promo.promo.descuento}% de descuento en tu primer proyecto +{' '}
            {promo.promo.sesionMinutos} min de sesión inicial sin cargo. Vence el{' '}
            {new Date(promo.promo.expira).toLocaleDateString('es-AR')}.
          </p>
          <a
            href={`/contacto?codigo=${promo.promo.code}`}
            className="mt-3 inline-block rounded bg-emerald-400 px-3 py-1.5 font-mono text-xs font-bold text-slate-900"
          >
            usarlo en el formulario
          </a>
        </div>
      )}

      {promo.estado === 'error' && (
        <p className="mt-4 rounded border border-rose-500/40 bg-rose-500/10 p-3 font-mono text-xs text-rose-200">
          {promo.mensaje}
        </p>
      )}
    </div>
  );
}
