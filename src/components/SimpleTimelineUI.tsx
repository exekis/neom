"use client";

import { useState } from "react";

interface SimpleTimelineUIProps {
  duration: number;
}

export function SimpleTimelineUI({ duration }: SimpleTimelineUIProps) {
  const [currentPosition, setCurrentPosition] = useState(0);

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

        {/* Waveform Visualization (Static) */}
        <div className="absolute inset-0 flex items-center px-2">
          {Array.from({ length: 200 }, (_, i) => (
            <div
              key={i}
              className="flex-1 bg-gray-600 mx-px rounded"
              style={{
                height: `${Math.random() * 60 + 10}%`,
                opacity: i < (currentPosition / duration) * 200 ? 0.8 : 0.3
              }}
            />
          ))}
        </div>
      </div>

    </div>
  );
}