"use client";

import React, { useRef, useCallback, useState } from "react";
import { AudioTrack } from "../types/AudioTrack";
import { WaveformVisualization } from "./WaveformVisualization";
import { Volume2, X } from "lucide-react";

interface TrackState {
  id: string;
  isMuted: boolean;
  isSolo: boolean;
  volume: number;
}

interface VegasTimelineAreaProps {
  tracks: AudioTrack[];
  selectedTrackIndex: number | null;
  trackStates: { [trackId: string]: TrackState };
  currentTime: number;
  clickPosition: number;
  lastPlayPosition: number;
  isPlaying: boolean;
  onTrackClick: (index: number) => void;
  onRemoveTrack: (trackId: string) => void;
  onUpdateTrackStartTime: (trackId: string, newStartTime: number) => void;
  onTrackMuteToggle: (trackId: string) => void;
  onTrackSoloToggle: (trackId: string) => void;
  onTrackVolumeChange: (trackId: string, volume: number) => void;
  onTrackNameChange: (trackId: string, newName: string) => void;
  onSeek: (time: number) => void;
  onSetClickPosition: (position: number) => void;
  onAddTrack: () => void;
}

const PIXELS_PER_SECOND = 60;
const TRACK_HEIGHT = 80;
const TRACK_PANEL_WIDTH = 200;

export function VegasTimelineArea({
  tracks,
  selectedTrackIndex,
  trackStates,
  currentTime,
  clickPosition,
  lastPlayPosition,
  isPlaying,
  onTrackClick,
  onRemoveTrack,
  onUpdateTrackStartTime,
  onTrackMuteToggle,
  onTrackSoloToggle,
  onTrackVolumeChange,
  onTrackNameChange,
  onSeek,
  onSetClickPosition,
  onAddTrack
}: VegasTimelineAreaProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTrackId, setDraggedTrackId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const totalDuration = Math.max(...tracks.map(track => track.startTime + track.duration), 120);
  const timelineWidth = totalDuration * PIXELS_PER_SECOND * zoomLevel;

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 100);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const handleTimelineClick = useCallback((e: React.MouseEvent) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left - TRACK_PANEL_WIDTH;
    const clickTime = Math.max(0, (clickX / (PIXELS_PER_SECOND * zoomLevel)));

    onSetClickPosition(clickTime);

    // Vegas Pro style: Single click sets cursor, double click plays
    if (e.detail === 2) {
      onSeek(clickTime);
    }
  }, [zoomLevel, onSetClickPosition, onSeek]);

  const handleTrackMouseDown = useCallback((e: React.MouseEvent, trackId: string) => {
    e.preventDefault();
    setIsDragging(true);
    setDraggedTrackId(trackId);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !draggedTrackId || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - TRACK_PANEL_WIDTH;
    const newStartTime = Math.max(0, mouseX / (PIXELS_PER_SECOND * zoomLevel));

    onUpdateTrackStartTime(draggedTrackId, newStartTime);
  }, [isDragging, draggedTrackId, zoomLevel, onUpdateTrackStartTime]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDraggedTrackId(null);
  }, []);

  // Add global mouse event listeners
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {/* Timeline Header */}
      <div className="h-8 bg-gray-800 border-b border-gray-700 flex">
        {/* Track Panel Header */}
        <div className="w-[200px] bg-gray-700 border-r border-gray-700 flex items-center px-3">
          <span className="text-xs text-gray-400 font-medium">TRACKS</span>
          <button
            onClick={onAddTrack}
            className="ml-auto text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-600"
            title="Add Track (Ctrl+Q)"
          >
            + ADD
          </button>
        </div>

        {/* Timeline Ruler */}
        <div className="flex-1 relative overflow-x-auto">
          <div
            className="relative h-full"
            style={{ width: `${timelineWidth}px` }}
          >
            {/* Time markers */}
            {Array.from({ length: Math.ceil(totalDuration / 10) + 1 }, (_, i) => i * 10).map(time => (
              <div
                key={time}
                className="absolute top-0 bottom-0 border-l border-gray-600"
                style={{ left: time * PIXELS_PER_SECOND * zoomLevel }}
              >
                <span className="text-xs text-gray-400 ml-1">
                  {formatTime(time)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div
        ref={timelineRef}
        className="flex-1 flex overflow-auto cursor-crosshair"
        onClick={handleTimelineClick}
      >
        {/* Track Panel */}
        <div className="w-[200px] bg-gray-800 border-r border-gray-700 flex-shrink-0">
          {tracks.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <div className="text-sm">No tracks</div>
              <button
                onClick={onAddTrack}
                className="mt-2 text-xs text-blue-400 hover:text-blue-300 underline"
              >
                Add your first track
              </button>
            </div>
          ) : (
            tracks.map((track, index) => {
              const state = trackStates[track.id] || { isMuted: false, isSolo: false, volume: 100 };
              return (
                <div
                  key={track.id}
                  className={`h-[80px] border-b border-gray-700 p-2 flex flex-col justify-between ${
                    selectedTrackIndex === index ? 'bg-blue-900/30' : 'hover:bg-gray-700'
                  }`}
                  onClick={() => onTrackClick(index)}
                >
                  {/* Track Name */}
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={track.name}
                      onChange={(e) => onTrackNameChange(track.id, e.target.value)}
                      className="text-sm text-white bg-transparent border-none outline-none flex-1 mr-2"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveTrack(track.id);
                      }}
                      className="text-gray-400 hover:text-red-400 p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Track Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTrackMuteToggle(track.id);
                      }}
                      className={`text-xs px-2 py-1 rounded ${
                        state.isMuted
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      M
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTrackSoloToggle(track.id);
                      }}
                      className={`text-xs px-2 py-1 rounded ${
                        state.isSolo
                          ? 'bg-yellow-600 text-white'
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      S
                    </button>

                    <div className="flex items-center gap-1 flex-1">
                      <Volume2 className="w-3 h-3 text-gray-400" />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={state.volume}
                        onChange={(e) => onTrackVolumeChange(track.id, parseInt(e.target.value))}
                        className="flex-1 accent-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Timeline Tracks */}
        <div
          className="flex-1 relative"
          style={{ width: `${timelineWidth}px` }}
        >
          {/* Background Grid */}
          {Array.from({ length: Math.ceil(totalDuration / 10) + 1 }, (_, i) => i * 10).map(time => (
            <div
              key={time}
              className="absolute top-0 bottom-0 border-l border-gray-700/30"
              style={{ left: time * PIXELS_PER_SECOND * zoomLevel }}
            />
          ))}

          {/* Tracks */}
          {tracks.map((track, index) => {
            const trackLeft = track.startTime * PIXELS_PER_SECOND * zoomLevel;
            const trackWidth = track.duration * PIXELS_PER_SECOND * zoomLevel;
            const trackTop = index * TRACK_HEIGHT;

            return (
              <div
                key={track.id}
                className={`absolute border border-gray-600 rounded cursor-move ${
                  selectedTrackIndex === index ? 'border-blue-400' : ''
                }`}
                style={{
                  left: `${trackLeft}px`,
                  top: `${trackTop}px`,
                  width: `${trackWidth}px`,
                  height: `${TRACK_HEIGHT - 1}px`
                }}
                onMouseDown={(e) => handleTrackMouseDown(e, track.id)}
              >
                <WaveformVisualization
                  audioBuffer={track.audioBuffer}
                  width={trackWidth}
                  height={TRACK_HEIGHT - 1}
                  color={track.color}
                  duration={track.duration}
                  startTime={track.startTime}
                  currentTime={currentTime}
                  pixelsPerSecond={PIXELS_PER_SECOND * zoomLevel}
                  className="rounded"
                />
              </div>
            );
          })}

          {/* Dual Cursor System */}
          {/* Click Position Cursor (Fixed Position) */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-amber-400 pointer-events-none z-10 shadow-lg"
            style={{ left: clickPosition * PIXELS_PER_SECOND * zoomLevel }}
          >
            <div className="absolute top-0 w-3 h-3 bg-amber-400 rounded-full transform -translate-x-1/2" />
          </div>

          {/* Playback Cursor (Current Time) */}
          {isPlaying && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-green-400 pointer-events-none z-10 shadow-lg"
              style={{ left: currentTime * PIXELS_PER_SECOND * zoomLevel }}
            >
              <div className="absolute top-0 w-3 h-3 bg-green-400 rounded-full transform -translate-x-1/2" />
            </div>
          )}

          {/* Last Play Position Cursor */}
          {lastPlayPosition > 0 && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-blue-400/70 pointer-events-none z-10"
              style={{ left: lastPlayPosition * PIXELS_PER_SECOND * zoomLevel }}
            >
              <div className="absolute top-0 w-2 h-2 bg-blue-400 rounded-full transform -translate-x-1/2" />
            </div>
          )}
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="h-8 bg-gray-800 border-t border-gray-700 flex items-center px-3 gap-2">
        <span className="text-xs text-gray-400">Zoom:</span>
        <button
          onClick={() => setZoomLevel(prev => Math.max(0.25, prev - 0.25))}
          className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-600"
        >
          -
        </button>
        <span className="text-xs text-gray-300 w-12 text-center">{(zoomLevel * 100).toFixed(0)}%</span>
        <button
          onClick={() => setZoomLevel(prev => Math.min(4, prev + 0.25))}
          className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-600"
        >
          +
        </button>

        <div className="ml-auto text-xs text-gray-500">
          Double-click timeline to play from position • Drag tracks to reposition
        </div>
      </div>
    </div>
  );
}