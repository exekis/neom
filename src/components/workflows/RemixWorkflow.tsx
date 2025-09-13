"use client";

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Send, Shuffle, Music, Headphones } from 'lucide-react';

interface RemixWorkflowProps {
  onBack: () => void;
}

export function RemixWorkflow({ onBack }: RemixWorkflowProps) {
  const [message, setMessage] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!uploadedFile || !message.trim()) return;

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('prompt', message);

      const response = await fetch('/api/remix', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      console.log('Remix result:', result);
    } catch (error) {
      console.error('Error processing remix:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to workflows
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Title and Description */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Shuffle className="w-16 h-16 mx-auto mb-4 text-orange-500" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold mb-4"
            >
              Remix & Transform
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-lg mb-8"
            >
              Transform existing tracks with AI-powered remixing
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Music className="w-5 h-5" />
                Upload Original
              </h2>

              <div className="space-y-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div
                  onClick={handleUploadClick}
                  className="border-2 border-dashed border-slate-600 hover:border-slate-500
                           bg-slate-800/30 rounded-2xl p-8 cursor-pointer transition-all
                           hover:bg-slate-800/50 text-center"
                >
                  {uploadedFile ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center
                                    justify-center mx-auto">
                        <Headphones className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{uploadedFile.name}</p>
                        <p className="text-slate-400 text-sm">
                          {(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                      <p className="text-green-500 text-sm">Ready to remix!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center
                                    justify-center mx-auto">
                        <Upload className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="font-semibold text-white mb-2">Upload Your Track</p>
                        <p className="text-slate-400 text-sm">
                          Drop an audio file here or click to browse
                        </p>
                        <p className="text-slate-500 text-xs mt-2">
                          Supports MP3, WAV, FLAC, and more
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {uploadedFile && (
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <h3 className="font-semibold text-sm mb-2">AI will analyze:</h3>
                    <ul className="text-sm text-slate-400 space-y-1">
                      <li>• Separate stems (vocals, drums, bass, instruments)</li>
                      <li>• Identify tempo and key signature</li>
                      <li>• Extract musical elements</li>
                      <li>• Create remix possibilities</li>
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Remix Instructions Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6"
            >
              <h2 className="text-xl font-semibold mb-4">Remix Instructions</h2>

              <div className="space-y-4">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe how you want to remix this track... (e.g., 'Make it more electronic with heavy bass and faster tempo' or 'Create a chill lo-fi version')"
                  className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3
                           text-white placeholder-slate-400 resize-none focus:ring-2 focus:ring-orange-500
                           focus:border-orange-500 transition-colors"
                />

                <div className="bg-slate-800/30 rounded-xl p-4">
                  <h3 className="font-semibold text-sm mb-2 text-orange-400">Remix Ideas:</h3>
                  <div className="grid grid-cols-1 gap-2 text-sm text-slate-300">
                    <button
                      onClick={() => setMessage("Transform into a high-energy dance remix with heavy bass and electronic drops")}
                      className="text-left p-2 rounded hover:bg-slate-700/50 transition-colors"
                    >
                      • Dance/EDM remix with drops
                    </button>
                    <button
                      onClick={() => setMessage("Create a chill lo-fi version with vinyl texture and slower tempo")}
                      className="text-left p-2 rounded hover:bg-slate-700/50 transition-colors"
                    >
                      • Lo-fi chill version
                    </button>
                    <button
                      onClick={() => setMessage("Make an acoustic version focusing on organic instruments")}
                      className="text-left p-2 rounded hover:bg-slate-700/50 transition-colors"
                    >
                      • Acoustic arrangement
                    </button>
                    <button
                      onClick={() => setMessage("Create a trap remix with 808 drums and modern hip-hop elements")}
                      className="text-left p-2 rounded hover:bg-slate-700/50 transition-colors"
                    >
                      • Trap/Hip-hop style
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isProcessing || !uploadedFile || !message.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700
                           py-3 rounded-xl font-semibold transition-colors disabled:opacity-50
                           disabled:cursor-not-allowed"
                >
                  <Send className={`w-4 h-4 ${isProcessing ? 'animate-pulse' : ''}`} />
                  {isProcessing ? 'Processing Remix...' : 'Start Remix'}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}