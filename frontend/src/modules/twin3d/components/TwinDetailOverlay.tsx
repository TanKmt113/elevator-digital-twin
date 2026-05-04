import React from 'react';
import type { ElevatorViewModel } from '../../../store/elevator-store';

export function TwinDetailOverlay({ elevator }: { elevator?: ElevatorViewModel }): React.JSX.Element | null {
  if (!elevator) {
    return null;
  }

  return (
    <aside className="ops-twin-overlay rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-sm text-slate-300 backdrop-blur">
      <h3 className="ops-item-title text-base font-semibold text-slate-100">{elevator.elevatorId}</h3>
      <p className="mt-2">Floor: {elevator.currentFloor}</p>
      <p>Status: <span className="capitalize text-slate-100">{elevator.status}</span></p>
      <p>Door: <span className="capitalize text-slate-100">{elevator.doorState}</span></p>
      <p>Health: <span className="capitalize text-slate-100">{elevator.healthState}</span></p>
      {elevator.stale ? <p className="mt-2 text-amber-100">Last accepted state is stale.</p> : null}
    </aside>
  );
}
