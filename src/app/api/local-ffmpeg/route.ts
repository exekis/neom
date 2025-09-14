import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const execAsync = promisify(exec);

interface AudioOperation {
  op: string;
  description: string;
  ffmpegArgs: string[];
}

function parseAudioRequest(text: string): AudioOperation {
  const lowerText = text.toLowerCase();

  // Gain/Volume operations
  if (lowerText.includes('gain') || lowerText.includes('volume') || lowerText.includes('loud')) {
    const gainMatch = lowerText.match(/(\d+)\s*db/);
    const gainValue = gainMatch ? parseInt(gainMatch[1]) : 5;
    const isIncrease = lowerText.includes('increase') || lowerText.includes('up') || lowerText.includes('boost') || lowerText.includes('louder');
    const finalGain = isIncrease ? gainValue : -gainValue;

    return {
      op: 'gain',
      description: `${isIncrease ? 'Increased' : 'Decreased'} volume by ${gainValue}dB`,
      ffmpegArgs: ['-af', `volume=${finalGain}dB`]
    };
  }

  // Fade operations
  if (lowerText.includes('fade')) {
    const isFadeOut = lowerText.includes('out');
    if (isFadeOut) {
      return {
        op: 'fade',
        description: 'Applied fade out effect (last 5 seconds)',
        ffmpegArgs: ['-af', 'afade=t=out:st=0:d=5']
      };
    } else {
      return {
        op: 'fade',
        description: 'Applied fade in effect (first 3 seconds)',
        ffmpegArgs: ['-af', 'afade=t=in:st=0:d=3']
      };
    }
  }

  // Reverb operations
  if (lowerText.includes('reverb') || lowerText.includes('echo')) {
    return {
      op: 'reverb',
      description: 'Added reverb effect',
      ffmpegArgs: ['-af', 'aecho=0.8:0.9:60:0.5']
    };
  }

  // Normalize operations
  if (lowerText.includes('normalize') || lowerText.includes('balance')) {
    return {
      op: 'normalize',
      description: 'Normalized audio levels',
      ffmpegArgs: ['-af', 'loudnorm=I=-16:LRA=11:TP=-1.5']
    };
  }

  // Default to a simple gain boost
  return {
    op: 'enhance',
    description: 'Enhanced audio (slight volume boost)',
    ffmpegArgs: ['-af', 'volume=2dB']
  };
}

async function processAudioWithFFmpeg(inputPath: string, outputPath: string, operation: AudioOperation): Promise<void> {
  const ffmpegCommand = [
    'ffmpeg',
    '-y',  // Overwrite output
    '-i', inputPath,
    ...operation.ffmpegArgs,
    outputPath
  ].join(' ');

  console.log('Running FFmpeg:', ffmpegCommand);

  try {
    const { stdout, stderr } = await execAsync(ffmpegCommand);
    console.log('FFmpeg completed:', stderr); // FFmpeg outputs to stderr by default
  } catch (error: any) {
    console.error('FFmpeg error:', error);
    throw new Error(`FFmpeg processing failed: ${error.message}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Missing text parameter' }, { status: 400 });
    }

    console.log('Processing audio request:', text);

    // Parse the operation
    const operation = parseAudioRequest(text);

    // Setup file paths
    const publicDir = path.join(process.cwd(), 'public');
    const audioDir = path.join(publicDir, 'processed');
    const inputPath = path.join(publicDir, 'audio', 'intro_jazz.mp3');

    // Create processed directory if it doesn't exist
    if (!existsSync(audioDir)) {
      await mkdir(audioDir, { recursive: true });
    }

    // Check if input file exists
    if (!existsSync(inputPath)) {
      throw new Error('Input audio file not found: ' + inputPath);
    }

    // Generate unique output filename
    const timestamp = Date.now();
    const outputFilename = `processed_${operation.op}_${timestamp}.wav`;
    const outputPath = path.join(audioDir, outputFilename);
    const publicUrl = `/processed/${outputFilename}`;

    // Process with FFmpeg
    await processAudioWithFFmpeg(inputPath, outputPath, operation);

    // Verify output file was created
    if (!existsSync(outputPath)) {
      throw new Error('FFmpeg did not produce output file');
    }

    const runId = `local-${timestamp}`;
    const response = {
      projectId: 'demo1',
      op: operation,
      originalUrl: '/audio/intro_jazz.mp3',
      modifiedUrl: publicUrl,
      outName: outputFilename,
      runId,
      manifestUrl: `/api/local-ffmpeg/manifest/${runId}`,
      dbOpId: runId,
      description: operation.description,
      success: true,
      ffmpegArgs: operation.ffmpegArgs.join(' ')
    };

    console.log('Audio processing complete:', operation.description);

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Local FFmpeg processor error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process audio with FFmpeg',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { pathname } = new URL(request.url);

  // Handle manifest requests
  if (pathname.includes('/manifest/')) {
    const runId = pathname.split('/manifest/')[1];

    const manifest = {
      id: runId,
      createdAt: new Date().toISOString(),
      projectId: 'demo1',
      op: 'local_ffmpeg_processing',
      status: 'completed',
      description: 'Processed locally with FFmpeg',
      inputs: {
        originalPath: '/audio/intro_jazz.mp3',
        tool: 'FFmpeg'
      },
      outputs: {
        fileName: `processed_${runId}.wav`,
        tool: 'local-ffmpeg-processor'
      },
      provenance: {
        model: 'Local FFmpeg Processing',
        tool: 'ffmpeg'
      }
    };

    return NextResponse.json(manifest);
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}