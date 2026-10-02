import type { Segment } from '../../utils/text';
import { BaseEngine } from './baseEngine';

/**
 * DEMO FALLBACK ONLY – narration with the device's built-in voice.
 * Speaks sentence by sentence: this works around browser bugs with long
 * utterances, makes pause/resume reliable on every platform and gives us
 * precise read-along highlighting.
 */
export class BrowserSpeechEngine extends BaseEngine {
  private token = 0;
  private current?: SpeechSynthesisUtterance;
  private segStartedAt = 0;
  private pulse = 0;

  constructor(
    segments: Segment[],
    duration: number,
    private readonly voice: SpeechSynthesisVoice | undefined,
    private readonly lang: string,
    private readonly rate: number,
    private readonly pitch: number,
  ) {
    super(segments, 'device', duration);
  }

  private get synth() {
    return window.speechSynthesis;
  }

  private speakFrom(index: number) {
    const token = ++this.token;
    const go = () => {
      if (token !== this.token) return;
      const seg = this.segments[index];
      if (!seg) return this.finish();
      const u = new SpeechSynthesisUtterance(seg.text);
      u.lang = this.voice?.lang ?? this.lang;
      if (this.voice) u.voice = this.voice;
      u.rate = this.rate;
      u.pitch = this.pitch;
      u.onboundary = () => {
        if (token === this.token) this.pulse = 1;
      };
      u.onend = () => {
        if (token !== this.token) return;
        if (index + 1 < this.segments.length) this.speakFrom(index + 1);
        else this.finish();
      };
      u.onerror = (e) => {
        if (token !== this.token || e.error === 'interrupted' || e.error === 'canceled') return;
        if (index + 1 < this.segments.length) this.speakFrom(index + 1);
        else this.finish();
      };
      this.current = u; // keep a reference (avoids lost `end` events in some browsers)
      this.segStartedAt = performance.now();
      this.set({ status: 'playing', segmentIndex: index, currentTime: this.segmentTime(index) });
      this.synth.speak(u);
      this.startTicker();
    };
    if (this.synth.speaking || this.synth.pending) {
      this.synth.cancel();
      setTimeout(go, 60); // speaking immediately after cancel() is unreliable in Chromium
    } else {
      go(); // first call stays inside the user gesture (required on iOS)
    }
  }

  private finish() {
    this.token++;
    this.stopTicker();
    this.set({ status: 'ended', currentTime: this.state.duration, segmentIndex: this.segments.length - 1 });
  }

  protected tick(now: number) {
    if (this.state.status !== 'playing') return;
    const i = this.state.segmentIndex;
    const start = this.segmentTime(i);
    const end = i + 1 < this.segments.length ? this.segmentTime(i + 1) : this.state.duration;
    const t = Math.min(end, start + ((now - this.segStartedAt) / 1000));
    this.state = { ...this.state, currentTime: t };
    this.pulse *= 0.9;
    const breathing = 0.32 + 0.18 * Math.sin(now / 160) * Math.sin(now / 410);
    this.emitLevel(Math.min(1, breathing + this.pulse * 0.5));
  }

  play() {
    if (this.state.status === 'playing') return;
    if (this.state.status === 'ended') return this.restart();
    this.speakFrom(this.state.segmentIndex);
  }

  pause() {
    if (this.state.status !== 'playing') return;
    this.token++;
    this.synth.cancel();
    this.stopTicker();
    // resuming re-reads the current sentence, so show its start
    this.set({ status: 'paused', currentTime: this.segmentTime(this.state.segmentIndex) });
  }

  resume() {
    this.speakFrom(this.state.segmentIndex);
  }

  restart() {
    this.speakFrom(0);
  }

  seekToSegment(index: number) {
    const i = Math.max(0, Math.min(index, this.segments.length - 1));
    if (this.state.status === 'playing') return this.speakFrom(i);
    this.set({ segmentIndex: i, currentTime: this.segmentTime(i), status: this.state.status === 'ended' ? 'paused' : this.state.status });
  }

  destroy() {
    this.token++;
    try {
      this.synth.cancel();
    } catch {
      /* ignore */
    }
    super.destroy();
  }
}
