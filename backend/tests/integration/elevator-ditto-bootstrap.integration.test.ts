import { describe, expect, it } from 'vitest';
import { DittoClient, type DittoThing } from '../../src/integrations/ditto/ditto-client.js';
import { ElevatorMonitoringService } from '../../src/modules/elevators/elevator-monitoring.service.js';

class FakeDittoClient extends DittoClient {
  constructor(private readonly things: DittoThing[]) {
    super({
      httpUrl: 'http://localhost:8080',
      wsUrl: 'ws://localhost:8080/ws/2',
      fetchImpl: fetch
    });
  }

  override async listThings(): Promise<DittoThing[]> {
    return this.things;
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
  });

  it('marks synchronization degraded when bootstrap returns no admitted elevators', async () => {
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
      bootstrapStatus: 'partial',
      dataState: 'empty',
      connectionState: 'degraded'
    });
  });
});
