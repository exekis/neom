import { useRef, useState, useCallback } from 'react';
import { AudioTrack } from '../types/AudioTrack';

interface UseAudioPlayerProps {
  audioContext: AudioContext | null;
}

export function useAudioPlayer({ audioContext }: UseAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [clickPosition, setClickPosition] = useState(0); // Last clicked position
  const [lastPlayPosition, setLastPlayPosition] = useState(0); // Position when last stopped/paused
  const sourceNodesRef = useRef<AudioBufferSourceNode[]>([]);
  const startTimeRef = useRef(0);
  const pausedAtRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  const updateCurrentTime = useCallback(() => {
    if (audioContext && isPlaying) {
      const elapsed = audioContext.currentTime - startTimeRef.current + pausedAtRef.current;
      setCurrentTime(Math.max(0, elapsed));
      animationFrameRef.current = requestAnimationFrame(updateCurrentTime);
    }
  }, [audioContext, isPlaying]);

  const stop = useCallback(() => {
    sourceNodesRef.current.forEach((source) => {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // Source may already be stopped
      }
    });
    sourceNodesRef.current = [];
    setIsPlaying(false);
    setCurrentTime(0);
    pausedAtRef.current = 0;
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const play = useCallback(async (tracks: AudioTrack[]) => {
    if (!audioContext || tracks.length === 0) return;

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    stop();

    const sourceNodes: AudioBufferSourceNode[] = [];
    const startTime = audioContext.currentTime;
    startTimeRef.current = startTime;

    tracks.forEach((track) => {
      const source = audioContext.createBufferSource();
      source.buffer = track.audioBuffer;
      source.connect(audioContext.destination);
      source.start(startTime + track.startTime);
      sourceNodes.push(source);
    });

    sourceNodesRef.current = sourceNodes;
    setIsPlaying(true);
    updateCurrentTime();

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      pausedAtRef.current = 0;
    };

    if (sourceNodes.length > 0) {
      sourceNodes[0].onended = handleEnded;
    }
  }, [audioContext, updateCurrentTime, stop]);

  const pause = useCallback(() => {
    if (audioContext && isPlaying) {
      const currentPos = audioContext.currentTime - startTimeRef.current + pausedAtRef.current;
      pausedAtRef.current = currentPos;
      setLastPlayPosition(currentPos);
      stop();
      setIsPlaying(false);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  }, [audioContext, isPlaying, stop]);

  const seek = useCallback((time: number) => {
    const wasPlaying = isPlaying;
    if (isPlaying) {
      stop();
    }
    pausedAtRef.current = Math.max(0, time);
    setCurrentTime(time);
    setClickPosition(time);
    if (wasPlaying) {
      // Resume playback from new position would require re-creating audio nodes
      // For now just update the time position
    }
  }, [isPlaying, stop]);

  // Play from clicked position (spacebar behavior)
  const playFromClick = useCallback(async (tracks: AudioTrack[]) => {
    if (clickPosition > 0) {
      pausedAtRef.current = clickPosition;
      setCurrentTime(clickPosition);
    }
    await play(tracks);
  }, [clickPosition, play]);

  // Continue from last played position (Enter behavior)
  const playFromLast = useCallback(async (tracks: AudioTrack[]) => {
    if (lastPlayPosition > 0) {
      pausedAtRef.current = lastPlayPosition;
      setCurrentTime(lastPlayPosition);
    }
    await play(tracks);
  }, [lastPlayPosition, play]);

  // Set click position without seeking
  const setClickPos = useCallback((time: number) => {
    setClickPosition(Math.max(0, time));
  }, []);

  // Skip to beginning
  const skipToBeginning = useCallback((tracks: AudioTrack[]) => {
    const wasPlaying = isPlaying;
    if (isPlaying) {
      stop();
    }
    pausedAtRef.current = 0;
    setCurrentTime(0);
    setClickPosition(0);
    setLastPlayPosition(0);
    if (wasPlaying) {
      play(tracks);
    }
  }, [isPlaying, stop, play]);

  // Skip to end
  const skipToEnd = useCallback((tracks: AudioTrack[]) => {
    if (tracks.length === 0) return;

    const wasPlaying = isPlaying;
    if (isPlaying) {
      stop();
    }

    // Calculate the maximum end time across all tracks
    const maxEndTime = Math.max(...tracks.map(track => track.startTime + track.duration));

    pausedAtRef.current = maxEndTime;
    setCurrentTime(maxEndTime);
    setClickPosition(maxEndTime);
    setLastPlayPosition(maxEndTime);

    if (wasPlaying) {
      play(tracks);
    }
  }, [isPlaying, stop, play]);

  return {
    isPlaying,
    currentTime,
    clickPosition,
    lastPlayPosition,
    play,
    pause,
    stop,
    seek,
    playFromClick,
    playFromLast,
    setClickPos,
    skipToBeginning,
    skipToEnd
  };
}