import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FL Studio Pro Web DAW | Browser-Based Audio Workstation',
  description: 'Production-grade browser-based FL Studio DAW replica built with Next.js 15, Tone.js, Web Audio API, and Stripe monetization.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#1e1e24] text-slate-100 min-h-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
