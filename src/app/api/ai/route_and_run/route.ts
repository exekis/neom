import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EXTERNAL_API = 'http://20.161.72.50/api/ai/route_and_run';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { projectId, originalPath, text } = body as {
      projectId?: string;
      originalPath?: string;
      text?: string;
    };

    if (!projectId || !originalPath || !text) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, originalPath, text' },
        { status: 400 }
      );
    }

    const res = await fetch(EXTERNAL_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, originalPath, text })
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        {
          error: 'Upstream error',
          status: res.status,
          statusText: res.statusText,
          details: errText,
        },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Proxy failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
