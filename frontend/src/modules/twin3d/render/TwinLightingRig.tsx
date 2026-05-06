import React from 'react';

export function TwinLightingRig(): React.JSX.Element {
  return (
    <>
      <ambientLight intensity={1.6} />
      <directionalLight castShadow intensity={2.2} position={[14, 20, 10]} />
      <pointLight intensity={1.2} position={[0, 8, 10]} color="#9fe6ff" />
    </>
  );
}
