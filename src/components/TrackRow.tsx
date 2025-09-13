"use client";

import { useRef } from "react";
import { AudioTrack } from "../app/page";
import { TimelineMarkers } from "./TimelineMarkers";
import { AudioBlock } from "./AudioBlock";
import { useDragHandler } from "../hooks/useDragHandler";

interface TrackRowProps {
  track: AudioTrack;
  index: number;
  isSelected: boolean;
  onTrackClick: (index: number) => void;
  onRemoveTrack: (trackId: string) => void;
  onUpdateTrackStartTime: (trackId: string, newStartTime: number) => void;
}

const PIXELS_PER_SECOND = 60;

export function TrackRow({
  track,
  index,
  isSelected,
  onTrackClick,
  onRemoveTrack,
  onUpdateTrackStartTime
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
    <div className="flex items-center border-b border-gray-200 last:border-b-0">
      <div className="w-32 p-4 bg-gray-50 border-r border-gray-200 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">
          Track {trackNumber}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemoveTrack(track.id);
          }}
          className="text-red-500 hover:text-red-700 text-xs ml-2"
          title="Remove track"
        >
          ✕
        </button>
      </div>

      <div
        className="flex-1 p-4 relative"
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