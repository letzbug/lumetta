import { useRef, type KeyboardEvent } from 'react';
import { useI18n } from '../../i18n/i18n';
import { useStore } from '../../store/AppStore';
import { APP_CONFIG } from '../../config/app';
import type { Gender } from '../../types/story';

const AGES = Array.from({ length: APP_CONFIG.ages.max - APP_CONFIG.ages.min + 1 }, (_, i) => APP_CONFIG.ages.min + i);
const GENDERS: Gender[] = ['girl', 'boy', 'neutral'];

/** Arrow-key navigation for custom radio groups (WAI-ARIA radio pattern). */
export function useRovingRadio<T>(values: T[], selected: T | undefined, onSelect: (v: T) => void) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + values.length) % values.length;
    onSelect(values[next]);
    refs.current[next]?.focus();
  };
  const tabIndexFor = (v: T, i: number) => (selected === undefined ? (i === 0 ? 0 : -1) : v === selected ? 0 : -1);
  return { refs, onKeyDown, tabIndexFor };
}

export function StepChild({ onEnter }: { onEnter: () => void }) {
  const { t } = useI18n();
  const { draft, updateDraft } = useStore();
  const ages = useRovingRadio(AGES, draft.age, (age) => updateDraft({ age }));
  const genders = useRovingRadio(GENDERS, draft.gender, (gender) => updateDraft({ gender }));

  return (
    <div className="step">
      <h2 className="step__title" tabIndex={-1}>{t('create.child.title')}</h2>

      <div className="field">
        <span className="field__label" id="age-label">{t('create.child.ageLabel')}</span>
        <div className="ages" role="radiogroup" aria-labelledby="age-label">
          {AGES.map((age, i) => (
            <button
              key={age}
              ref={(el) => { ages.refs.current[i] = el; }}
              type="button"
              role="radio"
              aria-checked={draft.age === age}
              aria-label={t('create.child.ageUnit', { n: age })}
              tabIndex={ages.tabIndexFor(age, i)}
              className="age"
              onClick={() => updateDraft({ age })}
              onKeyDown={(e) => ages.onKeyDown(e, i)}
            >
              {age}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="child-name">
          {t('create.child.nameLabel')} <span className="badge">{t('common.optional')}</span>
        </label>
        <input
          id="child-name"
          className="input"
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCapitalize="words"
          spellCheck={false}
          maxLength={24}
          placeholder={t('create.child.namePlaceholder')}
          value={draft.name}
          onChange={(e) => updateDraft({ name: e.target.value.replace(/[^\p{L}\p{M}' -]/gu, '') })}
          onKeyDown={(e) => e.key === 'Enter' && onEnter()}
          aria-describedby="child-name-hint"
        />
        <p className="field__hint" id="child-name-hint">{t('create.child.nameHint')}</p>
      </div>

      <div className="field">
        <span className="field__label" id="gender-label">
          {t('create.child.genderLabel')} <span className="badge">{t('common.optional')}</span>
        </span>
        <div className="chips" role="radiogroup" aria-labelledby="gender-label">
          {GENDERS.map((g, i) => (
            <button
              key={g}
              ref={(el) => { genders.refs.current[i] = el; }}
              type="button"
              role="radio"
              aria-checked={draft.gender === g}
              tabIndex={genders.tabIndexFor(g, i)}
              className="chip"
              onClick={() => updateDraft({ gender: draft.gender === g ? undefined : g })}
              onKeyDown={(e) => genders.onKeyDown(e, i)}
            >
              {t(`create.child.gender.${g}`)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
