'use client';

import React, { useState } from 'react';
import { X, Crown, Sparkles, DownloadCloud, CheckCircle2, Zap, Play } from 'lucide-react';
import { useDawStore } from '@/lib/store';
import confetti from 'canvas-confetti';

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoreModal: React.FC<StoreModalProps> = ({ isOpen, onClose }) => {
  const { hasProPass, hasExpansionPack, hasCreatorStems, setTier } = useDawStore();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckout = async (priceIdEnvKey: string, tierId: 'proPass' | 'expansion' | 'creatorStems') => {
    setLoadingPriceId(priceIdEnvKey);

    // Grab price ID from client side process.env or fallback
    let priceId = '';
    if (tierId === 'proPass') priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_PASS || 'price_pro_pass_live';
    if (tierId === 'expansion') priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_SAMPLE_PACK || 'price_sample_pack_live';
    if (tierId === 'creatorStems') priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_CREATOR_STEMS || 'price_creator_stems_live';

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, tierId }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        // Instant simulated unlock fallback for demo testing
        setTier(tierId, true);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setLoadingPriceId(null);
      }
    } catch (err) {
      console.warn('Checkout API Notice, instant unlocking tier:', err);
      setTier(tierId, true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setLoadingPriceId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0c0d10]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1e1e26] border border-[#383b4c] rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#262834] px-6 py-4 border-b border-[#383b4c] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black">
              <Crown size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-100 uppercase tracking-wide">
                FL STUDIO PRO STORE & EXPANSIONS
              </h2>
              <p className="text-xs text-slate-400">Unlock Pro FX, Sample Kits, and Track Stem Exporters</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#333646] hover:bg-[#41455a] text-slate-300 flex items-center justify-center transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Store Products Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto">
          {/* Product 1: Pro Studio Pass */}
          <div className="bg-[#171820] rounded-xl border border-[#373a4b] p-5 flex flex-col justify-between hover:border-amber-500/50 transition-all shadow-lg relative">
            {hasProPass && (
              <span className="absolute top-3 right-3 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                <CheckCircle2 size={12} />
                <span>UNLOCKED</span>
              </span>
            )}
            <div>
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-3">
                <Crown size={22} />
              </div>
              <h3 className="text-sm font-extrabold text-slate-100 uppercase mb-1">PRO STUDIO PASS</h3>
              <div className="font-mono text-xl font-black text-amber-400 mb-3">
                $9.99 <span className="text-xs text-slate-400 font-normal">/ month</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 mb-6">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 size={14} className="text-amber-500 shrink-0" />
                  <span>32 Insert Mixer Channels</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 size={14} className="text-amber-500 shrink-0" />
                  <span>Tape Saturation Node</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 size={14} className="text-amber-500 shrink-0" />
                  <span>Auto-Pitch Correction</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 size={14} className="text-amber-500 shrink-0" />
                  <span>Multiband Compressor & Limiter</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleCheckout('NEXT_PUBLIC_STRIPE_PRICE_PRO_PASS', 'proPass')}
              disabled={hasProPass || loadingPriceId === 'NEXT_PUBLIC_STRIPE_PRICE_PRO_PASS'}
              className={`w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 transition-all ${
                hasProPass
                  ? 'bg-[#2b2d39] text-slate-500 cursor-default'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 shadow-lg shadow-orange-500/20 active:scale-95'
              }`}
            >
              {hasProPass ? (
                <span>ACTIVE PLAN</span>
              ) : loadingPriceId === 'NEXT_PUBLIC_STRIPE_PRICE_PRO_PASS' ? (
                <span>REDIRECTING...</span>
              ) : (
                <>
                  <Zap size={14} />
                  <span>SUBSCRIBE NOW</span>
                </>
              )}
            </button>
          </div>

          {/* Product 2: Expansion Pack: Trap & Drill */}
          <div className="bg-[#171820] rounded-xl border border-[#373a4b] p-5 flex flex-col justify-between hover:border-blue-500/50 transition-all shadow-lg relative">
            {hasExpansionPack && (
              <span className="absolute top-3 right-3 bg-blue-500/20 border border-blue-500/40 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                <CheckCircle2 size={12} />
                <span>UNLOCKED</span>
              </span>
            )}
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-3">
                <Sparkles size={22} />
              </div>
              <h3 className="text-sm font-extrabold text-slate-100 uppercase mb-1">TRAP & DRILL KIT</h3>
              <div className="font-mono text-xl font-black text-blue-400 mb-3">
                $4.99 <span className="text-xs text-slate-400 font-normal">one-time</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 mb-6">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 size={14} className="text-blue-500 shrink-0" />
                  <span>50+ Hard 808s & Snares</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 size={14} className="text-blue-500 shrink-0" />
                  <span>Custom WAV/MP3 Uploader</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 size={14} className="text-blue-500 shrink-0" />
                  <span>Synthwave & Boom Bap Kits</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleCheckout('NEXT_PUBLIC_STRIPE_PRICE_SAMPLE_PACK', 'expansion')}
              disabled={hasExpansionPack || loadingPriceId === 'NEXT_PUBLIC_STRIPE_PRICE_SAMPLE_PACK'}
              className={`w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 transition-all ${
                hasExpansionPack
                  ? 'bg-[#2b2d39] text-slate-500 cursor-default'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-95'
              }`}
            >
              {hasExpansionPack ? (
                <span>OWNED</span>
              ) : loadingPriceId === 'NEXT_PUBLIC_STRIPE_PRICE_SAMPLE_PACK' ? (
                <span>REDIRECTING...</span>
              ) : (
                <>
                  <Zap size={14} />
                  <span>BUY PACK ($4.99)</span>
                </>
              )}
            </button>
          </div>

          {/* Product 3: Creator Stems & Cloud Pass */}
          <div className="bg-[#171820] rounded-xl border border-[#373a4b] p-5 flex flex-col justify-between hover:border-emerald-500/50 transition-all shadow-lg relative">
            {hasCreatorStems && (
              <span className="absolute top-3 right-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                <CheckCircle2 size={12} />
                <span>UNLOCKED</span>
              </span>
            )}
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3">
                <DownloadCloud size={22} />
              </div>
              <h3 className="text-sm font-extrabold text-slate-100 uppercase mb-1">CREATOR STEMS PASS</h3>
              <div className="font-mono text-xl font-black text-emerald-400 mb-3">
                $14.99 <span className="text-xs text-slate-400 font-normal">/ month</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 mb-6">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>Separate Track Stem Exporter</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>OfflineAudioContext Studio Render</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>Cloud JSON Project Backup</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleCheckout('NEXT_PUBLIC_STRIPE_PRICE_CREATOR_STEMS', 'creatorStems')}
              disabled={hasCreatorStems || loadingPriceId === 'NEXT_PUBLIC_STRIPE_PRICE_CREATOR_STEMS'}
              className={`w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 transition-all ${
                hasCreatorStems
                  ? 'bg-[#2b2d39] text-slate-500 cursor-default'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 active:scale-95'
              }`}
            >
              {hasCreatorStems ? (
                <span>ACTIVE PLAN</span>
              ) : loadingPriceId === 'NEXT_PUBLIC_STRIPE_PRICE_CREATOR_STEMS' ? (
                <span>REDIRECTING...</span>
              ) : (
                <>
                  <Zap size={14} />
                  <span>SUBSCRIBE NOW</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
