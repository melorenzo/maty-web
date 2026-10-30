import { describe, expect, it } from 'vitest';
import { applyTheme, isTheme, persistTheme, readStoredTheme, resolveInitialTheme } from './theme';

function crearStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    map,
  };
}

describe('isTheme', () => {
  it('acepta light y dark solamente', () => {
    expect(isTheme('light')).toBe(true);
    expect(isTheme('dark')).toBe(true);
    expect(isTheme('auto')).toBe(false);
    expect(isTheme(null)).toBe(false);
  });
});

describe('readStoredTheme', () => {
  it('lee el tema guardado', () => {
    const storage = crearStorage();
    storage.setItem('maty-theme', 'dark');
    expect(readStoredTheme(storage)).toBe('dark');
  });

  it('devuelve null si no hay tema o no es válido', () => {
    const storage = crearStorage();
    expect(readStoredTheme(storage)).toBeNull();
    storage.setItem('maty-theme', 'neon');
    expect(readStoredTheme(storage)).toBeNull();
  });

  it('no rompe si el almacenamiento lanza', () => {
    expect(
      readStoredTheme({
        getItem: () => {
          throw new Error('sin acceso');
        },
      }),
    ).toBeNull();
  });
});

describe('persistTheme', () => {
  it('guarda el tema', () => {
    const storage = crearStorage();
    persistTheme('dark', storage);
    expect(storage.getItem('maty-theme')).toBe('dark');
  });

  it('no rompe si el almacenamiento lanza', () => {
    expect(() =>
      persistTheme('dark', {
        setItem: () => {
          throw new Error('sin acceso');
        },
      }),
    ).not.toThrow();
  });
});

describe('applyTheme', () => {
  it('escribe el atributo en el elemento', () => {
    const root = { dataset: {} as DOMStringMap };
    applyTheme('dark', root);
    expect(root.dataset.theme).toBe('dark');
  });
});

describe('resolveInitialTheme', () => {
  it('respeta el tema guardado', () => {
    expect(resolveInitialTheme('light', true)).toBe('light');
  });

  it('usa la preferencia del sistema si no hay tema guardado', () => {
    expect(resolveInitialTheme(null, true)).toBe('dark');
    expect(resolveInitialTheme(null, false)).toBe('light');
  });
});
