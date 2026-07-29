'use client';

import React, { useState, useRef } from 'react';
import { X, Download, Layers, Lock, FileCode, CheckCircle2, UploadCloud } from 'lucide-react';
import { useDawStore } from '@/lib/store';
import { renderMasterWav, renderTrackStem } from '@/lib/audio/StemRenderer';

interface StemExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStore: () => void;
}

export const StemExportModal: React.FC<StemExportModalProps> = ({ isOpen, onClose, onOpenStore }) => {
  const { tracks, bpm, stepCount, hasCreatorStems, exportProjectJSON, importProjectJSON } = useDawStore();
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const jsonInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleExportMaster = async () => {
    setIsExporting(true);
    setExportMessage('Rendering Master Stereo 16-bit WAV...');

    try {
      const wavBlob = await renderMasterWav(tracks, bpm, stepCount);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FL_Studio_Master_${Date.now()}.wav`;
      a.click();
      setExportMessage('Master WAV Downloaded!');
    } catch (err) {
      console.error(err);
      setExportMessage('Error exporting WAV');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportStems = async () => {
    if (!hasCreatorStems) {
      onOpenStore();
      return;
    }

    setIsExporting(true);
    setExportMessage('Rendering Individual Track Stems...');

    try {
      for (const track of tracks) {
        if (track.muted) continue;
        const stemBlob = await renderTrackStem(track, bpm, stepCount);
        const url = URL.createObjectURL(stemBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Stem_${track.name.replace(/\s+/g, '_')}_${Date.now()}.wav`;
        a.click();
      }
      setExportMessage('All Track Stems Downloaded!');
    } catch (err) {
      console.error(err);
      setExportMessage('Error exporting stems');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveJson = () => {
    const json = exportProjectJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FL_Studio_Project_${Date.now()}.flp.json`;
    a.click();
  };

  const handleLoadJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importProjectJSON(content);
        if (success) {
          setExportMessage('Project State Imported Successfully!');
        } else {
          setExportMessage('Invalid Project JSON File');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0c0d10]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1e1e26] border border-[#383b4c] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-[#262834] px-6 py-4 border-b border-[#383b4c] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Download size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-100 uppercase tracking-wide">
                EXPORT AUDIO & PROJECT STATE
              </h2>
              <p className="text-xs text-slate-400">High-fidelity 16-bit WAV rendering & JSON project backup</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#333646] hover:bg-[#41455a] text-slate-300 flex items-center justify-center transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status Alert */}
          {exportMessage && (
            <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 size={16} />
              <span>{exportMessage}</span>
            </div>
          )}

          {/* Option 1: Master Stereo Export */}
          <div className="bg-[#171820] p-4 rounded-xl border border-[#373a4b] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-100 uppercase">STEREO MASTER WAV</h3>
              <p className="text-xs text-slate-400">Full song mix render (44.1kHz 16-bit PCM)</p>
            </div>
            <button
              onClick={handleExportMaster}
              disabled={isExporting}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              EXPORT WAV
            </button>
          </div>

          {/* Option 2: Track Stems Export (Paywalled) */}
          <div className="bg-[#171820] p-4 rounded-xl border border-[#373a4b] flex items-center justify-between relative">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-extrabold text-slate-100 uppercase">INDIVIDUAL TRACK STEMS</h3>
                {!hasCreatorStems && (
                  <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/40">
                    STEMS PASS
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Render separate Kick, Snare, Synth WAV files</p>
            </div>

            <button
              onClick={handleExportStems}
              disabled={isExporting}
              className={`px-4 py-2 rounded-lg font-extrabold text-xs transition-all flex items-center space-x-1.5 active:scale-95 disabled:opacity-50 ${
                hasCreatorStems
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
              }`}
            >
              {!hasCreatorStems && <Lock size={14} />}
              <span>{hasCreatorStems ? 'EXPORT STEMS' : 'UNLOCK STEMS ($14.99)'}</span>
            </button>
          </div>

          {/* Option 3: Save / Load Project JSON */}
          <div className="bg-[#171820] p-4 rounded-xl border border-[#373a4b] space-y-3">
            <h3 className="text-sm font-extrabold text-slate-100 uppercase flex items-center space-x-2">
              <FileCode size={16} className="text-amber-500" />
              <span>PROJECT FILE STATE (.FLP.JSON)</span>
            </h3>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleSaveJson}
                className="flex-1 py-2 rounded-lg bg-[#2b2d39] hover:bg-[#393c4c] text-slate-200 font-extrabold text-xs border border-[#3f4356] transition-all flex items-center justify-center space-x-1.5"
              >
                <Download size={14} />
                <span>SAVE PROJECT JSON</span>
              </button>

              <label className="flex-1 py-2 rounded-lg bg-[#2b2d39] hover:bg-[#393c4c] text-slate-200 font-extrabold text-xs border border-[#3f4356] transition-all flex items-center justify-center space-x-1.5 cursor-pointer">
                <UploadCloud size={14} />
                <span>IMPORT PROJECT JSON</span>
                <input
                  ref={jsonInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleLoadJson}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
