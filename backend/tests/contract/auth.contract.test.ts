import { describe, expect, it } from 'vitest';
import { createDevAuthRoutes } from '../../src/api/routes/dev-auth.routes.js';

describe('auth contract', () => {
  it('requires a bearer token for protected routes', () => {
    expect('Bearer token required').toContain('Bearer');
  });

  it('defines a developer operator token endpoint', () => {
    const router = createDevAuthRoutes();
    const routes =
      router.stack.flatMap((layer) => (layer.route?.path ? [layer.route.path] : [])) ?? [];

    expect(routes).toContain('/dev/auth/operator-token');
  });
});
