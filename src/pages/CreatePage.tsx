import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/i18n';
import { useStore } from '../store/AppStore';
import { navigate } from '../store/router';
import { screenText } from '../services/safetyService';
import { LightCompanion } from '../components/LightCompanion';
import { Icon } from '../components/Icon';
import { StepChild } from './create/StepChild';
import { StepInterests } from './create/StepInterests';
import { StepMood } from './create/StepMood';
import { StepGuidance } from './create/StepGuidance';
import { SupportNotice } from './create/SupportNotice';

const STEPS = ['child', 'interests', 'mood', 'guidance'] as const;

export function CreatePage() {
  const { t } = useI18n();
  const { draft, updateDraft } = useStore();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [showError, setShowError] = useState(false);
  const [support, setSupport] = useState(false);
  const stepRef = useRef<HTMLDivElement>(null);

  const errorKey =
    step === 0 && !draft.age ? 'create.validation.age'
    : step === 1 && !draft.interests.length && !draft.interestsText.trim() ? 'create.validation.interests'
    : step === 2 && !draft.mood ? 'create.validation.mood'
    : null;

  useEffect(() => setShowError(false), [step, draft.age, draft.interests, draft.interestsText, draft.mood]);

  // move focus to the new step's heading for keyboard and screen-reader users
  useEffect(() => {
    if (step === 0 && direction === 'forward') return;
    stepRef.current?.querySelector<HTMLElement>('.step__title')?.focus({ preventScroll: true });
  }, [step, direction]);

  const go = (to: number) => {
    setDirection(to > step ? 'forward' : 'back');
    setStep(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const next = () => {
    if (errorKey) return setShowError(true);
    if (step < STEPS.length - 1) return go(step + 1);
    if (draft.guidanceTheme === 'custom' && screenText(draft.customGuidance) === 'support') return setSupport(true);
    if (draft.guidanceTheme === 'custom' && !draft.customGuidance.trim()) updateDraft({ guidanceTheme: undefined });
    navigate('/creating');
  };

  const back = () => (step > 0 ? go(step - 1) : navigate('/'));
  const isLast = step === STEPS.length - 1;
  const companionState = support ? 'paused' : 'listening';

  return (
    <div className="create" data-step={STEPS[step]}>
      <header className="create__bar">
        <button type="button" className="icon-btn" onClick={support ? () => setSupport(false) : back} aria-label={t('common.back')}>
          <Icon name="back" />
        </button>
        <ol className="steps" aria-label={t('create.progressLabel')}>
          {STEPS.map((s, i) => (
            <li key={s} className="steps__dot" data-state={i < step ? 'done' : i === step ? 'current' : 'todo'} aria-current={i === step ? 'step' : undefined}>
              <span className="visually-hidden">{t('create.stepOf', { current: i + 1, total: STEPS.length })}</span>
            </li>
          ))}
        </ol>
        <button type="button" className="icon-btn" onClick={() => navigate('/')} aria-label={t('common.close')}>
          <Icon name="close" />
        </button>
      </header>

      <div className="create__body">
        <aside className="create__companion">
          <LightCompanion state={companionState} size={92} gaze={{ x: 0.2, y: 0.5 }} decorative />
          <p className="create__count" aria-hidden="true">{t('create.stepOf', { current: step + 1, total: STEPS.length })}</p>
        </aside>
        <div className="create__content" ref={stepRef}>
          {support ? (
            <SupportNotice
              onEdit={() => setSupport(false)}
              onContinueWithout={() => {
                updateDraft({ guidanceTheme: undefined, customGuidance: '' });
                setSupport(false);
                navigate('/creating');
              }}
            />
          ) : (
            <div key={step} className={`step-transition step-transition--${direction}`}>
              {step === 0 && <StepChild onEnter={next} />}
              {step === 1 && <StepInterests />}
              {step === 2 && <StepMood />}
              {step === 3 && <StepGuidance />}
            </div>
          )}
        </div>
      </div>

      {!support && (
        <footer className="create__actions">
          <p className="create__error" role="alert">{showError && errorKey ? t(errorKey) : ''}</p>
          <button
            type="button"
            className={`btn btn--primary btn--large ${isLast ? 'btn--glow' : ''}`}
            aria-disabled={Boolean(errorKey)}
            onClick={next}
          >
            {isLast && <Icon name="sparkle" size={22} />}
            {isLast ? t('create.submit') : t('common.next')}
          </button>
        </footer>
      )}
    </div>
  );
}
