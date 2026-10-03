import { useEffect, useRef } from 'react';
import { useI18n } from '../../i18n/i18n';
import { listExamples } from '../../services/storyEngine/demo/demoEngine';
import { LANGUAGES } from '../../config/languages';

/**
 * Shown when no story provider is configured (e.g. GitHub Pages without an API).
 * Honest by design: the child's idea is NOT pushed into a template. The parent may
 * choose a clearly labelled, pre-written example story instead.
 */
export function DemoNotice({ idea, onPick, onEdit }: { idea: string; onPick: (id: string) => void; onEdit: () => void }) {
  const { t, lang } = useI18n();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);

  return (
    <div className="demo-notice" role="region" aria-labelledby="demo-title">
      <h2 className="demo-notice__title" id="demo-title" tabIndex={-1} ref={heading}>{t('demo.title')}</h2>
      {idea && <p className="demo-notice__idea">{t('demo.yourIdea', { idea })}</p>}
      <p className="demo-notice__body">{t('demo.body')}</p>
      <h3 className="demo-notice__sub">{t('demo.examplesTitle')}</h3>
      <p className="demo-notice__note">{t('demo.examplesNote')}</p>
      <ul className="demo-notice__list">
        {listExamples().map((ex) => (
          <li key={ex.id}>
            <button type="button" className="demo-example" onClick={() => onPick(ex.id)}>
              <span className="demo-example__title">{ex.title}</span>
              <span className="demo-example__meta">
                {ex.storyForm}
                {ex.language !== lang ? `, ${LANGUAGES[ex.language].nativeName}` : ''}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="demo-notice__note">{t('demo.connectHint')}</p>
      <button type="button" className="btn btn--ghost-light" onClick={onEdit}>{t('generating.editWishes')}</button>
    </div>
  );
}
