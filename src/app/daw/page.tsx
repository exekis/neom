"use client";

export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { AudioTrack } from "../../types/AudioTrack";
import { TimelineCursor } from "../../components/TimelineCursor";
import { EnhancedTrackView } from "../../components/EnhancedTrackView";
import { DAWHeader } from "../../components/DAWHeader";
import { DAWSidebar } from "../../components/DAWSidebar";
import { ChatSidebar } from "../../components/ChatSidebar";
import { HotkeysModal } from "../../components/HotkeysModal";
import { WorkspaceModal } from "../../components/WorkspaceModal";
import { AudioEditingModal } from "../../components/AudioEditingModal";
import { ProjectModal } from "../../components/ProjectModal";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import { useProjectManager } from "../../hooks/useProjectManager";
import { useAudioExporter } from "../../hooks/useAudioExporter";

const TRACK_COLORS = [
  "#8b5cf6", // purple
  "#10b981", // emerald
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#ef4444", // red
  "#06b6d4", // cyan
];

interface TrackState {
  id: string;
  isMuted: boolean;
  isSolo: boolean;
  volume: number;
}

export default function DAWPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [projectName, setProjectName] = useState("Untitled Project");
  const [trackStates, setTrackStates] = useState<{ [trackId: string]: TrackState }>({});
  const [isRecording, setIsRecording] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isMetronomeEnabled, setIsMetronomeEnabled] = useState(false);
  const [masterVolume, setMasterVolume] = useState(80);
  const [undoStack] = useState<string[]>([]);
  const [redoStack] = useState<string[]>([]);
  const [showHotkeys, setShowHotkeys] = useState(false);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [showAudioEditor, setShowAudioEditor] = useState(false);
  const [editingTrack, setEditingTrack] = useState<AudioTrack | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const {
    isPlaying,
    currentTime,
    clickPosition,
    lastPlayPosition,
    play,
    pause,
    stop,
    seek,
    playFromClick,
    playFromLast,
    setClickPos
  } = useAudioPlayer({
    audioContext: audioContextRef.current
  });

  // Initialize project manager
  const projectManager = useProjectManager({
    onProjectLoad: (projectData) => {
      setTracks(projectData.tracks);
      setTrackStates(projectData.trackStates);
      setMasterVolume(projectData.masterVolume);
      setProjectName(projectData.name);
    }
  });

  // Initialize audio exporter
  const audioExporter = useAudioExporter();

  // Define initAudioContext first to avoid lexical declaration errors
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
    }
    return audioContextRef.current;
  }, []);

  const handleUndo = useCallback(() => {
    if (undoStack.length > 0) {
      console.log('Undo action');
    }
  }, [undoStack.length]);

  const handleRedo = useCallback(() => {
    if (redoStack.length > 0) {
      console.log('Redo action');
    }
  }, [redoStack.length]);

  const createEmptyAudioBuffer = useCallback((): AudioBuffer => {
    const audioContext = initAudioContext();
    const sampleRate = audioContext.sampleRate;
    const duration = 30;
    const buffer = audioContext.createBuffer(2, sampleRate * duration, sampleRate);
    return buffer;
  }, [initAudioContext]);

  const createEmptyAudioBufferWithDuration = useCallback((duration: number): AudioBuffer => {
    const audioContext = initAudioContext();
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(2, sampleRate * duration, sampleRate);
    return buffer;
  }, [initAudioContext]);

  const initializeTrackState = useCallback((trackId: string) => {
    setTrackStates(prev => ({
      ...prev,
      [trackId]: {
        id: trackId,
        isMuted: false,
        isSolo: false,
        volume: 100
      }
    }));
  }, []);

  const addNewTrack = useCallback(() => {
    const newTrack: AudioTrack = {
      id: Date.now().toString(),
      name: `Track ${tracks.length + 1}`,
      audioBuffer: createEmptyAudioBuffer(),
      color: TRACK_COLORS[tracks.length % TRACK_COLORS.length],
      startTime: 0,
      duration: 30,
    };
    setTracks(prev => [...prev, newTrack]);
    initializeTrackState(newTrack.id);
  }, [tracks.length, createEmptyAudioBuffer, initializeTrackState]);

  // Keyboard hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle hotkeys if not typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Check for Ctrl/Cmd combinations first
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo(); // Ctrl+Shift+Z for redo
            } else {
              handleUndo(); // Ctrl+Z for undo
            }
            break;
          case 'y':
            e.preventDefault();
            handleRedo(); // Ctrl+Y for redo
            break;
        }
        return;
      }

      switch (e.key) {
        case ' ': // Space bar - play from click position or pause
          e.preventDefault();
          if (tracks.length > 0) {
            if (isPlaying) {
              pause();
            } else {
              playFromClick(tracks);
            }
          }
          break;
        case 'Enter': // Enter - play from last play position or pause
          e.preventDefault();
          if (tracks.length > 0) {
            if (isPlaying) {
              pause();
            } else {
              playFromLast(tracks);
            }
          }
          break;
        case 'r': // R - record toggle
        case 'R':
          e.preventDefault();
          setIsRecording(!isRecording);
          break;
        case 'l': // L - loop toggle
        case 'L':
          e.preventDefault();
          setIsLooping(!isLooping);
          break;
        case 'Escape': // Escape - stop
          e.preventDefault();
          stop();
          break;
        case 'q': // Q - add new track
        case 'Q':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            addNewTrack();
          }
          break;
      }
    };

    const handleVisibilityChange = () => {
      // Stop audio when tab/window is not visible
      if (document.hidden && isPlaying) {
        pause();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [tracks, isPlaying, play, pause, stop, playFromClick, playFromLast, isRecording, isLooping, handleUndo, handleRedo, addNewTrack]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      window.location.href = '/';
      return;
    }

    // Load audio from sessionStorage if coming from workflow or create mock tracks
    const loadSessionAudio = async () => {
      const audioUrl = sessionStorage.getItem('daw-audio-url');
      const audioName = sessionStorage.getItem('daw-audio-name');

      if (audioUrl && audioName) {
        try {
          const audioContext = initAudioContext();
          const response = await fetch(audioUrl);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          const newTrack: AudioTrack = {
            id: Date.now().toString(),
            name: audioName,
            audioBuffer,
            color: TRACK_COLORS[0],
            startTime: 0,
            duration: audioBuffer.duration,
          };

          setTracks([newTrack]);
          initializeTrackState(newTrack.id);

          // Show success message
          console.log(`Successfully loaded: ${audioName}`);

          // Clear sessionStorage after loading
          sessionStorage.removeItem('daw-audio-url');
          sessionStorage.removeItem('daw-audio-name');
        } catch (error) {
          console.error('Error loading audio from workflow:', error);
          // Load mock tracks on error
          loadMockTracks();
        }
      } else {
        // Load mock tracks for demo
        loadMockTracks();
      }
    };

    const loadMockTracks = () => {
      const audioContext = initAudioContext();
      const mockTracks: AudioTrack[] = [
        {
          id: 'mock-1',
          name: 'Intro Jazz',
          audioBuffer: createEmptyAudioBufferWithDuration(245.5),
          color: TRACK_COLORS[0],
          startTime: 0,
          duration: 245.5,
        },
        {
          id: 'mock-2',
          name: 'Drum Beat',
          audioBuffer: createEmptyAudioBufferWithDuration(180),
          color: TRACK_COLORS[1],
          startTime: 10,
          duration: 180,
        }
      ];

      setTracks(mockTracks);
      mockTracks.forEach(track => initializeTrackState(track.id));
    };

    if (isLoaded && isSignedIn) {
      loadSessionAudio();
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

  const handleTrackClick = (index: number) => {
    setSelectedTrackIndex(selectedTrackIndex === index ? null : index);
  };

  const removeTrack = (trackId: string) => {
    setTracks(prev => prev.filter(track => track.id !== trackId));
    setTrackStates(prev => {
      const newStates = { ...prev };
      delete newStates[trackId];
      return newStates;
    });
    setSelectedTrackIndex(null);
  };


  const handleTrackMuteToggle = (trackId: string) => {
    setTrackStates(prev => ({
      ...prev,
      [trackId]: {
        ...prev[trackId],
        isMuted: !prev[trackId]?.isMuted
      }
    }));
  };

  const handleTrackSoloToggle = (trackId: string) => {
    setTrackStates(prev => ({
      ...prev,
      [trackId]: {
        ...prev[trackId],
        isSolo: !prev[trackId]?.isSolo
      }
    }));
  };

  const handleTrackVolumeChange = (trackId: string, volume: number) => {
    setTrackStates(prev => ({
      ...prev,
      [trackId]: {
        ...prev[trackId],
        volume
      }
    }));
  };

  const handleTrackNameChange = (trackId: string, newName: string) => {
    setTracks(prev => prev.map(track =>
      track.id === trackId ? { ...track, name: newName } : track
    ));
  };

  const updateTrackStartTime = (trackId: string, newStartTime: number) => {
    setTracks(prev => prev.map(track =>
      track.id === trackId
        ? { ...track, startTime: Math.max(0, newStartTime) }
        : track
    ));
  };

  const handleAddTrackFromAI = (args: { name: string; audioBuffer: AudioBuffer; audioUrl: string }) => {
    const newTrack: AudioTrack = {
      id: Date.now().toString(),
      name: args.name,
      audioBuffer: args.audioBuffer,
      color: TRACK_COLORS[tracks.length % TRACK_COLORS.length],
      startTime: 0,
      duration: args.audioBuffer.duration,
    };
    setTracks(prev => [...prev, newTrack]);
    initializeTrackState(newTrack.id);
  };

  const handleOpenTrackEditor = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (track) {
      setEditingTrack(track);
      setShowAudioEditor(true);
    }
  };

  const handleUpdateEditedTrack = (updatedTrack: AudioTrack) => {
    setTracks(prev => prev.map(track =>
      track.id === updatedTrack.id ? updatedTrack : track
    ));
  };

  const handleSaveProject = async (projectName: string) => {
    const audioContext = initAudioContext();
    await projectManager.saveProject(
      projectName,
      tracks,
      trackStates,
      masterVolume,
      120,
      audioContext
    );
  };

  const handleLoadProject = async (projectId: string) => {
    const audioContext = initAudioContext();
    await projectManager.loadProject(projectId, audioContext);
  };

  const handleDeleteProject = async (projectId: string) => {
    await projectManager.deleteProject(projectId);
  };

  const handleNewProject = () => {
    setTracks([]);
    setTrackStates({});
    setMasterVolume(80);
    setProjectName("Untitled Project");
    setSelectedTrackIndex(null);
    projectManager.createNewProject();
  };

  const handleOpenProjectModal = async () => {
    setIsLoadingProjects(true);
    setShowProjectModal(true);
    try {
      await projectManager.loadProjectsList();
    } catch (error) {
      console.error('Failed to load projects list:', error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleExportWAV = async () => {
    if (tracks.length === 0) {
      alert('No tracks to export. Please add some audio tracks first.');
      return;
    }

    try {
      const audioContext = initAudioContext();
      const filename = `${projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.wav`;

      await audioExporter.downloadWAV(
        tracks,
        trackStates,
        masterVolume,
        audioContext,
        filename
      );
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export audio. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex">
      <div className="flex-1 flex flex-col">
        <DAWHeader
          projectName={projectName}
          onProjectNameChange={setProjectName}
          isPlaying={isPlaying}
          isRecording={isRecording}
          isLooping={isLooping}
          isMetronomeEnabled={isMetronomeEnabled}
          onPlay={() => tracks.length > 0 && play(tracks)}
          onPause={pause}
          onStop={stop}
          onRecord={() => setIsRecording(!isRecording)}
          onToggleLoop={() => setIsLooping(!isLooping)}
          onToggleMetronome={() => setIsMetronomeEnabled(!isMetronomeEnabled)}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
          masterVolume={masterVolume}
          onMasterVolumeChange={setMasterVolume}
          onOpenAssistant={() => setIsSidebarOpen(true)}
          onShowHotkeys={() => setShowHotkeys(true)}
          onShowWorkspace={() => setShowWorkspace(true)}
          onOpenProjectModal={handleOpenProjectModal}
          onExportWAV={handleExportWAV}
        />

        <main className="flex-1 p-4 overflow-hidden">
          <div className="max-w-full mx-auto space-y-4 h-full flex flex-col">

            <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/40 p-5">
              <TimelineCursor
                currentTime={currentTime}
                clickPosition={clickPosition}
                lastPlayPosition={lastPlayPosition}
                duration={Math.max(...tracks.map(track => track.startTime + track.duration), 120)}
                isPlaying={isPlaying}
                onSeek={seek}
                onSetClickPosition={setClickPos}
              />
            </div>

            <div className="flex-1 min-h-0 timeline-container overflow-y-auto bg-slate-900/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-4">
              <EnhancedTrackView
                tracks={tracks}
                selectedTrackIndex={selectedTrackIndex}
                trackStates={trackStates}
                onTrackClick={handleTrackClick}
                onRemoveTrack={removeTrack}
                onUpdateTrackStartTime={updateTrackStartTime}
                onTrackMuteToggle={handleTrackMuteToggle}
                onTrackSoloToggle={handleTrackSoloToggle}
                onTrackVolumeChange={handleTrackVolumeChange}
                onTrackNameChange={handleTrackNameChange}
                onTrackSettings={handleOpenTrackEditor}
                onTrackAIAgent={(trackId) => console.log('Track AI agent:', trackId)}
                currentTime={currentTime}
                isPlaying={isPlaying}
                onSeek={seek}
              />
            </div>
          </div>
        </main>
      </div>

      <DAWSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <ChatSidebar
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        tracks={tracks}
        onApplyEffect={(effect) => {
          console.log('Applying effect:', effect);
        }}
        onAddTrackFromAI={handleAddTrackFromAI}
      />

      <HotkeysModal
        isOpen={showHotkeys}
        onClose={() => setShowHotkeys(false)}
      />

      <WorkspaceModal
        isOpen={showWorkspace}
        onClose={() => setShowWorkspace(false)}
        onAddToTimeline={(audioFile) => {
          console.log('Adding audio file to timeline:', audioFile);
          setShowWorkspace(false);
        }}
      />

      <AudioEditingModal
        isOpen={showAudioEditor}
        onClose={() => {
          setShowAudioEditor(false);
          setEditingTrack(null);
        }}
        track={editingTrack}
        onUpdateTrack={handleUpdateEditedTrack}
      />

      <ProjectModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
        onDeleteProject={handleDeleteProject}
        onNewProject={handleNewProject}
        savedProjects={projectManager.savedProjects}
        currentProjectName={projectName}
        isLoading={isLoadingProjects}
      />
    </div>
  );
}