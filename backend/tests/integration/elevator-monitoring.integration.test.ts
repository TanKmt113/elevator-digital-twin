import { describe, expect, it } from 'vitest';
import { ElevatorMonitoringService } from '../../src/modules/elevators/elevator-monitoring.service.js';
import { createElevatorTwin } from '../../src/modules/elevators/elevator-twin.model.js';

describe('elevator monitoring', () => {
  it('stores and returns normalized twins', () => {
    const service = new ElevatorMonitoringService();
    service.upsert(createElevatorTwin({ elevatorId: 'A', buildingId: 'L72', currentFloor: 10 }));
    expect(service.list()[0]?.currentFloor).toBe(10);
  });
});
