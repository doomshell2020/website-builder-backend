import { Request, Response, NextFunction } from 'express';
import * as cacheUtil from '../utils/cache.util';
import * as jwtUtil from '../utils/jwt.util'; // Use named import syntax here
interface AuthRequest extends Request { user?: any; token?: string; };

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // 1️⃣ Check Authorization header
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.slice(7).trim();
  }

  // 2️⃣ Check cookies
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  // 3️⃣ Check query parameter
  if (!token && req.query?.token) {
    token = String(req.query.token);
  }

  if (!token) {
    return res.status(400).json({ status: false, message: 'Authorization header is missing.' });
  }

  try {
    // Check if token is blacklisted
    const isBlackListed = await cacheUtil.get(token);
    if (isBlackListed) {
      return res.status(401).json({ status: false, message: 'Unauthorized. Token revoked.' });
    }

    // Verify token and attach decoded user info to req
    const decoded = await jwtUtil.verifyToken(token);
    req.user = decoded;
    req.token = token;

    next();
  } catch (error) {
    return res.status(401).json({ status: false, message: 'Unauthorized. Invalid or expired token.' });
  }
};