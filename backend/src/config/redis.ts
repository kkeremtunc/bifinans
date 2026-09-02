import Redis from 'ioredis';
import { env } from './env';

class InMemoryCache {
  private store = new Map<string, { value: string; expiresAt?: number }>();

  async set(key: string, value: string, mode?: string, duration?: number): Promise<void> {
    const expiresAt = duration ? Date.now() + duration * 1000 : undefined;
    this.store.set(key, { value, expiresAt });
  }

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}

const memoryStore = new InMemoryCache();
let redisClient: Redis | null = null;
let isRedisConnected = false;

try {
  redisClient = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 2) return null;
      return Math.min(times * 100, 1000);
    },
    lazyConnect: true,
  });

  redisClient.on('connect', () => {
    isRedisConnected = true;
    console.log('✅ Redis connected successfully.');
  });

  redisClient.on('error', (err) => {
    isRedisConnected = false;
  });

  redisClient.connect().catch(() => {
    console.warn('⚠️ Redis not available. Falling back to In-Memory store for caching & tokens.');
  });
} catch (e) {
  console.warn('⚠️ Redis initialization failed. Using In-Memory fallback.');
}

export const redis = {
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (isRedisConnected && redisClient) {
      if (ttlSeconds) {
        await redisClient.set(key, value, 'EX', ttlSeconds);
      } else {
        await redisClient.set(key, value);
      }
    } else {
      await memoryStore.set(key, value, 'EX', ttlSeconds);
    }
  },

  async get(key: string): Promise<string | null> {
    if (isRedisConnected && redisClient) {
      return await redisClient.get(key);
    }
    return await memoryStore.get(key);
  },

  async del(key: string): Promise<void> {
    if (isRedisConnected && redisClient) {
      await redisClient.del(key);
    } else {
      await memoryStore.del(key);
    }
  },
};
