// ─────────────────────────────────────────────────────────────
// Story Engine V2 – orchestrator.
//
//  Input → Interpreter → Imagination → Selector → Architect →
//  Characters → (Guidance) → Writer → Critic → targeted rewrite →
//  Final story → Fingerprint
//
// A failed critique sends the story back to the EARLIEST stage that
// caused the weakness. Changing adjectives is not a rewrite.
// ─────────────────────────────────────────────────────────────
import { estimateDurationSeconds } from '../../config/ageProfiles';
import { createId } from '../../utils/id';
import { interpret } from './interpreter';
import { imagine } from './imagination';
import { select } from './selector';
import { architect } from './architect';
import { buildCharacters } from './characters';
import { NO_GUIDANCE, planGuidance } from './guidance';
import { write } from './writer';
import { localCritique, mergeCritiques, modelCritique } from './critic';
import { createFingerprint } from './fingerprint';
import { HERO_TOKEN } from './prompts';
import type { LlmProvider } from './provider';
import type { Architecture, Candidate, CharacterSheet, Critique, EngineRequest, EngineResult, GuidancePlan, Interpretation, WrittenStory } from './schemas';

export type EngineStage =
  | 'interpreting'
  | 'imagining'
  | 'selecting'
  | 'architecting'
  | 'characters'
  | 'guidance'
  | 'writing'
  | 'critiquing'
  | 'rewriting'
  | 'done';

export interface EngineHooks {
  onStage?: (stage: EngineStage) => void;
  /** full revision cycles after the first draft (default 2) */
  maxRevisions?: number;
  /** keep internal reasoning in the result (development only) */
  debug?: boolean;
}

export async function runStoryEngine(req: EngineRequest, provider: LlmProvider, hooks: EngineHooks = {}): Promise<EngineResult> {
  const stage = hooks.onStage ?? (() => {});
  const maxRevisions = hooks.maxRevisions ?? 2;
  const critiques: Critique[] = [];

  stage('interpreting');
  const interpretation: Interpretation = await interpret(req, provider);

  const rejected: string[] = [];
  let candidates: Candidate[] = [];
  let chosen!: Candidate;
  let selectionReason = '';

  const conceive = async () => {
    stage('imagining');
    candidates = (await imagine(req, interpretation, provider, { avoid: rejected })).candidates;
    stage('selecting');
    const sel = await select(req, interpretation, candidates, provider);
    chosen = candidates.find((c) => c.id === sel.candidateId) ?? candidates[0];
    selectionReason = sel.reasoning;
  };
  await conceive();

  let arch!: Architecture;
  let characters: CharacterSheet[] = [];
  let guidance: GuidancePlan = NO_GUIDANCE;
  let story!: WrittenStory;
  let from: 'concept' | 'architect' | 'character' | 'guidance' | 'writer' = 'architect';
  let feedback: string[] = [];
  let revisions = 0;

  for (let round = 0; round <= maxRevisions; round++) {
    if (round > 0) {
      stage('rewriting');
      revisions++;
    }
    if (from === 'concept') {
      rejected.push(chosen.premise);
      await conceive();
    }
    if (from === 'concept' || from === 'architect') {
      stage('architecting');
      arch = await architect(req, interpretation, chosen, provider, from === 'architect' ? feedback : undefined);
    }
    if (from === 'concept' || from === 'architect' || from === 'character') {
      stage('characters');
      characters = await buildCharacters(req, arch, provider, from === 'character' ? feedback : undefined);
    }
    if (from !== 'writer') {
      if (req.guidance?.length || req.customGuidance) stage('guidance');
      guidance = await planGuidance(req, arch, characters, provider, from === 'guidance' ? feedback : undefined);
    }
    stage('writing');
    story = await write(req, { interpretation, architecture: arch, characters, guidance }, provider, round > 0 ? feedback : undefined);

    stage('critiquing');
    const local = localCritique(story, { req, interpretation, heroToken: req.child?.firstName ? HERO_TOKEN : undefined });
    let critique = local;
    try {
      critique = mergeCritiques(local, await modelCritique(req, interpretation, story, provider));
    } catch {
      // a failing critic must not cost the child a good story – local checks still apply
    }
    critiques.push(critique);
    if (critique.status === 'pass') break;
    from = critique.problemLayer ?? 'writer';
    feedback = [...critique.issues.map((i) => `Issue: ${i}`), ...critique.rewriteInstructions];
  }

  const fingerprint = await createFingerprint(story, chosen, arch, provider);
  stage('done');

  return {
    story: {
      id: createId(),
      title: story.title,
      language: req.language,
      age: req.child?.age ?? 6,
      text: story.text,
      estimatedDurationSeconds: estimateDurationSeconds(story.text, req.child?.age ?? 6),
    },
    metadata: {
      storyForm: arch.storyForm,
      mood: chosen.storyEnergy,
      summary: story.summary,
      coverPrompt: story.coverScene || chosen.premise,
      fingerprint,
      scenes: story.scenes,
      engine: 'v2-remote',
    },
    debug: hooks.debug
      ? { interpretation, candidates, selection: { candidateId: chosen.id, reasoning: selectionReason }, architecture: arch, characters, guidance, critiques, revisions }
      : { critiques, revisions },
  };
}
