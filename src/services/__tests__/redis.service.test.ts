import { RedisService } from '../redis.service';
import * as redis from '../../init/redis';

jest.mock('../../init/redis');

describe('RedisService', () => {
  let mockRedisClient: any;
  let mockGetRedisClient: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRedisClient = {
      get: jest.fn(),
      set: jest.fn(),
    };

    mockGetRedisClient = jest.spyOn(redis, 'getRedisClient').mockReturnValue(mockRedisClient);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('setLastNotificationYear', () => {
    it('should set lastNotificationYear in Redis', async () => {
      const year = 2024;

      await RedisService.setLastNotificationYear(year);

      expect(mockGetRedisClient).toHaveBeenCalled();
      expect(mockRedisClient.set).toHaveBeenCalledWith('lastNotificationYear', '2024');
    });

    it('should convert number to string when setting year', async () => {
      const year = 2025;

      await RedisService.setLastNotificationYear(year);

      expect(mockRedisClient.set).toHaveBeenCalledWith('lastNotificationYear', '2025');
    });
  });

  describe('isUserNotified', () => {
    it('should return true when user is already notified', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const currentYear = new Date().getFullYear();
      const key = `notification:${userId}:${currentYear}`;

      mockRedisClient.get.mockResolvedValue('1');

      const result = await RedisService.isUserNotified(userId);

      expect(mockGetRedisClient).toHaveBeenCalled();
      expect(mockRedisClient.get).toHaveBeenCalledWith(key);
      expect(result).toBe(true);
    });

    it('should return false when user is not notified', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174001';
      const currentYear = new Date().getFullYear();
      const key = `notification:${userId}:${currentYear}`;

      mockRedisClient.get.mockResolvedValue(null);

      const result = await RedisService.isUserNotified(userId);

      expect(mockRedisClient.get).toHaveBeenCalledWith(key);
      expect(result).toBe(false);
    });

    it('should use current year in the key', async () => {
      const userId = 'test-user-id';
      const currentYear = new Date().getFullYear();

      mockRedisClient.get.mockResolvedValue(null);

      await RedisService.isUserNotified(userId);

      expect(mockRedisClient.get).toHaveBeenCalledWith(`notification:${userId}:${currentYear}`);
    });
  });

  describe('setUserNotified', () => {
    it('should set user as notified with expiration', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const currentYear = new Date().getFullYear();
      const key = `notification:${userId}:${currentYear}`;
      const expiration = 24 * 60 * 60; // 24 hours

      await RedisService.setUserNotified(userId);

      expect(mockGetRedisClient).toHaveBeenCalled();
      expect(mockRedisClient.set).toHaveBeenCalledWith(key, 1, 'EX', expiration);
    });

    it('should use current year in the key', async () => {
      const userId = 'test-user-123';
      const currentYear = new Date().getFullYear();

      await RedisService.setUserNotified(userId);

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        `notification:${userId}:${currentYear}`,
        1,
        'EX',
        86400
      );
    });

    it('should set 24 hour expiration', async () => {
      const userId = 'user-456';

      await RedisService.setUserNotified(userId);

      const callArgs = mockRedisClient.set.mock.calls[0];
      expect(callArgs[2]).toBe('EX');
      expect(callArgs[3]).toBe(86400); // 24 * 60 * 60
    });
  });
});
