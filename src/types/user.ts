import { z } from 'zod';

/**
 * Base schema for shared user fields
 */
export const BaseUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Birthday must be in YYYY-MM-DD format'),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
});

/**
 * Zod schema for User
 * Defines the structure and validation rules for a User in the system
 */
export const UserSchema = BaseUserSchema.extend({
  userId: z.string().uuid(),
  nextBirthdayUTC: z.string().datetime(),
  lastNotificationYear: z.number().int().min(0),
});

/**
 * Zod schema for creating a new user
 */
export const CreateUserInputSchema = BaseUserSchema;

/**
 * Zod schema for updating an existing user
 */
export const UpdateUserInputSchema = BaseUserSchema.partial().extend({
  userId: z.string().uuid(),
});

/**
 * Zod schema for deleting a user
 */
export const DeleteUserInputSchema = z.object({
  userId: z.string().uuid(),
});

/**
 * TypeScript types inferred from Zod schemas
 */
export type IUser = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>;
export type DeleteUserInput = z.infer<typeof DeleteUserInputSchema>;
