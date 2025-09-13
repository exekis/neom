"use client";

import { useState } from "react";
import {
  Music,
  Folder,
  Palette,
  Search,
  ChevronDown,
  ChevronRight,
  Sparkles
} from "lucide-react";

const AI_GENRES = [
  "Rock", "Pop", "Hip Hop", "Electronic", "Jazz", "Classical", "Blues", "Country",
  "R&B", "Reggae", "Punk", "Metal", "Folk", "Indie", "Ambient", "Techno",
  "House", "Dubstep", "Trap", "Lo-Fi", "Synthwave", "Disco", "Funk", "Soul",
  "Gospel", "World", "Latin", "Afrobeat", "K-Pop", "J-Rock", "Bossa Nova",
  "Tango", "Flamenco", "Celtic", "Nordic", "Industrial", "Progressive"
];

interface DAWSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DAWSidebar({ isOpen, onClose }: DAWSidebarProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'spotify' | 'projects'>('ai');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Pop', 'Electronic']);
  const [genreSearch, setGenreSearch] = useState('');
  const [isGenreExpanded, setIsGenreExpanded] = useState(true);

  const filteredGenres = AI_GENRES.filter(genre =>
    genre.toLowerCase().includes(genreSearch.toLowerCase())
  );

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-80 bg-slate-900 border-l border-slate-700 z-50 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">NEOM Assistant</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              ×
            </button>
          </div>

          <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
                activeTab === 'ai'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              AI Config
            </button>
            <button
              onClick={() => setActiveTab('spotify')}
              className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
                activeTab === 'spotify'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Spotify
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
                activeTab === 'projects'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Projects
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'ai' && (
            <div className="p-4 space-y-6">
              <div>
                <button
                  onClick={() => setIsGenreExpanded(!isGenreExpanded)}
                  className="flex items-center gap-2 w-full text-left text-white font-medium mb-3 hover:text-purple-400 transition-colors"
                >
                  {isGenreExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <Palette className="w-4 h-4" />
                  AI Music Genres ({selectedGenres.length} selected)
                </button>

                {isGenreExpanded && (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search genres..."
                        value={genreSearch}
                        onChange={(e) => setGenreSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {filteredGenres.map(genre => (
                        <label key={genre} className="flex items-center gap-2 cursor-pointer hover:bg-slate-800/50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={selectedGenres.includes(genre)}
                            onChange={() => toggleGenre(genre)}
                            className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm text-slate-200">{genre}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-white font-medium">
                  <Sparkles className="w-4 h-4" />
                  AI Settings
                </h3>
                <div className="space-y-2">
                  <label className="block">
                    <span className="text-sm text-slate-300">Creativity Level</span>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      defaultValue="7"
                      className="w-full mt-1 accent-purple-500"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-slate-300">BPM Preference</span>
                    <select className="w-full mt-1 p-2 bg-slate-800 border border-slate-600 rounded text-white">
                      <option>Auto-detect</option>
                      <option>60-80 BPM (Slow)</option>
                      <option>80-120 BPM (Medium)</option>
                      <option>120-160 BPM (Fast)</option>
                      <option>160+ BPM (Very Fast)</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'spotify' && (
            <div className="p-4 space-y-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto">
                  <Music className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-2">Connect to Spotify</h3>
                  <p className="text-sm text-slate-400 mb-4">
                    Import tracks, playlists, and get AI recommendations based on your listening history
                  </p>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors">
                    Connect Spotify Account
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-white font-medium mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button className="w-full text-left p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors">
                    Import from Playlist
                  </button>
                  <button className="w-full text-left p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors">
                    AI Song Analysis
                  </button>
                  <button className="w-full text-left p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors">
                    Find Similar Tracks
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="p-4 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-white font-medium">
                  <Folder className="w-4 h-4" />
                  My Projects
                </h3>
                <button className="text-purple-400 hover:text-purple-300 text-sm">
                  + New Project
                </button>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors border-l-4 border-purple-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white text-sm font-medium">Current Project</h4>
                      <p className="text-slate-400 text-xs">Modified 2 minutes ago</p>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                </div>

                <div className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white text-sm font-medium">Summer Vibes Mix</h4>
                      <p className="text-slate-400 text-xs">Modified 3 hours ago</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white text-sm font-medium">Podcast Intro</h4>
                      <p className="text-slate-400 text-xs">Modified yesterday</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}