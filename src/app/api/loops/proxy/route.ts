import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const target = url.searchParams.get('url');
    if (!target || !/^https?:\/\//.test(target)) {
      return NextResponse.json({ success: false, error: 'invalid url' }, { status: 400 });
    }

    const upstream = await fetch(target, {
      headers: {
        // forward range for media streaming
        range: req.headers.get('range') || ''
      }
    });

    if (!upstream.ok && upstream.status !== 206) {
      return NextResponse.json({ success: false, error: `upstream error ${upstream.status}` }, { status: upstream.status });
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const contentRange = upstream.headers.get('content-range');
    const contentLength = upstream.headers.get('content-length');

    const body = upstream.body;
    const headers = new Headers({ 'Content-Type': contentType, 'Accept-Ranges': 'bytes' });
    if (contentRange) headers.set('Content-Range', contentRange);
    if (contentLength) headers.set('Content-Length', contentLength);

    return new NextResponse(body, { status: upstream.status, headers });
  } catch (e) {
    console.error('proxy error', e);
    return NextResponse.json({ success: false, error: 'proxy failed' }, { status: 500 });
  }
}
