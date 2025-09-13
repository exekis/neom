import { useState, RefObject } from "react";
import { AudioTrack } from "../types/AudioTrack";

interface UseDragHandlerProps {
  track: AudioTrack;
  timelineRef: RefObject<HTMLDivElement | null>;
  pixelsPerSecond: number;
  onUpdateTrackStartTime: (trackId: string, newStartTime: number) => void;
}

export function useDragHandler({
  track,
  timelineRef,
  pixelsPerSecond,
  onUpdateTrackStartTime,
}: UseDragHandlerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartPixels, setDragStartPixels] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!timelineRef.current) return;

    const timelineRect = timelineRef.current.getBoundingClientRect();
    const initialTrackPixels = track.startTime * pixelsPerSecond;

    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartPixels(initialTrackPixels);

    const handleMouseMove = (e: MouseEvent) => {
      if (!timelineRef.current) return;

      const timelineRect = timelineRef.current.getBoundingClientRect();
      const mouseX = e.clientX - timelineRect.left;
      const newStartTime = Math.max(0, mouseX / pixelsPerSecond);

      onUpdateTrackStartTime(track.id, newStartTime);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return { isDragging, handleMouseDown };
}