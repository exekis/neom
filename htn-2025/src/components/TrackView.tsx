"use client";

import { useState, useRef } from "react";
import { AudioTrack } from "../app/page";

interface TrackViewProps {
  tracks: AudioTrack[];
  selectedTrackIndex: number | null;
  onTrackClick: (index: number) => void;
  onRemoveTrack: (trackId: string) => void;
  onUpdateTrackStartTime: (trackId: string, newStartTime: number) => void;
}

interface TrackRowProps {
  track: AudioTrack;
  index: number;
  isSelected: boolean;
  onTrackClick: (index: number) => void;
  onRemoveTrack: (trackId: string) => void;
  onUpdateTrackStartTime: (trackId: string, newStartTime: number) => void;
}

function TrackRow({ track, index, isSelected, onTrackClick, onRemoveTrack, onUpdateTrackStartTime }: TrackRowProps) {
  const trackNumber = index + 1;
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartPixels, setDragStartPixels] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  const PIXELS_PER_SECOND = 60; // Adjust this to change timeline scale
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartPixels(track.startTime * PIXELS_PER_SECOND);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!timelineRef.current) return;
      
      const deltaX = e.clientX - dragStartX;
      console.log("e.clientX:", e.clientX);
      console.log("Drag start pixels:", dragStartX);
      console.log("Delta X:", deltaX);
      const newPixelPosition = dragStartPixels + deltaX // Math.max(0, dragStartPixels + deltaX);
      console.log("newPixelPosition:", newPixelPosition)
      const newStartTime = newPixelPosition / PIXELS_PER_SECOND;
      console.log("newStartTime:", newStartTime)
      
      onUpdateTrackStartTime(track.id, newStartTime);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="flex items-center border-b border-gray-200 last:border-b-0">
      {/* Track Label */}
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
      
      {/* Timeline Area */}
      <div 
        className="flex-1 p-4 relative"
        onClick={() => onTrackClick(index)}
      >
        {/* Time markers */}
        <div className="absolute top-0 left-0 right-0 h-6 border-b border-gray-200">
          {Array.from({ length: 21 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-0 h-full border-l border-gray-300"
              style={{ left: `${i * PIXELS_PER_SECOND}px` }}
            >
              <span className="text-xs text-gray-500 ml-1">{i}s</span>
            </div>
          ))}
        </div>
        
        {/* Audio Block */}
        <div className="mt-6 relative h-12 overflow-visible" ref={timelineRef}>
          <div
            className={`h-12 rounded-md shadow-sm cursor-move ${
              isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
            } ${
              isDragging ? 'opacity-80 z-10' : ''
            }`}
            style={{
              backgroundColor: track.color,
              width: `${track.duration * PIXELS_PER_SECOND}px`,
              transform: `translateX(${track.startTime * PIXELS_PER_SECOND}px)`,
              position: 'relative',
            }}
            onMouseDown={handleMouseDown}
            onClick={(e) => {
              e.stopPropagation();
              onTrackClick(index);
            }}
          >
            {/* Waveform-like pattern */}
            <div className="h-full flex items-center px-3">
              <div className="flex items-center space-x-1 opacity-30">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-full"
                    style={{
                      width: '2px',
                      height: `${Math.random() * 20 + 10}px`,
                    }}
                  />
                ))}
              </div>
            </div>
            
            {/* Track name overlay */}
            <div className="absolute inset-0 flex items-center px-3">
              <span className="text-white text-sm font-medium truncate">
                {track.name}
              </span>
            </div>
          </div>
          
          {/* Start time indicator */}
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

export default function TrackView({ tracks, selectedTrackIndex, onTrackClick, onRemoveTrack, onUpdateTrackStartTime }: TrackViewProps) {
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
