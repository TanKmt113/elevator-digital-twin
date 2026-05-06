import { randomUUID } from 'node:crypto';

export type AuditOutcome = 'success' | 'failure';

export interface AuditRecord {
  auditId: string;
  actorUserId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  buildingId?: string;
  payloadSummary: Record<string, unknown>;
  outcome: AuditOutcome;
  correlationId: string;
  createdAt: string;
}

export interface AuditRepository {
  append(entry: Omit<AuditRecord, 'auditId' | 'createdAt'> & { auditId?: string }): Promise<AuditRecord> | AuditRecord;
  listRecent(limit?: number): Promise<AuditRecord[]> | AuditRecord[];
}

export class InMemoryAuditRepository implements AuditRepository {
  private readonly records: AuditRecord[] = [];

  append(entry: Omit<AuditRecord, 'auditId' | 'createdAt'> & { auditId?: string }): AuditRecord {
    const rec: AuditRecord = {
      auditId: entry.auditId ?? randomUUID(),
      actorUserId: entry.actorUserId,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      buildingId: entry.buildingId,
      payloadSummary: entry.payloadSummary,
      outcome: entry.outcome,
      correlationId: entry.correlationId,
      createdAt: new Date().toISOString()
    };
    this.records.push(rec);
    return rec;
  }

  listRecent(limit = 50): AuditRecord[] {
    return this.records.slice(-limit);
  }
}
