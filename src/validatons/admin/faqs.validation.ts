import Joi from "joi";

export const createFAQCategorySchema = Joi.object({
    name: Joi.string().max(200).required(),
    slug: Joi.string().allow(null, ""),
    description: Joi.string().allow(null, ""),
    status: Joi.string().valid("Y", "N").default("Y"),
    deleted: Joi.string().valid("Y", "N").default("N"),
});


export const updateFAQCategorySchema = Joi.object({
    name: Joi.string().max(200).optional(),
    slug: Joi.string().allow(null, "").optional(),
    description: Joi.string().allow(null, "").optional(),
    status: Joi.string().valid("Y", "N").optional(),
    deleted: Joi.string().valid("Y", "N").optional(),
});


export const createFAQSchema = Joi.object({
    category_id: Joi.number().integer().allow(null),
    question: Joi.string().required(),
    answer: Joi.string().required(),
    slug: Joi.string().allow(null, ""),
    status: Joi.string().valid("Y", "N").default("Y"),
    deleted: Joi.string().valid("Y", "N").default("N"),
});


export const updateFAQSchema = Joi.object({
    category_id: Joi.number().integer().allow(null).optional(),
    question: Joi.string().optional(),
    answer: Joi.string().optional(),
    slug: Joi.string().allow(null, "").optional(),
    status: Joi.string().valid("Y", "N").optional(),
    deleted: Joi.string().valid("Y", "N").optional(),
});

