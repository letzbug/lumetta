import type { LlmProvider } from './provider';
import { requestBlock } from './prompts';
import { validateInterpretation, type EngineRequest, type Interpretation } from './schemas';

/** Stage 1 – understand the request. Never writes story text. */
export function interpret(req: EngineRequest, provider: LlmProvider): Promise<Interpretation> {
  return provider.generateStructured('interpreter', requestBlock(req), validateInterpretation);
}
