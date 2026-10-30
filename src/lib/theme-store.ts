import { applyTheme, persistTheme, type Theme } from './theme';

const listeners = new Set<() => void>();

function readDomTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getThemeSnapshot(): Theme {
  return readDomTheme();
}

export function getThemeServerSnapshot(): Theme {
  return 'light';
}

export function setTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  applyTheme(theme, document.documentElement);
  persistTheme(theme, window.localStorage);
  listeners.forEach((listener) => listener());
}
