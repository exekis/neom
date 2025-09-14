import { NextResponse } from 'next/server';
import { listLoops } from '@/lib/db';

export const runtime = 'nodejs';

// note: returns loops from local sqlite db
export async function GET() {
  try {
    const rows = listLoops(200);
    return NextResponse.json({ success: true, loops: rows });
  } catch (e) {
    console.error('db list loops error', e);
    return NextResponse.json({ success: false, error: 'failed to list loops from db' }, { status: 500 });
  }
}
