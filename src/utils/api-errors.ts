// src/utils/api-errors.ts

// Base error class
export class APIError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// Error definition type
type ErrorData = {
  statusCode: number;
  message: string;
};

// Constructor type for dynamic error classes
type APIErrorConstructor = new (message?: string) => APIError;

// Error class map
type APIErrorClasses = {
  [key: string]: APIErrorConstructor;
};

// Predefined error types
const errorDefinitions: Record<string, ErrorData> = {
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
export const apiErrors: APIErrorClasses = Object.entries(errorDefinitions).reduce(
  (map, [name, data]) => {
    const ErrorClass = class extends APIError {
      constructor(message: string = data.message) {
        super(data.statusCode, name, message);
      }
    };

    // ✅ Cast ErrorClass to APIErrorConstructor to fix TS2322
    map[`${name}Error`] = ErrorClass as APIErrorConstructor;
    map[name] = ErrorClass as APIErrorConstructor;

    return map;
  },
  {} as APIErrorClasses
);
