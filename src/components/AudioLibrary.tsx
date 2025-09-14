"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Search, Filter, Play, Pause, Download } from 'lucide-react';

interface AudioFile {
  name: string;
  path: string;
  duration?: number;
  waveform?: number[];
}

interface AudioLibraryProps {
  onDragStart?: (audioFile: AudioFile) => void;
  onAddToTrack?: (audioFile: AudioFile) => void;
}

export function AudioLibrary({ onDragStart, onAddToTrack }: AudioLibraryProps) {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [playingFile, setPlayingFile] = useState<string | null>(null);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio file categories based on filename patterns
  const categories = [
    { id: 'all', name: 'All Files', count: 0 },
    { id: 'drum', name: 'Drums', count: 0 },
    { id: 'guitar', name: 'Guitar', count: 0 },
    { id: 'piano', name: 'Piano/Keys', count: 0 },
    { id: 'bass', name: 'Bass', count: 0 },
    { id: 'loop', name: 'Loops', count: 0 },
    { id: 'jazz', name: 'Jazz', count: 0 },
    { id: 'lofi', name: 'Lo-Fi', count: 0 },
  ];

  // Predefined audio files from the loops directory
  const predefinedFiles = [
    'acoustic_jazz_loop_wav_548171.wav',
    'bgm_blues_guitar_loop_721148.wav',
    'bossa_guitar2_wav_74194.wav',
    'bossa_guitar3_wav_74196.wav',
    'drumloop_classic_breakbeat_8_swinging_ride_239564.wav',
    'drum_beat_loop_1_500284.wav',
    'drum_beat_loop_2_517674.wav',
    'jazzy_piano_loop_610745.wav',
    'jazz_guitar_loop_wav_485389.wav',
    'lofi_drum_loop_70_bpm_wav_629140.wav',
    'lofi_melody_loop_gmaj_90_bpm_wav_629162.wav',
    'lounging_smooth_keys_wav_681097.wav',
    'rhodes_lofi_chords_89bpm_neo_soul_trip_hop_psychedelia_acid_jazz_717546.wav',
    'smooth_electric_piano_loop_123bpm_663949.wav',
    'swing_120_bpm_mp3_640922.wav',
    'bass_walk_down_fill_wav_799359.wav',
    'double_bass_walking_613387.wav',
  ];

  useEffect(() => {
    // Initialize audio files
    const files: AudioFile[] = predefinedFiles.map(filename => ({
      name: filename.replace(/\.(wav|mp3|m4a)$/, '').replace(/_/g, ' '),
      path: `/htn-2025/tracks/loops/${filename}`,
    }));
    
    setAudioFiles(files);
    setLoadingFiles(false);
  }, []);

  const categorizeFile = (filename: string): string[] => {
    const name = filename.toLowerCase();
    const categories: string[] = [];
    
    if (name.includes('drum') || name.includes('beat')) categories.push('drum');
    if (name.includes('guitar')) categories.push('guitar');
    if (name.includes('piano') || name.includes('keys') || name.includes('rhodes')) categories.push('piano');
    if (name.includes('bass')) categories.push('bass');
    if (name.includes('loop')) categories.push('loop');
    if (name.includes('jazz')) categories.push('jazz');
    if (name.includes('lofi')) categories.push('lofi');
    
    return categories;
  };

  const filteredFiles = audioFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      categorizeFile(file.name).includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handlePlayPause = (filePath: string) => {
    if (playingFile === filePath) {
      audioRef.current?.pause();
      setPlayingFile(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = filePath;
        audioRef.current.play();
        setPlayingFile(filePath);
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, file: AudioFile) => {
    e.dataTransfer.setData('application/json', JSON.stringify(file));
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart?.(file);
  };

  // Generate a simple waveform visualization
  const generateWaveform = (filename: string): number[] => {
    // Create a deterministic waveform based on filename
    const hash = filename.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const points = [];
    for (let i = 0; i < 40; i++) {
      const value = Math.sin((hash + i) * 0.5) * Math.cos(i * 0.3) * 0.8 + 0.2;
      points.push(Math.abs(value));
    }
    return points;
  };

  return (
    <div className="bg-gray-900 border-r border-gray-700 w-80 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Music className="w-5 h-5 text-purple-400" />
          <h2 className="text-white font-semibold">Audio Library</h2>
        </div>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search audio files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                selectedCategory === category.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-2">
        {loadingFiles ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-400">Loading audio files...</div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFiles.map((file, index) => {
              const waveform = generateWaveform(file.name);
              const isPlaying = playingFile === file.path;
              
              return (
                <div
                  key={file.path}
                  draggable
                  onDragStart={(e) => handleDragStart(e, file)}
                  className="bg-gray-800 rounded-lg p-3 cursor-grab hover:bg-gray-750 transition-colors group"
                >
                  {/* File Info */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white text-sm font-medium truncate">
                        {file.name}
                      </h3>
                      <p className="text-gray-400 text-xs">
                        {categorizeFile(file.name).join(', ') || 'Audio'}
                      </p>
                    </div>
                    <button
                      onClick={() => handlePlayPause(file.path)}
                      className="p-1 rounded-md bg-gray-700 hover:bg-purple-600 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-3 h-3 text-white" />
                      ) : (
                        <Play className="w-3 h-3 text-white" />
                      )}
                    </button>
                  </div>

                  {/* Waveform Visualization */}
                  <div className="h-8 flex items-end gap-px mb-2">
                    {waveform.map((height, i) => (
                      <div
                        key={i}
                        className={`bg-gradient-to-t transition-colors ${
                          isPlaying 
                            ? 'from-purple-600 to-purple-400' 
                            : 'from-gray-600 to-gray-500'
                        }`}
                        style={{ 
                          height: `${height * 100}%`,
                          width: '2px',
                          minHeight: '2px'
                        }}
                      />
                    ))}
                  </div>

                  {/* Drag Hint */}
                  <div className="text-gray-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    Drag to add to track
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onEnded={() => setPlayingFile(null)}
        onError={() => setPlayingFile(null)}
      />
    </div>
  );
}

export default AudioLibrary;