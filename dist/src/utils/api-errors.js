"use strict";
// src/utils/api-errors.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiErrors = exports.APIError = void 0;
// Base error class
class APIError extends Error {
    status;
    code;
    constructor(status, code, message) {
        super(message);
        this.status = status;
        this.code = code;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.APIError = APIError;
// Predefined error types
const errorDefinitions = {
    BadRequest: {
        statusCode: 400,
        message: 'Bad Request',
    },
    Unauthorized: {
        statusCode: 401,
        message: 'Unauthorized',
    },
    Forbidden: {
        statusCode: 403,
        message: 'Forbidden',
    },
    NotFound: {
        statusCode: 404,
        message: 'Not Found',
    },
    Conflict: {
        statusCode: 409,
        message: 'Conflict',
    },
    UnsupportedMediaType: {
        statusCode: 415,
        message: 'Unsupported Media Type',
    },
    UnprocessableEntity: {
        statusCode: 422,
        message: 'Unprocessable Entity',
    },
    InternalServerError: {
        statusCode: 500,
        message: 'Internal Server Error',
    },
    MethodNotAllowed: {
        statusCode: 405,
        message: 'Method Not Allowed',
    },
};
// Create error classes dynamically
exports.apiErrors = Object.entries(errorDefinitions).reduce((map, [name, data]) => {
    const ErrorClass = class extends APIError {
        constructor(message = data.message) {
            super(data.statusCode, name, message);
        }
    };
    // ✅ Cast ErrorClass to APIErrorConstructor to fix TS2322
    map[`${name}Error`] = ErrorClass;
    map[name] = ErrorClass;
    return map;
}, {});
//# sourceMappingURL=api-errors.js.map