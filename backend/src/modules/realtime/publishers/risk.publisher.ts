import type { RiskWarning } from '../../../contracts/risk.js';
import { RealtimeSessionManager } from '../ws-server.js';

export class RiskPublisher {
  constructor(private readonly sessions: RealtimeSessionManager) {}

  publish(warning: RiskWarning): void {
    this.sessions.publish({
      eventId: `evt-${warning.riskWarningId}`,
      eventType: 'elevator.risk.updated',
      schemaVersion: '1.0.0',
      dataClass: 'telemetry',
      occurredAt: new Date().toISOString(),
      payload: warning
    });
  }
}
