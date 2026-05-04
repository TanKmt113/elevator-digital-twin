import React from 'react';

export function TwinControls(): React.JSX.Element {
  return (
    <div className="flex flex-wrap gap-2">
      <button className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-100" type="button">Zoom In</button>
      <button className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-100" type="button">Zoom Out</button>
      <button className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-100" type="button">Reset View</button>
    </div>
  );
}
