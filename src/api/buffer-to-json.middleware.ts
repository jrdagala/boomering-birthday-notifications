import { Request, Response, NextFunction } from 'express';
import HTTP_STATUS from 'http-status';
import { initLogger } from '../utils/logger';

export const bufferToJsonMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const logger = initLogger('bufferToJsonMiddleware');
  if (req.body instanceof Buffer) {
    try {
      req.body = JSON.parse(req.body.toString());
    } catch (error) {
      logger.error('[bufferToJsonMiddleware] Failed to parse buffer to JSON:', error);
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: 'Request Body must be a valid JSON' });
    }
  }
  next();
};
