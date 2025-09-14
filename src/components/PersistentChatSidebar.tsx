"use client";

import { useState, useRef, useEffect } from "react";
import { Send, MessageCircle, ChevronRight, ChevronLeft } from "lucide-react";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface PersistentChatSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function PersistentChatSidebar({ isCollapsed, onToggleCollapse }: PersistentChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Welcome to NEOM AI Audio Co-Pilot! I can help you with audio editing tasks.',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response with delay
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: generateResponse(inputValue),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('fade')) {
      return 'I can help you add fade effects! Try selecting a track and specifying fade in or fade out with duration.';
    } else if (lowerInput.includes('volume') || lowerInput.includes('gain')) {
      return 'To adjust volume, I can apply gain changes. Specify the decibel adjustment you need (e.g., "+3dB" or "-6dB").';
    } else if (lowerInput.includes('reverb')) {
      return 'I can add reverb effects with different presets like "plate", "room", or "hall". Which would you prefer?';
    } else if (lowerInput.includes('normalize')) {
      return 'I can normalize your audio to standard LUFS levels. This ensures consistent loudness across tracks.';
    } else if (lowerInput.includes('loop')) {
      return 'I can add background loops to enhance your track. What style are you looking for? (e.g., punk, jazz, electronic)';
    } else if (lowerInput.includes('help')) {
      return 'I can assist with: fade effects, volume/gain adjustments, reverb, normalization, and adding loops. What would you like to work on?';
    } else {
      return `I understand you want to work with "${input}". I can help with audio effects like fade, gain, reverb, normalize, and adding loops. What specific effect would you like to apply?`;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`h-full bg-gray-900/95 backdrop-blur-sm border-l border-gray-700/50 transition-all duration-300 ease-in-out flex-shrink-0 ${
        isCollapsed
          ? 'w-12'
          : 'w-[400px]'
      }`}
    >
      {/* Header */}
      <div className="h-16 border-b border-gray-700/50 flex items-center px-4 bg-gray-800/50">
        <button
          onClick={onToggleCollapse}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
        >
          {isCollapsed ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <>
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">AI Chat</span>
              <ChevronRight className="w-4 h-4 ml-auto" />
            </>
          )}
        </button>
      </div>

      {/* Chat Content - Hidden when collapsed */}
      {!isCollapsed && (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{ height: 'calc(100vh - 140px)' }}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <div className={`text-xs mt-1 opacity-70 ${
                    message.isUser ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-gray-100 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="h-20 border-t border-gray-700/50 p-4 bg-gray-800/30">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about audio editing..."
                className="flex-1 bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-600"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Collapsed State Content */}
      {isCollapsed && (
        <div className="flex flex-col items-center py-4 space-y-4">
          <button
            onClick={onToggleCollapse}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg"
            title="Open Chat"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">{messages.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}