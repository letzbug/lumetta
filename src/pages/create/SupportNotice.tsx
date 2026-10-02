import { useEffect, useRef } from 'react';
import { useI18n } from '../../i18n/i18n';
import { getSupportResources } from '../../services/safetyService';
import { Icon } from '../../components/Icon';

/**
 * Shown instead of continuing when the parent's own words suggest a situation
 * that needs real, human support. Calm, non-judgemental, never alarming.
 */
export function SupportNotice({ onContinueWithout, onEdit }: { onContinueWithout: () => void; onEdit: () => void }) {
  const { t } = useI18n();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);

  return (
    <div className="support" role="region" aria-labelledby="support-title">
      <h2 className="support__title" id="support-title" tabIndex={-1} ref={heading}>
        {t('support.title')}
      </h2>
      <p className="support__body">{t('support.body')}</p>
      <ul className="support__list">
        {getSupportResources().map((r) => (
          <li key={r.id} className="support__item">
            <div>
              <strong>{t(`support.resources.${r.id}.label`)}</strong>
              <span>{t(`support.resources.${r.id}.desc`)}</span>
            </div>
            {r.phone && (
              <a className="btn btn--small btn--outline" href={`tel:${r.phone.replace(/\s/g, '')}`}>
                <Icon name="phone" size={18} />
                {t('support.call', { phone: r.phone })}
              </a>
            )}
          </li>
        ))}
      </ul>
      <p className="note">{t('support.verifyNote')}</p>
      <div className="support__actions">
        <button type="button" className="btn btn--secondary" onClick={onEdit}>{t('support.edit')}</button>
        <button type="button" className="btn btn--primary" onClick={onContinueWithout}>{t('support.continueWithout')}</button>
      </div>
    </div>
  );
}
