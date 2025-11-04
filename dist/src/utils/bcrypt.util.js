"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const bcryptUtil = {
    /**
     * Compare a plain text password with a hashed password
     * @param plainPassword - The plain password to compare
     * @param hashedPassword - The hashed password to compare against
     * @returns Promise<boolean> - true if matched, false otherwise
     */
    compareHash: (plainPassword, hashedPassword) => {
        return bcrypt_1.default.compare(plainPassword, hashedPassword);
    },
    /**
     * Create a hashed version of a plain password
     * @param plainPassword - The plain password to hash
     * @returns Promise<string> - The hashed password
     */
    createHash: (plainPassword) => {
        return bcrypt_1.default.hash(plainPassword, 10); // 10 is the salt rounds
    }
};
exports.default = bcryptUtil;
