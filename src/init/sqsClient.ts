import { getEnvConfig } from '../config';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';

class SqsClient {
  private sqs: SQSClient;

  constructor(sqs?: SQSClient) {
    let sqsClient = sqs;
    const awsConfig = getEnvConfig().aws;
    if (!sqs) {
      sqsClient = new SQSClient({
        credentials: {
          accessKeyId: awsConfig.accessKeyId,
          secretAccessKey: awsConfig.secretAccessKey,
        },
        region: awsConfig.region,
      });
    }
    this.sqs = sqsClient as SQSClient;
  }

  async sendSqsMessage(queueUrl: string, message: string) {
    const command = {
      MessageBody: message,
      QueueUrl: queueUrl,
    };
    return await this.sqs.send(new SendMessageCommand(command));
  }
}

const sqsClient = new SqsClient();

export default sqsClient;
export { SqsClient };
