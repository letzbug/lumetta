import type { LlmProvider } from './provider';
import { requestBlock } from './prompts';
import { validateReview, type Critique, type EngineRequest, type Interpretation, type StoryFingerprint, type WrittenStory } from './schemas';

/** Efficient mode – Critic + Fingerprint in one small structured call. */
export function review(
  req: EngineRequest,
  interpretation: Interpretation,
  story: WrittenStory,
  provider: LlmProvider,
): Promise<{ critique: Critique; fingerprint: StoryFingerprint | null }> {
  const user = JSON.stringify(
    {
      request: JSON.parse(requestBlock(req)),
      nonNegotiables: interpretation.nonNegotiables,
      specialRules: interpretation.specialRules,
      guidanceRequested: Boolean(req.guidance?.length || req.customGuidance),
      story: { title: story.title, text: story.text },
    },
    null,
    2,
  );
  return provider.generateStructured('review', user, validateReview);
}
