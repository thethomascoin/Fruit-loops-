'use client';

import React, { useState } from 'react';
import { Music, Trash2, Edit3, Eraser, Volume2 } from 'lucide-react';
import { useDawStore, PianoRollNote } from '@/lib/store';
import { instrumentEngine } from '@/lib/audio/Synthesizers';
import { audioEngine } from '@/lib/audio/AudioEngine';

const PITCHES = [
  'C6', 'B5', 'A#5', 'A5', 'G#5', 'G5', 'F#5', 'F5', 'E5', 'D#5', 'D5', 'C#5',
  'C5', 'B4', 'A#4', 'A4', 'G#4', 'G4', 'F#4', 'F4', 'E4', 'D#4', 'D4', 'C#4',
  'C4', 'B3', 'A#3', 'A3', 'G#3', 'G3', 'F#3', 'F3', 'E3', 'D#3', 'D3', 'C#3', 'C3'
];

export const PianoRoll: React.FC = () => {
  const {
    tracks,
    activeTrackId,
    currentStep,
    stepCount,
    addPianoRollNote,
    removePianoRollNote,
    clearPianoRollNotes,
  } = useDawStore();

  const [tool, setTool] = useState<'draw' | 'erase'>('draw');
  const [selectedVelocity, setSelectedVelocity] = useState(0.85);

  const activeTrack = tracks.find((t) => t.id === activeTrackId) || tracks[0];

  const handleCellClick = (pitch: string, stepIdx: number) => {
    if (!activeTrack) return;

    const existingNote = activeTrack.pianoRollNotes.find(
      (n) => n.pitch === pitch && n.step === stepIdx
    );

    if (tool === 'erase' || existingNote) {
      if (existingNote) {
        removePianoRollNote(activeTrack.id, existingNote.id);
      }
    } else {
      // Add new note
      const newNote: PianoRollNote = {
        id: `note-${Date.now()}-${Math.random()}`,
        pitch,
        step: stepIdx,
        duration: 1,
        velocity: selectedVelocity,
      };

      addPianoRollNote(activeTrack.id, newNote);

      // Audition note sound — no destination needed, plays to master output
      audioEngine.startAudioContext().then(() => {
        instrumentEngine.triggerSound(
          activeTrack.soundType,
          selectedVelocity,
          activeTrack.customSampleUrl
        );
      });
    }
  };

  return (
    <div className="flex-1 bg-[#1e1e24] p-4 flex flex-col overflow-hidden">
      {/* Piano Roll Header Controls */}
      <div className="flex items-center justify-between bg-[#272932] px-4 py-2 rounded-t-xl border border-[#373a46]">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Music size={16} className="text-emerald-400" />
            <h2 className="text-sm font-extrabold tracking-wide text-slate-200 uppercase">
              PIANO ROLL - <span style={{ color: activeTrack?.color }}>{activeTrack?.name || 'TRACK'}</span>
            </h2>
          </div>

          {/* Draw / Erase Tool Switches */}
          <div className="flex items-center space-x-1 bg-[#1a1b22] p-1 rounded-lg border border-[#373a46]">
            <button
              onClick={() => setTool('draw')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-bold transition-all ${
                tool === 'draw' ? 'bg-[#3b82f6] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Edit3 size={13} />
              <span>DRAW</span>
            </button>
            <button
              onClick={() => setTool('erase')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-bold transition-all ${
                tool === 'erase' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eraser size={13} />
              <span>ERASE</span>
            </button>
          </div>

          {/* Velocity Control */}
          <div className="flex items-center space-x-2 bg-[#1a1b22] px-3 py-1 rounded border border-[#373a46]">
            <Volume2 size={14} className="text-slate-400" />
            <span className="text-[11px] font-bold text-slate-400">VELOCITY:</span>
            <input
              type="range"
              min={0.1}
              max={1.0}
              step={0.05}
              value={selectedVelocity}
              onChange={(e) => setSelectedVelocity(parseFloat(e.target.value))}
              className="w-16 h-1.5 accent-emerald-500 cursor-pointer bg-[#333646] rounded-lg"
            />
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {Math.round(selectedVelocity * 100)}%
            </span>
          </div>
        </div>

        {/* Clear All Notes */}
        <button
          onClick={() => activeTrack && clearPianoRollNotes(activeTrack.id)}
          className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-rose-950/60 hover:bg-rose-900 border border-rose-800/40 text-rose-300 text-xs font-semibold transition-all"
        >
          <Trash2 size={13} />
          <span>CLEAR ROLL</span>
        </button>
      </div>

      {/* Main Piano Roll Keyboard & Grid Area */}
      <div className="flex-1 bg-[#191a20] border-x border-b border-[#373a46] rounded-b-xl flex overflow-hidden">
        {/* Pitch Keybed (C3 to C6) */}
        <div className="w-20 bg-[#14151a] border-r border-[#373a46] overflow-y-auto select-none">
          {PITCHES.map((pitch) => {
            const isBlackKey = pitch.includes('#');
            return (
              <div
                key={pitch}
                className={`h-6 flex items-center justify-end px-2 border-b border-[#262833] text-[10px] font-mono font-bold transition-colors ${
                  isBlackKey
                    ? 'bg-[#1a1b22] text-amber-500 font-extrabold'
                    : 'bg-[#282a36] text-slate-300'
                }`}
              >
                {pitch}
              </div>
            );
          })}
        </div>

        {/* Note Step Grid */}
        <div className="flex-1 overflow-auto flex flex-col">
          <div className="flex-1 min-w-[640px]">
            {PITCHES.map((pitch) => {
              const isBlackKey = pitch.includes('#');

              return (
                <div key={pitch} className="h-6 flex items-center border-b border-[#262833]">
                  {Array.from({ length: stepCount }).map((_, stepIdx) => {
                    const note = activeTrack?.pianoRollNotes.find(
                      (n) => n.pitch === pitch && n.step === stepIdx
                    );
                    const isCurrent = currentStep === stepIdx;
                    const isBeatBorder = stepIdx % 4 === 0;

                    return (
                      <button
                        key={stepIdx}
                        onClick={() => handleCellClick(pitch, stepIdx)}
                        className={`h-full flex-1 border-r transition-all relative ${
                          isBeatBorder ? 'border-[#383b4c]' : 'border-[#232532]'
                        } ${isBlackKey ? 'bg-[#181920]' : 'bg-[#1f2029]'} ${
                          isCurrent ? 'bg-emerald-500/10' : ''
                        } hover:bg-[#323648]`}
                      >
                        {note && (
                          <div
                            className="absolute inset-0.5 rounded shadow-md flex items-center justify-center font-mono text-[9px] font-bold text-slate-950 truncate px-1"
                            style={{
                              backgroundColor: activeTrack?.color || '#22c55e',
                              opacity: 0.2 + note.velocity * 0.8,
                            }}
                          >
                            {pitch}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
