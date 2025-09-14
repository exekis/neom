"use client";

import { useState } from "react";

interface SaveProjectsButtonProps {
  onSaved?: (payload: { id: number; currTime: string }) => void;
}

export function SaveProjectsButton({ onSaved }: SaveProjectsButtonProps) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onClick = async () => {
    try {
        setBusy(true);
        setMessage(null);

        const form = new FormData();
        form.append("id", "12345"); // example
        form.append("user_id", "anon");
        form.append("description", "Test project");

        const res = await fetch("/api/projects", { method: "POST", body: form });
        const json = await res.json();

        if (!res.ok || !json.success) {
            throw new Error(json.error || "save failed");
        }

        onSaved?.(json);
        setMessage("saved");
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "save failed";
        setMessage(msg);
    } finally {
        setBusy(false);
    }
};


  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm disabled:opacity-50"
        title="Save Projects"
      >
        {busy ? "Saving..." : "Save Projects"}
      </button>
      {message && <span className="text-xs text-slate-400">{message}</span>}
    </div>
  );
}
