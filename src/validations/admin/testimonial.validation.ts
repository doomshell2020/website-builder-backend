import Joi from 'joi';

export const TestimonialJoiSchema = Joi.object({
  name: Joi.string().max(255).required(),
  company_logo: Joi.string().optional(), // or just .string() if not a URL
  cat_id: Joi.number().integer().optional(),
  subcat_id: Joi.number().integer().optional(),
  desig: Joi.string().allow(''),
  description: Joi.string().optional(),
  image: Joi.string().optional(), // or .string() if not a URL
  url: Joi.string().uri().optional(),
  status: Joi.string().valid('Y', 'N').optional(),
});

export const UpdateTestimonialJoiSchema =
  TestimonialJoiSchema.fork(Object.keys(TestimonialJoiSchema.describe().keys), (field) => field.optional());