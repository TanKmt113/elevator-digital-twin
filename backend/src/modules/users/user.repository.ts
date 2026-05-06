import type { CanonicalRole } from '../auth/auth.types.js';
import type { UserRecord, UserStatus } from './user.model.js';

export interface CreateUserInput {
  email: string;
  password: string;
  roles: CanonicalRole[];
  buildingIds: string[];
  status?: UserStatus;
}

export interface UserRepository {
  seedTestPlatformAdmin(): Promise<void> | void;
  createUser(input: CreateUserInput): Promise<UserRecord>;
  findByEmail(email: string): Promise<UserRecord | undefined>;
  getById(userId: string): Promise<UserRecord | undefined>;
  list(): Promise<UserRecord[]>;
  updateUser(
    userId: string,
    patch: Partial<Pick<UserRecord, 'status' | 'roles' | 'buildingIds'>>
  ): Promise<UserRecord | undefined>;
  touchLogin(userId: string): Promise<void> | void;
}
