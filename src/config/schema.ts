import convict from 'convict';

interface AwsConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

interface DynamoDBEnvConfig {
  tableName: string;
  endpoint?: string;
}
interface RedisEnvConfig {
  host: string;
  port: number;
  db?: number;
}

interface SqsConfig {
  notifierQueueName: string;
  deadLetterQueueName: string;
}

interface ConfigSchema {
  aws: AwsConfig;
  dynamodb: DynamoDBEnvConfig;
  redis: RedisEnvConfig;
  sqs: SqsConfig;
  stage: string;
}

const schema = convict<ConfigSchema>({
  aws: {
    region: {
      doc: 'AWS region',
      format: String,
      default: 'us-east-1',
      env: 'AWS_REGION',
    },
    accessKeyId: {
      doc: 'AWS access key ID',
      format: String,
      default: 'test',
      env: 'AWS_ACCESS_KEY_ID',
    },
    secretAccessKey: {
      doc: 'AWS secret access key',
      format: String,
      default: 'test',
      env: 'AWS_SECRET_ACCESS_KEY',
    },
  },
  redis: {
    host: {
      doc: 'Redis host',
      format: String,
      default: 'localhost',
      env: 'REDIS_HOST',
    },
    port: {
      doc: 'Redis port',
      format: 'port',
      default: 6379,
      env: 'REDIS_PORT',
    },
    db: {
      doc: 'Redis database index',
      format: 'int',
      default: 0,
      env: 'REDIS_DB',
    },
  },
  dynamodb: {
    tableName: {
      doc: 'DynamoDB table name',
      format: String,
      default: 'users-table',
      env: 'DYNAMODB_TABLE_NAME',
    },
    endpoint: {
      doc: 'DynamoDB endpoint (useful for LocalStack or local development)',
      format: String,
      default: undefined,
      env: 'DYNAMODB_ENDPOINT',
    },
  },
  sqs: {
    notifierQueueName: {
      doc: 'SQS notifier queue name',
      format: String,
      default: 'birthday-notifications-queue',
      env: 'SQS_NOTIFIER_QUEUE_NAME',
    },
    deadLetterQueueName: {
      doc: 'SQS dead letter queue name',
      format: String,
      default: 'birthday-notifications-dead-letter-queue',
      env: 'SQS_DEAD_LETTER_QUEUE_NAME',
    },
  },
  stage: {
    doc: 'Serverless deployment stage',
    format: String,
    default: 'local',
    env: 'STAGE',
  },
});

export { schema, ConfigSchema };
