"use strict";
// src/services/admin/user.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomerStatus = exports.deleteCustomerById = exports.updateCustomer = exports.findUserById = exports.findCustomerByEmail = exports.createUser = exports.findAllCustomers = void 0;
const sequelize_1 = require("sequelize");
const index_1 = __importDefault(require("../../models/index"));
// Get all customers (role_id = 2)
const findAllCustomers = async () => {
    const { User } = index_1.default;
    return await User.findAll({
        where: { role_id: '2' },
        order: [['createdAt', 'DESC']],
    });
};
exports.findAllCustomers = findAllCustomers;
// Create new customer
const createUser = async (req) => {
    const { User } = index_1.default;
    const { body, file } = req;
    const userData = {
        ...body,
        role_id: '2',
        profile: file?.filename || null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    return await User.create(userData);
};
exports.createUser = createUser;
// Find customer by email
const findCustomerByEmail = async (email) => {
    const { User } = index_1.default;
    return await User.findOne({ where: { email } });
};
exports.findCustomerByEmail = findCustomerByEmail;
// Find user by ID
const findUserById = async (id) => {
    const { User } = index_1.default;
    return await User.findByPk(id);
};
exports.findUserById = findUserById;
// Update customer
const updateCustomer = async (id, req) => {
    const { User } = index_1.default;
    const { body, file } = req;
    const existing = await User.findOne({
        where: {
            email: body.email,
            id: { [sequelize_1.Op.ne]: id },
        },
    });
    if (existing) {
        throw new Error('This email is already used by another customer.');
    }
    const updateData = {
        ...body,
        profile: file?.filename || undefined,
        updatedAt: new Date(),
    };
    await User.update(updateData, { where: { id } });
    return await User.findByPk(id);
};
exports.updateCustomer = updateCustomer;
// Delete customer
const deleteCustomerById = async (id) => {
    const { User } = index_1.default;
    await User.destroy({ where: { id } });
    return true;
};
exports.deleteCustomerById = deleteCustomerById;
// Update customer status
const updateCustomerStatus = async (id, req) => {
    const { User } = index_1.default;
    const { status } = req.body;
    await User.update({ status, updatedAt: new Date() }, { where: { id } });
    return await User.findByPk(id);
};
exports.updateCustomerStatus = updateCustomerStatus;
