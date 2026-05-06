import { createServer } from 'node:http';
import express from 'express';
import { describe, expect, it } from 'vitest';
import { createFixedWindowLimiter } from '../../src/api/middleware/memory-rate-limit.js';

describe('memory rate limit', () => {
  it('returns 429 with Retry-After after exceeding max in window', async () => {
    const app = express();
    const limiter = createFixedWindowLimiter({ windowMs: 60_000, max: 2 });
    app.get('/hit', limiter, (_req, res) => {
      res.status(200).json({ ok: true });
    });
    const server = createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const addr = server.address();
    const port = typeof addr === 'object' && addr ? addr.port : 0;
    const base = `http://127.0.0.1:${port}`;
    try {
      const a = await fetch(`${base}/hit`);
      const b = await fetch(`${base}/hit`);
      const c = await fetch(`${base}/hit`);
      expect(a.status).toBe(200);
      expect(b.status).toBe(200);
      expect(c.status).toBe(429);
      expect(c.headers.get('retry-after')).toBeTruthy();
      const body = (await c.json()) as { success: boolean; error: { code: string } };
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('RATE_LIMITED');
    } finally {
      await new Promise<void>((resolve, reject) => server.close((e) => (e ? reject(e) : resolve())));
    }
  });
});
