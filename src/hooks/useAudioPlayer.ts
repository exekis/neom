import { useState, useRef, useEffect } from "react";
// framer-motion not needed in this hook

interface UseAudioPlayerProps {
  url: string | null;
  onAudioLoad?: (audio: HTMLAudioElement) => void;
  volume?: number;
  onPlayStateChange?: (isPlaying: boolean) => void;
  onTimeUpdate?: (currentTime: number) => void;
}

interface UseAudioPlayerReturn {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLoaded: boolean;
  togglePlay: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  formatTime: (time: number) => string;
}

export const useAudioPlayer = ({
  url,
  onAudioLoad,
  volume = 1,
  onPlayStateChange,
  onTimeUpdate
}: UseAudioPlayerProps): UseAudioPlayerReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentVolume, setVolume] = useState(volume);
  const [isLoaded, setIsLoaded] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (url && audioRef.current) {
      const audio = audioRef.current;
      audio.volume = currentVolume;

      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
        setIsLoaded(true);
        onAudioLoad?.(audio);
      };

      const handleTimeUpdate = () => {
        const time = audio.currentTime;
        setCurrentTime(time);
        onTimeUpdate?.(time);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        onPlayStateChange?.(false);
      };

      const handlePlay = () => {
        setIsPlaying(true);
        onPlayStateChange?.(true);
      };

      const handlePause = () => {
        setIsPlaying(false);
        onPlayStateChange?.(false);
      };

      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);

      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
      };
    }
  }, [url, onAudioLoad, onPlayStateChange, onTimeUpdate, currentVolume]);

  const togglePlay = async () => {
    if (!audioRef.current || !isLoaded) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      await audioRef.current.play();
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current && isLoaded) {
      const clampedTime = Math.max(0, Math.min(time, duration));
      audioRef.current.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    }
  };

  const handleSetVolume = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    audioRef,
    isPlaying,
    currentTime,
    duration,
    volume: currentVolume,
    isLoaded,
    togglePlay,
    seekTo,
    setVolume: handleSetVolume,
    formatTime
  };
};
