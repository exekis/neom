"use client";

import { X } from "lucide-react";

interface HotkeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HotkeysModal({ isOpen, onClose }: HotkeysModalProps) {
  if (!isOpen) return null;

  const hotkeys = [
    { key: "Space", description: "Play from cursor position" },
    { key: "Enter", description: "Play/Pause from last position" },
    { key: "Escape", description: "Stop playback" },
    { key: "Home", description: "Skip to beginning" },
    { key: "End", description: "Skip to end" },
    { key: "R", description: "Toggle recording" },
    { key: "L", description: "Toggle loop mode" },
    { key: "Ctrl+Z", description: "Undo last action" },
    { key: "Ctrl+Y / Ctrl+Shift+Z", description: "Redo last action" },
    { key: "Ctrl+Q", description: "Add new track" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {hotkeys.map((hotkey, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-slate-300">{hotkey.description}</span>
                <div className="bg-slate-800 px-2 py-1 rounded border border-slate-600 font-mono text-sm text-slate-200">
                  {hotkey.key}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-400 text-center">
              Press <kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-300">Esc</kbd> or click outside to close
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}