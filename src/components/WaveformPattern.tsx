"use client";

interface WaveformPatternProps {
  barCount?: number;
}

export function WaveformPattern({ barCount = 20 }: WaveformPatternProps) {
  return (
    <div className="h-full flex items-center px-3">
      <div className="flex items-center space-x-1 opacity-30">
        {Array.from({ length: barCount }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-full"
            style={{
              width: '2px',
              height: `${Math.random() * 20 + 10}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}