import { loadEnv } from './env.js';

const env = loadEnv();

export const settings = {
  env,
  staleThresholdMs: env.staleThresholdMs,
  reconnectBackoffMs: env.realtimeReconnectBackoffMs.length > 0 ? env.realtimeReconnectBackoffMs : [500, 1000, 2000, 5000],
  bootstrapTimeoutMs: env.dittoBootstrapTimeoutMs
};
