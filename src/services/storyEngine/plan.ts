import type { LlmProvider } from './provider';
import { requestBlock } from './prompts';
import { GUIDANCE_THEMES } from '../../config/catalog';
import { ENGINE_CONFIG } from './engineConfig';
import { tooSimilarPairs } from './imagination';
import { validatePlan, type EngineRequest, type StoryPlan } from './schemas';

/**
 * Efficient mode – stages 1–6 (Interpreter, Imagination, Selector, Architect,
 * Characters, Guidance) as separate sections of ONE structured call.
 * The local diversity check can trigger one re-plan.
 */
export async function plan(
  req: EngineRequest,
  provider: LlmProvider,
  opts: { feedback?: string[]; avoidPremises?: string[] } = {},
): Promise<StoryPlan> {
  const guidance = (req.guidance ?? []).map((id) => {
    const t = GUIDANCE_THEMES.find((x) => x.id === id);
    return t ? { theme: t.id, approach: t.storyApproach } : { theme: id };
  });
  const base = {
    request: JSON.parse(requestBlock(req)),
    numberOfCandidates: ENGINE_CONFIG.candidates,
    requestedGuidance: guidance.length || req.customGuidance ? { themes: guidance, parentDescription: req.customGuidance || undefined } : 'none',
    recentFingerprints: req.recentFingerprints?.slice(0, 6) ?? [],
    rejectedPremises: opts.avoidPremises?.length ? opts.avoidPremises : undefined,
    revisionNotes: opts.feedback?.length ? opts.feedback : undefined,
  };
  let result = await provider.generateStructured('plan', JSON.stringify(base, null, 2), validatePlan);
  const similar = tooSimilarPairs(result.candidates);
  if (!result.diversityCheck.genuinelyDifferent || similar.length) {
    const retry = {
      ...base,
      diversityFeedback: `Candidates were the same story in different costumes (${similar.map((p) => p.join(' ≈ ')).join(', ') || result.diversityCheck.note}). Produce genuinely different situations, mechanisms, tones and scales.`,
    };
    result = await provider.generateStructured('plan', JSON.stringify(retry, null, 2), validatePlan);
  }
  return result;
}
