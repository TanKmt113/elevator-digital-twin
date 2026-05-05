import React from 'react';
import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import type { TwinSceneFocusMode } from '../../../store/elevator-store';
import { deriveCameraAnchor } from '../contracts/camera-focus';
import type { TwinSceneAsset } from '../services/map-elevator-state-to-scene';

export function TwinCameraController({
  assets,
  focusMode,
  selectedElevatorId,
  onTransitionStateChange
}: {
  assets: TwinSceneAsset[];
  focusMode: TwinSceneFocusMode;
  selectedElevatorId?: string;
  onTransitionStateChange?: (state: 'idle' | 'transitioning') => void;
}): React.JSX.Element {
  const { camera } = useThree();
  const anchor = React.useMemo(
    () => deriveCameraAnchor(assets, focusMode, selectedElevatorId),
    [assets, focusMode, selectedElevatorId]
  );
  const targetRef = React.useRef({
    x: anchor.target[0],
    y: anchor.target[1],
    z: anchor.target[2]
  });

  React.useEffect(() => {
    targetRef.current = {
      x: anchor.target[0],
      y: anchor.target[1],
      z: anchor.target[2]
    };
    onTransitionStateChange?.('transitioning');
  }, [anchor, onTransitionStateChange]);

  useFrame(() => {
    camera.position.x += (anchor.position[0] - camera.position.x) * 0.08;
    camera.position.y += (anchor.position[1] - camera.position.y) * 0.08;
    camera.position.z += (anchor.position[2] - camera.position.z) * 0.08;

    targetRef.current.x += (anchor.target[0] - targetRef.current.x) * 0.12;
    targetRef.current.y += (anchor.target[1] - targetRef.current.y) * 0.12;
    targetRef.current.z += (anchor.target[2] - targetRef.current.z) * 0.12;

    camera.lookAt(targetRef.current.x, targetRef.current.y, targetRef.current.z);

    const distance =
      Math.abs(camera.position.x - anchor.position[0]) +
      Math.abs(camera.position.y - anchor.position[1]) +
      Math.abs(camera.position.z - anchor.position[2]);

    if (distance < 0.12) {
      onTransitionStateChange?.('idle');
    }
  });

  return <OrbitControls enableDamping enablePan={focusMode === 'overview'} />;
}
