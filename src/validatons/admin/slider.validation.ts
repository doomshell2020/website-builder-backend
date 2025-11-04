import Joi, { ObjectSchema } from 'joi';

export const SliderJoiSchema: ObjectSchema = Joi.object({
  title: Joi.string().max(250).required(),
  images: Joi.string(),
  description: Joi.string().optional(),
  status: Joi.string().valid('Y', 'N').default('Y'),
});

export const SliderUpdateJoiSchema: ObjectSchema = Joi.object({
  title: Joi.string().max(250).optional(),
  images: Joi.string().optional(),
  description: Joi.string().optional(),
  status: Joi.string().optional(),
});

// export const SliderUpdateJoiSchema = SliderJoiSchema.fork(Object.keys(SliderJoiSchema.describe().keys), (field) => field.optional());
