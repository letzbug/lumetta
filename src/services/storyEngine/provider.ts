// ─────────────────────────────────────────────────────────────
// Provider abstraction. The pipeline only ever calls
//   generateStructured(stage, user, validate)
//   generateText(stage, user)
// Which model/vendor answers is decided on the server
// (server/providers/story.mjs, configured in .env).
// ─────────────────────────────────────────────────────────────
import { APP_CONFIG } from '../../config/app';
import { fetchWithTimeout, logTechnical } from '../apiClient';
import { PROMPTS, STAGE_SETTINGS, type StageName } from './prompts';
import { SchemaError } from './schemas';

export class EngineError extends Error {
  constructor(public stage: string, message: string, public cause?: unknown) {
    super(`[${stage}] ${message}`);
    this.name = 'EngineError';
  }
}

export interface LlmProvider {
  readonly name: string;
  generateText(stage: StageName, user: string): Promise<string>;
  generateStructured<T>(stage: StageName, user: string, validate: (raw: unknown) => T): Promise<T>;
}

/** Tolerant JSON extraction: strips fences, finds the outermost object. */
export function parseModelJson(text: string): unknown {
  const clean = String(text).replace(/```(?:json)?/gi, '').trim();
  try {
    return JSON.parse(clean);
  } catch {
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    if (start === -1 || end <= start) throw new SyntaxError('no JSON object found');
    const slice = clean.slice(start, end + 1).replace(/,\s*([}\]])/g, '$1'); // trailing commas
    return JSON.parse(slice);
  }
}

/** Calls the server-side LLM proxy (keys never reach the browser). */
export class RemoteProvider implements LlmProvider {
  readonly name = 'remote';

  private async call(stage: StageName, user: string, json: boolean, extraSystem = ''): Promise<string> {
    const settings = STAGE_SETTINGS[stage];
    const res = await fetchWithTimeout(
      `${APP_CONFIG.apiBase}/llm`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage,
          system: PROMPTS[stage].system + extraSystem,
          user,
          json,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
        }),
      },
      120_000,
    );
    if (!res.ok) throw new EngineError(stage, `HTTP ${res.status}`);
    const data = (await res.json()) as { text?: unknown };
    if (typeof data.text !== 'string' || !data.text.trim()) throw new EngineError(stage, 'empty model response');
    return data.text;
  }

  async generateText(stage: StageName, user: string): Promise<string> {
    return withRetry(stage, () => this.call(stage, user, false));
  }

  async generateStructured<T>(stage: StageName, user: string, validate: (raw: unknown) => T): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt++) {
      const hint = attempt === 0 ? '' : `\n\nYour previous answer could not be used (${String((lastError as Error)?.message ?? lastError).slice(0, 160)}). Return valid JSON that follows the schema exactly.`;
      try {
        const text = await withRetry(stage, () => this.call(stage, user, true, hint));
        return validate(parseModelJson(text));
      } catch (err) {
        lastError = err;
        logTechnical(`engine:${stage}`, err);
        if (!(err instanceof SchemaError || err instanceof SyntaxError)) break; // network/provider errors already retried
      }
    }
    throw lastError instanceof EngineError ? lastError : new EngineError(stage, 'invalid structured output', lastError);
  }
}

/** One quick retry for transient network/provider failures. */
async function withRetry<T>(stage: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    logTechnical(`engine:${stage}:retry`, err);
    await new Promise((r) => setTimeout(r, 800));
    try {
      return await fn();
    } catch (err2) {
      throw err2 instanceof EngineError ? err2 : new EngineError(stage, 'provider unavailable', err2);
    }
  }
}
