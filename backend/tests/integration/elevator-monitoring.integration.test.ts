import { describe, expect, it, vi } from 'vitest';
import { ElevatorMonitoringService } from '../../src/modules/elevators/elevator-monitoring.service.js';
import { createElevatorTwin } from '../../src/modules/elevators/elevator-twin.model.js';
import { DittoLiveConsumer } from '../../src/integrations/ditto/ditto-live-consumer.js';
import { EventRouter } from '../../src/modules/realtime/event-router.js';
import type { NormalizedEvent } from '../../src/modules/realtime/event-normalizer.js';

describe('elevator monitoring', () => {
  it('stores normalized twins and updates synchronization readiness', () => {
    const service = new ElevatorMonitoringService();
    service.upsert(createElevatorTwin({ elevatorId: 'A', buildingId: 'L72', currentFloor: 10 }));
    expect(service.list()[0]?.currentFloor).toBe(10);
    expect(service.getSynchronizationState()).toMatchObject({
      buildingId: 'L72',
      dataState: 'ready',
      connectionState: 'live'
    });
  });

  it('rejects duplicate, out-of-order, and out-of-scope live events without mutating accepted state', () => {
    const service = new ElevatorMonitoringService();
    service.upsert(createElevatorTwin({ elevatorId: 'A', buildingId: 'L72', currentFloor: 10 }));

    const router = new EventRouter();
    const accepted: NormalizedEvent<{ elevatorId: string; buildingId: string; currentFloor: number }> = {
      eventId: 'evt-accepted',
      eventType: 'elevator.state.changed',
      schemaVersion: '1.0.0',
      dataClass: 'realtime',
      occurredAt: '2026-05-05T10:00:01.000Z',
      payload: { elevatorId: 'A', buildingId: 'L72', currentFloor: 11 }
    };
    const duplicate = { ...accepted };
    const late = {
      ...accepted,
      eventId: 'evt-late',
      occurredAt: '2026-05-05T10:00:00.000Z',
      payload: { elevatorId: 'A', buildingId: 'L72', currentFloor: 12 }
    };
    const outOfScope = {
      ...accepted,
      eventId: 'evt-scope',
      occurredAt: '2026-05-05T10:00:02.000Z',
      payload: { elevatorId: 'A', buildingId: 'L30', currentFloor: 13 }
    };

    const routed = router.route(accepted, 'L72');
    expect(routed).toEqual(accepted);
    service.upsert(
      createElevatorTwin({
        elevatorId: accepted.payload.elevatorId,
        buildingId: accepted.payload.buildingId,
        currentFloor: accepted.payload.currentFloor,
        lastEventAt: accepted.occurredAt
      })
    );

    expect(router.route(duplicate, 'L72')).toBeNull();
    expect(router.route(late, 'L72')).toBeNull();
    expect(router.route(outOfScope, 'L72')).toBeNull();
    expect(service.get('A')?.currentFloor).toBe(11);
    expect(router.getStats()).toEqual({
      duplicateEventsDropped: 1,
      outOfOrderEventsRejected: 1,
      outOfScopeEventsRejected: 1
    });
  });

  it('treats malformed Ditto live payloads as rejected input', async () => {
    let handler: ((payload: unknown) => void) | undefined;
    const accepted = vi.fn();
    const malformed = vi.fn();
    const consumer = new DittoLiveConsumer(
      {
        subscribe(next) {
          handler = next;
          return () => {
            handler = undefined;
          };
        },
        getRealtimeUrl() {
          return 'ws://127.0.0.1:65535/ws/2';
        },
        createAuthorizationHeaders() {
          return {};
        },
        async getThing() {
          throw new Error('unexpected getThing call');
        }
      },
      accepted,
      malformed
    );

    consumer.start();
    handler?.({ invalid: true });
    await vi.waitFor(() => {
      expect(malformed).toHaveBeenCalledTimes(1);
    });
    consumer.stop();
    expect(accepted).not.toHaveBeenCalled();
  });
});
