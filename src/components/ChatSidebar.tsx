"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioTrack } from '../types/AudioTrack';
import { LayersWorkflow } from '@/components/workflows/LayersWorkflow';
import { VocalsWorkflow } from '@/components/workflows/VocalsWorkflow';
import { DescribeWorkflow } from '@/components/workflows/DescribeWorkflow';
import { RemixWorkflow } from '@/components/workflows/RemixWorkflow';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isAction?: boolean;
  actionType?: string;
  actionData?: any;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  tracks?: AudioTrack[];
  onApplyEffect?: (effect: Record<string, unknown>) => void;
  onAddTrackFromAI?: (args: { name: string; audioBuffer: AudioBuffer; audioUrl: string }) => void;
}

type RightPanelTab = 'chat' | 'layers' | 'vocals' | 'describe' | 'remix';

export function ChatSidebar({ isOpen, onClose, tracks = [], onAddTrackFromAI }: ChatSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi! I'm your AI audio assistant powered by Gemini. I can help you edit your tracks, add effects, optimize your audio, and even generate new audio content based on your descriptions. What would you like to do?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<RightPanelTab>('chat');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMockAudioTrack = async (description: string) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const duration = 30 + Math.random() * 30; // 30-60 seconds
      const sampleRate = audioContext.sampleRate;
      const buffer = audioContext.createBuffer(2, sampleRate * duration, sampleRate);

      // Generate simple audio based on description keywords
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < channelData.length; i++) {
          const time = i / sampleRate;
          let signal = 0;

          if (description.toLowerCase().includes('drum') || description.toLowerCase().includes('beat')) {
            // Generate drum-like pattern
            signal = Math.sin(time * 60 * Math.PI) * Math.exp(-((time % 1) * 10));
          } else if (description.toLowerCase().includes('bass')) {
            // Generate bass-like frequency
            signal = Math.sin(time * 80 * Math.PI) * 0.5;
          } else if (description.toLowerCase().includes('melody') || description.toLowerCase().includes('piano')) {
            // Generate melodic content
            signal = Math.sin(time * 440 * Math.PI) * 0.3 + Math.sin(time * 554 * Math.PI) * 0.2;
          } else {
            // Default ambient sound
            signal = Math.sin(time * 220 * Math.PI) * 0.4 + (Math.random() - 0.5) * 0.1;
          }

          channelData[i] = signal * (0.8 + Math.random() * 0.2) * Math.exp(-time * 0.1);
        }
      }

      return buffer;
    } catch (error) {
      console.error('Error generating audio:', error);
      return null;
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    const userInput = inputText;
    setInputText('');
    setIsGenerating(true);

    try {
      // Check if user is asking for audio generation
      const isAudioGenerationRequest = userInput.toLowerCase().includes('create') ||
                                     userInput.toLowerCase().includes('generate') ||
                                     userInput.toLowerCase().includes('make') ||
                                     userInput.toLowerCase().includes('add') &&
                                     (userInput.toLowerCase().includes('track') ||
                                      userInput.toLowerCase().includes('audio') ||
                                      userInput.toLowerCase().includes('sound') ||
                                      userInput.toLowerCase().includes('music') ||
                                      userInput.toLowerCase().includes('beat') ||
                                      userInput.toLowerCase().includes('melody') ||
                                      userInput.toLowerCase().includes('bass') ||
                                      userInput.toLowerCase().includes('drum'));

      // Call Gemini API
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          tracks: tracks.map(track => ({
            name: track.name,
            duration: track.duration
          }))
        }),
      });

      const data = await response.json();

      if (data.success) {
        let aiResponseText = data.message;

        // If this is an audio generation request, offer to create a track
        if (isAudioGenerationRequest && onAddTrackFromAI) {
          aiResponseText += "\n\n🎵 I can create a demo audio track for you based on your description! Would you like me to generate it and add it to your timeline?";

          // Add action buttons in the response
          const aiResponse: ChatMessage = {
            id: (Date.now() + 1).toString(),
            text: aiResponseText,
            isUser: false,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, aiResponse]);

          // Add the generate button message
          const generateButtonMessage: ChatMessage = {
            id: (Date.now() + 2).toString(),
            text: `Generate "${userInput.length > 50 ? userInput.substring(0, 50) + '...' : userInput}"`,
            isUser: false,
            timestamp: new Date(),
            isAction: true,
            actionType: 'generate',
            actionData: { description: userInput }
          } as ChatMessage & { isAction: boolean; actionType: string; actionData: any };

          setMessages(prev => [...prev, generateButtonMessage]);
        } else {
          const aiResponse: ChatMessage = {
            id: (Date.now() + 1).toString(),
            text: aiResponseText,
            isUser: false,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, aiResponse]);
        }
      } else {
        const errorResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: data.message || "I apologize, but I encountered an error while processing your request. Please try again.",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorResponse]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAudio = async (description: string) => {
    if (!onAddTrackFromAI) return;

    setIsGenerating(true);

    try {
      const processingMessage: ChatMessage = {
        id: Date.now().toString(),
        text: "🎵 Generating audio track... This might take a moment.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, processingMessage]);

      // Generate mock audio based on description
      const audioBuffer = await generateMockAudioTrack(description);

      if (audioBuffer) {
        // Create a mock audio URL (in a real implementation, this would be from an audio generation service)
        const audioUrl = URL.createObjectURL(new Blob());

        // Add track to DAW
        onAddTrackFromAI({
          name: `AI Generated - ${description.length > 30 ? description.substring(0, 30) + '...' : description}`,
          audioBuffer,
          audioUrl
        });

        const successMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: "✅ Successfully generated and added the audio track to your timeline! You can now edit, move, and process it like any other track.",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, successMessage]);
      } else {
        throw new Error('Failed to generate audio');
      }
    } catch (error) {
      console.error('Audio generation error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "❌ Sorry, I encountered an error while generating the audio track. Please try again with a different description.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderTabBar = () => (
    <div className="px-4 pt-3 border-b border-slate-800/60">
      <div className="flex gap-2">
        {[
          { key: 'chat', label: 'Chat' },
          { key: 'layers', label: 'Layers' },
          { key: 'vocals', label: 'Vocals' },
          { key: 'describe', label: 'Describe' },
          { key: 'remix', label: 'Remix' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as RightPanelTab)}
            className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-colors ${
              activeTab === (t.key as RightPanelTab)
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    if (activeTab === 'chat') {
      return (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.isUser
                      ? 'bg-purple-600 text-white'
                      : message.isAction
                      ? 'bg-green-600/20 border border-green-500/30'
                      : 'bg-slate-800 text-slate-200'
                  }`}
                >
                  {message.isAction && message.actionType === 'generate' ? (
                    <button
                      onClick={() => handleGenerateAudio(message.actionData.description)}
                      disabled={isGenerating}
                      className="w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      {isGenerating ? '🎵 Generating...' : `🎵 ${message.text}`}
                    </button>
                  ) : (
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                  )}
                  <p className={`text-xs mt-1 opacity-70 ${
                    message.isUser ? 'text-purple-200' : 'text-slate-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-700/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about audio editing..."
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 text-white placeholder-slate-400"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isGenerating}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isGenerating ? 'Thinking...' : 'Send'}
              </button>
            </div>
          </div>
        </>
      );
    }

    // Workflows embedded
    const onApplyToDAW = async (args: { audioBuffer: AudioBuffer; audioUrl: string; name: string }) => {
      if (onAddTrackFromAI) {
        onAddTrackFromAI({ name: args.name, audioBuffer: args.audioBuffer, audioUrl: args.audioUrl });
      }
    };

    const workflowCommonProps = {
      onBack: () => setActiveTab('chat' as RightPanelTab),
      onApplyToDAW,
    } as const;

    return (
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {activeTab === 'layers' && (
            <LayersWorkflow {...workflowCommonProps} />
          )}
          {activeTab === 'vocals' && (
            <VocalsWorkflow {...workflowCommonProps} />
          )}
          {activeTab === 'describe' && (
            <DescribeWorkflow {...workflowCommonProps} />
          )}
          {activeTab === 'remix' && (
            <RemixWorkflow {...workflowCommonProps} />
          )}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full w-[28rem] bg-slate-900/95 backdrop-blur-sm border-l border-slate-700/50 shadow-2xl z-50 flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
            <h2 className="text-lg font-semibold text-white">
              AI Assistant
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-xl cursor-pointer"
            >
              ×
            </button>
          </div>
          {renderTabBar()}
          {renderContent()}
        </motion.div>
      )}
    </AnimatePresence>
  );
}