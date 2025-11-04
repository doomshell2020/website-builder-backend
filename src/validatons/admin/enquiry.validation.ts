import Joi from 'joi';

export const createEnquirySchema = Joi.object({
  name: Joi.string().max(100).required(),
  email: Joi.string().email().max(255).required(),
  mobile: Joi.string().max(20).optional(),
  subject: Joi.string().required(),
  country: Joi.string().optional(),
  status: Joi.string().valid('Y', 'N').optional(),
  html: Joi.string().optional(),
  company_name: Joi.string().optional(),
  company_email: Joi.string().optional(),
});


export const updateEnquirySchema = Joi.object({
  name: Joi.string().max(100).optional(),
  email: Joi.string().email().max(255).optional(),
  mobile: Joi.string().max(20).optional(),
  subject: Joi.string().optional(),
  country: Joi.string().optional(),
  status: Joi.string().valid('Y', 'N').optional(),
});