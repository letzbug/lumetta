import type { CoverImage, CoverScene, GeneratedStory, StoryRequest } from '../types/story';
import { createIllustratedCover } from './demo/coverArt';
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

/**
 * Without an image provider a live story gets a NEUTRAL illustrated cover
 * (it must not show an unrelated world). Example stories bring their own scene.
 */
export function sceneFor(story: GeneratedStory, req: StoryRequest): CoverScene {
  if (story.scene) return story.scene;
  // Live stories do not all get the same generic cover. Derive a small,
  // privacy-safe illustration theme from the AI's cover prompt/title. This is
  // local and instant; a configured image provider can still replace it later.
  const hint = `${story.title} ${story.coverPrompt}`.toLowerCase();
  const base = {
    mood: req.storyMood === 'surprise' ? 'magical' as const : req.storyMood,
    seed: hashString(`${story.title}|${story.coverPrompt}`),
  };
  if (/tasse|cup|mug|thé|tee|kaffee|coffee|chocolat/.test(hint)) return { ...base, setting: 'forest', creature: 'otter', subject: 'cup' };
  if (/bagger|excavat|digger|baustell|chantier/.test(hint)) return { ...base, setting: 'forest', creature: 'otter', subject: 'digger' };
  if (/katze|cat|chat|kater/.test(hint)) return { ...base, setting: 'forest', creature: 'otter', subject: 'cat' };
  if (/krokodil|crocodile/.test(hint)) return { ...base, setting: 'forest', creature: 'otter', subject: 'crocodile' };
  if (/freizeitpark|theme park|parc d.attractions|achterbahn|roller.?coaster/.test(hint)) return { ...base, setting: 'forest', creature: 'otter', subject: 'park' };
  if (/auto|car|voiture|porsche|truck|camion|bus|train|zug|véhicule/.test(hint)) return { ...base, setting: 'forest', creature: 'otter', subject: 'vehicle' };
  if (/robot|android|machine/.test(hint)) return { ...base, setting: 'space', creature: 'dino', subject: 'robot' };
  if (/schloss|castle|château|prinz|princess|princesse|ritter|knight/.test(hint)) return { ...base, setting: 'forest', creature: 'dragon', subject: 'castle' };
  if (/weltraum|space|planet|mars|mond|moon|rakete|rocket|astronaut/.test(hint)) return { ...base, setting: 'space', creature: /dino/.test(hint) ? 'dino' : 'dragon' };
  if (/meer|ocean|océan|unterwasser|underwater|poisson|fish/.test(hint)) return { ...base, setting: 'ocean', creature: 'otter' };
  if (/drache|dragon/.test(hint)) return { ...base, setting: 'forest', creature: 'dragon' };
  if (/dino|dinosaur/.test(hint)) return { ...base, setting: 'forest', creature: 'dino' };
  return { ...base, setting: 'forest', creature: 'otter', subject: 'abstract' };

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
