import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface EnvConfig {
  port: number;
  jwtSecret: string;
  devAuthEnabled: boolean;
  corsOrigins: string[];
  dittoHttpUrl: string;
  dittoWsUrl: string;
  dittoUsername?: string;
  dittoPassword?: string;
  dittoBearerToken?: string;
  twinSyncEnabled: boolean;
  dittoBootstrapTimeoutMs: number;
  staleThresholdMs: number;
  realtimeReconnectBackoffMs: number[];
  mongoUrl: string;
  timescaleUrl: string;
  redisUrl: string;
  /** Default Ditto policy id for elevator Things created via provisioning API. */
  defaultElevatorPolicyId: string;
  /** When true, skips API v1 in-memory rate limits (e.g. tests). */
  apiRateLimitDisabled: boolean;
  /** Max requests per IP per minute for `POST /api/v1/auth/login`. */
  apiRateLimitLoginRpm: number;
  /** Max mutating provisioning requests per IP per minute (create/patch/archive). */
  apiRateLimitProvisionRpm: number;
  /** Selects admin user/audit persistence. Use `postgres` with `ADMIN_POSTGRES_URL` in deployments. */
  adminPersistence: 'memory' | 'postgres';
  /** PostgreSQL connection string for admin users and audit records. */
  adminPostgresUrl?: string;
}

let envLoaded = false;

function ensureEnvLoaded(): void {
  if (envLoaded) {
    return;
  }

  const configDir = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    resolve(process.cwd(), '.env'),
    resolve(configDir, '../../.env')
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      process.loadEnvFile(candidate);
      break;
    }
  }

  envLoaded = true;
}

export function loadEnv(): EnvConfig {
  ensureEnvLoaded();

  const corsOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    port: Number(process.env.PORT ?? 3000),
    jwtSecret: process.env.JWT_SECRET ?? 'change-me',
    devAuthEnabled: process.env.DEV_AUTH_ENABLED !== 'false',
    corsOrigins,
    dittoHttpUrl: process.env.DITTO_HTTP_URL ?? 'http://localhost:8080',
    dittoWsUrl: process.env.DITTO_WS_URL ?? 'ws://localhost:8080/ws/2',
    dittoUsername: process.env.DITTO_USERNAME,
    dittoPassword: process.env.DITTO_PASSWORD,
    dittoBearerToken: process.env.DITTO_BEARER_TOKEN,
    twinSyncEnabled: process.env.TWIN_SYNC_ENABLED !== 'false',
    dittoBootstrapTimeoutMs: Number(process.env.DITTO_BOOTSTRAP_TIMEOUT_MS ?? 5000),
    staleThresholdMs: Number(process.env.STALE_THRESHOLD_MS ?? 2000),
    realtimeReconnectBackoffMs: (process.env.REALTIME_RECONNECT_BACKOFF_MS ?? '500,1000,2000,5000')
      .split(',')
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isFinite(value) && value >= 0),
    mongoUrl: process.env.MONGODB_URL ?? 'mongodb://localhost:27017/keangnam',
    timescaleUrl: process.env.TIMESCALE_URL ?? 'postgresql://postgres:postgres@localhost:5432/postgres',
    redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
    defaultElevatorPolicyId:
      process.env.DEFAULT_ELEVATOR_POLICY_ID ?? 'org.example:l72-elevator-policy',
    apiRateLimitDisabled:
      process.env.API_RATE_LIMIT_DISABLED === 'true' || process.env.NODE_ENV === 'test',
    apiRateLimitLoginRpm: Number(process.env.API_V1_LOGIN_RPM ?? '30'),
    apiRateLimitProvisionRpm: Number(process.env.API_V1_PROVISION_RPM ?? '120'),
    adminPersistence: process.env.ADMIN_PERSISTENCE === 'postgres' ? 'postgres' : 'memory',
    adminPostgresUrl: process.env.ADMIN_POSTGRES_URL
  };
}
