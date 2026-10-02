import { safety, principles } from './config.mjs';

const normalize = (t) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss');

const terms = Object.entries(safety.support)
  .filter(([k]) => !k.startsWith('$'))
  .flatMap(([, list]) => list)
  .map(normalize);
const pattern = terms.length
  ? new RegExp(`(^|[^a-z0-9])(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'i')
  : null;

/** Same screen as the app (defence in depth). */
export function needsSupport(...texts) {
  return Boolean(pattern) && texts.some((t) => t && pattern.test(normalize(String(t))));
}

/** Returns phrases from the forbidden list that appear in a generated story. */
export function lintStory(text, language) {
  const list = principles.forbiddenPhrasing[language] ?? principles.forbiddenPhrasing.en ?? [];
  const lower = text.toLowerCase();
  return list.filter((p) => lower.includes(p.toLowerCase()));
}
