import * as Tone from 'tone';

interface MixerChannelState {
  volume: number;
  pan: number;
  muted: boolean;
  eq: { low: number; mid: number; high: number };
  reverb: { send: number; roomSize: number; dampening: number };
  delay: { send: number; feedback: number; time: string };
}

interface SequencerStep {
  steps: boolean[];
  muted: boolean;
  volume: number;
  pan: number;
  mixerChannel: number;
  soundType: string;
  customSampleUrl?: string | null;
  pianoRollNotes: Array<{ step: number; pitch: string; duration: number; velocity: number }>;
}

// Shared step counter so the scheduler stays consistent
let stepCounter = 0;
let isSchedulerSetup = false;

// Callback store: updated by external callers
let tracksSnapshot: SequencerStep[] = [];
let stepCountSnapshot = 16;
let onStepCallback: ((step: number) => void) | null = null;

export function updateSchedulerState(
  tracks: SequencerStep[],
  stepCount: number,
  onStep: (step: number) => void
) {
  tracksSnapshot = tracks;
  stepCountSnapshot = stepCount;
  onStepCallback = onStep;
}

export class AudioEngine {
  private isInitialized = false;
  private fftAnalyser: Tone.Analyser | null = null;
  private waveformAnalyser: Tone.Analyser | null = null;

  private mixerChannels: Map<number, {
    channel: Tone.Channel;
    eq: Tone.EQ3;
    reverb: Tone.Reverb;
    delay: Tone.FeedbackDelay;
  }> = new Map();

  private masterChannel: Tone.Channel | null = null;

  public async startAudioContext(): Promise<boolean> {
    if (!this.isInitialized) {
      await Tone.start();
      this.initMixer();
      this.setupScheduler();
      this.isInitialized = true;
    }
    if (Tone.context.state !== 'running') {
      await Tone.context.resume();
    }
    return Tone.context.state === 'running';
  }

  private initMixer() {
    this.masterChannel = new Tone.Channel(0, 0).toDestination();
    this.fftAnalyser = new Tone.Analyser('fft', 64);
    this.waveformAnalyser = new Tone.Analyser('waveform', 256);

    this.masterChannel.connect(this.fftAnalyser);
    this.masterChannel.connect(this.waveformAnalyser);

    for (let i = 1; i <= 32; i++) {
      const channel = new Tone.Channel(0, 0);
      const eq = new Tone.EQ3(0, 0, 0);
      const reverb = new Tone.Reverb({ roomSize: 0.4, wet: 0.2 });
      const delay = new Tone.FeedbackDelay('8n', 0.25);
      delay.wet.value = 0;
      reverb.wet.value = 0.2;

      channel.chain(eq, reverb, delay, this.masterChannel);
      this.mixerChannels.set(i, { channel, eq, reverb, delay });
    }
  }

  private setupScheduler() {
    if (isSchedulerSetup) return;
    isSchedulerSetup = true;

    Tone.getTransport().scheduleRepeat((time) => {
      const currentStep = stepCounter % stepCountSnapshot;
      if (onStepCallback) onStepCallback(currentStep);

      tracksSnapshot.forEach((track) => {
        if (track.muted) return;

        const mixerNode = this.mixerChannels.get(track.mixerChannel);
        const destination = mixerNode ? mixerNode.channel : (this.masterChannel || Tone.getDestination());

        if (track.steps[currentStep]) {
          this.triggerInstrument(track.soundType, destination, 'C3', '8n', time, track.volume, track.customSampleUrl);
        }

        track.pianoRollNotes
          .filter((n) => n.step === currentStep)
          .forEach((n) => {
            this.triggerInstrument(
              track.soundType,
              destination,
              n.pitch,
              `${n.duration * 16}n`,
              time,
              n.velocity * track.volume,
              track.customSampleUrl
            );
          });
      });

      stepCounter++;
    }, '16n');
  }

  private triggerInstrument(
    soundType: string,
    destination: Tone.ToneAudioNode,
    note: string,
    duration: string,
    time: number,
    velocity: number,
    customUrl?: string | null
  ) {
    try {
      switch (soundType) {
        case 'kick': {
          const kick = new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 8 }).connect(destination);
          kick.triggerAttackRelease('C1', '8n', time, velocity);
          setTimeout(() => kick.dispose(), 2000);
          break;
        }
        case 'snare': {
          const snare = new Tone.NoiseSynth({ envelope: { attack: 0.001, decay: 0.2, sustain: 0 } }).connect(destination);
          snare.triggerAttackRelease('16n', time, velocity);
          setTimeout(() => snare.dispose(), 1000);
          break;
        }
        case 'hihat': {
          const hat = new Tone.MetalSynth({ frequency: 400, envelope: { decay: 0.05 } }).connect(destination);
          hat.triggerAttackRelease('32n', time, velocity * 0.6);
          setTimeout(() => hat.dispose(), 500);
          break;
        }
        case 'clap': {
          const clap = new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.005, decay: 0.12, sustain: 0 } }).connect(destination);
          clap.triggerAttackRelease('16n', time, velocity);
          setTimeout(() => clap.dispose(), 1000);
          break;
        }
        case 'bass': {
          const bass = new Tone.MonoSynth({ oscillator: { type: 'triangle' }, envelope: { decay: 0.4 } }).connect(destination);
          bass.triggerAttackRelease(note, duration, time, velocity);
          setTimeout(() => bass.dispose(), 2000);
          break;
        }
        default: {
          const lead = new Tone.Synth({ oscillator: { type: 'sawtooth' }, envelope: { attack: 0.01, decay: 0.2 } }).connect(destination);
          lead.triggerAttackRelease(note, duration, time, velocity);
          setTimeout(() => lead.dispose(), 2000);
        }
      }
    } catch (e) {
      console.warn('Audio trigger error:', e);
    }
  }

  public play() {
    this.startAudioContext().then(() => {
      Tone.getTransport().start();
    });
  }

  public pause() {
    Tone.getTransport().pause();
  }

  public stop() {
    Tone.getTransport().stop();
    stepCounter = 0;
  }

  public setBpm(bpm: number) {
    Tone.getTransport().bpm.rampTo(bpm, 0.1);
  }

  public setMasterVolume(volDb: number) {
    if (this.masterChannel) {
      this.masterChannel.volume.rampTo(volDb, 0.05);
    }
  }

  public updateMixerChannel(channelId: number, state: MixerChannelState) {
    if (channelId === 0) {
      this.setMasterVolume(state.volume);
      return;
    }
    const node = this.mixerChannels.get(channelId);
    if (!node) return;

    node.channel.volume.rampTo(state.volume, 0.05);
    node.channel.pan.rampTo(state.pan, 0.05);
    node.channel.mute = state.muted;
    node.eq.low.value = state.eq.low;
    node.eq.mid.value = state.eq.mid;
    node.eq.high.value = state.eq.high;
    node.reverb.wet.rampTo(state.reverb.send, 0.1);
    node.delay.wet.rampTo(state.delay.send, 0.1);
  }

  public getFftData(): Float32Array {
    if (!this.fftAnalyser) return new Float32Array(64);
    return this.fftAnalyser.getValue() as Float32Array;
  }

  public getWaveformData(): Float32Array {
    if (!this.waveformAnalyser) return new Float32Array(256);
    return this.waveformAnalyser.getValue() as Float32Array;
  }
}

export const audioEngine = new AudioEngine();
