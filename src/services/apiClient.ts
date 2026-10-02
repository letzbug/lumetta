import { APP_CONFIG } from '../config/app';

/** Errors that stay inside the experience. `code` is for logs, never for the UI. */
export class ServiceError extends Error {
  constructor(public code: string, message?: string, public cause?: unknown) {
    super(message ?? code);
    this.name = 'ServiceError';
  }
}

export interface BackendStatus {
  story: boolean;
  image: boolean;
  tts: boolean;
  providers: { story: string; image: string; tts: string };
}

const DEMO_STATUS: BackendStatus = {
  story: false,
  image: false,
  tts: false,
  providers: { story: 'demo', image: 'demo', tts: 'browser' },
};

let statusPromise: Promise<BackendStatus> | null = null;

/** Which real providers are configured on the server? Demo mode answers "none". */
export function getBackendStatus(): Promise<BackendStatus> {
  if (APP_CONFIG.demoModeForced) return Promise.resolve(DEMO_STATUS);
  if (!statusPromise) {
    statusPromise = fetchWithTimeout(`${APP_CONFIG.apiBase}/health`, { method: 'GET' }, 3000)
      .then(async (res) => (res.ok ? ((await res.json()) as BackendStatus) : DEMO_STATUS))
      .catch(() => DEMO_STATUS);
  }
  return statusPromise;
}

export async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: init.signal ?? controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function postJson<T>(path: string, body: unknown, timeoutMs = 90_000): Promise<T> {
  let res: Response;
  try {
    res = await fetchWithTimeout(`${APP_CONFIG.apiBase}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }, timeoutMs);
  } catch (err) {
    throw new ServiceError('network', `Request to ${path} failed`, err);
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new ServiceError(`http_${res.status}`, `${path} answered ${res.status}: ${detail.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

export async function postForBlob(path: string, body: unknown, timeoutMs = 120_000): Promise<Blob> {
  const res = await fetchWithTimeout(`${APP_CONFIG.apiBase}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, timeoutMs).catch((err) => {
    throw new ServiceError('network', `Request to ${path} failed`, err);
  });
  if (!res.ok) throw new ServiceError(`http_${res.status}`, `${path} answered ${res.status}`);
  return res.blob();
}

/** Development logging. Never shown to families. */
export function logTechnical(context: string, error: unknown) {
  if (import.meta.env?.DEV) console.error(`[lumetta:${context}]`, error);
}
