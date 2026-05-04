import React from 'react';
import type { TwinSceneAsset } from '../services/map-elevator-state-to-scene';

export function ElevatorMesh({ asset, onSelect }: { asset: TwinSceneAsset; onSelect: (elevatorId: string) => void }): React.JSX.Element {
  return (
    <button type="button" onClick={() => onSelect(asset.elevatorId)}>
      {asset.elevatorId} | y={asset.y} | {asset.color} {asset.highlighted ? '(selected)' : ''}
    </button>
  );
}
