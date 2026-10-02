import { useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';

/**
 * Tiny hash router (no dependency). Hash URLs work on any static host and
 * give every saved story a stable deep link: #/story/<id>
 *
 * Navigation runs inside the View Transitions API where available, so pages
 * cross-fade and story covers morph between library and player.
 */
export type Route =
  | { name: 'landing' }
  | { name: 'create' }
  | { name: 'creating' }
  | { name: 'story'; id: string }
  | { name: 'library' }
  | { name: 'settings'; section?: string };

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, '') || '/';
  const parts = path.split('/').filter(Boolean);
  switch (parts[0]) {
    case 'create':
      return { name: 'create' };
    case 'creating':
      return { name: 'creating' };
    case 'story':
      return parts[1] ? { name: 'story', id: decodeURIComponent(parts[1]) } : { name: 'library' };
    case 'library':
      return { name: 'library' };
    case 'settings':
      return { name: 'settings', section: parts[1] };
    default:
      return { name: 'landing' };
  }
}

let current: Route = parseRoute(typeof window !== 'undefined' ? window.location.hash : '');
const listeners = new Set<() => void>();

function setRoute(route: Route) {
  current = route;
  listeners.forEach((l) => l());
}

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => transition(() => setRoute(parseRoute(window.location.hash))));
}

type DocWithVT = Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };

function transition(update: () => void) {
  const doc = document as DocWithVT;
  if (doc.startViewTransition && document.visibilityState === 'visible') {
    doc.startViewTransition(() => flushSync(update));
  } else {
    update();
  }
}

export function navigate(path: string, opts: { replace?: boolean } = {}) {
  const hash = `#${path}`;
  if (window.location.hash === hash) return;
  if (opts.replace) history.replaceState(null, '', hash);
  else history.pushState(null, '', hash);
  transition(() => setRoute(parseRoute(hash)));
  window.scrollTo({ top: 0 });
}

export function useRoute(): Route {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
  );
}
