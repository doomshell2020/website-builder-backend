import Joi, { ObjectSchema } from 'joi';

export const StaticJoiSchema: ObjectSchema = Joi.object({
  id: Joi.number().optional(),
  title: Joi.string().max(255).required(),
  url: Joi.string().optional().allow(null),
  images: Joi.string(),
  content: Joi.string().required(),
});

export const StaticUpdateJoiSchema =
  StaticJoiSchema.fork(Object.keys(StaticJoiSchema.describe().keys), (field) => field.optional());