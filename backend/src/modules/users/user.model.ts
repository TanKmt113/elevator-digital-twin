import type { CanonicalRole } from '../auth/auth.types.js';

export type UserStatus = 'active' | 'disabled' | 'pending';

export interface UserRecord {
  userId: string;
  email: string;
  status: UserStatus;
  passwordHash?: string;
  roles: CanonicalRole[];
  buildingIds: string[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}
