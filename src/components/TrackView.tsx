"use client";

import { AudioTrack } from "../types/AudioTrack";
import { TrackRow } from "./TrackRow";
import { TimelineMarkers } from "./TimelineMarkers";
import { PlaybackCursor } from "./PlaybackCursor";

interface TrackViewProps {
  tracks: AudioTrack[];
  selectedTrackIndex: number | null;
  onTrackClick: (index: number) => void;
  onRemoveTrack: (trackId: string) => void;
  onUpdateTrackStartTime: (trackId: string, newStartTime: number) => void;
  currentTime: number;
  isPlaying: boolean;
}

const PIXELS_PER_SECOND = 60;

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
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700/30 p-12 text-center">
        <div className="text-6xl mb-4 opacity-60">🎵</div>
        <h3 className="text-xl font-semibold text-white mb-2">Ready to create?</h3>
        <p className="text-slate-400">Upload your first audio file to start building your masterpiece</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700/30 overflow-hidden">
      <div className="border-b border-slate-700/30 p-6 bg-slate-800/30">
        <h2 className="text-xl font-bold text-white">
          Timeline ({tracks.length} track{tracks.length !== 1 ? 's' : ''})
        </h2>
      </div>
      
      {/* Single unified timeline at the top */}
      <div className="flex">
        <div className="w-40 bg-slate-800/30 border-r border-slate-700/30 h-8"></div>
        <div className="flex-1 px-3 pt-3 pb-2 relative h-8">
          <TimelineMarkers pixelsPerSecond={PIXELS_PER_SECOND} />
        </div>
      </div>
      
      <div className="divide-y divide-slate-700/30 relative">
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
        
        {/* Single playback cursor spanning all tracks */}
        <div className="absolute top-0 bottom-0 pointer-events-none" style={{ left: '160px', right: '0' }}>
          <PlaybackCursor
            currentTime={currentTime}
            pixelsPerSecond={PIXELS_PER_SECOND}
            isVisible={isPlaying}
          />
        </div>
      </div>
    </div>
  );
}
