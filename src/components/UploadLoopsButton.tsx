"use client";

import { useRef, useState } from "react";

interface UploadLoopsButtonProps {
  onUploaded?: (payload: { id: number; url: string; filename: string }) => void;
}

export function UploadLoopsButton({ onUploaded }: UploadLoopsButtonProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onPick = () => inputRef.current?.click();

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      setMessage('please select an audio file');
      return;
    }

    try {
      setBusy(true);
      setMessage(null);
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/loops', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'upload failed');
      }
      onUploaded?.(json);
      setMessage('uploaded');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'upload failed';
      setMessage(msg);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={onPick}
        disabled={busy}
        className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-sm disabled:opacity-50"
        title="Upload Loops"
      >
        {busy ? 'Uploading…' : 'Upload Loops'}
      </button>
      <input ref={inputRef} type="file" accept="audio/*" onChange={onChange} className="hidden" />
      {message && <span className="text-xs text-slate-400">{message}</span>}
    </div>
  );
}
