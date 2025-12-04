import express from 'express';
import serverless from 'serverless-http';
import { UsersRouter } from '../api/user.router';
import { bufferToJsonMiddleware } from '../api/buffer-to-json.middleware';
import { initializeDynamoDB } from '../services/dynamodb';

// Initialize DynamoDB before any requests
try {
  initializeDynamoDB();
} catch (error) {
  console.error('Failed to initialize DynamoDB:', error);
}

const app = express();
const userRouter = new UsersRouter();

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

app.use(express.json());
app.use(bufferToJsonMiddleware);
app.use('/user', userRouter.router);

app.use((req, res, _next) => {
  return res.status(404).json({
    error: 'Not Found',
  });
});

const api = serverless(app);

export { api };
