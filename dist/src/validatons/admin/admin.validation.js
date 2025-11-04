"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
// Regex to enforce password rules: at least one digit, one lowercase, and one uppercase
const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/;
// Custom function to validate password pattern
const validatePassword = (value) => {
    if (!passwordRegex.test(value)) {
        throw new Error('Password should contain a lowercase, an uppercase character, and a digit.');
    }
};
// Joi schema for admin registration validation
const register = joi_1.default.object().keys({
    name: joi_1.default.string().max(255).required().messages({
        'string.base': 'Name should be a type of text',
        'string.empty': 'Name is required',
        'string.max': 'Name should have a maximum length of 255 characters',
        'any.required': 'Name is a required field',
    }),
    email: joi_1.default.string().email().max(255).required().messages({
        'string.base': 'Email should be a type of text',
        'string.email': 'Email must be a valid email address',
        'string.empty': 'Email is required',
        'string.max': 'Email should have a maximum length of 255 characters',
        'any.required': 'Email is a required field',
    }),
    mobile: joi_1.default.string().max(20).optional().messages({
        'string.base': 'Mobile should be a type of text',
        'string.max': 'Mobile should have a maximum length of 20 characters',
    }),
    password: joi_1.default.string().min(8).max(16).required().messages({
        'string.base': 'Password should be a type of text',
        'string.empty': 'Password is required',
        'string.min': 'Password should have a minimum length of 8 characters',
        'string.max': 'Password should have a maximum length of 16 characters',
        'any.required': 'Password is a required field',
    }),
    status: joi_1.default.number().integer().min(0).max(3).default(0).messages({
        'number.base': 'Status should be a type of number',
        'number.min': 'Status should be at least 0',
        'number.max': 'Status should be at most 3',
    }),
    role: joi_1.default.string().valid('2', '3', '4').default('4'),
});
// Joi schema for admin login validation
const login = joi_1.default.object().keys({
    login_type: joi_1.default.string().valid('gmail', 'facebook', 'web', 'mobile'), // Optional login type
    source: joi_1.default.string(), // Optional source field
    email: joi_1.default.string().required(), // Email is required
    password: joi_1.default.string().required(), // Password is required
});
// Export both schemas as a default object
exports.default = {
    register: register,
    login: login,
};
//# sourceMappingURL=admin.validation.js.map