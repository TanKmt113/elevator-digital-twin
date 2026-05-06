import { randomUUID } from 'node:crypto';
import { hashPassword, hashPasswordSync } from '../auth/password.js';
import type { UserRecord } from './user.model.js';
import type { CreateUserInput, UserRepository } from './user.repository.js';

export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, UserRecord>();
  private readonly byEmail = new Map<string, string>();

  seedTestPlatformAdmin(): void {
    if (this.users.size > 0) {
      return;
    }
    const email = 'admin@example.com';
    const passwordHash = hashPasswordSync('test-admin-pass');
    const now = new Date().toISOString();
    const rec: UserRecord = {
      userId: randomUUID(),
      email,
      status: 'active',
      passwordHash,
      roles: ['platform_admin'],
      buildingIds: [],
      createdAt: now,
      updatedAt: now
    };
    this.users.set(rec.userId, rec);
    this.byEmail.set(email.toLowerCase(), rec.userId);
  }

  async createUser(input: CreateUserInput): Promise<UserRecord> {
    const normalized = input.email.trim().toLowerCase();
    if (this.byEmail.has(normalized)) {
      throw new Error('USER_EXISTS');
    }
    const now = new Date().toISOString();
    const rec: UserRecord = {
      userId: randomUUID(),
      email: normalized,
      status: input.status ?? 'active',
      passwordHash: await hashPassword(input.password),
      roles: [...new Set(input.roles)],
      buildingIds: [...new Set(input.buildingIds)],
      createdAt: now,
      updatedAt: now
    };
    this.users.set(rec.userId, rec);
    this.byEmail.set(normalized, rec.userId);
    return rec;
  }

  async findByEmail(email: string): Promise<UserRecord | undefined> {
    const id = this.byEmail.get(email.trim().toLowerCase());
    return id ? this.users.get(id) : undefined;
  }

  async getById(userId: string): Promise<UserRecord | undefined> {
    return this.users.get(userId);
  }

  async list(): Promise<UserRecord[]> {
    return [...this.users.values()];
  }

  async updateUser(
    userId: string,
    patch: Partial<Pick<UserRecord, 'status' | 'roles' | 'buildingIds'>>
  ): Promise<UserRecord | undefined> {
    const cur = this.users.get(userId);
    if (!cur) {
      return undefined;
    }
    const next: UserRecord = {
      ...cur,
      ...patch,
      roles: patch.roles ?? cur.roles,
      buildingIds: patch.buildingIds ?? cur.buildingIds,
      updatedAt: new Date().toISOString()
    };
    this.users.set(userId, next);
    return next;
  }

  touchLogin(userId: string): void {
    const cur = this.users.get(userId);
    if (!cur) {
      return;
    }
    cur.lastLoginAt = new Date().toISOString();
    cur.updatedAt = cur.lastLoginAt;
  }
}
