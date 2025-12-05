import * as dynamoose from 'dynamoose';
import { getEnvConfig } from '../config';

const { dynamodb } = getEnvConfig();

/**
 * User Schema for DynamoDB
 */
const userSchema = new dynamoose.Schema(
  {
    userId: {
      type: String,
      hashKey: true,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    birthday: {
      type: String,
      required: true,
      validate: /^\d{4}-\d{2}-\d{2}$/, // Use regex directly for validation
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: true,
    },
    birthdayReminderPK: {
      type: String,
      default: 'BIRTHDAY_REMINDER',
      index: {
        name: 'nextBirthdayIndex',
        global: true,
        rangeKey: 'nextBirthdayUTC',
      },
    } as any, // Type assertion needed - Dynamoose types don't support 'global' property despite documentation
    nextBirthdayUTC: {
      type: String,
      required: true,
    },
    lastNotificationYear: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  }
);

/**
 * User Model
 * DynamoDB table with PAY_PER_REQUEST billing mode
 */
export const User = dynamoose.model(dynamodb.usersTableName, userSchema, {
  create: true, // Create table if it doesn't exist
  waitForActive: true,
  update: true,
  throughput: 'ON_DEMAND', // PAY_PER_REQUEST billing mode
});

export default User;
