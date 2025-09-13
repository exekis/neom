import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface WaveformVisualizationProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onSeek: (progress: number) => void;
  className?: string;
}

export const WaveformVisualization = ({
  currentTime,
  duration,
  isPlaying,
  onSeek,
  className = ""
}: WaveformVisualizationProps) => {
  // Initialize deterministically to avoid SSR/CSR mismatch
  const [waveformData, setWaveformData] = useState<number[]>(() =>
    Array.from({ length: 100 }, () => 0)
  );

  useEffect(() => {
    // Generate waveform only on the client after mount
    const newWaveform = Array.from({ length: 100 }, (_, i) => {
      const noise = Math.sin(i / 8) * 20 + Math.sin(i / 3) * 10;
      const base = 50 + noise; // 0-100%
      return Math.max(8, Math.min(100, base + Math.random() * 10));
    });
    setWaveformData(newWaveform);
  }, []);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const progress = Math.max(0, Math.min(1, x / rect.width));
    onSeek(progress);
  };

  return (
    <div className={`h-20 bg-white/5 rounded-lg overflow-hidden cursor-pointer relative ${className}`}>
      <div className="flex justify-between px-3 py-2 text-xs text-white/60">
        {Array.from({ length: 6 }, (_, i) => (i / 5) * (duration || 0)).map((time, index) => (
          <span key={index}>{formatTime(time)}</span>
        ))}
      </div>

      <div className="absolute inset-0 flex items-center">
        {waveformData.map((height, index) => {
          const progress = duration ? currentTime / duration : 0;
          const isActive = index / waveformData.length <= progress;

          return (
            <motion.div
              key={index}
              className={`flex-1 w-[2px] rounded-full mx-[1px] ${
                isActive
                  ? 'bg-gradient-to-t from-purple-400 to-pink-400'
                  : 'bg-gradient-to-t from-blue-400 to-purple-400 opacity-60'
              }`}
              style={{ height: `${height}%` }}
              animate={{ height: isPlaying && isActive ? [height * 1.1, height] : height }}
              transition={{ duration: isPlaying ? 0.3 : 0, repeat: isPlaying ? Infinity : 0 }}
            />
          );
        })}
      </div>

      {/* Click overlay */}
      <div className="absolute inset-0" onClick={handleSeek} />
    </div>
  );
};

const formatTime = (time: number): string => {
  const minutes = Math.floor((time || 0) / 60);
  const seconds = Math.floor((time || 0) % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
