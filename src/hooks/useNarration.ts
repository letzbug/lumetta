import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { Story, VoiceId } from '../types/story';
import type { NarrationSpeed } from '../store/AppStore';
import { createNarration, type NarrationEngine, type NarrationState } from '../services/tts/ttsService';
import { logTechnical } from '../services/apiClient';

const IDLE: NarrationState = { status: 'loading', mode: 'device', segmentIndex: 0, currentTime: 0, duration: 0 };
const noopSubscribe = () => () => {};

/**
 * Creates the narration engine for a story and exposes its state.
 * The engine is destroyed (speech stops) when the player unmounts.
 */
export function useNarration(story: Story | undefined, voiceId: VoiceId, speed: NarrationSpeed = 'normal') {
  const [engine, setEngine] = useState<NarrationEngine | null>(null);
  const engineRef = useRef<NarrationEngine | null>(null);

  useEffect(() => {
    if (!story) return;
    let cancelled = false;
    createNarration(story, voiceId, speed)
      .then((e) => {
        if (cancelled) return e.destroy();
        engineRef.current = e;
        setEngine(e);
      })
      .catch((err) => logTechnical('narration', err));
    return () => {
      cancelled = true;
      engineRef.current?.destroy();
      engineRef.current = null;
      setEngine(null);
    };
    // the engine depends on the text and the voice, not on favourite/saved flags
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id, story?.story, voiceId, speed]);

  const state = useSyncExternalStore(
    engine ? engine.subscribe.bind(engine) : noopSubscribe,
    () => (engine ? engine.getState() : IDLE),
  );

  return { engine, state };
}
