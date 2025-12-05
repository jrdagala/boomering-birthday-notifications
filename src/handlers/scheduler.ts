import { getEnvConfig } from '../config';
import { initializeDynamoDB } from '../init/dynamodb';
import sqsClient from '../init/sqsClient';
import userRepository from '../repository/user';
import { initLogger } from '../utils/logger';

const logger = initLogger('Scheduler');

export const run = async () => {
  const time = new Date();
  const { notifierQueueName: queueUrl } = getEnvConfig().sqs;

  logger.info('------------------------');
  logger.info(`Your cron function ran at ${time}`);

  if (!queueUrl) {
    throw new Error('SQS_NOTIFIER_QUEUE_NAME environment variable is not set');
  }

  // Initialize DynamoDB before any requests
  try {
    initializeDynamoDB();
  } catch (error) {
    logger.error('Failed to initialize DynamoDB:', error);
    return;
  }

  const birthdayUsers = await userRepository.getUsersForNotification();

  if (!birthdayUsers || birthdayUsers.length === 0) {
    logger.info('No users found for notification');
    logger.info('------------------------');
    return;
  }

  for (const user of birthdayUsers) {
    logger.info('Sending SQS message for user:', user.userId);
    await sqsClient.sendSqsMessage(queueUrl, JSON.stringify(user));
  }

  logger.info('Sent SQS messages for', birthdayUsers.length, 'users');
  logger.info('------------------------');
};
