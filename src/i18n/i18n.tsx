import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import type { LanguageCode } from '../types/story';
import { LANGUAGES } from '../config/languages';
import de from '../locales/de.json';
import fr from '../locales/fr.json';
import en from '../locales/en.json';
import lb from '../locales/lb.json';

type Dict = Record<string, unknown>;
const DICTIONARIES: Record<LanguageCode, Dict> = { de, fr, en, lb };

export type TFunction = (key: string, vars?: Record<string, string | number>) => string;

function lookup(dict: Dict, key: string): string | undefined {
  let node: unknown = dict;
  for (const part of key.split('.')) {
    if (node && typeof node === 'object' && part in (node as Dict)) node = (node as Dict)[part];
    else return undefined;
  }
  return typeof node === 'string' ? node : undefined;
}

function interpolate(text: string, vars?: Record<string, string | number>) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

/** Resolve a key with the language fallback chain (e.g. lb → de → en). */
export function translate(lang: LanguageCode, key: string, vars?: Record<string, string | number>): string {
  const seen = new Set<LanguageCode>();
  let current: LanguageCode | undefined = lang;
  while (current && !seen.has(current)) {
    seen.add(current);
    const hit = lookup(DICTIONARIES[current], key);
    if (hit !== undefined) return interpolate(hit, vars);
    current = LANGUAGES[current].fallback ?? (current !== 'en' ? 'en' : undefined);
  }
  if (import.meta.env?.DEV) console.warn(`[i18n] missing key: ${key}`);
  return key;
}

interface I18nValue {
  lang: LanguageCode;
  t: TFunction;
  /** Plural helper: uses `<key>_one` / `<key>_other`. */
  tp: (key: string, n: number, vars?: Record<string, string | number>) => string;
  formatDate: (iso: string) => string;
  formatTime: (seconds: number) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ lang, children }: { lang: LanguageCode; children: ReactNode }) {
  const t = useCallback<TFunction>((key, vars) => translate(lang, key, vars), [lang]);
  const value = useMemo<I18nValue>(() => {
    const locale = LANGUAGES[lang].bcp47;
    return {
      lang,
      t,
      tp: (key, n, vars) => {
        const rule = new Intl.PluralRules(locale).select(n) === 'one' ? 'one' : 'other';
        return t(`${key}_${rule}`, { n, ...vars });
      },
      formatDate: (iso) =>
        new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso)),
      formatTime: (s) => {
        const sec = Math.max(0, Math.round(s));
        return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
      },
    };
  }, [lang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
