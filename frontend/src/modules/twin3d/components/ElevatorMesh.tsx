import React from 'react';
import type { TwinSceneAsset } from '../services/map-elevator-state-to-scene';

export function ElevatorMesh({ asset, onSelect }: { asset: TwinSceneAsset; onSelect: (elevatorId: string) => void }): React.JSX.Element {
  return (
    <button
      type="button"
      className={`ops-twin-car rounded-lg border px-3 py-3 text-left text-sm ${
        asset.isSelected ? 'border-cyan-300/60 bg-cyan-300/10' : 'border-white/10 bg-white/[0.03]'
      }`}
      onClick={() => onSelect(asset.elevatorId)}
      data-elevator-id={asset.elevatorId}
      data-visual-status={asset.visualStatus}
    >
      <div className="flex items-center justify-between gap-3">
        <strong className="text-slate-100">{asset.elevatorId}</strong>
        <span className={`ops-scene-tone ops-scene-tone-${asset.color}`}>{asset.visualStatus}</span>
      </div>
      <div className="mt-2 grid gap-1 text-xs text-slate-300">
        <span>Floor {asset.floorPosition}</span>
        <span>Direction {asset.movementDirection}</span>
        <span>Door {asset.doorVisualState}</span>
        <span>Shaft {asset.shaftIndex + 1}</span>
      </div>
      {asset.isStale ? <p className="mt-2 text-xs text-amber-100">Last accepted state only</p> : null}
    </button>
  );
}
