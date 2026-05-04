import type { NormalizedEvent } from './event-normalizer.js';

export class EventRouter {
  private readonly seen = new Set<string>();

  route<T>(event: NormalizedEvent<T>): NormalizedEvent<T> | null {
    if (this.seen.has(event.eventId)) {
      return null;
    }
    this.seen.add(event.eventId);
    return event;
  }
}
