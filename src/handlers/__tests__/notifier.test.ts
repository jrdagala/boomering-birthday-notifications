import { SQSEvent } from 'aws-lambda';
import { consumer } from '../notifier';

describe('Notifier Handler', () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('consumer', () => {
    it('should process SQS event with single record', async () => {
      const event: SQSEvent = {
        Records: [
          {
            messageId: '1',
            receiptHandle: 'receipt-1',
            body: JSON.stringify({
              userId: '123',
              firstName: 'John',
              lastName: 'Doe',
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

      expect(consoleLogSpy).toHaveBeenCalledWith('Processing 1 SQS records');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Processing record:'));
    });

    it('should process SQS event with multiple records', async () => {
      const event: SQSEvent = {
        Records: [
          {
            messageId: '1',
            receiptHandle: 'receipt-1',
            body: JSON.stringify({ userId: '123' }),
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
            body: JSON.stringify({ userId: '456' }),
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
            body: JSON.stringify({ userId: '789' }),
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

      expect(consoleLogSpy).toHaveBeenCalledWith('Processing 3 SQS records');
      expect(consoleLogSpy).toHaveBeenCalledTimes(4); // 1 for count + 3 for records
    });

    it('should log each record body', async () => {
      const record1Body = JSON.stringify({ userId: '123', name: 'John' });
      const record2Body = JSON.stringify({ userId: '456', name: 'Jane' });

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

      expect(consoleLogSpy).toHaveBeenCalledWith(`Processing record: ${record1Body}`);
      expect(consoleLogSpy).toHaveBeenCalledWith(`Processing record: ${record2Body}`);
    });

    it('should handle empty records array', async () => {
      const event: SQSEvent = {
        Records: [],
      };

      await consumer(event);

      expect(consoleLogSpy).toHaveBeenCalledWith('Processing 0 SQS records');
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

      expect(consoleLogSpy).toHaveBeenCalledWith(`Processing record: ${complexBody}`);
    });
  });
});
