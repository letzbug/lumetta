import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/i18n';
import { useStore, type MotionPreference } from '../store/AppStore';
import { AppChrome } from '../components/AppChrome';
import { Icon } from '../components/Icon';
import { ALL_LANGUAGES } from '../config/languages';
import { APP_CONFIG } from '../config/app';
import { GUIDANCE } from '../config/catalog';
import { getBackendStatus } from '../services/apiClient';
import type { LanguageCode } from '../types/story';

const PRIVACY_POINTS = ['account', 'minimal', 'local', 'names', 'control'] as const;
const MOTION: MotionPreference[] = ['system', 'reduced', 'full'];
const MOTION_KEYS: Record<MotionPreference, string> = { system: 'settings.motionSystem', reduced: 'settings.motionReduced', full: 'settings.motionFull' };

export function SettingsPage({ section }: { section?: string }) {
  const { t } = useI18n();
  const { settings, updateSettings, library, deleteAll, showToast } = useStore();
  const [live, setLive] = useState(false);
  const [confirmAll, setConfirmAll] = useState(false);

  useEffect(() => {
    getBackendStatus().then((s) => setLive(s.story));
  }, []);

  useEffect(() => {
    if (section) document.getElementById(section)?.scrollIntoView({ block: 'start' });
  }, [section]);

  return (
    <AppChrome>
      <section className="settings">
        <h1 className="page-title">{t('settings.title')}</h1>

        <div className="settings__group">
          <h2 className="settings__label" id="ui-lang">{t('settings.uiLanguage')}</h2>
          <div className="segmented segmented--wrap" role="radiogroup" aria-labelledby="ui-lang">
            {ALL_LANGUAGES.map((l) => (
              <button
                key={l.code}
                role="radio"
                aria-checked={settings.uiLanguage === l.code}
                disabled={!l.uiEnabled}
                onClick={() => updateSettings({ uiLanguage: l.code })}
                lang={l.code}
              >
                {l.comingSoon ? t('languages.lbSoon') : l.nativeName}
              </button>
            ))}
          </div>
        </div>

        <div className="settings__group">
          <h2 className="settings__label" id="story-lang">{t('settings.storyLanguage')}</h2>
          <div className="segmented segmented--wrap" role="radiogroup" aria-labelledby="story-lang">
            {ALL_LANGUAGES.map((l) => (
              <button
                key={l.code}
                role="radio"
                aria-checked={settings.storyLanguage === l.code}
                disabled={!l.storyEnabled}
                onClick={() => updateSettings({ storyLanguage: l.code as LanguageCode })}
                lang={l.code}
              >
                {l.comingSoon ? t('languages.lbSoon') : l.nativeName}
              </button>
            ))}
          </div>
        </div>

        <div className="settings__group">
          <h2 className="settings__label" id="motion">{t('settings.motion')}</h2>
          <div className="segmented" role="radiogroup" aria-labelledby="motion">
            {MOTION.map((m) => (
              <button key={m} role="radio" aria-checked={settings.motion === m} onClick={() => updateSettings({ motion: m })}>
                {t(MOTION_KEYS[m])}
              </button>
            ))}
          </div>
          <p className="field__hint">{t('settings.motionHint')}</p>
        </div>

        <div className="settings__group settings__privacy" id="privacy">
          <h2 className="section-title">{t('privacy.title')}</h2>
          <ul className="privacy-list">
            {PRIVACY_POINTS.map((p) => (
              <li key={p}>
                <strong>{t(`privacy.points.${p}.title`)}</strong>
                <span>{t(`privacy.points.${p}.body`)}</span>
              </li>
            ))}
          </ul>
          <p className="privacy-mode">
            <Icon name="lock" size={18} />
            {live ? t('privacy.modeLive') : t('privacy.modeDemo')}
          </p>
          {library.length > 0 &&
            (confirmAll ? (
              <div className="inline-confirm" role="alertdialog" aria-label={t('privacy.deleteAllConfirm')}>
                <p>{t('privacy.deleteAllConfirm')}</p>
                <button className="btn btn--small btn--secondary" autoFocus onClick={() => setConfirmAll(false)}>{t('library.confirmNo')}</button>
                <button
                  className="btn btn--small btn--danger"
                  onClick={async () => {
                    await deleteAll();
                    setConfirmAll(false);
                    showToast(t('privacy.deletedAll'));
                  }}
                >
                  {t('library.confirmYes')}
                </button>
              </div>
            ) : (
              <button className="btn btn--outline btn--small" onClick={() => setConfirmAll(true)}>
                <Icon name="trash" size={18} />
                {t('privacy.deleteAll')}
              </button>
            ))}
        </div>

        <div className="settings__group" id="about">
          <h2 className="section-title">{t('settings.about')}</h2>
          <p className="about">{t('about.body')}</p>
          <p className="field__hint">
            {t('about.version', { v: APP_CONFIG.version })}
            <br />
            {t('about.guidance', { v: GUIDANCE.version })}
          </p>
          <p className="about-credits">
            {t('about.idea')}<br />
            {t('about.builtBy')} <a href="https://frankandcameron.com" target="_blank" rel="noreferrer">Frank &amp; Cameron</a>
          </p>
        </div>
      </section>
    </AppChrome>
  );
}
