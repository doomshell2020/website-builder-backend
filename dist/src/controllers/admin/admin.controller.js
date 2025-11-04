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
exports.login = exports.register = void 0;
const AuthService = __importStar(require("../../services/admin/admin.service"));
const jwt_config_1 = __importDefault(require("../../../config/jwt.config"));
const bcrypt_util_1 = __importDefault(require("../../utils/bcrypt.util"));
const jwt_util_1 = require("../../utils/jwt.util");
// Controller function to handle admin registration and account creation
const register = async (req, res) => {
    try {
        const { email, password } = req.body;
        const isExist = await AuthService.findUserByEmailLogin(email);
        if (isExist) {
            return res.status(200).json({
                status: false,
                message: 'Email/Mobile is already exists.',
                redirect: 'login',
                email,
            });
        }
        const hashedPassword = await bcrypt_util_1.default.createHash(password);
        req.body.password = hashedPassword;
        const user = await AuthService.createUser(req);
        return res.status(201).json({
            status: true,
            message: 'User registered successfully.',
            result: user,
        });
    }
    catch (error) {
        console.error('Error in register:', error); // Log the error to console
        return res.status(500).json({
            status: false,
            message: 'Internal Server Error',
        });
    }
};
exports.register = register;
// Controller: Handles admin login request and returns auth token and user data
const login = async (req, res) => {
    const { email, password, type } = req.body;
    console.log(email);
    let user = await AuthService.findUserByEmailLogin(email);
    if (user) {
        const isMatched = await bcrypt_util_1.default.compareHash(password, user.password);
        if (isMatched) {
            const token = await (0, jwt_util_1.createToken)({ id: user.id });
            return res.json({
                status: true,
                message: 'Successfully login..!',
                access_token: token,
                token_type: 'Bearer',
                expires_in: jwt_config_1.default.ttl,
            });
        }
    }
    return res.status(200).json({ status: false, message: 'Invalid credentials..!' });
};
exports.login = login;
// export const reset_passwords = async (req: Request, res: Response): Promise<Response> => {
//   let getToken: string = req.body.token?.replace("token=", "") || '';
//   const decryptedData = AesService.decrypt(getToken);
//   const [emailRaw] = decryptedData.split('==');
//   const email = emailRaw?.trim() || '';
//   const user = await AuthService.findUserByEmailForgot(email);
//   if (user) {
//     const userId = user.dataValues.id;
//     const hashedPassword = await bcryptUtil.createHash(req.body.password);
//     const updatedUser = await AuthService.updatedatabyid(userId, { password: hashedPassword });
//     if (updatedUser) {
//       return res.json({
//         status: true,
//         message: 'Successfully updated..!',
//       });
//     }
//   }
//   return res.status(200).json({ status: false, message: 'Invalid credentials..!' });
// };
// export const logout = async (req: Request & { token: string; user: any }, res: Response): Promise<Response> => {
//   await AuthService.logoutUser(req.token, req.user.exp);
//   return res.json({ status: true, message: 'Logged out successfully.' });
// };
// export const Updateprofile = async (req: Request, res: Response): Promise<Response> => {
//   const user = await AuthService.updateprofilebyid(req, res);
//   return res.json({
//     status: true,
//     message: 'Success.',
//     result: user,
//   });
// };
// export const changePassword = async (req: Request & { user: any }, res: Response): Promise<Response> => {
//   if (req.user?.id) {
//     const hashedPassword = await bcryptUtil.createHash(req.body.password);
//     const updatedUser = await AuthService.updatedatabyid(req.user.id, { password: hashedPassword });
//     return res.json({
//       status: true,
//       message: 'Successfully updated..!',
//     });
//   } else {
//     return res.status(404).json({ status: false, message: 'Invalid password..!' });
//   }
// };
