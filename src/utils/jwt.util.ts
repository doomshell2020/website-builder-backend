import jwt, { SignOptions, VerifyOptions, JwtPayload } from 'jsonwebtoken';
import jwtConfig from '../../config/jwt.config';

// Extend the payload to include tenant schema
export interface CustomJwtPayload extends JwtPayload {
  id: number;
  email: string;
  role?: number;
  company_name?: string;   // 👈 your field (used as schema name)
  [key: string]: any;
}

/**
 * Create a JWT with tenant (company) schema included
 */
export const createToken = (data: CustomJwtPayload): string => {
  const payload: CustomJwtPayload = {
    id: data.id,
    email: data.email,
    role: data.role,
    company_name: data.company_name,
  };

  const options: SignOptions = {
    expiresIn: jwtConfig.ttl || '1d', // Default to 1 day if not set
  };

  return jwt.sign(payload, jwtConfig.secret as string, options);
};

/**
 * Verify a JWT and return decoded payload with tenant info
 */
export const verifyToken = (token: string): CustomJwtPayload => {
  const options: VerifyOptions = {};
  const decoded = jwt.verify(token, jwtConfig.secret as string, options) as CustomJwtPayload;

  // 👇 Normalize schema reference for easy access everywhere
  if (decoded.company_name && !decoded.tenant_schema) {
    decoded.tenant_schema = decoded.company_name;
  }

  return decoded;
};
