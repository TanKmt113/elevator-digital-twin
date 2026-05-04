export function measureTwinRenderFrame(renderTimeMs: number) {
  return {
    frameBudgetExceeded: renderTimeMs > 16,
    renderTimeMs
  };
}
