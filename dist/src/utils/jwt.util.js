"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.createToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_config_1 = __importDefault(require("../../config/jwt.config"));
/**
 * Create a JWT with tenant (company) schema included
 */
const createToken = (data) => {
    const payload = {
        id: data.id,
        email: data.email,
        role: data.role,
        company_name: data.company_name,
    };
    const options = {
        expiresIn: (jwt_config_1.default.ttl || "1d"),
    };
    return jsonwebtoken_1.default.sign(payload, jwt_config_1.default.secret, options);
};
exports.createToken = createToken;
/**
 * Verify a JWT and return decoded payload with tenant info
 */
const verifyToken = (token) => {
    const options = {};
    const decoded = jsonwebtoken_1.default.verify(token, jwt_config_1.default.secret, options);
    // 👇 Normalize schema reference for easy access everywhere
    if (decoded.company_name && !decoded.tenant_schema) {
        decoded.tenant_schema = decoded.company_name;
    }
    return decoded;
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=jwt.util.js.map