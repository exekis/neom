import { NextRequest, NextResponse } from 'next/server';

const VM_BASE = process.env.NEOM_API_BASE || 'http://20.161.72.50:8001';

export async function GET() {
  try {
    const r = await fetch(`${VM_BASE}/loops`);
    const j = await r.json();
    return NextResponse.json(j);
  } catch (e) {
    console.error('list loops error', e);
    return NextResponse.json({ success: false, error: 'failed to list loops' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ success: false, error: 'content-type must be multipart/form-data' }, { status: 400 });
    }

    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'file is required' }, { status: 400 });
    }

    // Forward the file to the VM (the real backend)
    const vmForm = new FormData();
    vmForm.append('file', file, file.name); // keep original filename
    if (form.get('name')) vmForm.append('name', String(form.get('name')));

    const vmRes = await fetch(`${VM_BASE}/loops/upload`, {
      method: 'POST',
      body: vmForm,
    });

    const vmJson = await vmRes.json();
    if (!vmRes.ok || !vmJson.success) {
      return NextResponse.json({ success: false, error: vmJson.detail || 'VM upload failed' }, { status: 502 });
    }

    // Return VM's loop id back to the client
    return NextResponse.json({
      success: true,
      id: vmJson.id,
      file: vmJson.file,
    });

  } catch (e) {
    console.error('upload loop error', e);
    return NextResponse.json({ success: false, error: 'failed to upload file' }, { status: 500 });
  }
}
