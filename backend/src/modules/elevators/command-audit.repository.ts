import type { CommandAuditRecord } from './command-audit.model.js';

export class CommandAuditRepository {
  private readonly records: CommandAuditRecord[] = [];

  append(record: CommandAuditRecord): CommandAuditRecord {
    this.records.push(record);
    return record;
  }

  list(): CommandAuditRecord[] {
    return [...this.records];
  }
}
