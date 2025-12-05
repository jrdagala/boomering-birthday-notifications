import Redis, { RedisOptions } from 'ioredis';
import { getEnvConfig } from '../config';
import { initLogger } from '../utils/logger';

let redisClient: Redis | null = null;

/**
 * Initialize Redis client with configuration from environment variables
 * @returns Redis client instance
 */
export function initializeRedis(): Redis {
  const { redis } = getEnvConfig();
  const logger = initLogger('Redis');

  const redisOptions: RedisOptions = {
    host: redis.host,
    port: redis.port,
    db: redis.db || 0,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
  };

  redisClient = new Redis(redisOptions);

  // Handle connection events
  redisClient.on('connect', () => {
    logger.info('Redis client connecting...');
  });

  redisClient.on('ready', () => {
    logger.info('Redis client ready');
  });

  redisClient.on('error', (error) => {
    logger.error('Redis client error:', error);
  });

  redisClient.on('close', () => {
    logger.info('Redis client connection closed');
  });

  return redisClient;
}

/**
 * Get the current Redis client instance
 * @returns Redis client instance
 */
export function getRedisClient(): Redis {
  return redisClient || initializeRedis();
}

/**
 * Close Redis client connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

export { Redis };
