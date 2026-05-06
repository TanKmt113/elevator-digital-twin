import type { ControlCommand, ElevatorCommandType } from '../../contracts/command.js';
import { recordCommandAccepted, recordCommandRejected } from '../../observability/command.metrics.js';
import type { AuthenticatedRequest } from '../auth/auth.middleware.js';
import { CommandAuditRepository } from './command-audit.repository.js';
import { createControlCommand } from './control-command.model.js';
import { ElevatorMonitoringService } from './elevator-monitoring.service.js';
import { CommandPolicyService } from './command-policy.service.js';

export interface CommandRequestPayload {
  elevatorId: string;
  buildingId?: string;
  commandType: ElevatorCommandType;
  requestedFloor?: number;
  parameters?: Record<string, unknown>;
}

export class CommandExecutionService {
  constructor(
    private readonly monitoringService: ElevatorMonitoringService = new ElevatorMonitoringService(),
    private readonly policyService = new CommandPolicyService(),
    private readonly auditRepository = new CommandAuditRepository()
  ) {}

  submit(payload: CommandRequestPayload, actor: NonNullable<AuthenticatedRequest['user']>): ControlCommand {
    const twin = this.monitoringService.get(payload.elevatorId);
    const twinBuilding = twin?.buildingId;
    const allowedBuilding =
      actor.isPlatformAdmin ||
      (twinBuilding &&
        (actor.buildingIds.includes(twinBuilding) || actor.buildingId === twinBuilding));
    const scopeDecision =
      twin && twinBuilding && !allowedBuilding
        ? { allowed: false, reason: 'Command blocked by building scope' }
        : this.policyService.evaluate(twin, payload.commandType);
    const decision = scopeDecision;

    if (!decision.allowed) {
      recordCommandRejected();
      const rejected = createControlCommand({
        ...payload,
        status: 'rejected',
        message: decision.reason ?? 'Command rejected'
      });
      this.auditRepository.append({
        commandId: rejected.commandId,
        elevatorId: rejected.elevatorId,
        correlationId: rejected.correlationId,
        actorUserId: actor.userId,
        timestamp: new Date().toISOString(),
        outcome: 'rejected',
        message: rejected.message
      });
      return rejected;
    }

    recordCommandAccepted();
    const accepted = createControlCommand(payload);
    this.auditRepository.append({
      commandId: accepted.commandId,
      elevatorId: accepted.elevatorId,
      correlationId: accepted.correlationId,
      actorUserId: actor.userId,
      timestamp: new Date().toISOString(),
      outcome: 'accepted',
      message: accepted.message
    });
    return accepted;
  }

  audits(): ReturnType<CommandAuditRepository['list']> {
    return this.auditRepository.list();
  }
}
