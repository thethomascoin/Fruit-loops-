'use client';

import React from 'react';
import { Sparkles, Crown, Lock, Activity, Disc, Cpu, Zap } from 'lucide-react';
import { useDawStore } from '@/lib/store';
import { proDspEngine } from '@/lib/audio/DspNodes';

interface ProFxPanelProps {
  onOpenStore: () => void;
}

export const ProFxPanel: React.FC<ProFxPanelProps> = ({ onOpenStore }) => {
  const { hasProPass, proFx, updateProFx } = useDawStore();

  const handleSaturationToggle = () => {
    const enabled = !proFx.tapeSaturation.enabled;
    updateProFx('tapeSaturation', { enabled });
    proDspEngine.updateSaturation(enabled, proFx.tapeSaturation.drive);
  };

  const handleSaturationDrive = (drive: number) => {
    updateProFx('tapeSaturation', { drive });
    proDspEngine.updateSaturation(proFx.tapeSaturation.enabled, drive);
  };

  const handleAutoPitchToggle = () => {
    const enabled = !proFx.autoPitch.enabled;
    updateProFx('autoPitch', { enabled });
    proDspEngine.updateAutoPitch(enabled, 0);
  };

  const handleMultibandToggle = () => {
    const enabled = !proFx.multibandComp.enabled;
    updateProFx('multibandComp', { enabled });
    proDspEngine.updateMultiband(enabled, proFx.multibandComp.lowThresh, proFx.multibandComp.highThresh);
  };

  const handleLimiterToggle = () => {
    const enabled = !proFx.masterLimiter.enabled;
    updateProFx('masterLimiter', { enabled });
    proDspEngine.updateLimiter(enabled, proFx.masterLimiter.threshold);
  };

  return (
    <div className="flex-1 bg-[#1e1e24] p-4 flex flex-col overflow-hidden relative">
      {/* Header */}
      <div className="bg-[#272932] px-4 py-2 rounded-t-xl border border-[#373a46] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Crown className="text-amber-400" size={18} />
          <h2 className="text-sm font-extrabold tracking-wide text-slate-200 uppercase">
            MASTERING & PRO STUDIO DSP FX RACK
          </h2>
        </div>

        {!hasProPass && (
          <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-md border border-amber-500/40">
            PRO PASS REQUIRED ($9.99/MO)
          </span>
        )}
      </div>

      {/* Main FX Rack Body */}
      <div className="flex-1 bg-[#191a20] border-x border-b border-[#373a46] rounded-b-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto relative">
        {/* Lock Glassmorphism Overlay if non-Pro */}
        {!hasProPass && (
          <div className="absolute inset-0 bg-[#121317]/85 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center mb-4 shadow-xl shadow-orange-500/20 animate-bounce">
              <Crown size={32} className="text-slate-950" />
            </div>
            <h3 className="text-xl font-black text-slate-100 mb-2">
              UNLOCK PRO STUDIO DSP FX RACK
            </h3>
            <p className="text-sm text-slate-400 max-w-md mb-6">
              Get access to Tape Saturation, Multiband Compressor, Auto-Pitch Node, and Dynamic Mastering Limiter on your master channel.
            </p>
            <button
              onClick={onOpenStore}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm shadow-xl shadow-orange-500/30 transition-transform active:scale-95 flex items-center space-x-2"
            >
              <Zap size={18} />
              <span>UPGRADE TO PRO PASS ($9.99/MO)</span>
            </button>
          </div>
        )}

        {/* 1. Tape Saturation Node */}
        <div className="bg-[#21232d] p-4 rounded-xl border border-[#343746] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Disc className="text-amber-500" size={18} />
              <h3 className="text-xs font-black text-slate-200 uppercase">ANALOGUE TAPE SATURATION</h3>
            </div>
            <button
              onClick={handleSaturationToggle}
              className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                proFx.tapeSaturation.enabled ? 'bg-amber-500' : 'bg-[#373a48]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  proFx.tapeSaturation.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-400 font-semibold mb-1">
                <span>DRIVE / WARMTH</span>
                <span className="font-mono text-amber-400">{Math.round(proFx.tapeSaturation.drive * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={proFx.tapeSaturation.drive}
                onChange={(e) => handleSaturationDrive(parseFloat(e.target.value))}
                className="w-full h-1.5 accent-amber-500 bg-[#353849] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 2. Auto-Pitch Node */}
        <div className="bg-[#21232d] p-4 rounded-xl border border-[#343746] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="text-emerald-400" size={18} />
              <h3 className="text-xs font-black text-slate-200 uppercase">AUTO-PITCH CORRECTION</h3>
            </div>
            <button
              onClick={handleAutoPitchToggle}
              className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                proFx.autoPitch.enabled ? 'bg-emerald-500' : 'bg-[#373a48]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  proFx.autoPitch.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-xs text-slate-400 font-semibold">
              <span>SCALE KEY:</span>
              <span className="font-mono text-emerald-400 font-bold">C MAJOR (CHROMATIC)</span>
            </div>
          </div>
        </div>

        {/* 3. Multiband Compressor */}
        <div className="bg-[#21232d] p-4 rounded-xl border border-[#343746] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Activity className="text-blue-400" size={18} />
              <h3 className="text-xs font-black text-slate-200 uppercase">3-BAND MULTIBAND COMPRESSOR</h3>
            </div>
            <button
              onClick={handleMultibandToggle}
              className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                proFx.multibandComp.enabled ? 'bg-blue-500' : 'bg-[#373a48]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  proFx.multibandComp.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-xs text-slate-400 font-semibold">
              <span>LOW BAND THRESHOLD:</span>
              <span className="font-mono text-blue-400">{proFx.multibandComp.lowThresh} dB</span>
            </div>
          </div>
        </div>

        {/* 4. Dynamic Mastering Limiter */}
        <div className="bg-[#21232d] p-4 rounded-xl border border-[#343746] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Cpu className="text-rose-500" size={18} />
              <h3 className="text-xs font-black text-slate-200 uppercase">BRICKWALL MASTERING LIMITER</h3>
            </div>
            <button
              onClick={handleLimiterToggle}
              className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                proFx.masterLimiter.enabled ? 'bg-rose-500' : 'bg-[#373a48]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  proFx.masterLimiter.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-xs text-slate-400 font-semibold">
              <span>CEILING PEAK:</span>
              <span className="font-mono text-rose-400">{proFx.masterLimiter.ceiling} dB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
