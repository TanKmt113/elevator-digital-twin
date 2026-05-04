export interface CommandAuditRecord {
  commandId: string;
  elevatorId: string;
  actorUserId: string;
  timestamp: string;
  outcome: 'accepted' | 'rejected' | 'completed' | 'failed' | 'expired';
  message: string;
}
