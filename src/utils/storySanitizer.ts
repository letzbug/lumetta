import type { LanguageCode, Story } from '../types/story';
import { LANGUAGES } from '../config/languages';
import { splitParagraphs } from './text';

/**
 * Stories saved by earlier versions (or damaged storage) must never crash
 * startup. Invalid entries are skipped; missing optional fields get defaults.
 */
export function sanitizeStory(raw: unknown): Story | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Partial<Story> & Record<string, unknown>;
  if (typeof s.id !== 'string' || typeof s.title !== 'string') return null;
  const paragraphs = Array.isArray(s.paragraphs) && s.paragraphs.every((p) => typeof p === 'string') && s.paragraphs.length
    ? s.paragraphs
    : typeof s.story === 'string' ? splitParagraphs(s.story) : [];
  if (!paragraphs.length) return null;
  const language: LanguageCode = s.language && s.language in LANGUAGES ? s.language : 'de';
  const cover = s.cover && typeof s.cover === 'object' && typeof s.cover.src === 'string'
    ? { ...s.cover, palette: s.cover.palette ?? { deep: '#22325C', mid: '#3A4C7F', glow: '#FFC56E' } }
    : { kind: 'illustration' as const, src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 4"><rect width="3" height="4" fill="#22325C"/></svg>'), palette: { deep: '#22325C', mid: '#3A4C7F', glow: '#FFC56E' } };
  return {
    ...(s as Story),
    paragraphs,
    story: typeof s.story === 'string' ? s.story : paragraphs.join('\n\n'),
    language,
    age: typeof s.age === 'number' ? s.age : 6,
    estimatedDuration: typeof s.estimatedDuration === 'number' && s.estimatedDuration > 0 ? s.estimatedDuration : 210,
    createdAt: typeof s.createdAt === 'string' ? s.createdAt : new Date(0).toISOString(),
    cover,
    voiceId: s.voiceId ?? 'warm-female',
    favorite: Boolean(s.favorite),
    saved: true,
    externalTriggerId: typeof s.externalTriggerId === 'string' ? s.externalTriggerId : null,
    interests: Array.isArray(s.interests) ? s.interests : [],
    summary: typeof s.summary === 'string' ? s.summary : '',
  };
}

export function sanitizeStories(list: unknown): Story[] {
  return Array.isArray(list) ? list.map(sanitizeStory).filter((x): x is Story => Boolean(x)) : [];
}
