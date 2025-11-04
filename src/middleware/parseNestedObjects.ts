// middlewares/parseNestedObjects.ts
import { Request, Response, NextFunction } from 'express';

export const parseNestedObjects = (req: Request, res: Response, next: NextFunction) => {
  try {
    ['country', 'state', 'city'].forEach((key) => {
      if (req.body[key] && typeof req.body[key] === 'string') {
        req.body[key] = JSON.parse(req.body[key]);
      }
    });
    next();
  } catch (err) {
    next({
      status: 400,
      code: 'BadRequest',
      message: 'country/state/city must be valid JSON objects',
    });
  }
};
