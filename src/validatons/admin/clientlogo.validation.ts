import Joi from 'joi';

export const ClientlogoJoiSchema = Joi.object({
  seq: Joi.number().integer().min(1).required(),
  url: Joi.string().uri().allow(null),
  status: Joi.string().valid('Y', 'N').optional(),
  image: Joi.string(),
});

export const UpdateClientlogoJoiSchema =
  ClientlogoJoiSchema.fork(Object.keys(ClientlogoJoiSchema.describe().keys), (field) => field.optional());