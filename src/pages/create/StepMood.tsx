import { useI18n } from '../../i18n/i18n';
import { useStore } from '../../store/AppStore';
import { MOODS } from '../../config/catalog';
import { MoodGlyph } from './MoodGlyph';
import { useRovingRadio } from './StepChild';
import { stagger } from '../../utils/style';

export function StepMood() {
  const { t } = useI18n();
  const { draft, updateDraft } = useStore();
  const radio = useRovingRadio(MOODS, draft.mood, (mood) => updateDraft({ mood }));

  return (
    <div className="step">
      <h2 className="step__title" tabIndex={-1} id="mood-title">{t('create.mood.title')}</h2>
      <div className="moods" role="radiogroup" aria-labelledby="mood-title">
        {MOODS.map((mood, i) => (
          <button
            key={mood}
            ref={(el) => { radio.refs.current[i] = el; }}
            type="button"
            role="radio"
            aria-checked={draft.mood === mood}
            tabIndex={radio.tabIndexFor(mood, i)}
            className={`mood mood--${mood} enter`}
            style={stagger(i * 0.4)}
            onClick={() => updateDraft({ mood })}
            onKeyDown={(e) => radio.onKeyDown(e, i)}
          >
            <span className="mood__glyph"><MoodGlyph mood={mood} /></span>
            <span className="mood__label">{t(`moods.${mood}.label`)}</span>
            <span className="mood__desc">{t(`moods.${mood}.desc`)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
