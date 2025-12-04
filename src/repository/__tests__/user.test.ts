import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from '../user';
import User from '../../models/user';
import * as timezoneUtils from '../../utils/timezone';
import { CreateUserInput, UpdateUserInput } from '../../types/user';

// Mock dependencies
jest.mock('uuid');
jest.mock('../../models/user');
jest.mock('../../utils/timezone');

describe('UserRepository', () => {
  let repository: UserRepository;
  let mockUser: any;
  let mockCalculateNextBirthdayUTC: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new UserRepository();

    // Mock timezone utilities
    (timezoneUtils.getCurrentYear as jest.Mock).mockReturnValue(2024);
    mockCalculateNextBirthdayUTC = jest
      .spyOn(timezoneUtils, 'calculateNextBirthdayUTC')
      .mockReturnValue('2024-12-25T14:00:00.000Z');

    // Mock uuid
    (uuidv4 as jest.Mock).mockReturnValue('123e4567-e89b-12d3-a456-426614174000');

    // Create mock user object
    mockUser = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      firstName: 'John',
      lastName: 'Doe',
      birthday: '1990-12-25',
      city: 'New York',
      state: 'New York',
      country: 'USA',
      nextBirthdayUTC: '2024-12-25T14:00:00.000Z',
      lastNotificationYear: 0,
      save: jest.fn().mockResolvedValue(undefined),
      toJSON: jest.fn().mockReturnValue({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        firstName: 'John',
        lastName: 'Doe',
        birthday: '1990-12-25',
        city: 'New York',
        state: 'New York',
        country: 'USA',
        nextBirthdayUTC: '2024-12-25T14:00:00.000Z',
        lastNotificationYear: 0,
      }),
    };

    // Mock User model constructor
    (User as any).mockImplementation(() => mockUser);
  });

  describe('createUser', () => {
    it('should create user with generated UUID', async () => {
      const input: CreateUserInput = {
        firstName: 'John',
        lastName: 'Doe',
        birthday: '1990-12-25',
        city: 'New York',
        state: 'New York',
        country: 'USA',
      };

      const result = await repository.createUser(input);

      expect(uuidv4).toHaveBeenCalled();
      expect(User).toHaveBeenCalledWith({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        ...input,
        nextBirthdayUTC: '2024-12-25T14:00:00.000Z',
        lastNotificationYear: 0,
      });
      expect(mockUser.save).toHaveBeenCalled();
      expect(result.userId).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should calculate nextBirthdayUTC based on location', async () => {
      const input: CreateUserInput = {
        firstName: 'Jane',
        lastName: 'Smith',
        birthday: '1985-06-15',
        city: 'London',
        country: 'UK',
      };

      await repository.createUser(input);

      expect(mockCalculateNextBirthdayUTC).toHaveBeenCalledWith('1985-06-15', {
        city: 'London',
        state: undefined,
        country: 'UK',
      });
    });

    it('should set lastNotificationYear to 0 for new users', async () => {
      const input: CreateUserInput = {
        firstName: 'John',
        lastName: 'Doe',
        birthday: '1990-12-25',
        city: 'New York',
        country: 'USA',
      };

      const result = await repository.createUser(input);

      expect(result.lastNotificationYear).toBe(0);
    });

    it('should return user as JSON', async () => {
      const input: CreateUserInput = {
        firstName: 'John',
        lastName: 'Doe',
        birthday: '1990-12-25',
        city: 'New York',
        country: 'USA',
      };

      const result = await repository.createUser(input);

      expect(mockUser.toJSON).toHaveBeenCalled();
      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('firstName', 'John');
    });
  });

  describe('deleteUser', () => {
    it('should delete existing user', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      (User.get as jest.Mock) = jest.fn().mockResolvedValue(mockUser);
      (User.delete as jest.Mock) = jest.fn().mockResolvedValue(undefined);

      const result = await repository.deleteUser(userId);

      expect(User.get).toHaveBeenCalledWith(userId);
      expect(User.delete).toHaveBeenCalledWith(userId);
      expect(result).toHaveProperty('userId', userId);
    });

    it('should throw error if user not found', async () => {
      const userId = 'non-existent-id';

      (User.get as jest.Mock) = jest.fn().mockResolvedValue(null);

      await expect(repository.deleteUser(userId)).rejects.toThrow(`User ${userId} not found`);
      expect(User.delete).not.toHaveBeenCalled();
    });

    it('should return deleted user data', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      (User.get as jest.Mock) = jest.fn().mockResolvedValue(mockUser);
      (User.delete as jest.Mock) = jest.fn().mockResolvedValue(undefined);

      const result = await repository.deleteUser(userId);

      expect(mockUser.toJSON).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ userId }));
    });
  });

  describe('updateUser', () => {
    beforeEach(() => {
      (User.get as jest.Mock) = jest.fn().mockResolvedValue(mockUser);
    });

    it('should update user fields', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updates: UpdateUserInput = {
        userId,
        firstName: 'Jane',
        lastName: 'Smith',
      };

      await repository.updateUser(userId, updates);

      expect(User.get).toHaveBeenCalledWith(userId);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should recalculate nextBirthdayUTC when birthday changes', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updates: UpdateUserInput = {
        userId,
        birthday: '1990-01-01',
      };

      await repository.updateUser(userId, updates);

      expect(mockCalculateNextBirthdayUTC).toHaveBeenCalled();
    });

    it('should recalculate nextBirthdayUTC when city changes', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updates: UpdateUserInput = {
        userId,
        city: 'Los Angeles',
      };

      await repository.updateUser(userId, updates);

      expect(mockCalculateNextBirthdayUTC).toHaveBeenCalled();
    });

    it('should recalculate nextBirthdayUTC when state changes', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updates: UpdateUserInput = {
        userId,
        state: 'California',
      };

      await repository.updateUser(userId, updates);

      expect(mockCalculateNextBirthdayUTC).toHaveBeenCalled();
    });

    it('should recalculate nextBirthdayUTC when country changes', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updates: UpdateUserInput = {
        userId,
        country: 'Canada',
      };

      await repository.updateUser(userId, updates);

      expect(mockCalculateNextBirthdayUTC).toHaveBeenCalled();
    });

    it('should not recalculate nextBirthdayUTC when only name changes', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updates: UpdateUserInput = {
        userId,
        firstName: 'Jane',
      };

      mockCalculateNextBirthdayUTC.mockClear();
      await repository.updateUser(userId, updates);

      expect(mockCalculateNextBirthdayUTC).not.toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      const userId = 'non-existent-id';
      (User.get as jest.Mock) = jest.fn().mockResolvedValue(null);

      await expect(repository.updateUser(userId, { userId, firstName: 'Test' })).rejects.toThrow(
        `User ${userId} not found`
      );
    });

    it('should return updated user as JSON', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updates: UpdateUserInput = {
        userId,
        firstName: 'Jane',
      };

      const result = await repository.updateUser(userId, updates);

      expect(mockUser.toJSON).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('getUsersForNotification', () => {
    it('should query users with nextBirthdayUTC <= now', async () => {
      const mockQuery = {
        le: jest.fn().mockReturnThis(),
        using: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          {
            ...mockUser,
            lastNotificationYear: 2023,
            toJSON: () => mockUser.toJSON(),
          },
        ]),
      };

      (User.query as jest.Mock) = jest.fn().mockReturnValue(mockQuery);

      await repository.getUsersForNotification();

      expect(User.query).toHaveBeenCalledWith('nextBirthdayUTC');
      expect(mockQuery.le).toHaveBeenCalled();
      expect(mockQuery.using).toHaveBeenCalledWith('nextBirthdayIndex');
      expect(mockQuery.exec).toHaveBeenCalled();
    });

    it('should filter users by lastNotificationYear < currentYear', async () => {
      const users = [
        {
          ...mockUser,
          userId: 'user-1',
          lastNotificationYear: 2023,
          toJSON: () => ({ userId: 'user-1', lastNotificationYear: 2023 }),
        },
        {
          ...mockUser,
          userId: 'user-2',
          lastNotificationYear: 2024,
          toJSON: () => ({ userId: 'user-2', lastNotificationYear: 2024 }),
        },
        {
          ...mockUser,
          userId: 'user-3',
          lastNotificationYear: 2022,
          toJSON: () => ({ userId: 'user-3', lastNotificationYear: 2022 }),
        },
      ];

      const mockQuery = {
        le: jest.fn().mockReturnThis(),
        using: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(users),
      };

      (User.query as jest.Mock) = jest.fn().mockReturnValue(mockQuery);

      const results = await repository.getUsersForNotification();

      // Should filter out user-2 (already notified this year)
      expect(results).toHaveLength(2);
      expect(results.map((u: any) => u.userId)).toEqual(['user-1', 'user-3']);
    });

    it('should return empty array if no users found', async () => {
      const mockQuery = {
        le: jest.fn().mockReturnThis(),
        using: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      (User.query as jest.Mock) = jest.fn().mockReturnValue(mockQuery);

      const results = await repository.getUsersForNotification();

      expect(results).toEqual([]);
    });
  });

  describe('markNotificationSent', () => {
    beforeEach(() => {
      (User.get as jest.Mock) = jest.fn().mockResolvedValue(mockUser);
    });

    it('should update lastNotificationYear to current year', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      await repository.markNotificationSent(userId);

      expect(mockUser.lastNotificationYear).toBe(2024);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should recalculate nextBirthdayUTC for next year', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      await repository.markNotificationSent(userId);

      expect(mockCalculateNextBirthdayUTC).toHaveBeenCalledWith('1990-12-25', {
        city: 'New York',
        state: 'New York',
        country: 'USA',
      });
    });

    it('should throw error if user not found', async () => {
      const userId = 'non-existent-id';
      (User.get as jest.Mock) = jest.fn().mockResolvedValue(null);

      await expect(repository.markNotificationSent(userId)).rejects.toThrow(
        `User ${userId} not found`
      );
    });

    it('should save updated user', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      await repository.markNotificationSent(userId);

      expect(User.get).toHaveBeenCalledWith(userId);
      expect(mockUser.save).toHaveBeenCalled();
    });
  });
});
