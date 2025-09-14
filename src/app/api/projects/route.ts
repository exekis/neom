import { NextRequest, NextResponse } from 'next/server';

const VM_BASE = process.env.NEOM_API_BASE || 'http://20.161.72.50';

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    // Forward the file to the VM (the real backend)
    const vmRes = await fetch(`${VM_BASE}/projects/save`, {
        method: 'POST',
        body: form,
    });
    const vmJson = await vmRes.json();
    if (!vmRes.ok || !vmJson.success) {
      return NextResponse.json({ success: false, error: vmJson.detail || 'VM save failed' }, { status: 502 });
    }
    // Return VM's loop id back to the client
    return NextResponse.json({
      success: true,
      id: vmJson.id,
    });

  } catch (e) {
    console.error('save project error', e);
    return NextResponse.json({ success: false, error: 'failed to save project' }, { status: 500 });
  }
}
