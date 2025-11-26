import jwt, { SignOptions, VerifyOptions, JwtPayload } from 'jsonwebtoken';
import jwtConfig from '../../config/jwt.config';

// Extend the payload to include tenant schema
export interface CustomJwtPayload extends JwtPayload {
  id: number;
  email: string;
  role?: number;
  schema_name?: string;   // 👈 your field (used as schema name)
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
    schema_name: data.schema_name,
  };

  const options: SignOptions = {
    expiresIn: (jwtConfig.ttl || "1d") as jwt.SignOptions["expiresIn"],
  };


  return jwt.sign(payload, jwtConfig.secret as string, options);
};


/**
 * Create a JWT with tenant (company) schema included
 */
export const createTokenForPass = (data: CustomJwtPayload): string => {
  const payload: CustomJwtPayload = {
    id: data.id,
    email: data.email,
    type: data.type,
  };

  const options: SignOptions = {
    expiresIn: (jwtConfig.ttl || "1d") as jwt.SignOptions["expiresIn"],
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
  if (decoded.schema_name && !decoded.tenant_schema) {
    decoded.tenant_schema = decoded.schema_name;
  }

  return decoded;
};
