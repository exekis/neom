import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
const VM_BASE = process.env.NEOM_API_BASE || 'http://20.161.72.50';

type RunDirectRequest = {
  projectId: string;
  originalPath: string;
  loopId: string | number;
  startSec: number;
  gainDb: number;
  endSec?: number;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<RunDirectRequest>;
    const projectId = String(body.projectId || '').trim();
    const originalPath = String(body.originalPath || '').trim();
    const loopIdRaw = body.loopId;
    const startSec = Number(body.startSec);
    const gainDb = Number(body.gainDb);
    const endSec = body.endSec == null ? undefined : Number(body.endSec);

    if (!projectId || !originalPath || (typeof loopIdRaw !== 'string' && typeof loopIdRaw !== 'number')) {
      return NextResponse.json({ success: false, error: 'missing fields' }, { status: 400 });
    }
    if (!Number.isFinite(startSec) || startSec < 0) {
      return NextResponse.json({ success: false, error: 'invalid startSec' }, { status: 400 });
    }
    if (!Number.isFinite(gainDb) || gainDb < -60 || gainDb > 12) {
      return NextResponse.json({ success: false, error: 'invalid gainDb' }, { status: 400 });
    }
    if (endSec != null && (!Number.isFinite(endSec) || endSec <= 0)) {
      return NextResponse.json({ success: false, error: 'invalid endSec' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(`${VM_BASE}/api/run_direct`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          projectId,
          originalPath,
          loopId: loopIdRaw,
          startSec,
          gainDb,
          endSec,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const vmJson = await res.json();
      if (!res.ok) {
        return NextResponse.json({ success: false, error: vmJson?.error || 'vm error' }, { status: res.status });
      }
      return NextResponse.json({ success: true, vm: vmJson });
    } catch {
      clearTimeout(timeout);
      return NextResponse.json({ success: false, error: 'vm timeout or network error' }, { status: 504 });
    }
  } catch {
    return NextResponse.json({ success: false, error: 'bad request' }, { status: 400 });
  }
}
