"use client";

import { useState, useEffect } from "react";
import { X, File, Play, Pause, Download, Trash2 } from "lucide-react";

interface AudioFile {
  id: string;
  name: string;
  duration?: number;
  type: 'loop' | 'generated' | 'imported';
  createdAt?: Date;
  url?: string;
  file_path?: string;
  tags?: string;
  bpm?: number | null;
  key?: string | null;
}

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToTimeline: (audioFile: AudioFile) => void;
}

export function WorkspaceModal({ isOpen, onClose, onAddToTimeline }: WorkspaceModalProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'loop' | 'generated' | 'imported'>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [addingToTimeline, setAddingToTimeline] = useState<string | null>(null);
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch loops from API
  useEffect(() => {
    if (!isOpen) return;

    const fetchAudioFiles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/loops');
        const data = await response.json();

        if (data.success && data.loops) {
          // Convert loops data to AudioFile format
          const loopFiles: AudioFile[] = data.loops.map((loop: any) => ({
            id: loop.id,
            name: loop.name,
            type: 'loop' as const,
            file_path: loop.file_path,
            tags: loop.tags,
            bpm: loop.bpm,
            key: loop.key,
            // Estimate duration based on file size or use default
            duration: Math.random() * 60 + 30, // TODO: Get real duration from file metadata
            createdAt: new Date() // TODO: Add created_at field to loops table
          }));

          setAudioFiles(loopFiles);
        } else {
          throw new Error(data.error || 'Failed to fetch audio files');
        }
      } catch (err) {
        console.error('Failed to fetch audio files:', err);
        setError(err instanceof Error ? err.message : 'Failed to load audio files');
        setAudioFiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAudioFiles();
  }, [isOpen]);

  const filteredFiles = activeTab === 'all'
    ? audioFiles
    : audioFiles.filter(file => file.type === activeTab);

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
          {(['all', 'loop', 'generated', 'imported'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-white border-b-2 border-slate-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'loop' ? 'Loops' : tab} {tab !== 'all' && `(${audioFiles.filter(f => f.type === tab).length})`}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 mb-4"></div>
              <p>Loading audio files...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <File className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-red-400">Error loading files</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <File className="w-12 h-12 mb-4 opacity-50" />
              <p>No audio files found</p>
              <p className="text-sm mt-1">Upload loops to get started</p>
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
                        file.type === 'loop' ? 'bg-purple-400' :
                        file.type === 'generated' ? 'bg-green-400' :
                        'bg-orange-400'
                      }`} />

                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{file.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                          {file.duration && <span>{formatDuration(file.duration)}</span>}
                          {file.duration && <span>•</span>}
                          <span className="capitalize">{file.type}</span>
                          {file.bpm && (
                            <>
                              <span>•</span>
                              <span>{file.bpm} BPM</span>
                            </>
                          )}
                          {file.key && (
                            <>
                              <span>•</span>
                              <span>Key: {file.key}</span>
                            </>
                          )}
                          {file.tags && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[200px]" title={file.tags}>
                                {file.tags.split(',').slice(0, 3).join(', ')}
                                {file.tags.split(',').length > 3 && '...'}
                              </span>
                            </>
                          )}
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
                        onClick={async () => {
                          setAddingToTimeline(file.id);
                          try {
                            await onAddToTimeline(file);
                          } finally {
                            setAddingToTimeline(null);
                          }
                        }}
                        disabled={addingToTimeline === file.id}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5 ${
                          addingToTimeline === file.id
                            ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                        }`}
                      >
                        {addingToTimeline === file.id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-slate-300"></div>
                            Adding...
                          </>
                        ) : (
                          'Add to Timeline'
                        )}
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
                <div className="w-3 h-3 rounded-full bg-purple-400" />
                <span>Loops</span>
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