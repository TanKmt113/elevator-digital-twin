import React from 'react';
import { Canvas } from '@react-three/fiber';
import type {
  TwinCameraTransitionState,
  TwinSceneFocusMode
} from '../../../store/elevator-store';
import type { TwinSceneAsset } from '../services/map-elevator-state-to-scene';
import { ElevatorShaftGroup } from './ElevatorShaftGroup';
import { TwinCameraController } from './TwinCameraController';
import { TwinLightingRig } from './TwinLightingRig';
import { TwinStageGeometry } from './TwinStageGeometry';

export function TwinCanvasScene({
  assets,
  focusMode,
  selectedElevatorId,
  transitionState,
  hasWebglSupport,
  onSelect,
  onTransitionStateChange
}: {
  assets: TwinSceneAsset[];
  focusMode: TwinSceneFocusMode;
  selectedElevatorId?: string;
  transitionState: TwinCameraTransitionState;
  hasWebglSupport: boolean;
  onSelect: (elevatorId: string) => void;
  onTransitionStateChange?: (state: 'idle' | 'transitioning') => void;
}): React.JSX.Element {
  if (typeof window === 'undefined' || !hasWebglSupport) {
    return (
      <div className="ops-twin-render-fallback">
        {assets.map((asset) => (
          <article
            className={`ops-twin-fallback-card ${asset.isSelected ? 'is-selected' : ''}`}
            key={asset.elevatorId}
          >
            <strong>{asset.elevatorId}</strong>
            <span>{asset.shaftLabel}</span>
            <span>Floor {asset.floorPosition}</span>
            <span>{asset.visualStatus}</span>
          </article>
        ))}
      </div>
    );
  }

  const shaftCount = Math.max(...assets.map((asset) => asset.shaftIndex + 1), 1);
  const floorCount = Math.max(...assets.map((asset) => asset.floorPosition + 1), 4);

  return (
    <div className="ops-twin-canvas-shell">
      <Canvas camera={{ fov: 40, position: [12, 12, 12] }} shadows>
        <color attach="background" args={['#071018']} />
        <TwinLightingRig />
        <TwinStageGeometry floorCount={floorCount} shaftCount={shaftCount} />
        {assets.map((asset) => (
          <ElevatorShaftGroup
            key={asset.elevatorId}
            asset={asset}
            floorCount={floorCount}
            onSelect={onSelect}
          />
        ))}
        <TwinCameraController
          assets={assets}
          focusMode={focusMode}
          selectedElevatorId={selectedElevatorId}
          transitionState={transitionState}
          onTransitionStateChange={onTransitionStateChange}
        />
      </Canvas>
    </div>
  );
}
