import dotenv from 'dotenv';

import { schema, ConfigSchema } from './schema';

// Load environment variables from .env file (if present)
dotenv.config();

export function getEnvConfig(): ConfigSchema {
  return schema.getProperties();
}
