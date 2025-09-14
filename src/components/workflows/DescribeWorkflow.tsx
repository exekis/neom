"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Send, Music, Mic2, FileText } from 'lucide-react';
import useAudioGeneration from '@/hooks/useAudioGenerationHardcoded';
import GenerationProgress from '@/components/GenerationProgress';

interface DescribeWorkflowProps {
  onBack: () => void;
  onApplyToDAW?: (args: { audioBuffer: AudioBuffer; audioUrl: string; name: string }) => void;
}

const INSPIRE_PROMPTS = [
  "A dreamy lo-fi hip hop track with vinyl crackles",
  "Upbeat synthwave with retro 80s vibes",
  "Emotional piano ballad with strings",
  "Energetic drum and bass with heavy drops",
  "Ambient nature sounds with soft guitar",
  "Jazz fusion with smooth saxophone",
  "Epic orchestral fantasy theme",
  "Minimalist techno with hypnotic rhythms"
];

export function DescribeWorkflow({ onBack, onApplyToDAW }: DescribeWorkflowProps) {
  const [message, setMessage] = useState('');
  const [contentType, setContentType] = useState<'instrumental' | 'lyrics'>('instrumental');
  const [generateLyrics, setGenerateLyrics] = useState(false);
  const [lyricsPrompt, setLyricsPrompt] = useState('');
  const [customLyrics, setCustomLyrics] = useState('');
  const [isInspiring, setIsInspiring] = useState(false);
  const [currentInspireText, setCurrentInspireText] = useState('');
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

  const {
    isGenerating,
    progress,
    audioUrl,
    error,
    message: generationMessage,
    generateAudio,
    reset
  } = useAudioGeneration();

  const handleInspireMe = async () => {
    setIsInspiring(true);
    setCurrentInspireText('');

    for (let i = 0; i < INSPIRE_PROMPTS.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setCurrentInspireText(INSPIRE_PROMPTS[i]);
    }

    const finalPrompt = INSPIRE_PROMPTS[Math.floor(Math.random() * INSPIRE_PROMPTS.length)];
    setCurrentInspireText(finalPrompt);
    setMessage(finalPrompt);
    setIsInspiring(false);
  };

  const handleSubmit = async () => {
    // Reset all audio states
    setAudioBuffer(null);
    reset();

    await generateAudio({
      type: 'describe',
      prompt: message,
      parameters: {
        style: contentType === 'lyrics' ? 'vocal' : 'instrumental'
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

  const handleSendToDAW = async () => {
    try {
      const tracksToSend = [];
      
      // Process generated audio if available
      if (audioUrl) {
        const name = `Generated ${contentType} track`;
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
              <FileText className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold mb-4"
            >
              Describe & Create
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-lg mb-8"
            >
              Tell AI what you want and let it create the foundation
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Main Input Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Describe Your Creation</h2>
                <button
                  onClick={handleInspireMe}
                  disabled={isInspiring}
                  className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600
                           py-2 px-4 rounded-lg font-semibold
                           transition-all duration-300 disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className={`w-4 h-4 ${isInspiring ? 'animate-spin' : ''}`} />
                  Inspire Me
                </button>
              </div>

              {/* Inspire Me Animation */}
              <AnimatePresence>
                {isInspiring && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-4 bg-slate-800/50
                             rounded-xl border border-slate-600/30"
                  >
                    <motion.div
                      key={currentInspireText}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-slate-300 font-medium"
                    >
                      {currentInspireText || "Finding inspiration..."}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe the music you want to create..."
                  className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3
                           text-white placeholder-slate-400 resize-none focus:ring-2 focus:ring-slate-500
                           focus:border-slate-500 transition-colors"
                />

                <button
                  onClick={handleSubmit}
                  disabled={isGenerating || !message.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600
                           py-3 rounded-xl font-semibold transition-colors disabled:opacity-50
                           disabled:cursor-not-allowed cursor-pointer"
                >
                  <Send className={`w-4 h-4 ${isGenerating ? 'animate-pulse' : ''}`} />
                  {isGenerating ? 'Generating...' : 'Generate Music'}
                </button>
              </div>
            </motion.div>

            {/* Options Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6"
            >
              <h2 className="text-xl font-semibold mb-4">Creation Options</h2>

              <div className="space-y-6">
                {/* Content Type Selection */}
                <div>
                  <label className="block text-sm font-medium mb-3">Content Type</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setContentType('instrumental')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                                 font-semibold transition-colors cursor-pointer ${
                        contentType === 'instrumental'
                          ? 'bg-slate-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      <Music className="w-4 h-4" />
                      Instrumental
                    </button>
                    <button
                      onClick={() => setContentType('lyrics')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                                 font-semibold transition-colors cursor-pointer ${
                        contentType === 'lyrics'
                          ? 'bg-slate-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      <Mic2 className="w-4 h-4" />
                      Lyrics
                    </button>
                  </div>
                </div>

                {/* Lyrics Options */}
                {contentType === 'lyrics' && (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <input
                        type="checkbox"
                        id="generateLyrics"
                        checked={generateLyrics}
                        onChange={(e) => setGenerateLyrics(e.target.checked)}
                        className="w-4 h-4 text-slate-600 bg-slate-800 border-slate-600 rounded
                                 focus:ring-slate-500 focus:ring-2"
                      />
                      <label htmlFor="generateLyrics" className="text-sm font-medium">
                        Generate Lyrics with AI
                      </label>
                    </div>

                    {generateLyrics ? (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Lyrics Generation Prompt
                        </label>
                        <textarea
                          value={lyricsPrompt}
                          onChange={(e) => setLyricsPrompt(e.target.value)}
                          placeholder="Describe the theme, mood, or story for the lyrics..."
                          className="w-full h-24 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3
                                   text-white placeholder-slate-400 resize-none focus:ring-2
                                   focus:ring-slate-500 focus:border-slate-500 transition-colors"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Custom Lyrics
                        </label>
                        <textarea
                          value={customLyrics}
                          onChange={(e) => setCustomLyrics(e.target.value)}
                          placeholder="Write your own lyrics here..."
                          className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3
                                   text-white placeholder-slate-400 resize-none focus:ring-2
                                   focus:ring-slate-500 focus:border-slate-500 transition-colors"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Results Section */}
          {audioUrl && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6"
            >
              <h3 className="text-xl font-semibold mb-6 text-slate-200">Generated Track</h3>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl"
              >
                <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                  <Music className="w-6 h-6 text-slate-300" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-200">Generated {contentType} track</p>
                  <p className="text-sm text-slate-400">AI-generated audio</p>
                </div>
                <audio 
                  controls 
                  src={audioUrl}
                  className="h-8 max-w-48"
                  style={{ filter: 'invert(1) hue-rotate(180deg)' }}
                />
              </motion.div>
            </motion.div>
          )}

          {/* Single Send to DAW Button */}
          {audioUrl && (
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
                Open DAW with Generated Track
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
                Your generated {contentType} track will be loaded into the timeline
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