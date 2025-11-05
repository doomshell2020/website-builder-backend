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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatedatabyid = exports.updateProfileById = exports.logoutUser = exports.findUserById = exports.findUserByMobileForgot = exports.findUserByEmailForgot = exports.findUserByEmailLogin = exports.findUserByMobile = exports.findUserByEmail = exports.createUser = void 0;
// services/user.service.ts
const index_1 = __importDefault(require("../../models/index")); // Make sure your model is loaded in `models/index.ts`
const User = index_1.default.User;
const cacheUtil = __importStar(require("../../utils/cache.util"));
// Create user
const createUser = async (req) => {
    const user = await User.create(req.body);
    return user;
};
exports.createUser = createUser;
// Find user by email
const findUserByEmail = async (email) => {
    const user = await User.findOne({ where: { email } });
    return user;
};
exports.findUserByEmail = findUserByEmail;
// Find user by mobile
const findUserByMobile = async (mobile) => {
    const user = await User.findOne({ where: { mobile } });
    return user;
};
exports.findUserByMobile = findUserByMobile;
// Login (by email)
const findUserByEmailLogin = async (email) => {
    const user = await User.findOne({
        where: {
            email,
        },
    });
    return user;
};
exports.findUserByEmailLogin = findUserByEmailLogin;
// Forgot password (same as find by email or mobile)
exports.findUserByEmailForgot = exports.findUserByEmail;
exports.findUserByMobileForgot = exports.findUserByMobile;
// Find user by ID
const findUserById = async (id) => {
    const user = await User.findByPk(id);
    return user;
};
exports.findUserById = findUserById;
// Logout (cache-based token block)
const logoutUser = async (token, exp) => {
    const now = new Date();
    const expire = new Date(exp * 1000);
    const milliseconds = expire.getTime() - now.getTime();
    return cacheUtil.set(token, token, milliseconds);
};
exports.logoutUser = logoutUser;
// Update profile by ID
const updateProfileById = async (data, id) => {
    const { name, email, mobile, password } = data;
    const [updated] = await User.update({ name, email, mobile, password }, { where: { id: id } });
    return updated > 0;
};
exports.updateProfileById = updateProfileById;
const updatedatabyid = async (id, data) => {
    try {
        const [updatedCount, updatedRows] = await User.update(data, {
            where: { id },
            returning: true, // So you can get the updated record
        });
        if (updatedCount === 0) {
            return null; // No user found or nothing updated
        }
        return updatedRows[0]; // Return updated user
    }
    catch (error) {
        console.error("Error in updatedatabyid:", error);
        throw error;
    }
};
exports.updatedatabyid = updatedatabyid;
//# sourceMappingURL=admin.service.js.map