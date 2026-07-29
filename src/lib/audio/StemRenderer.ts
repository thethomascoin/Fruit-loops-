import * as Tone from 'tone';
import { SequencerTrack } from '@/lib/store';

export async function renderMasterWav(
  tracks: SequencerTrack[],
  bpm: number,
  stepCount: number
): Promise<Blob> {
  const durationSeconds = (60 / bpm) * (stepCount / 4);
  const sampleRate = 44100;

  const buffer = await Tone.Offline(async ({ transport }) => {
    transport.bpm.value = bpm;

    // Re-create synthesized sounds offline
    tracks.forEach((track) => {
      if (track.muted) return;

      const synth = new Tone.MembraneSynth().toDestination();
      const snare = new Tone.NoiseSynth({ envelope: { decay: 0.2 } }).toDestination();
      const hat = new Tone.MetalSynth().toDestination();
      const clap = new Tone.NoiseSynth({ envelope: { decay: 0.15 } }).toDestination();
      const lead = new Tone.PolySynth().toDestination();

      for (let s = 0; s < stepCount; s++) {
        const stepTime = (60 / bpm) * (s / 4);

        if (track.steps[s]) {
          switch (track.soundType) {
            case 'kick':
              synth.triggerAttackRelease('C1', '8n', stepTime, track.volume);
              break;
            case 'snare':
              snare.triggerAttackRelease('16n', stepTime, track.volume);
              break;
            case 'hihat':
              hat.triggerAttackRelease('32n', stepTime, track.volume * 0.7);
              break;
            case 'clap':
              clap.triggerAttackRelease('16n', stepTime, track.volume);
              break;
            default:
              synth.triggerAttackRelease('C1', '8n', stepTime, track.volume);
          }
        }

        // Piano Roll Notes
        track.pianoRollNotes
          .filter((n) => n.step === s)
          .forEach((n) => {
            lead.triggerAttackRelease(n.pitch, `${n.duration * 16}n`, stepTime, n.velocity * track.volume);
          });
      }
    });

    transport.start(0);
  }, durationSeconds, 2, sampleRate);

  return audioBufferToWavBlob(buffer.get() as AudioBuffer);
}

export async function renderTrackStem(
  track: SequencerTrack,
  bpm: number,
  stepCount: number
): Promise<Blob> {
  return renderMasterWav([track], bpm, stepCount);
}

function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const length = buffer.length * numChannels * 2;
  const bufferArray = new ArrayBuffer(44 + length);
  const view = new DataView(bufferArray);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* RIFF chunk size */
  view.setUint32(4, 36 + length, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, format, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * numChannels * 2, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, numChannels * 2, true);
  /* bits per sample */
  view.setUint16(34, bitDepth, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, length, true);

  // Write PCM samples
  const channels: Float32Array[] = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([bufferArray], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
