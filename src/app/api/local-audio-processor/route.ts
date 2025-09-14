import { NextRequest, NextResponse } from 'next/server';

interface AudioOperation {
  op: string;
  projectId: string;
  originalPath: string;
  [key: string]: any;
}

function parseAudioRequest(text: string): AudioOperation {
  const lowerText = text.toLowerCase();

  // Gain/Volume operations
  if (lowerText.includes('gain') || lowerText.includes('volume') || lowerText.includes('loud')) {
    const gainMatch = lowerText.match(/(\d+)\s*db/);
    const gainValue = gainMatch ? parseInt(gainMatch[1]) : 5;
    const isIncrease = lowerText.includes('increase') || lowerText.includes('up') || lowerText.includes('boost');

    return {
      op: 'gain',
      projectId: 'demo1',
      originalPath: '/demo/audio.wav',
      gainDb: isIncrease ? gainValue : -gainValue,
      description: `${isIncrease ? 'Increased' : 'Decreased'} volume by ${gainValue}dB`
    };
  }

  // Fade operations
  if (lowerText.includes('fade')) {
    const isFadeOut = lowerText.includes('out');
    return {
      op: 'fade',
      projectId: 'demo1',
      originalPath: '/demo/audio.wav',
      fadeType: isFadeOut ? 'out' : 'in',
      startSec: isFadeOut ? 60 : 0,
      endSec: isFadeOut ? 80 : 20,
      description: `Applied fade ${isFadeOut ? 'out' : 'in'} effect`
    };
  }

  // Reverb operations
  if (lowerText.includes('reverb') || lowerText.includes('echo')) {
    return {
      op: 'reverb',
      projectId: 'demo1',
      originalPath: '/demo/audio.wav',
      preset: 'plate',
      description: 'Added reverb effect'
    };
  }

  // Normalize operations
  if (lowerText.includes('normalize') || lowerText.includes('balance')) {
    return {
      op: 'normalize',
      projectId: 'demo1',
      originalPath: '/demo/audio.wav',
      targetLufs: -14,
      description: 'Normalized audio levels'
    };
  }

  // Loop operations (default)
  const loopType = lowerText.includes('jazz') ? 'jazz' :
                   lowerText.includes('rock') ? 'rock' :
                   lowerText.includes('drum') ? 'drums' :
                   lowerText.includes('guitar') ? 'guitar' :
                   lowerText.includes('bass') ? 'bass' : 'jazz';

  return {
    op: 'add_loop',
    projectId: 'demo1',
    originalPath: '/demo/audio.wav',
    loopQuery: `${loopType} loop`,
    gainDb: -6,
    startSec: 0.5,
    description: `Added ${loopType} loop`
  };
}

function generateMockAudioUrl(operation: AudioOperation): string {
  // Create deterministic URLs based on operation for demo
  const timestamp = Date.now();
  const opType = operation.op;
  const hash = Math.random().toString(36).substring(7);

  // Use a real audio URL for demo (this could be any hosted audio file)
  const baseAudio = '/audio/intro_jazz.mp3'; // Using the existing landing page audio

  // In a real implementation, this would point to processed audio
  return baseAudio;
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Missing text parameter' }, { status: 400 });
    }

    // Parse the user's request
    const operation = parseAudioRequest(text);

    // Generate mock processed audio URL
    const modifiedUrl = generateMockAudioUrl(operation);
    const runId = `local-${Date.now()}`;
    const manifestUrl = `/api/local-audio-processor/manifest/${runId}`;

    // Simulate processing delay for realism
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const response = {
      projectId: operation.projectId,
      op: operation,
      originalUrl: '/audio/intro_jazz.mp3',
      modifiedUrl,
      outName: `processed_${operation.op}_${Date.now()}.mp3`,
      runId,
      manifestUrl,
      dbOpId: runId,
      description: operation.description,
      success: true
    };

    console.log('Local audio processing:', text, '→', operation.op);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Local audio processor error:', error);
    return NextResponse.json(
      { error: 'Failed to process audio locally' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, pathname } = new URL(request.url);

  // Handle manifest requests
  if (pathname.includes('/manifest/')) {
    const runId = pathname.split('/manifest/')[1];

    const manifest = {
      id: runId,
      createdAt: new Date().toISOString(),
      projectId: 'demo1',
      op: 'local_processing',
      status: 'completed',
      description: 'Processed locally for demo purposes',
      inputs: {
        originalPath: '/demo/audio.wav',
        request: 'User audio processing request'
      },
      outputs: {
        fileName: `processed_${runId}.mp3`,
        publicUrl: '/audio/intro_jazz.mp3'
      },
      provenance: {
        model: 'Local Processing',
        tool: 'demo_processor'
      }
    };

    return NextResponse.json(manifest);
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}