import NotificationService from '../notification.service';
import axios from 'axios';
import * as config from '../../config';

jest.mock('axios');
jest.mock('../../config');

describe('NotificationService', () => {
  const mockAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(config, 'getEnvConfig').mockReturnValue({
      pipedreamURL: 'https://test.pipedream.net',
      aws: {
        region: 'us-east-1',
        accessKeyId: 'test-key',
        secretAccessKey: 'test-secret',
      },
      sqs: {
        notifierQueueName: 'test-queue',
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

  describe('sendNotification', () => {
    it('should call sendPipedreamNotification when type is pipedream', async () => {
      const message = 'Test birthday message';
      mockAxios.post.mockResolvedValue({ data: { success: true }, status: 200 } as any);

      await NotificationService.sendNotification({
        message,
        type: 'pipedream',
      });

      expect(mockAxios.post).toHaveBeenCalledWith('https://test.pipedream.net', {
        message,
      });
    });

    it('should not make any request when type is not pipedream', async () => {
      const message = 'Test message';

      await NotificationService.sendNotification({
        message,
        type: 'email' as any,
      });

      expect(mockAxios.post).not.toHaveBeenCalled();
    });
  });

  describe('sendPipedreamNotification', () => {
    it('should successfully send notification to Pipedream', async () => {
      const message = 'Birthday notification message';
      const mockResponse = { data: { success: true }, status: 200 };
      mockAxios.post.mockResolvedValue(mockResponse as any);

      const result = await NotificationService.sendPipedreamNotification(message);

      expect(mockAxios.post).toHaveBeenCalledWith('https://test.pipedream.net', {
        message,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when Pipedream request fails', async () => {
      const message = 'Test message';
      const error = new Error('Network error');
      mockAxios.post.mockRejectedValue(error);

      await expect(NotificationService.sendPipedreamNotification(message)).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle HTTP error responses', async () => {
      const message = 'Test message';
      const error = {
        response: {
          status: 500,
          data: { error: 'Internal Server Error' },
        },
      };
      mockAxios.post.mockRejectedValue(error);

      await expect(NotificationService.sendPipedreamNotification(message)).rejects.toMatchObject(
        error
      );
    });
  });
});
