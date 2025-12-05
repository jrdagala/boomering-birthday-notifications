import { SQSEvent } from 'aws-lambda';
import { consumer } from '../notifier';
import { composeBirthdayMessage } from '../notifier';
import { RedisService } from '../../services/redis.service';
import { initializeDynamoDB } from '../../init/dynamodb';

// Mock models to prevent Dynamoose table creation
jest.mock('../../models/user');

// Mock DynamoDB initialization to prevent logging
jest.mock('../../init/dynamodb', () => ({
  initializeDynamoDB: jest.fn(),
}));

// Mock UserSchema to prevent validation
jest.mock('../../types/user', () => ({
  UserSchema: {
    parse: jest.fn((data) => data), // Pass through the data
  },
}));

// Mock Redis initialization and service
jest.mock('../../init/redis', () => ({
  getRedisClient: jest.fn().mockReturnValue({}),
  Redis: jest.fn(),
}));

jest.mock('../../services/redis.service', () => ({
  RedisService: {
    isUserNotified: jest.fn().mockResolvedValue(false),
    setUserNotified: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock notification service
jest.mock('../../services/notification.service', () => ({
  default: {
    sendNotification: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock user repository
jest.mock('../../repository/user', () => ({
  __esModule: true,
  default: {
    markNotificationSent: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('Notifier Handler', () => {
  let consoleInfoSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('composeBirthdayMessage', () => {
    it('should compose birthday message with user first and last name', () => {
      const user = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        firstName: 'John',
        lastName: 'Doe',
        birthday: '1990-05-15',
        city: 'New York',
        country: 'USA',
        nextBirthdayUTC: '2024-05-15T13:00:00.000Z',
        lastNotificationYear: 2023,
      };

      const message = composeBirthdayMessage(user);

      expect(message).toBe("Hey, John Doe it's your birthday!");
    });
  });

  describe('consumer', () => {
    it('should process SQS event with single record', async () => {
      const event: SQSEvent = {
        Records: [
          {
            messageId: '1',
            receiptHandle: 'receipt-1',
            body: JSON.stringify({
              userId: '123e4567-e89b-12d3-a456-426614174000',
              firstName: 'John',
              lastName: 'Doe',
              birthday: '1990-05-15',
              city: 'New York',
              state: 'NY',
              country: 'USA',
              nextBirthdayUTC: '2024-05-15T13:00:00.000Z',
              lastNotificationYear: 2023,
            }),
            attributes: {} as any,
            messageAttributes: {},
            md5OfBody: 'md5-1',
            eventSource: 'aws:sqs',
            eventSourceARN: 'arn:aws:sqs:us-east-1:123456789012:test-queue',
            awsRegion: 'us-east-1',
          },
        ],
      };

      await consumer(event);

      expect(consoleInfoSpy).toHaveBeenCalledWith('[Notifier]', 'Processing 1 SQS records');
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[Notifier]',
        expect.stringContaining('Processing record:')
      );
    });

    it('should process SQS event with multiple records', async () => {
      const event: SQSEvent = {
        Records: [
          {
            messageId: '1',
            receiptHandle: 'receipt-1',
            body: JSON.stringify({
              userId: '123e4567-e89b-12d3-a456-426614174001',
              firstName: 'John',
              lastName: 'Doe',
              birthday: '1990-01-01',
              city: 'New York',
              country: 'USA',
              nextBirthdayUTC: '2024-01-01T05:00:00.000Z',
              lastNotificationYear: 2023,
            }),
            attributes: {} as any,
            messageAttributes: {},
            md5OfBody: 'md5-1',
            eventSource: 'aws:sqs',
            eventSourceARN: 'arn:aws:sqs:us-east-1:123456789012:test-queue',
            awsRegion: 'us-east-1',
          },
          {
            messageId: '2',
            receiptHandle: 'receipt-2',
            body: JSON.stringify({
              userId: '123e4567-e89b-12d3-a456-426614174002',
              firstName: 'Jane',
              lastName: 'Smith',
              birthday: '1992-02-02',
              city: 'Los Angeles',
              country: 'USA',
              nextBirthdayUTC: '2024-02-02T08:00:00.000Z',
              lastNotificationYear: 2023,
            }),
            attributes: {} as any,
            messageAttributes: {},
            md5OfBody: 'md5-2',
            eventSource: 'aws:sqs',
            eventSourceARN: 'arn:aws:sqs:us-east-1:123456789012:test-queue',
            awsRegion: 'us-east-1',
          },
          {
            messageId: '3',
            receiptHandle: 'receipt-3',
            body: JSON.stringify({
              userId: '123e4567-e89b-12d3-a456-426614174003',
              firstName: 'Bob',
              lastName: 'Wilson',
              birthday: '1988-03-03',
              city: 'Chicago',
              country: 'USA',
              nextBirthdayUTC: '2024-03-03T06:00:00.000Z',
              lastNotificationYear: 2023,
            }),
            attributes: {} as any,
            messageAttributes: {},
            md5OfBody: 'md5-3',
            eventSource: 'aws:sqs',
            eventSourceARN: 'arn:aws:sqs:us-east-1:123456789012:test-queue',
            awsRegion: 'us-east-1',
          },
        ],
      };

      await consumer(event);

      expect(consoleInfoSpy).toHaveBeenCalledWith('[Notifier]', 'Processing 3 SQS records');
      expect(consoleInfoSpy).toHaveBeenCalledTimes(4); // 1 for initial count + 3 for processing records
    });

    it('should log each record body', async () => {
      const record1 = {
        userId: '123e4567-e89b-12d3-a456-426614174010',
        firstName: 'John',
        lastName: 'Smith',
        birthday: '1990-01-01',
        city: 'New York',
        country: 'USA',
        nextBirthdayUTC: '2024-01-01T05:00:00.000Z',
        lastNotificationYear: 2023,
      };
      const record2 = {
        userId: '123e4567-e89b-12d3-a456-426614174011',
        firstName: 'Jane',
        lastName: 'Doe',
        birthday: '1992-02-02',
        city: 'Los Angeles',
        country: 'USA',
        nextBirthdayUTC: '2024-02-02T08:00:00.000Z',
        lastNotificationYear: 2023,
      };
      const record1Body = JSON.stringify(record1);
      const record2Body = JSON.stringify(record2);

      const event: SQSEvent = {
        Records: [
          {
            messageId: '1',
            receiptHandle: 'receipt-1',
            body: record1Body,
            attributes: {} as any,
            messageAttributes: {},
            md5OfBody: 'md5-1',
            eventSource: 'aws:sqs',
            eventSourceARN: 'arn:aws:sqs:us-east-1:123456789012:test-queue',
            awsRegion: 'us-east-1',
          },
          {
            messageId: '2',
            receiptHandle: 'receipt-2',
            body: record2Body,
            attributes: {} as any,
            messageAttributes: {},
            md5OfBody: 'md5-2',
            eventSource: 'aws:sqs',
            eventSourceARN: 'arn:aws:sqs:us-east-1:123456789012:test-queue',
            awsRegion: 'us-east-1',
          },
        ],
      };

      await consumer(event);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[Notifier]',
        `Processing record: ${record1Body}`
      );
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[Notifier]',
        `Processing record: ${record2Body}`
      );
    });

    it('should handle empty records array', async () => {
      const event: SQSEvent = {
        Records: [],
      };

      await consumer(event);

      expect(consoleInfoSpy).toHaveBeenCalledWith('[Notifier]', 'Processing 0 SQS records');
    });

    it('should process records with complex message bodies', async () => {
      const complexBody = JSON.stringify({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        firstName: 'John',
        lastName: 'Doe',
        birthday: '1990-05-15',
        city: 'New York',
        state: 'New York',
        country: 'USA',
        nextBirthdayUTC: '2024-05-15T13:00:00.000Z',
        lastNotificationYear: 2023,
      });

      const event: SQSEvent = {
        Records: [
          {
            messageId: '1',
            receiptHandle: 'receipt-1',
            body: complexBody,
            attributes: {} as any,
            messageAttributes: {},
            md5OfBody: 'md5-1',
            eventSource: 'aws:sqs',
            eventSourceARN: 'arn:aws:sqs:us-east-1:123456789012:test-queue',
            awsRegion: 'us-east-1',
          },
        ],
      };

      await consumer(event);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[Notifier]',
        `Processing record: ${complexBody}`
      );
    });

    it('should skip record when body is null', async () => {
      const event: SQSEvent = {
        Records: [
          {
            messageId: '1',
            receiptHandle: 'receipt-1',
            body: null as any,
            attributes: {} as any,
            messageAttributes: {},
            md5OfBody: 'md5-1',
            eventSource: 'aws:sqs',
            eventSourceARN: 'arn:aws:sqs:us-east-1:123456789012:test-queue',
            awsRegion: 'us-east-1',
          },
        ],
      };

      await consumer(event);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[Notifier]',
        'Skipping due to invalid record body'
      );
    });

    it('should skip notification when user is already notified', async () => {
      (RedisService.isUserNotified as jest.Mock).mockResolvedValueOnce(true);

      const event: SQSEvent = {
        Records: [
          {
            messageId: '1',
            receiptHandle: 'receipt-1',
            body: JSON.stringify({
              userId: '123e4567-e89b-12d3-a456-426614174000',
              firstName: 'John',
              lastName: 'Doe',
              birthday: '1990-05-15',
              city: 'New York',
              country: 'USA',
              nextBirthdayUTC: '2024-05-15T13:00:00.000Z',
              lastNotificationYear: 2023,
            }),
            attributes: {} as any,
            messageAttributes: {},
            md5OfBody: 'md5-1',
            eventSource: 'aws:sqs',
            eventSourceARN: 'arn:aws:sqs:us-east-1:123456789012:test-queue',
            awsRegion: 'us-east-1',
          },
        ],
      };

      await consumer(event);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[Notifier]',
        'User already notified for this year: John Doe'
      );
    });

    it('should handle notification failure and log error', async () => {
      const NotificationService = jest.requireMock('../../services/notification.service').default;
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      NotificationService.sendNotification.mockRejectedValueOnce(new Error('Pipedream API error'));

      const event: SQSEvent = {
        Records: [
          {
            messageId: '1',
            receiptHandle: 'receipt-1',
            body: JSON.stringify({
              userId: '123e4567-e89b-12d3-a456-426614174000',
              firstName: 'Jane',
              lastName: 'Smith',
              birthday: '1990-05-15',
              city: 'New York',
              country: 'USA',
              nextBirthdayUTC: '2024-05-15T13:00:00.000Z',
              lastNotificationYear: 2023,
            }),
            attributes: {} as any,
            messageAttributes: {},
            md5OfBody: 'md5-1',
            eventSource: 'aws:sqs',
            eventSourceARN: 'arn:aws:sqs:us-east-1:123456789012:test-queue',
            awsRegion: 'us-east-1',
          },
        ],
      };

      await consumer(event);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Notifier]',
        'Failed to send notification to ',
        'Jane Smith',
        ' via ',
        'pipedream',
        ': ',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should return early when DynamoDB initialization fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (initializeDynamoDB as jest.Mock).mockImplementationOnce(() => {
        throw new Error('DynamoDB connection failed');
      });

      const event: SQSEvent = {
        Records: [
          {
            messageId: '1',
            receiptHandle: 'receipt-1',
            body: JSON.stringify({
              userId: '123e4567-e89b-12d3-a456-426614174000',
              firstName: 'Test',
              lastName: 'User',
              birthday: '1990-05-15',
              city: 'New York',
              country: 'USA',
              nextBirthdayUTC: '2024-05-15T13:00:00.000Z',
              lastNotificationYear: 2023,
            }),
            attributes: {} as any,
            messageAttributes: {},
            md5OfBody: 'md5-1',
            eventSource: 'aws:sqs',
            eventSourceARN: 'arn:aws:sqs:us-east-1:123456789012:test-queue',
            awsRegion: 'us-east-1',
          },
        ],
      };

      const result = await consumer(event);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Notifier]',
        'Failed to initialize DynamoDB:',
        expect.any(Error)
      );
      expect(result).toBeUndefined();

      consoleErrorSpy.mockRestore();
    });
  });
});
