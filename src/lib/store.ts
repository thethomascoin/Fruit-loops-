import { create } from 'zustand';

export interface PianoRollNote {
  id: string;
  pitch: string; // e.g., "C4", "D#4"
  step: number;  // 0..31
  duration: number; // grid steps (1, 2, 4, etc.)
  velocity: number; // 0..1
}

export interface SequencerTrack {
  id: string;
  name: string;
  color: string;
  mixerChannel: number; // 1..32
  volume: number;       // 0..1
  pan: number;          // -1..1
  muted: boolean;
  soloed: boolean;
  steps: boolean[];     // length 32
  type: 'synth' | 'sampler';
  soundType: 'kick' | 'snare' | 'hihat' | 'clap' | 'bass' | 'lead' | 'pluck' | 'bell' | 'custom';
  customSampleUrl?: string | null;
  pianoRollNotes: PianoRollNote[];
}

export interface MixerTrackState {
  id: number; // 0 = Master, 1..32 = Inserts
  name: string;
  color: string;
  volume: number; // -60 to 6 dB
  pan: number;    // -1 to 1
  muted: boolean;
  soloed: boolean;
  eq: { low: number; mid: number; high: number }; // -12 to +12 dB
  reverb: { send: number; roomSize: number; dampening: number };
  delay: { send: number; feedback: number; time: string };
  peakLevel: number; // 0 to 1 for VU meter
}

export interface ProFxState {
  tapeSaturation: { enabled: boolean; drive: number; tone: number };
  multibandComp: { enabled: boolean; lowThresh: number; highThresh: number };
  autoPitch: { enabled: boolean; key: string; speed: number };
  masterLimiter: { enabled: boolean; threshold: number; ceiling: number };
}

export interface DawState {
  // Monetization Tier Entitlements
  hasProPass: boolean;
  hasExpansionPack: boolean;
  hasCreatorStems: boolean;

  // Global Transport
  isPlaying: boolean;
  isRecording: boolean;
  bpm: number;
  masterVolume: number; // -60..6 dB
  masterPitch: number;  // -12..12 semitones
  currentStep: number;  // 0..31
  stepCount: 16 | 32;
  selectedPattern: number;
  activeTab: 'channelRack' | 'pianoRoll' | 'mixer' | 'proFx' | 'store';
  activeTrackId: string;

  // Audio Engine State
  tracks: SequencerTrack[];
  mixerTracks: MixerTrackState[];
  proFx: ProFxState;

  // Actions
  setTier: (tier: 'proPass' | 'expansion' | 'creatorStems', value: boolean) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsRecording: (recording: boolean) => void;
  setBpm: (bpm: number) => void;
  setMasterVolume: (vol: number) => void;
  setMasterPitch: (pitch: number) => void;
  setCurrentStep: (step: number) => void;
  setStepCount: (count: 16 | 32) => void;
  setActiveTab: (tab: 'channelRack' | 'pianoRoll' | 'mixer' | 'proFx' | 'store') => void;
  setActiveTrackId: (id: string) => void;
  
  // Track Actions
  toggleStep: (trackId: string, stepIndex: number) => void;
  setTrackVolume: (trackId: string, volume: number) => void;
  setTrackPan: (trackId: string, pan: number) => void;
  setTrackMixerChannel: (trackId: string, channel: number) => void;
  toggleMuteTrack: (trackId: string) => void;
  toggleSoloTrack: (trackId: string) => void;
  addTrack: (track: SequencerTrack) => void;
  loadCustomSample: (trackId: string, sampleUrl: string, sampleName: string) => void;

  // Piano Roll Actions
  addPianoRollNote: (trackId: string, note: PianoRollNote) => void;
  removePianoRollNote: (trackId: string, noteId: string) => void;
  clearPianoRollNotes: (trackId: string) => void;

  // Mixer Actions
  updateMixerTrack: (id: number, partial: Partial<MixerTrackState>) => void;
  updateProFx: <K extends keyof ProFxState>(fxKey: K, settings: Partial<ProFxState[K]>) => void;

  // Serialization
  exportProjectJSON: () => string;
  importProjectJSON: (jsonStr: string) => boolean;
}

const initialTracks: SequencerTrack[] = [
  {
    id: 'track-1',
    name: '808 Kick',
    color: '#ef4444',
    mixerChannel: 1,
    volume: 0.85,
    pan: 0,
    muted: false,
    soloed: false,
    type: 'synth',
    soundType: 'kick',
    steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    pianoRollNotes: [{ id: 'n1', pitch: 'C3', step: 0, duration: 1, velocity: 0.9 }],
  },
  {
    id: 'track-2',
    name: 'Punchy Snare',
    color: '#3b82f6',
    mixerChannel: 2,
    volume: 0.8,
    pan: 0,
    muted: false,
    soloed: false,
    type: 'synth',
    soundType: 'snare',
    steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    pianoRollNotes: [{ id: 'n2', pitch: 'D3', step: 4, duration: 1, velocity: 0.85 }],
  },
  {
    id: 'track-3',
    name: 'Closed HiHat',
    color: '#eab308',
    mixerChannel: 3,
    volume: 0.7,
    pan: -0.2,
    muted: false,
    soloed: false,
    type: 'synth',
    soundType: 'hihat',
    steps: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
    pianoRollNotes: [],
  },
  {
    id: 'track-4',
    name: 'Trap Clap',
    color: '#ec4899',
    mixerChannel: 4,
    volume: 0.75,
    pan: 0.1,
    muted: false,
    soloed: false,
    type: 'synth',
    soundType: 'clap',
    steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    pianoRollNotes: [],
  },
  {
    id: 'track-5',
    name: 'Sub Bass',
    color: '#8b5cf6',
    mixerChannel: 5,
    volume: 0.85,
    pan: 0,
    muted: false,
    soloed: false,
    type: 'synth',
    soundType: 'bass',
    steps: [true, false, false, true, false, false, true, false, false, true, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    pianoRollNotes: [
      { id: 'b1', pitch: 'C2', step: 0, duration: 2, velocity: 0.9 },
      { id: 'b2', pitch: 'D#2', step: 3, duration: 2, velocity: 0.85 },
      { id: 'b3', pitch: 'F2', step: 6, duration: 2, velocity: 0.85 },
      { id: 'b4', pitch: 'G2', step: 9, duration: 2, velocity: 0.85 },
      { id: 'b5', pitch: 'A#2', step: 12, duration: 4, velocity: 0.9 },
    ],
  },
  {
    id: 'track-6',
    name: 'Saw Lead',
    color: '#10b981',
    mixerChannel: 6,
    volume: 0.7,
    pan: 0,
    muted: false,
    soloed: false,
    type: 'synth',
    soundType: 'lead',
    steps: [true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    pianoRollNotes: [
      { id: 'l1', pitch: 'C4', step: 0, duration: 2, velocity: 0.8 },
      { id: 'l2', pitch: 'G4', step: 4, duration: 2, velocity: 0.8 },
      { id: 'l3', pitch: 'D#4', step: 8, duration: 2, velocity: 0.85 },
      { id: 'l4', pitch: 'F4', step: 12, duration: 4, velocity: 0.9 },
    ],
  },
];

const initialMixerTracks: MixerTrackState[] = Array.from({ length: 33 }, (_, idx) => {
  if (idx === 0) {
    return {
      id: 0,
      name: 'Master',
      color: '#22c55e',
      volume: 0,
      pan: 0,
      muted: false,
      soloed: false,
      eq: { low: 0, mid: 0, high: 0 },
      reverb: { send: 0, roomSize: 0.3, dampening: 1000 },
      delay: { send: 0, feedback: 0.3, time: '8n' },
      peakLevel: 0,
    };
  }
  return {
    id: idx,
    name: `Insert ${idx}`,
    color: idx % 2 === 0 ? '#3b82f6' : '#8b5cf6',
    volume: 0,
    pan: 0,
    muted: false,
    soloed: false,
    eq: { low: 0, mid: 0, high: 0 },
    reverb: { send: 0.2, roomSize: 0.4, dampening: 2000 },
    delay: { send: 0, feedback: 0.25, time: '8n' },
    peakLevel: 0,
  };
});

export const useDawStore = create<DawState>((set, get) => ({
  hasProPass: false,
  hasExpansionPack: false,
  hasCreatorStems: false,

  isPlaying: false,
  isRecording: false,
  bpm: 130,
  masterVolume: 0,
  masterPitch: 0,
  currentStep: 0,
  stepCount: 16,
  selectedPattern: 0,
  activeTab: 'channelRack',
  activeTrackId: 'track-1',

  tracks: initialTracks,
  mixerTracks: initialMixerTracks,

  proFx: {
    tapeSaturation: { enabled: true, drive: 0.2, tone: 0.7 },
    multibandComp: { enabled: true, lowThresh: -12, highThresh: -6 },
    autoPitch: { enabled: false, key: 'C Major', speed: 0.5 },
    masterLimiter: { enabled: true, threshold: -0.5, ceiling: -0.1 },
  },

  setTier: (tier, value) => {
    set((state) => {
      if (tier === 'proPass') return { hasProPass: value };
      if (tier === 'expansion') return { hasExpansionPack: value };
      if (tier === 'creatorStems') return { hasCreatorStems: value };
      return {};
    });
  },

  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setIsRecording: (recording) => set({ isRecording: recording }),
  setBpm: (bpm) => set({ bpm: Math.max(40, Math.min(240, bpm)) }),
  setMasterVolume: (vol) => set({ masterVolume: vol }),
  setMasterPitch: (pitch) => set({ masterPitch: pitch }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setStepCount: (count) => set({ stepCount: count }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveTrackId: (id) => set({ activeTrackId: id }),

  toggleStep: (trackId, stepIndex) =>
    set((state) => ({
      tracks: state.tracks.map((t) => {
        if (t.id !== trackId) return t;
        const newSteps = [...t.steps];
        newSteps[stepIndex] = !newSteps[stepIndex];
        return { ...t, steps: newSteps };
      }),
    })),

  setTrackVolume: (trackId, volume) =>
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, volume } : t)),
    })),

  setTrackPan: (trackId, pan) =>
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, pan } : t)),
    })),

  setTrackMixerChannel: (trackId, channel) =>
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, mixerChannel: channel } : t)),
    })),

  toggleMuteTrack: (trackId) =>
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, muted: !t.muted } : t)),
    })),

  toggleSoloTrack: (trackId) =>
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, soloed: !t.soloed } : t)),
    })),

  addTrack: (track) => set((state) => ({ tracks: [...state.tracks, track] })),

  loadCustomSample: (trackId, sampleUrl, sampleName) =>
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id === trackId
          ? { ...t, soundType: 'custom', type: 'sampler', customSampleUrl: sampleUrl, name: sampleName }
          : t
      ),
    })),

  addPianoRollNote: (trackId, note) =>
    set((state) => ({
      tracks: state.tracks.map((t) => {
        if (t.id !== trackId) return t;
        return {
          ...t,
          pianoRollNotes: [...t.pianoRollNotes.filter((n) => !(n.pitch === note.pitch && n.step === note.step)), note],
        };
      }),
    })),

  removePianoRollNote: (trackId, noteId) =>
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id === trackId
          ? { ...t, pianoRollNotes: t.pianoRollNotes.filter((n) => n.id !== noteId) }
          : t
      ),
    })),

  clearPianoRollNotes: (trackId) =>
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, pianoRollNotes: [] } : t)),
    })),

  updateMixerTrack: (id, partial) =>
    set((state) => ({
      mixerTracks: state.mixerTracks.map((m) => (m.id === id ? { ...m, ...partial } : m)),
    })),

  updateProFx: (fxKey, settings) =>
    set((state) => ({
      proFx: {
        ...state.proFx,
        [fxKey]: { ...state.proFx[fxKey], ...settings },
      },
    })),

  exportProjectJSON: () => {
    const { bpm, tracks, mixerTracks, proFx } = get();
    return JSON.stringify(
      {
        version: '1.0.0',
        bpm,
        tracks,
        mixerTracks,
        proFx,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  },

  importProjectJSON: (jsonStr) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.bpm && Array.isArray(data.tracks)) {
        set({
          bpm: data.bpm,
          tracks: data.tracks,
          mixerTracks: data.mixerTracks || initialMixerTracks,
          proFx: data.proFx || get().proFx,
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
}));
