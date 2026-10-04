import type { LanguageCode, Story, VoiceId } from '../../types/story';
import { LANGUAGES } from '../../config/languages';
import { BROWSER_VOICE_HINTS, VOICES } from '../../config/voices';
import { ageBand } from '../../config/ageProfiles';
import { getBackendStatus, logTechnical, postForBlob } from '../apiClient';
import { segmentStory } from '../../utils/text';
import { BrowserSpeechEngine } from './browserSpeechEngine';
import { ReadAlongEngine } from './readAlongEngine';
import { RemoteAudioEngine } from './remoteAudioEngine';
import { getCachedAudio, putCachedAudio } from './audioCache';
import type { NarrationEngine } from './types';

/**
 * Narration service – picks the best available voice:
 *   1. studio voice from the server (TTS_PROVIDER configured)
 *   2. device voice (demo fallback, only for languages where it is allowed)
 *   3. silent read-along
 */
export async function createNarration(story: Story, voiceId: VoiceId): Promise<NarrationEngine> {
  const segments = segmentStory(story.paragraphs);
  const status = await getBackendStatus();
  const lang = LANGUAGES[story.language];
  const band = ageBand(story.age);

  if (status.tts) {
    const key = `${story.id}:${voiceId}`;
    return new RemoteAudioEngine(
      segments,
      story.estimatedDuration,
      async () => {
        const cached = await getCachedAudio(key);
        if (cached) return cached;
        const blob = await postForBlob('/tts', { text: story.voiceScript || story.story, language: story.language, voiceId, rate: band.ttsRate });
        void putCachedAudio(key, blob);
        return blob;
      },
      () => logTechnical('tts', 'studio voice unavailable'),
    );
  }

  if (lang.browserTtsAllowed && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const voice = await pickDeviceVoice(story.language, voiceId);
    if (voice) {
      const cfg = VOICES.find((v) => v.id === voiceId) ?? VOICES[0];
      const rate = band.ttsRate * cfg.browser.rateFactor;
      const words = story.story.split(/\s+/).length;
      const duration = Math.round((words / (165 * rate)) * 60);
      return new BrowserSpeechEngine(segments, duration, voice, lang.bcp47, rate, cfg.browser.pitch);
    }
  }

  return new ReadAlongEngine(segments, story.estimatedDuration);
}

/** Voices load asynchronously in most browsers. */
function loadVoices(timeoutMs = 1500): Promise<SpeechSynthesisVoice[]> {
  const synth = window.speechSynthesis;
  const now = synth.getVoices();
  if (now.length) return Promise.resolve(now);
  return new Promise((resolve) => {
    const done = () => resolve(synth.getVoices());
    synth.addEventListener('voiceschanged', done, { once: true });
    setTimeout(done, timeoutMs);
  });
}

export async function pickDeviceVoice(language: LanguageCode, voiceId: VoiceId): Promise<SpeechSynthesisVoice | undefined> {
  const voices = await loadVoices();
  const bcp = LANGUAGES[language].bcp47.toLowerCase();
  const short = bcp.slice(0, 2);
  const candidates = voices.filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith(short));
  if (!candidates.length) return undefined;
  const pref = VOICES.find((v) => v.id === voiceId)?.browser.preferGender ?? 'any';
  const score = (v: SpeechSynthesisVoice) => {
    const name = v.name.toLowerCase();
    let s = 0;
    if (v.lang.replace('_', '-').toLowerCase() === bcp) s += 3;
    if (BROWSER_VOICE_HINTS.quality.some((q) => name.includes(q))) s += 2;
    if (pref !== 'any') {
      const other = pref === 'female' ? 'male' : 'female';
      if (BROWSER_VOICE_HINTS[pref].some((h) => name.includes(h))) s += 4;
      if (BROWSER_VOICE_HINTS[other].some((h) => name.includes(h))) s -= 4;
    }
    return s;
  };
  return [...candidates].sort((a, b) => score(b) - score(a))[0];
}

/** Short voice preview for the settings screen. */
export async function previewVoice(language: LanguageCode, voiceId: VoiceId, text: string) {
  if (!('speechSynthesis' in window) || !LANGUAGES[language].browserTtsAllowed) return false;
  const voice = await pickDeviceVoice(language, voiceId);
  const cfg = VOICES.find((v) => v.id === voiceId) ?? VOICES[0];
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = voice?.lang ?? LANGUAGES[language].bcp47;
  if (voice) u.voice = voice;
  u.rate = 0.92 * cfg.browser.rateFactor;
  u.pitch = cfg.browser.pitch;
  window.speechSynthesis.speak(u);
  return true;
}

export type { NarrationEngine, NarrationState } from './types';
