import type { LanguageCode } from '../types/story';

/**
 * Language registry. Adding or enabling a language happens HERE only.
 *
 * Luxembourgish (lb) is fully wired into the architecture (types, locale file,
 * story language, voice mapping) but disabled until a high-quality narration
 * voice is available. Browser speech synthesis is explicitly NOT allowed for it.
 */
export interface LanguageConfig {
  code: LanguageCode;
  bcp47: string;
  nativeName: string;
  uiEnabled: boolean;
  storyEnabled: boolean;
  /** Is the device voice good enough to be used as a demo fallback? */
  browserTtsAllowed: boolean;
  comingSoon?: boolean;
  /** Locale used when a translation key is missing. */
  fallback?: LanguageCode;
}

export const LANGUAGES: Record<LanguageCode, LanguageConfig> = {
  de: { code: 'de', bcp47: 'de-DE', nativeName: 'Deutsch', uiEnabled: true, storyEnabled: true, browserTtsAllowed: true, fallback: 'en' },
  fr: { code: 'fr', bcp47: 'fr-FR', nativeName: 'Français', uiEnabled: true, storyEnabled: true, browserTtsAllowed: true, fallback: 'en' },
  en: { code: 'en', bcp47: 'en-GB', nativeName: 'English', uiEnabled: true, storyEnabled: true, browserTtsAllowed: true },
  lb: { code: 'lb', bcp47: 'lb-LU', nativeName: 'Lëtzebuergesch', uiEnabled: false, storyEnabled: false, browserTtsAllowed: false, comingSoon: true, fallback: 'de' },
};

export const ALL_LANGUAGES = Object.values(LANGUAGES);
export const UI_LANGUAGES = ALL_LANGUAGES.filter((l) => l.uiEnabled);
export const STORY_LANGUAGES = ALL_LANGUAGES.filter((l) => l.storyEnabled);

export function detectInitialLanguage(): LanguageCode {
  const candidates = typeof navigator !== 'undefined' ? navigator.languages ?? [navigator.language] : [];
  for (const c of candidates) {
    const code = c.slice(0, 2).toLowerCase() as LanguageCode;
    if (LANGUAGES[code]?.uiEnabled) return code;
  }
  return 'de';
}
