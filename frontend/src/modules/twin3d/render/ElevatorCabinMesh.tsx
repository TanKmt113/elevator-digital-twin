import React from 'react';
import { Text } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import type { TwinSceneAsset } from '../services/map-elevator-state-to-scene';

const COLOR_MAP: Record<TwinSceneAsset['color'], string> = {
  green: '#4ade80',
  yellow: '#facc15',
  red: '#f87171',
  gray: '#94a3b8'
};

export function getElevatorCabinVisualState(asset: TwinSceneAsset): {
  doorOffset: number;
  bodyColor: string;
  faultEmissive: string;
  doorPercentLabel: string;
} {
  return {
    doorOffset: asset.doorOpenRatio * 0.28,
    bodyColor: COLOR_MAP[asset.color],
    faultEmissive:
      asset.faultTone === 'critical' ? '#ef4444' : asset.faultTone === 'warning' ? '#facc15' : '#000000',
    doorPercentLabel: `F${asset.floorPosition} ${Math.round(asset.doorOpenRatio * 100)}%`
  };
}

export function ElevatorCabinMesh({
  asset,
  onSelect
}: {
  asset: TwinSceneAsset;
  onSelect: (elevatorId: string) => void;
}): React.JSX.Element {
  const { doorOffset, bodyColor, faultEmissive, doorPercentLabel } = getElevatorCabinVisualState(asset);

  return (
    <group
      position={[0, asset.worldPosition.y, asset.worldPosition.z]}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        onSelect(asset.elevatorId);
      }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.14, asset.cabinHeight, 1.08]} />
        <meshStandardMaterial
          color={bodyColor}
          emissive={faultEmissive}
          emissiveIntensity={asset.faultTone === 'none' ? 0 : 0.55}
          metalness={0.24}
          roughness={0.48}
        />
      </mesh>
      <mesh position={[0, -asset.cabinHeight * 0.54, 0.64]}>
        <boxGeometry args={[Math.max(0.12, asset.doorOpenRatio * 1.05), 0.06, 0.08]} />
        <meshStandardMaterial color={asset.doorOpenRatio > 0.8 ? '#67e8f9' : '#facc15'} />
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
      <Text
        color={asset.loadTone === 'critical' ? '#fecaca' : asset.loadTone === 'warning' ? '#fde68a' : '#f4fbfa'}
        fontSize={0.2}
        anchorX="center"
        anchorY="middle"
        position={[0, asset.cabinHeight * 0.98, 0.72]}
      >
        {doorPercentLabel}
      </Text>
    </group>
  );
}
