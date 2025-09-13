"use client";

interface PlaybackCursorProps {
  currentTime: number;
  pixelsPerSecond: number;
  isVisible: boolean;
}

export function PlaybackCursor({ currentTime, pixelsPerSecond, isVisible }: PlaybackCursorProps) {
  if (!isVisible) return null;

  return (
    <div
      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
      style={{
        left: `${currentTime * pixelsPerSecond}px`,
        transition: 'left 0.1s ease-out'
      }}
    >
      <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full" />
    </div>
  );
}