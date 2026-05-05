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
  mongoUrl: string;
  timescaleUrl: string;
  redisUrl: string;
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
    mongoUrl: process.env.MONGODB_URL ?? 'mongodb://localhost:27017/keangnam',
    timescaleUrl: process.env.TIMESCALE_URL ?? 'postgresql://postgres:postgres@localhost:5432/postgres',
    redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379'
  };
}
