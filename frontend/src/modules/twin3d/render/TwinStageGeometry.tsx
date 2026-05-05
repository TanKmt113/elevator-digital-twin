import React from 'react';
import { Text } from '@react-three/drei';

export function TwinStageGeometry({
  floorCount,
  shaftCount
}: {
  floorCount: number;
  shaftCount: number;
}): React.JSX.Element {
  const floors = Array.from({ length: floorCount }, (_, index) => index);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[Math.max(shaftCount * 1.8, 3), -0.95, -0.4]}>
        <planeGeometry args={[Math.max(shaftCount * 5, 14), Math.max(floorCount * 3, 18)]} />
        <meshStandardMaterial color="#081622" metalness={0.05} roughness={0.96} />
      </mesh>
      <mesh position={[Math.max(shaftCount * 1.8, 3), Math.max(floorCount * 1.5, 6), -1.4]}>
        <boxGeometry args={[Math.max(shaftCount * 5, 14), Math.max(floorCount * 3 + 1.5, 16), 0.08]} />
        <meshStandardMaterial color="#133446" opacity={0.85} transparent />
      </mesh>
      {floors.map((floor) => (
        <group key={`floor-${floor}`} position={[0, floor * 3, 0]}>
          <mesh position={[Math.max(shaftCount * 1.8, 3), -1.15, -0.72]}>
            <boxGeometry args={[Math.max(shaftCount * 4.4, 12), 0.06, 1.7]} />
            <meshStandardMaterial color={floor % 2 === 0 ? '#1c4356' : '#143446'} />
          </mesh>
          <Text
            color="#8ed7e8"
            fontSize={0.35}
            anchorX="right"
            anchorY="middle"
            position={[-0.85, -0.75, 0.25]}
          >
            {`F${floor + 1}`}
          </Text>
        </group>
      ))}
    </group>
  );
}
