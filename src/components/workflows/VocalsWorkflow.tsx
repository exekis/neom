"use client";

import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mic, Upload, Send, Square, Play, Pause } from 'lucide-react';
import useAudioGeneration from '@/hooks/useAudioGenerationHardcoded';
import { useAudioUpload } from '@/hooks/useAudioUpload';
import GenerationProgress from '@/components/GenerationProgress';
import WaveformModal from '@/components/WaveformModal';

interface VocalsWorkflowProps {
  onBack: () => void;
  onApplyToDAW?: (args: { audioBuffer: AudioBuffer; audioUrl: string; name: string }) => void;
}

export function VocalsWorkflow({ onBack, onApplyToDAW }: VocalsWorkflowProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [showWaveformModal, setShowWaveformModal] = useState(false);
  const [audioWaveform, setAudioWaveform] = useState<number[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    isGenerating,
    progress,
    audioUrl,
    error,
    message: generationMessage,
    generateAudio,
    reset
  } = useAudioGeneration();

  const {
    uploadAudio,
    reset: resetUpload
  } = useAudioUpload();

  // Handle recorded audio and upload it
  const handleRecordedAudio = useCallback(async (audioBlob: Blob) => {
    setRecordedAudio(audioBlob);
    
    // Generate waveform visualization
    generateWaveform(audioBlob);
    
    // Automatically upload the recorded audio
    const uploadedUrl = await uploadAudio(audioBlob, `vocal-recording-${Date.now()}.wav`);
    if (uploadedUrl) {
      console.log('Audio uploaded successfully:', uploadedUrl);
    }
  }, [uploadAudio]);

  const generateWaveform = useCallback(async (audioBlob: Blob) => {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const rawData = audioBuffer.getChannelData(0);
      const samples = 70; // Number of visual samples for mini waveform
      const blockSize = Math.floor(rawData.length / samples);
      const filteredData = [];
      
      for (let i = 0; i < samples; i++) {
        let blockStart = blockSize * i;
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[blockStart + j]);
        }
        filteredData.push(sum / blockSize);
      }
      
      // Normalize the data
      const max = Math.max(...filteredData);
      const normalizedData = filteredData.map(val => val / max);
      
      setAudioWaveform(normalizedData);
    } catch (error) {
      console.error('Error generating waveform:', error);
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      resetUpload(); // Clear any previous upload state
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        handleRecordedAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      intervalRef.current = setInterval(() => {
        setRecordingTime((prev: number) => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, [handleRecordedAudio, resetUpload]);

  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, []);

  const playRecording = useCallback(() => {
    if (recordedAudio && !isPlaying) {
      const audioUrl = URL.createObjectURL(recordedAudio);
      audioRef.current = new Audio(audioUrl);
      audioRef.current.play();
      setIsPlaying(true);

      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      audioRef.current.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
    }
  }, [recordedAudio, isPlaying]);

  const pauseRecording = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      
      // Automatically upload the file
      resetUpload();
      const uploadedUrl = await uploadAudio(file);
      if (uploadedUrl) {
        console.log('File uploaded successfully:', uploadedUrl);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSendToDAW = useCallback(async () => {
    try {
      const tracksToSend = [];
      
      // Process recorded audio if available
      if (recordedAudio) {
        const recordedAudioUrl = URL.createObjectURL(recordedAudio);
        tracksToSend.push({
          name: 'Recorded Vocal Track',
          audioUrl: recordedAudioUrl
        });
      }
      
      // Process generated audio if available
      if (audioUrl) {
        tracksToSend.push({
          name: 'Generated Vocal Track',
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
  }, [recordedAudio, audioUrl]);

  const handleSubmit = async () => {
    // Reset all audio states
    setAudioBuffer(null);
    setShowWaveformModal(false);
    reset();

    await generateAudio({
      type: 'vocals',
      prompt: message,
      parameters: {
        style: 'vocal'
      }
    });
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

  // Show modal when audio is loaded
  React.useEffect(() => {
    if (audioBuffer && audioUrl && !isGenerating) {
      setShowWaveformModal(true);
    }
  }, [audioBuffer, audioUrl, isGenerating]);

  const handleOpenInDAW = () => {
    // Check if we have both recorded audio and generated audio
    if (recordedAudio && audioUrl && audioBuffer) {
      // Send both tracks to DAW
      handleSendToDAW();
      setShowWaveformModal(false);
      return;
    }
    
    // If only generated audio exists
    if (audioUrl && audioBuffer) {
      const name = 'Generated vocal track';
      if (onApplyToDAW) {
        onApplyToDAW({ audioBuffer, audioUrl, name });
        setShowWaveformModal(false);
        return;
      }
      sessionStorage.setItem('daw-audio-url', audioUrl);
      sessionStorage.setItem('daw-audio-name', name);
    }
    
    // If only recorded audio exists
    if (recordedAudio && !audioUrl) {
      handleSendToDAW();
      setShowWaveformModal(false);
      return;
    }
    
    if (!onApplyToDAW) {
      window.location.href = '/daw';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
      animate={{
        backgroundPosition: ["0% 0%", "50% 50%", "0% 0%"],
      }}
      transition={{
        duration: 30,
        repeat: Infinity,
        ease: "linear"
      }}
      style={{
        backgroundSize: "200% 200%"
      }}
    >
      <motion.div 
        className="container mx-auto px-6 py-8"
        animate={{
          y: [0, -3, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Header */}
        <motion.div 
          className="flex items-center mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to workflows
          </motion.button>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {/* Title and Description */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="mb-8"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <motion.div
                className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center"
                whileHover={{ 
                  scale: 1.1,
                  boxShadow: "0 20px 40px rgba(34, 197, 94, 0.3)"
                }}
                transition={{ duration: 0.3 }}
              >
                <Mic className="w-10 h-10 text-white" />
              </motion.div>
            </motion.div>

            <motion.h1
              className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent"
              animate={{
                textShadow: [
                  "0 0 20px rgba(255, 255, 255, 0.1)",
                  "0 0 30px rgba(255, 255, 255, 0.2)",
                  "0 0 20px rgba(255, 255, 255, 0.1)"
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Capture Your Voice
            </motion.h1>

            <motion.p
              className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed"
              animate={{
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Record or upload vocals to create the foundation of your musical masterpiece
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recording Section - Center and Prominent */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="lg:col-span-1 lg:order-2"
            >
              <motion.div
                className="bg-gradient-to-br from-slate-900/90 to-slate-800/70 backdrop-blur-md rounded-3xl p-8 border border-slate-700/40 hover:border-slate-600/60 transition-all duration-700"
                animate={{
                  boxShadow: [
                    "0 8px 32px rgba(0, 0, 0, 0.1)",
                    "0 12px 48px rgba(100, 116, 139, 0.05)",
                    "0 8px 32px rgba(0, 0, 0, 0.1)"
                  ],
                  y: [0, -1, 0]
                }}
                transition={{
                  boxShadow: {
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  },
                  y: {
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                <motion.h2 
                  className="text-2xl font-semibold mb-8 text-center text-slate-300"
                  animate={{
                    opacity: [0.9, 1, 0.9]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  Voice Capture
                </motion.h2>

                <div className="space-y-8">
                  {/* Recording Controls - Centered */}
                  <div className="flex flex-col items-center space-y-6">
                    <div className="text-center">
                      {isRecording && (
                        <motion.div 
                          className="text-3xl font-mono text-slate-300 mb-4 tracking-wider"
                          animate={{
                            scale: [1, 1.05, 1],
                            opacity: [0.8, 1, 0.8]
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity
                          }}
                        >
                          {formatTime(recordingTime)}
                        </motion.div>
                      )}

                      <motion.button
                        onClick={isRecording ? stopRecording : startRecording}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        animate={isRecording ? {
                          boxShadow: [
                            "0 0 20px rgba(239, 68, 68, 0.5)",
                            "0 0 40px rgba(239, 68, 68, 0.8)",
                            "0 0 20px rgba(239, 68, 68, 0.5)"
                          ]
                        } : {
                          boxShadow: [
                            "0 0 20px rgba(34, 197, 94, 0.3)",
                            "0 0 30px rgba(34, 197, 94, 0.5)",
                            "0 0 20px rgba(34, 197, 94, 0.3)"
                          ]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className={`w-24 h-24 rounded-full flex items-center justify-center text-white
                                   transition-all duration-300 cursor-pointer shadow-xl relative overflow-hidden ${
                          isRecording
                            ? 'bg-gradient-to-br from-red-500 to-red-600'
                            : 'bg-gradient-to-br from-green-500 to-emerald-600'
                        }`}
                      >
                        {/* Animated background for recording */}
                        {isRecording && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-500"
                            animate={{
                              opacity: [0.3, 0.6, 0.3]
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity
                            }}
                          />
                        )}
                        
                        <motion.div
                          className="relative z-10"
                          animate={isRecording ? {
                            scale: [1, 0.9, 1]
                          } : {
                            scale: [1, 1.1, 1]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity
                          }}
                        >
                          {isRecording ? (
                            <Square className="w-10 h-10" />
                          ) : (
                            <Mic className="w-10 h-10" />
                          )}
                        </motion.div>
                      </motion.button>
                    </div>

                    <motion.p 
                      className="text-slate-400 text-center max-w-xs"
                      animate={{
                        opacity: [0.6, 1, 0.6]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      {isRecording ? 'Recording in progress... Click to stop' : 'Click the microphone to start recording your vocals'}
                    </motion.p>
                  </div>

                  {/* Playback Controls */}
                  {recordedAudio && (
                    <motion.div 
                      className="text-center p-6 bg-gradient-to-br from-slate-800/80 to-slate-700/60 rounded-2xl border border-slate-600/50"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.p 
                        className="text-sm text-slate-300 mb-4 font-medium"
                        animate={{
                          scale: [1, 1.02, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity
                        }}
                      >
                        ✓ Recording captured successfully
                      </motion.p>

                      {/* Mini Waveform Visualization */}
                      {audioWaveform.length > 0 && (
                        <motion.div 
                          className="mb-4 p-4 bg-slate-900/50 rounded-xl"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                        >
                          <p className="text-xs text-slate-400 mb-2">Audio Preview</p>
                          <div className="flex items-center justify-center gap-1 h-12">
                            {audioWaveform.map((amplitude: number, index: number) => (
                              <motion.div
                                key={index}
                                className="bg-gradient-to-t from-slate-600 to-slate-400 rounded-full"
                                style={{
                                  width: '3px',
                                  height: `${Math.max(2, amplitude * 100)}%`,
                                  minHeight: '2px'
                                }}
                                initial={{ height: 0 }}
                                animate={{ height: `${Math.max(2, amplitude * 100)}%` }}
                                transition={{ 
                                  duration: 0.8, 
                                  delay: index * 0.01,
                                  ease: "easeOut"
                                }}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}

                      <div className="flex gap-3 justify-center">
                        <motion.button
                          onClick={isPlaying ? pauseRecording : playRecording}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600
                                   py-3 px-6 rounded-xl font-semibold transition-all duration-300 cursor-pointer shadow-lg"
                        >
                          <motion.div
                            animate={isPlaying ? {
                              scale: [1, 0.8, 1]
                            } : {}}
                            transition={{
                              duration: 0.6,
                              repeat: isPlaying ? Infinity : 0
                            }}
                          >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </motion.div>
                          {isPlaying ? 'Pause Preview' : 'Play Preview'}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* Upload Section */}
                  <div className="text-center">
                    <motion.div 
                      className="mb-4 text-slate-500 text-sm font-medium"
                      animate={{
                        opacity: [0.5, 0.8, 0.5]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity
                      }}
                    >
                      OR UPLOAD A FILE
                    </motion.div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <motion.button
                      onClick={handleUploadClick}
                      whileHover={{ 
                        scale: 1.02,
                        borderColor: "rgba(34, 197, 94, 0.5)"
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center gap-3 bg-slate-800/50 border-2
                               border-dashed border-slate-600 hover:border-slate-500 py-6 rounded-2xl
                               transition-all duration-300 cursor-pointer group"
                    >
                      <motion.div
                        animate={{
                          y: [0, -2, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Upload className="w-6 h-6 text-slate-400 group-hover:text-slate-300 transition-colors" />
                      </motion.div>
                      <span className="text-slate-300 group-hover:text-white transition-colors font-medium">
                        {uploadedFile ? uploadedFile.name : 'Choose audio file'}
                      </span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Chat Section - Left */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="lg:col-span-1 lg:order-1"
            >
              <motion.div
                className="bg-gradient-to-br from-slate-900/90 to-slate-800/70 backdrop-blur-md rounded-3xl p-8 h-full border border-slate-700/40 hover:border-slate-600/60 transition-all duration-700"
                animate={{
                  boxShadow: [
                    "0 8px 32px rgba(0, 0, 0, 0.1)",
                    "0 12px 48px rgba(100, 116, 139, 0.05)",
                    "0 8px 32px rgba(0, 0, 0, 0.1)"
                  ],
                  y: [0, -1, 0]
                }}
                transition={{
                  boxShadow: {
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  },
                  y: {
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                <motion.h2 
                  className="text-2xl font-semibold mb-8 text-center text-slate-300"
                  animate={{
                    opacity: [0.9, 1, 0.9]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  Describe Your Vision
                </motion.h2>

                <div className="space-y-8">
                  <motion.div
                    animate={{
                      y: [0, -1, 0]
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <motion.textarea
                      value={message}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                      placeholder="Describe the vocal style, genre, mood, or any specific requirements for your track..."
                      whileFocus={{ 
                        scale: 1.02,
                        boxShadow: "0 0 30px rgba(168, 85, 247, 0.4)"
                      }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-40 bg-slate-800/70 border border-slate-600/60 rounded-2xl px-6 py-4
                               text-white placeholder-slate-400 resize-none focus:ring-2 focus:ring-purple-500/50
                               focus:border-purple-500/60 transition-all duration-500 backdrop-blur-sm
                               hover:bg-slate-800/80 hover:border-slate-500/60"
                    />
                  </motion.div>

                  <motion.div
                    animate={{
                      y: [0, -1, 0]
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                  >
                    <motion.button
                      onClick={handleSubmit}
                      disabled={isGenerating || !message.trim()}
                      whileHover={{ 
                        scale: 1.03,
                        boxShadow: "0 8px 30px rgba(168, 85, 247, 0.3)"
                      }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full flex items-center justify-center gap-4 bg-slate-700 hover:bg-slate-600
                               py-5 rounded-2xl font-semibold transition-all duration-500 disabled:opacity-40 cursor-pointer
                               disabled:cursor-not-allowed shadow-xl relative overflow-hidden group"
                      animate={{
                        backgroundPosition: isGenerating ? ["0% 50%", "100% 50%", "0% 50%"] : ["0% 50%"]
                      }}
                      transition={{
                        backgroundPosition: {
                          duration: 3,
                          repeat: isGenerating ? Infinity : 0,
                          ease: "linear"
                        }
                      }}
                      style={{
                        backgroundSize: "200% 100%"
                      }}
                    >
                      {/* Shimmer effect when generating */}
                      {isGenerating && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{
                            x: ["-100%", "100%"]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        />
                      )}
                      
                      <motion.div
                        animate={isGenerating ? {
                          rotate: [0, 360],
                          scale: [1, 1.1, 1]
                        } : {
                          x: [0, 3, 0],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{
                          rotate: {
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear"
                          },
                          scale: {
                            duration: isGenerating ? 1.5 : 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          },
                          x: {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }
                        }}
                      >
                        <Send className="w-5 h-5 relative z-10" />
                      </motion.div>
                      <span className="text-lg relative z-10">
                        {isGenerating ? 'Creating Magic...' : 'Generate Vocals'}
                      </span>
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Single Send to DAW Button */}
          {(recordedAudio || audioUrl) && (
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
                  const trackCount = (recordedAudio ? 1 : 0) + (audioUrl ? 1 : 0);
                  if (trackCount === 1) {
                    return recordedAudio ? "Open DAW with Recorded Track" : "Open DAW with Generated Track";
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
                {recordedAudio && audioUrl 
                  ? 'Both recorded and generated tracks will be loaded'
                  : recordedAudio 
                    ? 'Recorded track will be loaded'
                    : 'Generated track will be loaded'
                }
              </motion.p>
            </motion.div>
          )}

        </div>
      </motion.div>

      {/* Generation Progress Overlay */}
      <GenerationProgress
        isGenerating={isGenerating}
        progress={progress}
        message={generationMessage}
      />

      {/* Waveform Modal */}
      <WaveformModal
        isOpen={showWaveformModal}
        onClose={() => setShowWaveformModal(false)}
        audioUrl={audioUrl}
        audioBuffer={audioBuffer}
        trackName="Generated Vocal Track"
        onOpenInDAW={handleOpenInDAW}
      />
    </motion.div>
  );
}