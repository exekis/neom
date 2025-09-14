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
  Save,
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
  onQuickSave?: () => void;
  onExportWAV?: () => void;
  onSkipToBeginning?: () => void;
  onSkipToEnd?: () => void;
  onPlayFromClick?: () => void;
  showAudioLibrary?: boolean;
  onToggleAudioLibrary?: () => void;
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
  onQuickSave,
  onExportWAV,
  onSkipToBeginning,
  onSkipToEnd,
  onPlayFromClick,
  showAudioLibrary,
  onToggleAudioLibrary
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
    <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 px-3 py-2">
      <div className="flex items-center justify-between gap-2 min-h-[44px]">
        {/* Left Side - Logo & Project Name */}
        <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
          <NeomLogo />
          {isEditingName ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={handleKeyPress}
              className="bg-slate-800 text-white px-2 py-1 rounded border border-slate-600 focus:border-purple-500 focus:outline-none text-sm min-w-[120px] max-w-[200px]"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="text-sm font-medium text-white hover:text-purple-400 transition-colors truncate max-w-[200px]"
            >
              {projectName}
            </button>
          )}
        </div>

        {/* Center - Transport Controls */}
        <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-0.5 flex-shrink-0">
          <button
            onClick={onSkipToBeginning}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors flex items-center justify-center"
            title="Skip to Beginning"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={isPlaying ? onPause : onPlay}
            className={`p-1.5 rounded transition-colors flex items-center justify-center ${
              isPlaying
                ? 'bg-purple-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title="Play/Pause (Enter)"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onStop}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors flex items-center justify-center"
            title="Stop (Esc)"
          >
            <Square className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onPlayFromClick}
            className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-400/20 rounded transition-colors relative flex items-center justify-center"
            title="Play from Cursor Position (Space)"
          >
            <Play className="w-3 h-3" />
            <span className="text-xs absolute -top-0.5 -right-0.5 bg-amber-500 text-white rounded-full w-2.5 h-2.5 flex items-center justify-center" style={{fontSize: '7px'}}>C</span>
          </button>

          <button
            onClick={onRecord}
            className={`p-1.5 rounded transition-colors flex items-center justify-center ${
              isRecording
                ? 'bg-red-600 text-white animate-pulse'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title="Record (R)"
          >
            <Circle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onToggleLoop}
            className={`p-1.5 rounded transition-colors flex items-center justify-center ${
              isLooping
                ? 'bg-green-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title="Loop (L)"
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onSkipToEnd}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors flex items-center justify-center"
            title="Skip to End"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center-Right - Secondary Controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Export */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1 px-1.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Export</span>
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

          {/* Metronome */}
          <button
            onClick={onToggleMetronome}
            className={`p-1.5 rounded transition-colors ${
              isMetronomeEnabled
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title="Metronome"
          >
            <Timer className="w-3.5 h-3.5" />
          </button>

          {/* Undo/Redo */}
          <div className="flex items-center bg-slate-800 rounded-lg">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded-l transition-colors ${
                canUndo
                  ? 'text-slate-300 hover:text-white hover:bg-slate-700'
                  : 'text-slate-600 cursor-not-allowed'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-1.5 rounded-r transition-colors ${
                canRedo
                  ? 'text-slate-300 hover:text-white hover:bg-slate-700'
                  : 'text-slate-600 cursor-not-allowed'
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg px-2 py-1.5">
            <Volume2 className="w-3.5 h-3.5 text-slate-300" />
            <input
              type="range"
              min="0"
              max="100"
              value={masterVolume}
              onChange={(e) => onMasterVolumeChange(parseInt(e.target.value))}
              className="w-12 accent-slate-400"
              title="Master Volume"
            />
            <span className="text-xs text-slate-400 w-5 text-right">{masterVolume}%</span>
          </div>
        </div>

        {/* Right Side - Tools & User */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onShowWorkspace}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
            title="Audio Workspace"
          >
            <FolderOpen className="w-3.5 h-3.5" />
          </button>

          {onToggleAudioLibrary && (
            <button
              onClick={onToggleAudioLibrary}
              className={`p-1.5 transition-colors rounded ${
                showAudioLibrary 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Audio Library"
            >
              <Music className="w-3.5 h-3.5" />
            </button>
          )}

          {onOpenProjectModal && (
            <button
              onClick={onOpenProjectModal}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
              title="Project Manager"
            >
              <Music className="w-3.5 h-3.5" />
            </button>
          )}

          {onQuickSave && (
            <button
              onClick={onQuickSave}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
              title="Save Project (Ctrl+S)"
            >
              <Save className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onShowHotkeys}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
            title="Show Hotkeys"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenAssistant}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
            title="NEOM Assistant"
          >
            <Bot className="w-3.5 h-3.5" />
          </button>

          {/* User Account */}
          <div className="relative">
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="flex items-center gap-1 px-1.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors text-sm"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden lg:inline truncate max-w-[80px]">{user?.firstName || 'User'}</span>
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