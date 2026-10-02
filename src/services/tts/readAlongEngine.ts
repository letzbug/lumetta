import type { Segment } from '../../utils/text';
import { BaseEngine } from './baseEngine';

/**
 * Read-along without a voice. Used when no narration voice of sufficient
 * quality exists for a language on this device (e.g. Luxembourgish).
 * The text advances at a calm reading pace; everything else behaves the same.
 */
export class ReadAlongEngine extends BaseEngine {
  private startedAt = 0;
  private startedFrom = 0;

  constructor(segments: Segment[], duration: number) {
    super(segments, 'silent', duration);
  }

  protected tick(now: number) {
    if (this.state.status !== 'playing') return;
    const t = this.startedFrom + (now - this.startedAt) / 1000;
    if (t >= this.state.duration) {
      this.stopTicker();
      this.set({ status: 'ended', currentTime: this.state.duration });
      return;
    }
    this.state = { ...this.state, currentTime: t, segmentIndex: this.segmentAt(t) };
    this.emitLevel(0.22 + 0.08 * Math.sin(now / 500));
  }

  private runFrom(time: number) {
    this.startedAt = performance.now();
    this.startedFrom = time;
    this.set({ status: 'playing', currentTime: time, segmentIndex: this.segmentAt(time) });
    this.startTicker();
  }

  play() {
    if (this.state.status === 'playing') return;
    this.runFrom(this.state.status === 'ended' ? 0 : this.state.currentTime);
  }
  pause() {
    if (this.state.status !== 'playing') return;
    this.stopTicker();
    this.set({ status: 'paused' });
  }
  resume() {
    this.play();
  }
  restart() {
    this.runFrom(0);
  }
  seekToSegment(index: number) {
    const time = this.segmentTime(index);
    if (this.state.status === 'playing') this.runFrom(time);
    else this.set({ currentTime: time, segmentIndex: index, status: this.state.status === 'ended' ? 'paused' : this.state.status });
  }
}
