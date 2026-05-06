import React from 'react';
import { Text } from '@react-three/drei';
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
  const shaftHeight = Math.max(floorCount * 3 + 0.4, 4);

  return (
    <group position={[asset.worldPosition.x, 0, 0]}>
      <mesh position={[0, shaftHeight / 2 - 1.5, -1.02]}>
        <boxGeometry args={[1.72, shaftHeight, 0.05]} />
        <meshStandardMaterial color="#3c7086" opacity={0.72} transparent />
      </mesh>
      <mesh position={[-0.88, shaftHeight / 2 - 1.5, -0.45]}>
        <boxGeometry args={[0.05, shaftHeight, 1.25]} />
        <meshStandardMaterial color="#4d7f95" opacity={0.82} transparent />
      </mesh>
      <mesh position={[0.88, shaftHeight / 2 - 1.5, -0.45]}>
        <boxGeometry args={[0.05, shaftHeight, 1.25]} />
        <meshStandardMaterial color="#4d7f95" opacity={0.82} transparent />
      </mesh>
      <mesh position={[0, shaftHeight - 2.2, -0.45]}>
        <boxGeometry args={[1.82, 0.06, 1.25]} />
        <meshStandardMaterial color="#24495b" />
      </mesh>
      <Text
        color="#c5edf7"
        fontSize={0.28}
        anchorX="center"
        anchorY="middle"
        position={[0, shaftHeight + 0.2, 0]}
      >
        {asset.shaftLabel}
      </Text>
      <Text
        color={asset.color === 'red' ? '#f9a8a8' : asset.color === 'yellow' ? '#fde68a' : '#9fe6ff'}
        fontSize={0.24}
        anchorX="center"
        anchorY="middle"
        position={[0, shaftHeight - 0.65, 0.45]}
      >
        {`${asset.visualStatus.toUpperCase()} • F${asset.floorPosition}`}
      </Text>
      <mesh position={[0, asset.worldPosition.y, -0.95]}>
        <boxGeometry args={[1.6, 0.03, 0.12]} />
        <meshStandardMaterial color="#7dd3c7" opacity={0.6} transparent />
      </mesh>
      <ElevatorCabinMesh asset={asset} onSelect={onSelect} />
    </group>
  );
}
