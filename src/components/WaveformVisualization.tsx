"use client";

import { useMemo } from "react";

interface WaveformVisualizationProps {
  audioBuffer?: AudioBuffer;
  width: number;
  height: number;
  color: string;
  duration: number;
  startTime: number;
  currentTime?: number;
  pixelsPerSecond?: number;
  className?: string;
}

export function WaveformVisualization({
  audioBuffer,
  width,
  height,
  color,
  duration,
  startTime,
  currentTime = 0,
  pixelsPerSecond = 60,
  className = ""
}: WaveformVisualizationProps) {
  // Generate waveform data
  const waveformData = useMemo(() => {
    if (audioBuffer) {
      return generateWaveformFromBuffer(audioBuffer, width);
    } else {
      return generateMockWaveform(duration, width);
    }
  }, [audioBuffer, duration, width]);

  // Generate mock waveform data for demo purposes
  function generateMockWaveform(duration: number, samples: number): number[] {
    const data: number[] = [];
    const sampleRate = samples / duration;

    for (let i = 0; i < samples; i++) {
      const time = i / sampleRate;

      // Create a more realistic waveform pattern with:
      // - Fade in/out at beginning and end
      // - Varying amplitude with some randomness
      // - Some frequency variation to simulate audio content

      const fadeIn = Math.min(1, time / 2); // 2 second fade in
      const fadeOut = Math.min(1, (duration - time) / 2); // 2 second fade out
      const envelope = fadeIn * fadeOut;

      // Base amplitude with some variation
      const baseAmplitude = 0.6 + 0.3 * Math.sin(time * 0.5);

      // Add some realistic audio-like variation
      const highFreq = 0.2 * Math.sin(time * 8 + Math.cos(time * 3));
      const lowFreq = 0.3 * Math.sin(time * 2 + Math.sin(time * 0.7));
      const noise = 0.1 * (Math.random() - 0.5);

      // Combine all components
      const amplitude = envelope * (baseAmplitude + highFreq + lowFreq + noise);

      // Clamp between -1 and 1
      data.push(Math.max(-1, Math.min(1, amplitude)));
    }

    return data;
  }

  // Generate waveform from actual audio buffer
  function generateWaveformFromBuffer(buffer: AudioBuffer, samples: number): number[] {
    const data: number[] = [];
    const channelData = buffer.getChannelData(0); // Use first channel
    const samplesPerPixel = Math.floor(channelData.length / samples);

    for (let i = 0; i < samples; i++) {
      let sum = 0;
      let count = 0;

      // Average the samples in this pixel
      for (let j = 0; j < samplesPerPixel && (i * samplesPerPixel + j) < channelData.length; j++) {
        sum += Math.abs(channelData[i * samplesPerPixel + j]);
        count++;
      }

      data.push(count > 0 ? sum / count : 0);
    }

    return data;
  }

  // Calculate progress position for playhead
  const progressPosition = currentTime > startTime ?
    Math.min(width, Math.max(0, (currentTime - startTime) * pixelsPerSecond)) : 0;

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {/* Waveform SVG */}
      <svg
        width={width}
        height={height}
        className="absolute inset-0"
        style={{ overflow: 'visible' }}
      >
        {/* Background waveform */}
        <defs>
          <linearGradient id={`waveform-gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity={0.8} />
            <stop offset="50%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0.8} />
          </linearGradient>
          <clipPath id={`progress-clip-${color.replace('#', '')}`}>
            <rect x="0" y="0" width={progressPosition} height={height} />
          </clipPath>
        </defs>

        {/* Waveform bars */}
        {waveformData.map((amplitude, index) => {
          const x = (index / waveformData.length) * width;
          const barHeight = Math.abs(amplitude) * (height * 0.8);
          const y = (height - barHeight) / 2;

          return (
            <g key={index}>
              {/* Background bar */}
              <rect
                x={x}
                y={y}
                width={Math.max(1, width / waveformData.length - 0.5)}
                height={barHeight}
                fill={`url(#waveform-gradient-${color.replace('#', '')})`}
                opacity={0.6}
              />

              {/* Progress bar (played portion) */}
              <rect
                x={x}
                y={y}
                width={Math.max(1, width / waveformData.length - 0.5)}
                height={barHeight}
                fill={color}
                opacity={0.9}
                clipPath={`url(#progress-clip-${color.replace('#', '')})`}
              />
            </g>
          );
        })}

        {/* Center line for reference */}
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={color}
          strokeWidth="0.5"
          opacity={0.3}
        />
      </svg>

      {/* Playhead indicator */}
      {progressPosition > 0 && (
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white/80 pointer-events-none shadow-sm"
          style={{ left: progressPosition }}
        />
      )}
    </div>
  );
}