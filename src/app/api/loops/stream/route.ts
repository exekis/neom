import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';

// stream audio files from local htn-2025/tracks/loops with basic range support
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const file = url.searchParams.get('file');

    if (!file || !/^[a-zA-Z0-9._-]+$/.test(file)) {
      return new NextResponse('invalid file parameter', { status: 400 });
    }

    const ext = path.extname(file).toLowerCase();
    if (!['.wav', '.mp3', '.m4a'].includes(ext)) {
      return new NextResponse('unsupported file type', { status: 400 });
    }

    const root = process.cwd();
    const baseDir = path.join(root, 'htn-2025', 'tracks', 'loops');
    const filePath = path.join(baseDir, file);

    if (!fs.existsSync(filePath)) {
      return new NextResponse('file not found', { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;

    const contentType =
      ext === '.mp3' ? 'audio/mpeg' : ext === '.m4a' ? 'audio/mp4' : 'audio/wav';

    const range = request.headers.get('range');
    if (range) {
      const match = /bytes=(\d+)-(\d*)/.exec(range);
      if (!match) {
        return new NextResponse('invalid range', { status: 416 });
      }
      const start = parseInt(match[1], 10);
      const end = match[2] ? Math.min(parseInt(match[2], 10), fileSize - 1) : fileSize - 1;
      if (isNaN(start) || isNaN(end) || start > end || start < 0) {
        return new NextResponse('invalid range', { status: 416 });
      }

      const nodeStream = fs.createReadStream(filePath, { start, end });
      const readable = new ReadableStream({
        start(controller) {
          nodeStream.on('data', (chunk: Buffer | string) => {
            const buf = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
            controller.enqueue(new Uint8Array(buf));
          });
          nodeStream.on('end', () => controller.close());
          nodeStream.on('error', (err) => controller.error(err));
        }
      });

      const headers = new Headers({
        'Content-Type': contentType,
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Content-Length': String(end - start + 1),
        'Accept-Ranges': 'bytes'
      });

      return new NextResponse(readable, { status: 206, headers });
    }

    const nodeStream = fs.createReadStream(filePath);
    const readable = new ReadableStream({
      start(controller) {
        nodeStream.on('data', (chunk: Buffer | string) => {
          const buf = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
          controller.enqueue(new Uint8Array(buf));
        });
        nodeStream.on('end', () => controller.close());
        nodeStream.on('error', (err) => controller.error(err));
      }
    });

    const headers = new Headers({
      'Content-Type': contentType,
      'Content-Length': String(fileSize),
      'Accept-Ranges': 'bytes'
    });

    return new NextResponse(readable, { status: 200, headers });
  } catch {
    return new NextResponse('internal server error', { status: 500 });
  }
}
