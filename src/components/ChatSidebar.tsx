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
      text: "Hi! I'm your AI audio assistant. I can help you edit your tracks, add effects, and optimize your audio. What would you like to do?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<RightPanelTab>('chat');

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate AI processing time
    setTimeout(() => {
      let responseText = "I understand you want to work with your audio. ";

      if (tracks.length === 0) {
        responseText += "Once you upload some tracks, I can help you with effects like fade, gain adjustment, reverb, normalization, and adding loops. What specific audio editing do you have in mind?";
      } else {
        responseText += `I can see you have ${tracks.length} track${tracks.length !== 1 ? 's' : ''} loaded. I can help you with:\n\n• Fade in/out effects\n• Volume adjustments\n• Adding reverb or echo\n• Normalizing audio levels\n• Adding background loops\n\nWhat would you like to do with your audio?`;
      }

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
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
                      : 'bg-slate-800 text-slate-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
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
                disabled={!inputText.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                Send
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