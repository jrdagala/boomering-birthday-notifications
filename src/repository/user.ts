import { v4 as uuidv4 } from 'uuid';
import User from '../models/user';
import { IUser, CreateUserInput, UpdateUserInput } from '../types/user';
import { calculateNextBirthdayUTC, getCurrentYear } from '../utils/timezone';

/**
 * User Repository
 * Provides CRUD operations for User model
 */
export class UserRepository {
  /**
   * Create a new user
   * @throws {z.ZodError} if input validation fails
   */
  async createUser(newUser: CreateUserInput): Promise<IUser> {
    const userId = uuidv4();
    const nextBirthdayUTC = calculateNextBirthdayUTC(newUser.birthday, {
      city: newUser.city,
      state: newUser.state,
      country: newUser.country,
    });

    const user = new User({
      userId,
      ...newUser,
      nextBirthdayUTC,
      lastNotificationYear: 0,
    });

    await user.save();
    return user.toJSON() as IUser;
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<IUser | Error> {
    try {
      const user = await User.get(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }
      await User.delete(userId);

      return user.toJSON() as IUser;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(userId: string, userDetails: UpdateUserInput): Promise<IUser | Error> {
    const user = await User.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    // Update fields
    Object.assign(user, userDetails);

    // Recalculate nextBirthdayUTC if birthday or location changed
    if (userDetails.birthday || userDetails.city || userDetails.state || userDetails.country) {
      user.nextBirthdayUTC = calculateNextBirthdayUTC(userDetails.birthday || user.birthday, {
        city: userDetails.city || user.city,
        state: userDetails.state !== undefined ? userDetails.state : user.state,
        country: userDetails.country || user.country,
      });
    }

    await user.save();
    return user.toJSON() as IUser;
  }

  /**
   * Get users whose birthday notification should be sent
   * Queries users with nextBirthdayUTC <= now
   */
  async getUsersForNotification(): Promise<IUser[]> {
    // Add 1 minute buffer to avoid race conditions
    const now = new Date(Date.now() + 60 * 1000).toISOString();
    const currentYear = getCurrentYear();

    const results = await User.query('nextBirthdayUTC').le(now).using('nextBirthdayIndex').exec();

    // Filter by lastNotificationYear to avoid duplicates
    return results
      .filter((user: any) => user.lastNotificationYear < currentYear)
      .map((user: any) => user.toJSON() as IUser);
  }

  /**
   * Update user after sending notification
   */
  async markNotificationSent(userId: string): Promise<void> {
    const user = await User.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    const currentYear = getCurrentYear();
    user.lastNotificationYear = currentYear;

    // Recalculate next birthday for next year
    user.nextBirthdayUTC = calculateNextBirthdayUTC(user.birthday, {
      city: user.city,
      state: user.state,
      country: user.country,
    });

    await user.save();
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
export default userRepository;
