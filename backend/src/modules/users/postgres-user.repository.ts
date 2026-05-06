import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient, type QueryResultRow } from 'pg';
import { hashPassword, hashPasswordSync } from '../auth/password.js';
import type { CanonicalRole } from '../auth/auth.types.js';
import type { UserRecord } from './user.model.js';
import type { CreateUserInput, UserRepository } from './user.repository.js';

interface UserRow extends QueryResultRow {
  user_id: string;
  email: string;
  status: UserRecord['status'];
  password_hash: string | null;
  roles: CanonicalRole[];
  building_ids: string[];
  created_at: Date | string;
  updated_at: Date | string;
  last_login_at: Date | string | null;
}

function iso(value: Date | string | null): string | undefined {
  if (!value) {
    return undefined;
  }
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapUser(row: UserRow): UserRecord {
  return {
    userId: row.user_id,
    email: row.email,
    status: row.status,
    passwordHash: row.password_hash ?? undefined,
    roles: row.roles,
    buildingIds: row.building_ids,
    createdAt: iso(row.created_at) ?? new Date().toISOString(),
    updatedAt: iso(row.updated_at) ?? new Date().toISOString(),
    lastLoginAt: iso(row.last_login_at)
  };
}

export class PostgresUserRepository implements UserRepository {
  private readonly pool: Pool;
  private initialized?: Promise<void>;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  private async ensureSchema(): Promise<void> {
    this.initialized ??= this.pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        user_id uuid PRIMARY KEY,
        email text NOT NULL UNIQUE,
        status text NOT NULL CHECK (status IN ('active', 'disabled', 'pending')),
        password_hash text,
        roles text[] NOT NULL DEFAULT '{}',
        building_ids text[] NOT NULL DEFAULT '{}',
        created_at timestamptz NOT NULL,
        updated_at timestamptz NOT NULL,
        last_login_at timestamptz
      );
      CREATE INDEX IF NOT EXISTS admin_users_email_idx ON admin_users (lower(email));
    `).then(() => undefined);
    await this.initialized;
  }

  async seedTestPlatformAdmin(): Promise<void> {
    await this.ensureSchema();
    const count = await this.pool.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM admin_users');
    if (Number(count.rows[0]?.count ?? '0') > 0) {
      return;
    }
    const now = new Date();
    await this.pool.query(
      `INSERT INTO admin_users
        (user_id, email, status, password_hash, roles, building_ids, created_at, updated_at)
       VALUES ($1, $2, 'active', $3, $4, $5, $6, $6)`,
      [randomUUID(), 'admin@example.com', hashPasswordSync('test-admin-pass'), ['platform_admin'], [], now]
    );
  }

  async createUser(input: CreateUserInput): Promise<UserRecord> {
    await this.ensureSchema();
    const normalized = input.email.trim().toLowerCase();
    const now = new Date();
    try {
      const result = await this.pool.query<UserRow>(
        `INSERT INTO admin_users
          (user_id, email, status, password_hash, roles, building_ids, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
         RETURNING *`,
        [
          randomUUID(),
          normalized,
          input.status ?? 'active',
          await hashPassword(input.password),
          [...new Set(input.roles)],
          [...new Set(input.buildingIds)],
          now
        ]
      );
      return mapUser(result.rows[0]);
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === '23505') {
        throw new Error('USER_EXISTS');
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserRecord | undefined> {
    await this.ensureSchema();
    const result = await this.pool.query<UserRow>('SELECT * FROM admin_users WHERE email = $1', [
      email.trim().toLowerCase()
    ]);
    return result.rows[0] ? mapUser(result.rows[0]) : undefined;
  }

  async getById(userId: string): Promise<UserRecord | undefined> {
    await this.ensureSchema();
    const result = await this.pool.query<UserRow>('SELECT * FROM admin_users WHERE user_id = $1', [userId]);
    return result.rows[0] ? mapUser(result.rows[0]) : undefined;
  }

  async list(): Promise<UserRecord[]> {
    await this.ensureSchema();
    const result = await this.pool.query<UserRow>('SELECT * FROM admin_users ORDER BY created_at DESC');
    return result.rows.map(mapUser);
  }

  async updateUser(
    userId: string,
    patch: Partial<Pick<UserRecord, 'status' | 'roles' | 'buildingIds'>>
  ): Promise<UserRecord | undefined> {
    await this.ensureSchema();
    const client = await this.pool.connect();
    try {
      return await this.updateWithClient(client, userId, patch);
    } finally {
      client.release();
    }
  }

  private async updateWithClient(
    client: PoolClient,
    userId: string,
    patch: Partial<Pick<UserRecord, 'status' | 'roles' | 'buildingIds'>>
  ): Promise<UserRecord | undefined> {
    const current = await client.query<UserRow>('SELECT * FROM admin_users WHERE user_id = $1', [userId]);
    if (!current.rows[0]) {
      return undefined;
    }
    const result = await client.query<UserRow>(
      `UPDATE admin_users
       SET status = $2, roles = $3, building_ids = $4, updated_at = $5
       WHERE user_id = $1
       RETURNING *`,
      [
        userId,
        patch.status ?? current.rows[0].status,
        patch.roles ?? current.rows[0].roles,
        patch.buildingIds ?? current.rows[0].building_ids,
        new Date()
      ]
    );
    return result.rows[0] ? mapUser(result.rows[0]) : undefined;
  }

  async touchLogin(userId: string): Promise<void> {
    await this.ensureSchema();
    const now = new Date();
    await this.pool.query(
      'UPDATE admin_users SET last_login_at = $2, updated_at = $2 WHERE user_id = $1',
      [userId, now]
    );
  }
}
