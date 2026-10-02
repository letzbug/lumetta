import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/i18n';
import { useStore } from '../store/AppStore';
import { navigate } from '../store/router';
import { AppChrome } from '../components/AppChrome';
import { LightCompanion } from '../components/LightCompanion';
import { DuskScene } from '../components/DuskScene';
import { Icon } from '../components/Icon';
import { stagger } from '../utils/style';

export function LandingPage() {
  const { t } = useI18n();
  const { library, resetDraft } = useStore();
  const [gaze, setGaze] = useState({ x: 0, y: 0 });
  const stage = useRef<HTMLDivElement>(null);

  // the light quietly follows the pointer – a first moment of "someone is here"
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = stage.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      setGaze({
        x: Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth / 2))),
        y: Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight / 2))),
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  const start = () => {
    resetDraft();
    navigate('/create');
  };

  return (
    <AppChrome dark>
      <section className="landing">
        <DuskScene />
        <div className="landing__inner">
          <div className="landing__light" ref={stage}>
            <LightCompanion state="idle" size={168} gaze={gaze} />
          </div>
          <div className="landing__copy">
            <h1 className="landing__headline enter" style={stagger(1)}>
              {t('landing.headline')}
            </h1>
            <p className="landing__sub enter" style={stagger(2)}>
              {t('landing.sub')}
            </p>
            <div className="landing__actions enter" style={stagger(3)}>
              <button className="btn btn--primary btn--large btn--glow" onClick={start}>
                <Icon name="sparkle" size={22} />
                {t('landing.cta')}
              </button>
              {library.length > 0 && (
                <button className="btn btn--ghost-light" onClick={() => navigate('/library')}>
                  <Icon name="library" size={20} />
                  {t('landing.secondary')}
                </button>
              )}
            </div>
            <ul className="landing__promises enter" style={stagger(4)}>
              <li><Icon name="clock" size={18} />{t('landing.promise1')}</li>
              <li><Icon name="lock" size={18} />{t('landing.promise2')}</li>
              <li><Icon name="device" size={18} />{t('landing.promise3')}</li>
            </ul>
          </div>
        </div>
        <a
          className="landing__privacy"
          href="#/settings/privacy"
          onClick={(e) => {
            e.preventDefault();
            navigate('/settings/privacy');
          }}
        >
          {t('landing.privacyLink')}
        </a>
      </section>
    </AppChrome>
  );
}
