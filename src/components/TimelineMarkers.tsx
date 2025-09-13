"use client";

interface TimelineMarkersProps {
  pixelsPerSecond: number;
  markerCount?: number;
}

export function TimelineMarkers({
  pixelsPerSecond,
  markerCount = 21
}: TimelineMarkersProps) {
  return (
    <div className="absolute top-0 left-0 right-0 h-6 border-b border-gray-200">
      {Array.from({ length: markerCount }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 h-full border-l border-gray-300"
          style={{ left: `${i * pixelsPerSecond}px` }}
        >
          <span className="text-xs text-gray-500 ml-1">{i}s</span>
        </div>
      ))}
    </div>
  );
}