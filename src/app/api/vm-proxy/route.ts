import { NextRequest, NextResponse } from 'next/server';

// compute vm api base and ensure it ends with /api
// all code comments are lowercase and end with no period
function getVmApiBase(): string {
  // prefer public vm base if available and non-local to avoid hitting localhost in dev
  const pubRaw = (process.env.NEXT_PUBLIC_NEOM_API_BASE || '').trim();
  const srvRaw = (process.env.NEOM_API_BASE || '').trim();

  const toUrl = (v: string): URL | null => {
    if (!v) return null;
    const s = v.replace(/\/$/, '');
    try {
      return new URL(s);
    } catch {
      return null;
    }
  };

  const pub = toUrl(pubRaw);
  const srv = toUrl(srvRaw);
  const isLocal = (u: URL | null) => !!u && (u.hostname === 'localhost' || u.hostname === '127.0.0.1');

  // selection priority: public non-local → server non-local → public (even if local) → server (even if local) → default
  const candidate = (!isLocal(pub) && pub) || (!isLocal(srv) && srv) || pub || srv || new URL('http://20.161.72.50');

  const origin = `${candidate.protocol}//${candidate.hostname}${candidate.port ? `:${candidate.port}` : ''}`;
  return /\/api$/i.test(candidate.pathname) ? `${origin}${candidate.pathname}` : `${origin}/api`;
}

const VM_BASE = getVmApiBase();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    const query = searchParams.get('query');
    const top_k = searchParams.get('top_k') || '3';

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint parameter' }, { status: 400 });
    }

    // build vm url and avoid duplicating /api
    const ep = endpoint.startsWith('/api/') ? endpoint.slice(4) : endpoint;
    let vmUrl = `${VM_BASE}${ep.startsWith('/') ? '' : '/'}${ep}`;
    if (query) {
      vmUrl += `?query=${encodeURIComponent(query)}&top_k=${top_k}`;
    }

    console.log('Proxying to VM:', vmUrl);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const response = await fetch(vmUrl, { signal: controller.signal });
  clearTimeout(timeout);
    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('VM proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to VM' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
  const { endpoint, ...data } = body;

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint parameter' }, { status: 400 });
    }

  const ep = typeof endpoint === 'string' && endpoint.startsWith('/api/') ? endpoint.slice(4) : endpoint;
  const vmUrl = `${VM_BASE}${ep.startsWith('/') ? '' : '/'}${ep}`;
    console.log('Proxying POST to VM:', vmUrl, data);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const response = await fetch(vmUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const responseData = await response.json();

    return NextResponse.json(responseData, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('VM proxy POST error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to VM' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}