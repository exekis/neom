"use client";

interface WaveformPatternProps {
  barCount?: number;
  seed?: string | number;
}

// Simple seeded random number generator
function seededRandom(seed: string | number) {
  const seedStr = seed.toString();
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    const char = seedStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return function() {
    hash = ((hash * 1103515245) + 12345) & 0x7fffffff;
    return hash / 0x7fffffff;
  };
}

export function WaveformPattern({ barCount = 20, seed = "default" }: WaveformPatternProps) {
  const random = seededRandom(seed);
  
  return (
    <div className="h-full flex items-center px-3">
      <div className="flex items-center space-x-1 opacity-30">
        {Array.from({ length: barCount }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-full"
            style={{
              width: '2px',
              height: `${random() * 20 + 10}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}