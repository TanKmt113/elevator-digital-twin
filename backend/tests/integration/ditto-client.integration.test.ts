import { describe, expect, it, vi } from 'vitest';
import { DittoClient, projectDittoElevatorThing } from '../../src/integrations/ditto/ditto-client.js';
import { DittoLiveConsumer } from '../../src/integrations/ditto/ditto-live-consumer.js';

describe('DittoClient', () => {
  it('builds listThings requests with auth and query params', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify([{ thingId: 'org.example:elevator-a' }]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );

    const client = new DittoClient({
      httpUrl: 'http://localhost:8080/',
      wsUrl: 'ws://localhost:8080/ws/2',
      username: 'ditto',
      password: 'secret',
      fetchImpl: fetchMock as typeof fetch
    });

    const result = await client.listThings({
      ids: ['org.example:elevator-a', 'org.example:elevator-b'],
      fields: 'thingId,attributes,features',
      timeout: '5s'
    });

    expect(result).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/2/things?ids=org.example%3Aelevator-a%2Corg.example%3Aelevator-b&fields=thingId%2Cattributes%2Cfeatures&timeout=5s',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/json',
          Authorization: expect.stringMatching(/^Basic /)
        })
      })
    );
  });

  it('builds getThing requests with bearer auth', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ thingId: 'org.example:elevator-a' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );

    const client = new DittoClient({
      httpUrl: 'http://localhost:8080',
      wsUrl: 'ws://localhost:8080/ws/2',
      bearerToken: 'token-123',
      fetchImpl: fetchMock as typeof fetch
    });

    const thing = await client.getThing('org.example:elevator-a', {
      fields: 'thingId,features',
      timeout: '3s',
      condition: 'exists(features/elevator)'
    });

    expect(thing.thingId).toBe('org.example:elevator-a');
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/2/things/org.example%3Aelevator-a?fields=thingId%2Cfeatures&timeout=3s&condition=exists%28features%2Felevator%29',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/json',
          Authorization: 'Bearer token-123'
        })
      })
    );
  });

  it('projects Twin thing fields used by the bootstrap mapper', () => {
    expect(
      projectDittoElevatorThing({
        thingId: 'org.example:L72-ELEV-A',
        attributes: { buildingId: 'L72' },
        features: {
          elevator: {
            properties: {
              currentFloor: 11,
              direction: 'up'
            }
          }
        }
      })
    ).toMatchObject({
      elevatorId: 'org.example:L72-ELEV-A',
      buildingId: 'L72',
      currentFloor: 11,
      direction: 'up'
    });
  });

  it('upserts policies and things with JSON payloads', async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));

    const client = new DittoClient({
      httpUrl: 'http://localhost:8080',
      wsUrl: 'ws://localhost:8080/ws/2',
      username: 'ditto',
      password: 'secret',
      fetchImpl: fetchMock as typeof fetch
    });

    await client.upsertPolicy('org.example:l72-elevator-policy', {
      entries: {
        DEFAULT: {
          subjects: {},
          resources: {}
        }
      }
    });
    await client.upsertThing('org.example:L72-ELEV-A', {
      thingId: 'org.example:L72-ELEV-A',
      attributes: {
        buildingId: 'L72'
      }
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://localhost:8080/api/2/policies/org.example%3Al72-elevator-policy',
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: expect.stringMatching(/^Basic /)
        })
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://localhost:8080/api/2/things/org.example%3AL72-ELEV-A',
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      })
    );
  });

  it('projects emitted Ditto live payloads into accepted realtime events', async () => {
    let handler: ((payload: unknown) => void) | undefined;
    const accepted = vi.fn();

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
          return {
            thingId: 'org.example:L72-ELEV-A',
            attributes: { buildingId: 'L72' },
            features: {
              elevator: {
                properties: {
                  currentFloor: 7,
                  status: 'moving',
                  direction: 'up',
                  doorState: 'closed',
                  healthState: 'normal'
                }
              }
            }
          };
        }
      },
      accepted
    );

    consumer.start();
    handler?.({
      id: 'evt-live-1',
      thingId: 'org.example:L72-ELEV-A',
      time: '2026-05-05T10:00:00.000Z'
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    consumer.stop();

    expect(accepted).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: 'evt-live-1',
        eventType: 'elevator.state.changed',
        payload: expect.objectContaining({
          elevatorId: 'org.example:L72-ELEV-A',
          currentFloor: 7,
          buildingId: 'L72',
          lastEventAt: '2026-05-05T10:00:00.000Z'
        })
      })
    );
  });
});
