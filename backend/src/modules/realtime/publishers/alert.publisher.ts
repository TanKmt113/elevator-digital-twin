import type { AlertRecord } from '../../../contracts/alert.js';
import { RealtimeSessionManager } from '../ws-server.js';

export class AlertPublisher {
  constructor(private readonly sessions: RealtimeSessionManager) {}

  publishRaised(alert: AlertRecord): void {
    this.sessions.publish({
      eventId: `evt-${alert.alertId}`,
      eventType: 'elevator.alert.raised',
      schemaVersion: '1.0.0',
      dataClass: 'alarm',
      occurredAt: new Date().toISOString(),
      payload: alert
    });
  }

  publishUpdated(alert: AlertRecord): void {
    this.sessions.publish({
      eventId: `evt-${alert.alertId}-updated`,
      eventType: 'elevator.alert.updated',
      schemaVersion: '1.0.0',
      dataClass: 'alarm',
      occurredAt: new Date().toISOString(),
      payload: alert
    });
  }
}
