/**
 * Lumetta API layer – framework-free Node middleware.
 *
 *   GET  /api/health  → which real providers are configured (no secrets)
 *   POST /api/story   → story JSON   (safety screen → prompt → provider → lint)
 *   POST /api/image   → { dataUrl }  cover illustration
 *   POST /api/tts     → audio/mpeg   narration
 *
 * Privacy: the app sends pseudonymised wishes (no name). Nothing is stored
 * here; request bodies are not logged. Deploy in an EU region for GDPR-first setups.
 */
import { capabilities, resolveConfig } from './config.mjs';
import { buildStoryPrompt, parseStoryJson } from './prompt.mjs';
import { lintStory, needsSupport } from './safety.mjs';
import { complete, generateStoryText } from './providers/story.mjs';
import { generateCover } from './providers/image.mjs';
import { synthesize } from './providers/tts.mjs';

const LIMITS = { story: 30, image: 30, tts: 60, llm: 400 }; // per client per hour – protects budgets
// Story Engine V2 stages allowed through the LLM proxy (anything else is rejected)
const ENGINE_STAGES = new Set(['plan', 'review', 'interpreter', 'imagination', 'selector', 'architect', 'characters', 'guidance', 'writer', 'critic', 'fingerprint']);
const hits = new Map();

function rateLimited(ip, kind) {
  const key = `${ip}:${kind}`;
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < 3_600_000);
  list.push(now);
  hits.set(key, list);
  return list.length > LIMITS[kind];
}

function readJson(req, limit = 64 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) {
        reject(new Error('payload too large'));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function send(res, status, body, type = 'application/json') {
  res.statusCode = status;
  res.setHeader('Content-Type', type);
  res.setHeader('Cache-Control', 'no-store');
  res.end(type === 'application/json' ? JSON.stringify(body) : body);
}

/** Technical details go to the server log only – the family sees a gentle message. */
function fail(res, status, code, err) {
  if (err) console.error(`[lumetta-api] ${code}:`, err instanceof Error ? err.message : err);
  send(res, status, { error: code });
}

const LANGS = ['de', 'fr', 'en', 'lb'];
const clamp = (s, n) => (typeof s === 'string' ? s.slice(0, n) : undefined);

export function createApiHandler(env = {}) {
  const cfg = resolveConfig(env);
  // CORS – lets a static frontend (e.g. GitHub Pages) call a separately hosted API.
  const allowedOrigins = String(env.ALLOWED_ORIGINS ?? process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  // Cost control: a cheaper model per stage, e.g. STORY_MODEL_PLAN / STORY_MODEL_WRITER / STORY_MODEL_REVIEW
  const modelFor = (stage) => String(env[`STORY_MODEL_${stage.toUpperCase()}`] ?? process.env[`STORY_MODEL_${stage.toUpperCase()}`] ?? '').trim() || cfg.story.model;
  const caps = capabilities(cfg);
  console.log(`[lumetta-api] story:${caps.story ? cfg.story.provider : 'demo'} image:${caps.image ? cfg.image.provider : 'demo'} tts:${caps.tts ? cfg.tts.provider : 'browser'}`);

  return async function handler(req, res, next) {
    const url = (req.url ?? '').split('?')[0];
    if (!url.startsWith('/api/')) return next ? next() : fail(res, 404, 'not_found');
    const ip = req.socket?.remoteAddress ?? 'unknown';
    const origin = req.headers?.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      return res.end();
    }

    try {
      if (req.method === 'GET' && url === '/api/health') return send(res, 200, caps);
      if (req.method !== 'POST') return fail(res, 405, 'method');

      if (url === '/api/llm') {
        // Story Engine V2: one pipeline stage per call. Keys stay here.
        if (!caps.story) return fail(res, 503, 'engine_unavailable');
        if (rateLimited(ip, 'llm')) return fail(res, 429, 'slow_down');
        const body = await readJson(req, 96 * 1024);
        if (!ENGINE_STAGES.has(body.stage)) return fail(res, 400, 'unknown_stage');
        const system = String(body.system ?? '').slice(0, 24000);
        const user = String(body.user ?? '').slice(0, 48000);
        if (!system || !user) return fail(res, 400, 'empty');
        if (needsSupport(user)) return fail(res, 422, 'needs_support');
        const text = await complete({ ...cfg.story, model: modelFor(body.stage) }, {
          system,
          user,
          json: body.json !== false,
          temperature: Math.min(1.2, Math.max(0, Number(body.temperature) || 0.7)),
          maxTokens: Math.min(4000, Math.max(200, Number(body.maxTokens) || 2000)),
        });
        return send(res, 200, { text });
      }

      if (url === '/api/story') {
        if (!caps.story) return fail(res, 503, 'story_unavailable');
        if (rateLimited(ip, 'story')) return fail(res, 429, 'slow_down');
        const body = await readJson(req);
        const input = {
          childAge: Math.min(12, Math.max(3, Number(body.childAge) || 6)),
          hasName: Boolean(body.hasName),
          heroToken: '{{HERO}}',
          gender: ['girl', 'boy'].includes(body.gender) ? body.gender : 'neutral',
          language: LANGS.includes(body.language) ? body.language : 'en',
          interests: Array.isArray(body.interests) ? body.interests.slice(0, 12).map(String) : [],
          interestsText: clamp(body.interestsText, 300),
          storyMood: clamp(body.storyMood, 20) ?? 'surprise',
          guidanceTheme: clamp(body.guidanceTheme, 40),
          customGuidance: clamp(body.customGuidance, 300),
        };
        if (needsSupport(input.customGuidance, input.interestsText)) return fail(res, 422, 'needs_support');

        const prompt = buildStoryPrompt(input);
        let story;
        for (let attempt = 0; attempt < 2; attempt++) {
          const raw = await generateStoryText(cfg.story, prompt);
          story = parseStoryJson(raw);
          const flagged = lintStory(story.story, input.language);
          if (!flagged.length) break;
          console.warn('[lumetta-api] story lint flagged phrasing, regenerating:', flagged);
          prompt.user += `\n\nIMPORTANT: do not use these phrases: ${flagged.join(', ')}.`;
        }
        return send(res, 200, { ...story, language: input.language, age: input.childAge });
      }

      if (url === '/api/image') {
        if (!caps.image) return fail(res, 503, 'image_unavailable');
        if (rateLimited(ip, 'image')) return fail(res, 429, 'slow_down');
        const body = await readJson(req);
        const dataUrl = await generateCover(cfg.image, String(body.prompt ?? ''));
        return send(res, 200, { dataUrl });
      }

      if (url === '/api/tts') {
        if (!caps.tts) return fail(res, 503, 'tts_unavailable');
        if (rateLimited(ip, 'tts')) return fail(res, 429, 'slow_down');
        const body = await readJson(req, 128 * 1024);
        const text = String(body.text ?? '').slice(0, 12000);
        if (!text) return fail(res, 400, 'empty');
        const audio = await synthesize(cfg.tts, {
          text,
          language: LANGS.includes(body.language) ? body.language : 'en',
          voiceId: ['warm-female', 'warm-male', 'neutral'].includes(body.voiceId) ? body.voiceId : 'neutral',
          rate: Math.min(1.1, Math.max(0.8, Number(body.rate) || 0.92)),
        });
        return send(res, 200, audio, 'audio/mpeg');
      }

      return fail(res, 404, 'not_found');
    } catch (err) {
      return fail(res, 502, 'provider_failed', err);
    }
  };
}
