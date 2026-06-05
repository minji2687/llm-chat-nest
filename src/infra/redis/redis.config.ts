export const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  database: parseInt(process.env.REDIS_DB || '0'),
};
