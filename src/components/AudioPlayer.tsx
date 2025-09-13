"use client";

import { motion } from "framer-motion";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { WaveformVisualization } from "./ui/WaveformVisualization";
import { VolumeControl } from "./ui/VolumeControl";
import { PlayButton } from "./ui/PlayButton";

interface Props {
  title: string;
  url: string | null;
  onMaximize?: () => void;
  onAudioLoad?: (audio: HTMLAudioElement) => void;
  disabled?: boolean;
}

export default function AudioPlayer({ title, url, onMaximize, onAudioLoad, disabled }: Props) {
  const {
    audioRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    isLoaded,
    togglePlay,
    seekTo,
    setVolume,
    formatTime
  } = useAudioPlayer({
    url,
    onAudioLoad,
    onPlayStateChange: () => {
      // Handle play state changes if needed
    }
  });

  const handleWaveformSeek = (progress: number) => {
    const newTime = progress * duration;
    seekTo(newTime);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 ${
        disabled ? 'opacity-50 pointer-events-none' : 'hover:bg-white/10'
      } transition-all duration-300`}
    >
      <audio ref={audioRef} src={url || undefined} preload="metadata" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold text-lg">{title}</h3>
        {onMaximize && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onMaximize}
            className="p-2 text-white/60 hover:text-white/80 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </motion.button>
        )}
      </div>

      {/* Waveform */}
      <div className="mb-6">
        <WaveformVisualization
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          onSeek={handleWaveformSeek}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Play Button */}
        <PlayButton
          isPlaying={isPlaying}
          onToggle={togglePlay}
          disabled={!isLoaded}
        />

        {/* Time Display */}
        <div className="flex items-center space-x-4 text-white/80 text-sm">
          <span className="font-mono">{formatTime(currentTime)}</span>
          <span>/</span>
          <span className="font-mono">{formatTime(duration)}</span>
        </div>

        {/* Volume Control */}
        <VolumeControl
          volume={volume}
          onVolumeChange={setVolume}
        />
      </div>

      {/* Loading State */}
      {!isLoaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center mt-4"
        >
          <div className="flex items-center space-x-2 text-white/60">
            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Loading audio...</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
