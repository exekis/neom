"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Wrench, ChevronRight, ChevronLeft } from "lucide-react";
import { aiRouteAndRun, AiRunResponse } from "@/lib/neom";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  audioResult?: AiRunResponse;
}

interface PersistentChatSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function PersistentChatSidebar({ isCollapsed, onToggleCollapse }: PersistentChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Ready to process your audio. Tell me what you want to do - add loops, adjust volume, apply effects, etc.",
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

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputValue.trim();
    setInputValue("");
    setIsTyping(true);

    try {
      // Check if VM API is configured
      const vmBase = process.env.NEXT_PUBLIC_NEOM_API_BASE;
      if (!vmBase) {
        throw new Error('VM API base URL not configured. Please set NEXT_PUBLIC_NEOM_API_BASE');
      }

      console.log('Attempting to call VM API at:', vmBase);

      let routeResult;

      try {
        // Try route_and_run first (uses Gemini for natural language processing)
        const routeResponse = await fetch('/api/vm-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint: '/route_and_run',
            projectId: 'demo1',
            originalPath: '/srv/neom/files/demo1/try1.wav',
            text: messageText,
            chooseRandomLoop: false
          })
        });

        if (routeResponse.ok) {
          routeResult = await routeResponse.json();
        } else {
          throw new Error(`Route and run failed: ${routeResponse.status}`);
        }
      } catch (routeError) {
        console.log('Route and run failed, falling back to direct processing:', routeError);

        // Fallback to run_direct with a default loop
        const directResponse = await fetch('/api/vm-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint: '/run_direct',
            projectId: 'demo1',
            originalPath: '/srv/neom/files/demo1/try1.wav',
            loopFileName: 'jazz_guitar_loop_wav_485389.wav',
            startSec: 0.5,
            gainDb: messageText.includes('gain') ? (messageText.includes('increase') ? 3 : -3) : -6,
            outName: 'modified.wav',
            prompt: messageText
          })
        });

        if (!directResponse.ok) {
          throw new Error(`API returned ${directResponse.status}: ${await directResponse.text()}`);
        }

        routeResult = await directResponse.json();
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `✅ Audio processed: "${messageText}"`,
        isUser: false,
        timestamp: new Date(),
        audioResult: {
          modifiedUrl: routeResult.modifiedUrl,
          manifestUrl: routeResult.manifestUrl,
          runId: routeResult.runId,
          projectId: routeResult.projectId,
          outName: routeResult.outName
        }
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to process audio:', error);

      let errorText = 'Unknown error';
      if (error instanceof Error) {
        errorText = error.message;
      } else if (typeof error === 'string') {
        errorText = error;
      }

      // More specific error messages
      if (errorText.includes('NetworkError') || errorText.includes('fetch')) {
        errorText = `Network error: Cannot reach VM at ${process.env.NEXT_PUBLIC_NEOM_API_BASE}`;
      } else if (errorText.includes('404')) {
        errorText = `Endpoint not found on VM`;
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `❌ ${errorText}`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
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

  const getVmBaseUrl = () => {
    return process.env.NEXT_PUBLIC_NEOM_API_BASE || "";
  };

  return (
    <div
      className={`h-full bg-gray-900/95 backdrop-blur-sm border-l border-gray-700/50 transition-all duration-300 ease-in-out flex-shrink-0 relative z-10 ${
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
              <Wrench className="w-5 h-5" />
              <span className="font-medium">NEOM BUILDER</span>
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

                  {/* Audio Player for AI responses with audio results */}
                  {!message.isUser && message.audioResult && (
                    <div className="mt-3 space-y-2">
                      <audio
                        controls
                        src={`${getVmBaseUrl()}${message.audioResult.modifiedUrl}`}
                        className="w-full h-8"
                        style={{ filter: 'invert(1)' }}
                      />
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Run ID: {message.audioResult.runId}</span>
                        <a
                          href={`${getVmBaseUrl()}${message.audioResult.manifestUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="underline hover:text-gray-300"
                        >
                          View details
                        </a>
                      </div>
                    </div>
                  )}

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
                onKeyDown={handleKeyPress}
                placeholder="Describe what you want (e.g., 'add punk guitar at 2s')..."
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
            title="Open Builder"
          >
            <Wrench className="w-5 h-5" />
          </button>
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">{messages.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}