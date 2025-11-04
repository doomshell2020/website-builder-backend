"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_errors_1 = require("../utils/api-errors"); // ✅ correct import
const badJsonHandler = async (err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        throw new api_errors_1.apiErrors.BadRequestError(err.message); // ✅ dynamically referenced
    }
    next();
};
exports.default = badJsonHandler;
//# sourceMappingURL=validate-json.js.map