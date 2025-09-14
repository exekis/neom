'use client';

import { useEffect, useRef, useState } from 'react';

interface AudioWaveformProps {
  audioBuffer: AudioBuffer | null;
  currentTime?: number;
  onTimeUpdate?: (time: number) => void;
  className?: string;
  height?: number;
  isPlaying?: boolean;
}

export default function AudioWaveform({
  audioBuffer,
  currentTime = 0,
  onTimeUpdate,
  className = '',
  height = 100
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!audioBuffer) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const samples = audioBuffer.getChannelData(0);
    const samplesPerPixel = Math.floor(samples.length / canvas.width);
    const peaks: number[] = [];

    for (let i = 0; i < canvas.width; i++) {
      const start = i * samplesPerPixel;
      const end = start + samplesPerPixel;
      let max = 0;

      for (let j = start; j < end && j < samples.length; j++) {
        max = Math.max(max, Math.abs(samples[j]));
      }
      peaks.push(max);
    }

    setWaveformData(peaks);
  }, [audioBuffer]);

  // Draw static waveform once (without playhead)
  useEffect(() => {
    if (!canvasRef.current || waveformData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height: canvasHeight } = canvas;
    ctx.clearRect(0, 0, width, canvasHeight);

    const centerY = canvasHeight / 2;
    const barWidth = width / waveformData.length;

    // Draw static waveform bars
    waveformData.forEach((peak, index) => {
      const barHeight = peak * (canvasHeight / 2);
      const x = index * barWidth;

      ctx.fillStyle = '#6b7280';
      ctx.fillRect(x, centerY - barHeight / 2, barWidth - 0.5, barHeight);
    });
  }, [waveformData]);

  // Draw playhead and progress separately to avoid redrawing waveform
  useEffect(() => {
    if (!canvasRef.current || waveformData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height: canvasHeight } = canvas;
    const centerY = canvasHeight / 2;
    const barWidth = width / waveformData.length;
    const playheadX = audioBuffer ? (currentTime / audioBuffer.duration) * width : 0;

    // Redraw only the progress bars (more efficient)
    waveformData.forEach((peak, index) => {
      const barHeight = peak * (canvasHeight / 2);
      const x = index * barWidth;

      const isPlayed = x < playheadX;
      if (isPlayed) {
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(x, centerY - barHeight / 2, barWidth - 0.5, barHeight);
      } else {
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(x, centerY - barHeight / 2, barWidth - 0.5, barHeight);
      }
    });

    // Draw playhead
    if (audioBuffer) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, canvasHeight);
      ctx.stroke();
    }
  }, [currentTime, audioBuffer, waveformData]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!audioBuffer || !onTimeUpdate) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const timePercent = x / canvas.width;
    const newTime = timePercent * audioBuffer.duration;

    onTimeUpdate(Math.max(0, Math.min(newTime, audioBuffer.duration)));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    handleCanvasClick(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    handleCanvasClick(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={height}
      className={`cursor-pointer ${className}`}
      onClick={handleCanvasClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ width: '100%', height: `${height}px` }}
    />
  );
}