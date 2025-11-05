"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../utils/logger");
const api_errors_1 = require("../utils/api-errors");
const errorHandler = async (err, req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        logger_1.logger.log({
            date: new Date().toISOString(),
            level: 'error',
            env: process.env.NODE_ENV,
            client: req.connection.remoteAddress || req.ip,
            method: req.method,
            api: req.originalUrl,
            name: err.name,
            message: err.message,
            stack: err.stack,
        });
    }
    if (err instanceof api_errors_1.APIError) {
        return res.status(err.status || 500).json({ status: false, message: err.message });
    }
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ status: false, message: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ status: false, message: 'Token expired' });
    }
    return res.status(500).json({ status: false, message: err.message || 'Internal Server Error' });
};
exports.default = errorHandler;
//# sourceMappingURL=error.js.map