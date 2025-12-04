// Jest setup file for environment configuration
process.env.NODE_ENV = "test";
process.env.AWS_REGION = "us-east-1";
process.env.AWS_ACCESS_KEY_ID = "test";
process.env.AWS_SECRET_ACCESS_KEY = "test";
process.env.DYNAMODB_ENDPOINT = "http://localhost:4566";
process.env.REDIS_HOST = "localhost";
process.env.REDIS_PORT = "6379";
process.env.SQS_NOTIFIER_QUEUE_NAME = "test-queue";
process.env.SQS_NOTIFIER_QUEUE_ARN =
  "arn:aws:sqs:us-east-1:000000000000:test-queue";
