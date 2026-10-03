// ─────────────────────────────────────────────────────────────
// DEMO MODE – architecturally honest.
//
// Inventing a story from ANY idea needs a language model. Without a
// configured story provider Lumetta does NOT pretend: it never routes the
// child's request into a template. Instead the UI says so plainly and
// offers clearly labelled EXAMPLE stories (pre-written, not derived from
// the child's input). There is no runtime matching of requests to examples.
//
// The fixtures in ./fixtures.ts double as quality benchmarks for tests.
// ─────────────────────────────────────────────────────────────
import type { CoverScene } from '../../../types/story';
import { estimateDurationSeconds } from '../../../config/ageProfiles';
import { createId, hashString } from '../../../utils/id';
import { HERO_TOKEN } from '../prompts';
import type { EngineResult } from '../schemas';
import { FIXTURES, type DemoFixture } from './fixtures';

export interface ExampleInfo {
  id: string;
  title: string;
  storyForm: string;
  language: DemoFixture['language'];
  age: number;
}

/** Example stories shown in demo mode – the same list for every request. */
export function listExamples(): ExampleInfo[] {
  return FIXTURES.map((f) => ({ id: f.id, title: f.title, storyForm: f.storyForm, language: f.language, age: f.age }));
}

export interface ExampleResult extends EngineResult {
  cover: CoverScene;
}

/**
 * Builds an example story chosen EXPLICITLY by the user. The child's name may
 * be used as the hero (that is honest: the parent chose it), but the story is
 * labelled 'v2-demo-example' everywhere.
 */
export function buildExample(id: string, firstName?: string): ExampleResult {
  const f = FIXTURES.find((x) => x.id === id);
  if (!f) throw new Error(`unknown example ${id}`);
  const hero = firstName || f.defaultHero;
  const text = f.text.split(HERO_TOKEN).join(hero);
  const title = f.title.split(HERO_TOKEN).join(hero);
  return {
    story: { id: createId(), title, language: f.language, age: f.age, text, estimatedDurationSeconds: estimateDurationSeconds(text, f.age) },
    metadata: {
      storyForm: f.storyForm,
      mood: f.mood,
      summary: f.summary,
      coverPrompt: f.summary,
      fingerprint: f.fingerprint,
      engine: 'v2-demo-example',
    },
    cover: { ...f.cover, seed: hashString(f.id) },
  };
}
