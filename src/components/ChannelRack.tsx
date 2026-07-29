'use client';

import React, { useRef } from 'react';
import { Disc, Upload, Sliders } from 'lucide-react';
import { useDawStore, SequencerTrack } from '@/lib/store';
import { instrumentEngine } from '@/lib/audio/Synthesizers';
import { audioEngine } from '@/lib/audio/AudioEngine';

export const ChannelRack: React.FC = () => {
  const {
    tracks,
    currentStep,
    stepCount,
    activeTrackId,
    hasExpansionPack,
    toggleStep,
    setTrackVolume,
    setTrackPan,
    setTrackMixerChannel,
    toggleMuteTrack,
    toggleSoloTrack,
    setActiveTrackId,
    setActiveTab,
    loadCustomSample,
    setStepCount,
  } = useDawStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleStepClick = (trackId: string, stepIdx: number) => {
    toggleStep(trackId, stepIdx);
  };

  const handleTrackPreview = async (track: SequencerTrack) => {
    setActiveTrackId(track.id);
    await audioEngine.startAudioContext();
    instrumentEngine.triggerSound(
      track.soundType,
      track.volume,
      track.customSampleUrl
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, trackId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sampleUrl = URL.createObjectURL(file);
    loadCustomSample(trackId, sampleUrl, file.name.replace(/\.[^/.]+$/, ''));
  };

  return (
    <div className="flex-1 bg-[#1e1e24] p-4 flex flex-col overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-[#272932] px-4 py-2 rounded-t-xl border border-[#373a46]">
        <div className="flex items-center space-x-3">
          <h2 className="text-sm font-extrabold tracking-wide text-slate-200 uppercase flex items-center space-x-2">
            <Disc className="text-amber-500" size={16} />
            <span>CHANNEL RACK / SEQUENCER</span>
          </h2>

          <div className="flex items-center space-x-1 bg-[#1a1b22] px-2 py-1 rounded border border-[#373a46]">
            <span className="text-[11px] font-bold text-slate-400 mr-1">STEPS:</span>
            <button
              onClick={() => setStepCount(16)}
              className={`px-2 py-0.5 text-xs font-bold rounded transition-all ${
                stepCount === 16 ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              16
            </button>
            <button
              onClick={() => setStepCount(32)}
              className={`px-2 py-0.5 text-xs font-bold rounded transition-all ${
                stepCount === 32 ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              32
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-xs font-medium text-slate-400">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded bg-[#fa5252]" />
            <span>Active Step</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded bg-[#3b82f6]" />
            <span>Selected Track</span>
          </div>
        </div>
      </div>

      {/* Sequencer Track List */}
      <div className="flex-1 bg-[#191a20] border-x border-b border-[#373a46] rounded-b-xl overflow-y-auto p-3 space-y-2">
        {tracks.map((track) => {
          const isSelected = track.id === activeTrackId;

          return (
            <div
              key={track.id}
              className={`flex items-center space-x-3 p-2 rounded-lg transition-all ${
                isSelected
                  ? 'bg-[#282a36] border border-[#3b82f6]/50 shadow-md'
                  : 'bg-[#22242d] hover:bg-[#262833] border border-transparent'
              }`}
            >
              {/* Mute & Solo */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => toggleMuteTrack(track.id)}
                  className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-all ${
                    track.muted
                      ? 'bg-rose-600 text-white'
                      : 'bg-[#313442] text-slate-400 hover:text-slate-200'
                  }`}
                  title="Mute"
                >
                  M
                </button>
                <button
                  onClick={() => toggleSoloTrack(track.id)}
                  className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-all ${
                    track.soloed
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-[#313442] text-slate-400 hover:text-slate-200'
                  }`}
                  title="Solo"
                >
                  S
                </button>
              </div>

              {/* Mixer Assign Target */}
              <div className="flex items-center space-x-1 bg-[#17181d] px-2 py-1 rounded border border-[#343744]">
                <span className="text-[10px] font-mono text-slate-400">TRACK</span>
                <select
                  value={track.mixerChannel}
                  onChange={(e) => setTrackMixerChannel(track.id, parseInt(e.target.value))}
                  className="bg-transparent font-mono text-xs font-bold text-amber-400 focus:outline-none cursor-pointer"
                >
                  {Array.from({ length: 32 }, (_, i) => i + 1).map((ch) => (
                    <option key={ch} value={ch} className="bg-[#1e1e24] text-slate-200">
                      #{ch}
                    </option>
                  ))}
                </select>
              </div>

              {/* Track Name Button (Preview Sound & Piano Roll Focus) */}
              <button
                onClick={() => handleTrackPreview(track)}
                className="w-36 text-left px-2.5 py-1.5 rounded-md font-bold text-xs flex items-center justify-between text-slate-100 truncate shadow-sm transition-transform active:scale-95"
                style={{ backgroundColor: track.color + '40', borderLeft: `4px solid ${track.color}` }}
              >
                <span className="truncate">{track.name}</span>
                <Sliders
                  size={14}
                  className="text-slate-400 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTrackId(track.id);
                    setActiveTab('pianoRoll');
                  }}
                  title="Open Piano Roll"
                />
              </button>

              {/* Volume & Pan Knobs/Sliders */}
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={track.volume}
                  onChange={(e) => setTrackVolume(track.id, parseFloat(e.target.value))}
                  className="w-16 h-1.5 accent-amber-500 bg-[#323543] rounded-lg cursor-pointer"
                  title={`Volume: ${Math.round(track.volume * 100)}%`}
                />
                <input
                  type="range"
                  min={-1}
                  max={1}
                  step={0.05}
                  value={track.pan}
                  onChange={(e) => setTrackPan(track.id, parseFloat(e.target.value))}
                  className="w-12 h-1.5 accent-blue-500 bg-[#323543] rounded-lg cursor-pointer"
                  title={`Pan: ${track.pan > 0 ? `R${Math.round(track.pan * 100)}` : track.pan < 0 ? `L${Math.round(Math.abs(track.pan) * 100)}` : 'Center'}`}
                />
              </div>

              {/* Step Sequencer Grid (16 or 32 steps) */}
              <div className="flex-1 flex items-center space-x-1 overflow-x-auto py-1">
                {Array.from({ length: stepCount }).map((_, stepIdx) => {
                  const isActive = track.steps[stepIdx];
                  const isCurrent = currentStep === stepIdx;

                  // FL Studio alternating 4-beat block colors
                  const isGroupBlock = Math.floor(stepIdx / 4) % 2 === 0;
                  const defaultBg = isGroupBlock ? 'bg-[#323544]' : 'bg-[#242633]';

                  return (
                    <button
                      key={stepIdx}
                      onClick={() => handleStepClick(track.id, stepIdx)}
                      className={`h-8 flex-1 min-w-[20px] rounded transition-all relative ${
                        isActive
                          ? 'bg-gradient-to-t from-rose-600 to-amber-500 shadow-md shadow-amber-500/20 scale-[0.98]'
                          : `${defaultBg} hover:bg-[#42465a]`
                      } ${isCurrent ? 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-[#191a20]' : ''}`}
                    >
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white absolute top-1 right-1 opacity-80" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Sample Upload Trigger */}
              <label
                className="p-1.5 rounded-md bg-[#2b2d3a] hover:bg-[#383b4b] text-slate-400 hover:text-slate-200 cursor-pointer border border-[#3a3d4f] transition-all"
                title="Load Custom Sample (.WAV / .MP3)"
              >
                <Upload size={14} />
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileUpload(e, track.id)}
                  className="hidden"
                />
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};
