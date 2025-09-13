"use client";

import { useRef } from "react";
import { AudioTrack } from "../types/AudioTrack";
import { TimelineMarkers } from "./TimelineMarkers";
import { AudioBlock } from "./AudioBlock";
import { PlaybackCursor } from "./PlaybackCursor";
import { useDragHandler } from "../hooks/useDragHandler";

interface TrackRowProps {
  track: AudioTrack;
  index: number;
  isSelected: boolean;
  onTrackClick: (index: number) => void;
  onRemoveTrack: (trackId: string) => void;
  onUpdateTrackStartTime: (trackId: string, newStartTime: number) => void;
  currentTime: number;
  isPlaying: boolean;
}

const PIXELS_PER_SECOND = 60;

export function TrackRow({
  track,
  index,
  isSelected,
  onTrackClick,
  onRemoveTrack,
  onUpdateTrackStartTime,
  currentTime,
  isPlaying
}: TrackRowProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const { isDragging, handleMouseDown } = useDragHandler({
    track,
    timelineRef,
    pixelsPerSecond: PIXELS_PER_SECOND,
    onUpdateTrackStartTime,
  });

  const trackNumber = index + 1;

  return (
    <div className="flex items-center hover:bg-purple-50/50 transition-colors duration-200">
      <div className="w-40 p-6 bg-gradient-to-r from-slate-50 to-purple-50 border-r border-purple-100 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-700 mb-1">
            Track {trackNumber}
          </span>
          <span className="text-xs text-slate-500 truncate max-w-24" title={track.name}>
            {track.name}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemoveTrack(track.id);
          }}
          className="text-red-400 hover:text-red-600 hover:bg-red-50 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all duration-200"
          title="Remove track"
        >
          ✕
        </button>
      </div>

      <div
        className="flex-1 p-6 relative cursor-pointer"
        onClick={() => onTrackClick(index)}
      >
        <TimelineMarkers pixelsPerSecond={PIXELS_PER_SECOND} />

        <div className="mt-6 relative h-12 overflow-visible" ref={timelineRef}>
          <AudioBlock
            track={track}
            isSelected={isSelected}
            isDragging={isDragging}
            pixelsPerSecond={PIXELS_PER_SECOND}
            onMouseDown={handleMouseDown}
            onTrackClick={onTrackClick}
            index={index}
          />

          <PlaybackCursor
            currentTime={currentTime}
            pixelsPerSecond={PIXELS_PER_SECOND}
            isVisible={isPlaying}
          />

          {track.startTime > 0 && (
            <div
              className="absolute text-xs text-gray-500 bg-white px-1 rounded"
              style={{
                left: `${track.startTime * PIXELS_PER_SECOND}px`,
                top: '-20px'
              }}
            >
              {track.startTime.toFixed(1)}s
            </div>
          )}
        </div>
      </div>
    </div>
  );
}