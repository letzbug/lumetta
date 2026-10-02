import type { GuidanceThemeId, InterestId, StoryMood } from '../types/story';
import principles from './guidance/principles.json';

/** Suggestion chips shown in the "What do they love?" step. Labels live in locales (interests.*). */
export const INTERESTS: InterestId[] = [
  'dinosaurs', 'space', 'animals', 'magic', 'ocean', 'adventure',
  'nature', 'science', 'music', 'dragons', 'friendship', 'vehicles',
];

export const MOODS: StoryMood[] = ['adventure', 'funny', 'calm', 'magical', 'discovery', 'bedtime', 'surprise'];

export type GuidanceFamily = 'contact' | 'courage' | 'mistakes' | 'together';

export interface GuidanceTheme {
  id: Exclude<GuidanceThemeId, 'custom'>;
  family: GuidanceFamily;
  storyApproach: string;
}

export const GUIDANCE = principles as unknown as {
  version: string;
  corePrinciples: string[];
  narrativeTechniques: string[];
  forbiddenPhrasing: Record<string, string[]>;
  themes: GuidanceTheme[];
  customGuidance: { maxLength: number; instructions: string };
};

export const GUIDANCE_THEMES = GUIDANCE.themes;

export function familyForTheme(id?: GuidanceThemeId): GuidanceFamily | undefined {
  if (!id || id === 'custom') return undefined;
  return GUIDANCE_THEMES.find((t) => t.id === id)?.family;
}
