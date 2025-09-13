"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AudioTrack } from "../types/AudioTrack";
import { WaveformVisualization } from "./WaveformVisualization";
import { X, Play, Pause, Square, Scissors, Volume2, Zap, RotateCcw, RotateCw } from "lucide-react";

interface AudioRegion {
  id: string;
  startTime: number;
  endTime: number;
  name: string;
}

interface AudioEditingModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: AudioTrack | null;
  onUpdateTrack: (updatedTrack: AudioTrack) => void;
}

export function AudioEditingModal({
  isOpen,
  onClose,
  track,
  onUpdateTrack
}: AudioEditingModalProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<AudioRegion | null>(null);
  const [regions, setRegions] = useState<AudioRegion[]>([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [volume, setVolume] = useState(100);

  const waveformRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const PIXELS_PER_SECOND = 200 * zoomLevel;

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const stopPlayback = useCallback(() => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const startPlayback = useCallback(async (startTime = 0) => {
    if (!track?.audioBuffer) return;

    stopPlayback();

    const audioContext = initAudioContext();
    const source = audioContext.createBufferSource();
    source.buffer = track.audioBuffer;

    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume / 100;

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    source.start(0, startTime);
    sourceNodeRef.current = source;
    setIsPlaying(true);

    const playStartTime = audioContext.currentTime;
    const updateTime = () => {
      if (audioContext.currentTime - playStartTime < track.duration - startTime) {
        setCurrentTime(startTime + (audioContext.currentTime - playStartTime));
        requestAnimationFrame(updateTime);
      } else {
        stopPlayback();
      }
    };
    updateTime();

    source.onended = () => {
      setIsPlaying(false);
    };
  }, [track, volume, stopPlayback, initAudioContext]);

  const handleWaveformClick = useCallback((e: React.MouseEvent) => {
    if (!track || !waveformRef.current) return;

    const rect = waveformRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickTime = (clickX / (track.duration * PIXELS_PER_SECOND)) * track.duration;
    const clampedTime = Math.max(0, Math.min(track.duration, clickTime));

    setCurrentTime(clampedTime);
    if (isPlaying) {
      startPlayback(clampedTime);
    }
  }, [track, PIXELS_PER_SECOND, isPlaying, startPlayback]);

  const handleSelectionStart = useCallback((e: React.MouseEvent) => {
    if (!track || !waveformRef.current) return;

    const rect = waveformRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickTime = (clickX / (track.duration * PIXELS_PER_SECOND)) * track.duration;
    const clampedTime = Math.max(0, Math.min(track.duration, clickTime));

    setIsSelecting(true);
    setSelectionStart(clampedTime);
    setSelectionEnd(clampedTime);
  }, [track, PIXELS_PER_SECOND]);

  const handleSelectionMove = useCallback((e: MouseEvent) => {
    if (!isSelecting || !track || !waveformRef.current) return;

    const rect = waveformRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentTime = (currentX / (track.duration * PIXELS_PER_SECOND)) * track.duration;
    const clampedTime = Math.max(0, Math.min(track.duration, currentTime));

    setSelectionEnd(clampedTime);
  }, [isSelecting, track, PIXELS_PER_SECOND]);

  const handleSelectionEnd = useCallback(() => {
    if (isSelecting && Math.abs(selectionEnd - selectionStart) > 0.1) {
      const newRegion: AudioRegion = {
        id: Date.now().toString(),
        startTime: Math.min(selectionStart, selectionEnd),
        endTime: Math.max(selectionStart, selectionEnd),
        name: `Region ${regions.length + 1}`
      };
      setRegions(prev => [...prev, newRegion]);
      setSelectedRegion(newRegion);
    }
    setIsSelecting(false);
  }, [isSelecting, selectionStart, selectionEnd, regions.length]);

  useEffect(() => {
    if (isSelecting) {
      document.addEventListener('mousemove', handleSelectionMove);
      document.addEventListener('mouseup', handleSelectionEnd);
      return () => {
        document.removeEventListener('mousemove', handleSelectionMove);
        document.removeEventListener('mouseup', handleSelectionEnd);
      };
    }
  }, [isSelecting, handleSelectionMove, handleSelectionEnd]);

  const deleteSelectedRegion = useCallback(() => {
    if (selectedRegion) {
      setRegions(prev => prev.filter(r => r.id !== selectedRegion.id));
      setSelectedRegion(null);
    }
  }, [selectedRegion]);

  const playSelectedRegion = useCallback(() => {
    if (selectedRegion) {
      setCurrentTime(selectedRegion.startTime);
      startPlayback(selectedRegion.startTime);
    }
  }, [selectedRegion, startPlayback]);

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, [stopPlayback]);

  if (!isOpen || !track) return null;

  const waveformWidth = track.duration * PIXELS_PER_SECOND;
  const selectionWidth = Math.abs(selectionEnd - selectionStart) * PIXELS_PER_SECOND;
  const selectionLeft = Math.min(selectionStart, selectionEnd) * PIXELS_PER_SECOND;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 max-w-7xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white">{track.name} - Audio Editor</h2>
            <p className="text-slate-400 text-sm">Duration: {track.duration.toFixed(2)}s • Zoom: {zoomLevel.toFixed(1)}x</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Transport Controls */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => isPlaying ? stopPlayback() : startPlayback(currentTime)}
              className={`p-3 rounded-lg transition-colors ${
                isPlaying
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            <button
              onClick={stopPlayback}
              className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white"
            >
              <Square className="w-5 h-5" />
            </button>

            {selectedRegion && (
              <>
                <button
                  onClick={playSelectedRegion}
                  className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white"
                  title="Play Selected Region"
                >
                  <Play className="w-4 h-4" />
                </button>

                <button
                  onClick={deleteSelectedRegion}
                  className="p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-white"
                  title="Delete Selected Region"
                >
                  <Scissors className="w-4 h-4" />
                </button>
              </>
            )}

            <div className="flex items-center gap-2 ml-6">
              <Volume2 className="w-4 h-4 text-slate-400" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-24 accent-blue-500"
              />
              <span className="text-sm text-slate-400 w-8">{volume}</span>
            </div>

            <div className="flex items-center gap-2 ml-6">
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.5))}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                title="Zoom Out"
              >
                <RotateCcw className="w-4 h-4 text-slate-400" />
              </button>
              <button
                onClick={() => setZoomLevel(prev => Math.min(5, prev + 0.5))}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                title="Zoom In"
              >
                <RotateCw className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Waveform Display */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="overflow-x-auto" style={{ maxHeight: '400px' }}>
              <div
                ref={waveformRef}
                className="relative cursor-crosshair"
                style={{ width: `${waveformWidth}px`, height: '200px' }}
                onClick={handleWaveformClick}
                onMouseDown={handleSelectionStart}
              >
                <WaveformVisualization
                  audioBuffer={track.audioBuffer}
                  width={waveformWidth}
                  height={200}
                  color={track.color}
                  duration={track.duration}
                  startTime={0}
                  currentTime={currentTime}
                  pixelsPerSecond={PIXELS_PER_SECOND}
                  className="rounded"
                />

                {/* Current Selection (while dragging) */}
                {isSelecting && selectionWidth > 0 && (
                  <div
                    className="absolute top-0 bottom-0 bg-yellow-400/20 border border-yellow-400/60"
                    style={{
                      left: `${selectionLeft}px`,
                      width: `${selectionWidth}px`
                    }}
                  />
                )}

                {/* Saved Regions */}
                {regions.map((region) => {
                  const regionLeft = region.startTime * PIXELS_PER_SECOND;
                  const regionWidth = (region.endTime - region.startTime) * PIXELS_PER_SECOND;
                  const isSelected = selectedRegion?.id === region.id;

                  return (
                    <div
                      key={region.id}
                      className={`absolute top-0 bottom-0 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-400/30 border-2 border-blue-400'
                          : 'bg-slate-400/20 border border-slate-400/40'
                      }`}
                      style={{
                        left: `${regionLeft}px`,
                        width: `${regionWidth}px`
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRegion(region);
                      }}
                    >
                      <div className="absolute top-1 left-1 text-xs bg-black/60 text-white px-1 rounded">
                        {region.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Region List */}
          {regions.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-3">Regions</h3>
              <div className="space-y-2">
                {regions.map((region) => (
                  <div
                    key={region.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${
                      selectedRegion?.id === region.id
                        ? 'bg-blue-600/20 border-blue-500'
                        : 'bg-slate-800 border-slate-700 hover:bg-slate-750'
                    }`}
                    onClick={() => setSelectedRegion(region)}
                  >
                    <div>
                      <div className="text-white font-medium">{region.name}</div>
                      <div className="text-slate-400 text-sm">
                        {region.startTime.toFixed(2)}s - {region.endTime.toFixed(2)}s
                        ({(region.endTime - region.startTime).toFixed(2)}s)
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentTime(region.startTime);
                          startPlayback(region.startTime);
                        }}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                        title="Play Region"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <h4 className="text-white font-medium mb-2">Instructions</h4>
            <div className="text-sm text-slate-400 space-y-1">
              <p>• Click waveform to set playhead position</p>
              <p>• Click and drag to create regions for editing</p>
              <p>• Select regions to play, edit, or delete them</p>
              <p>• Use zoom controls to get precise editing view</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}