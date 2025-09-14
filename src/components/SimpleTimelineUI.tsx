"use client";

import { useState } from "react";

interface SimpleTimelineUIProps {
  duration: number;
}

export function SimpleTimelineUI({ duration }: SimpleTimelineUIProps) {
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = Math.max(0, Math.min(duration, percentage * duration));
    setCurrentPosition(newTime);
  };

  return (
    <div className="space-y-4">
      {/* Time Display */}
      <div className="flex items-center justify-between text-sm text-gray-300">
        <span>{formatTime(currentPosition)}</span>
        <span>Duration: {formatTime(duration)}</span>
      </div>

      {/* Timeline */}
      <div
        className="relative h-12 bg-gray-800 rounded-lg cursor-pointer border border-gray-700 overflow-hidden"
        onClick={handleTimelineClick}
      >
        {/* Timeline Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-750 to-gray-800"></div>

        {/* Time Markers */}
        {Array.from({ length: Math.ceil(duration / 30) + 1 }, (_, i) => i * 30).map(time => (
          <div
            key={time}
            className="absolute top-0 bottom-0 border-l border-gray-600/50"
            style={{ left: `${(time / duration) * 100}%` }}
          >
            <span className="absolute top-1 left-1 text-xs text-gray-500">
              {formatTime(time)}
            </span>
          </div>
        ))}

        {/* Current Position Indicator */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-blue-500 shadow-lg transition-all duration-100"
          style={{ left: `${(currentPosition / duration) * 100}%` }}
        >
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full shadow-lg"></div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {formatTime(currentPosition)}
          </div>
        </div>

        {/* Waveform Visualization (Enhanced Static) */}
        <div className="absolute inset-0 flex items-center px-2">
          {Array.from({ length: 200 }, (_, i) => {
            const progress = i / 200;
            const time = progress * duration;

            // Create more realistic waveform pattern
            const baseAmplitude = Math.sin(progress * Math.PI * 4) * 0.3 + 0.7; // Main wave
            const detail = Math.sin(progress * Math.PI * 32) * 0.2; // Fine detail
            const fadeIn = Math.min(1, time / 3); // 3 second fade in
            const fadeOut = Math.min(1, (duration - time) / 5); // 5 second fade out
            const envelope = fadeIn * fadeOut;

            const height = (baseAmplitude + detail) * envelope * 70 + 5;
            const isPlayed = i < (currentPosition / duration) * 200;

            return (
              <div
                key={i}
                className={`flex-1 mx-px rounded transition-colors duration-200 ${
                  isPlayed ? 'bg-blue-500' : 'bg-gray-600'
                }`}
                style={{
                  height: `${Math.max(2, height)}%`,
                  opacity: isPlayed ? 0.9 : 0.4
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Transport Controls */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setCurrentPosition(0)}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
        >
          ⏮ Start
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`px-3 py-2 text-white rounded text-sm transition-colors ${
            isPlaying ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        <button
          onClick={() => {
            setIsPlaying(false);
            setCurrentPosition(0);
          }}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
        >
          ⏹ Stop
        </button>
        <button
          onClick={() => setCurrentPosition(duration)}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
        >
          ⏭ End
        </button>
      </div>
    </div>
  );
}