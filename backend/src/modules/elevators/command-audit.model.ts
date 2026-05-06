export interface CommandAuditRecord {
  commandId: string;
  elevatorId: string;
  correlationId: string;
  actorUserId: string;
  timestamp: string;
  outcome: 'accepted' | 'rejected' | 'completed' | 'failed' | 'expired';
  message: string;
}
