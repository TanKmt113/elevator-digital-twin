const attempts = new Map<string, number>();

export function recordAuthAttempt(key: string): number {
  const next = (attempts.get(key) ?? 0) + 1;
  attempts.set(key, next);
  return next;
}
