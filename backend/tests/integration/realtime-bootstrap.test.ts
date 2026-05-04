import { describe, expect, it } from 'vitest';
import { EventRouter } from '../../src/modules/realtime/event-router.js';
import { normalizeElevatorState } from '../../src/modules/realtime/event-normalizer.js';

describe('realtime bootstrap', () => {
  it('deduplicates events by eventId', () => {
    const router = new EventRouter();
    const event = normalizeElevatorState({ elevatorId: 'A', buildingId: 'L72' });
    expect(router.route(event)).not.toBeNull();
    expect(router.route(event)).toBeNull();
  });
});
