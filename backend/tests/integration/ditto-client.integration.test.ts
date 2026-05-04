import { describe, expect, it, vi } from 'vitest';
import { DittoClient, projectDittoElevatorThing } from '../../src/integrations/ditto/ditto-client.js';

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
});
