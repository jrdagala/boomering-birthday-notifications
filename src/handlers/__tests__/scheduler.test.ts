import { run } from '../scheduler';
import * as config from '../../config';
import { initializeDynamoDB } from '../../init/dynamodb';
// Mock all module-level dependencies
jest.mock('@aws-sdk/client-sqs');
jest.mock('../../config');
jest.mock('../../init/sqsClient', () => ({
  __esModule: true,
  default: {
    sendSqsMessage: jest.fn().mockResolvedValue({}),
  },
}));
jest.mock('../../init/dynamodb', () => ({
  initializeDynamoDB: jest.fn(),
}));
jest.mock('../../models/user');
jest.mock('../../repository/user', () => ({
  __esModule: true,
  default: {
    getUsersForNotification: jest.fn().mockResolvedValue([
      {
        userId: 'test-user-1',
        firstName: 'John',
        lastName: 'Doe',
        birthday: '1990-01-15',
        city: 'New York',
        country: 'USA',
        nextBirthdayUTC: '2024-01-15T05:00:00.000Z',
        lastNotificationYear: 2023,
      },
    ]),
  },
}));

// Import the mocked sqsClient to access the mock
import sqsClient from '../../init/sqsClient';
import userRepository from '../../repository/user';

describe('Scheduler Handler', () => {
  let mockGetEnvConfig: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let mockSendSqsMessage: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock console.info
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();

    // Get reference to the mocked sendSqsMessage
    mockSendSqsMessage = sqsClient.sendSqsMessage as jest.Mock;

    // Mock config with all required properties
    mockGetEnvConfig = jest.spyOn(config, 'getEnvConfig').mockReturnValue({
      aws: {
        region: 'us-east-1',
        accessKeyId: 'test-key',
        secretAccessKey: 'test-secret',
      },
      sqs: {
        notifierQueueName: 'https://sqs.us-east-1.amazonaws.com/123456789012/test-queue',
        deadLetterQueueName: 'test-dlq',
      },
      dynamodb: {
        endpoint: 'http://localhost:4566',
        usersTableName: 'users-table-test',
      },
      redis: {
        host: 'localhost',
        port: 6379,
        db: 0,
      },
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('run', () => {
    it('should send SQS message when users are found', async () => {
      await run();

      expect(mockSendSqsMessage).toHaveBeenCalledWith(
        'https://sqs.us-east-1.amazonaws.com/123456789012/test-queue',
        expect.stringContaining('test-user-1')
      );
    });

    it('should send message with user data', async () => {
      await run();

      expect(mockSendSqsMessage).toHaveBeenCalled();
      const callArgs = mockSendSqsMessage.mock.calls[0];
      const messageBody = JSON.parse(callArgs[1]);
      expect(messageBody).toMatchObject({
        userId: 'test-user-1',
        firstName: 'John',
        lastName: 'Doe',
      });
    });

    it('should log execution time', async () => {
      await run();

      expect(consoleInfoSpy).toHaveBeenCalledWith('[Scheduler]', '------------------------');
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[Scheduler]',
        expect.stringMatching(/Your cron function ran at/)
      );
    });

    it('should throw error if queue URL not configured', async () => {
      mockGetEnvConfig.mockReturnValue({
        aws: {
          region: 'us-east-1',
          accessKeyId: 'test',
          secretAccessKey: 'test',
        },
        sqs: {
          notifierQueueName: '',
          deadLetterQueueName: 'test-dlq',
        },
      } as any);

      await expect(run()).rejects.toThrow(
        'SQS_NOTIFIER_QUEUE_NAME environment variable is not set'
      );
    });

    it('should handle SQS send errors', async () => {
      const error = new Error('SQS send failed');
      mockSendSqsMessage.mockRejectedValueOnce(error);

      await expect(run()).rejects.toThrow('SQS send failed');
    });

    it('should return early when DynamoDB initialization fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (initializeDynamoDB as jest.MockedFunction<typeof initializeDynamoDB>).mockImplementationOnce(
        () => {
          throw new Error('DynamoDB connection failed');
        }
      );

      await run();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Scheduler]',
        'Failed to initialize DynamoDB:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle when no users are found for notification', async () => {
      (userRepository.getUsersForNotification as jest.Mock).mockResolvedValueOnce([]);

      await run();

      expect(consoleInfoSpy).toHaveBeenCalledWith('[Scheduler]', 'No users found for notification');
      expect(consoleInfoSpy).toHaveBeenCalledWith('[Scheduler]', '------------------------');
    });

    it('should handle when getUsersForNotification returns null', async () => {
      (userRepository.getUsersForNotification as jest.Mock).mockResolvedValueOnce(null);

      await run();

      expect(consoleInfoSpy).toHaveBeenCalledWith('[Scheduler]', 'No users found for notification');
      expect(mockSendSqsMessage).not.toHaveBeenCalled();
    });
  });
});
