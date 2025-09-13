'use client';

import { useState, useEffect } from 'react';

interface GenerationProgressProps {
  isGenerating: boolean;
  progress: number;
  message?: string;
  onComplete?: () => void;
}

export default function GenerationProgress({
  isGenerating,
  progress,
  message = 'Generating audio...',
  onComplete
}: GenerationProgressProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setAnimatedProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setAnimatedProgress(prev => {
        const diff = progress - prev;
        const step = diff * 0.1;
        const newProgress = prev + step;

        if (Math.abs(diff) < 0.1) {
          return progress;
        }

        return newProgress;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [progress, isGenerating]);

  useEffect(() => {
    if (progress >= 100 && onComplete) {
      const timeout = setTimeout(onComplete, 500);
      return () => clearTimeout(timeout);
    }
  }, [progress, onComplete]);

  if (!isGenerating && progress === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div
              className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"
              style={{
                animationDuration: progress < 100 ? '1s' : '0s'
              }}
            ></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {progress >= 100 ? 'Complete!' : 'Generating Audio'}
          </h3>
          <p className="text-gray-600">{message}</p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{Math.round(animatedProgress)}%</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${animatedProgress}%` }}
            />
          </div>

          {progress < 100 && (
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>Please wait...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}