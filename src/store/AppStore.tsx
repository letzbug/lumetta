import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Gender, GuidanceThemeId, InterestId, LanguageCode, Story, StoryMood, VoiceId } from '../types/story';
import { detectInitialLanguage, LANGUAGES } from '../config/languages';
import { getRepository, loadSettings, saveSettings } from '../services/storageService';
import { clearAudioCache } from '../services/tts/audioCache';
import { logTechnical } from '../services/apiClient';
import { sanitizeStories } from '../utils/storySanitizer';

export type MotionPreference = 'system' | 'reduced' | 'full';

export interface Settings {
  uiLanguage: LanguageCode;
  storyLanguage: LanguageCode;
  voiceId: VoiceId;
  motion: MotionPreference;
  readAlong: boolean;
}

/** The parent's story wishes while moving through the creation steps. Kept in memory only. */
export interface Draft {
  age?: number;
  name: string;
  gender?: Gender;
  interests: InterestId[];
  interestsText: string;
  mood?: StoryMood;
  guidanceTheme?: GuidanceThemeId;
  customGuidance: string;
  storyLanguage: LanguageCode;
  voiceId: VoiceId;
}

interface Toast {
  id: number;
  text: string;
}

interface Store {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  draft: Draft;
  updateDraft: (patch: Partial<Draft>) => void;
  resetDraft: () => void;
  library: Story[];
  libraryReady: boolean;
  current: Story | null;
  setCurrent: (story: Story | null) => void;
  findStory: (id: string) => Story | undefined;
  saveStory: (story: Story) => Promise<Story>;
  toggleFavorite: (story: Story) => Promise<Story>;
  deleteStory: (id: string) => Promise<void>;
  deleteAll: () => Promise<void>;
  toast: Toast | null;
  showToast: (text: string) => void;
}

const StoreContext = createContext<Store | null>(null);

function initialSettings(): Settings {
  const lang = detectInitialLanguage();
  const s = loadSettings<Settings>({ uiLanguage: lang, storyLanguage: lang, voiceId: 'warm-female', motion: 'system', readAlong: true });
  // never start in a language that is not enabled (e.g. lb before launch)
  if (!LANGUAGES[s.uiLanguage]?.uiEnabled) s.uiLanguage = lang;
  if (!LANGUAGES[s.storyLanguage]?.storyEnabled) s.storyLanguage = s.uiLanguage;
  return s;
}

const emptyDraft = (s: Settings): Draft => ({
  name: '',
  interests: [],
  interestsText: '',
  customGuidance: '',
  storyLanguage: s.storyLanguage,
  voiceId: s.voiceId,
});

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(settings));
  const [library, setLibrary] = useState<Story[]>([]);
  const [libraryReady, setLibraryReady] = useState(false);
  const [current, setCurrent] = useState<Story | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<number>(undefined);

  useEffect(() => {
    getRepository()
      .then((repo) => repo.list())
      .then((stories) => setLibrary(sanitizeStories(stories)))
      .catch((err) => logTechnical('library', err))
      .finally(() => setLibraryReady(true));
  }, []);

  useEffect(() => saveSettings(settings), [settings]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...patch }));
    // the next story follows the new defaults
    setDraft((d) => ({
      ...d,
      ...(patch.storyLanguage ? { storyLanguage: patch.storyLanguage } : {}),
      ...(patch.voiceId ? { voiceId: patch.voiceId } : {}),
    }));
  }, []);

  const updateDraft = useCallback((patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch })), []);
  const resetDraft = useCallback(() => setDraft(emptyDraft(settings)), [settings]);

  const showToast = useCallback((text: string) => {
    window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text });
    toastTimer.current = window.setTimeout(() => setToast(null), 2800);
  }, []);

  const persist = useCallback(async (story: Story) => {
    const repo = await getRepository();
    await repo.put(story);
    setLibrary((list) => [story, ...list.filter((s) => s.id !== story.id)].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    setCurrent((c) => (c && c.id === story.id ? story : c));
    return story;
  }, []);

  const saveStory = useCallback((story: Story) => persist({ ...story, saved: true }), [persist]);

  const toggleFavorite = useCallback(
    async (story: Story) => {
      const next = { ...story, favorite: !story.favorite };
      if (story.saved) return persist(next);
      setCurrent((c) => (c && c.id === story.id ? next : c));
      return next;
    },
    [persist],
  );

  const deleteStory = useCallback(async (id: string) => {
    const repo = await getRepository();
    await repo.remove(id);
    setLibrary((list) => list.filter((s) => s.id !== id));
    setCurrent((c) => (c && c.id === id ? { ...c, saved: false } : c));
  }, []);

  const deleteAll = useCallback(async () => {
    const repo = await getRepository();
    await repo.clear();
    await clearAudioCache();
    setLibrary([]);
    setCurrent((c) => (c ? { ...c, saved: false } : c));
  }, []);

  const findStory = useCallback(
    (id: string) => (current?.id === id ? current : undefined) ?? library.find((s) => s.id === id),
    [current, library],
  );

  const value = useMemo<Store>(
    () => ({
      settings, updateSettings, draft, updateDraft, resetDraft, library, libraryReady, current, setCurrent,
      findStory, saveStory, toggleFavorite, deleteStory, deleteAll, toast, showToast,
    }),
    [settings, updateSettings, draft, updateDraft, resetDraft, library, libraryReady, current, findStory, saveStory, toggleFavorite, deleteStory, deleteAll, toast, showToast],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside AppStoreProvider');
  return ctx;
}
