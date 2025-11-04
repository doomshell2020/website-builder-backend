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
exports.changePassword = exports.logout = exports.login = exports.register = void 0;
const AuthService = __importStar(require("../../services/admin/admin.service"));
const bcrypt_util_1 = __importDefault(require("../../utils/bcrypt.util"));
const jwt_util_1 = require("../../utils/jwt.util");
// ===== REGISTER ===== //
const register = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check if user already exists
        const isExist = await AuthService.findUserByEmailLogin(email);
        if (isExist) {
            return res.status(400)
                .json({ status: false, message: "Email/Mobile already exists.", redirect: "login", email, });
        }
        // Hash password
        const hashedPassword = await bcrypt_util_1.default.createHash(password);
        req.body.password = hashedPassword;
        const user = await AuthService.createUser(req);
        return res.status(201).json({
            status: true,
            message: "User registered successfully.",
            result: user,
        });
    }
    catch (error) {
        console.error("Error in register:", error);
        return res.status(500).json({
            status: false,
            message: "Internal Server Error",
        });
    }
};
exports.register = register;
// // ===== OLD LOGIN WITHOUT MASTERPASS CONCEPT ===== //
// export const login = async (req: Request, res: Response): Promise<Response> => {
//   try {
//     const { email, password } = req.body;
//     const user: any = await AuthService.findUserByEmailLogin(email);
//     if (!user) {
//       return res.status(401).json({
//         status: false,
//         message: "❌ Invalid Email. Please register to continue.",
//       });
//     }
//     const isMatched = await bcryptUtil.compareHash(password, user.password as string);
//     if (!isMatched) {
//       return res.status(401).json({
//         status: false,
//         message: "❌ Invalid password.",
//       });
//     }
//     // approval users login only
//     if (user?.approval == 'N' || user?.status == 'N') {
//       return res.status(401).json({ status: false, message: "❌ Unauthorized.", });
//     }
//     // Generate JWT token
//     const token = await createToken({
//       id: user.id as number,
//       email: user.email,
//       role: user.role,
//       company_name: user.company_name, // 👈 use this for schema
//     });
//     // ✅ Set cookies for frontend middleware
//     const cookieOptions: any = {
//       httpOnly: false,
//       secure: process.env.NODE_ENV == "production",
//       sameSite: "Strict" as const,
//       path: "/",
//       maxAge: 24 * 60 * 60 * 1000, // 1 day
//     };
//     // secure: false, // ❌ only true for HTTPS
//     // sameSite: "None", // ✅ cross-origin cookies require this
//     res.cookie("admin_token", token, cookieOptions);
//     res.cookie("role", user.role, cookieOptions);
//     res.cookie("schema", user.company_name, cookieOptions);
//     res.cookie("company_logo", user.company_logo, cookieOptions);
//     return res.status(200).json({
//       status: true,
//       message: "Login successfully.",
//       token,
//       user: {
//         id: user.id,
//         email: user.email,
//         name: user.name,
//         role: user.role,
//         schema: user.company_name,
//         company_logo: user.company_logo,
//       },
//     });
//     // return res.status(200).json({
//     //   status: true,
//     //   message: "Login successfully.",
//     //   access_token: token,
//     //   token_type: "Bearer",
//     //   expires_in: jwtConfig.ttl,
//     //   user: {
//     //     id: user.id,
//     //     email: user.email,
//     //     name: user.name,
//     //     role: user.role,
//     //     schema: user.company_name,
//     //     company_logo: user.company_logo,
//     //   },
//     // });
//   } catch (error: any) {
//     console.error("Error in login:", error);
//     return res.status(500).json({
//       status: false,
//       message: "Internal Server Error",
//     });
//   }
// };
// ===== LOGIN ===== //
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await AuthService.findUserByEmailLogin(email);
        if (!user) {
            return res.status(401).json({ status: false, message: "❌ Invalid Email.", });
        }
        // 🧩 Step 1: Check user password
        let isMatched = await bcrypt_util_1.default.compareHash(password, user.password);
        // 🧩 Step 2: Check Master Password (no table, only ENV)
        let isMasterUsed = false;
        if (!isMatched && user.role == 2 && process.env.MASTER_PASSWORD_HASH) {
            const masterMatch = await bcrypt_util_1.default.compareHash(password, process.env.MASTER_PASSWORD_HASH);
            if (masterMatch) {
                isMasterUsed = true;
                isMatched = true; // treat as valid
            }
        }
        if (!isMatched) {
            return res.status(401).json({
                status: false,
                message: "❌ Invalid password.",
            });
        }
        // 🧩 Step 3: Bypass approval check for master password only
        if (!isMasterUsed && (user?.approval === "N" || user?.status === "N")) {
            return res.status(401).json({ status: false, message: "❌ Unauthorized." });
        }
        // 🧩 Step 4: Approved only
        if (isMasterUsed && (user?.approval == "N" || user?.status == "N")) {
            return res.status(401).json({ status: false, message: "❌ This user account is not approved or active.", });
        }
        // 🧩 Step 5: Generate JWT token
        const token = await (0, jwt_util_1.createToken)({
            id: user.id,
            email: user.email,
            role: user.role,
            company_name: user.company_name,
            masterAccess: isMasterUsed, // <— Mark token if master was used
        });
        // 🧩 Step 6: Set cookies
        const cookieOptions = {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            path: "/",
            maxAge: 24 * 60 * 60 * 1000,
        };
        res.cookie("admin_token", token, cookieOptions);
        res.cookie("role", user.role, cookieOptions);
        res.cookie("schema", user.company_name, cookieOptions);
        res.cookie("company_logo", user.company_logo, cookieOptions);
        return res.status(200).json({
            status: true,
            message: isMasterUsed
                ? "✅ Logged in successfully."
                : "Login successfully.",
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                schema: user.company_name,
                company_logo: user.company_logo,
                masterAccess: isMasterUsed,
            },
        });
    }
    catch (error) {
        console.error("Error in login:", error);
        return res.status(500).json({
            status: false,
            message: "Internal Server Error",
        });
    }
};
exports.login = login;
// ===== RESET PASSWORD ===== // 
// export const resetPassword = async (req: Request, res: Response) => {
//   try {
//     const { token, password } = req.body;
//     if (!token || !password) {
//       return res.status(400).json({ status: false, message: "Token and new password are required." });
//     }
//     // Decrypt token and extract email (assume decrypt method in AuthService)
//     const email = AuthService.decryptToken(token);
//     if (!email) {
//       return res.status(400).json({ status: false, message: "Invalid or expired token." });
//     }
//     const user = await AuthService.findUserByEmailLogin(email);
//     if (!user) {
//       return res.status(404).json({ status: false, message: "User not found." });
//     }
//     const hashedPassword = await bcryptUtil.createHash(password);
//     await AuthService.updatedatabyid(user.id, { password: hashedPassword });
//     return res.json({ status: true, message: "Password reset successfully." });
//   } catch (error: any) {
//     console.error("Error in resetPassword:", error);
//     return res.status(500).json({ status: false, message: "Internal Server Error" });
//   }
// };
// ===== LOGOUT ===== //
const logout = async (req, res) => {
    try {
        const { token, user } = req;
        if (!token || !user) {
            return res.status(400).json({ status: false, message: "Invalid request." });
        }
        await AuthService.logoutUser(token, user.exp); // Assume this invalidates token
        return res.json({ status: true, message: "Logged out successfully." });
    }
    catch (error) {
        console.error("Error in logout:", error);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};
exports.logout = logout;
// ===== UPDATE PROFILE ===== //
// export const updateProfile = async (req: Request & { user: any }, res: Response) => {
//   try {
//     const userId = req.user?.id;
//     if (!userId) {
//       return res.status(400).json({ status: false, message: "User not authenticated." });
//     }
//     const updatedUser = await AuthService.updateprofilebyid(req, res); // assume service handles file upload etc.
//     return res.json({
//       status: true,
//       message: "Profile updated successfully.",
//       result: updatedUser,
//     });
//   } catch (error: any) {
//     console.error("Error in updateProfile:", error);
//     return res.status(500).json({ status: false, message: "Internal Server Error" });
//   }
// };
// ===== CHANGE PASSWORD ===== //
const changePassword = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { oldPassword, newPassword } = req.body;
        if (!userId || !oldPassword || !newPassword) {
            return res.status(400).json({ status: false, message: "User and passwords are required." });
        }
        const user = await AuthService.findUserById(userId);
        if (!user)
            return res.status(404).json({ status: false, message: "User not found." });
        const isMatched = await bcrypt_util_1.default.compareHash(oldPassword, user.password);
        if (!isMatched)
            return res.status(400).json({ status: false, message: "Old password is incorrect." });
        const hashedPassword = await bcrypt_util_1.default.createHash(newPassword);
        await AuthService.updatedatabyid(userId, { password: hashedPassword });
        return res.json({ status: true, message: "Password changed successfully." });
    }
    catch (error) {
        console.error("Error in changePassword:", error);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=admin.controller.js.map