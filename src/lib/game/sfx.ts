export type SfxName = 'shot' | 'kill' | 'hit' | 'win' | 'over';

interface ToneSpec {
  desde: number;
  hasta: number;
  duracion: number;
  tipo: OscillatorType;
  volumen: number;
  retardo?: number;
}

const TONOS: Record<SfxName, ToneSpec[]> = {
  shot: [{ desde: 720, hasta: 320, duracion: 0.08, tipo: 'square', volumen: 0.05 }],
  kill: [
    { desde: 300, hasta: 140, duracion: 0.14, tipo: 'square', volumen: 0.06 },
    { desde: 180, hasta: 90, duracion: 0.1, tipo: 'sawtooth', volumen: 0.03, retardo: 0.04 },
  ],
  hit: [{ desde: 220, hasta: 70, duracion: 0.38, tipo: 'sawtooth', volumen: 0.07 }],
  win: [
    { desde: 523, hasta: 523, duracion: 0.11, tipo: 'square', volumen: 0.05 },
    { desde: 659, hasta: 659, duracion: 0.11, tipo: 'square', volumen: 0.05, retardo: 0.12 },
    { desde: 784, hasta: 784, duracion: 0.11, tipo: 'square', volumen: 0.05, retardo: 0.24 },
    { desde: 1047, hasta: 1047, duracion: 0.22, tipo: 'square', volumen: 0.06, retardo: 0.36 },
  ],
  over: [
    { desde: 330, hasta: 330, duracion: 0.16, tipo: 'triangle', volumen: 0.06 },
    { desde: 262, hasta: 262, duracion: 0.16, tipo: 'triangle', volumen: 0.06, retardo: 0.17 },
    { desde: 175, hasta: 140, duracion: 0.4, tipo: 'triangle', volumen: 0.07, retardo: 0.34 },
  ],
};

export interface Sfx {
  activar(): void;
  play(nombre: SfxName): void;
  dispose(): void;
}

type AudioContextCtor = new () => AudioContext;

function obtenerConstructor(): AudioContextCtor | null {
  if (typeof window === 'undefined') return null;
  const ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
  return ctor ?? null;
}

export function createSfx(): Sfx {
  let contexto: AudioContext | null = null;

  const obtenerContexto = (): AudioContext | null => {
    if (contexto) {
      if (contexto.state === 'suspended') void contexto.resume();
      return contexto;
    }
    const Ctor = obtenerConstructor();
    if (!Ctor) return null;
    contexto = new Ctor();
    if (contexto.state === 'suspended') void contexto.resume();
    return contexto;
  };

  const tocar = (ctx: AudioContext, tono: ToneSpec) => {
    const ahora = ctx.currentTime + (tono.retardo ?? 0);
    const oscilador = ctx.createOscillator();
    const ganancia = ctx.createGain();

    oscilador.type = tono.tipo;
    oscilador.frequency.setValueAtTime(tono.desde, ahora);
    oscilador.frequency.exponentialRampToValueAtTime(Math.max(20, tono.hasta), ahora + tono.duracion);

    ganancia.gain.setValueAtTime(0.0001, ahora);
    ganancia.gain.exponentialRampToValueAtTime(tono.volumen, ahora + 0.008);
    ganancia.gain.exponentialRampToValueAtTime(0.0001, ahora + tono.duracion);

    oscilador.connect(ganancia);
    ganancia.connect(ctx.destination);
    oscilador.start(ahora);
    oscilador.stop(ahora + tono.duracion + 0.02);
  };

  return {
    activar() {
      obtenerContexto();
    },
    play(nombre) {
      const ctx = obtenerContexto();
      if (!ctx) return;
      for (const tono of TONOS[nombre]) tocar(ctx, tono);
    },
    dispose() {
      if (!contexto) return;
      void contexto.close();
      contexto = null;
    },
  };
}
