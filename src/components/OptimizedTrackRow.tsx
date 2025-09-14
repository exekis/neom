"use client";

import { useState, memo, useCallback } from "react";
import { AudioTrack } from "../types/AudioTrack";
import { OptimizedWaveform } from "./OptimizedWaveform";
import {
  Volume2,
  VolumeX,
  Trash2,
  Settings,
  Bot,
  Edit3,
  FileAudio
} from "lucide-react";

interface OptimizedTrackRowProps {
  track: AudioTrack;
  index: number;
  isSelected: boolean;
  isMuted: boolean;
  isSolo: boolean;
  volume: number;
  onClick: () => void;
  onRemove: () => void;
  onMuteToggle: () => void;
  onSoloToggle: () => void;
  onVolumeChange: (volume: number) => void;
  onNameChange: (name: string) => void;
  onOpenSettings: () => void;
  onOpenAIAgent: () => void;
  currentTime?: number;
  isPlaying?: boolean;
  pixelsPerSecond?: number;
  onSeek?: (time: number) => void;
}

// Memoize the component to prevent unnecessary re-renders
export const OptimizedTrackRow = memo(function OptimizedTrackRow({
  track,
  isSelected,
  isMuted,
  isSolo,
  volume,
  onClick,
  onRemove,
  onMuteToggle,
  onSoloToggle,
  onVolumeChange,
  onNameChange,
  onOpenSettings,
  onOpenAIAgent,
  currentTime = 0,
  isPlaying = false,
  pixelsPerSecond = 60,
  onSeek
}: OptimizedTrackRowProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(track.name);

  const handleNameSubmit = useCallback(() => {
    onNameChange(editName);
    setIsEditingName(false);
  }, [editName, onNameChange]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setEditName(track.name);
      setIsEditingName(false);
    }
  }, [handleNameSubmit, track.name]);

  const waveformWidth = Math.max(300, track.duration * pixelsPerSecond);
  
  // Generate a mock file path for demonstration
  const mockFilePath = `/projects/audio/${track.name.toLowerCase().replace(/\s+/g, '_')}.wav`;

  return (
    <div 
      className={`flex bg-slate-800 border-l-4 transition-all duration-200 hover:bg-slate-750 ${
        isSelected ? 'border-l-purple-500 bg-slate-750' : 'border-l-transparent'
      }`}
      onClick={onClick}
    >
      {/* Track Controls Panel */}
      <div className="w-64 flex flex-col p-3 border-r border-slate-700 bg-slate-800/50">
        {/* Track Name */}
        <div className="mb-2">
          {isEditingName ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={handleKeyPress}
              className="w-full px-2 py-1 text-sm bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:border-purple-500"
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-2">
              <FileAudio className="w-4 h-4 text-slate-400" />
              <span 
                className="text-sm font-medium text-white cursor-pointer hover:text-purple-400 flex-1 truncate"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingName(true);
                }}
              >
                {track.name}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingName(true);
                }}
                className="p-1 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* File Path Display */}
        <div className="mb-2">
          <div className="text-xs text-slate-500 truncate" title={mockFilePath}>
            📁 {mockFilePath}
          </div>
          <div className="text-xs text-slate-500">
            Duration: {track.duration.toFixed(1)}s | Start: {track.startTime.toFixed(1)}s
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-1 mb-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMuteToggle();
            }}
            className={`p-1.5 rounded transition-colors ${
              isMuted ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
            title="Mute"
          >
            {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSoloToggle();
            }}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              isSolo ? 'bg-yellow-500 text-black' : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
            title="Solo"
          >
            S
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenSettings();
            }}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
            title="Settings"
          >
            <Settings className="w-3 h-3" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenAIAgent();
            }}
            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded transition-colors"
            title="AI Assistant"
          >
            <Bot className="w-3 h-3" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors ml-auto"
            title="Remove Track"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-2">
          <Volume2 className="w-3 h-3 text-slate-400" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => onVolumeChange(parseInt(e.target.value))}
            className="flex-1 accent-purple-500"
            title={`Volume: ${volume}%`}
          />
          <span className="text-xs text-slate-400 w-8">{volume}</span>
        </div>
      </div>

      {/* Waveform Area */}
      <div className="flex-1 relative bg-slate-900/30 min-h-[80px] overflow-hidden">
        <OptimizedWaveform
          audioBuffer={track.audioBuffer}
          width={waveformWidth}
          height={80}
          color={track.color}
          duration={track.duration}
          startTime={track.startTime}
          currentTime={currentTime}
          pixelsPerSecond={pixelsPerSecond}
          filePath={mockFilePath}
          className="absolute top-0 left-0"
          onSeek={onSeek}
        />

        {/* Track timing info overlay */}
        <div className="absolute top-1 right-2 text-xs text-slate-400 bg-slate-900/70 px-2 py-1 rounded">
          {(track.startTime + track.duration).toFixed(1)}s
        </div>
      </div>
    </div>
  );
});