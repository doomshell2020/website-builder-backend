import Joi, { ObjectSchema } from 'joi';

export const GallerySchema: ObjectSchema = Joi.object({
    title: Joi.string().max(200).required(),
    slug: Joi.string().required(),
    images: Joi.array().items(Joi.string()).max(20).optional(),
    existingImages: Joi.array().items(Joi.string()).optional(),
    description: Joi.string().allow("").optional(),
    status: Joi.string().valid('Y', 'N').default('Y'),
});

export const GalleryEditSchema: ObjectSchema = Joi.object({
    title: Joi.string().max(200).optional(),
    slug: Joi.string().optional(),
    images: Joi.array().items(Joi.string()).optional(),
    existingImages: Joi.array().items(Joi.string()).optional(),
    description: Joi.string().allow("").optional(),
    status: Joi.string().optional(),
});

export const DeleteValidation: ObjectSchema = Joi.object({
    galleryname: Joi.string().min(1).required(),
    filename: Joi.string().min(1).required(),
});