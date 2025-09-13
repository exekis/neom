"use client";

interface AudioControlsProps {
  isPlaying: boolean;
  currentTime: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
}

export function AudioControls({
  isPlaying,
  currentTime,
  onPlay,
  onPause,
  onStop
}: AudioControlsProps) {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={isPlaying ? onPause : onPlay}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-lg ${
              isPlaying
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:shadow-red-200'
                : 'bg-gradient-to-r from-purple-600 to-emerald-600 hover:shadow-purple-200'
            }`}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>

          <button
            onClick={onStop}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 flex items-center justify-center text-white transition-all duration-200 shadow-lg"
          >
            ⏹️
          </button>
        </div>

        <div className="text-lg text-slate-600 font-mono font-semibold bg-slate-100 px-4 py-2 rounded-lg">
          {formatTime(currentTime)}
        </div>
      </div>
    </div>
  );
}