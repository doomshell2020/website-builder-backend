"use strict";
// src/services/admin/user.service.test.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userService = __importStar(require("./user.service"));
const models_1 = __importDefault(require("../../models"));
jest.mock('../../models');
const mockUser = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
};
beforeEach(() => {
    jest.clearAllMocks();
    models_1.default.User = mockUser;
});
describe('User Service Unit Tests', () => {
    it('should get all customers', async () => {
        mockUser.findAll.mockResolvedValue([{ id: 1, name: 'John' }]);
        const result = await userService.findAllCustomers();
        expect(mockUser.findAll).toHaveBeenCalledWith({
            where: { role_id: '2' },
            order: [['createdAt', 'DESC']],
        });
        expect(result).toEqual([{ id: 1, name: 'John' }]);
    });
    it('should create a new customer', async () => {
        const req = {
            body: { name: 'Alice', email: 'alice@example.com' },
            file: { filename: 'alice.jpg' },
        };
        mockUser.create.mockResolvedValue({ id: 2, ...req.body });
        const result = await userService.createUser(req);
        expect(mockUser.create).toHaveBeenCalled();
        expect(result).toEqual({ id: 2, ...req.body });
    });
    it('should find customer by email', async () => {
        mockUser.findOne.mockResolvedValue({ id: 3, email: 'a@example.com' });
        const result = await userService.findCustomerByEmail('a@example.com');
        expect(mockUser.findOne).toHaveBeenCalledWith({
            where: { email: 'a@example.com' },
        });
        expect(result).toEqual({ id: 3, email: 'a@example.com' });
    });
    it('should find user by ID', async () => {
        mockUser.findByPk.mockResolvedValue({ id: 5, name: 'Test' });
        const result = await userService.findUserById(5);
        expect(mockUser.findByPk).toHaveBeenCalledWith(5);
        expect(result).toEqual({ id: 5, name: 'Test' });
    });
    it('should update a customer if email is not taken', async () => {
        mockUser.findOne.mockResolvedValue(null);
        mockUser.update.mockResolvedValue([1]);
        mockUser.findByPk.mockResolvedValue({ id: 10, name: 'Updated' });
        const req = {
            body: { email: 'new@example.com' },
            file: { filename: 'pic.jpg' },
        };
        const result = await userService.updateCustomer(10, req);
        expect(mockUser.update).toHaveBeenCalled();
        expect(result).toEqual({ id: 10, name: 'Updated' });
    });
    it('should throw error if updating with existing email', async () => {
        mockUser.findOne.mockResolvedValue({ id: 99 });
        const req = {
            body: { email: 'existing@example.com' },
            file: null,
        };
        await expect(userService.updateCustomer(10, req)).rejects.toThrow('This email is already used by another customer.');
    });
    it('should delete a customer', async () => {
        mockUser.destroy.mockResolvedValue(1);
        const result = await userService.deleteCustomerById(5);
        expect(mockUser.destroy).toHaveBeenCalledWith({ where: { id: 5 } });
        expect(result).toBe(true);
    });
    it('should update customer status', async () => {
        mockUser.update.mockResolvedValue([1]);
        mockUser.findByPk.mockResolvedValue({ id: 6, status: 'inactive' });
        const req = { body: { status: 'inactive' } };
        const result = await userService.updateCustomerStatus(6, req);
        expect(mockUser.update).toHaveBeenCalledWith({ status: 'inactive', updatedAt: expect.any(Date) }, { where: { id: 6 } });
        expect(result).toEqual({ id: 6, status: 'inactive' });
    });
});
