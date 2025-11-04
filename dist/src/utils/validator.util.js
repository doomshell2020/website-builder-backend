"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate = (schema) => async (req, res, next) => {
    if (schema) {
        try {
            const options = {
                errors: {
                    wrap: { label: '' }
                },
                abortEarly: true,
            };
            const body = req.method === 'GET' ? req.query : req.body;
            await schema.validateAsync(body, options);
            next(); // call next() only if validation passes
        }
        catch (error) {
            // Send validation error message in response
            return res.status(400).json({
                status: 400,
                code: 'BadRequest',
                message: error.message,
            });
        }
    }
    else {
        next();
    }
};
exports.default = validate;
