import type { LlmProvider } from './provider';
import { GUIDANCE_THEMES } from '../../config/catalog';
import { validateGuidancePlan, type Architecture, type CharacterSheet, type EngineRequest, type GuidancePlan } from './schemas';

export const NO_GUIDANCE: GuidancePlan = { included: false };

/**
 * Stage 6 – optional Story Guidance. Runs AFTER the story concept exists,
 * so the theme can only be woven into a story that already works.
 */
export async function planGuidance(
  req: EngineRequest,
  arch: Architecture,
  characters: CharacterSheet[],
  provider: LlmProvider,
  feedback?: string[],
): Promise<GuidancePlan> {
  const themes = (req.guidance ?? []).filter(Boolean);
  if (!themes.length && !req.customGuidance) return NO_GUIDANCE;
  const described = themes.map((id) => {
    const t = GUIDANCE_THEMES.find((x) => x.id === id);
    return t ? { theme: t.id, approach: t.storyApproach } : { theme: id };
  });
  const user = JSON.stringify(
    {
      requestedThemes: described,
      parentDescription: req.customGuidance || undefined,
      storyConcept: arch,
      characters: characters.map((c) => ({ name: c.name, role: c.role, personality: c.personality })),
      revisionNotes: feedback?.length ? feedback : undefined,
    },
    null,
    2,
  );
  return provider.generateStructured('guidance', user, validateGuidancePlan);
}
