"use client";

import { useState, useRef } from "react";
import AudioUploader from "../components/AudioUploader";
import TrackView from "../components/TrackView";

export interface AudioTrack {
  id: string;
  name: string;
  audioBuffer: AudioBuffer;
  color: string;
  startTime: number;
  duration: number;
}

const TRACK_COLORS = [
  "#4ade80", // green
  "#fb923c", // orange
  "#a855f7", // purple
  "#3b82f6", // blue
  "#ef4444", // red
  "#06b6d4", // cyan
];

export default function Home() {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const handleFileUpload = async (file: File) => {
    try {
      const audioContext = initAudioContext();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const newTrack: AudioTrack = {
        id: Date.now().toString(),
        name: file.name,
        audioBuffer,
        color: TRACK_COLORS[tracks.length % TRACK_COLORS.length],
        startTime: 0,
        duration: audioBuffer.duration,
      };
      
      setTracks(prev => [...prev, newTrack]);
    } catch (error) {
      console.error("Error processing audio file:", error);
      alert("Error processing audio file. Please make sure it's a valid audio format.");
    }
  };

  const handleTrackClick = (index: number) => {
    setSelectedTrackIndex(selectedTrackIndex === index ? null : index);
  };

  const removeTrack = (trackId: string) => {
    setTracks(prev => prev.filter(track => track.id !== trackId));
    setSelectedTrackIndex(null);
  };

  const updateTrackStartTime = (trackId: string, newStartTime: number) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId 
        ? { ...track, startTime: Math.max(0, newStartTime) }
        : track
    ));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Simple DAW</h1>
        
        <AudioUploader onFileUpload={handleFileUpload} />
        
        <TrackView 
          tracks={tracks}
          selectedTrackIndex={selectedTrackIndex}
          onTrackClick={handleTrackClick}
          onRemoveTrack={removeTrack}
          onUpdateTrackStartTime={updateTrackStartTime}
        />
      </div>
    </div>
  );
}
