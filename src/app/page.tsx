'use client';

import React, { useState, useEffect } from 'react';
import { TopBar } from '@/components/TopBar';
import { ChannelRack } from '@/components/ChannelRack';
import { PianoRoll } from '@/components/PianoRoll';
import { Mixer } from '@/components/Mixer';
import { ProFxPanel } from '@/components/ProFxPanel';
import { StoreModal } from '@/components/StoreModal';
import { StemExportModal } from '@/components/StemExportModal';
import { useDawStore } from '@/lib/store';
import { audioEngine, updateSchedulerState } from '@/lib/audio/AudioEngine';
import { Play } from 'lucide-react';

export default function Home() {
  const {
    activeTab,
    isPlaying,
    bpm,
    tracks,
    stepCount,
    setCurrentStep,
    setIsPlaying,
    setTier,
  } = useDawStore();

  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [hasStartedAudio, setHasStartedAudio] = useState(false);

  // Keep scheduler in sync with Zustand state
  useEffect(() => {
    updateSchedulerState(tracks, stepCount, (step) => {
      setCurrentStep(step);
    });
  }, [tracks, stepCount, setCurrentStep]);

  // Sync BPM changes to audio engine
  useEffect(() => {
    audioEngine.setBpm(bpm);
  }, [bpm]);

  // Check URL search parameters for payment redirect status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment');
      const tierUnlocked = urlParams.get('tier');

      if (paymentStatus === 'success') {
        if (tierUnlocked === 'pro' || tierUnlocked === 'proPass') {
          setTier('proPass', true);
        } else if (tierUnlocked === 'expansion') {
          setTier('expansion', true);
        } else if (tierUnlocked === 'creatorStems') {
          setTier('creatorStems', true);
        }
        // Clear search params without reload
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [setTier]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying) {
          audioEngine.pause();
          setIsPlaying(false);
        } else {
          audioEngine.play();
          setIsPlaying(true);
        }
      }

      if (e.code === 'Escape') {
        audioEngine.stop();
        setIsPlaying(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, setIsPlaying]);

  const handleStartAudio = async () => {
    await audioEngine.startAudioContext();
    setHasStartedAudio(true);
  };

  return (
    <main
      className="w-screen h-screen bg-[#1e1e24] text-slate-100 flex flex-col overflow-hidden select-none"
      style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
      onClick={!hasStartedAudio ? handleStartAudio : undefined}
    >
      {/* Audio Engine Unlock Banner */}
      {!hasStartedAudio && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 py-1.5 px-4 text-center cursor-pointer font-bold text-xs text-slate-950 flex items-center justify-center space-x-2 shadow-md hover:brightness-110 transition-all z-40 shrink-0">
          <Play size={13} className="fill-current animate-pulse" />
          <span>CLICK ANYWHERE TO INITIALIZE WEB AUDIO DSP ENGINE</span>
        </div>
      )}

      {/* Top Transport Bar */}
      <TopBar
        onOpenStore={() => setIsStoreOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Main Workspace Panel */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {activeTab === 'channelRack' && <ChannelRack />}
        {activeTab === 'pianoRoll' && <PianoRoll />}
        {activeTab === 'mixer' && <Mixer onOpenStore={() => setIsStoreOpen(true)} />}
        {activeTab === 'proFx' && <ProFxPanel onOpenStore={() => setIsStoreOpen(true)} />}
      </div>

      {/* Modals */}
      <StoreModal
        isOpen={isStoreOpen}
        onClose={() => setIsStoreOpen(false)}
      />

      <StemExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onOpenStore={() => setIsStoreOpen(true)}
      />
    </main>
  );
}
