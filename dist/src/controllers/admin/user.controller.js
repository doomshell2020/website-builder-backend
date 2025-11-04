"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateStatusCustomer = exports.FindCustmoer = exports.DeleteCustmoer = exports.UpdateCustomer = exports.CustmoersfindAll = exports.CreateCustmoer = void 0;
const CustmoerService = __importStar(require("../../services/admin/user.service"));
const responseUtils_1 = require("../../utils/responseUtils");
const api_errors_1 = require("../../utils/api-errors");
// Create a new Custmoer (user)
const CreateCustmoer = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await CustmoerService.findCustomerByEmail(email);
        if (user) {
            throw new api_errors_1.apiErrors.BadRequestError('A user with this email already exists.');
        }
        const CustmoerDetails = await CustmoerService.createUser(req);
        const response = (0, responseUtils_1.successResponse)('User details have been created successfully', CustmoerDetails);
        return res.status(response.statusCode).json(response.body);
    }
    catch (error) {
        console.error(error);
        //  Check if it's a known custom error
        if (error instanceof api_errors_1.apiErrors.BadRequestError) {
            return res.status(400).json({ status: false, message: error.message });
        }
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};
exports.CreateCustmoer = CreateCustmoer;
// Get all Custmoer
const CustmoersfindAll = async (req, res) => {
    try {
        const user = await CustmoerService.findAllCustomers();
        const response = (0, responseUtils_1.successResponse)('Custmoers found successfully', user);
        return res.status(response.statusCode).json(response.body);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};
exports.CustmoersfindAll = CustmoersfindAll;
// Update Custmoer
const UpdateCustomer = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ status: false, message: 'Customer ID is required.' });
        }
        const result = await CustmoerService.updateCustomer(Number(id), req);
        return res.json({
            status: true,
            message: 'Customer updated successfully!',
            data: result,
        });
    }
    catch (error) {
        if (error.message?.includes('email')) {
            return res.status(400).json({ status: false, message: error.message });
        }
        console.error(error);
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};
exports.UpdateCustomer = UpdateCustomer;
// Delete Custmoer by ID
const DeleteCustmoer = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            throw new api_errors_1.apiErrors.NotFoundError('Custmoer ID is required.');
        }
        const result = await CustmoerService.deleteCustomerById(Number(id));
        if (!result) {
            throw new api_errors_1.apiErrors.BadRequestError('Custmoer not found.');
        }
        const response = (0, responseUtils_1.successResponse)('Custmoer deleted successfully.', result);
        return res.status(response.statusCode).json(response.body);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};
exports.DeleteCustmoer = DeleteCustmoer;
// Find Custmoer by ID
const FindCustmoer = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            throw new api_errors_1.apiErrors.NotFoundError('Custmoer ID is required.');
        }
        const result = await CustmoerService.findUserById(Number(id));
        if (!result) {
            throw new api_errors_1.apiErrors.BadRequestError('Custmoer not found.');
        }
        const response = (0, responseUtils_1.successResponse)('Custmoer found successfully.', result);
        return res.status(response.statusCode).json(response.body);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};
exports.FindCustmoer = FindCustmoer;
// Find Custmoer Status by ID
const UpdateStatusCustomer = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            throw new api_errors_1.apiErrors.BadRequestError('Customer ID is required.');
        }
        const result = await CustmoerService.updateCustomerStatus(Number(id), req);
        return res.json({
            status: true,
            message: 'Customer Status updated successfully!',
            data: result,
        });
    }
    catch (error) {
    }
};
exports.UpdateStatusCustomer = UpdateStatusCustomer;
