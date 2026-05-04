import { loadEnv } from './env.js';

export const settings = {
  env: loadEnv(),
  staleThresholdMs: 15_000,
  reconnectBackoffMs: [500, 1000, 2000, 5000]
};
