import type { CoverScene, GeneratedStory, GenerationStage, Story, StoryRequest } from '../types/story';
import { APP_CONFIG } from '../config/app';
import { createCover, sceneFor } from './imageService';
import { createIllustratedCover } from './demo/coverArt';
import { getBackendStatus, logTechnical, ServiceError } from './apiClient';
import { screenText } from './safetyService';
import { splitParagraphs } from '../utils/text';
import { runStoryEngine, type EngineStage } from './storyEngine/storyEngine';
import { buildExample } from './storyEngine/demo/demoEngine';
import { RemoteProvider } from './storyEngine/provider';
import { loadRecentFingerprints, rememberFingerprint } from './storyEngine/fingerprint';
import { HERO_TOKEN } from './storyEngine/prompts';
import type { EngineRequest, EngineResult } from './storyEngine/schemas';

/**
 * Story service – the single entry point the UI uses (unchanged API).
 *
 *  Story Engine V2 – ONE path for every request:
 *   services/storyEngine/storyEngine.ts → provider (POST /api/llm) → any configured model
 *
 *  Without a story provider there is NO generation: createStory() throws
 *  NoStoryProvider and the UI says so honestly. Pre-written example stories
 *  are only available through createExampleStory(), chosen explicitly.
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

/** Thrown when no story provider is configured (e.g. GitHub Pages without an API). */
export class NoStoryProvider extends Error {
  constructor() {
    super('no story provider configured');
    this.name = 'NoStoryProvider';
  }
}

export async function isStoryServiceAvailable(): Promise<boolean> {
  return (await getBackendStatus()).story;
}

const nameRegex = (name: string) => new RegExp(`(^|[^\\p{L}])(${escape(name)})(?![\\p{L}])`, 'giu');

/** Restore the hero token and enforce the correct spelling of the name everywhere. */
export function finalizeText(text: string, name: string): string {
  let out = text.split(HERO_TOKEN).join(name);
  if (name) out = out.replace(nameRegex(name), (_m: string, pre: string) => pre + name);
  return out.replace(/[ \t]{2,}/g, ' ');
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
  if (!status.story) throw new NoStoryProvider();
  const engineReq = toEngineRequest(req);
  const started = Date.now();
  emit('finding');

  let result: EngineResult;
  try {
    result = await runStoryEngine(forRemote(engineReq), new RemoteProvider(), { onStage, debug: Boolean(import.meta.env?.DEV) });
  } catch (err) {
    logTechnical('story-engine', err);
    throw err instanceof ServiceError ? err : new ServiceError('story_failed', 'Story Engine failed', err);
  }
  if (import.meta.env?.DEV && result.debug) console.info('[lumetta:story-engine]', result.debug);

  const name = engineReq.child?.firstName ?? '';
  const story = toStory(result, req, name);
  emit('magic');
  story.cover = await createCover(story, req, status.image);
  const minimum = APP_CONFIG.demoStageMs * 3;
  const elapsed = Date.now() - started;
  if (elapsed < minimum) await wait(minimum - elapsed);
  emit('ready');

  rememberFingerprint(result.metadata.fingerprint);
  return story;
}

/** Shared mapping from an engine result to a library story. */
function toStory(result: EngineResult, req: StoryRequest, name: string, scene?: CoverScene): Story {
  const paragraphs = splitParagraphs(finalizeText(result.story.text, name));
  if (!paragraphs.length) throw new ServiceError('empty_story', 'Engine returned no text');
  const generated: GeneratedStory = {
    title: finalizeText(result.story.title, name).trim(),
    summary: finalizeText(result.metadata.summary ?? '', name),
    story: paragraphs.join('\n\n'),
    paragraphs,
    coverPrompt: result.metadata.coverPrompt.split(HERO_TOKEN).join('the child'),
    estimatedDuration: result.story.estimatedDurationSeconds,
    age: result.story.age,
    language: result.story.language,
  };
  generated.scene = scene ?? sceneFor(generated, req);
  return {
    ...generated,
    id: result.story.id,
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    childName: name || undefined,
    mood: generated.scene.mood,
    interests: req.interests,
    guidanceTheme: req.guidanceTheme,
    usedCustomGuidance: Boolean(req.customGuidance?.trim()),
    cover: createIllustratedCover(generated.scene),
    voiceId: req.voiceId,
    favorite: false,
    saved: false,
    source: result.metadata.engine === 'v2-remote' ? 'remote' : 'demo',
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

/**
 * DEMO MODE ONLY: a pre-written example the parent picked explicitly.
 * Labelled as an example everywhere – never presented as generated from the request.
 */
export function createExampleStory(req: StoryRequest, exampleId: string): Story {
  const name = capitalizeName(req.childName) ?? '';
  const example = buildExample(exampleId, name || undefined);
  return toStory(example, { ...req, guidanceTheme: undefined, customGuidance: undefined }, name, example.cover);
}
