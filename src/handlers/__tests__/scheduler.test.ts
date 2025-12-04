import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { run } from '../scheduler';
import * as config from '../../config';

// Mock AWS SDK
jest.mock('@aws-sdk/client-sqs');
jest.mock('../../config');

describe('Scheduler Handler', () => {
  let mockSend: jest.Mock;
  let mockGetEnvConfig: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock console.log
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    // Mock SQS send
    mockSend = jest.fn().mockResolvedValue({});
    (SQSClient as jest.Mock).mockImplementation(() => ({
      send: mockSend,
    }));

    // Mock config
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
    it('should create SQS client with correct credentials', async () => {
      await run();

      expect(SQSClient).toHaveBeenCalledWith({
        credentials: {
          accessKeyId: 'test-key',
          secretAccessKey: 'test-secret',
        },
        region: 'us-east-1',
      });
    });

    it('should send message to SQS queue', async () => {
      await run();

      expect(mockSend).toHaveBeenCalledWith(expect.any(SendMessageCommand));
    });

    it('should send message with correct queue URL', async () => {
      await run();

      expect(mockSend).toHaveBeenCalled();
      expect(mockSend).toHaveBeenCalledWith(expect.any(SendMessageCommand));
    });

    it('should send message with user data', async () => {
      await run();

      expect(mockSend).toHaveBeenCalled();
      expect(mockSend).toHaveBeenCalledWith(expect.any(SendMessageCommand));
    });

    it('should log execution time', async () => {
      await run();

      expect(consoleLogSpy).toHaveBeenCalledWith('------------------------');
      expect(consoleLogSpy).toHaveBeenCalledWith(
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
      mockSend.mockRejectedValue(error);

      await expect(run()).rejects.toThrow('SQS send failed');
    });

    it('should use configuration from getEnvConfig', async () => {
      mockGetEnvConfig.mockReturnValue({
        aws: {
          region: 'eu-west-1',
          accessKeyId: 'custom-key',
          secretAccessKey: 'custom-secret',
        },
        sqs: {
          notifierQueueName: 'https://sqs.eu-west-1.amazonaws.com/123/custom-queue',
          deadLetterQueueName: 'custom-dlq',
        },
      } as any);

      await run();

      expect(SQSClient).toHaveBeenCalledWith({
        credentials: {
          accessKeyId: 'custom-key',
          secretAccessKey: 'custom-secret',
        },
        region: 'eu-west-1',
      });
    });
  });
});
