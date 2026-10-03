import type { LlmProvider } from './provider';
import { requestBlock } from './prompts';
import { validateArchitecture, type Architecture, type Candidate, type EngineRequest, type Interpretation } from './schemas';

/** Stage 4 – a flexible story concept; no universal structure is forced. */
export function architect(
  req: EngineRequest,
  interpretation: Interpretation,
  candidate: Candidate,
  provider: LlmProvider,
  feedback?: string[],
): Promise<Architecture> {
  const user = JSON.stringify(
    {
      request: JSON.parse(requestBlock(req)),
      nonNegotiables: interpretation.nonNegotiables,
      specialRules: interpretation.specialRules,
      constraints: interpretation.constraints,
      chosenCandidate: candidate,
      revisionNotes: feedback?.length ? feedback : undefined,
    },
    null,
    2,
  );
  return provider.generateStructured('architect', user, validateArchitecture);
}
