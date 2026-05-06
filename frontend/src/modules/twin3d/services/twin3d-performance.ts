/** Aligns with `measureTwinRenderFrame` density tiers (many L72 cabins in overview). */
export const DENSE_PROJECTION_THRESHOLD = 10;

export interface TwinRenderSample {
  frameBudgetExceeded: boolean;
  renderTimeMs: number;
  projectionCount: number;
  density: 'light' | 'moderate' | 'dense';
  unsupportedReason?: string;
}

export interface TwinPosition {
  x: number;
  y: number;
  z: number;
}

export function measureTwinRenderFrame(
  renderTimeMs: number,
  projectionCount = 0,
  hasWebglSupport = true
): TwinRenderSample {
  return {
    frameBudgetExceeded: renderTimeMs > 16,
    renderTimeMs,
    projectionCount,
    density:
      projectionCount > DENSE_PROJECTION_THRESHOLD
        ? 'dense'
        : projectionCount > 4
          ? 'moderate'
          : 'light',
    unsupportedReason: hasWebglSupport ? undefined : 'WebGL unavailable'
  };
}

export function interpolateTwinPosition(
  from: TwinPosition,
  to: TwinPosition,
  progress: number
): TwinPosition {
  const clampedProgress = Math.min(1, Math.max(0, progress));

  return {
    x: interpolateAxis(from.x, to.x, clampedProgress),
    y: interpolateAxis(from.y, to.y, clampedProgress),
    z: interpolateAxis(from.z, to.z, clampedProgress)
  };
}

export interface TwinScenePerformanceEstimateInput {
  /** Cabins currently rendered (visible assets). */
  visibleProjectionCount: number;
  /** History playback swaps one elevator projection from live telemetry. */
  isPlayback: boolean;
}

/**
 * Heuristic render cost for dashboard telemetry (not GPU timing). Playback + many cabins
 * raises the estimate because scrubbing drives frequent React↔R3F reconciliation on L72 decks.
 */
export function estimateTwinSceneRenderTimeMs(input: TwinScenePerformanceEstimateInput): number {
  const { visibleProjectionCount, isPlayback } = input;
  const base = 8 + visibleProjectionCount * 2;
  const playbackMargin =
    isPlayback && visibleProjectionCount >= 6
      ? Math.min(14, Math.round(visibleProjectionCount * 0.6))
      : 0;
  return Math.min(base + playbackMargin, 34);
}

/**
 * Caps pixel ratio during dense overview playback so L72 replay stays within GPU budget.
 */
export function resolveTwinCanvasDpr(
  visibleProjectionCount: number,
  isPlayback: boolean
): number {
  if (typeof window === 'undefined' || !Number.isFinite(window.devicePixelRatio)) {
    return 1;
  }
  const device = window.devicePixelRatio;
  if (isPlayback && visibleProjectionCount >= 8) {
    return 1;
  }
  if (visibleProjectionCount > DENSE_PROJECTION_THRESHOLD) {
    return Math.min(1.25, device);
  }
  return Math.min(2, device);
}

function interpolateAxis(from: number, to: number, progress: number): number {
  if (!Number.isFinite(from) || !Number.isFinite(to)) {
    return Number.isFinite(to) ? to : 0;
  }

  return from + (to - from) * progress;
}
