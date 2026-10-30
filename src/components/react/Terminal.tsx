import { useCallback, useEffect, useRef, useState } from 'react';
import {
  autocomplete,
  executeCommand,
  type TerminalContext,
  type TerminalLine,
} from '../../lib/terminal/commands';
import { setTheme } from '../../lib/theme-store';
interface Props {
  context: TerminalContext;
  prompt?: string;
}

interface Entry {
  id: number;
  input: string;
  lines: TerminalLine[];
}

const toneClass: Record<string, string> = {
  default: 'text-slate-200',
  ok: 'text-emerald-400',
  muted: 'text-slate-400',
  accent: 'text-amber-300',
  error: 'text-rose-400',
  terminal: 'text-cyan-300',
};

export default function Terminal({ context, prompt = 'maty@desktop:~$' }: Props) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const historyIndex = useRef(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [entries, scrollToBottom]);

  const submit = useCallback(
    (raw: string) => {
      const value = raw.trim();
      if (!value) return;

      const result = executeCommand(value, context);

      if (result.theme) {
        setTheme(result.theme);
      }

      setHistory((current) => [...current, value]);
      historyIndex.current = -1;
      setInput('');

      if (result.clear) {
        setEntries([]);
        return;
      }

      setEntries((current) => [
        ...current,
        { id: current.length, input: value, lines: result.lines },
      ]);
    },
    [context],
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      submit(input);
      return;
    }

    if (event.key === 'Tab') {
      const suggestion = autocomplete(input);
      if (suggestion) {
        event.preventDefault();
        setInput(suggestion);
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const index = historyIndex.current;
      const next = index === -1 ? history.length - 1 : Math.max(index - 1, 0);
      historyIndex.current = next;
      setInput(history[next] ?? '');
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const index = historyIndex.current;
      if (index === -1) return;
      const next = index + 1;
      if (next >= history.length) {
        historyIndex.current = -1;
        setInput('');
        return;
      }
      historyIndex.current = next;
      setInput(history[next]);
    }
  };

  return (
    <div className="terminal-surface flex min-h-64 flex-col p-4 text-xs sm:text-sm">
      <div ref={scrollRef} className="max-h-96 flex-1 overflow-y-auto" aria-live="polite">
        {entries.length === 0 && (
          <p className="mb-3 text-slate-400">
            Escribí <span className="text-amber-300">help</span> y presioná Enter. También podés
            usar <span className="text-amber-300">Tab</span> para autocompletar.
          </p>
        )}

        {entries.map((entry) => (
          <div key={entry.id} className="mb-3">
            <p className="flex gap-2">
              <span className="shrink-0 text-emerald-400">{prompt}</span>
              <span className="text-slate-200">{entry.input}</span>
            </p>
            {entry.lines.map((line, index) => (
              <p key={index} className={`pl-4 ${toneClass[line.tone ?? 'default']}`}>
                {line.text}
              </p>
            ))}
          </div>
        ))}

        <p className="flex gap-2">
          <span className="shrink-0 text-emerald-400">{prompt}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Terminal de comandos"
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-slate-100 outline-none"
          />
        </p>
      </div>
    </div>
  );
}
