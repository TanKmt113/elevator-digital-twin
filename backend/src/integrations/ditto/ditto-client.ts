type DittoHandler = (payload: unknown) => void;

export class DittoClient {
  private readonly handlers = new Set<DittoHandler>();

  subscribe(handler: DittoHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  emit(payload: unknown): void {
    this.handlers.forEach((handler) => handler(payload));
  }
}
