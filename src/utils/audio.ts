/**
 * Web Audio API procedural sound synthesizer for bowling effects.
 * 100% self-contained, no external network assets required.
 */

let audioCtx: AudioContext | null = null;
let isMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setSoundMuted(muted: boolean) {
  isMuted = muted;
}

export function getSoundMuted(): boolean {
  return isMuted;
}

/**
 * Play a realistic pin crash sound (used on strikes or multi-pin hits)
 */
export function playPinCrashSound(intensity: number = 1.0) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Layer 1: Noise burst with resonant bandpass for wooden impact
  const bufferSize = ctx.sampleRate * 0.4;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
  }

  const noiseNode = ctx.createBufferSource();
  noiseNode.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1400, now);
  filter.Q.setValueAtTime(3.5, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.4 * intensity, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  noiseNode.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noiseNode.start(now);

  // Layer 2: Wooden body resonance tones (clack)
  const tones = [580, 820, 1150, 1680];
  tones.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq + Math.random() * 40 - 20, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + 0.15);

    oscGain.gain.setValueAtTime(0.15 * intensity, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15 + idx * 0.04);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now + idx * 0.01);
    osc.stop(now + 0.3);
  });
}

/**
 * Play single or few pin knock sound
 */
export function playSinglePinSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(940, now);
  osc.frequency.exponentialRampToValueAtTime(420, now + 0.08);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.12);
}

/**
 * Play cheerful spare pickup sound
 */
export function playSpareSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  playPinCrashSound(0.7);

  const now = ctx.currentTime + 0.1;
  const chords = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  chords.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.06);

    gain.gain.setValueAtTime(0.08, now + idx * 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + idx * 0.06);
    osc.stop(now + idx * 0.06 + 0.28);
  });
}

/**
 * Play gutter or miss sound
 */
export function playGutterSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.3);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.4);
}
