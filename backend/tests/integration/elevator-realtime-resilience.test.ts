import { describe, expect, it } from 'vitest';
import { SessionStalenessPolicy } from '../../src/modules/realtime/session-manager.js';
import { EventRouter } from '../../src/modules/realtime/event-router.js';
import type { NormalizedEvent } from '../../src/modules/realtime/event-normalizer.js';

describe('elevator realtime resilience', () => {
  it('marks old state as stale', () => {
    const policy = new SessionStalenessPolicy();
    expect(policy.isStale('2000-01-01T00:00:00.000Z')).toBe(true);
  });

  it('drops duplicate and out-of-order elevator state events', () => {
    const router = new EventRouter();
    const currentEvent: NormalizedEvent<{ elevatorId: string }> = {
      eventId: 'evt-2',
      eventType: 'elevator.state.changed',
      schemaVersion: '1.1.0',
      dataClass: 'realtime',
      occurredAt: '2026-05-04T10:00:01.000Z',
      payload: { elevatorId: 'L72-ELEV-A' }
    };
    const outOfOrderEvent: NormalizedEvent<{ elevatorId: string }> = {
      ...currentEvent,
      eventId: 'evt-1',
      occurredAt: '2026-05-04T10:00:00.000Z'
    };

    expect(router.route(currentEvent)).toEqual(currentEvent);
    expect(router.route(currentEvent)).toBeNull();
    expect(router.route(outOfOrderEvent)).toBeNull();
    expect(router.getStats()).toEqual({
      duplicateEventsDropped: 1,
      outOfOrderEventsRejected: 1,
      outOfScopeEventsRejected: 0
    });
  });

  it('rejects out-of-scope building events when a scope is provided', () => {
    const router = new EventRouter();
    const event: NormalizedEvent<{ elevatorId: string; buildingId: string }> = {
      eventId: 'evt-out-of-scope',
      eventType: 'elevator.state.changed',
      schemaVersion: '1.1.0',
      dataClass: 'realtime',
      occurredAt: '2026-05-04T10:00:01.000Z',
      payload: { elevatorId: 'L30-ELEV-A', buildingId: 'L30' }
    };

    expect(router.route(event, 'L72')).toBeNull();
    expect(router.getStats().outOfScopeEventsRejected).toBe(1);
  });

  it('routes enhanced realtime events without dropping schema 1.1 fields', () => {
    const router = new EventRouter();
    const event: NormalizedEvent<{
      elevatorId: string;
      buildingId: string;
      positionMeters: number;
      doorOpenPercent: number;
      loadKg: number;
      mode: string;
      stopQueue: number[];
    }> = {
      eventId: 'evt-enhanced-1',
      eventType: 'elevator.state.changed',
      schemaVersion: '1.1.0',
      dataClass: 'realtime',
      occurredAt: '2026-05-06T01:20:00.000Z',
      payload: {
        elevatorId: 'L72-ELEV-A',
        buildingId: 'L72',
        positionMeters: 12.6,
        doorOpenPercent: 45,
        loadKg: 340,
        mode: 'normal',
        stopQueue: [8]
      }
    };

    expect(router.route(event, 'L72')).toEqual(event);
  });
});
