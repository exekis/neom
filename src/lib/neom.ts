// simple client for vm ai routing
// all code comments are lowercase and end with no period

export type AiRunResponse = {
  projectId: string;
  modifiedUrl: string;
  manifestUrl: string;
  runId: string;
  outName: string;
};

export async function aiRouteAndRun(args: {
  projectId: string;
  originalPath: string;
  text: string;
}): Promise<AiRunResponse> {
  // read base from public env var so next.js exposes it to the client
  const base = process.env.NEXT_PUBLIC_NEOM_API_BASE;
  if (!base) {
    throw new Error('NEXT_PUBLIC_NEOM_API_BASE is not set');
  }

  const res = await fetch(`${base}/api/ai/route_and_run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });

  if (!res.ok) {
    // try to surface body text for easier debugging
    let msg = '';
    try {
      msg = await res.text();
    } catch {
      // ignore body read error
    }
    throw new Error(`/api/ai/route_and_run failed: ${res.status} ${msg}`.trim());
  }

  // validate minimal shape
  const data = (await res.json()) as AiRunResponse;
  if (!data || !data.modifiedUrl || !data.manifestUrl) {
    throw new Error('invalid response from ai route');
  }
  return data;
}
