"use client";

import { useState } from "react";
import { X, File, Play, Pause, Download, Trash2 } from "lucide-react";

interface AudioFile {
  id: string;
  name: string;
  duration: number;
  type: 'original' | 'generated' | 'imported';
  createdAt: Date;
  url?: string;
}

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToTimeline: (audioFile: AudioFile) => void;
}

export function WorkspaceModal({ isOpen, onClose, onAddToTimeline }: WorkspaceModalProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'original' | 'generated' | 'imported'>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Mock data for now
  const mockAudioFiles: AudioFile[] = [
    {
      id: '1',
      name: 'intro_jazz.mp3',
      duration: 245.5,
      type: 'imported',
      createdAt: new Date('2024-01-15T10:30:00Z'),
      url: '/audio/intro_jazz.mp3'
    },
    {
      id: '2',
      name: 'Generated Beat 1',
      duration: 180.2,
      type: 'generated',
      createdAt: new Date('2024-01-15T14:22:00Z')
    },
    {
      id: '3',
      name: 'Vocal Recording',
      duration: 320.8,
      type: 'original',
      createdAt: new Date('2024-01-15T09:15:00Z')
    }
  ];

  const filteredFiles = activeTab === 'all'
    ? mockAudioFiles
    : mockAudioFiles.filter(file => file.type === activeTab);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePlayPause = (fileId: string) => {
    setPlayingId(playingId === fileId ? null : fileId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Audio Workspace</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex border-b border-slate-700">
          {(['all', 'original', 'generated', 'imported'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-white border-b-2 border-slate-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab} {tab !== 'all' && `(${mockAudioFiles.filter(f => f.type === tab).length})`}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <File className="w-12 h-12 mb-4 opacity-50" />
              <p>No audio files found</p>
              <p className="text-sm mt-1">Import or generate audio to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 hover:bg-slate-800/70 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`w-3 h-3 rounded-full ${
                        file.type === 'original' ? 'bg-blue-400' :
                        file.type === 'generated' ? 'bg-green-400' :
                        'bg-orange-400'
                      }`} />

                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{file.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                          <span>{formatDuration(file.duration)}</span>
                          <span>•</span>
                          <span className="capitalize">{file.type}</span>
                          <span>•</span>
                          <span>{formatDate(file.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePlayPause(file.id)}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                        title={playingId === file.id ? 'Pause' : 'Play'}
                      >
                        {playingId === file.id ?
                          <Pause className="w-4 h-4 text-slate-300" /> :
                          <Play className="w-4 h-4 text-slate-300" />
                        }
                      </button>

                      <button
                        onClick={() => onAddToTimeline(file)}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm rounded-lg transition-colors"
                      >
                        Add to Timeline
                      </button>

                      <button
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4 text-slate-300" />
                      </button>

                      <button
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-700">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>{filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''} shown</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <span>Original</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span>Generated</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-400" />
                <span>Imported</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}