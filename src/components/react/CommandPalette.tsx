import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { commands, filterCommands, groupLabels, isMac, type Command } from '../../lib/commands';
import { setTheme } from '../../lib/theme-store';

const MOD_KEY = isMac() ? '⌘' : 'Ctrl';

const EMAIL = 'melorenzo@fullware.com.ar';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => filterCommands(query), [query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActiveIndex(0);
  }, []);

  const run = useCallback(
    (command: Command) => {
      close();

      if (command.action === 'theme-light' || command.action === 'theme-dark') {
        setTheme(command.action === 'theme-dark' ? 'dark' : 'light');
        return;
      }
      if (command.action === 'copy-email') {
        void navigator.clipboard?.writeText(EMAIL);
        return;
      }
      if (command.action === 'open-arcade') {
        window.location.href = '/arcade';
        return;
      }
      if (!command.href) return;

      if (command.external) {
        window.open(command.href, '_blank', 'noopener,noreferrer');
        return;
      }
      window.location.href = command.href;
    },
    [close],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isShortcut =
        (event.key === 'k' || event.key === 'K') && (event.metaKey || event.ctrlKey);

      if (isShortcut) {
        event.preventDefault();
        setOpen((value) => !value);
        setActiveIndex(0);
        return;
      }

      if (event.key === 'Escape' && open) {
        event.preventDefault();
        close();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, close]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const item = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    item?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % Math.max(results.length, 1));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + results.length) % Math.max(results.length, 1));
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const command = results[activeIndex];
      if (command) run(command);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[12vh]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Paleta de comandos"
        className="w-full max-w-xl overflow-hidden rounded-lg border border-border bg-surface shadow-window"
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="font-mono text-sm text-accent" aria-hidden="true">
            $
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onInputKeyDown}
            placeholder="Escribí un comando…"
            aria-label="Buscar comando"
            aria-controls="command-results"
            className="w-full bg-transparent font-mono text-sm text-text outline-none placeholder:text-text-muted"
          />
          <kbd className="rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[0.65rem] text-text-muted">
            Esc
          </kbd>
        </div>

        {results.length === 0 ? (
          <p className="px-4 py-6 text-center font-mono text-sm text-text-muted">
            Sin resultados para «{query}»
          </p>
        ) : (
          <ul
            id="command-results"
            ref={listRef}
            role="listbox"
            aria-label="Comandos disponibles"
            className="max-h-[50vh] overflow-y-auto p-2"
          >
            {results.map((command, index) => (
              <li key={command.id} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  data-index={index}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => run(command)}
                  className={`flex w-full items-center gap-3 rounded px-3 py-2 text-left text-sm ${
                    index === activeIndex
                      ? 'bg-accent-soft text-text'
                      : 'text-text-muted hover:bg-surface-2'
                  }`}
                >
                  <span className="flex-1 truncate">{command.title}</span>
                  <span className="font-mono text-[0.65rem] uppercase tracking-wider opacity-70">
                    {groupLabels[command.group]}
                  </span>
                  {command.shortcut && (
                    <kbd className="font-mono text-[0.65rem] opacity-70">{command.shortcut}</kbd>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between border-t border-border px-4 py-2 font-mono text-[0.65rem] text-text-muted">
          <span>↑↓ navegar · Enter ejecutar</span>
          <button type="button" onClick={close} className="hover:text-accent">
            {MOD_KEY}+K para abrir
          </button>
        </div>
      </div>
    </div>
  );
}

export { commands };
