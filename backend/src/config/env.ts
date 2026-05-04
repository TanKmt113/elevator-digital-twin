export interface EnvConfig {
  port: number;
  jwtSecret: string;
  dittoWsUrl: string;
  mongoUrl: string;
  timescaleUrl: string;
  redisUrl: string;
}

export function loadEnv(): EnvConfig {
  return {
    port: Number(process.env.PORT ?? 3000),
    jwtSecret: process.env.JWT_SECRET ?? 'change-me',
    dittoWsUrl: process.env.DITTO_WS_URL ?? 'ws://localhost:8080/ws/2',
    mongoUrl: process.env.MONGODB_URL ?? 'mongodb://localhost:27017/keangnam',
    timescaleUrl: process.env.TIMESCALE_URL ?? 'postgresql://postgres:postgres@localhost:5432/postgres',
    redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379'
  };
}
