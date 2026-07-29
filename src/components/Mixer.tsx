'use client';

import React, { useState } from 'react';
import { Sliders, Lock, Volume2, ShieldAlert } from 'lucide-react';
import { useDawStore, MixerTrackState } from '@/lib/store';
import { audioEngine } from '@/lib/audio/AudioEngine';

interface MixerProps {
  onOpenStore: () => void;
}

export const Mixer: React.FC<MixerProps> = ({ onOpenStore }) => {
  const { mixerTracks, hasProPass, updateMixerTrack } = useDawStore();
  const [selectedChannelId, setSelectedChannelId] = useState<number>(0);

  const selectedTrack = mixerTracks.find((m) => m.id === selectedChannelId) || mixerTracks[0];

  const handleVolumeChange = (id: number, vol: number) => {
    updateMixerTrack(id, { volume: vol });
    const targetState = mixerTracks.find((m) => m.id === id);
    if (targetState) {
      audioEngine.updateMixerChannel(id, { ...targetState, volume: vol });
    }
  };

  const handlePanChange = (id: number, pan: number) => {
    updateMixerTrack(id, { pan });
    const targetState = mixerTracks.find((m) => m.id === id);
    if (targetState) {
      audioEngine.updateMixerChannel(id, { ...targetState, pan });
    }
  };

  const handleEqChange = (id: number, band: 'low' | 'mid' | 'high', val: number) => {
    const newEq = { ...selectedTrack.eq, [band]: val };
    updateMixerTrack(id, { eq: newEq });
    audioEngine.updateMixerChannel(id, { ...selectedTrack, eq: newEq });
  };

  const handleReverbSend = (id: number, send: number) => {
    const newReverb = { ...selectedTrack.reverb, send };
    updateMixerTrack(id, { reverb: newReverb });
    audioEngine.updateMixerChannel(id, { ...selectedTrack, reverb: newReverb });
  };

  const handleDelaySend = (id: number, send: number) => {
    const newDelay = { ...selectedTrack.delay, send };
    updateMixerTrack(id, { delay: newDelay });
    audioEngine.updateMixerChannel(id, { ...selectedTrack, delay: newDelay });
  };

  return (
    <div className="flex-1 bg-[#1e1e24] p-4 flex space-x-4 overflow-hidden">
      {/* Left: Channel Strips Grid */}
      <div className="flex-1 flex flex-col bg-[#191a20] border border-[#373a46] rounded-xl overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-[#272932] px-4 py-2 border-b border-[#373a46] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders size={16} className="text-amber-500" />
            <h2 className="text-sm font-extrabold tracking-wide text-slate-200 uppercase">
              MIXER RACK ({hasProPass ? '32 INSERTS UNLOCKED' : '8 FREE INSERTS'})
            </h2>
          </div>
          {!hasProPass && (
            <button
              onClick={onOpenStore}
              className="flex items-center space-x-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold rounded-lg hover:bg-amber-500/30 transition-all"
            >
              <Lock size={13} />
              <span>UNLOCK 32 CHANNELS ($9.99)</span>
            </button>
          )}
        </div>

        {/* Fader Channels Rack */}
        <div className="flex-1 p-3 flex space-x-2 overflow-x-auto">
          {mixerTracks.map((track) => {
            const isMaster = track.id === 0;
            const isLocked = !hasProPass && track.id > 8;
            const isSelected = track.id === selectedChannelId;

            return (
              <div
                key={track.id}
                onClick={() => !isLocked && setSelectedChannelId(track.id)}
                className={`w-16 min-w-[64px] flex flex-col items-center p-2 rounded-xl border transition-all relative select-none ${
                  isLocked
                    ? 'bg-[#15161b] border-[#292b36] opacity-60 cursor-not-allowed'
                    : isSelected
                    ? 'bg-[#262835] border-amber-500 shadow-lg shadow-amber-500/10 cursor-pointer'
                    : 'bg-[#20222a] border-[#303342] hover:bg-[#252733] cursor-pointer'
                }`}
              >
                {/* Lock Overlay for > 8 channels */}
                {isLocked && (
                  <div className="absolute inset-0 bg-[#0d0e12]/80 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center p-1 text-center z-10">
                    <Lock size={16} className="text-amber-500 mb-1" />
                    <span className="text-[9px] font-bold text-amber-400">PRO</span>
                  </div>
                )}

                {/* Track Label */}
                <div
                  className={`w-full py-1 rounded text-center font-extrabold text-[10px] truncate mb-2 ${
                    isMaster
                      ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                      : 'bg-[#181920] text-slate-300'
                  }`}
                >
                  {isMaster ? 'MASTER' : `#${track.id}`}
                </div>

                {/* Pan Slider */}
                <input
                  type="range"
                  min={-1}
                  max={1}
                  step={0.1}
                  value={track.pan}
                  onChange={(e) => handlePanChange(track.id, parseFloat(e.target.value))}
                  disabled={isLocked}
                  className="w-12 h-1 accent-blue-500 bg-[#353849] rounded cursor-pointer mb-3"
                  title={`Pan: ${track.pan}`}
                />

                {/* Vertical Volume Fader */}
                <div className="flex-1 flex items-center justify-center py-2 relative">
                  <input
                    type="range"
                    min={-40}
                    max={6}
                    step={0.5}
                    value={track.volume}
                    onChange={(e) => handleVolumeChange(track.id, parseFloat(e.target.value))}
                    disabled={isLocked}
                    className="h-36 accent-amber-500 cursor-pointer bg-[#353849] rounded-lg -rotate-90 origin-center"
                    style={{ width: '120px' }}
                  />
                </div>

                {/* Volume Readout */}
                <div className="font-mono text-[10px] font-bold text-amber-400 mt-2">
                  {track.volume > 0 ? `+${track.volume}` : track.volume}dB
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Selected Channel FX Rack (3-Band EQ, Reverb, Delay) */}
      <div className="w-80 bg-[#191a20] border border-[#373a46] rounded-xl flex flex-col overflow-hidden shadow-xl">
        <div className="bg-[#272932] px-4 py-2 border-b border-[#373a46] flex items-center justify-between">
          <h3 className="text-sm font-extrabold tracking-wide text-slate-200 uppercase">
            FX INSERT RACK - {selectedTrack.id === 0 ? 'MASTER' : `TRACK #${selectedTrack.id}`}
          </h3>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-5">
          {/* 3-Band EQ */}
          <div className="bg-[#20222a] p-3 rounded-lg border border-[#303342]">
            <h4 className="text-xs font-extrabold text-amber-400 uppercase mb-3 flex items-center justify-between">
              <span>3-BAND PARAMETRIC EQ</span>
              <span className="text-[10px] text-slate-400 font-mono">dB GAIN</span>
            </h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                  <span>LOW BASS</span>
                  <span className="font-mono text-amber-400">{selectedTrack.eq.low} dB</span>
                </div>
                <input
                  type="range"
                  min={-12}
                  max={12}
                  value={selectedTrack.eq.low}
                  onChange={(e) => handleEqChange(selectedTrack.id, 'low', parseFloat(e.target.value))}
                  className="w-full h-1.5 accent-amber-500 bg-[#353849] rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                  <span>MID RANGE</span>
                  <span className="font-mono text-amber-400">{selectedTrack.eq.mid} dB</span>
                </div>
                <input
                  type="range"
                  min={-12}
                  max={12}
                  value={selectedTrack.eq.mid}
                  onChange={(e) => handleEqChange(selectedTrack.id, 'mid', parseFloat(e.target.value))}
                  className="w-full h-1.5 accent-amber-500 bg-[#353849] rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                  <span>HIGH TREBLE</span>
                  <span className="font-mono text-amber-400">{selectedTrack.eq.high} dB</span>
                </div>
                <input
                  type="range"
                  min={-12}
                  max={12}
                  value={selectedTrack.eq.high}
                  onChange={(e) => handleEqChange(selectedTrack.id, 'high', parseFloat(e.target.value))}
                  className="w-full h-1.5 accent-amber-500 bg-[#353849] rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Reverb Send */}
          <div className="bg-[#20222a] p-3 rounded-lg border border-[#303342]">
            <div className="flex justify-between text-xs font-extrabold text-blue-400 uppercase mb-2">
              <span>ALGORITHMIC REVERB</span>
              <span className="font-mono text-blue-400">{Math.round(selectedTrack.reverb.send * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={selectedTrack.reverb.send}
              onChange={(e) => handleReverbSend(selectedTrack.id, parseFloat(e.target.value))}
              className="w-full h-1.5 accent-blue-500 bg-[#353849] rounded cursor-pointer"
            />
          </div>

          {/* Delay Send */}
          <div className="bg-[#20222a] p-3 rounded-lg border border-[#303342]">
            <div className="flex justify-between text-xs font-extrabold text-emerald-400 uppercase mb-2">
              <span>TEMPO FEEDBACK DELAY</span>
              <span className="font-mono text-emerald-400">{Math.round(selectedTrack.delay.send * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={selectedTrack.delay.send}
              onChange={(e) => handleDelaySend(selectedTrack.id, parseFloat(e.target.value))}
              className="w-full h-1.5 accent-emerald-500 bg-[#353849] rounded cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
