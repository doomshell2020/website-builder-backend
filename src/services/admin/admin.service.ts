// services/user.service.ts
import db from '../../models/index'; // Make sure your model is loaded in `models/index.ts`
const { User, Role, Theme, Subscription } = db;
import { Request, Response } from 'express';
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