import WebSocket from 'ws';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../../src/api/server.js';
import { DittoClient, type DittoThing } from '../../src/integrations/ditto/ditto-client.js';
import { createElevatorTwin } from '../../src/modules/elevators/elevator-twin.model.js';
import { ElevatorStatePublisher } from '../../src/modules/realtime/publishers/elevator-state.publisher.js';
import { RealtimeSessionManager } from '../../src/modules/realtime/ws-server.js';

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

  it('publishes accepted elevator updates only to sessions in the same building scope', async () => {
    const sessions = new RealtimeSessionManager();
    const lifecycleListener = vi.fn();
    sessions.addLifecycleListener(lifecycleListener);
    const publisher = new ElevatorStatePublisher(sessions);
    const sendL72 = vi.fn();
    const sendL30 = vi.fn();
    const l72Client = {
      readyState: WebSocket.OPEN,
      send: sendL72
    } as unknown as WebSocket;
    const l30Client = {
      readyState: WebSocket.OPEN,
      send: sendL30
    } as unknown as WebSocket;

    const removeL72 = sessions.addSession(l72Client, {
      userId: 'operator-L72',
      role: 'operator',
      buildingId: 'L72'
    });
    const removeL30 = sessions.addSession(l30Client, {
      userId: 'operator-L30',
      role: 'operator',
      buildingId: 'L30'
    });

    expect(sessions.getActiveSessionCount()).toBe(2);
    expect(lifecycleListener).toHaveBeenCalledTimes(2);

    publisher.publish(
      createElevatorTwin({
        elevatorId: 'org.example:L72-ELEV-A',
        buildingId: 'L72',
        currentFloor: 8,
        status: 'moving',
        direction: 'up',
        doorState: 'closed',
        healthState: 'normal'
      })
    );

    expect(sendL72).toHaveBeenCalledTimes(1);
    expect(JSON.parse(sendL72.mock.calls[0][0] as string)).toMatchObject({
      eventType: 'elevator.state.changed',
      payload: expect.objectContaining({
        elevatorId: 'org.example:L72-ELEV-A',
        buildingId: 'L72',
        currentFloor: 8
      })
    });
    expect(sendL30).not.toHaveBeenCalled();

    removeL30();
    expect(sessions.getActiveSessionCount()).toBe(1);
    expect(lifecycleListener).toHaveBeenCalledTimes(3);
    removeL72();
  });

  it('can publish the accepted Ditto realtime event envelope without regenerating it', () => {
    const sessions = new RealtimeSessionManager();
    const publisher = new ElevatorStatePublisher(sessions);
    const sendL72 = vi.fn();
    const l72Client = {
      readyState: WebSocket.OPEN,
      send: sendL72
    } as unknown as WebSocket;

    const removeL72 = sessions.addSession(l72Client, {
      userId: 'operator-L72',
      role: 'operator',
      buildingId: 'L72'
    });

    publisher.publishEvent({
      eventId: 'ditto-live-evt-1',
      eventType: 'elevator.state.changed',
      schemaVersion: '1.1.0',
      dataClass: 'realtime',
      occurredAt: '2026-05-05T10:10:00.000Z',
      payload: createElevatorTwin({
        elevatorId: 'org.example:L72-ELEV-A',
        buildingId: 'L72',
        currentFloor: 3,
        lastEventAt: '2026-05-05T10:10:00.000Z'
      })
    });

    expect(JSON.parse(sendL72.mock.calls[0][0] as string)).toMatchObject({
      eventId: 'ditto-live-evt-1',
      occurredAt: '2026-05-05T10:10:00.000Z',
      payload: expect.objectContaining({
        elevatorId: 'org.example:L72-ELEV-A',
        currentFloor: 3,
        lastEventAt: '2026-05-05T10:10:00.000Z'
      })
    });

    removeL72();
  });
});
