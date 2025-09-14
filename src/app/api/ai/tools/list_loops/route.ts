import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
const VM_BASE = process.env.NEOM_API_BASE || 'http://20.161.72.50';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').toLowerCase();
    const res = await fetch(`${VM_BASE}/loops`, { cache: 'no-store' });
    if (!res.ok) return NextResponse.json({ success: false, error: 'vm error' }, { status: res.status });
    const data: unknown = await res.json();

    const pluckArray = (obj: unknown, key: string): unknown[] | null => {
      if (typeof obj === 'object' && obj !== null) {
        const r = obj as Record<string, unknown>;
        const v = r[key];
        if (Array.isArray(v)) return v as unknown[];
      }
      return null;
    };

    const arrUnknown: unknown = Array.isArray(data) ? data : pluckArray(data, 'loops') ?? [];
    const arr = Array.isArray(arrUnknown) ? arrUnknown : [];
    const items = arr.map((raw) => {
      const it = raw as Record<string, unknown>;
      return {
        id: String(it.id ?? it.loop_id ?? it.uuid ?? it.filename ?? Math.random()),
        name: String((it.name as string | undefined) ?? (it.filename as string | undefined) ?? 'loop'),
        tags: String((it.tags as string | undefined) ?? ''),
        bpm: typeof it.bpm === 'number' && Number.isFinite(it.bpm) ? Number(it.bpm) : null,
        key: typeof it.key === 'string' ? (it.key as string) : null
      };
    });

    const filtered = q
      ? items.filter((i) => `${i.name} ${i.tags} ${i.bpm ?? ''} ${i.key ?? ''}`.toLowerCase().includes(q))
      : items.slice(0, 25);

    return NextResponse.json({ success: true, loops: filtered });
  } catch {
    return NextResponse.json({ success: false, error: 'failed to list loops' }, { status: 500 });
  }
}
