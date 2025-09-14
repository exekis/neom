import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { message, tracks } = await request.json() as {
      message: string;
      tracks?: Array<{name: string; duration: number}>
    };

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `You are NEOM BUILDER, a nonchalant audio crafting assistant.
You build audio experiences with users through practical DAW operations.

Current tracks in the timeline: ${tracks?.length || 0} tracks
${tracks?.map((track, index: number) =>
  `Track ${index + 1}: ${track.name} (${track.duration.toFixed(2)}s)`
).join('\n') || 'No tracks loaded'}

You build:
- Audio edits and effects
- Track arrangements and mixes
- Sound processing (reverb, delay, compression, EQ)
- Production workflows
- Quick DAW solutions
- Creative audio ideas

Keep it nonchalant and builder-focused. Short, practical responses only.`;

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