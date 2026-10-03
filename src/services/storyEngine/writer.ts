import type { LlmProvider } from './provider';
import { HERO_TOKEN, LANGUAGE_NAMES, requestBlock, targetWords } from './prompts';
import { validateWrittenStory, type Architecture, type CharacterSheet, type EngineRequest, type GuidancePlan, type Interpretation, type WrittenStory } from './schemas';

/** Stage 7 – the age- and language-aware writer. Writes for the ear. */
export function write(
  req: EngineRequest,
  ctx: { interpretation: Interpretation; architecture: Architecture; characters: CharacterSheet[]; guidance: GuidancePlan },
  provider: LlmProvider,
  feedback?: string[],
): Promise<WrittenStory> {
  const age = req.child?.age ?? 6;
  const [min, max] = targetWords(age, req.desiredDurationMinutes);
  const user = JSON.stringify(
    {
      writeIn: LANGUAGE_NAMES[req.language],
      length: `${min}–${max} words, about 3–4 minutes read aloud`,
      request: JSON.parse(requestBlock(req)),
      nonNegotiables: ctx.interpretation.nonNegotiables,
      specialRules: ctx.interpretation.specialRules,
      architecture: ctx.architecture,
      characters: ctx.characters,
      guidance: ctx.guidance.included
        ? { theme: ctx.guidance.theme, opportunity: ctx.guidance.opportunity, notes: ctx.guidance.integrationNotes, rule: 'experienced indirectly, never explained' }
        : 'none',
      protagonistToken: req.child?.firstName ? HERO_TOKEN : undefined,
      revisionInstructions: feedback?.length ? feedback : undefined,
    },
    null,
    2,
  );
  return provider.generateStructured('writer', user, validateWrittenStory);
}
