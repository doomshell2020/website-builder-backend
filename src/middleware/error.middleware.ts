import { Request, Response, NextFunction } from 'express';
import { APIError } from '../utils/api-errors'; // Adjust the path as needed

const ErrorHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((err: any) => {
      console.error(err);

      if (err instanceof APIError) {
        return res.status(err.status).json({
          status: false,
          code: err.code,
          message: err.message,
        });
      }

      return res.status(500).json({
        status: false,
        code: 'InternalServerError',
        message: err?.message || 'Something went wrong.',
      });
    });
  };

export default ErrorHandler;
