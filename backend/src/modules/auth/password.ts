import { randomBytes, scrypt, scryptSync, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const KEYLEN = 64;
const SALT_LEN = 16;

/** scrypt hash format: `scrypt$<salt_b64>$<key_b64>` */
export function hashPasswordSync(plain: string): string {
  const salt = randomBytes(SALT_LEN);
  const derived = scryptSync(plain, salt, KEYLEN);
  return `scrypt$${salt.toString('base64')}$${derived.toString('base64')}`;
}

export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(SALT_LEN);
  const derived = (await scryptAsync(plain, salt, KEYLEN)) as Buffer;
  return `scrypt$${salt.toString('base64')}$${derived.toString('base64')}`;
}

export async function verifyPassword(plain: string, stored: string | undefined): Promise<boolean> {
  if (!stored || !stored.startsWith('scrypt$')) {
    return false;
  }
  const parts = stored.split('$');
  if (parts.length !== 3) {
    return false;
  }
  const [, saltB64, keyB64] = parts;
  const salt = Buffer.from(saltB64, 'base64');
  const expected = Buffer.from(keyB64, 'base64');
  const derived = (await scryptAsync(plain, salt, expected.length)) as Buffer;
  return timingSafeEqual(derived, expected);
}
