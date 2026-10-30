export interface TurnstileResult {
  success: boolean;
  action?: string;
  hostname?: string;
  errorCodes: string[];
}

export interface TurnstileOptions {
  secret: string;
  token: string;
  remoteIp?: string;
  expectedAction: string;
  expectedHostnames: string[];
}

export async function verifyTurnstile(options: TurnstileOptions): Promise<TurnstileResult> {
  if (!options.secret || !options.token) {
    return { success: false, errorCodes: ['missing-input-response'] };
  }

  const body = new URLSearchParams({
    secret: options.secret,
    response: options.token,
  });

  if (options.remoteIp) body.set('remoteip', options.remoteIp);

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: AbortSignal.timeout(10_000),
      body,
    });

    if (!response.ok) {
      return { success: false, errorCodes: ['siteverify-http-error'] };
    }

    const data = (await response.json()) as {
      success?: boolean;
      action?: string;
      hostname?: string;
      'error-codes'?: string[];
    };

    return {
      success: data.success === true,
      action: data.action,
      hostname: data.hostname,
      errorCodes: data['error-codes'] ?? [],
    };
  } catch {
    return { success: false, errorCodes: ['siteverify-unavailable'] };
  }
}

export function isAllowedHostname(hostname: string | undefined, allowed: string[]): boolean {
  if (!hostname) return false;
  return allowed.some((entry) => entry.trim().toLowerCase() === hostname.toLowerCase());
}

export function parseHostnames(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}
