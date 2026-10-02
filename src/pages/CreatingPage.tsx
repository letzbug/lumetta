import { useEffect, useMemo, useState } from 'react';
import { translate, useI18n } from '../i18n/i18n';
import { useStore, type Draft } from '../store/AppStore';
import { navigate } from '../store/router';
import { createStory, SafetyStop } from '../services/storyService';
import { logTechnical } from '../services/apiClient';
import { LightCompanion, type CompanionState } from '../components/LightCompanion';
import { DuskScene } from '../components/DuskScene';
import type { GenerationStage, StoryRequest } from '../types/story';

const STAGES: GenerationStage[] = ['finding', 'characters', 'magic', 'ready'];

export function buildRequest(draft: Draft): StoryRequest {
  return {
    childAge: draft.age ?? 6,
    childName: draft.name.trim() || undefined,
    gender: draft.gender,
    language: draft.storyLanguage,
    interests: draft.interests,
    // labels in the STORY language, not the interface language
    interestLabels: draft.interests.map((id) => translate(draft.storyLanguage, `interests.${id}`)),
    interestsText: draft.interestsText.trim() || undefined,
    storyMood: draft.mood ?? 'surprise',
    guidanceTheme: draft.guidanceTheme,
    customGuidance: draft.guidanceTheme === 'custom' ? draft.customGuidance.trim() || undefined : undefined,
    voiceId: draft.voiceId,
  };
}

export function CreatingPage() {
  const { t } = useI18n();
  const { draft, setCurrent } = useStore();
  const [stage, setStage] = useState<GenerationStage>('finding');
  const [status, setStatus] = useState<'running' | 'ready' | 'error'>('running');
  const [attempt, setAttempt] = useState(0);
  const [storyId, setStoryId] = useState<string | null>(null);

  const valid = Boolean(draft.age && (draft.interests.length || draft.interestsText.trim()) && draft.mood);
  const request = useMemo(() => buildRequest(draft), [draft]);

  useEffect(() => {
    if (!valid) {
      navigate('/create', { replace: true });
      return;
    }
    let active = true;
    let timer: number | undefined;
    setStatus('running');
    setStage('finding');
    createStory(request, { onStage: (s) => active && setStage(s) })
      .then((story) => {
        if (!active) return;
        setCurrent(story);
        setStoryId(story.id);
        setStatus('ready');
        timer = window.setTimeout(() => navigate(`/story/${story.id}`, { replace: true }), 1900);
      })
      .catch((err) => {
        if (!active) return;
        if (err instanceof SafetyStop) return navigate('/create', { replace: true });
        logTechnical('generation', err);
        setStatus('error');
      });
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
    // re-run only on explicit retry
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const companion: CompanionState = status === 'error' ? 'paused' : status === 'ready' ? 'ready' : 'thinking';
  const forWhom = draft.name.trim() ? t('generating.forName', { name: draft.name.trim() }) : t('generating.forChild', { age: draft.age ?? '' });
  const stageIndex = STAGES.indexOf(stage);

  return (
    <section className="creating" aria-busy={status === 'running'}>
      <DuskScene variant="low" />
      <div className="creating__inner">
        <p className="creating__for">{forWhom}</p>
        <LightCompanion state={companion} size={190} />

        {status !== 'error' ? (
          <>
            <p className="creating__stage" key={stage} aria-live="polite">
              {t(`generating.stages.${stage}`)}
            </p>
            <ol className="creating__path" aria-hidden="true">
              {STAGES.map((s, i) => (
                <li key={s} data-done={i <= stageIndex} />
              ))}
            </ol>
            {status === 'ready' && storyId && (
              <button className="btn btn--primary btn--large enter" onClick={() => navigate(`/story/${storyId}`, { replace: true })}>
                {t('generating.listen')}
              </button>
            )}
          </>
        ) : (
          <div className="creating__error" role="alert">
            <p className="creating__stage">{t('generating.errorTitle')}</p>
            <p className="creating__hint">{t('generating.errorBody')}</p>
            <div className="creating__actions">
              <button className="btn btn--primary btn--large" onClick={() => setAttempt((a) => a + 1)}>
                {t('generating.retry')}
              </button>
              <button className="btn btn--ghost-light" onClick={() => navigate('/create')}>
                {t('generating.editWishes')}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
