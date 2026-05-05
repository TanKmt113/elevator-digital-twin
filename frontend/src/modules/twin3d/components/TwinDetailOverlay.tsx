import React from 'react';
import type { ElevatorViewModel } from '../../../store/elevator-store';
import type { TwinSceneRuntimeState } from '../../../store/realtime-store';
import type { TwinSceneFocusMode } from '../../../store/elevator-store';
import type { TwinRenderSample } from '../services/twin3d-performance';

export function TwinDetailOverlay({
  elevator,
  sceneRuntime = 'loading',
  focusMode = 'overview',
  projectionCount = 0,
  performanceSample
}: {
  elevator?: ElevatorViewModel;
  sceneRuntime?: TwinSceneRuntimeState;
  focusMode?: TwinSceneFocusMode;
  projectionCount?: number;
  performanceSample?: TwinRenderSample;
}): React.JSX.Element {
  const runtimeCopy = getRuntimeCopy(sceneRuntime);

  return (
    <aside className="ops-twin-overlay rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-sm text-slate-300 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="ops-label">Scene Runtime</p>
          <h3 className="ops-item-title text-base font-semibold text-slate-100">{runtimeCopy.title}</h3>
        </div>
        <span className="ops-count-chip">{projectionCount} projections</span>
      </div>
      <p className="mt-2 text-sm text-slate-300">{runtimeCopy.message}</p>
      <div className="mt-4 grid gap-2 text-xs text-slate-400">
        <p>Focus mode: <span className="capitalize text-slate-100">{focusMode}</span></p>
        {performanceSample ? (
          <p>
            Scene load: <span className="capitalize text-slate-100">{performanceSample.density}</span> ({performanceSample.renderTimeMs}ms)
          </p>
        ) : null}
      </div>
      {elevator ? (
        <div className="ops-twin-overlay-stack mt-4 grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <h4 className="text-base font-semibold text-slate-100">{elevator.elevatorId}</h4>
          <p>Floor: {elevator.currentFloor}</p>
          <p>Status: <span className="capitalize text-slate-100">{elevator.status}</span></p>
          <p>Door: <span className="capitalize text-slate-100">{elevator.doorState}</span></p>
          <p>Health: <span className="capitalize text-slate-100">{elevator.healthState}</span></p>
          {elevator.stale ? <p className="text-amber-100">Last accepted state is stale.</p> : null}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-white/10 px-3 py-4 text-slate-400">
          No selected elevator is currently in focus.
        </div>
      )}
    </aside>
  );
}

function getRuntimeCopy(sceneRuntime: TwinSceneRuntimeState): { title: string; message: string } {
  if (sceneRuntime === 'ready') {
    return {
      title: 'Scene is synchronized',
      message: 'Building-wide projections are aligned with the latest accepted dashboard state.'
    };
  }

  if (sceneRuntime === 'empty') {
    return {
      title: 'Scene scope is empty',
      message: 'No valid elevator projections are currently available for the active building.'
    };
  }

  if (sceneRuntime === 'stale') {
    return {
      title: 'Scene is stale',
      message: 'The scene is preserving the last accepted elevator positions while live updates recover.'
    };
  }

  if (sceneRuntime === 'degraded') {
    return {
      title: 'Scene is degraded',
      message: 'At least part of the scene is unreliable, incomplete, or behind the current backend state.'
    };
  }

  return {
    title: 'Scene is loading',
    message: 'Twin projections are being prepared for the active building scope.'
  };
}
