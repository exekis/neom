"use client";

import { useState, useRef, useEffect } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { AudioTrack } from "../../types/AudioTrack";
import { AudioUploader } from "../../components/AudioUploader";
import { TrackView } from "../../components/TrackView";
import { AudioControls } from "../../components/AudioControls";
import { ChatSidebar } from "../../components/ChatSidebar";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import { LogOut } from "lucide-react";

const TRACK_COLORS = [
  "#8b5cf6", // purple
  "#10b981", // emerald
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#ef4444", // red
  "#06b6d4", // cyan
];

export default function DAWPage() {
  const { isSignedIn, isLoaded, user } = useUser();
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { isPlaying, currentTime, play, pause, stop } = useAudioPlayer({
    audioContext: audioContextRef.current
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      window.location.href = '/';
    }
  }, [isSignedIn, isLoaded]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
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
      stop();
    } catch {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex">
      <div className="flex-1 flex flex-col">
        <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-transparent">
              NOEM Studio
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">
                Welcome, {user?.firstName || 'User'}
              </span>
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-emerald-600 text-white rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
              >
                {isChatOpen ? 'Hide AI' : 'Open AI Assistant'}
              </button>
              <SignOutButton>
                <button className="p-2 text-slate-600 hover:text-slate-800 transition-colors cursor-pointer">
                  <LogOut className="w-5 h-5" />
                </button>
              </SignOutButton>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <AudioUploader onFileUpload={handleFileUpload} />

            {tracks.length > 0 && (
              <AudioControls
                isPlaying={isPlaying}
                currentTime={currentTime}
                onPlay={() => tracks.length > 0 && play(tracks)}
                onPause={pause}
                onStop={stop}
              />
            )}

            <TrackView
              tracks={tracks}
              selectedTrackIndex={selectedTrackIndex}
              onTrackClick={handleTrackClick}
              onRemoveTrack={removeTrack}
              onUpdateTrackStartTime={updateTrackStartTime}
              currentTime={currentTime}
              isPlaying={isPlaying}
            />
          </div>
        </main>
      </div>

      <ChatSidebar isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}