import { useI18n } from '../../i18n/i18n';
import { useStore } from '../../store/AppStore';
import { INTERESTS } from '../../config/catalog';
import { stagger } from '../../utils/style';

export function StepInterests() {
  const { t } = useI18n();
  const { draft, updateDraft } = useStore();

  const toggle = (id: (typeof INTERESTS)[number]) => {
    const has = draft.interests.includes(id);
    updateDraft({ interests: has ? draft.interests.filter((x) => x !== id) : [...draft.interests, id] });
  };

  return (
    <div className="step">
      <h2 className="step__title" tabIndex={-1}>{t('create.interests.title')}</h2>
      <p className="step__sub">{t('create.interests.sub')}</p>

      <div className="field">
        <label className="visually-hidden" htmlFor="interests">{t('create.interests.inputLabel')}</label>
        <textarea
          id="interests"
          className="input input--large"
          rows={3}
          maxLength={300}
          placeholder={t('create.interests.placeholder')}
          value={draft.interestsText}
          onChange={(e) => updateDraft({ interestsText: e.target.value })}
        />
      </div>

      <div className="field">
        <span className="field__label" id="chips-label">{t('create.interests.chipsLabel')}</span>
        <div className="chips chips--interests" role="group" aria-labelledby="chips-label">
          {INTERESTS.map((id, i) => (
            <button
              key={id}
              type="button"
              className="chip chip--toggle enter"
              style={stagger(i * 0.35)}
              aria-pressed={draft.interests.includes(id)}
              onClick={() => toggle(id)}
            >
              <span className="chip__spark" aria-hidden="true" />
              {t(`interests.${id}`)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
