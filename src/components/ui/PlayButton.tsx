import { motion } from "framer-motion";
import { useAnimation } from "framer-motion";

interface PlayButtonProps {
  isPlaying: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  className?: string;
}

export const PlayButton = ({
  isPlaying,
  onToggle,
  disabled = false,
  size = "medium",
  className = ""
}: PlayButtonProps) => {
  const controls = useAnimation();

  const handleClick = async () => {
    if (disabled) return;

    onToggle();

    if (isPlaying) {
      // Stop animations when pausing
      controls.stop();
    } else {
      // Restart animations when playing
      controls.start({ rotate: [0, 360] }, {
        duration: 3,
        repeat: Infinity,
        ease: "linear"
      });
    }
  };

  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-16 h-16"
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={controls}
    >
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: isPlaying ? [0, 360] : 0 }}
        transition={{
          rotate: isPlaying ? { duration: 3, repeat: Infinity, ease: "linear" } : { duration: 0.2 }
        }}
      >
        {isPlaying ? (
          <svg className="w-4 h-4 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        ) : (
          <svg className={`w-4 h-4 md:w-6 md:h-6 ${size === "large" ? "ml-1" : "ml-0.5"}`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        )}
      </motion.div>
    </motion.button>
  );
};
