export interface TwinRenderSample {
  frameBudgetExceeded: boolean;
  renderTimeMs: number;
  projectionCount: number;
  density: 'light' | 'moderate' | 'dense';
}

export function measureTwinRenderFrame(renderTimeMs: number, projectionCount = 0): TwinRenderSample {
  return {
    frameBudgetExceeded: renderTimeMs > 16,
    renderTimeMs,
    projectionCount,
    density:
      projectionCount > 10 ? 'dense' : projectionCount > 4 ? 'moderate' : 'light'
  };
}
