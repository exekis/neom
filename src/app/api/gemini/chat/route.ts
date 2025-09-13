import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { message, tracks } = await request.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const systemPrompt = `You are an AI assistant specializing in Digital Audio Workstation (DAW) operations.
You help users with audio editing, track management, and music production tasks.

Current tracks in the timeline: ${tracks?.length || 0} tracks
${tracks?.map((track: any, index: number) =>
  `Track ${index + 1}: ${track.name} (${track.duration.toFixed(2)}s)`
).join('\n') || 'No tracks loaded'}

You can help with:
- Audio editing suggestions and techniques
- Track arrangement and mixing advice
- Effects recommendations (reverb, delay, compression, EQ)
- Audio production workflows
- Troubleshooting common DAW issues
- Creative suggestions for music composition

When suggesting specific actions, be practical and consider the current state of their project.
Keep responses concise but informative, focusing on actionable advice.`;

    const prompt = `${systemPrompt}\n\nUser message: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      success: true,
      message: text,
    });
  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate response',
        message: 'I apologize, but I encountered an error while processing your request. Please try again.',
      },
      { status: 500 }
    );
  }
}