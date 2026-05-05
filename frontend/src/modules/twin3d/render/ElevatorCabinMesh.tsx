import React from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import type { TwinSceneAsset } from '../services/map-elevator-state-to-scene';

const COLOR_MAP: Record<TwinSceneAsset['color'], string> = {
  green: '#4ade80',
  yellow: '#facc15',
  red: '#f87171',
  gray: '#94a3b8'
};

export function ElevatorCabinMesh({
  asset,
  onSelect
}: {
  asset: TwinSceneAsset;
  onSelect: (elevatorId: string) => void;
}): React.JSX.Element {
  const doorOffset = asset.doorOpenRatio * 0.28;
  const bodyColor = COLOR_MAP[asset.color];

  return (
    <group
      position={[asset.worldPosition.x, asset.worldPosition.y, asset.worldPosition.z]}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        onSelect(asset.elevatorId);
      }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.2, asset.cabinHeight, 1.2]} />
        <meshStandardMaterial color={bodyColor} metalness={0.24} roughness={0.48} />
      </mesh>
      <mesh position={[-0.23 - doorOffset, 0, 0.62]}>
        <boxGeometry args={[0.34, asset.cabinHeight * 0.9, 0.08]} />
        <meshStandardMaterial color="#d7eef7" />
      </mesh>
      <mesh position={[0.23 + doorOffset, 0, 0.62]}>
        <boxGeometry args={[0.34, asset.cabinHeight * 0.9, 0.08]} />
        <meshStandardMaterial color="#d7eef7" />
      </mesh>
      {asset.isSelected ? (
        <mesh position={[0, asset.cabinHeight * 0.72, 0]}>
          <sphereGeometry args={[0.22, 18, 18]} />
          <meshStandardMaterial emissive="#7dd3c7" color="#7dd3c7" emissiveIntensity={1.6} />
        </mesh>
      ) : null}
    </group>
  );
}
