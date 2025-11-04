"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const AddUser = joi_1.default.object({
    name: joi_1.default.string().max(255).required(),
    email: joi_1.default.string().email().required(),
    mobile: joi_1.default.string().max(20).required(),
    country: joi_1.default.string().required(),
    state: joi_1.default.string().required(),
    city: joi_1.default.string().required(),
    address: joi_1.default.string().required(),
    landmark: joi_1.default.string().allow(null, ''),
    dob: joi_1.default.date().allow(null, ''),
    gender: joi_1.default.string().valid('male', 'female', 'other').allow(null, ''),
    status: joi_1.default.string().valid('active', 'inactive').default('active'),
    categories: joi_1.default.alternatives().try(joi_1.default.array().items(joi_1.default.string()), joi_1.default.string()).optional()
});
exports.default = { AddUser };
