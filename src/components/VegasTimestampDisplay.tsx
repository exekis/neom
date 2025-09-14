"use client";

interface VegasTimestampDisplayProps {
  currentTime: number;
  clickPosition: number;
  totalDuration: number;
}

export function VegasTimestampDisplay({
  currentTime,
  clickPosition,
  totalDuration
}: VegasTimestampDisplayProps) {
  const formatTime = (time: number): string => {
    const totalSeconds = Math.floor(time);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((time - totalSeconds) * 100);

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-4 text-sm">
      {/* Current Playhead Time */}
      <div className="bg-gray-700 px-3 py-1 rounded border border-gray-600">
        <span className="text-gray-300 text-xs">PLAYHEAD</span>
        <div className="text-white font-mono text-sm">
          {formatTime(currentTime)}
        </div>
      </div>

      {/* Click Position Time */}
      <div className="bg-amber-600/20 px-3 py-1 rounded border border-amber-500/50">
        <span className="text-amber-300 text-xs">CURSOR</span>
        <div className="text-amber-100 font-mono text-sm">
          {formatTime(clickPosition)}
        </div>
      </div>

      {/* Total Duration */}
      <div className="bg-gray-700 px-3 py-1 rounded border border-gray-600">
        <span className="text-gray-300 text-xs">TOTAL</span>
        <div className="text-white font-mono text-sm">
          {formatTime(totalDuration)}
        </div>
      </div>
    </div>
  );
}