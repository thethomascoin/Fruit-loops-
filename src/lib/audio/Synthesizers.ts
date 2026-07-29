import * as Tone from 'tone';

/**
 * Instrument Engine – exposes a single triggerSound utility used by PianoRoll
 * for immediate note previewing when clicking piano keys.
 * The main sequencer loop inside AudioEngine creates its own short-lived synths
 * to avoid node reuse issues across the Web Audio clock.
 */
export function triggerPreview(
  soundType: string,
  note = 'C3',
  velocity = 0.8,
  customUrl?: string | null
) {
  try {
    switch (soundType) {
      case 'kick': {
        const kick = new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 8 }).toDestination();
        kick.triggerAttackRelease('C1', '8n', Tone.now(), velocity);
        setTimeout(() => kick.dispose(), 1500);
        break;
      }
      case 'snare': {
        const snare = new Tone.NoiseSynth({ envelope: { attack: 0.001, decay: 0.2, sustain: 0 } }).toDestination();
        snare.triggerAttackRelease('16n', Tone.now(), velocity);
        setTimeout(() => snare.dispose(), 1000);
        break;
      }
      case 'hihat': {
        const hat = new Tone.MetalSynth({ frequency: 400, envelope: { decay: 0.05 } }).toDestination();
        hat.triggerAttackRelease('32n', Tone.now(), velocity * 0.6);
        setTimeout(() => hat.dispose(), 500);
        break;
      }
      case 'clap': {
        const clap = new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.005, decay: 0.12, sustain: 0 } }).toDestination();
        clap.triggerAttackRelease('16n', Tone.now(), velocity);
        setTimeout(() => clap.dispose(), 1000);
        break;
      }
      case 'bass': {
        const bass = new Tone.MonoSynth({ oscillator: { type: 'triangle' }, envelope: { decay: 0.4 } }).toDestination();
        bass.triggerAttackRelease(note, '8n', Tone.now(), velocity);
        setTimeout(() => bass.dispose(), 2000);
        break;
      }
      default: {
        const lead = new Tone.Synth({ oscillator: { type: 'sawtooth' }, envelope: { attack: 0.01, decay: 0.2 } }).toDestination();
        lead.triggerAttackRelease(note, '8n', Tone.now(), velocity);
        setTimeout(() => lead.dispose(), 2000);
        break;
      }
    }
  } catch (e) {
    console.warn('Instrument preview error:', e);
  }
}

// Keep backward-compatible named export
export const instrumentEngine = { triggerSound: triggerPreview };
