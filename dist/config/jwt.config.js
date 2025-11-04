"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.default = {
    secret: process.env.JWT_SECRET || 'supersecret', // keep secret in .env
    ttl: process.env.JWT_TTL || '1d', // token expiry time
};
//# sourceMappingURL=jwt.config.js.map