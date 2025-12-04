import { z } from 'zod';
import {
  CreateUserInputSchema,
  UpdateUserInputSchema,
  DeleteUserInputSchema,
  UserSchema,
} from '../user';
import type { IUser, CreateUserInput, UpdateUserInput } from '../user';

describe('User Zod Schemas', () => {
  describe('CreateUserInputSchema', () => {
    it('should validate correct user input', () => {
      const validUser: CreateUserInput = {
        firstName: 'John',
        lastName: 'Doe',
        birthday: '1990-05-15',
        city: 'New York',
        state: 'New York',
        country: 'USA',
      };

      expect(() => CreateUserInputSchema.parse(validUser)).not.toThrow();
    });

    it('should validate user without state (optional field)', () => {
      const validUser = {
        firstName: 'Jane',
        lastName: 'Smith',
        birthday: '1985-12-25',
        city: 'London',
        country: 'UK',
      };

      expect(() => CreateUserInputSchema.parse(validUser)).not.toThrow();
    });

    it('should reject empty firstName', () => {
      const invalidUser = {
        firstName: '',
        lastName: 'Doe',
        birthday: '1990-05-15',
        city: 'New York',
        country: 'USA',
      };

      expect(() => CreateUserInputSchema.parse(invalidUser)).toThrow(z.ZodError);
    });

    it('should reject missing firstName', () => {
      const invalidUser = {
        lastName: 'Doe',
        birthday: '1990-05-15',
        city: 'New York',
        country: 'USA',
      };

      expect(() => CreateUserInputSchema.parse(invalidUser)).toThrow(z.ZodError);
    });

    it('should reject empty lastName', () => {
      const invalidUser = {
        firstName: 'John',
        lastName: '',
        birthday: '1990-05-15',
        city: 'New York',
        country: 'USA',
      };

      expect(() => CreateUserInputSchema.parse(invalidUser)).toThrow(z.ZodError);
    });

    it('should reject invalid birthday format (MM-DD-YYYY)', () => {
      const invalidUser = {
        firstName: 'John',
        lastName: 'Doe',
        birthday: '05-15-1990',
        city: 'New York',
        country: 'USA',
      };

      expect(() => CreateUserInputSchema.parse(invalidUser)).toThrow(z.ZodError);
    });

    it('should reject invalid birthday format (DD-MM-YYYY)', () => {
      const invalidUser = {
        firstName: 'John',
        lastName: 'Doe',
        birthday: '15-05-1990',
        city: 'New York',
        country: 'USA',
      };

      expect(() => CreateUserInputSchema.parse(invalidUser)).toThrow(z.ZodError);
    });

    it('should reject invalid birthday format (YYYY/MM/DD)', () => {
      const invalidUser = {
        firstName: 'John',
        lastName: 'Doe',
        birthday: '1990/05/15',
        city: 'New York',
        country: 'USA',
      };

      expect(() => CreateUserInputSchema.parse(invalidUser)).toThrow(z.ZodError);
    });

    it('should reject missing birthday', () => {
      const invalidUser = {
        firstName: 'John',
        lastName: 'Doe',
        city: 'New York',
        country: 'USA',
      };

      expect(() => CreateUserInputSchema.parse(invalidUser)).toThrow(z.ZodError);
    });

    it('should reject empty city', () => {
      const invalidUser = {
        firstName: 'John',
        lastName: 'Doe',
        birthday: '1990-05-15',
        city: '',
        country: 'USA',
      };

      expect(() => CreateUserInputSchema.parse(invalidUser)).toThrow(z.ZodError);
    });

    it('should reject empty country', () => {
      const invalidUser = {
        firstName: 'John',
        lastName: 'Doe',
        birthday: '1990-05-15',
        city: 'New York',
        country: '',
      };

      expect(() => CreateUserInputSchema.parse(invalidUser)).toThrow(z.ZodError);
    });
  });

  describe('UpdateUserInputSchema', () => {
    it('should validate complete update with all fields', () => {
      const validUpdate: UpdateUserInput = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        firstName: 'Jane',
        lastName: 'Smith',
        birthday: '1992-03-20',
        city: 'Los Angeles',
        state: 'California',
        country: 'USA',
      };

      expect(() => UpdateUserInputSchema.parse(validUpdate)).not.toThrow();
    });

    it('should validate partial update with only firstName', () => {
      const validUpdate = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        firstName: 'UpdatedName',
      };

      expect(() => UpdateUserInputSchema.parse(validUpdate)).not.toThrow();
    });

    it('should validate partial update with only birthday', () => {
      const validUpdate = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        birthday: '2000-01-01',
      };

      expect(() => UpdateUserInputSchema.parse(validUpdate)).not.toThrow();
    });

    it('should validate partial update with location fields', () => {
      const validUpdate = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        city: 'Boston',
        state: 'Massachusetts',
        country: 'USA',
      };

      expect(() => UpdateUserInputSchema.parse(validUpdate)).not.toThrow();
    });

    it('should require userId', () => {
      const invalidUpdate = {
        firstName: 'Jane',
      };

      expect(() => UpdateUserInputSchema.parse(invalidUpdate)).toThrow(z.ZodError);
    });

    it('should reject invalid userId format', () => {
      const invalidUpdate = {
        userId: 'not-a-valid-uuid',
        firstName: 'Jane',
      };

      expect(() => UpdateUserInputSchema.parse(invalidUpdate)).toThrow(z.ZodError);
    });

    it('should reject invalid birthday format in partial update', () => {
      const invalidUpdate = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        birthday: '15/05/1990',
      };

      expect(() => UpdateUserInputSchema.parse(invalidUpdate)).toThrow(z.ZodError);
    });
  });

  describe('DeleteUserInputSchema', () => {
    it('should validate correct userId', () => {
      const validDelete = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };

      expect(() => DeleteUserInputSchema.parse(validDelete)).not.toThrow();
    });

    it('should reject missing userId', () => {
      const invalidDelete = {};

      expect(() => DeleteUserInputSchema.parse(invalidDelete)).toThrow(z.ZodError);
    });

    it('should reject invalid userId format', () => {
      const invalidDelete = {
        userId: 'invalid-uuid-format',
      };

      expect(() => DeleteUserInputSchema.parse(invalidDelete)).toThrow(z.ZodError);
    });

    it('should reject empty userId', () => {
      const invalidDelete = {
        userId: '',
      };

      expect(() => DeleteUserInputSchema.parse(invalidDelete)).toThrow(z.ZodError);
    });
  });

  describe('UserSchema (complete user object)', () => {
    it('should validate complete user object', () => {
      const validUser: IUser = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        firstName: 'John',
        lastName: 'Doe',
        birthday: '1990-05-15',
        city: 'New York',
        state: 'New York',
        country: 'USA',
        nextBirthdayUTC: '2024-05-15T13:00:00.000Z',
        lastNotificationYear: 2024,
      };

      expect(() => UserSchema.parse(validUser)).not.toThrow();
    });

    it('should reject missing nextBirthdayUTC', () => {
      const invalidUser = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        firstName: 'John',
        lastName: 'Doe',
        birthday: '1990-05-15',
        city: 'New York',
        country: 'USA',
        lastNotificationYear: 2024,
      };

      expect(() => UserSchema.parse(invalidUser)).toThrow(z.ZodError);
    });

    it('should reject invalid lastNotificationYear (negative)', () => {
      const invalidUser = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        firstName: 'John',
        lastName: 'Doe',
        birthday: '1990-05-15',
        city: 'New York',
        country: 'USA',
        nextBirthdayUTC: '2024-05-15T13:00:00.000Z',
        lastNotificationYear: -1,
      };

      expect(() => UserSchema.parse(invalidUser)).toThrow(z.ZodError);
    });

    it('should reject invalid nextBirthdayUTC format', () => {
      const invalidUser = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        firstName: 'John',
        lastName: 'Doe',
        birthday: '1990-05-15',
        city: 'New York',
        country: 'USA',
        nextBirthdayUTC: 'not-a-datetime',
        lastNotificationYear: 2024,
      };

      expect(() => UserSchema.parse(invalidUser)).toThrow(z.ZodError);
    });
  });
});
