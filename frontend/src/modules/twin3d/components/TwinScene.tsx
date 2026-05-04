import React from 'react';
import { useElevatorStore } from '../../../store/elevator-store';
import { mapElevatorStateToScene } from '../services/map-elevator-state-to-scene';
import { useTwinSelection } from '../hooks/useTwinSelection';
import { ElevatorMesh } from './ElevatorMesh';
import { TwinControls } from './TwinControls';
import { TwinDetailOverlay } from './TwinDetailOverlay';

export function TwinScene(): React.JSX.Element {
  const elevators = Object.values(useElevatorStore((state) => state.elevators));
  const selection = useTwinSelection();
  const selectedElevator = elevators.find(
    (elevator) => elevator.elevatorId === selection.selectedElevatorId
  );

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/50 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Spatial View
          </p>
          <h2 className="text-xl font-semibold text-slate-100">Twin Scene</h2>
        </div>
        <TwinControls />
      </div>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid min-h-56 gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 md:grid-cols-2 xl:grid-cols-3">
          {elevators.length === 0 ? (
            <article className="text-sm text-slate-400">No Twin assets are currently available for the active scope.</article>
          ) : null}
          {elevators.map((elevator) => (
            <ElevatorMesh
              key={elevator.elevatorId}
              asset={mapElevatorStateToScene(
                elevator,
                elevator.elevatorId === selection.selectedElevatorId
              )}
              onSelect={selection.selectElevator}
            />
          ))}
        </div>
        <TwinDetailOverlay elevator={selectedElevator ?? elevators[0]} />
      </div>
    </section>
  );
}
