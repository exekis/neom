"use client";

import { memo, useMemo } from "react";
import { AudioTrack } from "../types/AudioTrack";
import { OptimizedTrackRow } from "./OptimizedTrackRow";
import { Plus, Upload, FolderOpen } from "lucide-react";

interface TrackState {
  id: string;
  isMuted: boolean;
  isSolo: boolean;
  volume: number;
}

interface OptimizedTrackViewProps {
  tracks: AudioTrack[];
  selectedTrackIndex: number | null;
  trackStates: { [trackId: string]: TrackState };
  onTrackClick: (index: number) => void;
  onRemoveTrack: (trackId: string) => void;
  onUpdateTrackStartTime: (trackId: string, newStartTime: number) => void;
  onTrackMuteToggle: (trackId: string) => void;
  onTrackSoloToggle: (trackId: string) => void;
  onTrackVolumeChange: (trackId: string, volume: number) => void;
  onTrackNameChange: (trackId: string, name: string) => void;
  onTrackSettings: (trackId: string) => void;
  onTrackAIAgent: (trackId: string) => void;
  onAddTrack: () => void;
  currentTime: number;
  isPlaying: boolean;
  onSeek?: (time: number) => void;
  bpm?: number;
}

export const OptimizedTrackView = memo(function OptimizedTrackView({
  tracks,
  selectedTrackIndex,
  trackStates,
  onTrackClick,
  onRemoveTrack,
  onUpdateTrackStartTime,
  onTrackMuteToggle,
  onTrackSoloToggle,
  onTrackVolumeChange,
  onTrackNameChange,
  onTrackSettings,
  onTrackAIAgent,
  onAddTrack,
  currentTime,
  isPlaying,
  onSeek,
  bpm = 120
}: OptimizedTrackViewProps) {
  
  // Memoize track computations to avoid recalculating on every render
  const trackData = useMemo(() => {
    return tracks.map((track, index) => ({
      track,
      index,
      isSelected: selectedTrackIndex === index,
      state: trackStates[track.id] || {
        id: track.id,
        isMuted: false,
        isSolo: false,
        volume: 100
      }
    }));
  }, [tracks, selectedTrackIndex, trackStates]);

  const totalDuration = useMemo(() => {
    return Math.max(...tracks.map(track => track.startTime + track.duration), 60);
  }, [tracks]);

  if (tracks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-900/50">
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
            <FolderOpen className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Audio Tracks</h3>
          <p className="text-slate-400 mb-6 max-w-sm">
            Start by adding an audio track to begin your project. You can upload files or create new tracks.
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={onAddTrack}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Track
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
              <Upload className="w-4 h-4" />
              Upload Audio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-900/30 overflow-hidden">
      {/* Timeline Header */}
      <div className="h-8 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400 font-medium">TIMELINE</span>
          <span className="text-xs text-slate-500">
            {tracks.length} track{tracks.length !== 1 ? 's' : ''} • {totalDuration.toFixed(1)}s total
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">BPM: {bpm}</span>
          <button
            onClick={onAddTrack}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-700 transition-colors"
            title="Add Track"
          >
            + ADD
          </button>
        </div>
      </div>

      {/* Tracks Container */}
      <div className="flex-1 overflow-y-auto">
        {trackData.map(({ track, index, isSelected, state }) => (
          <OptimizedTrackRow
            key={track.id}
            track={track}
            index={index}
            isSelected={isSelected}
            isMuted={state.isMuted}
            isSolo={state.isSolo}
            volume={state.volume}
            onClick={() => onTrackClick(index)}
            onRemove={() => onRemoveTrack(track.id)}
            onMuteToggle={() => onTrackMuteToggle(track.id)}
            onSoloToggle={() => onTrackSoloToggle(track.id)}
            onVolumeChange={(volume) => onTrackVolumeChange(track.id, volume)}
            onNameChange={(name) => onTrackNameChange(track.id, name)}
            onOpenSettings={() => onTrackSettings(track.id)}
            onOpenAIAgent={() => onTrackAIAgent(track.id)}
            currentTime={currentTime}
            isPlaying={isPlaying}
            pixelsPerSecond={60}
          />
        ))}
      </div>

      {/* Timeline Footer with helpful info */}
      <div className="h-6 bg-slate-800 border-t border-slate-700 flex items-center justify-between px-4 text-xs text-slate-500">
        <div>Click tracks to select • Drag to reposition • Right-click for options</div>
        <div>{isPlaying ? '▶' : '⏸'} {currentTime.toFixed(1)}s</div>
      </div>
    </div>
  );
});