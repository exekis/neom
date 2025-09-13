"use client";

import { AudioTrack } from "../types/AudioTrack";
import { EnhancedTrackRow } from "./EnhancedTrackRow";

interface TrackState {
  id: string;
  isMuted: boolean;
  isSolo: boolean;
  volume: number;
}

interface EnhancedTrackViewProps {
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
  currentTime: number;
  isPlaying: boolean;
  onSeek?: (time: number) => void;
  bpm?: number;
}

export function EnhancedTrackView({
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
  currentTime,
  isPlaying,
  onSeek,
  bpm = 120
}: EnhancedTrackViewProps) {
  if (tracks.length === 0) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700/30 p-12 text-center">
        <div className="text-6xl mb-4 opacity-60">🎵</div>
        <h3 className="text-xl font-semibold text-white mb-2">Ready to create?</h3>
        <p className="text-slate-400">Upload your first audio file to start building your masterpiece</p>
      </div>
    );
  }

  const PIXELS_PER_SECOND = 60;
  const maxDuration = Math.max(...tracks.map(track => track.startTime + track.duration));
  const timelineWidth = Math.max(800, maxDuration * PIXELS_PER_SECOND);

  const beatsPerSecond = bpm / 60;
  const secondsPerBar = 4 / beatsPerSecond;
  const barsInTimeline = Math.ceil(maxDuration / secondsPerBar);

  const renderTimelineGrid = () => {
    const gridLines = [];

    for (let bar = 0; bar <= barsInTimeline; bar++) {
      const timeInSeconds = bar * secondsPerBar;
      const xPosition = timeInSeconds * PIXELS_PER_SECOND;

      if (xPosition <= timelineWidth) {
        gridLines.push(
          <div
            key={`bar-${bar}`}
            className="absolute top-0 bottom-0 border-l border-slate-600/50"
            style={{ left: `${xPosition}px` }}
          >
            <div className="absolute -top-6 left-1 text-xs text-slate-400 font-mono">
              {bar + 1}
            </div>
          </div>
        );

        for (let beat = 1; beat < 4; beat++) {
          const beatTime = timeInSeconds + (beat * secondsPerBar / 4);
          const beatX = beatTime * PIXELS_PER_SECOND;

          if (beatX <= timelineWidth) {
            gridLines.push(
              <div
                key={`beat-${bar}-${beat}`}
                className="absolute top-0 bottom-0 border-l border-slate-700/30"
                style={{ left: `${beatX}px` }}
              />
            );
          }
        }
      }
    }

    const playheadPosition = currentTime * PIXELS_PER_SECOND;
    gridLines.push(
      <div
        key="playhead"
        className={`absolute top-0 bottom-0 border-l-2 pointer-events-none z-10 ${
          isPlaying ? 'border-slate-100' : 'border-slate-300'
        }`}
        style={{ left: `${playheadPosition}px` }}
      >
        <div className={`absolute -top-2 left-0 w-4 h-4 transform -translate-x-1/2 rotate-45 ${
          isPlaying ? 'bg-slate-100' : 'bg-slate-300'
        }`} />
      </div>
    );

    return gridLines;
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700/30 overflow-hidden">
      <div className="border-b border-slate-700/30 p-6 bg-slate-800/30">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Timeline ({tracks.length} track{tracks.length !== 1 ? 's' : ''})
          </h2>
          <div className="text-sm text-slate-400">
            {bpm} BPM • {Math.floor(maxDuration / 60)}:{Math.floor(maxDuration % 60).toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="h-8 bg-slate-800/50 border-b border-slate-700/30 relative overflow-x-auto">
          <div
            className="relative h-full"
            style={{ width: `${timelineWidth}px` }}
          >
            {renderTimelineGrid()}
          </div>
        </div>

        {/* Unified Playhead - spans across all tracks */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none z-20"
          style={{
            left: `${264 + (currentTime * PIXELS_PER_SECOND)}px`,
            width: '2px'
          }}
        >
          <div className={`w-full h-full ${
            isPlaying ? 'bg-white' : 'bg-slate-300'
          } shadow-lg`} />
          <div className={`absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-transparent ${
            isPlaying ? 'border-b-white' : 'border-b-slate-300'
          }`} />
        </div>

        <div className="space-y-2">
          {tracks.map((track, index) => {
            const trackState = trackStates[track.id] || {
              id: track.id,
              isMuted: false,
              isSolo: false,
              volume: 100
            };

            return (
              <div key={track.id} className="flex">
                {/* Track Controls */}
                <div className="w-64 flex-shrink-0 bg-slate-800/50 p-3 border-r border-slate-700/30">
                  <EnhancedTrackRow
                    track={track}
                    index={index}
                    isSelected={selectedTrackIndex === index}
                    isMuted={trackState.isMuted}
                    isSolo={trackState.isSolo}
                    volume={trackState.volume}
                    onClick={() => onTrackClick(index)}
                    onRemove={() => onRemoveTrack(track.id)}
                    onMuteToggle={() => onTrackMuteToggle(track.id)}
                    onSoloToggle={() => onTrackSoloToggle(track.id)}
                    onVolumeChange={(volume) => onTrackVolumeChange(track.id, volume)}
                    onNameChange={(name) => onTrackNameChange(track.id, name)}
                    onOpenSettings={() => onTrackSettings(track.id)}
                    onOpenAIAgent={() => onTrackAIAgent(track.id)}
                  />
                </div>

                {/* Track Timeline */}
                <div
                  className="flex-1 h-16 bg-slate-900/30 relative overflow-hidden border-b border-slate-700/20 cursor-pointer"
                  onClick={(e) => {
                    if (onSeek) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const clickTime = (clickX / PIXELS_PER_SECOND);
                      onSeek(Math.max(0, clickTime));
                    }
                  }}
                >
                  <div
                    className="relative h-full"
                    style={{ width: `${timelineWidth}px` }}
                  >
                    {/* Track waveform visualization */}
                    <div
                      className="absolute top-2 bottom-2 rounded border border-slate-600/50"
                      style={{
                        left: `${track.startTime * PIXELS_PER_SECOND}px`,
                        width: `${track.duration * PIXELS_PER_SECOND}px`,
                        background: `linear-gradient(90deg, ${track.color}40, ${track.color}20)`,
                        border: `1px solid ${track.color}60`
                      }}
                    >
                      {/* Mock waveform pattern */}
                      <div className="h-full flex items-center px-2">
                        <div className="flex items-center justify-center h-full w-full space-x-px">
                          {Array.from({ length: Math.floor(track.duration / 2) }, (_, i) => (
                            <div
                              key={i}
                              className="bg-current opacity-60"
                              style={{
                                width: '2px',
                                height: `${20 + Math.sin(i * 0.5) * 10}px`,
                                color: track.color
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Track name overlay */}
                      <div className="absolute top-1 left-2 text-xs font-medium text-white/90">
                        {track.name}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}