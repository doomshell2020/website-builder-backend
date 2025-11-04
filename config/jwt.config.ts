import dotenv from 'dotenv';
dotenv.config();

export default {
  secret: process.env.JWT_SECRET || 'supersecret',  // keep secret in .env
  ttl: process.env.JWT_TTL || '1d',                // token expiry time
};
