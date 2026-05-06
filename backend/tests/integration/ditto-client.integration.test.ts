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
    await vi.waitFor(() => {
      expect(accepted).toHaveBeenCalledTimes(1);
    });
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

  it('hydrates Ditto protocol websocket events using topic-derived thing ids', async () => {
    const accepted = vi.fn();
    const consumer = new DittoLiveConsumer(
      {
        subscribe() {
          return () => undefined;
        },
        getRealtimeUrl() {
          return 'ws://127.0.0.1:65535/ws/2';
        },
        createAuthorizationHeaders() {
          return {};
        },
        async getThing(thingId) {
          expect(thingId).toBe('org.example:L72-ELEV-A');
          return {
            thingId,
            attributes: { buildingId: 'L72' },
            features: {
              elevator: {
                properties: {
                  currentFloor: 3,
                  status: 'idle',
                  direction: 'stationary',
                  doorState: 'open',
                  healthState: 'normal'
                }
              }
            }
          };
        }
      },
      accepted
    );

    await (consumer as unknown as { handleIncomingPayload(payload: unknown): Promise<void> }).handleIncomingPayload({
      topic: 'org.example/L72-ELEV-A/things/twin/events/modified',
      path: '/features/elevator/properties/currentFloor',
      value: 3,
      revision: 2,
      timestamp: '2026-05-05T10:05:00.000Z'
    });

    expect(accepted).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'elevator.state.changed',
        payload: expect.objectContaining({
          elevatorId: 'org.example:L72-ELEV-A',
          buildingId: 'L72',
          currentFloor: 3,
          lastEventAt: '2026-05-05T10:05:00.000Z'
        })
      })
    );
  });

  it('subscribes for Ditto twin events when the websocket connection opens', () => {
    let openHandler: (() => void) | undefined;
    let messageHandler: ((payload: Buffer | string) => void) | undefined;
    const send = vi.fn();
    const accepted = vi.fn();

    const consumer = new DittoLiveConsumer(
      {
        subscribe() {
          return () => undefined;
        },
        getRealtimeUrl() {
          return 'ws://127.0.0.1:65535/ws/2';
        },
        createAuthorizationHeaders() {
          return { Authorization: 'Basic abc' };
        },
        async getThing() {
          return {
            thingId: 'org.example:L72-ELEV-A',
            attributes: { buildingId: 'L72' },
            features: {
              elevator: {
                properties: {
                  currentFloor: 3,
                  status: 'idle',
                  direction: 'stationary',
                  doorState: 'open',
                  healthState: 'normal'
                }
              }
            }
          };
        }
      },
      accepted,
      undefined,
      undefined,
      () =>
        ({
          on(event: string, handler: (...args: never[]) => void) {
            if (event === 'open') {
              openHandler = handler as () => void;
            }
            if (event === 'message') {
              messageHandler = handler as (payload: Buffer | string) => void;
            }
          },
          send,
          close() {
            return undefined;
          },
          removeAllListeners() {
            return undefined;
          }
        }) as unknown as never
    );

    consumer.start();
    openHandler?.();
    messageHandler?.('START-SEND-EVENTS:ACK');

    expect(send).toHaveBeenCalledWith('START-SEND-EVENTS');
    expect(accepted).not.toHaveBeenCalled();
    consumer.stop();
  });

  it('hydrates CloudEvent-wrapped Ditto websocket events', async () => {
    const accepted = vi.fn();
    const consumer = new DittoLiveConsumer(
      {
        subscribe() {
          return () => undefined;
        },
        getRealtimeUrl() {
          return 'ws://127.0.0.1:65535/ws/2';
        },
        createAuthorizationHeaders() {
          return {};
        },
        async getThing(thingId) {
          expect(thingId).toBe('org.example:L72-ELEV-A');
          return {
            thingId,
            attributes: { buildingId: 'L72' },
            features: {
              elevator: {
                properties: {
                  currentFloor: 15,
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

    await (consumer as unknown as { handleIncomingPayload(payload: unknown): Promise<void> }).handleIncomingPayload({
      id: 'cloud-event-1',
      source: '/things/org.example%3AL72-ELEV-A',
      time: '2026-05-06T01:15:00.000Z',
      data: {
        topic: 'org.example/L72-ELEV-A/things/twin/events/modified',
        path: '/features/elevator/properties/currentFloor',
        value: 15
      }
    });

    expect(accepted).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: 'cloud-event-1',
        occurredAt: '2026-05-06T01:15:00.000Z',
        payload: expect.objectContaining({
          elevatorId: 'org.example:L72-ELEV-A',
          currentFloor: 15
        })
      })
    );
  });

  it('hydrates partial Ditto merge events before normalization', async () => {
    const accepted = vi.fn();
    const consumer = new DittoLiveConsumer(
      {
        subscribe() {
          return () => undefined;
        },
        getRealtimeUrl() {
          return 'ws://127.0.0.1:65535/ws/2';
        },
        createAuthorizationHeaders() {
          return {};
        },
        async getThing(thingId) {
          expect(thingId).toBe('org.example:L72-ELEV-A');
          return {
            thingId,
            attributes: { buildingId: 'L72' },
            features: {
              elevator: {
                properties: {
                  currentFloor: 4,
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

    await (consumer as unknown as { handleIncomingPayload(payload: unknown): Promise<void> }).handleIncomingPayload({
      topic: 'org.example/L72-ELEV-A/things/twin/events/merged',
      path: '/',
      value: {
        thingId: 'org.example:L72-ELEV-A',
        features: {
          elevator: {
            properties: {
              currentFloor: 4
            }
          }
        }
      },
      revision: 10,
      timestamp: '2026-05-06T01:18:13.576427121Z'
    });

    expect(accepted).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'elevator.state.changed',
        occurredAt: '2026-05-06T01:18:13.576427121Z',
        payload: expect.objectContaining({
          elevatorId: 'org.example:L72-ELEV-A',
          buildingId: 'L72',
          currentFloor: 4
        })
      })
    );
  });
});
