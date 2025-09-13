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

  // Calls external AI router to select op + run it,
  // then sets audioUrl to the produced file URL.
  const aiRouteRun = useCallback(async (args: { projectId: string; originalPath: string; text: string }) => {
    const API = 'http://20.161.72.50/api';
    try {
      setState(prev => ({ ...prev, isGenerating: true, progress: 5, message: 'Contacting AI router...' }));

      const res = await fetch(`${API}/ai/route_and_run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args)
      });

      if (!res.ok) {
        throw new Error(`AI route failed: ${res.status}`);
      }

      // Increment progress a bit while parsing
      setState(prev => ({ ...prev, progress: 40, message: 'Routing successful. Executing operation...' }));

      const data = await res.json();
      // data.modifiedUrl is a "/files/..." path. Prefix with host
      const filesBase = 'http://20.161.72.50';
      const absoluteAudioUrl = `${filesBase}${data.modifiedUrl}`;

      setState(prev => ({ ...prev, progress: 100, message: 'Generation complete!' }));

      // Slight delay to allow the user to see completion
      setTimeout(() => {
        setState(prev => ({ ...prev, isGenerating: false, audioUrl: absoluteAudioUrl }));
      }, 500);

      return data;
    } catch (err) {
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: err instanceof Error ? err.message : 'AI route failed',
        message: 'Generation failed'
      }));
      throw err;
    }
  }, []);

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

      // simulate progress smoothly and finish faster in dev
      const isProd = process.env.NODE_ENV === 'production';
      let currentProgress = 0;
      const tickMs = isProd ? 100 : 50; // faster visual updates in dev
      const targetDuringProcess = 95;
      const totalSteps = Math.max(1, Math.floor(estimatedTime / tickMs)); // avoid divide by zero
      const progressPerStep = targetDuringProcess / totalSteps;

      intervalRef.current = setInterval(() => {
        currentProgress += progressPerStep;

        if (currentProgress >= targetDuringProcess) {
          // complete the generation
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }

          // final completion step
          setState(prev => ({
            ...prev,
            progress: 100,
            message: 'Generation complete!'
          }));

          // auto-dismiss quickly in dev, keep a brief pause in prod
          const doneDelay = isProd ? 1000 : 150;
          setTimeout(() => {
            setState(prev => ({
              ...prev,
              isGenerating: false,
              audioUrl: generateMockAudioUrl()
            }));
          }, doneDelay);

        } else {
          setState(prev => ({
            ...prev,
            progress: Math.min(currentProgress, targetDuringProcess),
            message: currentProgress > 70 ? 'Almost done...' : 'Processing audio...'
          }));
        }
      }, tickMs);

    } catch (error) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
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
    aiRouteRun,
    reset
  };
}

// Generate mock audio URL for demo purposes
function generateMockAudioUrl(): string {
  // For now, use the same intro jazz audio as placeholder for all types
  // This will be the loop that gets generated and visualized
  return '/audio/intro_jazz.mp3';
}