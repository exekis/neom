"use client";

import { useRef } from "react";

interface AudioUploaderProps {
  onFileUpload: (file: File) => void;
}

export default function AudioUploader({ onFileUpload }: AudioUploaderProps) {
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
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="space-y-4">
          <div className="text-4xl">🎵</div>
          <div>
            <p className="text-lg font-medium text-gray-700">
              Drop audio files here or click to browse
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Supports MP3, WAV, OGG, and other audio formats
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
