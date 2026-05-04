import React from 'react';

export function TwinControls(): React.JSX.Element {
  return (
    <div className="ops-toolbar flex flex-wrap gap-2">
      <button className="ops-icon-button rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-100" title="Zoom in" type="button">+</button>
      <button className="ops-icon-button rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-100" title="Zoom out" type="button">-</button>
      <button className="ops-icon-button rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-100" title="Reset view" type="button">R</button>
    </div>
  );
}
