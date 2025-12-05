import * as dynamoose from 'dynamoose';
import { getEnvConfig } from '../config';
import { initLogger } from '../utils/logger';

/**
 * Initialize DynamoDB configuration
 * This function should be called before using the User model
 *
 * @param config - DynamoDB configuration
 * @example
 * // For LocalStack
 * initializeDynamoDB({
 *   endpoint: 'http://localhost:4566',
 *   region: 'us-east-1',
 *   accessKeyId: 'test',
 *   secretAccessKey: 'test'
 * });
 *
 * // For AWS
 * initializeDynamoDB({
 *   region: 'us-east-1'
 * });
 *
 * // Or rely entirely on environment variables loaded via dotenv/convict
 * // (DYNAMODB_ENDPOINT, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
 */
export function initializeDynamoDB(): void {
  const { aws, dynamodb } = getEnvConfig();

  const { region, accessKeyId, secretAccessKey } = aws;
  const { endpoint } = dynamodb;
  const logger = initLogger('DynamoDB');

  logger.info('initializing DynamoDB');

  // Create DynamoDB instance
  const ddb = new dynamoose.aws.ddb.DynamoDB({
    endpoint,
    region,
    credentials:
      endpoint && accessKeyId && secretAccessKey
        ? {
            accessKeyId,
            secretAccessKey,
          }
        : undefined,
  });

  // Set Dynamoose to use this DynamoDB instance
  dynamoose.aws.ddb.set(ddb);

  logger.info('DynamoDB initialized');
}
