import jwt, { type SignOptions } from 'jsonwebtoken';
import { settings } from '../../config/settings.js';
import type { UserRecord } from '../users/user.model.js';

export function signUserAccessToken(user: UserRecord, expiresIn: string | number = '8h'): string {
  const primaryRole = user.roles[0] ?? 'operator';
  return jwt.sign(
    {
      sub: user.userId,
      email: user.email,
      roles: user.roles,
      buildings: user.buildingIds,
      userId: user.userId,
      buildingId: user.buildingIds[0] ?? '',
      role: primaryRole
    },
    settings.env.jwtSecret,
    { expiresIn } as SignOptions
  );
}
