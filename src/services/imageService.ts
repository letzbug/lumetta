import type { CoverImage, CoverScene, GeneratedStory, StoryRequest } from '../types/story';
import { createIllustratedCover } from './demo/coverArt';
import { pickWorld, resolveMood } from './demo/demoStoryEngine';
import { logTechnical, postJson } from './apiClient';
import { hashString } from '../utils/id';

/**
 * Cover illustration service.
 * - Demo / fallback: an illustrated SVG scene painted on the device.
 * - Remote: POST /api/image → provider configured on the server (IMAGE_PROVIDER).
 * The child's name is NEVER part of an image prompt.
 */
export const COVER_STYLE =
  "Premium children's picture-book cover illustration. Warm, imaginative, calm. Modern European illustration with soft gouache textures and paper-cut depth, gentle glowing light, rich but harmonious colours. Not overly cartoonish. No text, letters or logos. No copyrighted or recognisable characters. Not in the style of any specific studio or living artist. Do not depict a real child.";

export function sceneFor(story: GeneratedStory, req: StoryRequest): CoverScene {
  if (story.scene) return story.scene;
  const seed = hashString(story.title);
  const { setting, creature } = pickWorld(req);
  return { setting, creature, mood: resolveMood(req.storyMood, seed), seed };
}

export function buildCoverPrompt(story: GeneratedStory, req: StoryRequest): string {
  const mood = sceneFor(story, req).mood;
  return [
    COVER_STYLE,
    `Scene: ${story.coverPrompt}.`,
    `Mood: ${mood}. Suitable for a ${req.childAge}-year-old.`,
    `Portrait format, generous calm space in the lower third for a title.`,
  ].join(' ');
}

export async function createCover(story: GeneratedStory, req: StoryRequest, remote: boolean): Promise<CoverImage> {
  const scene = sceneFor(story, req);
  const illustrated = createIllustratedCover(scene);
  if (!remote) return illustrated;
  try {
    const result = await postJson<{ dataUrl: string }>('/image', { prompt: buildCoverPrompt(story, req) }, 120_000);
    if (!result?.dataUrl?.startsWith('data:image/')) throw new Error('invalid image payload');
    return { kind: 'image', src: result.dataUrl, palette: illustrated.palette };
  } catch (err) {
    // A missing picture must never break the story: fall back to the illustrated cover.
    logTechnical('image', err);
    return illustrated;
  }
}
