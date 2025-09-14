"use client";

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Send, Music } from 'lucide-react';
import { useAudioGeneration } from '@/hooks/useAudioGenerationHardcoded';
import GenerationProgress from '@/components/GenerationProgress';

interface LayersWorkflowProps {
  onBack: () => void;
  onApplyToDAW?: (args: { audioBuffer: AudioBuffer; audioUrl: string; name: string }) => void;
}

const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MODES = ['Major', 'Minor'];
const BARS = [8, 16, 32];

export function LayersWorkflow({ onBack, onApplyToDAW }: LayersWorkflowProps) {
  const [message, setMessage] = useState('');
  const [selectedKey, setSelectedKey] = useState('C');
  const [selectedMode, setSelectedMode] = useState('Major');
  const [bpm, setBpm] = useState('120');
  const [selectedBars, setSelectedBars] = useState(16);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isGenerating,
    progress,
    audioUrl,
    error,
    message: generationMessage,
    aiRouteRun,
    reset
  } = useAudioGeneration();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);

      // Upload to cloud storage using the loops API
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name.replace(/\.[^/.]+$/, "")); // Remove extension

        const response = await fetch('/api/loops', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();
        if (result.success) {
          console.log('File uploaded to cloud storage:', result);
        } else {
          console.error('Upload failed:', result.error);
        }
      } catch (error) {
        console.error('Upload error:', error);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    // Reset all audio states
    setAudioBuffer(null);
    reset();

    // For now, use the demo original as per integration notes
    const projectId = 'demo1';
    const originalPath = '/srv/neom/files/demo1/try1.wav';
    const textParts = [message.trim()];
    // Optionally include parameters into the text to guide the LLM
    if (selectedKey) textParts.push(`key ${selectedKey} ${selectedMode.toLowerCase()}`);
    if (bpm) textParts.push(`${bpm} bpm`);
    if (selectedBars) textParts.push(`${selectedBars} bars`);

    try {
      const data = await aiRouteRun({
        projectId,
        originalPath,
        text: textParts.filter(Boolean).join(', ')
      });

      // For hardcoded workflow, data is a string URL directly
      // No need to fetch manifest since we're using a local audio file
      console.log('Generated audio:', data);

      // Optionally warm up history endpoint
      try {
        await fetch(`${process.env.BACKEND_API_URL}/api/projects/${projectId}/ops?limit=10`);
      } catch {}
    } catch (e) {
      console.error(e);
    }
  };

  const loadAudioFromUrl = async (url: string) => {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioContext = new AudioContext();
      const buffer = await audioContext.decodeAudioData(arrayBuffer);
      setAudioBuffer(buffer);
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  // Load audio when generation completes
  React.useEffect(() => {
    if (audioUrl && !isGenerating) {
      // Reset audio buffer first to ensure we load fresh
      setAudioBuffer(null);

      // Load the new audio
      loadAudioFromUrl(audioUrl);
    }
  }, [audioUrl, isGenerating]);

  const handleSendToDAW = async () => {
    try {
      const tracksToSend = [];
      
      // Process uploaded file if available
      if (uploadedFile && audioBuffer) {
        const uploadedAudioUrl = URL.createObjectURL(uploadedFile);
        tracksToSend.push({
          name: uploadedFile.name.replace(/\.[^/.]+$/, ""),
          audioUrl: uploadedAudioUrl
        });
      }
      
      // Process generated audio if available
      if (audioUrl) {
        const name = `Generated ${selectedKey} ${selectedMode.toLowerCase()} loop`;
        tracksToSend.push({
          name: name,
          audioUrl: audioUrl
        });
      }
      
      if (tracksToSend.length === 0) {
        console.warn('No tracks available to send to DAW');
        return;
      }
      
      // Store multiple tracks in sessionStorage
      sessionStorage.setItem('daw-tracks', JSON.stringify(tracksToSend));
      
      // Clear any existing single track data
      sessionStorage.removeItem('daw-audio-url');
      sessionStorage.removeItem('daw-audio-name');
      
      // Navigate to DAW
      window.location.href = '/daw';
    } catch (error) {
      console.error('Error processing audio tracks for DAW:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
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
              <Music className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold mb-4"
            >
              Build with Layers
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-lg mb-8"
            >
              Create piano, then vocals, then drums - layer by layer
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chat Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6"
            >
              <h2 className="text-xl font-semibold mb-4">Describe Your Loop</h2>

              <div className="space-y-4">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell me what kind of loop you want to create..."
                  className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3
                           text-white placeholder-slate-400 resize-none focus:ring-2 focus:ring-blue-500
                           focus:border-blue-500 transition-colors"
                />

                <button
                  onClick={handleSubmit}
                  disabled={isGenerating || !message.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700
                           py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 cursor-pointer
                           disabled:cursor-not-allowed"
                >
                  <Send className={`w-4 h-4 ${isGenerating ? 'animate-pulse' : ''}`} />
                  {isGenerating ? 'Generating...' : 'Generate Loop'}
                </button>
              </div>
            </motion.div>

            {/* Parameters Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6"
            >
              <h2 className="text-xl font-semibold mb-4">Audio Parameters</h2>

              <div className="space-y-6">
                {/* Upload Section */}
                <div>
                  <label className="block text-sm font-medium mb-2">Upload Audio (Optional)</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={handleUploadClick}
                    className="w-full flex items-center justify-center gap-2 bg-slate-800 border-2
                             border-dashed border-slate-600 hover:border-slate-500 py-4 rounded-xl
                             transition-colors cursor-pointer"
                  >
                    <Upload className="w-5 h-5" />
                    {uploadedFile ? uploadedFile.name : 'Click to upload audio'}
                  </button>
                </div>

                {/* Key Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Key</label>
                  <select
                    value={selectedKey}
                    onChange={(e) => setSelectedKey(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3
                             text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {KEYS.map((key) => (
                      <option key={key} value={key}>{key}</option>
                    ))}
                  </select>
                </div>

                {/* Mode Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Mode</label>
                  <select
                    value={selectedMode}
                    onChange={(e) => setSelectedMode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3
                             text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {MODES.map((mode) => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                </div>

                {/* BPM Input */}
                <div>
                  <label className="block text-sm font-medium mb-2">BPM</label>
                  <input
                    type="number"
                    value={bpm}
                    onChange={(e) => setBpm(e.target.value)}
                    min="60"
                    max="200"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3
                             text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Bars Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Bars</label>
                  <div className="flex gap-2">
                    {BARS.map((bars) => (
                      <button
                        key={bars}
                        onClick={() => setSelectedBars(bars)}
                        className={`flex-1 py-3 rounded-xl font-semibold transition-colors cursor-pointer ${
                          selectedBars === bars
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {bars}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Results Section */}
          {(uploadedFile || audioUrl) && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6"
            >
              <h3 className="text-xl font-semibold mb-6 text-slate-200">Ready Tracks</h3>
              
              <div className="space-y-4">
                {uploadedFile && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl"
                  >
                    <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                      <Music className="w-6 h-6 text-slate-300" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-200">{uploadedFile.name.replace(/\.[^/.]+$/, "")}</p>
                      <p className="text-sm text-slate-400">Uploaded audio file</p>
                    </div>
                  </motion.div>
                )}
                
                {audioUrl && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl"
                  >
                    <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                      <Music className="w-6 h-6 text-slate-300" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-200">Generated {selectedKey} {selectedMode} Loop</p>
                      <p className="text-sm text-slate-400">AI-generated audio</p>
                    </div>
                    {audioUrl && (
                      <audio 
                        controls 
                        src={audioUrl}
                        className="h-8 max-w-48"
                        style={{ filter: 'invert(1) hue-rotate(180deg)' }}
                      />
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Single Send to DAW Button */}
          {(uploadedFile || audioUrl) && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-8 text-center"
            >
              <motion.button
                onClick={handleSendToDAW}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 8px 30px rgba(100, 116, 139, 0.3)"
                }}
                whileTap={{ scale: 0.98 }}
                className="px-12 py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-2xl
                         transition-all duration-300 cursor-pointer shadow-xl"
                animate={{
                  y: [0, -2, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {(() => {
                  const trackCount = (uploadedFile ? 1 : 0) + (audioUrl ? 1 : 0);
                  if (trackCount === 1) {
                    return uploadedFile ? "Open DAW with Uploaded Track" : "Open DAW with Generated Track";
                  } else {
                    return "Open DAW with Both Tracks";
                  }
                })()}
              </motion.button>
              
              <motion.p 
                className="text-sm text-slate-400 mt-3"
                animate={{
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {(() => {
                  const hasUploaded = !!uploadedFile;
                  const hasGenerated = !!audioUrl;
                  
                  if (hasUploaded && hasGenerated) {
                    return "Both uploaded and generated tracks will be loaded into the timeline";
                  } else if (hasUploaded) {
                    return "Your uploaded audio will be loaded into the timeline";
                  } else if (hasGenerated) {
                    return "Your generated loop will be loaded into the timeline";
                  }
                  return "Tracks ready for DAW";
                })()}
              </motion.p>
            </motion.div>
          )}

        </div>
      </div>

      {/* Generation Progress Overlay */}
      <GenerationProgress
        isGenerating={isGenerating}
        progress={progress}
        message={generationMessage}
      />
    </div>
  );
}