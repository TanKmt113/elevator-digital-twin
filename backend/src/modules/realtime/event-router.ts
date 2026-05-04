import type { NormalizedEvent } from './event-normalizer.js';

export class EventRouter {
  private readonly seen = new Set<string>();
  private readonly latestAcceptedAt = new Map<string, number>();

  route<T>(event: NormalizedEvent<T>): NormalizedEvent<T> | null {
    if (this.seen.has(event.eventId)) {
      return null;
    }

    const subjectId = this.getSubjectId(event.payload);
    const occurredAt = Date.parse(event.occurredAt);
    if (
      subjectId &&
      Number.isFinite(occurredAt) &&
      this.latestAcceptedAt.has(subjectId) &&
      occurredAt < (this.latestAcceptedAt.get(subjectId) ?? 0)
    ) {
      return null;
    }

    this.seen.add(event.eventId);
    if (subjectId && Number.isFinite(occurredAt)) {
      this.latestAcceptedAt.set(subjectId, occurredAt);
    }
    return event;
  }

  private getSubjectId(payload: unknown): string | undefined {
    if (!payload || typeof payload !== 'object') {
      return undefined;
    }

    const subjectId = (payload as Record<string, unknown>).elevatorId;
    return typeof subjectId === 'string' ? subjectId : undefined;
  }
}
