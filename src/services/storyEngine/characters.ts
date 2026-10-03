import type { LlmProvider } from './provider';
import { requestBlock } from './prompts';
import { validateCharacters, type Architecture, type CharacterSheet, type EngineRequest } from './schemas';

/** Stage 5 – characters as people (or cats, or crocodiles), not plot functions. */
export function buildCharacters(req: EngineRequest, arch: Architecture, provider: LlmProvider, feedback?: string[]): Promise<CharacterSheet[]> {
  const user = JSON.stringify(
    { request: JSON.parse(requestBlock(req)), architecture: arch, revisionNotes: feedback?.length ? feedback : undefined },
    null,
    2,
  );
  return provider.generateStructured('characters', user, validateCharacters);
}
