export function SimpleTimelineUI({ duration }: { duration: number }) {
  return (
    <div data-testid="SimpleTimelineUI" className="w-full h-24 bg-slate-800 rounded-xl border border-slate-700/50 flex items-center justify-center text-slate-300">
      Timeline: {duration.toFixed(1)}s
    </div>
  );
}
