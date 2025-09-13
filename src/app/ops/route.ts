import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { projectId, ops } = await req.json();
    const first = Array.isArray(ops) ? ops[0] : undefined;

    // Simulate processing latency
    await new Promise((r) => setTimeout(r, 500));

    return NextResponse.json({
      ok: true,
      projectId,
      description: first?.description || first?.op || 'Audio processing completed',
      modifiedUrl: null,
      latencyMs: 500,
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  }
}