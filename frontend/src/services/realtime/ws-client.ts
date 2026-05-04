type RealtimeListener = (payload: unknown) => void;

export class RealtimeClient {
  private readonly listeners = new Set<RealtimeListener>();

  onMessage(listener: RealtimeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(payload: unknown): void {
    this.listeners.forEach((listener) => listener(payload));
  }
}
