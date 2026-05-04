export interface AlertAuditRecord {
  alertId: string;
  actorUserId: string;
  timestamp: string;
  action: 'created' | 'acknowledged';
}

export class AlertAuditRepository {
  private readonly records: AlertAuditRecord[] = [];

  append(record: AlertAuditRecord): AlertAuditRecord {
    this.records.push(record);
    return record;
  }
}
