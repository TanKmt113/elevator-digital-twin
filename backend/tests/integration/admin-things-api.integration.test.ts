import { createServer } from 'node:http';
import express from 'express';
import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import type { Express } from 'express';
import { createApiV1Router } from '../../src/api/routes/api-v1.routes.js';
import type { DittoClient, DittoThing } from '../../src/integrations/ditto/ditto-client.js';
import { DittoRequestError } from '../../src/integrations/ditto/ditto-client.js';
import { InMemoryAuditRepository } from '../../src/modules/audit/audit.repository.js';
import { InMemoryUserRepository } from '../../src/modules/users/in-memory-user.repository.js';
import { settings } from '../../src/config/settings.js';

class MockDittoClient implements Pick<DittoClient, 'getThing' | 'getThingOrNull' | 'upsertThing' | 'mergePatchThing'> {
  things = new Map<string, DittoThing>();

  async getThing(thingId: string): Promise<DittoThing> {
    const t = this.things.get(thingId);
    if (!t) {
      throw new DittoRequestError('not found', 404);
    }
    return t;
  }

  async getThingOrNull(thingId: string): Promise<DittoThing | null> {
    return this.things.get(thingId) ?? null;
  }

  async upsertThing(thingId: string, thing: DittoThing): Promise<void> {
    this.things.set(thingId, { ...thing, thingId });
  }

  async mergePatchThing(): Promise<void> {
    return;
  }
}

function buildV1App(): { app: Express; ditto: MockDittoClient; users: InMemoryUserRepository } {
  const app = express();
  app.use(express.json());
  const ditto = new MockDittoClient();
  const users = new InMemoryUserRepository();
  users.seedTestPlatformAdmin();
  const audit = new InMemoryAuditRepository();
  app.use(
    '/api/v1',
    createApiV1Router({
      userRepository: users,
      auditRepository: audit,
      dittoClient: ditto as unknown as DittoClient,
      defaultElevatorPolicyId: 'org.example:l72-elevator-policy'
    })
  );
  return { app, ditto, users };
}

async function withBaseUrl(app: Express, fn: (baseUrl: string) => Promise<void>): Promise<void> {
  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const addr = server.address();
  const port = typeof addr === 'object' && addr ? addr.port : 0;
  const baseUrl = `http://127.0.0.1:${port}`;
  try {
    await fn(baseUrl);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  }
}

function jwtSign(payload: Record<string, unknown>): string {
  return jwt.sign(payload, settings.env.jwtSecret, { expiresIn: '1h' });
}

describe('009 admin API — auth, RBAC, thing provisioning', () => {
  it('logs in, lists users as platform admin, and provisions in building scope', async () => {
    const { app, ditto } = buildV1App();

    await withBaseUrl(app, async (base) => {
      const loginRes = await fetch(`${base}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@example.com', password: 'test-admin-pass' })
      });
      expect(loginRes.status).toBe(200);
      const loginJson = (await loginRes.json()) as { success: boolean; data: { token: string } };
      expect(loginJson.success).toBe(true);
      const token = loginJson.data.token;

      const buildingAdminToken = jwtSign({
        sub: 'ba-1',
        email: 'ba@example.com',
        roles: ['building_admin'],
        buildings: ['L72'],
        userId: 'ba-1',
        buildingId: 'L72',
        role: 'building_admin'
      });

      const createRes = await fetch(`${base}/api/v1/buildings/L72/elevators/things`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${buildingAdminToken}`,
          'Content-Type': 'application/json',
          'X-Correlation-Id': 'test-create-1'
        },
        body: JSON.stringify({
          thingId: 'org.example:L72-ELEV-Z',
          shaftId: 'shaft-z',
          properties: { status: 'idle', currentFloor: 2, targetFloor: 2 }
        })
      });
      expect(createRes.status).toBe(201);
      const createBody = (await createRes.json()) as { success: boolean; data: { thingId: string } };
      expect(createBody.success).toBe(true);
      expect(ditto.things.has('org.example:L72-ELEV-Z')).toBe(true);

      const deny = await fetch(`${base}/api/v1/buildings/L99/elevators/things`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${buildingAdminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          thingId: 'org.example:L99-ELEV-X',
          shaftId: 'shaft-x',
          properties: { status: 'idle' }
        })
      });
      expect(deny.status).toBe(403);

      const operatorToken = jwtSign({
        sub: 'op-1',
        email: 'op@example.com',
        roles: ['operator'],
        buildings: ['L72'],
        userId: 'op-1',
        buildingId: 'L72',
        role: 'operator'
      });
      const opDeny = await fetch(`${base}/api/v1/buildings/L72/elevators/things`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${operatorToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ thingId: 'org.example:L72-ELEV-Y', shaftId: 'shaft-y', properties: {} })
      });
      expect(opDeny.status).toBe(403);

      const adminList = await fetch(`${base}/api/v1/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      expect(adminList.status).toBe(200);
      const listJson = (await adminList.json()) as { success: boolean; data: { items: unknown[] } };
      expect(listJson.data.items.length).toBeGreaterThan(0);
    });
  });
});
