import { Request, Response, NextFunction } from 'express';
import { apiErrors } from '../utils/api-errors'; // ✅ correct import

const badJsonHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (err instanceof SyntaxError && (err as any).status === 400 && 'body' in err) {
    throw new apiErrors.BadRequestError(err.message); // ✅ dynamically referenced
  }
  next();
};

export default badJsonHandler;
