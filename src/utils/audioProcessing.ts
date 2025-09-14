// apply a linear gain factor to an audiobuffer and return a new buffer
export function applyGainToBuffer(
  audioContext: AudioContext,
  buffer: AudioBuffer,
  gain: number
): AudioBuffer {
  // create a new buffer with the same specs
  const out = audioContext.createBuffer(
    buffer.numberOfChannels,
    buffer.length,
    buffer.sampleRate
  );

  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const src = buffer.getChannelData(ch);
    const dst = out.getChannelData(ch);
    for (let i = 0; i < src.length; i++) {
      // scale and clamp to [-1, 1]
      const v = src[i] * gain;
      dst[i] = v > 1 ? 1 : v < -1 ? -1 : v;
    }
  }

  return out;
}

// convert db values to linear gain
export function dbToGain(db: number): number {
  return Math.pow(10, db / 20);
}

// apply a linear fade in over the first `seconds` of audio
export function applyFadeInToBuffer(
  audioContext: AudioContext,
  buffer: AudioBuffer,
  seconds: number
): AudioBuffer {
  const out = audioContext.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
  const fadeSamples = Math.max(0, Math.min(buffer.length, Math.floor(seconds * buffer.sampleRate)));
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const src = buffer.getChannelData(ch);
    const dst = out.getChannelData(ch);
    for (let i = 0; i < buffer.length; i++) {
      const t = i < fadeSamples && fadeSamples > 0 ? i / fadeSamples : 1;
      // use a smooth curve for fade in
      const g = t * t;
      dst[i] = src[i] * g;
    }
  }
  return out;
}

// apply a linear fade out over the last `seconds` of audio
export function applyFadeOutToBuffer(
  audioContext: AudioContext,
  buffer: AudioBuffer,
  seconds: number
): AudioBuffer {
  const out = audioContext.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
  const fadeSamples = Math.max(0, Math.min(buffer.length, Math.floor(seconds * buffer.sampleRate)));
  const start = buffer.length - fadeSamples;
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const src = buffer.getChannelData(ch);
    const dst = out.getChannelData(ch);
    for (let i = 0; i < buffer.length; i++) {
      const t = i >= start && fadeSamples > 0 ? (buffer.length - i) / fadeSamples : 1;
      // use a smooth curve for fade out
      const g = t * t;
      dst[i] = src[i] * g;
    }
  }
  return out;
}

// apply a lightweight multi tap reverb by mixing delayed copies
// this is a simple ambience effect, not a true convolution reverb
export function applySimpleReverbToBuffer(
  audioContext: AudioContext,
  buffer: AudioBuffer,
  opts?: { wet?: number; time?: number; decay?: number; preDelayMs?: number }
): AudioBuffer {
  // defaults: moderate room
  const wet = Math.max(0, Math.min(1, opts?.wet ?? 0.3));
  const time = Math.max(0.2, Math.min(3.0, opts?.time ?? 1.2));
  const decay = Math.max(0.2, Math.min(0.95, opts?.decay ?? 0.6));
  const preDelayMs = Math.max(0, Math.min(100, opts?.preDelayMs ?? 20));

  const out = audioContext.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);

  // define a few delay taps in milliseconds scaled by time
  const baseTapsMs = [50, 80, 120, 180, 260, 340];
  const taps = baseTapsMs.map(ms => Math.floor(((ms + preDelayMs) * time) * buffer.sampleRate / 1000));
  const gains = taps.map((_, i) => Math.pow(decay, i + 1));

  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const src = buffer.getChannelData(ch);
    const dst = out.getChannelData(ch);
    for (let i = 0; i < buffer.length; i++) {
      // dry path
      const v = src[i];
      // wet path: sum delayed taps with decaying gains
      let wetSum = 0;
      for (let k = 0; k < taps.length; k++) {
        const idx = i - taps[k];
        if (idx >= 0) wetSum += src[idx] * gains[k];
      }
      const mixed = v * (1 - wet) + wetSum * wet;
      // clamp
      dst[i] = mixed > 1 ? 1 : mixed < -1 ? -1 : mixed;
    }
  }
  return out;
}

