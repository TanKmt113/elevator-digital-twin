export function isSessionExpired(issuedAtIso: string, ttlMs = 60 * 60 * 1000): boolean {
  return Date.now() - new Date(issuedAtIso).getTime() > ttlMs;
}
