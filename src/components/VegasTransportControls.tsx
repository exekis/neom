"use client";

import { Play, Pause, Square, SkipBack, SkipForward, Mic, RotateCcw } from "lucide-react";

interface VegasTransportControlsProps {
  isPlaying: boolean;
  isRecording: boolean;
  isLooping: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onRecord: () => void;
  onToggleLoop: () => void;
  onPlayFromClick: () => void;
  onPlayFromLast: () => void;
}

export function VegasTransportControls({
  isPlaying,
  isRecording,
  isLooping,
  onPlay,
  onPause,
  onStop,
  onRecord,
  onToggleLoop,
  onPlayFromClick,
  onPlayFromLast
}: VegasTransportControlsProps) {
  return (
    <div className="flex items-center gap-1">
      {/* Skip to Beginning */}
      <button
        className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
        title="Skip to Beginning"
      >
        <SkipBack className="w-4 h-4" />
      </button>

      {/* Play/Pause */}
      <button
        onClick={isPlaying ? onPause : onPlay}
        className={`p-2 rounded transition-colors ${
          isPlaying
            ? 'text-green-400 hover:text-green-300 bg-green-400/20 hover:bg-green-400/30'
            : 'text-gray-300 hover:text-white hover:bg-gray-700'
        }`}
        title={isPlaying ? "Pause (Enter)" : "Play (Enter)"}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>

      {/* Stop */}
      <button
        onClick={onStop}
        className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
        title="Stop (Esc)"
      >
        <Square className="w-4 h-4" />
      </button>

      {/* Play from Click Position */}
      <button
        onClick={onPlayFromClick}
        className="p-2 text-amber-300 hover:text-amber-200 hover:bg-amber-400/20 rounded transition-colors"
        title="Play from Cursor Position (Space)"
      >
        <Play className="w-3 h-3" />
        <span className="text-xs ml-1">C</span>
      </button>

      {/* Record */}
      <button
        onClick={onRecord}
        className={`p-2 rounded transition-colors ${
          isRecording
            ? 'text-red-400 hover:text-red-300 bg-red-400/20 hover:bg-red-400/30'
            : 'text-gray-300 hover:text-white hover:bg-gray-700'
        }`}
        title="Record (R)"
      >
        <Mic className="w-4 h-4" />
      </button>

      {/* Loop */}
      <button
        onClick={onToggleLoop}
        className={`p-2 rounded transition-colors ${
          isLooping
            ? 'text-blue-400 hover:text-blue-300 bg-blue-400/20 hover:bg-blue-400/30'
            : 'text-gray-300 hover:text-white hover:bg-gray-700'
        }`}
        title="Loop (L)"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      {/* Skip to End */}
      <button
        className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
        title="Skip to End"
      >
        <SkipForward className="w-4 h-4" />
      </button>

      {/* Keyboard Shortcuts Info */}
      <div className="ml-4 text-xs text-gray-500 border-l border-gray-600 pl-4">
        <div className="flex gap-3">
          <span>Space: Play from Cursor</span>
          <span>Enter: Play/Pause</span>
          <span>R: Record</span>
          <span>L: Loop</span>
          <span>Esc: Stop</span>
        </div>
      </div>
    </div>
  );
}