import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { getEnvConfig } from '../config';

export const run = async () => {
  const time = new Date();
  const sqsConfig = getEnvConfig().sqs;
  const awsConfig = getEnvConfig().aws;
  console.log('------------------------');
  console.log(`Your cron function ran at ${time}`);

  // send sqs message
  const sqs = new SQSClient({
    credentials: {
      accessKeyId: awsConfig.accessKeyId,
      secretAccessKey: awsConfig.secretAccessKey,
    },
    region: awsConfig.region,
  });
  const queueUrl = sqsConfig.notifierQueueName;
  if (!queueUrl) {
    throw new Error('SQS_NOTIFIER_QUEUE_NAME environment variable is not set');
  }
  const params = {
    MessageBody: JSON.stringify({
      userId: '123',
      firstName: 'John',
      lastName: 'Doe',
      year: 1990,
    }),
    QueueUrl: queueUrl,
  };
  await sqs.send(new SendMessageCommand(params));

  console.log('------------------------');
};
