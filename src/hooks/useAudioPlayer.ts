import { useRef, useState, useCallback } from 'react';
import { AudioTrack } from '../types/AudioTrack';

interface UseAudioPlayerProps {
  audioContext: AudioContext | null;
}

export function useAudioPlayer({ audioContext }: UseAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
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
      pausedAtRef.current = audioContext.currentTime - startTimeRef.current + pausedAtRef.current;
      stop();
      setIsPlaying(false);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  }, [audioContext, isPlaying, stop]);

  return {
    isPlaying,
    currentTime,
    play,
    pause,
    stop
  };
}