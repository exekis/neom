"use client";

interface NeomLogoProps {
  className?: string;
}

export function NeomLogo({ className = "" }: NeomLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg">
          <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-80 animate-ping" />
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
        NEOM
      </span>
    </div>
  );
}