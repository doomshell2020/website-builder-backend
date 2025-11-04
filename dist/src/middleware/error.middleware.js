"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_errors_1 = require("../utils/api-errors"); // Adjust the path as needed
const ErrorHandler = (fn) => (req, res, next) => {
    fn(req, res, next).catch((err) => {
        console.error(err);
        if (err instanceof api_errors_1.APIError) {
            return res.status(err.status).json({
                status: false,
                code: err.code,
                message: err.message,
            });
        }
        return res.status(500).json({
            status: false,
            code: 'InternalServerError',
            message: err?.message || 'Something went wrong.',
        });
    });
};
exports.default = ErrorHandler;
