import React from 'react';
import type { TwinSceneFocusMode } from '../../../store/elevator-store';

export function TwinControls({
  focusMode,
  canFocusSelected,
  onFocusOverview,
  onFocusSelected,
  onToggleFullscreen,
  isFullscreen
}: {
  focusMode: TwinSceneFocusMode;
  canFocusSelected: boolean;
  onFocusOverview: () => void;
  onFocusSelected: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}): React.JSX.Element {
  return (
    <div className="ops-toolbar flex flex-wrap gap-2">
      <button
        className={`ops-icon-button rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-100 ${focusMode === 'overview' ? 'is-active' : ''}`}
        title="Overview mode"
        type="button"
        onClick={onFocusOverview}
      >
        All
      </button>
      <button
        className={`ops-icon-button rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-100 ${focusMode === 'selected' ? 'is-active' : ''}`}
        title="Focus selected elevator"
        type="button"
        onClick={onFocusSelected}
        disabled={!canFocusSelected}
      >
        Focus
      </button>
      <button
        className="ops-icon-button rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-100"
        title={isFullscreen ? 'Exit full screen' : 'Open full screen'}
        type="button"
        onClick={onToggleFullscreen}
      >
        {isFullscreen ? 'Min' : 'Max'}
      </button>
    </div>
  );
}
