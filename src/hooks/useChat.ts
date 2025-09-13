import { useState, useEffect, useRef } from "react";

interface Message {
  role: string;
  content: string;
}

interface UseChatProps {
  onProcessStart?: () => void;
  onProcessEnd?: () => void;
}

interface SendMessageOptions {
  projectId?: string;
  region?: { start: number; end: number } | null;
}

interface UseChatReturn {
  messages: Message[];
  isTyping: boolean;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  sendMessage: (content: string, opts?: SendMessageOptions) => Promise<void>;
}

export const useChat = ({
  onProcessStart,
  onProcessEnd
}: UseChatProps): UseChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const initializedRef = useRef(false);

  const sendMessage = async (content: string, opts?: SendMessageOptions) => {
    const projectId = opts?.projectId;
    const region = opts?.region ?? null;
    if (!content.trim() || !projectId) return;

    const userMessage = { role: 'user', content: content.trim() };

    // Add user message
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    onProcessStart?.();

    try {
      // Process through backend API
      const response = await fetch('/ops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          ops: [{
            op: 'process_nlp',
            message: content,
            region
          }]
        }),
      });

      if (!response.ok) {
        throw new Error(`Processing failed: ${response.status}`);
      }

      const data = await response.json();

      // Add assistant response with typing effect
      const assistantMessage = { role: 'assistant', content: '' };
      setMessages(prev => [...prev, assistantMessage]);

      const responseText = `🎧 Applied: ${data.description || 'Audio processing completed'}\n\n✅ Process complete! Your modified track is ready.`;
      let index = 0;
      const typeInterval = setInterval(() => {
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: responseText.slice(0, index + 1)
          };
          return newMessages;
        });
        index++;
        if (index >= responseText.length) {
          clearInterval(typeInterval);
          setIsTyping(false);
          onProcessEnd?.();
        }
      }, 30);

    } catch (error) {
      console.error('Chat processing error:', error);
      setIsTyping(false);
      onProcessEnd?.();

      // Add error message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "⚠️ I'm having trouble connecting to the audio processor right now. Please make sure the backend is running and try again."
      }]);
    }
  };

  // Initialize with welcome message if no messages
  useEffect(() => {
    if (initializedRef.current) return;
    if (messages.length === 0) {
      initializedRef.current = true;
      setIsTyping(true);
      const welcomeMessage = "Hello! I'm your NOEM audio assistant. I'm here to help you manipulate your audio track with professional-grade operations. What would you like to do?\n\nTry asking me to:\n• Add effects like reverb, delay, or compression\n• Adjust volume, fade in/out sections\n• Add musical loops or samples\n• Normalize your track for streaming";

      let index = 0;
      const typeInterval = setInterval(() => {
        setMessages([{ role: 'assistant', content: welcomeMessage.slice(0, index + 1) }]);
        index++;
        if (index >= welcomeMessage.length) {
          clearInterval(typeInterval);
          setIsTyping(false);
        }
      }, 20);
    }
  }, [messages.length]);

  return {
    messages,
    isTyping,
    setMessages,
    sendMessage
  };
};
