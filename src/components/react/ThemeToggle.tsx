import { useCallback, useSyncExternalStore } from 'react';
import {
  getThemeServerSnapshot,
  getThemeSnapshot,
  setTheme,
  subscribeTheme,
} from '../../lib/theme-store';

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);

  const toggle = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme]);

  const label =
    theme === 'dark'
      ? 'Tema oscuro activo. Cambiar a tema claro'
      : 'Tema claro activo. Cambiar a tema oscuro';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="flex size-9 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition-colors hover:bg-surface-2 hover:text-accent"
    >
      <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
        {theme === 'dark' ? (
          <path d="M12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-13a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1Zm0 14a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Zm7-6a1 1 0 0 1-1 1h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1ZM6 12a1 1 0 0 1-1 1H4a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1Zm10.66-5.66a1 1 0 0 1 0 1.41l-.7.71a1 1 0 1 1-1.42-1.42l.71-.7a1 1 0 0 1 1.41 0ZM6.46 17.54a1 1 0 0 1 0 1.42l-.71.7a1 1 0 1 1-1.41-1.41l.7-.71a1 1 0 0 1 1.42 0Zm11.2 1.41a1 1 0 0 1-1.41 0l-.71-.7a1 1 0 1 1 1.42-1.42l.7.71a1 1 0 0 1 0 1.41ZM8.46 6.46a1 1 0 0 1-1.41-1.41l.71-.71a1 1 0 1 1 1.41 1.42l-.7.7a1 1 0 0 1-1.41 0Z" />
        ) : (
          <path d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm0-14a1 1 0 0 1 1 1 1 1 0 0 1-2 0 1 1 0 0 1 1-1Zm0 16a1 1 0 0 1 1 1 1 1 0 0 1-2 0 1 1 0 0 1 1-1Zm9-7a1 1 0 0 1-1 1 1 1 0 0 1 0-2h1a1 1 0 0 1 1 1ZM3 12a1 1 0 0 1-1 1 1 1 0 0 1 0-2h1a1 1 0 0 1 1 1Zm12.66-5.66a1 1 0 0 1 0 1.42l-1.42 1.41a1 1 0 1 1-1.42-1.42l.71-.7a1 1 0 0 1 1.42 0ZM5.76 18.24a1 1 0 0 1 0 1.42l-1.42 1.41a1 1 0 1 1-1.41-1.42l.7-.71a1 1 0 0 1 1.42 0Zm12.48 0a1 1 0 0 1-1.42 1.42 1 1 0 0 1 0-1.42l.7-.71a1 1 0 0 1 1.42 0ZM5.76 5.76a1 1 0 0 1 1.42 1.42l-.71.71a1 1 0 1 1-1.42-1.42l.71-.7a1 1 0 0 1 1.42 0Z" />
        )}
      </svg>
    </button>
  );
}
