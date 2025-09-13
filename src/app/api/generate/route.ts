import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { description, contentType, generateLyrics, lyricsPrompt, customLyrics } = await request.json();

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    let prompt = `Create audio production instructions for: ${description}`;

    if (contentType === 'lyrics') {
      if (generateLyrics) {
        prompt += `\n\nAlso generate lyrics based on: ${lyricsPrompt}`;
      } else if (customLyrics) {
        prompt += `\n\nUse these lyrics: ${customLyrics}`;
      }
    }

    prompt += '\n\nProvide specific instructions for audio production, including tempo, key, instruments, effects, and arrangement suggestions.';

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      success: true,
      instructions: text,
      originalPrompt: description,
      contentType
    });

  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}