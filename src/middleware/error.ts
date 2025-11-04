import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { APIError } from '../utils/api-errors';

interface ErrorWithStatus extends Error {
  status?: number;
  name: string;
  message: string;
  stack?: string;
}

const errorHandler = async (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  if (process.env.NODE_ENV === 'development') {
    logger.log({
      date: new Date().toISOString(),
      level: 'error',
      env: process.env.NODE_ENV,
      client: req.connection.remoteAddress || req.ip,
      method: req.method,
      api: req.originalUrl,
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
  }

  if (err instanceof APIError) {
    return res.status(err.status || 500).json({ status: false, message: err.message });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ status: false, message: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ status: false, message: 'Token expired' });
  }

  return res.status(500).json({ status: false, message: err.message || 'Internal Server Error' });
};

export default errorHandler;
