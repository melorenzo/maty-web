export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'maty-theme';

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

export function readStoredTheme(storage?: Pick<Storage, 'getItem'> | null): Theme | null {
  try {
    const stored = storage?.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function persistTheme(theme: Theme, storage?: Pick<Storage, 'setItem'> | null): void {
  try {
    storage?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    return;
  }
}

export function applyTheme(theme: Theme, root?: { dataset: DOMStringMap } | null): void {
  if (!root) return;
  root.dataset.theme = theme;
}

export function resolveInitialTheme(
  stored: Theme | null,
  prefersDark: boolean,
): Theme {
  return stored ?? (prefersDark ? 'dark' : 'light');
}
