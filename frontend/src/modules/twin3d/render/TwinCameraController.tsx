import React from 'react';
import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type {
  TwinCameraTransitionState,
  TwinSceneFocusMode
} from '../../../store/elevator-store';
import { deriveCameraAnchor } from '../contracts/camera-focus';
import type { TwinSceneAsset } from '../services/map-elevator-state-to-scene';

export function TwinCameraController({
  assets,
  focusMode,
  selectedElevatorId,
  transitionState,
  onTransitionStateChange
}: {
  assets: TwinSceneAsset[];
  focusMode: TwinSceneFocusMode;
  selectedElevatorId?: string;
  transitionState: TwinCameraTransitionState;
  onTransitionStateChange?: (state: 'idle' | 'transitioning') => void;
}): React.JSX.Element {
  const { camera } = useThree();
  const controlsRef = React.useRef<OrbitControlsImpl | null>(null);
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
    if (transitionState !== 'transitioning') {
      controlsRef.current?.update();
      return;
    }

    camera.position.x += (anchor.position[0] - camera.position.x) * 0.08;
    camera.position.y += (anchor.position[1] - camera.position.y) * 0.08;
    camera.position.z += (anchor.position[2] - camera.position.z) * 0.08;

    targetRef.current.x += (anchor.target[0] - targetRef.current.x) * 0.12;
    targetRef.current.y += (anchor.target[1] - targetRef.current.y) * 0.12;
    targetRef.current.z += (anchor.target[2] - targetRef.current.z) * 0.12;

    controlsRef.current?.target.set(
      targetRef.current.x,
      targetRef.current.y,
      targetRef.current.z
    );
    controlsRef.current?.update();
    camera.lookAt(targetRef.current.x, targetRef.current.y, targetRef.current.z);

    const distance =
      Math.abs(camera.position.x - anchor.position[0]) +
      Math.abs(camera.position.y - anchor.position[1]) +
      Math.abs(camera.position.z - anchor.position[2]);

    if (distance < 0.12) {
      onTransitionStateChange?.('idle');
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      enablePan
      minDistance={4}
      maxDistance={36}
      maxPolarAngle={Math.PI / 2.05}
    />
  );
}
