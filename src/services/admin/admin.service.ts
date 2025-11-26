// services/user.service.ts
import db from '../../models/index'; // Make sure your model is loaded in `models/index.ts`
const { User, Role, Theme, Subscription } = db;
import { Request, Response } from 'express';
import bcryptUtil from "../../utils/bcrypt.util";
import * as cacheUtil from '../../utils/cache.util';
// Create user
export const createUser = async (req: Request) => {
  const user = await User.create(req.body);
  return user;
};

// Find user by email
export const findUserByEmail = async (email: string) => {
  const user = await User.findOne({ where: { email } });
  return user;
};

// Find user by mobile
export const findUserByMobile = async (mobile: string) => {
  const user = await User.findOne({ where: { mobile } });
  return user;
};

// Login (by email)
export const findUserByEmailLogin = async (email: string) => {
  const user = await User.findOne({
    where: { email },
    include: [
      {
        model: Role,
        as: "roleData",
        attributes: ["id", "name", "description"],
      },
      {
        model: Subscription,
        as: "subscriptionData",
        separate: true, // ✅ REQUIRED for limit + order to work
        limit: 1, // get latest only
        order: [["createdAt", "DESC"]],
      }
    ],
  });

  return user;
};


// Forgot password (same as find by email or mobile)
export const findUserByEmailForgot = findUserByEmail;
export const findUserByMobileForgot = findUserByMobile;

// Find user by ID
export const findUserById = async (id: number) => {
  const user = await User.findByPk(id);
  return user;
};

// Logout (cache-based token block)
export const logoutUser = async (token: string, exp: number): Promise<any> => {
  const now = new Date();
  const expire = new Date(exp * 1000);
  const milliseconds = expire.getTime() - now.getTime();
  return cacheUtil.set(token, token, milliseconds);
};

// Update profile by ID
export const updateProfileById = async (data: any, id: string): Promise<boolean> => {
  const { name, email, mobile, password } = data;

  const [updated] = await User.update({ name, email, mobile, password }, { where: { id: id } });

  return updated > 0;
};

export const updatePasswordById = async (
  id: string,
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Fetch user
    const user: any = await User.findOne({ where: { id } });

    if (!user) {
      return { success: false, message: "User not found." };
    }

    // Verify old password
    const isMatch = await bcryptUtil.compareHash(oldPassword, user.password);
    if (!isMatch) {
      return { success: false, message: "Old password is incorrect." };
    }

    // Prevent using same password again
    const isSamePassword = await bcryptUtil.compareHash(newPassword, user.password);
    if (isSamePassword) {
      return { success: false, message: "New password cannot be same as the old password." };
    }

    // Hash new password
    const hashedNewPassword = await bcryptUtil.createHash(newPassword);

    // Update DB
    await User.update(
      { password: hashedNewPassword },
      { where: { id } }
    );

    return { success: true, message: "Password updated successfully." };

  } catch (error) {
    console.error("Error updating password:", error);
    return {
      success: false,
      message: "Something went wrong while updating password. Try again."
    };
  }
};

export const updateUser = async (
  userId: string | number,
  updateData: Record<string, any>
): Promise<{ success: boolean; message: string }> => {
  try {
    if (!userId) {
      return { success: false, message: "User ID is required." };
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return { success: false, message: "No fields provided for update." };
    }

    const [rowsUpdated] = await User.update(updateData, {
      where: { id: userId },
    });

    if (rowsUpdated === 0) {
      return {
        success: false,
        message: "Update failed. User may not exist or no changes detected.",
      };
    }

    return { success: true, message: "User updated successfully." };
  } catch (error) {
    console.error("🔥 updateUser Service Error:", error);
    return {
      success: false,
      message: "Internal error occurred while updating user.",
    };
  }
};

export const updatedatabyid = async (id: number, data: any) => {
  try {
    const [updatedCount, updatedRows] = await User.update(data, {
      where: { id },
      returning: true, // So you can get the updated record
    });

    if (updatedCount === 0) {
      return null; // No user found or nothing updated
    }

    return updatedRows[0]; // Return updated user
  } catch (error) {
    console.error("Error in updatedatabyid:", error);
    throw error;
  }
};