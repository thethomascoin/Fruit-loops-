'use client';

import React, { useEffect, useRef } from 'react';
import { audioEngine } from '@/lib/audio/AudioEngine';
import { useDawStore } from '@/lib/store';

export const AudioVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isPlaying = useDawStore((state) => state.isPlaying);

  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Background grid lines
      ctx.strokeStyle = '#2d303a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      if (isPlaying) {
        const waveform = audioEngine.getWaveformData();

        // Draw Oscilloscope Line
        ctx.strokeStyle = '#22c55e'; // FL Green Accent
        ctx.lineWidth = 2;
        ctx.beginPath();

        const sliceWidth = width / waveform.length;
        let x = 0;

        for (let i = 0; i < waveform.length; i++) {
          const v = (waveform[i] + 1) / 2; // Normalize -1..1 to 0..1
          const y = v * height;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.stroke();

        // Draw Spectrum Bars overlay
        const fft = audioEngine.getFftData();
        const barWidth = width / fft.length;

        for (let i = 0; i < fft.length; i++) {
          // Normalize dB (-100 to 0) to height
          const barHeight = Math.max(0, (fft[i] + 100) / 100) * height * 0.7;
          ctx.fillStyle = 'rgba(59, 130, 246, 0.25)'; // Electric Blue
          ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
        }
      } else {
        // Idle flat line
        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width={240}
      height={48}
      className="bg-[#18181c] border border-[#373a46] rounded-md shadow-inner"
    />
  );
};
