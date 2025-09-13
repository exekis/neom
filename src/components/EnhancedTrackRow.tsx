"use client";

import { useState } from "react";
import { AudioTrack } from "../types/AudioTrack";
import {
  Volume2,
  VolumeX,
  Trash2,
  Settings,
  Bot,
  Edit3
} from "lucide-react";

interface EnhancedTrackRowProps {
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
}

export function EnhancedTrackRow({
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
  pixelsPerSecond = 60
}: EnhancedTrackRowProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(track.name);

  const handleNameSubmit = () => {
    onNameChange(editName);
    setIsEditingName(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setEditName(track.name);
      setIsEditingName(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Track Name and Color */}
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: track.color }}
        />
        {isEditingName ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={handleKeyPress}
            className="bg-slate-900 text-white px-2 py-1 rounded text-xs border border-slate-600 focus:border-slate-400 focus:outline-none flex-1"
            autoFocus
          />
        ) : (
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <button
              onClick={onClick}
              className="text-white hover:text-slate-200 transition-colors truncate text-xs font-medium"
            >
              {track.name}
            </button>
            <button
              onClick={() => setIsEditingName(true)}
              className="p-0.5 text-slate-400 hover:text-white transition-colors"
              title="Edit name"
            >
              <Edit3 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Track Controls Row 1 */}
      <div className="flex items-center gap-1">
        <button
          onClick={onMuteToggle}
          className={`p-1 rounded text-xs font-bold transition-colors ${
            isMuted
              ? 'bg-red-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-600'
          }`}
          title="Mute"
        >
          M
        </button>

        <button
          onClick={onSoloToggle}
          className={`p-1 rounded text-xs font-bold transition-colors ${
            isSolo
              ? 'bg-yellow-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-600'
          }`}
          title="Solo"
        >
          S
        </button>

        <button
          onClick={onRemove}
          className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
          title="Delete Track"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-1">
        <Volume2 className="w-3 h-3 text-slate-400" />
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => onVolumeChange(parseInt(e.target.value))}
          className="flex-1 accent-slate-400"
          title="Track Volume"
        />
        <span className="text-xs text-slate-500 w-8">{volume}</span>
      </div>

      {/* Additional Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={onOpenAIAgent}
          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded transition-colors flex-1"
          title="AI Agent"
        >
          <Bot className="w-3 h-3 mx-auto" />
        </button>

        <button
          onClick={onOpenSettings}
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors flex-1"
          title="Settings"
        >
          <Settings className="w-3 h-3 mx-auto" />
        </button>
      </div>
    </div>
  );
}