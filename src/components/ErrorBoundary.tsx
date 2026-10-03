import { Component, type ErrorInfo, type ReactNode } from 'react';
import { translate } from '../i18n/i18n';
import { detectInitialLanguage } from '../config/languages';

/**
 * Last line of defence: whatever goes wrong at runtime, families see a calm
 * Lumetta message with a way back – never a blank white page.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[lumetta] render error', error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    let lang = detectInitialLanguage();
    try {
      const saved = JSON.parse(localStorage.getItem('lumetta.settings.v1') ?? '{}');
      if (saved?.uiLanguage === 'de' || saved?.uiLanguage === 'fr' || saved?.uiLanguage === 'en') lang = saved.uiLanguage;
    } catch {
      /* ignore */
    }
    return (
      <div className="player player--empty" role="alert">
        <h1 className="player__title">{translate(lang, 'generating.errorTitle')}</h1>
        <p className="player__for">{translate(lang, 'generating.errorBody')}</p>
        <div className="player__empty-actions">
          <button
            className="btn btn--primary"
            onClick={() => {
              window.location.hash = '#/';
              window.location.reload();
            }}
          >
            {translate(lang, 'generating.retry')}
          </button>
        </div>
      </div>
    );
  }
}
