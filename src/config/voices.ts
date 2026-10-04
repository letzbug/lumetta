import type { VoiceId } from '../types/story';

/**
 * Storyteller voices. The id is what the app stores and sends to the server.
 * Provider-specific voice ids are mapped on the SERVER (see .env / server/providers/tts.mjs),
 * so voices can change without touching the app.
 *
 * `browser` contains hints for the device-voice demo fallback only.
 */
export interface VoiceConfig {
  id: VoiceId;
  labelKey: string;
  descriptionKey: string;
  browser: { pitch: number; rateFactor: number; preferGender: 'female' | 'male' | 'any' };
}

export const VOICES: VoiceConfig[] = [
  { id: 'warm-female', labelKey: 'voices.warmFemale', descriptionKey: 'voices.warmFemaleDesc', browser: { pitch: 1.05, rateFactor: 1, preferGender: 'female' } },
  { id: 'warm-male', labelKey: 'voices.warmMale', descriptionKey: 'voices.warmMaleDesc', browser: { pitch: 0.92, rateFactor: 0.98, preferGender: 'male' } },
  { id: 'neutral', labelKey: 'voices.neutral', descriptionKey: 'voices.neutralDesc', browser: { pitch: 1, rateFactor: 0.98, preferGender: 'female' } },
];

/** Name fragments of common system voices, used to guess voice character in the demo fallback. */
export const BROWSER_VOICE_HINTS = {
  female: ['anna', 'petra', 'helena', 'marlene', 'vicki', 'katja', 'hedda', 'amelie', 'amélie', 'audrey', 'aurelie', 'aurélie', 'marie', 'julie', 'hortense', 'denise', 'virginie', 'samantha', 'karen', 'moira', 'serena', 'kate', 'susan', 'hazel', 'libby', 'sonia', 'female', 'woman'],
  male: ['markus', 'yannick', 'hans', 'stefan', 'conrad', 'killian', 'thomas', 'daniel', 'nicolas', 'paul', 'henri', 'claude', 'george', 'arthur', 'oliver', 'ryan', 'male', 'man'],
  /** Higher quality voices usually carry one of these markers. */
  quality: ['natural', 'neural', 'premium', 'enhanced', 'online', 'google'],
};
