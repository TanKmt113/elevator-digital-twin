import { randomUUID } from 'node:crypto';
import { Pool, type QueryResultRow } from 'pg';
import type { AuditRecord, AuditRepository } from './audit.repository.js';

interface AuditRow extends QueryResultRow {
  audit_id: string;
  actor_user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  building_id: string | null;
  payload_summary: Record<string, unknown>;
  outcome: AuditRecord['outcome'];
  correlation_id: string;
  created_at: Date | string;
}

function mapAudit(row: AuditRow): AuditRecord {
  return {
    auditId: row.audit_id,
    actorUserId: row.actor_user_id,
    action: row.action,
    resourceType: row.resource_type,
    resourceId: row.resource_id,
    buildingId: row.building_id ?? undefined,
    payloadSummary: row.payload_summary,
    outcome: row.outcome,
    correlationId: row.correlation_id,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString()
  };
}

export class PostgresAuditRepository implements AuditRepository {
  private readonly pool: Pool;
  private initialized?: Promise<void>;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  private async ensureSchema(): Promise<void> {
    this.initialized ??= this.pool.query(`
      CREATE TABLE IF NOT EXISTS audit_records (
        audit_id uuid PRIMARY KEY,
        actor_user_id text NOT NULL,
        action text NOT NULL,
        resource_type text NOT NULL,
        resource_id text NOT NULL,
        building_id text,
        payload_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
        outcome text NOT NULL CHECK (outcome IN ('success', 'failure')),
        correlation_id text NOT NULL,
        created_at timestamptz NOT NULL
      );
      CREATE INDEX IF NOT EXISTS audit_records_created_at_idx ON audit_records (created_at DESC);
      CREATE INDEX IF NOT EXISTS audit_records_resource_idx ON audit_records (resource_type, resource_id);
    `).then(() => undefined);
    await this.initialized;
  }

  async append(entry: Omit<AuditRecord, 'auditId' | 'createdAt'> & { auditId?: string }): Promise<AuditRecord> {
    await this.ensureSchema();
    const result = await this.pool.query<AuditRow>(
      `INSERT INTO audit_records
        (audit_id, actor_user_id, action, resource_type, resource_id, building_id,
         payload_summary, outcome, correlation_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10)
       RETURNING *`,
      [
        entry.auditId ?? randomUUID(),
        entry.actorUserId,
        entry.action,
        entry.resourceType,
        entry.resourceId,
        entry.buildingId ?? null,
        JSON.stringify(entry.payloadSummary),
        entry.outcome,
        entry.correlationId,
        new Date()
      ]
    );
    return mapAudit(result.rows[0]);
  }

  async listRecent(limit = 50): Promise<AuditRecord[]> {
    await this.ensureSchema();
    const result = await this.pool.query<AuditRow>(
      'SELECT * FROM audit_records ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    return result.rows.map(mapAudit);
  }
}
