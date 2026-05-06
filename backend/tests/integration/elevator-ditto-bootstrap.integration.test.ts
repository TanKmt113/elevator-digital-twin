import { describe, expect, it } from 'vitest';
import { DittoClient, type DittoThing } from '../../src/integrations/ditto/ditto-client.js';
import { ElevatorMonitoringService } from '../../src/modules/elevators/elevator-monitoring.service.js';

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
              direction: 'up',
              doorState: 'closed',
              loadPercentage: 61.5,
              healthState: 'normal'
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
});
