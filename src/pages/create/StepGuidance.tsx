import { useI18n } from '../../i18n/i18n';
import { useStore } from '../../store/AppStore';
import { GUIDANCE, GUIDANCE_THEMES } from '../../config/catalog';
import { ALL_LANGUAGES } from '../../config/languages';
import type { GuidanceThemeId, LanguageCode } from '../../types/story';

export function StepGuidance() {
  const { t } = useI18n();
  const { draft, updateDraft } = useStore();
  const select = (id: GuidanceThemeId | undefined) => updateDraft({ guidanceTheme: draft.guidanceTheme === id ? undefined : id });

  return (
    <div className="step">
      <h2 className="step__title" tabIndex={-1} id="guidance-title">
        {t('create.guidance.title')} <span className="badge badge--soft">{t('common.optional')}</span>
      </h2>
      <p className="step__sub">{t('create.guidance.sub')}</p>

      <div className="chips chips--guidance" role="radiogroup" aria-labelledby="guidance-title">
        <button type="button" role="radio" aria-checked={!draft.guidanceTheme} className="chip chip--quiet" onClick={() => updateDraft({ guidanceTheme: undefined })}>
          {t('create.guidance.none')}
        </button>
        {GUIDANCE_THEMES.map((theme) => (
          <button key={theme.id} type="button" role="radio" aria-checked={draft.guidanceTheme === theme.id} className="chip" onClick={() => select(theme.id)}>
            {t(`guidanceThemes.${theme.id}`)}
          </button>
        ))}
        <button type="button" role="radio" aria-checked={draft.guidanceTheme === 'custom'} className="chip" onClick={() => select('custom')}>
          {t('create.guidance.custom')}
        </button>
      </div>

      {draft.guidanceTheme === 'custom' && (
        <div className="field field--reveal">
          <label className="field__label" htmlFor="custom-guidance">{t('create.guidance.customLabel')}</label>
          <textarea
            id="custom-guidance"
            className="input"
            rows={3}
            maxLength={GUIDANCE.customGuidance.maxLength}
            placeholder={t('create.guidance.customPlaceholder')}
            value={draft.customGuidance}
            onChange={(e) => updateDraft({ customGuidance: e.target.value })}
            aria-describedby="custom-guidance-hint"
            autoFocus
          />
          <p className="field__hint" id="custom-guidance-hint">{t('create.guidance.customHint')}</p>
        </div>
      )}

      <p className="note">{t('create.guidance.note')}</p>

      <div className="story-options">
        <div className="field field--inline">
          <label className="field__label" htmlFor="story-language">{t('create.guidance.storyLanguage')}</label>
          <div className="select">
            <select id="story-language" value={draft.storyLanguage} onChange={(e) => updateDraft({ storyLanguage: e.target.value as LanguageCode })}>
              {ALL_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} disabled={!l.storyEnabled}>
                  {l.comingSoon ? t('languages.lbSoon') : l.nativeName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
