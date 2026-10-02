import { useState } from 'react';
import { useI18n } from '../i18n/i18n';
import { useStore } from '../store/AppStore';
import { navigate } from '../store/router';
import { AppChrome } from '../components/AppChrome';
import { StoryCover } from '../components/StoryCover';
import { LightCompanion } from '../components/LightCompanion';
import { Icon } from '../components/Icon';
import { LANGUAGES } from '../config/languages';
import { AUTOPLAY_KEY } from './PlayerPage';
import { stagger } from '../utils/style';
import type { Story } from '../types/story';

export function LibraryPage() {
  const { t, tp } = useI18n();
  const { library, libraryReady, resetDraft } = useStore();
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const items = filter === 'favorites' ? library.filter((s) => s.favorite) : library;

  const create = () => {
    resetDraft();
    navigate('/create');
  };

  return (
    <AppChrome>
      <section className="library">
        <header className="library__head">
          <div>
            <h1 className="page-title">{t('library.title')}</h1>
            {library.length > 0 && <p className="page-sub">{tp('library.count', library.length)}</p>}
          </div>
          {library.length > 0 && (
            <div className="segmented" role="group" aria-label={t('library.title')}>
              <button aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>{t('library.filterAll')}</button>
              <button aria-pressed={filter === 'favorites'} onClick={() => setFilter('favorites')}>
                <Icon name="heart" size={16} />
                {t('library.filterFavorites')}
              </button>
            </div>
          )}
        </header>

        {libraryReady && library.length === 0 && (
          <div className="empty">
            <LightCompanion state="idle" size={130} />
            <h2 className="empty__title">{t('library.emptyTitle')}</h2>
            <p className="empty__body">{t('library.emptyBody')}</p>
            <button className="btn btn--primary btn--large btn--glow" onClick={create}>
              <Icon name="sparkle" size={22} />
              {t('landing.cta')}
            </button>
          </div>
        )}

        {library.length > 0 && items.length === 0 && <p className="library__none">{t('library.noFavorites')}</p>}

        <ul className="shelf">
          {items.map((story, i) => (
            <li key={story.id} className="enter" style={stagger(Math.min(i, 8) * 0.5)}>
              <BookCard story={story} />
            </li>
          ))}
        </ul>
      </section>
    </AppChrome>
  );
}

function BookCard({ story }: { story: Story }) {
  const { t, formatDate } = useI18n();
  const { toggleFavorite, deleteStory, showToast } = useStore();
  const [confirming, setConfirming] = useState(false);
  const open = () => navigate(`/story/${story.id}`);
  const play = () => {
    sessionStorage.setItem(AUTOPLAY_KEY, story.id);
    open();
  };

  return (
    <article className="book-card" data-confirming={confirming}>
      <div className="book-card__cover">
        <button className="book-card__open" onClick={open} aria-label={story.title}>
          <StoryCover story={story} morph />
        </button>
        <button className="book-card__play" onClick={play} aria-label={t('library.play', { title: story.title })}>
          <Icon name="play" size={24} />
        </button>
      </div>
      <div className="book-card__info">
        {story.childName && <p className="book-card__for">{t('player.forName', { name: story.childName })}</p>}
        <ul className="pills pills--quiet">
          <li className="pill"><Icon name="clock" size={14} />{t('common.minutes', { n: Math.max(1, Math.round(story.estimatedDuration / 60)) })}</li>
          <li className="pill">{LANGUAGES[story.language].nativeName}</li>
        </ul>
        <p className="book-card__date">
          <time dateTime={story.createdAt}>{formatDate(story.createdAt)}</time>
        </p>
      </div>
      <div className="book-card__actions">
        <button
          className="icon-btn"
          onClick={() => toggleFavorite(story)}
          aria-pressed={story.favorite}
          aria-label={t('library.favorite')}
          data-active={story.favorite}
        >
          <Icon name={story.favorite ? 'heartFilled' : 'heart'} size={22} />
        </button>
        <button className="icon-btn" onClick={() => setConfirming(true)} aria-label={t('library.delete')}>
          <Icon name="trash" size={22} />
        </button>
      </div>
      {confirming && (
        <div className="book-card__confirm" role="alertdialog" aria-label={t('library.confirmDelete', { title: story.title })}>
          <p>{t('library.confirmDelete', { title: story.title })}</p>
          <div>
            <button className="btn btn--small btn--secondary" autoFocus onClick={() => setConfirming(false)}>
              {t('library.confirmNo')}
            </button>
            <button
              className="btn btn--small btn--danger"
              onClick={async () => {
                await deleteStory(story.id);
                showToast(t('library.deleted'));
              }}
            >
              {t('library.confirmYes')}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
