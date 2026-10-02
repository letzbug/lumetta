/**
 * Server-side configuration. The ONLY place that reads provider secrets.
 * In development Vite passes its loaded env in; in production index.mjs reads .env.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const readJson = (rel) => JSON.parse(readFileSync(resolve(root, rel), 'utf8'));

/** Shared with the app: one source of truth for specialists to edit. */
export const principles = readJson('src/config/guidance/principles.json');
export const ageProfiles = readJson('src/config/ageProfiles.json');
export const safety = readJson('src/config/safety.json');

/** Minimal .env loader (no dependency). Existing environment variables win. */
export function loadDotEnv(file = resolve(root, '.env')) {
  if (!existsSync(file)) return {};
  const out = {};
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m || line.trim().startsWith('#')) continue;
    out[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
  return out;
}

export function resolveConfig(env) {
  const get = (k, d = '') => (env[k] ?? process.env[k] ?? d).toString().trim();
  const story = get('STORY_PROVIDER', 'demo').toLowerCase();
  const image = get('IMAGE_PROVIDER', 'demo').toLowerCase();
  const tts = get('TTS_PROVIDER', 'browser').toLowerCase();
  const keys = {
    mistral: get('MISTRAL_API_KEY'),
    openai: get('OPENAI_API_KEY'),
    anthropic: get('ANTHROPIC_API_KEY'),
    elevenlabs: get('ELEVENLABS_API_KEY'),
  };
  const demoForced = get('VITE_DEMO_MODE', 'true').toLowerCase() !== 'false';
  return {
    demoForced,
    story: { provider: story, key: keys[story] ?? '', model: get('STORY_MODEL') },
    image: { provider: image, key: keys[image] ?? '', model: get('IMAGE_MODEL', 'gpt-image-1') },
    tts: {
      provider: tts,
      key: keys[tts] ?? '',
      model: get('TTS_MODEL'),
      voices: {
        'warm-female': get('TTS_VOICE_WARM_FEMALE'),
        'warm-male': get('TTS_VOICE_WARM_MALE'),
        neutral: get('TTS_VOICE_NEUTRAL'),
      },
    },
  };
}

export function capabilities(cfg) {
  const on = (part, allowed) => !cfg.demoForced && allowed.includes(part.provider) && Boolean(part.key);
  return {
    story: on(cfg.story, ['mistral', 'openai', 'anthropic']),
    image: on(cfg.image, ['openai']),
    tts: on(cfg.tts, ['openai', 'elevenlabs']),
    providers: { story: cfg.story.provider, image: cfg.image.provider, tts: cfg.tts.provider },
  };
}
