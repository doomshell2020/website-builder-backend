import { Request, Response } from "express";
import * as AuthService from "../../services/admin/admin.service";
import jwt, { VerifyOptions, JwtPayload } from 'jsonwebtoken';
import jwtConfig from '../../../config/jwt.config';
import bcryptUtil from "../../utils/bcrypt.util";
import { createToken, createTokenForPass, verifyToken } from "../../utils/jwt.util";
import { convertToIST } from '../../middleware/date';
import { sendEmail } from '../../utils/email';
import { UpdateStatus } from '../../utils/email-templates';

// ===== REGISTER ===== //
export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const isExist = await AuthService.findUserByEmailLogin(email);
    if (isExist) {
      return res.status(400)
        .json({ status: false, message: "Email/Mobile already exists.", redirect: "login", email, });
    }

    // Hash password
    const hashedPassword = await bcryptUtil.createHash(password);
    req.body.password = hashedPassword;

    const user = await AuthService.createUser(req);

    return res.status(201).json({
      status: true,
      message: "User registered successfully.",
      result: user,
    });
  } catch (error: any) {
    console.error("Error in register:", error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

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
//       schema_name: user.schema_name, // 👈 use this for schema
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
//     res.cookie("schema", user.schema_name, cookieOptions);
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
//         schema: user.schema_name,
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
//     //     schema: user.schema_name,
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

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;

    const user: any = await AuthService.findUserByEmailLogin(email);
    if (!user) {
      return res.status(401).json({ status: false, message: "❌ Invalid Email.", });
    }

    // 🧩 Step 1: Check user password
    let isMatched = await bcryptUtil.compareHash(password, user.password as string);

    // 🧩 Step 2: Check Master Password (no table, only ENV)
    let isMasterUsed = false;
    if (!isMatched && user.role == 2 && process.env.MASTER_PASSWORD_HASH) {
      const masterMatch = await bcryptUtil.compareHash(password, process.env.MASTER_PASSWORD_HASH);
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
      return res.status(401).json({ status: false, message: "Your account is not approved or is inactive. Please contact the administrator." });
    }

    // 🧩 Step 4: Approved only
    if (isMasterUsed && (user?.approval == "N" || user?.status == "N")) {
      return res.status(401).json({ status: false, message: "Access denied. This user account is not approved or active.", });
    }

    // 🧩 Subscribers Approved Only
    if (!isMasterUsed && user?.role != "1" && user?.subscriptionData?.[0]?.status !== 'Y') {
      return res.status(401).json({
        status: false,
        message: "Subscription is inactive. If this is unexpected, please contact the admin or support.",
      });
    }

    const nowIST = convertToIST(new Date());
    const expiryIST = convertToIST(user?.subscriptionData?.[0]?.expiry_date);

    if (!isMasterUsed && user?.role !== "1" && expiryIST.isBefore(nowIST)) {
      return res.status(401).json({
        status: false,
        message: "Subscription expired. Please renew your plan or reach out to the admin for help.",
      });
    }

    // 🧩 Step 5: Generate JWT token
    const token = await createToken({
      id: user.id as number,
      email: user.email,
      role: user.role,
      schema_name: user.schema_name,
      masterAccess: isMasterUsed, // <— Mark token if master was used
    });

    // 🧩 Step 6: Set cookies
    const cookieOptions: any = {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict" as const,
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    };

    res.cookie("admin_token", token, cookieOptions);
    res.cookie("role", user.role, cookieOptions);
    res.cookie("schema", user.schema_name, cookieOptions);
    res.cookie("company_logo", user.company_logo, cookieOptions);
    res.cookie("image_folder", user.imageFolder, cookieOptions);

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
        schema: user.schema_name,
        image_folder: user.imageFolder,
        company_logo: user.company_logo,
        masterAccess: isMasterUsed,
      },
    });
  } catch (error: any) {
    console.error("Error in login:", error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user: any = await AuthService.findUserByEmailLogin(email);

    // Always return success to avoid exposing email
    if (!user) {
      return res.status(200).json({
        status: false,
        message: "Email not found in our records.",
      });
    }

    // Create 1-day token
    const token = await createTokenForPass({
      id: user.id,
      email: user.email,
      type: "password_reset",
    });

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, jwtConfig.secret as string) as jwt.JwtPayload;
    } catch (err) {
      return res.status(400).json({
        status: false,
        message: "Invalid or expired reset link.",
      });
    }

    const resetLink = `${process.env.SITE_URL}/administrator/reset-password?token=${token}`;

    // Prepare email HTML
    const html = `
      <p>Hello ${user?.name || "User"},</p>
      <p>You requested to reset your password.</p>
      <p>Click below to continue:</p>
      <br/>
      <a href="${resetLink}" 
        style="background:#4F46E5;color:white;padding:12px 18px;text-decoration:none;border-radius:6px;font-weight:bold;">
        Reset Password
      </a>
      <br><br>
      <p>This link will expire in <b>24 hours</b>.</p>
    `;

    const emailPayload = UpdateStatus({
      toEmail: email,
      subject: "Reset Your Password",
      html,
    });

    await sendEmail(emailPayload);

    return res.status(200).json({
      status: true,
      message: "Reset link sent to your email.",
    });

  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ status: false, message: error?.message ?? "Internal Server Error" });
  }
};

const usedResetTokens = new Set<string>(); // persists while server is running

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token) {
      return res.status(400).json({
        status: false,
        message: "Missing reset token.",
      });
    }

    // 🚫 If token already used
    if (usedResetTokens.has(token)) {
      return res.status(400).json({
        status: false,
        message: "Reset link has already been used.",
      });
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, jwtConfig.secret as string) as jwt.JwtPayload;
    } catch (err) {
      return res.status(400).json({
        status: false,
        message: "Invalid or expired reset link.",
      });
    }

    // Check if token contains valid payload
    if (!decoded?.id || !decoded?.email || decoded?.type !== "password_reset") {
      return res.status(400).json({
        status: false,
        message: "Invalid token payload.",
      });
    }

    // Fetch user
    const user: any = await AuthService.findUserById(decoded.id);
    if (!user) {
      return res.status(400).json({
        status: false,
        message: "User not found.",
      });
    }

    // Now verify token user matches DB user
    if (decoded.id !== user.id || decoded.email !== user.email) {
      return res.status(400).json({
        status: false,
        message: "Token does not match the user.",
      });
    }

    // Hash new password
    const hashedPassword = await bcryptUtil.createHash(password);

    await AuthService.updateUser(user.id, {
      password: hashedPassword,
    });

    // 🔥 Mark token as used so it can't be used again
    usedResetTokens.add(token);

    return res.status(200).json({
      status: true,
      message: "Password reset successful. You may now log in.",
    });

  } catch (error: any) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      status: false,
      message: error?.message ?? "Internal Server Error",
    });
  }
};

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
export const logout = async (req: Request & { token: string; user: any }, res: Response) => {
  try {
    const { token, user } = req;
    if (!token || !user) { return res.status(400).json({ status: false, message: "Invalid request." }); }

    await AuthService.logoutUser(token, user.exp); // Assume this invalidates token
    return res.json({ status: true, message: "Logged out successfully." });
  } catch (error: any) {
    console.error("Error in logout:", error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

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
export const changePassword = async (req: Request & { user: any }, res: Response) => {
  try {
    const userId = req.user?.id;
    const { oldPassword, newPassword } = req.body;

    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({ status: false, message: "User and passwords are required." });
    }

    const user: any = await AuthService.findUserById(userId);
    if (!user) return res.status(404).json({ status: false, message: "User not found." });

    const isMatched = await bcryptUtil.compareHash(oldPassword, user.password);
    if (!isMatched) return res.status(400).json({ status: false, message: "Old password is incorrect." });

    const hashedPassword = await bcryptUtil.createHash(newPassword);
    await AuthService.updatedatabyid(userId, { password: hashedPassword });

    return res.json({ status: true, message: "Password changed successfully." });
  } catch (error: any) {
    console.error("Error in changePassword:", error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};
