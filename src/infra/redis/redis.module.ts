import { Module, Global, Logger } from '@nestjs/common';
import { createClient } from 'redis';
import { RedisService } from './redis.service';
import { redisConfig } from './redis.config';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const logger = new Logger('RedisClient');
        const client = createClient({
          url: redisConfig.url,
          database: redisConfig.database,
          socket: {
            reconnectStrategy: (retries) => {
              logger.warn(`Redis 재연결 시도 중... (시도 횟수: ${retries})`);
              return Math.min(retries * 1000, 10000);
            },
          },
        });

        client.on('error', (err) => {
          logger.error('Redis 오류:', err);
        });

        client.on('connect', () => {
          logger.log('Redis 서버에 연결되었습니다.');
        });

        client.on('reconnecting', () => {
          logger.warn('Redis 서버에 재연결 중...');
        });

        await client.connect();
        return client;
      },
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
