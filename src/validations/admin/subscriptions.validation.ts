import Joi from "joi";

function toString(value: any) {
  if (value === null || value === undefined) return "";
  return String(value);
}

export const subscriptionJoiSchema = Joi.object({
  plan_id: Joi.alternatives(Joi.number(), Joi.string())
    .required()
    .custom((v) => toString(v)),
  c_id: Joi.alternatives(Joi.number(), Joi.string())
    .required()
    .custom((v) => toString(v)),
  created: Joi.alternatives(Joi.date(), Joi.string())
    .required()
    .custom((v) => toString(v)),
  expiry_date: Joi.alternatives(Joi.date(), Joi.string())
    .required()
    .custom((v) => toString(v)),
  status: Joi.string().valid("Y", "N", "D").default("Y"),
  payment_id: Joi.string().allow(null, "").custom(toString),
  order_id: Joi.string().allow(null, "").custom(toString),
  signature_razorpay: Joi.string().allow(null, "").custom(toString),
  totaluser: Joi.alternatives(Joi.number(), Joi.string())
    .required()
    .custom((v) => toString(v)),
  plantotalprice: Joi.alternatives(Joi.number(), Joi.string())
    .allow(null, "")
    .custom((v) => toString(v)),
  taxprice: Joi.alternatives(Joi.number(), Joi.string())
    .allow(null, "")
    .custom((v) => toString(v)),
  discount: Joi.alternatives(Joi.number(), Joi.string())
    .allow(null, "")
    .custom((v) => toString(v)),
  payment_detail: Joi.string().default("0"),
  dropreason: Joi.string().allow(null, ""),
  isdrop: Joi.string().valid("Y", "N").default("N"),
  dropdate: Joi.alternatives(Joi.date(), Joi.string())
    .allow(null)
    .custom((v) => (v ? toString(v) : null)),
  payment_date: Joi.alternatives(Joi.date(), Joi.string())
    .allow(null)
    .custom((v) => (v ? toString(v) : null)),
  razorpay_order_id: Joi.string().allow(null, ""),
  cgst: Joi.alternatives(Joi.number(), Joi.string())
    .default("0")
    .custom((v) => toString(v)),
  sgst: Joi.alternatives(Joi.number(), Joi.string())
    .default("0")
    .custom((v) => toString(v)),
  igst: Joi.alternatives(Joi.number(), Joi.string())
    .default("0")
    .custom((v) => toString(v)),
  per_user_rate: Joi.alternatives(Joi.number(), Joi.string())
    .default("0")
    .custom((v) => toString(v)),
  email: Joi.string().optional(),
}).options({ convert: true });
