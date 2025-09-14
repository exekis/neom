export function DAWSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <aside data-testid="DAWSidebar" className="w-72 bg-slate-900 border-l border-slate-800 p-4 text-slate-300">
      <button onClick={onClose} className="px-3 py-1 rounded bg-slate-700">Close</button>
    </aside>
  );
}
