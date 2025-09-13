"use client";

import { AudioTrack } from "../app/page";
import { WaveformPattern } from "./WaveformPattern";

interface AudioBlockProps {
  track: AudioTrack;
  isSelected: boolean;
  isDragging: boolean;
  pixelsPerSecond: number;
  onMouseDown: (e: React.MouseEvent) => void;
  onTrackClick: (index: number) => void;
  index: number;
}

export function AudioBlock({
  track,
  isSelected,
  isDragging,
  pixelsPerSecond,
  onMouseDown,
  onTrackClick,
  index
}: AudioBlockProps) {
  return (
    <div
      className={`h-12 rounded-md shadow-sm cursor-move ${
        isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      } ${isDragging ? 'opacity-80 z-10' : ''}`}
      style={{
        backgroundColor: track.color,
        width: `${track.duration * pixelsPerSecond}px`,
        transform: `translateX(${track.startTime * pixelsPerSecond}px)`,
        position: 'relative',
      }}
      onMouseDown={onMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onTrackClick(index);
      }}
    >
      <WaveformPattern />

      <div className="absolute inset-0 flex items-center px-3">
        <span className="text-white text-sm font-medium truncate">
          {track.name}
        </span>
      </div>
    </div>
  );
}