import type { LlmProvider } from './provider';
import { requestBlock } from './prompts';
import { validateSelection, type Candidate, type EngineRequest, type Interpretation, type Selection } from './schemas';

/** Stage 3 – pick the strongest candidate. Reasoning is for development only. */
export function select(req: EngineRequest, interpretation: Interpretation, candidates: Candidate[], provider: LlmProvider): Promise<Selection> {
  const user = JSON.stringify(
    { request: JSON.parse(requestBlock(req)), interpretation, candidates, recentFingerprints: req.recentFingerprints?.slice(0, 6) ?? [] },
    null,
    2,
  );
  return provider.generateStructured('selector', user, (raw) => validateSelection(raw, candidates));
}
