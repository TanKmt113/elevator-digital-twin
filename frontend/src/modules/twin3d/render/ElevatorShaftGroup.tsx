import React from 'react';
import type { TwinSceneAsset } from '../services/map-elevator-state-to-scene';
import { ElevatorCabinMesh } from './ElevatorCabinMesh';

export function ElevatorShaftGroup({
  asset,
  floorCount,
  onSelect
}: {
  asset: TwinSceneAsset;
  floorCount: number;
  onSelect: (elevatorId: string) => void;
}): React.JSX.Element {
  return (
    <group position={[asset.worldPosition.x, 0, 0]}>
      <mesh position={[0, (floorCount * 3) / 2 - 1.5, 0]} receiveShadow>
        <boxGeometry args={[1.8, Math.max(floorCount * 3 + 0.4, 4), 1.8]} />
        <meshStandardMaterial color="#183543" opacity={0.22} transparent />
      </mesh>
      <mesh position={[0, (floorCount * 3) / 2 - 1.5, -0.72]}>
        <boxGeometry args={[1.5, Math.max(floorCount * 3, 4), 0.08]} />
        <meshStandardMaterial color="#345868" />
      </mesh>
      <ElevatorCabinMesh asset={asset} onSelect={onSelect} />
    </group>
  );
}
