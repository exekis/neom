"use client";

import { Play, Pause, Square } from 'lucide-react';

interface AudioControlsProps {
  isPlaying: boolean;
  currentTime: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
}

export function AudioControls({
  isPlaying,
  currentTime,
  onPlay,
  onPause,
  onStop
}: AudioControlsProps) {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700/30 p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={isPlaying ? onPause : onPlay}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-lg cursor-pointer ${
              isPlaying
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
{isPlaying ? <Pause className="w-6 h-6" fill="currentColor" /> : <Play className="w-6 h-6" fill="currentColor" />}
          </button>

          <button
            onClick={onStop}
            className="w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition-all duration-200 shadow-lg cursor-pointer"
          >
<Square className="w-5 h-5" fill="currentColor" />
          </button>
        </div>

        <div className="text-lg text-slate-200 font-mono font-semibold bg-slate-800 px-4 py-2 rounded-lg">
          {formatTime(currentTime)}
        </div>
      </div>
    </div>
  );
}