import React from 'react';
import type { TwinSceneAsset } from '../services/map-elevator-state-to-scene';

export function ElevatorMesh({ asset, onSelect }: { asset: TwinSceneAsset; onSelect: (elevatorId: string) => void }): React.JSX.Element {
  return (
    <button
      type="button"
      className={`rounded-lg border px-3 py-2 text-left text-sm ${
        asset.isSelected ? 'border-cyan-300/60 bg-cyan-300/10' : 'border-white/10 bg-white/[0.03]'
      }`}
      onClick={() => onSelect(asset.elevatorId)}
    >
      {asset.elevatorId} | floor={asset.floorPosition} | {asset.movementDirection} | {asset.doorVisualState} | {asset.color}{' '}
      {asset.isStale ? '(stale)' : ''}
    </button>
  );
}
