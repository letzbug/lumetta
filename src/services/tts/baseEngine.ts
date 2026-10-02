import type { Segment } from '../../utils/text';
import type { NarrationEngine, NarrationMode, NarrationState } from './types';

/** Shared state, subscriptions, timing maths and the animation-frame ticker. */
export abstract class BaseEngine implements NarrationEngine {
  protected state: NarrationState;
  private listeners = new Set<() => void>();
  private levelListeners = new Set<(l: number) => void>();
  private raf = 0;
  private lastEmit = 0;
  protected level = 0;
  protected readonly totalChars: number;

  constructor(public readonly segments: Segment[], mode: NarrationMode, duration: number) {
    this.totalChars = Math.max(1, segments.length ? segments[segments.length - 1].end : 1);
    this.state = { status: 'idle', mode, segmentIndex: 0, currentTime: 0, duration };
  }

  getState() {
    return this.state;
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onLevel(listener: (l: number) => void) {
    this.levelListeners.add(listener);
    return () => this.levelListeners.delete(listener);
  }

  protected set(patch: Partial<NarrationState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((l) => l());
    if (patch.status && patch.status !== 'playing') this.emitLevel(0);
  }

  protected emitLevel(level: number) {
    this.level = level;
    this.levelListeners.forEach((l) => l(level));
  }

  /** Time at which a segment starts, proportional to characters. */
  protected segmentTime(index: number) {
    const seg = this.segments[Math.min(index, this.segments.length - 1)];
    return seg ? (seg.start / this.totalChars) * this.state.duration : 0;
  }

  protected segmentAt(time: number) {
    const chars = (time / Math.max(1, this.state.duration)) * this.totalChars;
    const found = this.segments.findIndex((s) => chars < s.end);
    return found === -1 ? this.segments.length - 1 : found;
  }

  /** Subclasses update time/level here while playing. */
  protected abstract tick(now: number): void;

  protected startTicker() {
    cancelAnimationFrame(this.raf);
    const loop = (now: number) => {
      this.tick(now);
      // throttle React-facing updates (~15/s); level listeners get every frame
      if (now - this.lastEmit > 66) {
        this.lastEmit = now;
        this.listeners.forEach((l) => l());
      }
      if (this.state.status === 'playing' || this.state.status === 'loading') this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  protected stopTicker() {
    cancelAnimationFrame(this.raf);
  }

  seekToRatio(ratio: number) {
    const time = Math.max(0, Math.min(1, ratio)) * this.state.duration;
    this.seekToSegment(this.segmentAt(time));
  }

  abstract play(): void;
  abstract pause(): void;
  abstract resume(): void;
  abstract restart(): void;
  abstract seekToSegment(index: number): void;

  destroy() {
    this.stopTicker();
    this.listeners.clear();
    this.levelListeners.clear();
  }
}
