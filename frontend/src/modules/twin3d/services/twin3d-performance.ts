export interface TwinRenderSample {
  frameBudgetExceeded: boolean;
  renderTimeMs: number;
  projectionCount: number;
  density: 'light' | 'moderate' | 'dense';
  unsupportedReason?: string;
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
      projectionCount > 10 ? 'dense' : projectionCount > 4 ? 'moderate' : 'light',
    unsupportedReason: hasWebglSupport ? undefined : 'WebGL unavailable'
  };
}
