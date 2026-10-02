import type { Segment } from '../../utils/text';

export type NarrationStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error';
/** studio = server voice, device = browser speech (demo fallback), silent = read-along without voice */
export type NarrationMode = 'studio' | 'device' | 'silent';

export interface NarrationState {
  status: NarrationStatus;
  mode: NarrationMode;
  segmentIndex: number;
  currentTime: number;
  duration: number;
}

export interface NarrationEngine {
  readonly segments: Segment[];
  getState(): NarrationState;
  subscribe(listener: () => void): () => void;
  /** 0..1 "loudness" for the light companion – called at animation-frame rate. */
  onLevel(listener: (level: number) => void): () => void;
  play(): void;
  pause(): void;
  resume(): void;
  restart(): void;
  seekToSegment(index: number): void;
  seekToRatio(ratio: number): void;
  destroy(): void;
}
