import Joi from "joi";

export const createPlanJoi = Joi.object({
    name: Joi.string().max(255).required(),
    price: Joi.string().max(255).required(),
    status: Joi.string().valid("Y", "N").default("Y")
});

export const updatePlanJoi = Joi.object({
    name: Joi.string().max(255).optional(),
    price: Joi.string().max(255).optional(),
    status: Joi.string().valid("Y", "N").optional()
});