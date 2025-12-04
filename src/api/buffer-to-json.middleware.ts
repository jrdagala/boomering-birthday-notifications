import { Request, Response, NextFunction } from 'express';
import HTTP_STATUS from 'http-status';

export const bufferToJsonMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.body instanceof Buffer) {
    try {
      req.body = JSON.parse(req.body.toString());
    } catch (error) {
      console.error('Failed to parse buffer to JSON:', error);
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: 'Request Body must be a valid JSON' });
    }
  }
  next();
};
