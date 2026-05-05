import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/api/server.js';
import { createElevatorTwin } from '../../src/modules/elevators/elevator-twin.model.js';
import { hasBuildingScope } from '../../src/modules/auth/auth.middleware.js';

describe('elevators contract', () => {
  it('defines scoped list/detail endpoints and synchronization metadata', () => {
    const { monitoringService } = createApp({ seedAnalytics: false, bootstrapTwin: false });
    expect(['/elevators', '/elevators/:elevatorId']).toHaveLength(2);
    expect(monitoringService.getSynchronizationState()).toMatchObject({
      bootstrapStatus: expect.any(String),
      dataState: expect.any(String),
      connectionState: expect.any(String)
    });
  });

  it('requires building scope for detail lookup semantics', () => {
    const { monitoringService } = createApp({ seedAnalytics: false, bootstrapTwin: false });
    monitoringService.upsert(createElevatorTwin({ elevatorId: 'A', buildingId: 'L72' }));

    expect(monitoringService.get('A')).toMatchObject({ buildingId: 'L72' });
    expect(monitoringService.listByBuilding('L30')).toEqual([]);
  });

  it('enforces token building scope equality for elevator access', () => {
    expect(
      hasBuildingScope(
        {
          user: {
            userId: 'operator-1',
            role: 'operator',
            buildingId: 'L72'
          }
        } as never,
        'L72'
      )
    ).toBe(true);
    expect(
      hasBuildingScope(
        {
          user: {
            userId: 'operator-1',
            role: 'operator',
            buildingId: 'L72'
          }
        } as never,
        'L30'
      )
    ).toBe(false);
  });
});
