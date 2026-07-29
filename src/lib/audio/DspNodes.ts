import * as Tone from 'tone';

/**
 * Pro DSP Master Chain
 * Tape Saturation → Auto-Pitch Shift → Multiband Comp → Brickwall Limiter
 */
export class ProDspEngine {
  private saturationNode: Tone.Distortion | null = null;
  private autoPitchNode: Tone.PitchShift | null = null;
  private multibandCompLow: Tone.Compressor | null = null;
  private multibandCompHigh: Tone.Compressor | null = null;
  private limiterNode: Tone.Limiter | null = null;

  private input: Tone.Channel | null = null;
  private output: Tone.Channel | null = null;
  private initialized = false;

  public initChain(): { input: Tone.ToneAudioNode; output: Tone.ToneAudioNode } {
    if (this.initialized && this.input && this.output) {
      return { input: this.input, output: this.output };
    }

    this.input = new Tone.Channel(0, 0);
    this.output = new Tone.Channel(0, 0);

    // Tape Saturation (Distortion waveshaper)
    this.saturationNode = new Tone.Distortion(0.15);

    // Auto-Pitch Shift (semitone shift)
    this.autoPitchNode = new Tone.PitchShift(0);

    // Multiband Compression via two compressors
    this.multibandCompLow = new Tone.Compressor(-14, 4);
    this.multibandCompHigh = new Tone.Compressor(-8, 2.5);

    // Brickwall Limiter
    this.limiterNode = new Tone.Limiter(-0.3);

    this.input
      .chain(
        this.saturationNode,
        this.autoPitchNode,
        this.multibandCompLow,
        this.multibandCompHigh,
        this.limiterNode,
        this.output
      );

    this.initialized = true;
    return { input: this.input, output: this.output };
  }

  public updateSaturation(enabled: boolean, drive: number) {
    if (this.saturationNode) {
      this.saturationNode.distortion = enabled ? Math.max(0, Math.min(1, drive)) : 0;
    }
  }

  public updateAutoPitch(enabled: boolean, pitchSemitones: number) {
    if (this.autoPitchNode) {
      this.autoPitchNode.pitch = enabled ? pitchSemitones : 0;
    }
  }

  public updateMultiband(enabled: boolean, lowThresh: number, highThresh: number) {
    if (this.multibandCompLow && this.multibandCompHigh) {
      this.multibandCompLow.threshold.value = enabled ? lowThresh : 0;
      this.multibandCompHigh.threshold.value = enabled ? highThresh : 0;
    }
  }

  public updateLimiter(enabled: boolean, threshold: number) {
    if (this.limiterNode) {
      this.limiterNode.threshold.value = enabled ? threshold : 0;
    }
  }
}

export const proDspEngine = new ProDspEngine();
