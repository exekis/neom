"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatSidebar({ isOpen, onClose }: ChatSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi! I'm your AI audio assistant. I can help you edit your tracks, add effects, and optimize your audio. What would you like to do?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');

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

    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I understand you want to work with your audio. Once you upload some tracks, I can help you with effects like fade, gain adjustment, reverb, normalization, and adding loops. What specific audio editing do you have in mind?",
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full w-96 bg-white/95 backdrop-blur-sm border-l border-purple-100 shadow-2xl z-50 flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-purple-100">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-transparent">
              AI Assistant
            </h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 text-xl"
            >
              ×
            </button>
          </div>

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
                      ? 'bg-gradient-to-r from-purple-600 to-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 opacity-70 ${
                    message.isUser ? 'text-purple-100' : 'text-slate-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-4 border-t border-purple-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about audio editing..."
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-400"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-emerald-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}