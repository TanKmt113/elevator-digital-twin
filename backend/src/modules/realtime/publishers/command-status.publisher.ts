import type { ControlCommand } from '../../../contracts/command.js';
import { RealtimeSessionManager } from '../ws-server.js';

export class CommandStatusPublisher {
  constructor(private readonly sessions: RealtimeSessionManager) {}

  publish(command: ControlCommand): void {
    this.sessions.publish({
      eventId: `evt-${command.commandId}`,
      eventType: 'elevator.command.status',
      schemaVersion: '1.1.0',
      dataClass: 'config',
      occurredAt: new Date().toISOString(),
      correlationId: command.correlationId,
      payload: command
    });
  }
}
