import Joi from "joi";

export const ThemeSchema = Joi.object({
    name: Joi.string().min(2).required(),
    slug: Joi.string().allow(null, ""),
    description: Joi.string().allow(null, ""),
    status: Joi.string().valid("Y", "N").default("Y"),
});

export const editThemeSchema = ThemeSchema.fork(Object.keys(ThemeSchema.describe().keys), (field) => field.optional());