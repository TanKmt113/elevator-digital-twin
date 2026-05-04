import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/api/server.js';
import { DittoClient, type DittoThing } from '../../src/integrations/ditto/ditto-client.js';

describe('realtime bootstrap', () => {
  it('starts with a bootstrapped synchronization snapshot when Ditto data is available', async () => {
    class StartupDittoClient extends DittoClient {
      override async listThings(): Promise<DittoThing[]> {
        return [
          {
            thingId: 'org.example:L72-ELEV-A',
            attributes: { buildingId: 'L72' },
            features: {
              elevator: {
                properties: {
                  currentFloor: 4,
                  status: 'idle',
                  direction: 'stationary',
                  doorState: 'closed',
                  healthState: 'normal'
                }
              }
            }
          }
        ];
      }
    }

    const { monitoringService } = createApp({
      dittoClient: new StartupDittoClient({
        httpUrl: 'http://localhost:8080',
        wsUrl: 'ws://localhost:8080/ws/2'
      }),
      seedAnalytics: false,
      bootstrapTwin: false
    });

    await monitoringService.bootstrapFromDitto();

    expect(monitoringService.getBootstrapSnapshot()).toMatchObject({
      status: 'completed'
    });
    expect(monitoringService.getSynchronizationState()).toMatchObject({
      dataState: 'ready',
      connectionState: 'live'
    });
  });
});
