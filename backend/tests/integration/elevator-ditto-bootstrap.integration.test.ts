import { describe, expect, it } from 'vitest';
import { DittoClient, type DittoThing } from '../../src/integrations/ditto/ditto-client.js';
import type { ElevatorTwin } from '../../src/contracts/elevator.js';
import { ElevatorMonitoringService } from '../../src/modules/elevators/elevator-monitoring.service.js';
import { createElevatorTwin } from '../../src/modules/elevators/elevator-twin.model.js';

class FakeDittoClient extends DittoClient {
  constructor(private things: DittoThing[]) {
    super({
      httpUrl: 'http://localhost:8080',
      wsUrl: 'ws://localhost:8080/ws/2',
      fetchImpl: fetch
    });
  }

  override async listThings(): Promise<DittoThing[]> {
    return this.things;
  }

  setThings(things: DittoThing[]): void {
    this.things = things;
  }
}

describe('elevator Ditto bootstrap', () => {
  it('hydrates elevator twins from Ditto thing payloads and filters by building', async () => {
    const service = new ElevatorMonitoringService(undefined, undefined, new FakeDittoClient([
      {
        thingId: 'org.example:L72-ELEV-A',
        attributes: { buildingId: 'L72' },
        features: {
          elevator: {
            properties: {
              status: 'moving',
              currentFloor: 12,
              targetFloor: 18,
              positionMeters: 33.6,
              floorProgress: 0.2,
              speedMps: 1.6,
              accelerationMps2: 0.1,
              direction: 'up',
              doorState: 'closed',
              doorOpenPercent: 0,
              loadKg: 610,
              ratedLoadKg: 1000,
              loadPercentage: 61.5,
              mode: 'normal',
              brakeState: 'released',
              motorState: 'running',
              controllerState: 'normal',
              motorTempC: 41,
              controllerTempC: 34,
              powerKw: 14.2,
              vibrationLevel: 0.21,
              healthState: 'normal',
              activeCalls: [{ floor: 18, direction: 'up', type: 'destination' }],
              stopQueue: [18],
              etaSeconds: 18
            }
          }
        }
      },
      {
        thingId: 'org.example:L30-ELEV-A',
        attributes: { buildingId: 'L30' },
        features: {
          elevator: {
            properties: {
              status: 'idle',
              currentFloor: 5,
              direction: 'stationary',
              doorState: 'open',
              healthState: 'warning'
            }
          }
        }
      }
    ]));

    await service.bootstrapFromDitto();

    expect(service.listByBuilding('L72')).toHaveLength(1);
    expect(service.listByBuilding('L72')[0]).toMatchObject({
      elevatorId: 'org.example:L72-ELEV-A',
      buildingId: 'L72',
      currentFloor: 12,
      targetFloor: 18,
      positionMeters: 33.6,
      doorOpenPercent: 0,
      loadKg: 610,
      mode: 'normal',
      motorState: 'running',
      stopQueue: [18],
      direction: 'up',
      doorState: 'closed'
    });
    expect(service.listByBuilding('L30')).toHaveLength(1);
    expect(service.getSynchronizationState()).toMatchObject({
      bootstrapStatus: 'completed',
      dataState: 'ready',
      connectionState: 'live'
    });
    expect(service.getBootstrapSnapshot()).toMatchObject({
      source: 'twin',
      status: 'completed'
    });
  });

  it('marks synchronization degraded and empty when bootstrap returns no admitted elevators', async () => {
    const service = new ElevatorMonitoringService(undefined, undefined, new FakeDittoClient([
      {
        thingId: 'org.example:missing-building',
        attributes: {},
        features: {
          elevator: {
            properties: {
              status: 'idle'
            }
          }
        }
      }
    ]));

    await service.bootstrapFromDitto();

    expect(service.getSynchronizationState()).toMatchObject({
      bootstrapStatus: 'empty',
      dataState: 'empty',
      connectionState: 'degraded'
    });
    expect(service.getBootstrapSnapshot()).toMatchObject({
      source: 'twin',
      status: 'empty',
      elevators: []
    });
  });

  it('refreshes existing in-memory elevator state from the latest Ditto thing payloads', async () => {
    const client = new FakeDittoClient([
      {
        thingId: 'org.example:L72-ELEV-A',
        attributes: { buildingId: 'L72' },
        features: {
          elevator: {
            properties: {
              status: 'idle',
              currentFloor: 1,
              direction: 'stationary',
              doorState: 'open',
              healthState: 'normal'
            }
          }
        }
      }
    ]);
    const service = new ElevatorMonitoringService(undefined, undefined, client);

    await service.bootstrapFromDitto();
    expect(service.listByBuilding('L72')[0]?.currentFloor).toBe(1);

    client.setThings([
      {
        thingId: 'org.example:L72-ELEV-A',
        attributes: { buildingId: 'L72' },
        features: {
          elevator: {
            properties: {
              status: 'moving',
              currentFloor: 3,
              targetFloor: 3,
              direction: 'up',
              doorState: 'closed',
              healthState: 'normal'
            }
          }
        }
      }
    ]);

    await service.refreshFromDitto();

    expect(service.listByBuilding('L72')[0]).toMatchObject({
      elevatorId: 'org.example:L72-ELEV-A',
      currentFloor: 3,
      status: 'moving',
      targetFloor: 3
    });
  });

  it('materializes partial accepted updates over the last complete twin state', () => {
    const service = new ElevatorMonitoringService(undefined, undefined, undefined);
    service.upsert(createElevatorTwin({
      elevatorId: 'org.example:L72-ELEV-A',
      buildingId: 'L72',
      currentFloor: 4,
      positionMeters: 12.6,
      loadKg: 340,
      doorOpenPercent: 0,
      lastEventAt: '2026-05-06T01:18:13.576Z'
    }));

    service.upsert({
      elevatorId: 'org.example:L72-ELEV-A',
      buildingId: 'L72',
      schemaVersion: '1.1.0',
      deviceType: 'elevator',
      status: 'moving',
      currentFloor: 5,
      direction: 'up',
      doorState: 'closing',
      healthState: 'normal',
      doorOpenPercent: 40,
      lastEventAt: '2026-05-06T01:18:14.576Z',
      stale: false
    } as ElevatorTwin);

    expect(service.get('org.example:L72-ELEV-A')).toMatchObject({
      elevatorId: 'org.example:L72-ELEV-A',
      buildingId: 'L72',
      currentFloor: 5,
      positionMeters: 12.6,
      loadKg: 340,
      doorOpenPercent: 40
    });
  });
});
