"use client";

import { useMemo, useRef, useEffect } from "react";

interface OptimizedWaveformProps {
  audioBuffer?: AudioBuffer;
  width: number;
  height: number;
  color: string;
  duration: number;
  startTime: number;
  currentTime?: number;
  pixelsPerSecond?: number;
  className?: string;
  filePath?: string; // Add file path visualization
  onSeek?: (time: number) => void;
}

export function OptimizedWaveform({
  audioBuffer,
  width,
  height,
  color,
  duration,
  startTime,
  currentTime = 0,
  pixelsPerSecond = 60,
  className = "",
  filePath,
  onSeek
}: OptimizedWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);

  // Generate static waveform data once and memoize it
  const waveformData = useMemo(() => {
    if (audioBuffer) {
      return generateWaveformFromBuffer(audioBuffer, Math.floor(width / 2)); // Reduce resolution for performance
    } else {
      return generateFixedWaveform(duration, Math.floor(width / 2));
    }
  }, [audioBuffer, duration, width]);

  // Generate a fixed waveform pattern that doesn't change
  function generateFixedWaveform(duration: number, samples: number): number[] {
    const data: number[] = [];
    const seed = filePath ? hashString(filePath) : 12345; // Use file path as seed for consistent waveforms
    
    for (let i = 0; i < samples; i++) {
      const t = i / samples;
      // Create a deterministic but realistic waveform using the seed
      const val1 = seededRandom(seed + i * 0.1) * 0.7;
      const val2 = Math.sin(t * Math.PI * 4) * 0.3;
      const val3 = Math.sin(t * Math.PI * 16) * 0.1;
      
      const amplitude = Math.abs(val1 + val2 + val3);
      data.push(Math.min(1, amplitude));
    }
    
    return data;
  }

  // Generate waveform from actual audio buffer with reduced resolution
  function generateWaveformFromBuffer(buffer: AudioBuffer, samples: number): number[] {
    const data: number[] = [];
    const channelData = buffer.getChannelData(0);
    const samplesPerPixel = Math.floor(channelData.length / samples);

    for (let i = 0; i < samples; i++) {
      let max = 0;
      
      // Get peak value for this pixel to reduce computation
      for (let j = 0; j < samplesPerPixel && (i * samplesPerPixel + j) < channelData.length; j++) {
        const sample = Math.abs(channelData[i * samplesPerPixel + j]);
        if (sample > max) max = sample;
      }
      
      data.push(max);
    }

    return data;
  }

  // Simple hash function for consistent waveforms
  function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Seeded random function for consistent patterns
  function seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  // Draw waveform to canvas once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw waveform
    const barWidth = width / waveformData.length;
    
    ctx.fillStyle = color + '80'; // Add transparency
    
    waveformData.forEach((amplitude, index) => {
      const x = index * barWidth;
      const barHeight = amplitude * (height * 0.8);
      const y = (height - barHeight) / 2;
      
      ctx.fillRect(x, y, Math.max(1, barWidth - 0.5), barHeight);
    });

    // Draw center line
    ctx.strokeStyle = color + '40';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

  }, [waveformData, width, height, color]);

  // Update playhead position only when currentTime changes
  useEffect(() => {
    if (playheadRef.current && currentTime > startTime) {
      const position = Math.min(width, Math.max(0, (currentTime - startTime) * pixelsPerSecond));
      playheadRef.current.style.left = `${position}px`;
      playheadRef.current.style.display = position > 0 ? 'block' : 'none';
    }
  }, [currentTime, startTime, pixelsPerSecond, width]);

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onSeek) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickTime = startTime + (clickX / pixelsPerSecond);
      onSeek(Math.max(0, clickTime));
    }
  };

  return (
    <div
      className={`relative cursor-pointer ${className}`}
      style={{ width, height }}
      onClick={handleWaveformClick}
    >
      {/* File path display */}
      {filePath && (
        <div className="absolute -top-5 left-0 text-xs text-slate-400 truncate max-w-full">
          {filePath.split('/').pop() || filePath.split('\\').pop() || filePath}
        </div>
      )}
      
      {/* Static canvas for waveform */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ width, height }}
      />

      {/* Playhead indicator - only moves, doesn't re-render waveform */}
      <div
        ref={playheadRef}
        className="absolute top-0 bottom-0 w-0.5 bg-white/90 pointer-events-none shadow-lg z-10"
        style={{ display: 'none' }}
      />
    </div>
  );
}