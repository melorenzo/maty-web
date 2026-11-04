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
import { createSfx, type Sfx } from '../../../lib/game/sfx';
import {
  canjearCodigo,
  pedirChallenge,
  type Challenge,
  type PromoResult,
} from '../../../lib/promo-client';

type PromoState =
  | { estado: 'inactivo' }
  | { estado: 'cargando' }
  | { estado: 'listo'; token: string; seed: string; issuedAt: number }
  | { estado: 'canjeando' }
  | { estado: 'ganado'; promo: PromoResult }
  | { estado: 'error'; mensaje: string };

const SCALE = 2;
const THEME_AUDIO = '/audio/arcade-theme.mp3';

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
  const challengeRef = useRef<Challenge | null>(null);
  const audioRef = useRef<{ theme: HTMLAudioElement | null }>({
    theme: null,
  });
  const sonidoRef = useRef(false);
  const sfxRef = useRef<Sfx | null>(null);
  const [hud, setHud] = useState({ score: 0, lives: 3, status: 'idle' as GameState['status'] });
  const [promo, setPromo] = useState<PromoState>({ estado: 'inactivo' });
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [sonido, setSonido] = useState(true);
  const [cinema, setCinema] = useState(false);

  const pedirReto = useCallback(async (): Promise<Challenge | null> => {
    setPromo({ estado: 'cargando' });
    const data = await pedirChallenge();
    if (!data) {
      challengeRef.current = null;
      setPromo({
        estado: 'error',
        mensaje: 'El servicio de códigos está fuera de línea, pero podés jugar igual.',
      });
      return null;
    }
    challengeRef.current = data;
    setPromo({ estado: 'listo', ...data });
    return data;
  }, []);

  const canjear = useCallback(async () => {
    const state = stateRef.current;
    setPromo({ estado: 'canjeando' });
    const stats = collectStats(state, DEFAULT_CONFIG);

    const outcome = await canjearCodigo(stats, challengeRef.current);

    if (!outcome.ok) {
      setPromo({ estado: 'error', mensaje: outcome.mensaje });
      setMensaje(outcome.mensaje);
      return;
    }

    setPromo({ estado: 'ganado', promo: outcome.promo });
    setMensaje('¡Oleada limpia! Tu código está listo.');
  }, []);

  const reiniciar = useCallback(() => {
    resetGame(stateRef.current, DEFAULT_CONFIG);
    setHud({ score: 0, lives: 3, status: 'idle' });
    setPromo({ estado: 'inactivo' });
    setMensaje(null);
    void pedirReto();
  }, [pedirReto]);

  const despertarAudio = useCallback(() => {
    if (!sonidoRef.current) return;
    sfxRef.current?.activar();
    const { theme } = audioRef.current;
    if (theme) void theme.play().catch(() => undefined);
  }, []);

  useEffect(() => {
    const theme = new Audio(THEME_AUDIO);
    theme.loop = true;
    theme.preload = 'auto';
    audioRef.current = { theme };
    sfxRef.current = createSfx();
    return () => {
      theme.pause();
      sfxRef.current?.dispose();
      sfxRef.current = null;
      audioRef.current = { theme: null };
    };
  }, []);

  useEffect(() => {
    if (!cinema) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setCinema(false);
    };
    window.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [cinema]);

  useEffect(() => {
    sonidoRef.current = sonido;
    const { theme } = audioRef.current;
    if (!theme) return;
    if (sonido && hud.status === 'playing') {
      void theme.play().catch(() => undefined);
    } else {
      theme.pause();
    }
  }, [sonido, hud.status]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let animation = 0;
    let previous = performance.now();
    let arrancada = false;

    const loop = (now: number) => {
      const delta = now - previous;
      previous = now;

      const state = stateRef.current;
      const keys = keysRef.current;

      if (state.status === 'playing') {
        if (!arrancada) {
          arrancada = true;
          void pedirReto();
        }
        if (keys['ArrowLeft']) movePlayer(state, -6, DEFAULT_CONFIG);
        if (keys['ArrowRight']) movePlayer(state, 6, DEFAULT_CONFIG);
        step(state, delta, DEFAULT_CONFIG);
      } else {
        arrancada = false;
      }

      const events = drainEvents(state);
      const sfx = sfxRef.current;
      if (sonidoRef.current && sfx) {
        if (events.includes('shot')) sfx.play('shot');
        if (events.includes('invaderKilled')) sfx.play('kill');
        if (events.includes('playerHit')) sfx.play('hit');
      }
      if (events.includes('won')) {
        const { theme } = audioRef.current;
        theme?.pause();
        if (sonidoRef.current && sfx) sfx.play('win');
        void canjear();
        setMensaje('¡Oleada limpia! Generando tu código…');
      }
      if (events.includes('gameover')) {
        audioRef.current.theme?.pause();
        if (sonidoRef.current && sfx) sfx.play('over');
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
  }, [canjear, pedirReto]);

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
        despertarAudio();
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
  }, [despertarAudio]);

  const mover = (delta: number) => movePlayer(stateRef.current, delta * 8, DEFAULT_CONFIG);
  const disparar = () => {
    const state = stateRef.current;
    if (state.status === 'idle') startGame(state);
    despertarAudio();
    fire(state, DEFAULT_CONFIG);
  };

  return (
    <div
      className={
        cinema
          ? 'fixed inset-0 z-50 flex flex-col items-center justify-center gap-2 overflow-y-auto bg-slate-950/95 p-4 backdrop-blur'
          : 'terminal-surface p-3 sm:p-4'
      }
    >
      <div
        className={
          cinema
            ? 'mb-1 flex w-full max-w-4xl flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-slate-400'
            : 'mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-slate-400'
        }
      >
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
        <button
          type="button"
          onClick={() => {
            setSonido((value) => {
              if (!value) sfxRef.current?.activar();
              return !value;
            });
          }}
          aria-pressed={sonido}
          className="rounded border border-slate-700 px-2 py-0.5 font-mono text-xs text-slate-300 hover:border-amber-300 hover:text-amber-300"
        >
          sonido {sonido ? 'on' : 'off'}
        </button>
        <button
          type="button"
          onClick={() => setCinema((value) => !value)}
          aria-pressed={cinema}
          className="rounded border border-slate-700 px-2 py-0.5 font-mono text-xs text-slate-300 hover:border-amber-300 hover:text-amber-300"
        >
          {cinema ? 'salir del cine' : 'modo cine'}
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={DEFAULT_CONFIG.canvasWidth * SCALE}
        height={DEFAULT_CONFIG.canvasHeight * SCALE}
        role="img"
        aria-label="Juego de invasores. Usá las flechas izquierda y derecha para moverte y espacio para disparar."
        style={{ imageRendering: 'pixelated' }}
        className={
          cinema
            ? 'block h-[76vh] w-auto max-w-[94vw] touch-none rounded border border-slate-800 object-contain'
            : 'mx-auto block h-auto w-full max-w-[320px] touch-none rounded border border-slate-800'
        }
      />

      <p className="text-center font-mono text-xs text-slate-400" aria-live="polite">
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
            if (state.status === 'idle') {
              startGame(state);
              despertarAudio();
            } else if (state.status === 'won' || state.status === 'gameover') reiniciar();
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
