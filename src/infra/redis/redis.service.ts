import { Injectable, Inject, OnModuleDestroy, Logger } from '@nestjs/common';
import type { RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: RedisClientType,
  ) {}

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.set(key, value, { EX: ttl });
    } else {
      await this.redis.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async saveContext(sessionId: string, messages: any[], ttl = 3600): Promise<void> {
    await this.set(`context:${sessionId}`, JSON.stringify(messages), ttl);
    this.logger.debug(`컨텍스트 저장: ${sessionId}`);
  }

  async getContext(sessionId: string): Promise<any[]> {
    const data = await this.get(`context:${sessionId}`);
    return data ? JSON.parse(data) : [];
  }

  async appendMessage(sessionId: string, message: any, ttl = 3600): Promise<void> {
    const messages = await this.getContext(sessionId);
    messages.push(message);
    await this.saveContext(sessionId, messages, ttl);
  }

  async deleteContext(sessionId: string): Promise<void> {
    await this.del(`context:${sessionId}`);
    this.logger.debug(`컨텍스트 삭제: ${sessionId}`);
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
