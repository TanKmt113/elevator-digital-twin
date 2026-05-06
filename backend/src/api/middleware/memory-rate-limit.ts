import type { NextFunction, Request, RequestHandler, Response } from 'express';

interface WindowEntry {
  resetAt: number;
  count: number;
}

export interface FixedWindowLimiterOptions {
  windowMs: number;
  max: number;
  key?: (req: Request) => string;
  skip?: (req: Request) => boolean;
}

/**
 * Fixed-window per-key limiter (in-memory). Suitable for single-instance deployments;
 * use Redis-backed limits when horizontally scaled.
 */
export function createFixedWindowLimiter(options: FixedWindowLimiterOptions): RequestHandler {
  const store = new Map<string, WindowEntry>();
  const keyFn = options.key ?? ((req: Request) => req.ip ?? 'unknown');

  return (req: Request, res: Response, next: NextFunction): void => {
    if (options.skip?.(req)) {
      next();
      return;
    }
    const key = keyFn(req);
    const now = Date.now();
    let entry = store.get(key);
    if (!entry || now >= entry.resetAt) {
      entry = { resetAt: now + options.windowMs, count: 0 };
      store.set(key, entry);
    }
    entry.count += 1;
    if (entry.count > options.max) {
      const retrySec = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retrySec));
      res.status(429).json({
        success: false,
        data: null,
        error: { code: 'RATE_LIMITED', message: 'Too many requests; try again later.' }
      });
      return;
    }
    next();
  };
}
