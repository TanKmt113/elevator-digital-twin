import React from 'react';
import type { ElevatorViewModel, TwinSceneFocusMode } from '../../../store/elevator-store';
import { useElevatorStore } from '../../../store/elevator-store';
import { useRealtimeStore } from '../../../store/realtime-store';
import { mapElevatorStateToScene } from '../services/map-elevator-state-to-scene';
import { measureTwinRenderFrame } from '../services/twin3d-performance';
import { useTwinSelection } from '../hooks/useTwinSelection';
import { TwinControls } from './TwinControls';
import { TwinDetailOverlay } from './TwinDetailOverlay';
import { TwinCanvasScene } from '../render/TwinCanvasScene';

interface DerivedTwinSceneState {
  assets: ReturnType<typeof mapElevatorStateToScene>[];
  visibleAssets: ReturnType<typeof mapElevatorStateToScene>[];
}

export function deriveTwinSceneState(
  elevators: ElevatorViewModel[],
  selectedElevatorId: string | undefined,
  sceneFocusMode: TwinSceneFocusMode
): DerivedTwinSceneState {
  const sortedElevators = [...elevators].sort((left, right) =>
    left.elevatorId.localeCompare(right.elevatorId)
  );
  const assets = sortedElevators.map((elevator, index) => {
    const mappedAsset = mapElevatorStateToScene(
      elevator,
      elevator.elevatorId === selectedElevatorId
    );

    return {
      ...mappedAsset,
      shaftIndex: index,
      x: index * 3.8,
      worldPosition: {
        x: index * 3.8,
        y: mappedAsset.worldPosition.y,
        z: mappedAsset.isSelected ? 0.35 : 0
      },
      shaftLabel: `Shaft ${index + 1}`
    };
  });
  const visibleAssets =
    sceneFocusMode === 'selected' && selectedElevatorId
      ? assets.filter((asset) => asset.elevatorId === selectedElevatorId)
      : assets;

  return {
    assets,
    visibleAssets
  };
}

export function TwinScene(): React.JSX.Element {
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const elevatorRecord = useElevatorStore((state) => state.elevators);
  const selection = useTwinSelection();
  const sceneRuntime = useRealtimeStore((state) => state.sceneRuntime);
  const projectionCount = useRealtimeStore((state) => state.projectionCount);
  const hasWebglSupport = useRealtimeStore((state) => state.hasWebglSupport);
  const webglMessage = useRealtimeStore((state) => state.webglMessage);
  const projectionFailures = useRealtimeStore((state) => state.projectionFailures);
  const elevators = React.useMemo(() => Object.values(elevatorRecord), [elevatorRecord]);
  const { assets, visibleAssets } = React.useMemo(
    () => deriveTwinSceneState(elevators, selection.selectedElevatorId, selection.sceneFocusMode),
    [elevators, selection.selectedElevatorId, selection.sceneFocusMode]
  );
  const selectedElevator = elevators.find(
    (elevator) => elevator.elevatorId === selection.selectedElevatorId
  );
  const performanceSample = measureTwinRenderFrame(
    Math.min(8 + visibleAssets.length * 2, 24),
    visibleAssets.length,
    hasWebglSupport
  );
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  React.useEffect(() => {
    const nextSupport = detectWebglSupport();
    const nextMessage = nextSupport
      ? undefined
      : 'WebGL support is missing or blocked in this browser/runtime.';
    useRealtimeStore.getState().setWebglCapability(nextSupport, nextMessage);
  }, []);

  React.useEffect(() => {
    const projectionFailuresCount = assets.filter(
      (asset) =>
        !Number.isFinite(asset.worldPosition.x) ||
        !Number.isFinite(asset.worldPosition.y) ||
        !Number.isFinite(asset.worldPosition.z)
    ).length;
    useRealtimeStore.getState().setProjectionFailures(projectionFailuresCount);
  }, [assets]);

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === sectionRef.current);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = React.useCallback(() => {
    const element = sectionRef.current;
    if (!element) {
      return;
    }

    if (document.fullscreenElement === element) {
      void document.exitFullscreen();
      return;
    }

    void element.requestFullscreen();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`ops-panel ops-twin-panel rounded-3xl border border-white/10 bg-slate-950/50 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] ${isFullscreen ? 'ops-twin-panel-fullscreen' : ''}`}
    >
      <div className="ops-panel-head mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="ops-label text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Spatial View
          </p>
          <h2 className="ops-panel-title text-xl font-semibold text-slate-100">Twin Scene</h2>
        </div>
        <TwinControls
          focusMode={selection.sceneFocusMode}
          canFocusSelected={Boolean(selection.selectedElevatorId)}
          onFocusOverview={selection.focusOverview}
          onFocusSelected={selection.focusSelected}
          onToggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
        />
      </div>
      <div className={`ops-twin-grid grid gap-3 ${isFullscreen ? 'ops-twin-grid-fullscreen' : 'lg:grid-cols-[minmax(0,1fr)_280px]'}`}>
        <div
          className={`ops-twin-stage grid min-h-56 gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 ${isFullscreen ? 'ops-twin-stage-fullscreen' : 'md:grid-cols-2 xl:grid-cols-3'}`}
          data-scene-runtime={sceneRuntime}
          data-focus-mode={selection.sceneFocusMode}
        >
          {visibleAssets.length === 0 ? (
            <article className="ops-empty-inline text-sm text-slate-400">
              {sceneRuntime === 'empty'
                ? 'No Twin assets are currently available for the active scope.'
                : sceneRuntime === 'unavailable'
                  ? 'True 3D rendering is unavailable in the current browser/runtime.'
                  : 'No elevator is currently available for the selected scene focus.'}
            </article>
          ) : (
            <TwinCanvasScene
              assets={visibleAssets}
              focusMode={selection.sceneFocusMode}
              selectedElevatorId={selection.selectedElevatorId}
              transitionState={selection.cameraTransitionState}
              hasWebglSupport={hasWebglSupport}
              onSelect={selection.selectElevator}
              onTransitionStateChange={selection.setCameraTransitionState}
            />
          )}
        </div>
        <TwinDetailOverlay
          elevator={selectedElevator ?? elevators[0]}
          sceneRuntime={sceneRuntime}
          focusMode={selection.sceneFocusMode}
          projectionCount={projectionCount || assets.length}
          performanceSample={performanceSample}
          webglMessage={webglMessage}
          projectionFailures={projectionFailures}
        />
      </div>
    </section>
  );
}

function detectWebglSupport(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}
