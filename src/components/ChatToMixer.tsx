"use client";

// minimal chat-to-mixer widget to hit vm ai route and play result
// all code comments are lowercase and end with no period

import { useMemo, useState } from "react";
import { aiRouteAndRun, AiRunResponse } from "@/lib/neom";

const DEFAULT_PROJECT = "demo1";
const DEFAULT_ORIGINAL = "/srv/neom/files/demo1/try1.wav";

export function ChatToMixer() {
  const [text, setText] = useState("add a punk guitar riff at 0.5s, -4dB");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [last, setLast] = useState<AiRunResponse | null>(null);
  const [history, setHistory] = useState<AiRunResponse[]>([]);

  const vmBase = process.env.NEXT_PUBLIC_NEOM_API_BASE || "";
  const envError = useMemo(() => {
    // provide clear ui error if missing
    if (!vmBase) return "NEXT_PUBLIC_NEOM_API_BASE is not set";
    return null;
  }, [vmBase]);

  const onSend = async () => {
    if (envError) {
      setError(envError);
      return;
    }
    if (!text.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const resp = await aiRouteAndRun({
        projectId: DEFAULT_PROJECT,
        originalPath: DEFAULT_ORIGINAL,
        text,
      });
      setLast(resp);
      setHistory((h) => [resp, ...h].slice(0, 5));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "unknown error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3 p-3 rounded-lg border border-slate-700 bg-slate-900">
      <div className="text-sm text-slate-300">AI Mixer</div>

      {envError && (
        <div className="text-sm text-red-400">
          Env error: {envError}
        </div>
      )}

      <div className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 rounded bg-slate-800 text-slate-100 border border-slate-700"
          placeholder='Describe your mix… e.g., "add a punk loop at 0.5s, -4dB"'
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={busy}
        />
        <button
          onClick={onSend}
          disabled={busy}
          className="px-3 py-2 rounded bg-emerald-600 text-white disabled:opacity-50"
        >
          {busy ? "Processing…" : "Send"}
        </button>
      </div>

      {error && <div className="text-sm text-red-400">Error: {error}</div>}

      {last && (
        <div className="space-y-2">
          <div className="text-sm text-slate-400">Latest result:</div>
          <audio controls src={`${vmBase}${last.modifiedUrl}`} className="w-full" />
          <div className="text-xs text-slate-500">
            <a
              href={`${vmBase}${last.manifestUrl}`}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              View manifest
            </a>{" "}
            • runId: {last.runId}
          </div>
        </div>
      )}

      {history.length > 1 && (
        <div className="space-y-1">
          <div className="text-sm text-slate-400">History:</div>
          <ul className="space-y-1">
            {history.slice(1).map((h) => (
              <li key={h.runId} className="flex items-center gap-2">
                <audio controls src={`${vmBase}${h.modifiedUrl}`} className="w-full" />
                <a
                  href={`${vmBase}${h.manifestUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs underline text-slate-400"
                >
                  manifest
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
