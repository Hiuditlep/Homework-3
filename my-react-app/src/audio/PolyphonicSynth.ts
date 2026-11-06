// src/audio/PolyphonicSynth.ts
export class PolyphonicSynth {
  private ctx: AudioContext | null = null;
  private maxVoices: number;
  private voices: Map<number, { osc: OscillatorNode; gain: GainNode }>;

  constructor(maxVoices = 8) {
    this.maxVoices = maxVoices;
    this.voices = new Map(); // FIFO insertion order: midi -> { osc, gain }
  }

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
    }
  }

  noteOn(midi: number, freqHz: number) {
    this.initCtx();
    if (!this.ctx) return;
    if (this.voices.has(midi)) return;

    // FIFO Voice Stealing: Release oldest note if maxVoices exceeded
    if (this.voices.size >= this.maxVoices) {
      const oldestMidi = this.voices.keys().next().value;
      if (oldestMidi !== undefined) {
        this.noteOff(oldestMidi);
      }
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine"; // Âm mộc mạc
    osc.frequency.setValueAtTime(freqHz, this.ctx.currentTime);

    // Click-Free Envelope Ramp (Attack)
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.02);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();

    this.voices.set(midi, { osc, gain });
  }

  noteOff(midi: number) {
    if (!this.ctx) return;
    const voice = this.voices.get(midi);
    if (!voice) return;

    const { osc, gain } = voice;

    // Click-Free Envelope Ramp (Release) để xóa lỗi popping noise
    gain.gain.cancelScheduledValues(this.ctx.currentTime);
    gain.gain.setValueAtTime(gain.gain.value, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);

    osc.stop(this.ctx.currentTime + 0.05);
    this.voices.delete(midi);
  }
}

// Khởi tạo Singleton Engine dùng chung
export const synthEngine = new PolyphonicSynth(8);
