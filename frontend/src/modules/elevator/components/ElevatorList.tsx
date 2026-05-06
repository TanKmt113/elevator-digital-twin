import React from 'react';
import { useElevatorStore } from '../../../store/elevator-store';
import { ElevatorStatusBadge } from './ElevatorStatusBadge';

export function ElevatorList(): React.JSX.Element {
  const elevators = Object.values(useElevatorStore((state) => state.elevators));
  const selectedElevatorId = useElevatorStore((state) => state.selectedElevatorId);
  const selectElevator = useElevatorStore((state) => state.selectElevator);

  return (
    <section className="ops-panel rounded-3xl border border-white/10 bg-slate-950/50 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
      <div className="ops-panel-head mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="ops-label text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Fleet Overview
          </p>
          <h2 className="ops-panel-title text-xl font-semibold text-slate-100">Elevator List</h2>
        </div>
        <span className="ops-count-chip rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
          {elevators.length} tracked
        </span>
      </div>
      <div className="ops-list grid gap-3">
        {elevators.length === 0 ? (
          <article className="ops-empty rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-slate-400">
            No elevator state has been loaded for the active scope.
          </article>
        ) : null}
        {elevators.map((elevator) => (
          <button
            type="button"
            key={elevator.elevatorId}
            onClick={() => selectElevator(elevator.elevatorId, 'list', elevator.buildingId)}
            className={`ops-list-item grid gap-3 rounded-2xl border px-4 py-4 text-left md:grid-cols-[minmax(0,1fr)_auto] ${
              selectedElevatorId === elevator.elevatorId
                ? 'border-cyan-300/50 bg-cyan-300/10'
                : 'border-white/10 bg-white/[0.03]'
            }`}
          >
            <div className="grid gap-2">
              <div className="flex items-center gap-3">
                <strong className="ops-item-title text-base font-semibold text-slate-100">{elevator.elevatorId}</strong>
                <ElevatorStatusBadge status={elevator.status} stale={elevator.stale} />
              </div>
              <div className="ops-field-grid grid gap-1 text-sm text-slate-300 sm:grid-cols-3">
                <p>Floor: {elevator.currentFloor}</p>
                <p>Direction: {elevator.direction}</p>
                <p>Door: {elevator.doorState}</p>
              </div>
            </div>
            <div className="ops-health text-right text-sm text-slate-400">
              <p>Health</p>
              <p className="font-medium capitalize text-slate-200">{elevator.healthState}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
