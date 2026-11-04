/**
 * Procedural Web Audio API Sound Synthesizer for Sensory Regulation & ADHD Focus
 * Zero external audio assets required — runs 100% locally in browser memory.
 */

export type AmbientSoundType = 'none' | 'stream' | 'rain' | 'brown' | 'binaural';

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private currentType: AmbientSoundType = 'none';
  private masterGain: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private volume: number = 0.5;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public stop() {
    this.activeNodes.forEach((node) => {
      if (typeof node === 'number') {
        window.clearInterval(node);
      } else if (node && 'stop' in node && typeof (node as any).stop === 'function') {
        try {
          (node as any).stop();
        } catch {}
      } else if (node && 'disconnect' in node) {
        try {
          node.disconnect();
        } catch {}
      }
    });
    this.activeNodes = [];
    this.currentType = 'none';
  }

  public play(type: AmbientSoundType) {
    if (this.currentType === type && type !== 'none') return;
    this.stop();
    if (type === 'none') return;

    const ctx = this.getContext();
    this.currentType = type;

    // Master Gain
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, ctx.currentTime);
    this.masterGain.connect(ctx.destination);
    this.activeNodes.push(this.masterGain);

    switch (type) {
      case 'brown':
        this.startBrownNoise(ctx, this.masterGain);
        break;
      case 'rain':
        this.startRainSimulation(ctx, this.masterGain);
        break;
      case 'stream':
        this.startStreamSimulation(ctx, this.masterGain);
        break;
      case 'binaural':
        this.startBinauralBeats(ctx, this.masterGain);
        break;
    }
  }

  // 🤎 Brown Noise (ADHD Whiteout)
  private startBrownNoise(ctx: AudioContext, destination: GainNode) {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Gain compensation
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(destination);
    whiteNoise.start();

    this.activeNodes.push(whiteNoise, filter);
  }

  // 🌧️ Washi Paper Rain (Filtered Pink Noise)
  private startRainSimulation(ctx: AudioContext, destination: GainNode) {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const rainSource = ctx.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.Q.setValueAtTime(0.5, ctx.currentTime);

    rainSource.connect(filter);
    filter.connect(destination);
    rainSource.start();

    this.activeNodes.push(rainSource, filter);
  }

  // 🎋 Bamboo Temple Stream (Water Flow & Resonance)
  private startStreamSimulation(ctx: AudioContext, destination: GainNode) {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    const left = noiseBuffer.getChannelData(0);
    const right = noiseBuffer.getChannelData(1);

    for (let i = 0; i < bufferSize; i++) {
      left[i] = (Math.random() * 2 - 1) * 0.2;
      right[i] = (Math.random() * 2 - 1) * 0.2;
    }

    const streamSource = ctx.createBufferSource();
    streamSource.buffer = noiseBuffer;
    streamSource.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(600, ctx.currentTime);

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(120, ctx.currentTime);

    streamSource.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(destination);
    streamSource.start();

    this.activeNodes.push(streamSource, lowpass, highpass);
  }

  // 🎧 40Hz Gamma Binaural Beats (Stereo Sine Oscillators)
  private startBinauralBeats(ctx: AudioContext, destination: GainNode) {
    const merger = ctx.createChannelMerger(2);

    // Left Ear: 200 Hz
    const oscLeft = ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(200, ctx.currentTime);
    const gainLeft = ctx.createGain();
    gainLeft.gain.setValueAtTime(0.2, ctx.currentTime);
    oscLeft.connect(gainLeft);
    gainLeft.connect(merger, 0, 0);

    // Right Ear: 240 Hz (40Hz differential)
    const oscRight = ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(240, ctx.currentTime);
    const gainRight = ctx.createGain();
    gainRight.gain.setValueAtTime(0.2, ctx.currentTime);
    oscRight.connect(gainRight);
    gainRight.connect(merger, 0, 1);

    merger.connect(destination);

    oscLeft.start();
    oscRight.start();

    this.activeNodes.push(oscLeft, oscRight, gainLeft, gainRight, merger);
  }
}

export const ambientSound = new AudioSynthesizer();
