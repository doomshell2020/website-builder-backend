import Joi from 'joi';

export const SeoJoiSchema = Joi.object({
  orgid: Joi.number().default(0),
  type: Joi.string().max(250).allow(null, ''),
  page: Joi.string().max(255).required().messages({
    'any.required': 'Page is required',
    'string.empty': 'Page cannot be empty',
    'string.max': 'Page must be at most 255 characters',
  }),
  location: Joi.string().required(),
  title: Joi.string().max(255).required().messages({
    'any.required': 'Title is required',
    'string.empty': 'Title cannot be empty',
    'string.max': 'Title must be at most 255 characters',
  }),
  keyword: Joi.string().required().messages({
    'any.required': 'Keyword is required',
    'string.empty': 'Keyword cannot be empty',
  }),
  description: Joi.string().required().messages({
    'any.required': 'Description is required',
    'string.empty': 'Description cannot be empty',
  }),
  status: Joi.string().valid('Y', 'N').default('Y'),
  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().default(() => new Date()),
});

export const UpdateSeoJoiSchema =
  SeoJoiSchema.fork(Object.keys(SeoJoiSchema.describe().keys), (field) => field.optional());