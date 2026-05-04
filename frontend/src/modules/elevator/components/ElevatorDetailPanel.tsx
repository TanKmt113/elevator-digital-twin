import React from 'react';
import type { ElevatorViewModel } from '../../../store/elevator-store';
import { ElevatorCommandPanel } from './ElevatorCommandPanel';
import { ElevatorHistoryPanel } from './ElevatorHistoryPanel';

export function ElevatorDetailPanel({ elevator }: { elevator: ElevatorViewModel }): React.JSX.Element {
  return (
    <aside className="ops-panel rounded-3xl border border-white/10 bg-slate-950/50 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
      <p className="ops-label text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
        Selected Asset
      </p>
      <h2 className="ops-panel-title mt-1 text-2xl font-semibold text-slate-100">{elevator.elevatorId}</h2>
      <div className="ops-detail-grid mt-4 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
        <p>Status: <span className="font-medium capitalize text-slate-100">{elevator.status}</span></p>
        <p>Load: <span className="font-medium text-slate-100">{elevator.loadPercentage ?? 'n/a'}</span></p>
        <p>Health: <span className="font-medium capitalize text-slate-100">{elevator.healthState}</span></p>
      </div>
      <div className="ops-control-stack mt-4 grid gap-4">
        <ElevatorCommandPanel elevatorId={elevator.elevatorId} />
        <ElevatorHistoryPanel elevatorId={elevator.elevatorId} />
      </div>
    </aside>
  );
}
