export function DAWHeader(props: any) {
  return (
    <div data-testid="DAWHeader" className="p-4 border-b border-slate-800 text-slate-300">
      <div className="text-lg">{props.projectName}</div>
      <button onClick={props.onQuickSave} className="mt-2 px-3 py-1 rounded bg-slate-700">Quick Save</button>
    </div>
  );
}
