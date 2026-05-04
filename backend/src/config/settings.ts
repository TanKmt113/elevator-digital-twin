import { loadEnv } from './env.js';

const env = loadEnv();

export const settings = {
  env,
  staleThresholdMs: 15_000,
  reconnectBackoffMs: [500, 1000, 2000, 5000],
  bootstrapTimeoutMs: env.dittoBootstrapTimeoutMs
};
