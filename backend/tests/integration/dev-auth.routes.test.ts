import { describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { createDevAuthRoutes } from '../../src/api/routes/dev-auth.routes.js';
import { settings } from '../../src/config/settings.js';

describe('dev auth routes', () => {
  it('registers the operator token endpoint', () => {
    const router = createDevAuthRoutes();
    const routes =
      router.stack.flatMap((layer) => (layer.route?.path ? [layer.route.path] : [])) ?? [];

    expect(routes).toContain('/dev/auth/operator-token');
  });

  it('issues a JWT for a local operator scope', () => {
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));
    const next = vi.fn();
    const req = {
      body: {
        userId: 'dev-operator-1',
        buildingId: 'L72',
        role: 'operator'
      }
    } as any;
    const res = { json, status } as any;
    const route = createDevAuthRoutes().stack.find(
      (layer) => layer.route?.path === '/dev/auth/operator-token'
    )?.route;

    const handler = route?.stack[0]?.handle;
    expect(handler).toBeTypeOf('function');

    handler?.(req, res, next);

    expect(status).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'operator',
        buildingId: 'L72',
        tokenType: 'Bearer',
        expiresIn: '1d',
        token: expect.any(String)
      })
    );

    const [{ token }] = json.mock.calls[0] as [{ token: string }];
    expect(jwt.verify(token, settings.env.jwtSecret)).toMatchObject({
      userId: 'dev-operator-1',
      buildingId: 'L72',
      role: 'operator'
    });
  });
});
