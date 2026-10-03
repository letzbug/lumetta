import type { CoverScene, GeneratedStory, GenerationStage, Story, StoryRequest } from '../types/story';
import { APP_CONFIG } from '../config/app';
import { createCover, sceneFor } from './imageService';
import { createIllustratedCover } from './demo/coverArt';
import { getBackendStatus, logTechnical, ServiceError } from './apiClient';
import { screenText } from './safetyService';
import { splitParagraphs } from '../utils/text';
import { hashString } from '../utils/id';
import { runStoryEngine, type EngineStage } from './storyEngine/storyEngine';
import { matchFixture, runDemoEngine } from './storyEngine/demo/demoEngine';
import { RemoteProvider } from './storyEngine/provider';
import { loadRecentFingerprints, rememberFingerprint } from './storyEngine/fingerprint';
import { HERO_TOKEN } from './storyEngine/prompts';
import type { EngineRequest, EngineResult } from './storyEngine/schemas';

/**
 * Story service – the single entry point the UI uses (unchanged API).
 *
 *  Story Engine V2
 *   REMOTE → services/storyEngine/storyEngine.ts, models via POST /api/llm
 *   DEMO   → services/storyEngine/demo/demoEngine.ts (benchmark fixtures, V1 template fallback)
 *
 * Privacy: the child's first name never leaves the device. It is replaced by
 * {{HERO}} in everything sent to the server and restored here afterwards.
 */
export { HERO_TOKEN };

export class SafetyStop extends Error {
  constructor() {
    super('guidance requires professional support');
    this.name = 'SafetyStop';
  }
}

export interface CreateStoryOptions {
  onStage?: (stage: GenerationStage) => void;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** "leo" → "Leo", "anne-marie" → "Anne-Marie" */
export function capitalizeName(name?: string): string | undefined {
  const n = name?.trim().replace(/\s+/g, ' ');
  if (!n) return undefined;
  return n.replace(/(^|[\s'-])(\p{L})/gu, (_m: string, sep: string, ch: string) => sep + ch.toLocaleUpperCase());
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Builds the V2 input contract from the creation wizard. */
export function toEngineRequest(req: StoryRequest): EngineRequest {
  const name = capitalizeName(req.childName);
  const scrub = (text?: string) => (text && name ? text.replace(new RegExp(`(^|[^\\p{L}])${escape(name)}(?![\\p{L}])`, 'giu'), `$1${HERO_TOKEN}`) : text);
  const request = [req.interestsText?.trim(), ...req.interestLabels].filter(Boolean).join(' + ');
  return {
    child: { firstName: name, age: req.childAge, gender: req.gender },
    language: req.language,
    request: scrub(request) ?? '',
    interests: req.interestLabels,
    mood: req.storyMood,
    guidance: req.guidanceTheme && req.guidanceTheme !== 'custom' ? [req.guidanceTheme] : [],
    customGuidance: scrub(req.customGuidance)?.slice(0, 300),
    recentFingerprints: loadRecentFingerprints(),
  };
}

/** What may leave the device: no name, only the token. */
function forRemote(req: EngineRequest): EngineRequest {
  return { ...req, child: req.child ? { ...req.child, firstName: req.child.firstName ? HERO_TOKEN : undefined } : undefined };
}

const STAGE_MAP: Record<EngineStage, GenerationStage | null> = {
  interpreting: 'finding',
  imagining: 'finding',
  selecting: 'finding',
  architecting: 'characters',
  characters: 'characters',
  guidance: 'characters',
  writing: 'magic',
  critiquing: 'magic',
  rewriting: 'magic',
  done: null,
};

export async function createStory(req: StoryRequest, opts: CreateStoryOptions = {}): Promise<Story> {
  if (screenText(req.customGuidance) === 'support' || screenText(req.interestsText) === 'support') throw new SafetyStop();
  const emit = opts.onStage ?? (() => {});
  let last: GenerationStage | null = null;
  const onStage = (s: EngineStage) => {
    const ui = STAGE_MAP[s];
    if (ui && ui !== last) {
      last = ui;
      emit(ui);
    }
  };

  const status = await getBackendStatus();
  const engineReq = toEngineRequest(req);
  const started = Date.now();
  emit('finding');

  let result: EngineResult;
  let coverScene: CoverScene | undefined;
  try {
    if (status.story) {
      result = await runStoryEngine(forRemote(engineReq), new RemoteProvider(), { onStage, debug: Boolean(import.meta.env?.DEV) });
    } else {
      const demo = await runDemoEngine(engineReq, req, { onStage, paceMs: APP_CONFIG.demoStageMs });
      result = demo;
      coverScene = demo.cover;
    }
  } catch (err) {
    logTechnical('story-engine', err);
    throw err instanceof ServiceError ? err : new ServiceError('story_failed', 'Story Engine failed', err);
  }
  if (import.meta.env?.DEV && result.debug) console.info('[lumetta:story-engine]', result.metadata.engine, result.debug);

  // restore the name on the device
  const name = engineReq.child?.firstName ?? '';
  const restore = (t: string) => t.split(HERO_TOKEN).join(name).replace(/[ \t]{2,}/g, ' ');
  const paragraphs = splitParagraphs(restore(result.story.text));
  if (!paragraphs.length) throw new ServiceError('empty_story', 'Engine returned no text');

  const generated: GeneratedStory = {
    title: restore(result.story.title).trim(),
    summary: restore(result.metadata.summary ?? ''),
    story: paragraphs.join('\n\n'),
    paragraphs,
    coverPrompt: result.metadata.coverPrompt.split(HERO_TOKEN).join('the child'),
    estimatedDuration: result.story.estimatedDurationSeconds,
    age: req.childAge,
    language: result.story.language,
  };

  emit('magic');
  // cover: demo scenes come with the result; remote stories get a matching composition where possible
  const fixtureCover = matchFixture(engineReq)?.cover;
  const scene: CoverScene = coverScene ?? (fixtureCover ? { ...fixtureCover, seed: hashString(generated.title) } : sceneFor(generated, req));
  generated.scene = scene;
  const cover = status.story ? await createCover(generated, req, status.image) : createIllustratedCover(scene);

  const minimum = APP_CONFIG.demoStageMs * 3;
  const elapsed = Date.now() - started;
  if (elapsed < minimum) await wait(minimum - elapsed);
  emit('ready');

  rememberFingerprint(result.metadata.fingerprint);

  return {
    ...generated,
    id: result.story.id,
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    childName: name || undefined,
    mood: scene.mood,
    interests: req.interests,
    guidanceTheme: req.guidanceTheme,
    usedCustomGuidance: Boolean(req.customGuidance?.trim()),
    cover,
    voiceId: req.voiceId,
    favorite: false,
    saved: false,
    source: status.story ? 'remote' : 'demo',
    externalTriggerId: null,
    engine: {
      version: 2,
      kind: result.metadata.engine,
      storyForm: result.metadata.storyForm,
      fingerprint: result.metadata.fingerprint,
      scenes: result.metadata.scenes,
    },
  };
}
