"use strict";
// responseUtils.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = void 0;
const successResponse = (message = null, result = '') => {
    return {
        statusCode: 200,
        body: {
            status: true,
            message,
            result,
        },
    };
};
exports.successResponse = successResponse;
//# sourceMappingURL=responseUtils.js.map