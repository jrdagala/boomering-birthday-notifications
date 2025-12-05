import { getRedisClient } from '../init/redis';

export class RedisService {
  static async setLastNotificationYear(year: number) {
    const redis = getRedisClient();
    await redis.set('lastNotificationYear', year.toString());
  }
  static async isUserNotified(userId: string): Promise<boolean> {
    const key = `notification:${userId}:${new Date().getFullYear()}`;
    const redis = getRedisClient();
    const exists = await redis.get(key);
    return !!exists;
  }
  static async setUserNotified(userId: string) {
    const key = `notification:${userId}:${new Date().getFullYear()}`;
    const redis = getRedisClient();
    await redis.set(key, 1, 'EX', 24 * 60 * 60);
  }
}
