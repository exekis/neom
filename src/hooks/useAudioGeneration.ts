'use client';

import { useState, useCallback, useRef } from 'react';

interface GenerationParams {
  type: 'describe' | 'layers' | 'remix' | 'vocals';
  prompt?: string;
  audioUrl?: string;
  parameters?: {
    duration?: number;
    style?: string;
    tempo?: number;
    key?: string;
  };
}

interface GenerationState {
  isGenerating: boolean;
  progress: number;
  jobId: string | null;
  audioUrl: string | null;
  error: string | null;
  message: string;
}

export function useAudioGeneration() {
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    progress: 0,
    jobId: null,
    audioUrl: null,
    error: null,
    message: ''
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateAudio = useCallback(async (params: GenerationParams) => {
    setState(prev => ({
      ...prev,
      isGenerating: true,
      progress: 0,
      error: null,
      audioUrl: null,
      message: `Starting ${params.type} generation...`
    }));

    try {
      // Start generation
      const response = await fetch('/api/generate/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error('Failed to start generation');
      }

      const result = await response.json();
      const { jobId, estimatedTime } = result;

      setState(prev => ({
        ...prev,
        jobId,
        message: 'Processing audio...'
      }));

      // Poll for progress
      let currentProgress = 0;
      const pollInterval = 500; // Poll every 500ms
      const progressIncrement = (100 / (estimatedTime / pollInterval)) * 0.8; // 80% of progress from polling

      intervalRef.current = setInterval(async () => {
        try {
          currentProgress = Math.min(95, currentProgress + progressIncrement);

          setState(prev => ({
            ...prev,
            progress: currentProgress,
            message: currentProgress > 80 ? 'Almost done...' : 'Processing audio...'
          }));

          // Check actual status
          const statusResponse = await fetch(`/api/generate/audio?jobId=${jobId}`);
          if (statusResponse.ok) {
            const status = await statusResponse.json();

            if (status.isComplete) {
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
              }

              setState(prev => ({
                ...prev,
                progress: 100,
                isGenerating: false,
                audioUrl: status.audioUrl || generateMockAudioUrl(params.type),
                message: 'Generation complete!'
              }));
            }
          }
        } catch (error) {
          console.error('Status check error:', error);
        }
      }, pollInterval);

      // Fallback completion after estimated time + buffer
      setTimeout(() => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          setState(prev => ({
            ...prev,
            progress: 100,
            isGenerating: false,
            audioUrl: generateMockAudioUrl(params.type),
            message: 'Generation complete!'
          }));
        }
      }, estimatedTime + 2000);

    } catch (error) {
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: error instanceof Error ? error.message : 'Generation failed',
        message: 'Generation failed'
      }));
    }
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setState({
      isGenerating: false,
      progress: 0,
      jobId: null,
      audioUrl: null,
      error: null,
      message: ''
    });
  }, []);

  return {
    ...state,
    generateAudio,
    reset
  };
}

// Generate mock audio URL for demo purposes
function generateMockAudioUrl(type: string): string {
  // For now, use the same intro jazz audio as placeholder for all types
  // This will be the loop that gets generated and visualized
  return '/audio/intro_jazz.mp3';
}