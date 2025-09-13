"use client";

import { useRef, useEffect, useState } from "react";

interface TimelineCursorProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onSeek: (time: number) => void;
  pixelsPerSecond?: number;
}

export function TimelineCursor({
  currentTime,
  duration,
  isPlaying,
  onSeek,
  pixelsPerSecond = 60
}: TimelineCursorProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);

  const timelineWidth = Math.max(800, duration * pixelsPerSecond);
  const cursorPosition = (currentTime / duration) * timelineWidth;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickTime = (clickX / rect.width) * duration;

    setIsDragging(true);
    setDragStartX(clickX);
    setDragStartTime(clickTime);
    onSeek(Math.max(0, Math.min(duration, clickTime)));
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const newTime = (currentX / rect.width) * duration;

    onSeek(Math.max(0, Math.min(duration, newTime)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, timelineWidth, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center justify-center mb-2 text-sm text-slate-300 font-mono">
        <div className="bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-700/50">
          <span className="text-white">{formatTime(currentTime)}</span>
          <span className="mx-2 text-slate-400">/</span>
          <span className="text-slate-300">{formatTime(duration)}</span>
        </div>
      </div>

      <div
        ref={timelineRef}
        className="relative h-10 bg-slate-800/60 rounded-xl border border-slate-700/40 cursor-pointer overflow-hidden shadow-inner"
        onMouseDown={handleMouseDown}
        style={{ width: '100%' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 via-slate-800/40 to-slate-900/60" />

        {/* Time markers */}
        {Array.from({ length: Math.ceil(duration / 10) + 1 }, (_, i) => {
          const time = i * 10;
          const position = (time / duration) * 100;

          if (time > duration) return null;

          return (
            <div
              key={i}
              className="absolute top-0 bottom-0 border-l border-slate-600/50"
              style={{ left: `${position}%` }}
            >
              {time > 0 && (
                <div className="absolute -top-6 left-1 text-xs text-slate-500 font-mono">
                  {formatTime(time)}
                </div>
              )}
            </div>
          );
        })}

        {/* Progress bar */}
        <div
          className="absolute top-0 bottom-0 bg-gradient-to-r from-slate-300/80 via-slate-200/70 to-slate-100/60 border-r border-slate-400/60 shadow-sm"
          style={{
            width: `${Math.min(100, (currentTime / duration) * 100)}%`,
            transition: isDragging ? 'none' : 'width 0.1s ease-out'
          }}
        />

        {/* Cursor/Playhead */}
        <div
          className={`absolute top-0 bottom-0 w-1 bg-gradient-to-b from-slate-200 to-slate-400 pointer-events-none z-10 rounded-full ${
            isPlaying ? 'shadow-lg shadow-slate-500/60' : 'shadow-md shadow-slate-500/40'
          }`}
          style={{
            left: `${Math.min(100, (currentTime / duration) * 100)}%`,
            transition: isDragging ? 'none' : 'left 0.1s ease-out'
          }}
        >
          <div className={`absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-6 ${
            isPlaying ? 'bg-gradient-to-b from-slate-200 to-slate-400' : 'bg-gradient-to-b from-slate-300 to-slate-500'
          } rounded-md shadow-lg border border-slate-300/20`}>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-transparent border-t-slate-300" />
          </div>
        </div>

        {/* Hover indicator */}
        {!isDragging && (
          <div className="absolute inset-0 bg-slate-500/5 opacity-0 hover:opacity-100 transition-opacity duration-200" />
        )}
      </div>

      <div className="flex justify-center mt-2">
        <div className="text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-700/30 backdrop-blur-sm">
          Click or drag to scrub timeline
        </div>
      </div>
    </div>
  );
}