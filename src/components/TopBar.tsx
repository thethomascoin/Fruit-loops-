'use client';

import React, { useState } from 'react';
import {
  Play,
  Pause,
  Square,
  Circle,
  Volume2,
  SlidersHorizontal,
  Music2,
  Sparkles,
  Download,
  ShoppingBag,
  Save,
  Crown,
  Grid,
  Layers,
} from 'lucide-react';
import { useDawStore } from '@/lib/store';
import { audioEngine } from '@/lib/audio/AudioEngine';
import { AudioVisualizer } from './AudioVisualizer';

interface TopBarProps {
  onOpenStore: () => void;
  onOpenExport: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenStore, onOpenExport }) => {
  const {
    isPlaying,
    isRecording,
    bpm,
    currentStep,
    masterVolume,
    masterPitch,
    activeTab,
    hasProPass,
    hasExpansionPack,
    hasCreatorStems,
    setBpm,
    setMasterVolume,
    setMasterPitch,
    setIsRecording,
    setActiveTab,
  } = useDawStore();

  const [bpmInput, setBpmInput] = useState(bpm.toString());

  const handlePlayToggle = () => {
    if (isPlaying) {
      audioEngine.pause();
    } else {
      audioEngine.play();
    }
  };

  const handleStop = () => {
    audioEngine.stop();
  };

  const handleRecordToggle = () => {
    setIsRecording(!isRecording);
  };

  const handleBpmChange = (val: number) => {
    const clamped = Math.max(40, Math.min(240, val));
    setBpm(clamped);
    setBpmInput(clamped.toString());
    audioEngine.setBpm(clamped);
  };

  // Convert currentStep into Bars:Beats:Ticks
  const currentBar = Math.floor(currentStep / 16) + 1;
  const currentBeat = Math.floor((currentStep % 16) / 4) + 1;
  const currentTick = ((currentStep % 4) * 24).toString().padStart(2, '0');

  return (
    <header className="h-16 bg-[#23252d] border-b border-[#373a46] px-4 flex items-center justify-between select-none shadow-md">
      {/* Left Section: Logo & Transport */}
      <div className="flex items-center space-x-4">
        {/* Brand Logo */}
        <div className="flex items-center space-x-2 mr-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-500 flex items-center justify-center font-black text-white text-lg shadow-lg">
            FL
          </div>
          <div>
            <span className="font-extrabold tracking-wider text-slate-100 text-sm block">
              FL STUDIO <span className="text-amber-500 text-xs font-semibold">PRO</span>
            </span>
            <span className="text-[10px] text-slate-400 block -mt-1 font-mono">
              WEB DAW ENGINE
            </span>
          </div>
        </div>

        {/* Transport Buttons */}
        <div className="flex items-center space-x-1.5 bg-[#191a20] p-1.5 rounded-lg border border-[#343744]">
          <button
            onClick={handlePlayToggle}
            className={`w-9 h-9 rounded-md flex items-center justify-center transition-all ${
              isPlaying
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                : 'bg-[#2b2d38] text-slate-300 hover:bg-[#383b49]'
            }`}
            title="Play / Pause (Space)"
          >
            {isPlaying ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current ml-0.5" />}
          </button>

          <button
            onClick={handleStop}
            className="w-9 h-9 rounded-md bg-[#2b2d38] text-slate-300 hover:bg-[#383b49] flex items-center justify-center transition-all"
            title="Stop"
          >
            <Square size={16} className="fill-current" />
          </button>

          <button
            onClick={handleRecordToggle}
            className={`w-9 h-9 rounded-md flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/30'
                : 'bg-[#2b2d38] text-slate-400 hover:bg-[#383b49]'
            }`}
            title="Record (R)"
          >
            <Circle size={16} className="fill-current" />
          </button>
        </div>

        {/* Song Position Display */}
        <div className="bg-[#121317] px-3 py-1.5 rounded-lg border border-[#2d303d] flex items-center space-x-2 font-mono text-emerald-400 font-bold text-base shadow-inner">
          <span className="text-[11px] text-slate-500 font-sans">BAR</span>
          <span>
            {String(currentBar).padStart(3, '0')}:{String(currentBeat).padStart(2, '0')}:{currentTick}
          </span>
        </div>

        {/* BPM Counter */}
        <div className="flex items-center space-x-2 bg-[#191a20] px-3 py-1.5 rounded-lg border border-[#343744]">
          <span className="text-xs font-bold text-slate-400">BPM</span>
          <input
            type="number"
            value={bpmInput}
            onChange={(e) => setBpmInput(e.target.value)}
            onBlur={() => handleBpmChange(parseInt(bpmInput) || 120)}
            className="w-14 bg-[#121317] border border-[#343744] rounded px-1.5 py-0.5 text-center font-mono font-bold text-amber-400 text-sm focus:outline-none focus:border-amber-500"
            min={40}
            max={240}
          />
        </div>
      </div>

      {/* Center Section: Visualizer & Navigation Tabs */}
      <div className="flex items-center space-x-4">
        {/* Oscilloscope Visualizer */}
        <AudioVisualizer />

        {/* Workspace Navigation Tabs */}
        <nav className="flex items-center bg-[#191a20] p-1 rounded-xl border border-[#343744]">
          <button
            onClick={() => setActiveTab('channelRack')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'channelRack'
                ? 'bg-[#3b82f6] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#282a35]'
            }`}
          >
            <Grid size={15} />
            <span>Channel Rack</span>
          </button>

          <button
            onClick={() => setActiveTab('pianoRoll')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'pianoRoll'
                ? 'bg-[#3b82f6] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#282a35]'
            }`}
          >
            <Music2 size={15} />
            <span>Piano Roll</span>
          </button>

          <button
            onClick={() => setActiveTab('mixer')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'mixer'
                ? 'bg-[#3b82f6] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#282a35]'
            }`}
          >
            <SlidersHorizontal size={15} />
            <span>Mixer</span>
          </button>

          <button
            onClick={() => setActiveTab('proFx')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
              activeTab === 'proFx'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-amber-400 hover:text-amber-300 hover:bg-[#282a35]'
            }`}
          >
            <Sparkles size={15} />
            <span>Pro FX</span>
            {!hasProPass && (
              <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1 right-1 animate-ping" />
            )}
          </button>
        </nav>
      </div>

      {/* Right Section: Master Control & Monetization Store */}
      <div className="flex items-center space-x-3">
        {/* Tier Badges */}
        <div className="hidden lg:flex items-center space-x-1.5">
          {hasProPass && (
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
              <Crown size={12} />
              <span>PRO PASS</span>
            </span>
          )}
          {hasExpansionPack && (
            <span className="bg-blue-500/20 text-blue-400 border border-blue-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
              EXPANSION
            </span>
          )}
          {hasCreatorStems && (
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
              STEMS
            </span>
          )}
        </div>

        {/* Master Volume */}
        <div className="flex items-center space-x-1.5 bg-[#191a20] px-3 py-1.5 rounded-lg border border-[#343744]">
          <Volume2 size={15} className="text-slate-400" />
          <input
            type="range"
            min={-40}
            max={6}
            value={masterVolume}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setMasterVolume(val);
              audioEngine.setMasterVolume(val);
            }}
            className="w-16 accent-emerald-500 cursor-pointer h-1.5 bg-[#2d303d] rounded-lg"
          />
        </div>

        {/* Store Button */}
        <button
          onClick={onOpenStore}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/20 transition-all active:scale-95"
        >
          <ShoppingBag size={15} />
          <span>PRO STORE</span>
        </button>

        {/* Export Button */}
        <button
          onClick={onOpenExport}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#2b2d38] hover:bg-[#383b49] text-slate-200 text-xs font-semibold border border-[#3e4252] transition-all"
        >
          <Download size={15} className="text-emerald-400" />
          <span>EXPORT</span>
        </button>
      </div>
    </header>
  );
};
