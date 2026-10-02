import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useI18n } from '../i18n/i18n';
import { useStore } from '../store/AppStore';
import { navigate } from '../store/router';
import { useNarration } from '../hooks/useNarration';
import { LANGUAGES } from '../config/languages';
import { LightCompanion, type CompanionState } from '../components/LightCompanion';
import { StoryCover } from '../components/StoryCover';
import { Icon } from '../components/Icon';
import type { Story } from '../types/story';
import type { Segment } from '../utils/text';

export const AUTOPLAY_KEY = 'lumetta.autoplay';

export function PlayerPage({ id }: { id: string }) {
  const { t } = useI18n();
  const { findStory, libraryReady } = useStore();
  const story = findStory(id);

  if (!story && !libraryReady) {
    return (
      <div className="player player--empty">
        <LightCompanion state="thinking" size={120} />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="player player--empty">
        <LightCompanion state="paused" size={120} />
        <h1 className="player__title">{t('player.notFoundTitle')}</h1>
        <p className="player__for">{t('player.notFoundBody')}</p>
        <div className="player__empty-actions">
          <button className="btn btn--primary" onClick={() => navigate('/create')}>{t('player.newStory')}</button>
          <button className="btn btn--ghost-light" onClick={() => navigate('/library')}>{t('player.toLibrary')}</button>
        </div>
      </div>
    );
  }

  return <Player story={story} key={story.id} />;
}

function Player({ story }: { story: Story }) {
  const { t, formatTime } = useI18n();
  const { settings, saveStory, toggleFavorite, showToast, updateSettings } = useStore();
  const { engine, state } = useNarration(story, story.voiceId ?? settings.voiceId);
  const [readAlong, setReadAlong] = useState(settings.readAlong);
  const [celebrate, setCelebrate] = useState(false);
  const [askLeave, setAskLeave] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLSpanElement>(null);
  const lastUserScroll = useRef(0);

  // the atmosphere breathes with the narration (CSS variable, no re-render)
  useEffect(() => {
    if (!engine) return;
    return engine.onLevel((level) => pageRef.current?.style.setProperty('--level', level.toFixed(3)));
  }, [engine]);

  // "Play" from the library starts right away
  useEffect(() => {
    if (!engine) return;
    if (sessionStorage.getItem(AUTOPLAY_KEY) === story.id) {
      sessionStorage.removeItem(AUTOPLAY_KEY);
      engine.play();
    }
  }, [engine, story.id]);

  // keep the spoken sentence in view, unless the reader is scrolling themselves
  useEffect(() => {
    const mark = () => (lastUserScroll.current = Date.now());
    window.addEventListener('wheel', mark, { passive: true });
    window.addEventListener('touchmove', mark, { passive: true });
    return () => {
      window.removeEventListener('wheel', mark);
      window.removeEventListener('touchmove', mark);
    };
  }, []);

  useEffect(() => {
    if (state.status !== 'playing' || !readAlong) return;
    const el = activeRef.current;
    if (!el || Date.now() - lastUserScroll.current < 4000) return;
    const r = el.getBoundingClientRect();
    if (r.top < 90 || r.bottom > window.innerHeight - 120) {
      const reduced = document.documentElement.dataset.motion === 'reduced';
      el.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
    }
  }, [state.segmentIndex, state.status, readAlong]);

  const levelSource = useMemo(() => (engine ? engine.onLevel.bind(engine) : undefined), [engine]);

  const paragraphs = useMemo(() => {
    const groups: Segment[][] = [];
    for (const seg of engine?.segments ?? []) (groups[seg.paragraph] ??= []).push(seg);
    return groups;
  }, [engine]);

  const playing = state.status === 'playing';
  const companion: CompanionState = celebrate
    ? 'success'
    : state.status === 'loading' ? 'thinking'
    : playing ? 'speaking'
    : state.status === 'paused' ? 'paused'
    : state.status === 'ended' ? 'ready'
    : 'idle';

  const primary = () => {
    if (!engine) return;
    if (playing) engine.pause();
    else if (state.status === 'paused') engine.resume();
    else if (state.status === 'ended') engine.restart();
    else engine.play();
  };
  const primaryLabel = playing ? t('player.pause') : state.status === 'paused' ? t('player.resume') : t('player.play');

  const save = async () => {
    if (story.saved) return;
    await saveStory(story);
    setCelebrate(true);
    showToast(t('player.savedToast'));
    window.setTimeout(() => setCelebrate(false), 1600);
  };

  const back = () => {
    if (story.saved) return navigate('/library');
    setAskLeave(true);
  };

  const toggleReadAlong = () => {
    setReadAlong((v) => !v);
    updateSettings({ readAlong: !readAlong });
  };

  const ratio = state.duration ? Math.min(1, state.currentTime / state.duration) : 0;
  const minutes = Math.max(1, Math.round(story.estimatedDuration / 60));
  const modeNote =
    state.mode === 'silent' ? t('player.silent')
    : state.mode === 'device' ? t('player.devicevoice')
    : state.status === 'loading' ? t('player.loading')
    : '';

  const style = {
    '--deep': story.cover.palette.deep,
    '--mid': story.cover.palette.mid,
    '--glow': story.cover.palette.glow,
  } as CSSProperties;

  return (
    <div className={`player ${readAlong ? 'player--reading' : ''}`} ref={pageRef} style={style} data-status={state.status}>
      <div className="player__atmos" aria-hidden="true" />

      <header className="player__bar">
        <button className="icon-btn icon-btn--light" onClick={back} aria-label={t('common.back')}>
          <Icon name="back" />
        </button>
        <div className="player__bar-actions">
          <button
            className="icon-btn icon-btn--light"
            onClick={() => toggleFavorite(story)}
            aria-pressed={story.favorite}
            aria-label={story.favorite ? t('player.unfavorite') : t('player.favorite')}
            data-active={story.favorite}
          >
            <Icon name={story.favorite ? 'heartFilled' : 'heart'} />
          </button>
          <button className={`btn btn--small ${story.saved ? 'btn--saved' : 'btn--light'}`} onClick={save} aria-disabled={story.saved}>
            <Icon name={story.saved ? 'saved' : 'save'} size={20} />
            {story.saved ? t('player.saved') : t('player.save')}
          </button>
        </div>
      </header>

      <div className="player__grid">
        <section className="player__stage" aria-labelledby="story-title">
          <div className={`player__cover ${celebrate ? 'player__cover--tucked' : ''}`}>
            <StoryCover story={story} size="large" showTitle={false} morph />
            <div className="player__companion">
              <LightCompanion state={companion} size={84} levelSource={levelSource} />
            </div>
          </div>

          <h1 className="player__title" id="story-title">{story.title}</h1>
          {story.childName && <p className="player__for">{t('player.forName', { name: story.childName })}</p>}
          <ul className="pills" aria-label={story.summary}>
            <li className="pill">{t('common.years', { n: story.age })}</li>
            <li className="pill"><Icon name="clock" size={15} />{t('common.minutes', { n: minutes })}</li>
            <li className="pill">{LANGUAGES[story.language].nativeName}</li>
          </ul>

          <div className="player__controls">
            <button className="icon-btn icon-btn--light icon-btn--large" onClick={() => engine?.restart()} aria-label={t('player.restart')} disabled={!engine}>
              <Icon name="restart" />
            </button>
            <button className="play-btn" onClick={primary} aria-label={primaryLabel} disabled={!engine || state.status === 'error'} data-playing={playing}>
              <Icon name={playing ? 'pause' : 'play'} size={34} />
            </button>
            <button
              className="icon-btn icon-btn--light icon-btn--large"
              onClick={toggleReadAlong}
              aria-pressed={readAlong}
              aria-label={readAlong ? t('player.hideText') : t('player.readAlong')}
              data-active={readAlong}
            >
              <Icon name="text" />
            </button>
          </div>

          <div className="progress">
            <input
              type="range"
              min={0}
              max={1000}
              step={1}
              value={Math.round(ratio * 1000)}
              onChange={(e) => engine?.seekToRatio(Number(e.target.value) / 1000)}
              aria-label={t('player.progress')}
              aria-valuetext={t('player.timeOf', { current: formatTime(state.currentTime), total: formatTime(state.duration) })}
              style={{ '--p': `${ratio * 100}%` } as CSSProperties}
              disabled={!engine}
            />
            <div className="progress__times" aria-hidden="true">
              <span>{formatTime(state.currentTime)}</span>
              <span>{formatTime(state.duration || story.estimatedDuration)}</span>
            </div>
          </div>
          {modeNote && <p className="player__mode">{modeNote}</p>}
        </section>

        {readAlong && (
          <section className="book" aria-label={t('player.readAlong')}>
            <p className="book__hint">{t('player.jumpHint')}</p>
            {paragraphs.map((segs, pi) => (
              <p key={pi} className="book__para" data-current={segs.some((s) => s.index === state.segmentIndex) && state.status !== 'idle'}>
                {segs.map((seg) => {
                  const active = seg.index === state.segmentIndex && state.status !== 'idle';
                  return (
                    <span
                      key={seg.index}
                      ref={active ? activeRef : undefined}
                      className="seg"
                      data-active={active}
                      data-read={seg.index < state.segmentIndex}
                      onClick={() => engine?.seekToSegment(seg.index)}
                    >
                      {seg.text}{' '}
                    </span>
                  );
                })}
              </p>
            ))}
          </section>
        )}
      </div>

      {askLeave && (
        <div className="sheet-backdrop" onClick={() => setAskLeave(false)}>
          <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="leave-title" onClick={(e) => e.stopPropagation()}>
            <p className="sheet__title" id="leave-title">{t('player.unsavedLeave')}</p>
            <div className="sheet__actions">
              <button
                className="btn btn--primary"
                autoFocus
                onClick={async () => {
                  await saveStory(story);
                  showToast(t('player.savedToast'));
                  navigate('/library');
                }}
              >
                <Icon name="save" size={20} />
                {t('player.save')}
              </button>
              <button className="btn btn--secondary" onClick={() => navigate('/')}>{t('player.leave')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
