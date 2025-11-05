import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: { id: string; role: string };
};

// 👇 role-based middleware factory
export const authorizeRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userRole = String(req.user?.role || '');

      if (!userRole) {
        return res.status(403).json({ status: false, message: 'Role not specified here.' });
      }

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ status: false, message: 'Access denied. Insufficient privileges.' });
      }

      next();
    } catch (err) {
      return res.status(403).json({ status: false, message: 'Unauthorized access.' });
    }
  };
};