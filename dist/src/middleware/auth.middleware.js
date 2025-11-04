"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const cacheUtil = __importStar(require("../utils/cache.util"));
const jwtUtil = __importStar(require("../utils/jwt.util")); // Use named import syntax here
;
const authMiddleware = async (req, res, next) => {
    let token;
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
    }
    catch (error) {
        return res.status(401).json({ status: false, message: 'Unauthorized. Invalid or expired token.' });
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map