"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, Music, Volume2, Activity, Zap } from "lucide-react";
import { AudioTrack } from "../types/AudioTrack";

interface VegasChatSidebarProps {
  tracks: AudioTrack[];
  onApplyEffect: (effect: unknown) => void;
  onAddTrackFromAI: (args: { name: string; audioBuffer: AudioBuffer; audioUrl: string }) => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: Array<{
    type: 'add_track' | 'apply_effect';
    label: string;
    data: unknown;
  }>;
}

export function VegasChatSidebar({
  tracks,
  onApplyEffect,
  onAddTrackFromAI
}: VegasChatSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your AI audio assistant. I can help you generate tracks, apply effects, and manage your project. What would you like to create today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageContent = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          tracks: tracks.map(track => ({
            name: track.name,
            duration: track.duration,
            startTime: track.startTime
          }))
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.message,
          timestamp: new Date()
        };

        // Add action buttons based on message content
        if (data.message.toLowerCase().includes('track') || data.message.toLowerCase().includes('audio')) {
          assistantMessage.actions = [
            {
              type: 'add_track',
              label: 'Generate Jazz Track',
              data: { style: 'jazz', duration: 30 }
            },
            {
              type: 'add_track',
              label: 'Generate Rock Track',
              data: { style: 'rock', duration: 30 }
            }
          ];
        }

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.message || 'Sorry, I encountered an error processing your request.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I apologize, but I'm having trouble connecting right now. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = async (action: {type: string; data: {duration?: number}}) => {
    if (action.type === 'add_track') {
      setIsLoading(true);
      try {
        // Create a mock audio buffer for demo
        const audioContext = new (window.AudioContext || (window as unknown).webkitAudioContext)();
        const duration = action.data.duration;
        const sampleRate = audioContext.sampleRate;
        const audioBuffer = audioContext.createBuffer(2, sampleRate * duration, sampleRate);

        // Fill with demo audio data
        const leftChannel = audioBuffer.getChannelData(0);
        const rightChannel = audioBuffer.getChannelData(1);
        for (let i = 0; i < audioBuffer.length; i++) {
          const sample = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.1;
          leftChannel[i] = sample;
          rightChannel[i] = sample;
        }

        const trackName = `AI ${action.data.style} Track`;
        onAddTrackFromAI({
          name: trackName,
          audioBuffer: audioBuffer,
          audioUrl: '' // Would be actual URL in real implementation
        });

        const successMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'assistant',
          content: `Great! I've generated a ${action.data.style} track for you. It's been added to your timeline.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, successMessage]);
      } catch (error) {
        console.error('Track generation error:', error);
        const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'assistant',
          content: "Sorry, I couldn't generate the track right now. Please try again.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800">
      {/* Header */}
      <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4">
        <Bot className="w-5 h-5 text-blue-400 mr-2" />
        <span className="text-white font-medium">AI Assistant</span>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          <span className="text-xs text-gray-400">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>

              {/* Action Buttons */}
              {message.actions && (
                <div className="mt-3 space-y-2">
                  {message.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleActionClick(action)}
                      disabled={isLoading}
                      className="block w-full text-left text-xs bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded transition-colors disabled:opacity-50"
                    >
                      {action.type === 'add_track' && <Music className="w-3 h-3 inline mr-2" />}
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="text-xs opacity-60 mt-2">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-100 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-white rounded-full"></div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-t border-gray-700">
        <div className="text-xs text-gray-400 mb-2">Quick Actions</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setInputValue('Generate a jazz bass line')}
            className="text-xs bg-gray-700 hover:bg-gray-600 text-white p-2 rounded flex items-center gap-1 transition-colors"
          >
            <Music className="w-3 h-3" />
            Jazz Bass
          </button>
          <button
            onClick={() => setInputValue('Add reverb to the selected track')}
            className="text-xs bg-gray-700 hover:bg-gray-600 text-white p-2 rounded flex items-center gap-1 transition-colors"
          >
            <Zap className="w-3 h-3" />
            Add Reverb
          </button>
          <button
            onClick={() => setInputValue('Create a drum loop')}
            className="text-xs bg-gray-700 hover:bg-gray-600 text-white p-2 rounded flex items-center gap-1 transition-colors"
          >
            <Volume2 className="w-3 h-3" />
            Drum Loop
          </button>
          <button
            onClick={() => setInputValue('Normalize all tracks')}
            className="text-xs bg-gray-700 hover:bg-gray-600 text-white p-2 rounded flex items-center gap-1 transition-colors"
          >
            <Activity className="w-3 h-3" />
            Normalize
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder="Ask me to generate tracks, apply effects, or help with your project..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}