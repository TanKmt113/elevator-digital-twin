import { Router } from 'express';
import type { DittoClient } from '../../integrations/ditto/ditto-client.js';
import { settings } from '../../config/settings.js';
import { createFixedWindowLimiter } from '../middleware/memory-rate-limit.js';
import { jsonError, jsonSuccess } from '../http/envelope.js';
import { authenticateJwt, hasBuildingScope, type AuthenticatedRequest } from '../../modules/auth/auth.middleware.js';
import { requirePlatformAdmin, requireThingProvisioningRole } from '../../modules/auth/rbac.js';
import { verifyPassword } from '../../modules/auth/password.js';
import { signUserAccessToken } from '../../modules/auth/jwt-sign.js';
import type { AuditRepository } from '../../modules/audit/audit.repository.js';
import type { UserRepository } from '../../modules/users/user.repository.js';
import {
  adminCreateUserBodySchema,
  elevatorThingPatchBodySchema,
  elevatorThingProvisionBodySchema,
  loginBodySchema
} from '../../modules/provisioning/elevator-thing.schema.js';
import { ThingProvisioningService } from '../../modules/provisioning/thing-provisioning.service.js';
import { logger } from '../../observability/logger.js';

function paramString(value: string | string[] | undefined): string {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }
  return '';
}

function correlationId(req: AuthenticatedRequest): string {
  const raw = req.headers['x-correlation-id'];
  return typeof raw === 'string' && raw.length > 0 ? raw : `corr-${Date.now()}`;
}

export interface ApiV1RouterDeps {
  userRepository: UserRepository;
  auditRepository: AuditRepository;
  dittoClient: DittoClient;
  defaultElevatorPolicyId: string;
  onThingMutated?: () => Promise<unknown>;
}

export function createApiV1Router(deps: ApiV1RouterDeps): Router {
  const router = Router();
  const loginLimiter = createFixedWindowLimiter({
    windowMs: 60_000,
    max: Math.max(1, settings.env.apiRateLimitLoginRpm),
    skip: () => settings.env.apiRateLimitDisabled
  });
  const provisionLimiter = createFixedWindowLimiter({
    windowMs: 60_000,
    max: Math.max(1, settings.env.apiRateLimitProvisionRpm),
    skip: () => settings.env.apiRateLimitDisabled
  });
  const provisioning = new ThingProvisioningService(
    deps.dittoClient,
    deps.auditRepository,
    deps.defaultElevatorPolicyId
  );

  router.post('/auth/login', loginLimiter, async (req, res) => {
    const parsed = loginBodySchema.safeParse(req.body);
    if (!parsed.success) {
      jsonError(res, 400, 'VALIDATION_ERROR', 'Invalid request body', parsed.error.flatten());
      return;
    }
    const user = await deps.userRepository.findByEmail(parsed.data.email);
    const okPass = user?.passwordHash
      ? await verifyPassword(parsed.data.password, user.passwordHash)
      : false;
    if (!user || user.status !== 'active' || !okPass) {
      jsonError(res, 401, 'UNAUTHENTICATED', 'Invalid credentials');
      return;
    }
    await deps.userRepository.touchLogin(user.userId);
    const token = signUserAccessToken(user);
    jsonSuccess(res, 200, {
      token,
      tokenType: 'Bearer',
      expiresIn: '8h',
      user: {
        userId: user.userId,
        email: user.email,
        roles: user.roles,
        buildings: user.buildingIds
      }
    });
  });

  const admin = Router();
  admin.use(authenticateJwt, requirePlatformAdmin);
  admin.get('/users', async (_req, res) => {
    const rows = (await deps.userRepository.list()).map((u) => ({
      userId: u.userId,
      email: u.email,
      status: u.status,
      roles: u.roles,
      buildings: u.buildingIds,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt
    }));
    jsonSuccess(res, 200, { items: rows });
  });
  admin.post('/users', provisionLimiter, async (req: AuthenticatedRequest, res) => {
    const parsed = adminCreateUserBodySchema.safeParse(req.body);
    if (!parsed.success) {
      jsonError(res, 400, 'VALIDATION_ERROR', 'Invalid request body', parsed.error.flatten());
      return;
    }
    try {
      const created = await deps.userRepository.createUser({
        email: parsed.data.email,
        password: parsed.data.password,
        roles: parsed.data.roles,
        buildingIds: parsed.data.buildingIds ?? []
      });
      await deps.auditRepository.append({
        actorUserId: req.user?.userId ?? 'unknown',
        action: 'user.create',
        resourceType: 'user',
        resourceId: created.userId,
        payloadSummary: { email: created.email, roles: created.roles },
        outcome: 'success',
        correlationId: correlationId(req)
      });
      jsonSuccess(res, 201, {
        userId: created.userId,
        email: created.email,
        status: created.status,
        roles: created.roles,
        buildings: created.buildingIds
      });
    } catch (e) {
      if (e instanceof Error && e.message === 'USER_EXISTS') {
        jsonError(res, 409, 'USER_EXISTS', 'User already exists');
        return;
      }
      throw e;
    }
  });
  router.use('/admin', admin);

  const things = Router();
  things.use(authenticateJwt, requireThingProvisioningRole);
  things.post('/buildings/:buildingId/elevators/things', provisionLimiter, async (req: AuthenticatedRequest, res) => {
    const buildingId = paramString(req.params.buildingId);
    if (!hasBuildingScope(req, buildingId)) {
      jsonError(res, 403, 'OUT_OF_SCOPE', 'Building not in token scope');
      return;
    }
    const parsed = elevatorThingProvisionBodySchema.safeParse(req.body);
    if (!parsed.success) {
      jsonError(res, 400, 'VALIDATION_ERROR', 'Invalid request body', parsed.error.flatten());
      return;
    }
    const corr = correlationId(req);
    try {
      const result = await provisioning.createThing(
        buildingId,
        parsed.data,
        req.user?.userId ?? 'unknown',
        corr
      );
      await deps.onThingMutated?.().catch(() => undefined);
      jsonSuccess(res, 201, result);
    } catch (error) {
      const err = error as Error & { status?: number };
      if (err.status === 409 || err.message === 'THING_EXISTS') {
        jsonError(res, 409, 'THING_EXISTS', 'Thing already exists');
        return;
      }
      const mapped = provisioning.mapDittoFailure(error);
      logger.error('thing_provision_failed', { buildingId, error: err.message, correlationId: corr });
      jsonError(res, mapped.status, mapped.code, mapped.message);
    }
  });
  things.get('/buildings/:buildingId/elevators/things/:thingId', async (req: AuthenticatedRequest, res) => {
    const buildingId = paramString(req.params.buildingId);
    const thingId = paramString(req.params.thingId);
    if (!hasBuildingScope(req, buildingId)) {
      jsonError(res, 403, 'OUT_OF_SCOPE', 'Building not in token scope');
      return;
    }
    const corr = correlationId(req);
    try {
      const thing = await provisioning.getThing(buildingId, thingId);
      jsonSuccess(res, 200, { thing });
    } catch (error) {
      const err = error as Error & { status?: number };
      if (err.status === 404) {
        jsonError(res, 404, 'THING_NOT_FOUND', 'Thing not found');
        return;
      }
      const mapped = provisioning.mapDittoFailure(error);
      logger.error('thing_get_failed', { buildingId, thingId, correlationId: corr });
      jsonError(res, mapped.status, mapped.code, mapped.message);
    }
  });
  things.patch(
    '/buildings/:buildingId/elevators/things/:thingId',
    provisionLimiter,
    async (req: AuthenticatedRequest, res) => {
    const buildingId = paramString(req.params.buildingId);
    const thingId = paramString(req.params.thingId);
    if (!hasBuildingScope(req, buildingId)) {
      jsonError(res, 403, 'OUT_OF_SCOPE', 'Building not in token scope');
      return;
    }
    const parsed = elevatorThingPatchBodySchema.safeParse(req.body);
    if (!parsed.success) {
      jsonError(res, 400, 'VALIDATION_ERROR', 'Invalid request body', parsed.error.flatten());
      return;
    }
    const corr = correlationId(req);
    try {
      await provisioning.patchThing(buildingId, thingId, parsed.data, req.user?.userId ?? 'unknown', corr);
      await deps.onThingMutated?.().catch(() => undefined);
      jsonSuccess(res, 200, { thingId, buildingId, updated: true });
    } catch (error) {
      const err = error as Error & { status?: number };
      if (err.status === 404) {
        jsonError(res, 404, 'THING_NOT_FOUND', 'Thing not found');
        return;
      }
      const mapped = provisioning.mapDittoFailure(error);
      jsonError(res, mapped.status, mapped.code, mapped.message);
    }
  });
  things.post(
    '/buildings/:buildingId/elevators/things/:thingId/archive',
    provisionLimiter,
    async (req: AuthenticatedRequest, res) => {
    const buildingId = paramString(req.params.buildingId);
    const thingId = paramString(req.params.thingId);
    if (!hasBuildingScope(req, buildingId)) {
      jsonError(res, 403, 'OUT_OF_SCOPE', 'Building not in token scope');
      return;
    }
    const corr = correlationId(req);
    try {
      await provisioning.archiveThing(buildingId, thingId, req.user?.userId ?? 'unknown', corr);
      await deps.onThingMutated?.().catch(() => undefined);
      jsonSuccess(res, 200, { thingId, buildingId, archived: true });
    } catch (error) {
      const err = error as Error & { status?: number };
      if (err.status === 404) {
        jsonError(res, 404, 'THING_NOT_FOUND', 'Thing not found');
        return;
      }
      const mapped = provisioning.mapDittoFailure(error);
      jsonError(res, mapped.status, mapped.code, mapped.message);
    }
  });
  router.use(things);

  return router;
}
