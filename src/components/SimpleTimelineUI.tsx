"use client";

import { useState } from "react";

interface SimpleTimelineUIProps {
  duration: number;
  currentTime?: number;
  onSeek?: (time: number) => void;
  isPlaying?: boolean;
}

export function SimpleTimelineUI({
  duration,
  currentTime = 0,
  onSeek,
  isPlaying = false
}: SimpleTimelineUIProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(0);

  const displayTime = isDragging ? dragPosition : currentTime;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * duration;
    onSeek?.(newTime);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleTimelineClick(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * duration;
    setDragPosition(newTime);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, clickX / rect.width));
      const newTime = percentage * duration;
      onSeek?.(newTime);
      setIsDragging(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Time Display */}
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span className="font-mono">
          {formatTime(displayTime)} {isPlaying && <span className="text-green-400">▶</span>}
        </span>
        <span>Duration: {formatTime(duration)}</span>
      </div>

      {/* Timeline */}
      <div
        className="relative h-12 bg-slate-800 rounded-lg cursor-pointer border border-slate-700 overflow-hidden select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsDragging(false)}
      >
        {/* Timeline Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-750 to-slate-800"></div>

        {/* Time Markers */}
        {Array.from({ length: Math.ceil(duration / 30) + 1 }, (_, i) => i * 30).map(time => (
          <div
            key={time}
            className="absolute top-0 bottom-0 border-l border-slate-600/50"
            style={{ left: `${Math.min(100, (time / duration) * 100)}%` }}
          >
            <span className="absolute top-1 left-1 text-xs text-slate-500 font-mono">
              {formatTime(time)}
            </span>
          </div>
        ))}

        {/* Played Progress */}
        <div
          className="absolute top-0 bottom-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 transition-all duration-75"
          style={{ width: `${Math.min(100, (displayTime / duration) * 100)}%` }}
        />

        {/* Current Position Indicator */}
        <div
          className={`absolute top-0 bottom-0 w-0.5 shadow-lg transition-all ${
            isDragging ? 'bg-yellow-400 duration-0' : 'bg-purple-500 duration-75'
          }`}
          style={{ left: `${Math.min(100, (displayTime / duration) * 100)}%` }}
        >
          <div className={`absolute -top-1 -left-1.5 w-3 h-3 rounded-full shadow-lg ${
            isDragging ? 'bg-yellow-400 scale-125' : 'bg-purple-500'
          }`}></div>
          {isDragging && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap border border-slate-600">
              {formatTime(displayTime)}
            </div>
          )}
        </div>

        {/* Waveform Visualization (Static) */}
        <div className="absolute inset-0 flex items-center px-2">
          {Array.from({ length: 150 }, (_, i) => (
            <div
              key={i}
              className="flex-1 bg-slate-600/40 mx-px rounded"
              style={{
                height: `${25 + Math.sin(i * 0.1) * 15 + Math.sin(i * 0.05) * 10}%`,
                opacity: i < (displayTime / duration) * 150 ? 0.8 : 0.4
              }}
            />
          ))}
        </div>
      </div>

    </div>
  );
}