"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwtConfig = {
    secret: process.env.JWT_SECRET || 'fallback-secret',
    ttl: process.env.JWT_TTL || '1h',
};
exports.default = jwtConfig;
