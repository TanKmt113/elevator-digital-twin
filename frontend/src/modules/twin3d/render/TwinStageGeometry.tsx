import React from 'react';

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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[Math.max(shaftCount, 1), -0.8, 0]}>
        <planeGeometry args={[Math.max(shaftCount * 4, 10), Math.max(floorCount * 3, 16)]} />
        <meshStandardMaterial color="#102733" metalness={0.05} roughness={0.9} />
      </mesh>
      {floors.map((floor) => (
        <group key={`floor-${floor}`} position={[0, floor * 3, 0]}>
          <mesh position={[Math.max(shaftCount, 1), -1.1, 0]}>
            <boxGeometry args={[Math.max(shaftCount * 4, 10), 0.08, 4.6]} />
            <meshStandardMaterial color={floor % 2 === 0 ? '#173748' : '#0f2b38'} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
