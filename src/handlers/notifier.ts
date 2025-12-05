import { SQSEvent, SQSBatchResponse } from 'aws-lambda';
import { initializeDynamoDB } from '../init/dynamodb';
import { initLogger } from '../utils/logger';
import { IUser, UserSchema } from '../types/user';
import userRepository from '../repository/user';
import NotificationService from '../services/notification.service';
import { RedisService } from '../services/redis.service';

const logger = initLogger('Notifier');

export function composeBirthdayMessage(user: IUser) {
  return `Hey, ${user.firstName} ${user.lastName} it's your birthday!`;
}

export async function consumer(event: SQSEvent): Promise<SQSBatchResponse | void> {
  logger.info(`Processing ${event.Records.length} SQS records`);

  // Initialize DynamoDB before any requests
  try {
    initializeDynamoDB();
  } catch (error) {
    logger.error('Failed to initialize DynamoDB:', error);
    return;
  }

  for (const { body = null } of event.Records) {
    if (!body) {
      logger.info('Skipping due to invalid record body');
      continue;
    }

    logger.info(`Processing record: ${body}`);
    const user = UserSchema.parse(JSON.parse(body));
    const fullName = user.firstName + ' ' + user.lastName;
    const notificationType = 'pipedream';

    try {
      const isNotified = await RedisService.isUserNotified(user.userId);

      if (isNotified) {
        logger.info('User already notified for this year: ' + fullName);
        continue;
      }

      await NotificationService.sendNotification({
        message: composeBirthdayMessage(user),
        type: notificationType,
      });

      logger.info('Birthday message sent to ', fullName, ' via ', notificationType);

      await userRepository.markNotificationSent(user.userId);
      await RedisService.setUserNotified(user.userId);
    } catch (error) {
      logger.error(
        'Failed to send notification to ',
        fullName,
        ' via ',
        notificationType,
        ': ',
        error
      );
    }
  }
}
