import { PRESENTATION_AUDIO_URL } from '../data/studioData';

export interface WelcomeAudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isMuted: boolean;
  volume: number;
  hasEndedOnce: boolean;
}

type Listener = (state: WelcomeAudioState) => void;

class WelcomeAudioController {
  private audio: HTMLAudioElement | null = null;
  private listeners: Set<Listener> = new Set();
  private state: WelcomeAudioState = {
    isPlaying: false,
    currentTime: 0,
    duration: 19.0,
    isMuted: false,
    volume: 0.9,
    hasEndedOnce: false,
  };

  private ensureAudio(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    if (!this.audio) {
      const el = new Audio(PRESENTATION_AUDIO_URL);
      el.preload = 'metadata';
      el.volume = this.state.volume;
      el.muted = this.state.isMuted;

      el.addEventListener('loadedmetadata', () => {
        if (el.duration && !Number.isNaN(el.duration) && Number.isFinite(el.duration)) {
          this.updateState({ duration: el.duration });
        }
      });

      el.addEventListener('timeupdate', () => {
        this.updateState({ currentTime: el.currentTime });
      });

      el.addEventListener('play', () => {
        this.updateState({ isPlaying: true });
      });

      el.addEventListener('pause', () => {
        this.updateState({ isPlaying: false });
      });

      el.addEventListener('ended', () => {
        this.updateState({
          isPlaying: false,
          currentTime: 0,
          hasEndedOnce: true,
        });
      });

      this.audio = el;
    }
    return this.audio;
  }

  private updateState(partial: Partial<WelcomeAudioState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((listener) => listener(this.state));
  }

  public getState(): WelcomeAudioState {
    this.ensureAudio();
    return this.state;
  }

  public subscribe(listener: Listener): () => void {
    this.ensureAudio();
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public togglePlay(): void {
    const el = this.ensureAudio();
    if (!el) return;
    if (this.state.isPlaying) {
      el.pause();
    } else {
      el.play().catch(() => {
        this.updateState({ isPlaying: false });
      });
    }
  }

  public playFromStart(): void {
    const el = this.ensureAudio();
    if (!el) return;
    el.currentTime = 0;
    this.updateState({ currentTime: 0 });
    el.play().catch(() => {
      this.updateState({ isPlaying: false });
    });
  }

  public pause(): void {
    const el = this.ensureAudio();
    if (!el) return;
    el.pause();
  }

  public seekToRatio(ratio: number): void {
    const el = this.ensureAudio();
    if (!el) return;
    const clamped = Math.max(0, Math.min(1, ratio));
    const target = clamped * this.state.duration;
    el.currentTime = target;
    this.updateState({ currentTime: target });
    if (!this.state.isPlaying) {
      el.play().catch(() => {});
    }
  }

  public seekToSeconds(seconds: number): void {
    const el = this.ensureAudio();
    if (!el) return;
    const target = Math.max(0, Math.min(this.state.duration, seconds));
    el.currentTime = target;
    this.updateState({ currentTime: target });
    if (!this.state.isPlaying) {
      el.play().catch(() => {});
    }
  }

  public toggleMute(): void {
    const el = this.ensureAudio();
    const nextMuted = !this.state.isMuted;
    if (el) {
      el.muted = nextMuted;
    }
    this.updateState({ isMuted: nextMuted });
  }

  public setVolume(vol: number): void {
    const el = this.ensureAudio();
    const clamped = Math.max(0, Math.min(1, vol));
    if (el) {
      el.volume = clamped;
      if (clamped > 0 && this.state.isMuted) {
        el.muted = false;
      }
    }
    this.updateState({
      volume: clamped,
      isMuted: clamped === 0 ? true : false,
    });
  }
}

export const welcomeAudio = new WelcomeAudioController();
