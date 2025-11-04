"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.createToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_config_1 = __importDefault(require("../../config/jwt.config"));
const createToken = (data) => {
    const options = {
        expiresIn: jwt_config_1.default.ttl,
    };
    return jsonwebtoken_1.default.sign(data, jwt_config_1.default.secret, options);
};
exports.createToken = createToken;
const verifyToken = (token) => {
    const options = {};
    return jsonwebtoken_1.default.verify(token, jwt_config_1.default.secret, options);
};
exports.verifyToken = verifyToken;
