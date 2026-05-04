export function createTraceContext(correlationId: string): Record<string, string> {
  return { correlationId };
}
