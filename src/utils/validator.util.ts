import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const validate =
  (schema: Joi.ObjectSchema) => async (req: Request, res: Response, next: NextFunction) => {
    if (schema) {
      try {
        const options = {
          errors: {
            wrap: { label: '' },
          },
          abortEarly: true,
        };
        const body = req.method === 'GET' ? req.query : req.body;
        await schema.validateAsync(body, options);
        next(); // call next() only if validation passes
      } catch (error: any) {
        // Send validation error message in response
        return res.status(400).json({
          status: 400,
          code: 'BadRequest',
          message: error.message,
        });
      }
    } else {
      next();
    }
  };

export default validate;
