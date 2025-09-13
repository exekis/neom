import { motion } from "framer-motion";

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  className?: string;
}

export const VolumeControl = ({
  volume,
  onVolumeChange,
  className = ""
}: VolumeControlProps) => {
  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const newVolume = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onVolumeChange(newVolume);
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Volume Icon */}
      <svg
        className="w-4 h-4 text-white/60"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        {volume === 0 ? (
          // Muted
          <path d="M8.86,16.8l2.54,2.54a1,1,0,0,1,0,1.41,1,1,0,0,1-1.42,0L7.43,18.23a1,1,0,0,1,0-1.41A1,1,0,0,1,8.86,16.8m0-9.6L7.43,5.76a1,1,0,1,1,1.42-1.41L11.4,6.28a1,1,0,0,1,0,1.41A1,1,0,0,1,9.97,8.13Z"/>
        ) : volume < 0.5 ? (
          // Low volume
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
        ) : (
          // High volume
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v12.54c2.33-.67 4-2.75 4-5.27 0-2.52-1.67-4.6-4-5.27z"/>
        )}
      </svg>

      {/* Volume Slider */}
      <div
        className="w-20 h-2 bg-white/20 rounded-full cursor-pointer"
        onClick={handleVolumeChange}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
          style={{ width: `${volume * 100}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${volume * 100}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>
    </div>
  );
};
