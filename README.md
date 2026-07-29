<<<<<<< HEAD
# FL Studio Web DAW Clone

A production-grade, browser-based **FL Studio DAW replica** built with Next.js 15, Tone.js, Web Audio API, Tailwind CSS, and Stripe monetization. Ready for native Vercel deployment.

---

## 🎵 Feature Overview

### Free Tier (Core DAW)
- **Channel Rack / Sequencer**: 16 or 32-step grid with 6 stock synthesized instruments (808 Kick, Snare, HiHat, Clap, Sub Bass, Saw Lead)
- **Piano Roll**: Interactive C3–C6 note editor with Draw/Erase tools and velocity control
- **Mixer**: 8 insert channels with Volume, Pan, 3-Band EQ, Reverb & Delay
- **Master WAV Export**: Full stereo 16-bit 44.1kHz render
- **Transport**: Play/Pause/Stop, interactive BPM (40–240), real-time oscilloscope visualizer
- **Keyboard Shortcuts**: Space = Play/Pause, Escape = Stop

### Pro Studio Pass ($9.99/mo)
- 32 Insert Mixer Channels
- Tape Saturation DSP Node
- Auto-Pitch Correction
- Multiband Compressor
- Brickwall Mastering Limiter

### Expansion Pack: Trap & Drill Kit ($4.99 one-time)
- Custom WAV/MP3 drag-and-drop sample uploader
- Expansion sound kit access

### Creator Stems & Cloud Pass ($14.99/mo)
- Individual track stem exporter (separate WAVs per instrument)
- JSON project save/load (import & export `.flp.json`)

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Seed Stripe Products & Prices
node scripts/seed-stripe.mjs

# Run local dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Environment Variables

Create a `.env.local` file:

```env
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PRICE_PRO_PASS=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_SAMPLE_PACK=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_CREATOR_STEMS=price_xxx
```

> The seed script `node scripts/seed-stripe.mjs` will automatically populate the `NEXT_PUBLIC_STRIPE_PRICE_*` variables.

---

## 🌐 Vercel Deployment

1. Push to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Set environment variables in Vercel dashboard:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_APP_URL` (your Vercel production URL)
4. Deploy — Vercel auto-detects Next.js and builds from `.next`

### Stripe Webhook Setup (Production)
```
Endpoint URL: https://your-domain.vercel.app/api/stripe/webhook
Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS v4 |
| Audio | Tone.js + Web Audio API |
| State | Zustand |
| Payments | Stripe |
| Icons | Lucide React |
| Animation | Framer Motion |
| Deployment | Vercel |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main DAW workspace
│   ├── layout.tsx            # Root layout with SEO metadata
│   ├── globals.css           # FL Studio dark theme styles
│   └── api/stripe/
│       ├── checkout/         # POST → Stripe Checkout Session
│       └── webhook/          # POST → Stripe Webhook handler
├── components/
│   ├── TopBar.tsx            # Transport controls + BPM + Visualizer
│   ├── ChannelRack.tsx       # 16/32-step sequencer grid
│   ├── PianoRoll.tsx         # C3–C6 note editor
│   ├── Mixer.tsx             # 8/32 channel strips + FX rack
│   ├── ProFxPanel.tsx        # Pro DSP FX (paywalled)
│   ├── StoreModal.tsx        # In-app Stripe store
│   ├── StemExportModal.tsx   # WAV render + project export
│   └── AudioVisualizer.tsx   # Real-time FFT oscilloscope
└── lib/
    ├── store.ts              # Zustand global state
    ├── stripe.ts             # Stripe SDK instance
    └── audio/
        ├── AudioEngine.ts    # Tone.js transport + mixer routing
        ├── Synthesizers.ts   # Drum + synth instrument preview
        ├── DspNodes.ts       # Pro FX DSP chain
        └── StemRenderer.ts   # OfflineAudioContext WAV renderer
```
=======
# Fruit-loops-
a Daw im working on 
>>>>>>> 123baafdb67b64804087ac1d96ff598f1b490c63
