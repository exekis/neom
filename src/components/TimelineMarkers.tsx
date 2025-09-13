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
    <div className="relative h-6 border-b border-slate-700/30">
      {Array.from({ length: markerCount }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 h-full border-l border-slate-600/50"
          style={{ left: `${i * pixelsPerSecond}px` }}
        >
          <span className="text-xs text-slate-400 ml-1">{i}s</span>
        </div>
      ))}
    </div>
  );
}
