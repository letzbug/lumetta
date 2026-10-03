// ─────────────────────────────────────────────────────────────
// Demo mode for Story Engine V2 – no model, no network, no costs.
//
// 1. Benchmark fixtures: hand-written stories in different forms,
//    chosen by what the child actually asked for (DE).
// 2. Requests without a fitting fixture use the V1 on-device
//    template engine – explicitly marked 'v2-demo-template'.
//
// The child's request is never silently swapped for an unrelated
// fixture: a fixture is only used when its pattern matches.
// ─────────────────────────────────────────────────────────────
import type { CoverScene, StoryRequest } from '../../../types/story';
import { familyForTheme } from '../../../config/catalog';
import { estimateDurationSeconds } from '../../../config/ageProfiles';
import { generateDemoStory } from '../../demo/demoStoryEngine';
import { createId, hashString } from '../../../utils/id';
import { normalize } from '../../../utils/text';
import { localCritique } from '../critic';
import { HERO_TOKEN } from '../prompts';
import type { EngineHooks } from '../storyEngine';
import type { EngineRequest, EngineResult, GuidancePlan } from '../schemas';
import { FIXTURES, type DemoFixture } from './fixtures';

export function matchFixture(req: EngineRequest): DemoFixture | undefined {
  const text = normalize(`${req.request} ${(req.interests ?? []).join(' ')}`);
  return FIXTURES.find((f) => f.language === req.language && f.match.every((re) => re.test(text)));
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface DemoEngineResult extends EngineResult {
  cover: CoverScene;
}

export async function runDemoEngine(req: EngineRequest, legacy: StoryRequest, hooks: EngineHooks & { paceMs?: number } = {}): Promise<DemoEngineResult> {
  const stage = hooks.onStage ?? (() => {});
  const pace = hooks.paceMs ?? 1200;
  const fixture = matchFixture(req);
  const age = req.child?.age ?? 6;

  stage('interpreting');
  await wait(pace * 0.6);
  stage('imagining');
  await wait(pace * 0.6);
  stage('architecting');
  await wait(pace * 0.6);
  stage('writing');
  await wait(pace * 0.6);
  stage('critiquing');

  if (fixture) {
    // the child has a name → keep the token (restored on the device); otherwise the fixture's own hero
    const text = req.child?.firstName ? fixture.text : fixture.text.split(HERO_TOKEN).join(fixture.defaultHero);
    const title = req.child?.firstName ? fixture.title : fixture.title.split(HERO_TOKEN).join(fixture.defaultHero);
    const critique = localCritique({ text, title }, { req, interpretation: fixture.interpretation });
    if (critique.status !== 'pass' && import.meta.env?.DEV) console.info('[lumetta:demo-critic]', fixture.id, critique.issues);

    const families = (req.guidance ?? []).map((g) => familyForTheme(g as never)).filter(Boolean) as string[];
    const moment = families.map((f) => fixture.naturalGuidance[f as keyof DemoFixture['naturalGuidance']]).find(Boolean);
    const guidance: GuidancePlan = families.length
      ? moment
        ? { included: true, theme: req.guidance?.[0], opportunity: moment, integrationNotes: 'already part of the story – never explained' }
        : { included: false, theme: req.guidance?.[0], reducedReason: 'This demo story has no natural moment for the theme; story quality wins.' }
      : { included: false };

    stage('done');
    return {
      story: { id: createId(), title, language: req.language, age, text, estimatedDurationSeconds: estimateDurationSeconds(text, age) },
      metadata: {
        storyForm: fixture.storyForm,
        mood: fixture.mood,
        summary: fixture.summary,
        coverPrompt: fixture.candidates.find((c) => c.id === fixture.chosen)?.premise ?? fixture.summary,
        fingerprint: fixture.fingerprint,
        engine: 'v2-demo-fixture',
      },
      cover: { ...fixture.cover, seed: hashString(fixture.id) },
      debug: {
        interpretation: fixture.interpretation,
        candidates: fixture.candidates,
        selection: { candidateId: fixture.chosen, reasoning: `Benchmark fixture ${fixture.benchmark}` },
        guidance,
        critiques: [critique],
        revisions: 0,
      },
    };
  }

  // No fixture fits this request: V1 on-device template engine as an honest fallback.
  const legacyStory = generateDemoStory(legacy);
  stage('done');
  return {
    story: {
      id: createId(),
      title: legacyStory.title,
      language: legacyStory.language,
      age,
      text: legacyStory.story,
      estimatedDurationSeconds: legacyStory.estimatedDuration,
    },
    metadata: {
      storyForm: 'demo template',
      mood: [legacyStory.scene?.mood ?? 'adventure'],
      summary: legacyStory.summary,
      coverPrompt: legacyStory.coverPrompt,
      fingerprint: {
        genre: 'template adventure',
        scale: 'medium',
        settingType: legacyStory.scene?.setting ?? '',
        centralDevice: 'template arc',
        characterTypes: [legacyStory.scene?.creature ?? ''],
        structureType: 'template',
        endingStyle: 'return home',
        majorMotifs: [],
      },
      engine: 'v2-demo-template',
    },
    cover: legacyStory.scene ?? { setting: 'forest', creature: 'otter', mood: 'adventure', seed: 1 },
    debug: { critiques: [], revisions: 0 },
  };
}
