import type { Segment } from '../../utils/text';
import { BaseEngine } from './baseEngine';

/**
 * Studio narration: audio produced by the server's TTS provider (TTS_PROVIDER).
 * Read-along highlighting is aligned proportionally to characters; providers
 * with word timestamps can later supply exact timings without UI changes.
 */
export class RemoteAudioEngine extends BaseEngine {
  private audio = new Audio();
  private url?: string;
  private ready = false;
  private pendingPlay = false;
  private analyser?: AnalyserNode;
  private ctx?: AudioContext;
  private buffer?: Uint8Array<ArrayBuffer>;

  constructor(segments: Segment[], estimatedDuration: number, private readonly load: () => Promise<Blob>, private readonly onFail: () => void) {
    super(segments, 'studio', estimatedDuration);
    this.audio.preload = 'auto';
    this.audio.addEventListener('ended', () => {
      this.stopTicker();
      this.set({ status: 'ended', currentTime: this.state.duration, segmentIndex: this.segments.length - 1 });
    });
    this.audio.addEventListener('loadedmetadata', () => {
      if (Number.isFinite(this.audio.duration) && this.audio.duration > 0) this.set({ duration: this.audio.duration });
    });
    this.prepare();
  }

  private async prepare() {
    this.set({ status: 'loading' });
    try {
      const blob = await this.load();
      this.url = URL.createObjectURL(blob);
      this.audio.src = this.url;
      this.ready = true;
      this.set({ status: 'idle' });
      if (this.pendingPlay) this.play();
    } catch {
      this.set({ status: 'error' });
      this.onFail();
    }
  }

  private connectAnalyser() {
    if (this.ctx || typeof AudioContext === 'undefined') return;
    try {
      this.ctx = new AudioContext();
      const source = this.ctx.createMediaElementSource(this.audio);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.buffer = new Uint8Array(new ArrayBuffer(this.analyser.fftSize));
      source.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    } catch {
      this.analyser = undefined;
    }
  }

  protected tick(now: number) {
    if (this.state.status !== 'playing') return;
    const t = this.audio.currentTime;
    this.state = { ...this.state, currentTime: t, segmentIndex: this.segmentAt(t) };
    let level = 0.3 + 0.15 * Math.sin(now / 180);
    if (this.analyser && this.buffer) {
      this.analyser.getByteTimeDomainData(this.buffer);
      let sum = 0;
      for (const v of this.buffer) sum += ((v - 128) / 128) ** 2;
      level = Math.min(1, Math.sqrt(sum / this.buffer.length) * 4);
    }
    this.emitLevel(level);
  }

  play() {
    if (!this.ready) {
      this.pendingPlay = true;
      return;
    }
    this.pendingPlay = false;
    if (this.state.status === 'ended') this.audio.currentTime = 0;
    this.connectAnalyser();
    void this.ctx?.resume();
    this.audio
      .play()
      .then(() => {
        this.set({ status: 'playing' });
        this.startTicker();
      })
      .catch(() => this.set({ status: 'paused' }));
  }
  pause() {
    this.audio.pause();
    this.stopTicker();
    this.set({ status: 'paused' });
  }
  resume() {
    this.play();
  }
  restart() {
    this.audio.currentTime = 0;
    this.set({ currentTime: 0, segmentIndex: 0 });
    this.play();
  }
  seekToSegment(index: number) {
    const t = this.segmentTime(index);
    this.audio.currentTime = t;
    this.set({ currentTime: t, segmentIndex: index });
  }
  destroy() {
    this.audio.pause();
    this.audio.removeAttribute('src');
    if (this.url) URL.revokeObjectURL(this.url);
    void this.ctx?.close();
    super.destroy();
  }
}
