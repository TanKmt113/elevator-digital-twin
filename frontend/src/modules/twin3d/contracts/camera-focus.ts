import type { TwinSceneFocusMode } from '../../../store/elevator-store';
import type { TwinSceneAsset } from '../services/map-elevator-state-to-scene';

export interface TwinCameraAnchor {
  position: [number, number, number];
  target: [number, number, number];
}

export function deriveCameraAnchor(
  assets: TwinSceneAsset[],
  focusMode: TwinSceneFocusMode,
  selectedElevatorId?: string
): TwinCameraAnchor {
  if (focusMode === 'selected' && selectedElevatorId) {
    const selectedAsset = assets.find((asset) => asset.elevatorId === selectedElevatorId);
    if (selectedAsset) {
      return {
        position: [selectedAsset.worldPosition.x + 3.5, selectedAsset.worldPosition.y + 3.1, 7.3],
        target: [
          selectedAsset.worldPosition.x,
          selectedAsset.worldPosition.y + 0.5,
          selectedAsset.worldPosition.z
        ]
      };
    }
  }

  const maxY = assets.reduce((highest, asset) => Math.max(highest, asset.worldPosition.y), 0);
  const centerX =
    assets.length === 0
      ? 0
      : assets.reduce((sum, asset) => sum + asset.worldPosition.x, 0) / assets.length;

  return {
    position: [centerX + 6, Math.max(34, maxY * 1.05 + 14), 78],
    target: [centerX, Math.max(12, maxY * 0.38), -2.2]
  };
}
