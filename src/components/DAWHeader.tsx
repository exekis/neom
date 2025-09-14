"use client";

import { useState } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { NeomLogo } from "./NeomLogo";
import {
  Play,
  Pause,
  Square,
  Circle,
  Repeat,
  Timer,
  Undo2,
  Redo2,
  ChevronDown,
  Download,
  Share,
  Music,
  User,
  LogOut,
  Volume2,
  Bot,
  HelpCircle,
  FolderOpen,
  SkipBack,
  SkipForward
} from "lucide-react";

interface DAWHeaderProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  isPlaying: boolean;
  isRecording: boolean;
  isLooping: boolean;
  isMetronomeEnabled: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onRecord: () => void;
  onToggleLoop: () => void;
  onToggleMetronome: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  masterVolume: number;
  onMasterVolumeChange: (volume: number) => void;
  onOpenAssistant: () => void;
  onShowHotkeys: () => void;
  onShowWorkspace: () => void;
  onOpenProjectModal?: () => void;
  onExportWAV?: () => void;
  onSkipToBeginning?: () => void;
  onSkipToEnd?: () => void;
  onPlayFromClick?: () => void;
}

export function DAWHeader({
  projectName,
  onProjectNameChange,
  isPlaying,
  isRecording,
  isLooping,
  isMetronomeEnabled,
  onPlay,
  onPause,
  onStop,
  onRecord,
  onToggleLoop,
  onToggleMetronome,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  masterVolume,
  onMasterVolumeChange,
  onOpenAssistant,
  onShowHotkeys,
  onShowWorkspace,
  onOpenProjectModal,
  onExportWAV,
  onSkipToBeginning,
  onSkipToEnd,
  onPlayFromClick
}: DAWHeaderProps) {
  const { user } = useUser();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(projectName);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const handleNameSubmit = () => {
    onProjectNameChange(editName);
    setIsEditingName(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setEditName(projectName);
      setIsEditingName(false);
    }
  };

  return (
    <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <NeomLogo />

          <div className="flex items-center gap-4">
            {isEditingName ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleNameSubmit}
                onKeyDown={handleKeyPress}
                className="bg-slate-800 text-white px-3 py-1 rounded border border-slate-600 focus:border-purple-500 focus:outline-none"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="text-lg font-medium text-white hover:text-purple-400 transition-colors"
              >
                {projectName}
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Export
                <ChevronDown className="w-3 h-3" />
              </button>

              {showExportMenu && (
                <div className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-[9999] min-w-[140px]">
                  <button
                    onClick={() => {
                      onExportWAV?.();
                      setShowExportMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-white hover:bg-slate-700 flex items-center gap-2 text-sm"
                  >
                    <Music className="w-4 h-4" />
                    Export WAV
                  </button>
                  <button className="w-full px-3 py-2 text-left text-white hover:bg-slate-700 flex items-center gap-2 text-sm">
                    <Music className="w-4 h-4" />
                    Export MIDI
                  </button>
                  <button className="w-full px-3 py-2 text-left text-white hover:bg-slate-700 flex items-center gap-2 text-sm">
                    <Share className="w-4 h-4" />
                    Share Project
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
            {/* Skip to Beginning */}
            <button
              onClick={onSkipToBeginning}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="Skip to Beginning"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={isPlaying ? onPause : onPlay}
              className={`p-2 rounded transition-colors ${
                isPlaying
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              title="Play/Pause (Enter)"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            {/* Stop */}
            <button
              onClick={onStop}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="Stop (Esc)"
            >
              <Square className="w-4 h-4" />
            </button>

            {/* Play from Click Position */}
            <button
              onClick={onPlayFromClick}
              className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-400/20 rounded transition-colors relative"
              title="Play from Cursor Position (Space)"
            >
              <Play className="w-3 h-3" />
              <span className="text-xs absolute -top-1 -right-1 bg-amber-500 text-white rounded-full w-3 h-3 flex items-center justify-center" style={{fontSize: '8px'}}>C</span>
            </button>

            {/* Record */}
            <button
              onClick={onRecord}
              className={`p-2 rounded transition-colors ${
                isRecording
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              title="Record (R)"
            >
              <Circle className="w-4 h-4" />
            </button>

            {/* Loop */}
            <button
              onClick={onToggleLoop}
              className={`p-2 rounded transition-colors ${
                isLooping
                  ? 'bg-green-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              title="Loop (L)"
            >
              <Repeat className="w-4 h-4" />
            </button>

            {/* Skip to End */}
            <button
              onClick={onSkipToEnd}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="Skip to End"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onToggleMetronome}
            className={`p-2 rounded transition-colors ${
              isMetronomeEnabled
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title="Metronome"
          >
            <Timer className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-2 rounded transition-colors ${
                canUndo
                  ? 'text-slate-300 hover:text-white hover:bg-slate-700'
                  : 'text-slate-600 cursor-not-allowed'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>

            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-2 rounded transition-colors ${
                canRedo
                  ? 'text-slate-300 hover:text-white hover:bg-slate-700'
                  : 'text-slate-600 cursor-not-allowed'
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">
            <Volume2 className="w-4 h-4 text-slate-300" />
            <input
              type="range"
              min="0"
              max="100"
              value={masterVolume}
              onChange={(e) => onMasterVolumeChange(parseInt(e.target.value))}
              className="w-20 accent-slate-400"
              title="Master Volume"
            />
            <span className="text-xs text-slate-400 w-8">{masterVolume}%</span>
          </div>

          <button
            onClick={onShowWorkspace}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
            title="Audio Workspace"
          >
            <FolderOpen className="w-4 h-4" />
          </button>

          {onOpenProjectModal && (
            <button
              onClick={onOpenProjectModal}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
              title="Project Manager"
            >
              <Music className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onShowHotkeys}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
            title="Show Hotkeys"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAssistant}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
            title="NEOM Assistant"
          >
            <Bot className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              <User className="w-4 h-4" />
              {user?.firstName || 'User'}
              <ChevronDown className="w-3 h-3" />
            </button>

            {showAccountMenu && (
              <div className="absolute top-full right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-[100] min-w-[120px]">
                <SignOutButton>
                  <button className="w-full px-3 py-2 text-left text-white hover:bg-slate-700 flex items-center gap-2 text-sm">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </SignOutButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}