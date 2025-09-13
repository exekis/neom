"use client";

import { useRef } from "react";

interface AudioUploaderProps {
  onFileUpload: (file: File) => void;
}

export function AudioUploader({ onFileUpload }: AudioUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      onFileUpload(file);
    } else {
      alert("Please select a valid audio file.");
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("audio/")) {
      onFileUpload(file);
    } else {
      alert("Please drop a valid audio file.");
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="mb-8">
      <div
        className="border-2 border-dashed border-purple-200 rounded-xl p-8 text-center hover:border-purple-400 hover:bg-purple-50/50 transition-all duration-300 cursor-pointer bg-white/80 backdrop-blur-sm"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="space-y-4">
          <div className="text-5xl mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-transparent">
              🎵
            </span>
          </div>
          <div>
            <p className="text-xl font-semibold text-slate-700 mb-2">
              Drop audio files here or click to browse
            </p>
            <p className="text-slate-500">
              Supports MP3, WAV, OGG, and other professional audio formats
            </p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
