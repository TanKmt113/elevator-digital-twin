import type { NormalizedEvent } from './event-normalizer.js';

export class EventRouter {
  private readonly seen = new Set<string>();
  private readonly latestAcceptedAt = new Map<string, number>();
  private duplicateEventsDropped = 0;
  private outOfOrderEventsRejected = 0;

  route<T>(event: NormalizedEvent<T>, buildingScope?: string): NormalizedEvent<T> | null {
    if (this.seen.has(event.eventId)) {
      this.duplicateEventsDropped += 1;
      return null;
    }

    const subjectId = this.getSubjectId(event.payload);
    const buildingId = this.getBuildingId(event.payload);
    if (buildingScope && buildingId && buildingId !== buildingScope) {
      return null;
    }

    const occurredAt = Date.parse(event.occurredAt);
    if (
      subjectId &&
      Number.isFinite(occurredAt) &&
      this.latestAcceptedAt.has(subjectId) &&
      occurredAt < (this.latestAcceptedAt.get(subjectId) ?? 0)
    ) {
      this.outOfOrderEventsRejected += 1;
      return null;
    }

    this.seen.add(event.eventId);
    if (subjectId && Number.isFinite(occurredAt)) {
      this.latestAcceptedAt.set(subjectId, occurredAt);
    }
    return event;
  }

  getStats(): { duplicateEventsDropped: number; outOfOrderEventsRejected: number } {
    return {
      duplicateEventsDropped: this.duplicateEventsDropped,
      outOfOrderEventsRejected: this.outOfOrderEventsRejected
    };
  }

  private getSubjectId(payload: unknown): string | undefined {
    if (!payload || typeof payload !== 'object') {
      return undefined;
    }

    const subjectId = (payload as Record<string, unknown>).elevatorId;
    return typeof subjectId === 'string' ? subjectId : undefined;
  }

  private getBuildingId(payload: unknown): string | undefined {
    if (!payload || typeof payload !== 'object') {
      return undefined;
    }

    const buildingId = (payload as Record<string, unknown>).buildingId;
    return typeof buildingId === 'string' ? buildingId : undefined;
  }
}
