import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { contactReasonLabels, contactReasons } from '../../lib/contact';
import {
  getLocationSearch,
  getServerLocationSearch,
  subscribeLocation,
} from '../../lib/location';

type Status = 'idle' | 'enviando' | 'ok' | 'error';

interface Props {
  sitekey?: string;
  initialCode?: string;
  initialReason?: string;
}

interface TurnstileApi {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      callback: (token: string) => void;
      'expired-callback': () => void;
      'error-callback': () => void;
      theme?: 'light' | 'dark' | 'auto';
    },
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SITEKEY = import.meta.env.PUBLIC_SITEKEY_TURNSTILE ?? '';

export default function ContactForm({ sitekey = SITEKEY, initialCode = '', initialReason = '' }: Props) {
  const search = useSyncExternalStore(subscribeLocation, getLocationSearch, getServerLocationSearch);
  const params = useMemo(() => new URLSearchParams(search), [search]);

  const prefilledCode = params.get('codigo') ?? initialCode;
  const prefilledReason = params.get('motivo') ?? initialReason;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [reasonInput, setReasonInput] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [codeInput, setCodeInput] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [promoInfo, setPromoInfo] = useState<string | null>(null);
  const [token, setToken] = useState('');

  const reason =
    reasonInput ??
    (contactReasons.includes(prefilledReason as (typeof contactReasons)[number])
      ? prefilledReason
      : 'asesoria');
  const code = codeInput ?? prefilledCode;

  const widgetContainer = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!sitekey) return;

    const render = () => {
      if (!window.turnstile || !widgetContainer.current || widgetId.current) return;
      widgetId.current = window.turnstile.render(widgetContainer.current, {
        sitekey,
        action: 'contacto',
        theme: 'auto',
        callback: (value: string) => setToken(value),
        'expired-callback': () => setToken(''),
        'error-callback': () => setToken(''),
      });
    };

    if (window.turnstile) {
      render();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = render;
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [sitekey]);

  const submit = useCallback(
    async (event: React.SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();
      setStatus('enviando');
      setFeedback(null);
      setPromoInfo(null);

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, reason, message, website: '', code, turnstileToken: token }),
        });

        const data = (await response.json()) as {
          ok: boolean;
          mensaje?: string;
          promo?: { codigo: string; descuento: number } | null;
        };

        if (!response.ok || !data.ok) {
          setStatus('error');
          setFeedback(data.mensaje ?? 'No pude enviar el mensaje. Probá de nuevo.');
          if (widgetId.current && window.turnstile) {
            window.turnstile.reset(widgetId.current);
          }
          setToken('');
          return;
        }

        setStatus('ok');
        setFeedback(data.mensaje ?? 'Mensaje recibido.');
        if (data.promo) {
          setPromoInfo(`Código ${data.promo.codigo} aplicado: ${data.promo.descuento}% de descuento.`);
        }
        setName('');
        setEmail('');
        setMessage('');
        setCodeInput('');
        setToken('');
        if (widgetId.current && window.turnstile) {
          window.turnstile.reset(widgetId.current);
        }
      } catch {
        setStatus('error');
        setFeedback('Sin conexión con el servidor. Revisá tu red y probá de nuevo.');
      }
    },
    [code, email, message, name, reason, token],
  );

  const inputClass =
    'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent';

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="font-mono-label mb-1 block text-text-muted">nombre</span>
          <input
            type="text"
            required
            minLength={2}
            maxLength={80}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClass}
            autoComplete="name"
          />
        </label>

        <label className="block">
          <span className="font-mono-label mb-1 block text-text-muted">email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
            autoComplete="email"
          />
        </label>
      </div>

      <label className="block">
        <span className="font-mono-label mb-1 block text-text-muted">motivo</span>
        <select
          value={reason}
          onChange={(event) => setReasonInput(event.target.value)}
          className={inputClass}
        >
          {contactReasons.map((value) => (
            <option key={value} value={value}>
              {contactReasonLabels[value]}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="font-mono-label mb-1 block text-text-muted">mensaje</span>
        <textarea
          required
          minLength={10}
          maxLength={2000}
          rows={6}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className={inputClass}
          placeholder="Contame qué necesitás, con el contexto que tengas."
        />
      </label>

      <label className="block">
        <span className="font-mono-label mb-1 block text-text-muted">
          código promocional (opcional)
        </span>
        <input
          type="text"
          value={code}
          onChange={(event) => setCodeInput(event.target.value.toUpperCase())}
          className={`${inputClass} font-mono`}
          placeholder="MATE-ASES-XXXX"
        />
      </label>

      <div className="hidden" aria-hidden="true">
        <label>
          website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {sitekey && <div ref={widgetContainer} className="min-h-16" />}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === 'enviando'}
          className="rounded-lg bg-accent px-5 py-2.5 font-semibold text-accent-contrast transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'enviando' ? 'Enviando…' : 'Enviar mensaje'}
        </button>

        <p role="status" aria-live="polite" className="font-mono text-sm">
          {status === 'ok' && <span className="text-ok">[ OK ] {feedback}</span>}
          {status === 'error' && <span className="text-[#e5484d]">[FAILED] {feedback}</span>}
          {status === 'idle' && !sitekey && (
            <span className="text-text-muted">[INFO] sin verificación anti-bot en este entorno</span>
          )}
        </p>
      </div>

      {promoInfo && (
        <p className="rounded-lg border border-ok/40 bg-ok-soft px-3 py-2 font-mono text-xs text-ok">
          {promoInfo}
        </p>
      )}
    </form>
  );
}
