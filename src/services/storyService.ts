import type { GeneratedStory, GenerationStage, Story, StoryRequest } from '../types/story';
import { APP_CONFIG } from '../config/app';
import { estimateDurationSeconds } from '../config/ageProfiles';
import { generateDemoStory } from './demo/demoStoryEngine';
import { createCover, sceneFor } from './imageService';
import { getBackendStatus, logTechnical, postJson, ServiceError } from './apiClient';
import { screenText } from './safetyService';
import { createId } from '../utils/id';
import { splitParagraphs } from '../utils/text';

/**
 * Story generation service – the single entry point the UI uses.
 *
 *  DEMO   → demo/demoStoryEngine.ts (on device)
 *  REMOTE → POST /api/story → server/providers/story.mjs (Mistral / OpenAI / Anthropic)
 *
 * Privacy: before anything leaves the device the child's first name is replaced
 * by a placeholder token and only restored locally afterwards.
 */
export const HERO_TOKEN = '{{HERO}}';

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

export async function createStory(req: StoryRequest, opts: CreateStoryOptions = {}): Promise<Story> {
  if (screenText(req.customGuidance) === 'support') throw new SafetyStop();
  const stage = opts.onStage ?? (() => {});
  const status = await getBackendStatus();
  const pace = APP_CONFIG.demoStageMs;

  stage('finding');
  const started = Date.now();
  let generated: GeneratedStory;

  if (status.story) {
    generated = await generateRemote(req);
    stage('characters');
  } else {
    await wait(pace);
    stage('characters');
    generated = generateDemoStory(req);
    await wait(pace);
  }

  stage('magic');
  const cover = await createCover(generated, req, status.image);
  // Let the moment breathe even when everything was fast.
  const minimum = pace * 3;
  const elapsed = Date.now() - started;
  if (elapsed < minimum) await wait(minimum - elapsed);
  stage('ready');

  const scene = sceneFor(generated, req);
  return {
    ...generated,
    scene,
    id: createId(),
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    childName: req.childName?.trim() || undefined,
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
  };
}

/** Remove personal details before the request leaves the device. */
export function pseudonymize(req: StoryRequest) {
  const name = req.childName?.trim();
  const scrub = (text?: string) =>
    text && name ? text.replace(new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), HERO_TOKEN) : text;
  return {
    childAge: req.childAge,
    hasName: Boolean(name),
    heroToken: HERO_TOKEN,
    gender: req.gender ?? 'neutral',
    language: req.language,
    interests: req.interests,
    interestsText: scrub(req.interestsText)?.slice(0, 300),
    storyMood: req.storyMood,
    guidanceTheme: req.guidanceTheme,
    customGuidance: scrub(req.customGuidance)?.slice(0, 300),
  };
}

async function generateRemote(req: StoryRequest): Promise<GeneratedStory> {
  try {
    const raw = await postJson<Partial<GeneratedStory>>('/story', pseudonymize(req));
    if (!raw || typeof raw.title !== 'string' || typeof raw.story !== 'string' || raw.story.length < 200) {
      throw new ServiceError('invalid_story', 'Story payload incomplete');
    }
    const name = req.childName?.trim() || '';
    const restore = (text: string) => text.split(HERO_TOKEN).join(name || '').replace(/\s{2,}/g, ' ');
    const story = restore(raw.story);
    const paragraphs = splitParagraphs(story);
    return {
      title: restore(raw.title).trim(),
      summary: restore(raw.summary ?? ''),
      story: paragraphs.join('\n\n'),
      paragraphs,
      coverPrompt: typeof raw.coverPrompt === 'string' ? raw.coverPrompt.split(HERO_TOKEN).join('the hero') : '',
      estimatedDuration: estimateDurationSeconds(story, req.childAge),
      age: req.childAge,
      language: req.language,
    };
  } catch (err) {
    logTechnical('story', err);
    throw err instanceof ServiceError ? err : new ServiceError('story_failed', 'Story generation failed', err);
  }
}
