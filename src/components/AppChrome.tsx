import type { ReactNode } from 'react';
import { useI18n } from '../i18n/i18n';
import { navigate, useRoute } from '../store/router';
import { Icon, type IconName } from './Icon';

export function Wordmark({ onDark }: { onDark?: boolean }) {
  const { t } = useI18n();
  return (
    <a
      href="#/"
      className={`wordmark ${onDark ? 'wordmark--dark' : ''}`}
      onClick={(e) => {
        e.preventDefault();
        navigate('/');
      }}
    >
      <span className="wordmark__dot" aria-hidden="true" />
      {t('common.appName')}
    </a>
  );
}

const TABS: Array<{ path: string; route: string; icon: IconName; key: string }> = [
  { path: '/', route: 'landing', icon: 'home', key: 'nav.home' },
  { path: '/create', route: 'create', icon: 'plus', key: 'nav.create' },
  { path: '/library', route: 'library', icon: 'library', key: 'nav.library' },
  { path: '/settings', route: 'settings', icon: 'settings', key: 'nav.settings' },
];

/** Top bar on larger screens; a thumb-friendly tab bar at the bottom on phones. */
export function AppChrome({ children, dark }: { children: ReactNode; dark?: boolean }) {
  const { t } = useI18n();
  const route = useRoute();
  return (
    <div className={`chrome ${dark ? 'chrome--dark' : ''}`}>
      <header className="topbar">
        <Wordmark onDark={dark} />
        <nav className="topbar__nav" aria-label={t('nav.main')}>
          {TABS.slice(2).map((tab) => (
            <a
              key={tab.path}
              href={`#${tab.path}`}
              className="topbar__link"
              aria-current={route.name === tab.route ? 'page' : undefined}
              onClick={(e) => {
                e.preventDefault();
                navigate(tab.path);
              }}
            >
              {t(tab.key)}
            </a>
          ))}
          <a
            href="#/create"
            className="btn btn--small btn--primary"
            onClick={(e) => {
              e.preventDefault();
              navigate('/create');
            }}
          >
            {t('nav.create')}
          </a>
        </nav>
      </header>
      <main className="chrome__main">
        {children}
      </main>
      <nav className="tabbar" aria-label={t('nav.main')}>
        {TABS.map((tab) => (
          <a
            key={tab.path}
            href={`#${tab.path}`}
            className="tabbar__item"
            aria-current={route.name === tab.route ? 'page' : undefined}
            onClick={(e) => {
              e.preventDefault();
              navigate(tab.path);
            }}
          >
            <Icon name={tab.icon} size={22} />
            <span>{t(tab.key)}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
