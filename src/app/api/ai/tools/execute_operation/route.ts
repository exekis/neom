import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
const VM_BASE = process.env.NEOM_API_BASE || 'http://20.161.72.50';

type Operation =
  | { op: 'fade'; startSec: number; endSec: number; shape?: 'linear' | 'exp' }
  | { op: 'gain'; db: number }
  | { op: 'reverb'; preset: 'plate' | 'room' | 'hall' }
  | { op: 'normalize'; targetLufs: number }
  | { op: 'add_loop'; style: string; region?: { startSec: number; endSec: number }; gainDb?: number };

type ExecuteOperationRequest = {
  projectId: string;
  originalPath: string;
  operation: Operation;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<ExecuteOperationRequest>;
    const projectId = String(body.projectId || '').trim();
    const originalPath = String(body.originalPath || '').trim();
    const operation = body.operation;

    if (!projectId || !originalPath || !operation) {
      return NextResponse.json({ success: false, error: 'missing required fields' }, { status: 400 });
    }

    // Validate operation based on CLAUDE.md specs
    const validatedOp = validateOperation(operation);
    if (!validatedOp.valid) {
      return NextResponse.json({ success: false, error: validatedOp.error }, { status: 400 });
    }

    // For now, the VM doesn't have a general operations endpoint
    // We'll demonstrate the DSL parsing and provide feedback about what would be executed

    // For loop operations, we could potentially use run_direct when it's available
    if (operation.op === 'add_loop') {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const res = await fetch(`${VM_BASE}/run_direct`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            projectId,
            originalPath,
            loopFileName: `${operation.style}_loop.wav`, // Simplified for demo
            startSec: operation.region?.startSec || 0,
            gainDb: operation.gainDb || -6,
            outName: 'modified.wav'
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (res.ok) {
          const vmJson = await res.json();
          return NextResponse.json({ success: true, vm: vmJson });
        }
      } catch (error) {
        console.error('VM run_direct error:', error);
      }
    }

    // For other operations or when VM endpoints aren't available, return parsed DSL with status
    return NextResponse.json({
      success: true,
      vm: {
        status: 'DSL_PARSED',
        operation: operation,
        message: `Operation parsed successfully: ${operation.op}. VM execution endpoints not yet available.`,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Request parsing error:', error);
    return NextResponse.json({ success: false, error: 'bad request' }, { status: 400 });
  }
}

function validateOperation(operation: unknown): { valid: boolean; error?: string } {
  if (!operation || typeof operation !== 'object') {
    return { valid: false, error: 'invalid operation structure' };
  }
  const opObj = operation as Record<string, unknown>;
  if (typeof opObj.op !== 'string') {
    return { valid: false, error: 'invalid operation structure' };
  }

  switch (opObj.op) {
    case 'fade':
      if (typeof opObj.startSec !== 'number' || typeof opObj.endSec !== 'number') {
        return { valid: false, error: 'fade requires startSec and endSec numbers' };
      }
      if ((opObj.startSec as number) < 0 || (opObj.startSec as number) >= (opObj.endSec as number)) {
        return { valid: false, error: 'fade requires 0 ≤ startSec < endSec' };
      }
      break;

    case 'gain':
      if (typeof opObj.db !== 'number') {
        return { valid: false, error: 'gain requires db number' };
      }
      if ((opObj.db as number) < -24 || (opObj.db as number) > 24) {
        return { valid: false, error: 'gain db must be between -24 and 24' };
      }
      break;

    case 'reverb':
      if (!opObj.preset || typeof opObj.preset !== 'string' || !['plate', 'room', 'hall'].includes(opObj.preset)) {
        return { valid: false, error: 'reverb requires preset: plate, room, or hall' };
      }
      break;

    case 'normalize':
      if (typeof opObj.targetLufs !== 'number') {
        return { valid: false, error: 'normalize requires targetLufs number' };
      }
      if ((opObj.targetLufs as number) < -23 || (opObj.targetLufs as number) > -10) {
        return { valid: false, error: 'normalize targetLufs must be between -23 and -10' };
      }
      break;

    case 'add_loop':
      if (!opObj.style || typeof opObj.style !== 'string') {
        return { valid: false, error: 'add_loop requires style string' };
      }
      if (typeof opObj.gainDb !== 'undefined') {
        const g = Number(opObj.gainDb);
        if (Number.isNaN(g) || g < -60 || g > 12) {
          return { valid: false, error: 'add_loop gainDb must be between -60 and 12' };
        }
      }
      break;

    default:
      return { valid: false, error: `unsupported operation: ${String(opObj.op)}` };
  }

  return { valid: true };
}