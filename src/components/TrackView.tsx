"use client";

import { AudioTrack } from "../types/AudioTrack";
import { TrackRow } from "./TrackRow";

interface TrackViewProps {
  tracks: AudioTrack[];
  selectedTrackIndex: number | null;
  onTrackClick: (index: number) => void;
  onRemoveTrack: (trackId: string) => void;
  onUpdateTrackStartTime: (trackId: string, newStartTime: number) => void;
  currentTime: number;
  isPlaying: boolean;
}

export function TrackView({
  tracks,
  selectedTrackIndex,
  onTrackClick,
  onRemoveTrack,
  onUpdateTrackStartTime,
  currentTime,
  isPlaying
}: TrackViewProps) {
  if (tracks.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-12 text-center">
        <div className="text-6xl mb-4 opacity-60">🎵</div>
        <h3 className="text-xl font-semibold text-slate-700 mb-2">Ready to create?</h3>
        <p className="text-slate-500">Upload your first audio file to start building your masterpiece</p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 overflow-hidden">
      <div className="border-b border-purple-100 p-6 bg-gradient-to-r from-purple-50 to-emerald-50">
        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-transparent">
          Timeline ({tracks.length} track{tracks.length !== 1 ? 's' : ''})
        </h2>
      </div>
      
      <div className="divide-y divide-purple-100">
        {tracks.map((track, index) => (
          <TrackRow
            key={track.id}
            track={track}
            index={index}
            isSelected={selectedTrackIndex === index}
            onTrackClick={onTrackClick}
            onRemoveTrack={onRemoveTrack}
            onUpdateTrackStartTime={onUpdateTrackStartTime}
            currentTime={currentTime}
            isPlaying={isPlaying}
          />
        ))}
      </div>
    </div>
  );
}
