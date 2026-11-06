/**
 * Synthesizes subtle tactile mechanical switch sounds for urban boombox interface feedback
 * Uses Web Audio API without requiring any external audio asset downloads.
 */

let sharedAudioCtx: AudioContext | null = null;
let lastHoverSoundTime = 0;

function getAudioContext(): AudioContext | null {
  try {
    if (!sharedAudioCtx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        sharedAudioCtx = new AudioCtx();
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      // Resume if possible
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

/**
 * Subtle high-frequency mechanical tactile click for navigation button hover.
 * Debounced to avoid audio fatigue when brushing across multiple elements.
 */
export function playMechanicalHover(): void {
  const now = performance.now();
  if (now - lastHoverSoundTime < 65) return; // Debounce 65ms
  lastHoverSoundTime = now;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // Dual-tone mechanical micro-switch impulse
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Highpass filter for a crisp, tactile metallic micro-tick
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2100, t);
    filter.Q.setValueAtTime(4.5, t);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2400, t);
    osc.frequency.exponentialRampToValueAtTime(700, t + 0.016);

    // Subtle, whisper-soft mechanical volume (0.02)
    gain.gain.setValueAtTime(0.025, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.016);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.018);
  } catch {
    // Gracefully ignore if audio context is blocked
  }
}

/**
 * Solid mechanical button press feedback (like an analog boombox latch or pedal switch)
 */
export function playMechanicalClick(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.frequency.exponentialRampToValueAtTime(300, t + 0.03);

    osc.type = 'square';
    osc.frequency.setValueAtTime(620, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.028);

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(160, t);
    subOsc.frequency.exponentialRampToValueAtTime(60, t + 0.035);

    gain.gain.setValueAtTime(0.045, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    subOsc.start(t);
    osc.stop(t + 0.038);
    subOsc.stop(t + 0.038);
  } catch {
    // Graceful fallback
  }
}
