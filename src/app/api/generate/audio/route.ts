import { NextRequest, NextResponse } from 'next/server';

interface AudioGenerationRequest {
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

export async function POST(request: NextRequest) {
  try {
    const body: AudioGenerationRequest = await request.json();
    const { type, prompt, audioUrl, parameters } = body;

    // simulate processing time based on type
    const isProd = process.env.NODE_ENV === 'production'; // dev should be fast
    const processingTimes = {
      describe: isProd ? 3000 : 200,
      layers: isProd ? 8000 : 300,
      remix: isProd ? 12000 : 400,
      vocals: isProd ? 15000 : 500
    } as const;

    const processingTime = processingTimes[type] || (isProd ? 5000 : 250);

    // Generate a unique job ID
    const jobId = Date.now().toString(36) + Math.random().toString(36).substr(2);

    // start the generation process (simulate with timeout)
    setTimeout(async () => {
      // this would normally trigger the actual audio generation
      // for now, we'll just log the completion
      console.log(`Audio generation completed for job ${jobId}`);
    }, processingTime);

    return NextResponse.json({
      success: true,
      jobId,
      estimatedTime: processingTime,
      message: `Started ${type} generation`,
      parameters: {
        type,
        prompt,
        audioUrl,
        ...parameters
      }
    });

  } catch (error) {
    console.error('Audio generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to start generation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json(
      { success: false, error: 'Job ID required' },
      { status: 400 }
    );
  }

  // Simulate job status checking
  const mockProgress = Math.min(100, Math.random() * 100);
  const isComplete = mockProgress > 95;

  // Generate a mock audio URL if complete - use intro jazz as placeholder
  const audioUrl = isComplete
    ? '/audio/intro_jazz.mp3'
    : null;

  return NextResponse.json({
    success: true,
    jobId,
    progress: mockProgress,
    isComplete,
    audioUrl,
    message: isComplete ? 'Generation complete!' : 'Processing...'
  });
}