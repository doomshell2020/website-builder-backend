import Joi, { ObjectSchema } from 'joi';

// Regex to enforce password rules: at least one digit, one lowercase, and one uppercase
const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/;

// Custom function to validate password pattern
const validatePassword = (value: string): void => {
  if (!passwordRegex.test(value)) {
    throw new Error('Password should contain a lowercase, an uppercase character, and a digit.');
  }
};

// Joi schema for admin registration validation
const register: ObjectSchema = Joi.object().keys({
  name: Joi.string().max(255).required().messages({
    'string.base': 'Name should be a type of text',
    'string.empty': 'Name is required',
    'string.max': 'Name should have a maximum length of 255 characters',
    'any.required': 'Name is a required field',
  }),
  email: Joi.string().email().max(255).required().messages({
    'string.base': 'Email should be a type of text',
    'string.email': 'Email must be a valid email address',
    'string.empty': 'Email is required',
    'string.max': 'Email should have a maximum length of 255 characters',
    'any.required': 'Email is a required field',
  }),
  mobile: Joi.string().max(20).optional().messages({
    'string.base': 'Mobile should be a type of text',
    'string.max': 'Mobile should have a maximum length of 20 characters',
  }),
  password: Joi.string().min(8).max(16).required().messages({
    'string.base': 'Password should be a type of text',
    'string.empty': 'Password is required',
    'string.min': 'Password should have a minimum length of 8 characters',
    'string.max': 'Password should have a maximum length of 16 characters',
    'any.required': 'Password is a required field',
  }),
  status: Joi.number().integer().min(0).max(3).default(0).messages({
    'number.base': 'Status should be a type of number',
    'number.min': 'Status should be at least 0',
    'number.max': 'Status should be at most 3',
  }),
  role: Joi.string().valid('2', '3', '4').default('4'),
});

// Joi schema for admin login validation
const login: ObjectSchema = Joi.object().keys({
  login_type: Joi.string().valid('gmail', 'facebook', 'web', 'mobile'), // Optional login type
  source: Joi.string(), // Optional source field
  email: Joi.string().required(), // Email is required
  password: Joi.string().required(), // Password is required
});

// Export both schemas as a default object
export default {
  register: register as any,
  login: login as any,
};
