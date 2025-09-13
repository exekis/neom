"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";

interface Message { role: string; content: string }

interface Props {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isTyping: boolean;
  sendMessage: (
    content: string,
    opts?: { projectId?: string; region?: { start: number; end: number } | null }
  ) => Promise<void>;
  selectedRegion: { start: number; end: number } | null;
  projectId: string | undefined;
}

export default function ChatInterface({
  messages,
  setMessages,
  isTyping,
  sendMessage,
  selectedRegion,
  projectId
}: Props) {
  const [inputValue, setInputValue] = useState('');
  const suggestions: string[] = [
    "Add some heavy guitar riff to the selection",
    "Lower the volume by 3dB in the last 20 seconds",
    "Add plate reverb to the entire track",
    "Normalize the track to Spotify loudness standards",
    "Add some punk guitar loops throughout"
  ];

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !projectId) return;

    const userMessage = { role: 'user', content: inputValue.trim() } as Message;

    // Add user message locally for immediate feedback
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Animate input submit
    gsap.to(inputRef.current, {
      scale: 0.98,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.out"
    });

    // Delegate processing to hook
    await sendMessage(userMessage.content, { projectId, region: selectedRegion });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();

    // Animate suggestion click
    gsap.to('.suggestion', {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.out"
    });
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-800 to-slate-900">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-bold text-white flex items-center"
        >
          <svg className="w-6 h-6 mr-3 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Assistant
        </motion.h2>
        <p className="text-white/60 text-sm mt-1">
          {selectedRegion
            ? `Region selected: ${selectedRegion.start.toFixed(1)}s - ${selectedRegion.end.toFixed(1)}s`
            : 'Select a region or describe what you want to do'
          }
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-white/10 text-white/90'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                {isTyping && index === messages.length - 1 && message.role === 'assistant' && (
                  <motion.div
                    className="mt-2 flex space-x-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && !inputValue && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="p-6 pt-0"
        >
          <h4 className="text-white/80 text-sm font-medium mb-3">Try asking me to:</h4>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <motion.button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="suggestion px-3 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm text-white/60 hover:text-white transition-colors border border-white/10"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input */}
      <div className="p-6 border-t border-white/10">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <motion.div
            className="flex-1"
            animate={{ scale: isTyping ? 0.98 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={selectedRegion ? "Try: Add reverb to the selection" : "Try: Add heavy guitar loops"}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 resize-none focus:outline-none focus:bg-white/10 focus:border-purple-400 transition-all duration-200"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </motion.div>
          <motion.button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              inputValue.trim() && !isTyping
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
            whileHover={inputValue.trim() && !isTyping ? { scale: 1.05 } : {}}
            whileTap={inputValue.trim() && !isTyping ? { scale: 0.95 } : {}}
          >
            {isTyping ? '...' : 'Send'}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
