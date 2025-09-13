"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Send, Music, Mic2, FileText } from 'lucide-react';

interface DescribeWorkflowProps {
  onBack: () => void;
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

export function DescribeWorkflow({ onBack }: DescribeWorkflowProps) {
  const [message, setMessage] = useState('');
  const [contentType, setContentType] = useState<'instrumental' | 'lyrics'>('instrumental');
  const [generateLyrics, setGenerateLyrics] = useState(false);
  const [lyricsPrompt, setLyricsPrompt] = useState('');
  const [customLyrics, setCustomLyrics] = useState('');
  const [isInspiring, setIsInspiring] = useState(false);
  const [currentInspireText, setCurrentInspireText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

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
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: message,
          contentType,
          generateLyrics,
          lyricsPrompt: generateLyrics ? lyricsPrompt : null,
          customLyrics: !generateLyrics ? customLyrics : null
        })
      });

      const result = await response.json();
      console.log('Generation result:', result);
    } catch (error) {
      console.error('Error generating:', error);
    } finally {
      setIsGenerating(false);
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
              <FileText className="w-16 h-16 mx-auto mb-4 text-purple-500" />
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
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600
                           hover:from-purple-700 hover:to-pink-700 py-2 px-4 rounded-lg font-semibold
                           transition-all duration-300 disabled:opacity-50"
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
                    className="mb-4 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30
                             rounded-xl border border-purple-500/30"
                  >
                    <motion.div
                      key={currentInspireText}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-purple-300 font-medium"
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
                           text-white placeholder-slate-400 resize-none focus:ring-2 focus:ring-purple-500
                           focus:border-purple-500 transition-colors"
                />

                <button
                  onClick={handleSubmit}
                  disabled={isGenerating || !message.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700
                           py-3 rounded-xl font-semibold transition-colors disabled:opacity-50
                           disabled:cursor-not-allowed"
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
                                 font-semibold transition-colors ${
                        contentType === 'instrumental'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      <Music className="w-4 h-4" />
                      Instrumental
                    </button>
                    <button
                      onClick={() => setContentType('lyrics')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                                 font-semibold transition-colors ${
                        contentType === 'lyrics'
                          ? 'bg-purple-600 text-white'
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
                        className="w-4 h-4 text-purple-600 bg-slate-800 border-slate-600 rounded
                                 focus:ring-purple-500 focus:ring-2"
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
                                   focus:ring-purple-500 focus:border-purple-500 transition-colors"
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
                                   focus:ring-purple-500 focus:border-purple-500 transition-colors"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}