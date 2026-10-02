import { useEffect } from 'react';
import { I18nProvider } from './i18n/i18n';
import { AppStoreProvider, useStore } from './store/AppStore';
import { useRoute } from './store/router';
import { useMotionSetting } from './hooks/useMotion';
import { LANGUAGES } from './config/languages';
import { translate } from './i18n/i18n';
import { LandingPage } from './pages/LandingPage';
import { CreatePage } from './pages/CreatePage';
import { CreatingPage } from './pages/CreatingPage';
import { PlayerPage } from './pages/PlayerPage';
import { LibraryPage } from './pages/LibraryPage';
import { SettingsPage } from './pages/SettingsPage';
import { Toast } from './components/Toast';

function Shell() {
  const route = useRoute();
  const { settings } = useStore();
  useMotionSetting(settings.motion);

  useEffect(() => {
    document.documentElement.lang = LANGUAGES[settings.uiLanguage].bcp47;
  }, [settings.uiLanguage]);

  useEffect(() => {
    const dark = route.name === 'landing' || route.name === 'creating' || route.name === 'story';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#141E38' : '#F8EFE9');
    document.documentElement.dataset.surface = dark ? 'dusk' : 'dawn';
  }, [route.name]);

  let page;
  switch (route.name) {
    case 'create':
      page = <CreatePage />;
      break;
    case 'creating':
      page = <CreatingPage />;
      break;
    case 'story':
      page = <PlayerPage id={route.id} />;
      break;
    case 'library':
      page = <LibraryPage />;
      break;
    case 'settings':
      page = <SettingsPage section={route.section} />;
      break;
    default:
      page = <LandingPage />;
  }

  return (
    <I18nProvider lang={settings.uiLanguage}>
      <a className="skip-link" href="#main">{translate(settings.uiLanguage, 'a11y.skip')}</a>
      <div className="page" id="main" key={route.name === 'story' ? `story-${route.id}` : route.name}>
        {page}
      </div>
      <Toast />
    </I18nProvider>
  );
}

export default function App() {
  return (
    <AppStoreProvider>
      <Shell />
    </AppStoreProvider>
  );
}
