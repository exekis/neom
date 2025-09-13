"use client";

import { AudioTrack } from "../app/page";
import { TrackRow } from "./TrackRow";

interface TrackViewProps {
  tracks: AudioTrack[];
  selectedTrackIndex: number | null;
  onTrackClick: (index: number) => void;
  onRemoveTrack: (trackId: string) => void;
  onUpdateTrackStartTime: (trackId: string, newStartTime: number) => void;
}

export default function TrackView({
  tracks,
  selectedTrackIndex,
  onTrackClick,
  onRemoveTrack,
  onUpdateTrackStartTime
}: TrackViewProps) {
  if (tracks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400 text-lg mb-2">🎵</div>
        <p className="text-gray-500">No tracks yet. Upload an audio file to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-800">Tracks</h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {tracks.map((track, index) => (
          <TrackRow
            key={track.id}
            track={track}
            index={index}
            isSelected={selectedTrackIndex === index}
            onTrackClick={onTrackClick}
            onRemoveTrack={onRemoveTrack}
            onUpdateTrackStartTime={onUpdateTrackStartTime}
          />
        ))}
      </div>
    </div>
  );
}
