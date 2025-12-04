import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status';
import { UserController } from '../user.controller';
import { userRepository } from '../../repository/user';

// Mock the repository
jest.mock('../../repository/user');

describe('UserController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSend: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Express response
    mockJson = jest.fn();
    mockSend = jest.fn();
    mockStatus = jest.fn().mockReturnValue({
      send: mockSend,
      json: mockJson,
    });

    mockRequest = {
      body: {},
      params: {},
    };

    mockResponse = {
      status: mockStatus,
      send: mockSend,
      json: mockJson,
    };
  });

  describe('addUser', () => {
    it('should create user and return 200', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        birthday: '1990-05-15',
        city: 'New York',
        state: 'New York',
        country: 'USA',
      };

      const createdUser = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        ...userData,
        nextBirthdayUTC: '2024-05-15T13:00:00.000Z',
        lastNotificationYear: 0,
      };

      mockRequest.body = userData;
      (userRepository.createUser as jest.Mock).mockResolvedValue(createdUser);

      await UserController.addUser(mockRequest as Request, mockResponse as Response);

      expect(userRepository.createUser).toHaveBeenCalledWith(userData);
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockSend).toHaveBeenCalledWith(createdUser);
    });

    it('should return 400 when validation fails', async () => {
      const invalidData = {
        firstName: '',
        lastName: 'Doe',
        birthday: 'invalid-date',
        city: 'New York',
        country: 'USA',
      };

      mockRequest.body = invalidData;

      await UserController.addUser(mockRequest as Request, mockResponse as Response);

      expect(userRepository.createUser).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    });

    it('should return 400 when missing required fields', async () => {
      const invalidData = {
        firstName: 'John',
        // Missing lastName, birthday, city, country
      };

      mockRequest.body = invalidData;

      await UserController.addUser(mockRequest as Request, mockResponse as Response);

      expect(userRepository.createUser).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    });

    it('should return 400 when invalid birthday format', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        birthday: '05-15-1990', // Wrong format
        city: 'New York',
        country: 'USA',
      };

      mockRequest.body = invalidData;

      await UserController.addUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    });

    it('should handle repository errors', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        birthday: '1990-05-15',
        city: 'New York',
        country: 'USA',
      };

      mockRequest.body = userData;
      const error = new Error('Database error');
      (userRepository.createUser as jest.Mock).mockRejectedValue(error);

      await UserController.addUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(mockSend).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteUser', () => {
    it('should delete user and return 200', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const deletedUser = {
        userId,
        firstName: 'John',
        lastName: 'Doe',
        birthday: '1990-05-15',
        city: 'New York',
        country: 'USA',
        nextBirthdayUTC: '2024-05-15T13:00:00.000Z',
        lastNotificationYear: 0,
      };

      mockRequest.params = { userId };
      (userRepository.deleteUser as jest.Mock).mockResolvedValue(deletedUser);

      await UserController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(userRepository.deleteUser).toHaveBeenCalledWith(userId);
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockSend).toHaveBeenCalledWith(deletedUser);
    });

    it('should return 400 when userId is invalid UUID', async () => {
      mockRequest.params = { userId: 'invalid-uuid' };

      await UserController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(userRepository.deleteUser).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    });

    it('should return 400 when user not found', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      mockRequest.params = { userId };

      const error = new Error('User not found');
      (userRepository.deleteUser as jest.Mock).mockRejectedValue(error);

      await UserController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(mockSend).toHaveBeenCalledWith(error);
    });
  });

  describe('updateUser', () => {
    it('should update user and return 200', async () => {
      const updateData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const updatedUser = {
        ...updateData,
        birthday: '1990-05-15',
        city: 'New York',
        country: 'USA',
        nextBirthdayUTC: '2024-05-15T13:00:00.000Z',
        lastNotificationYear: 0,
      };

      mockRequest.body = updateData;
      (userRepository.updateUser as jest.Mock).mockResolvedValue(updatedUser);

      await UserController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(userRepository.updateUser).toHaveBeenCalledWith(updateData.userId, updateData);
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockSend).toHaveBeenCalledWith(updatedUser);
    });

    it('should allow partial updates', async () => {
      const updateData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        city: 'Los Angeles',
        state: 'California',
      };

      const updatedUser = {
        userId: updateData.userId,
        firstName: 'John',
        lastName: 'Doe',
        birthday: '1990-05-15',
        city: 'Los Angeles',
        state: 'California',
        country: 'USA',
        nextBirthdayUTC: '2024-05-15T17:00:00.000Z',
        lastNotificationYear: 0,
      };

      mockRequest.body = updateData;
      (userRepository.updateUser as jest.Mock).mockResolvedValue(updatedUser);

      await UserController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(userRepository.updateUser).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
    });

    it('should return 400 when userId is missing', async () => {
      const invalidData = {
        firstName: 'Jane',
      };

      mockRequest.body = invalidData;

      await UserController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(userRepository.updateUser).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    });

    it('should return 400 when userId is invalid UUID', async () => {
      const invalidData = {
        userId: 'not-a-uuid',
        firstName: 'Jane',
      };

      mockRequest.body = invalidData;

      await UserController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(userRepository.updateUser).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    });

    it('should return 400 when birthday format is invalid', async () => {
      const invalidData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        birthday: '15/05/1990',
      };

      mockRequest.body = invalidData;

      await UserController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    });

    it('should handle repository errors', async () => {
      const updateData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        firstName: 'Jane',
      };

      mockRequest.body = updateData;
      const error = new Error('User not found');
      (userRepository.updateUser as jest.Mock).mockRejectedValue(error);

      await UserController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(mockSend).toHaveBeenCalledWith(error);
    });
  });
});
