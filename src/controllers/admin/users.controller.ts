import { Request, Response } from "express";
import * as UserService from "../../services/admin/users.service";
import { successResponse } from "../../utils/responseUtils";
import { apiErrors } from "../../utils/api-errors";
import { deleteUploadedFilesFromReq } from "../../utils/delete-multi";
import fs from "fs";
import path from "path";

// Helper to delete uploaded file
const deleteUploadedFile = (filename?: string) => {
  if (!filename) return;
  const filePath = path.join(process.cwd(), "uploads", filename);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error("Failed to delete uploaded file:", err);
    }
  }
};

// ===== CREATE USER =====
export const CreateUser = async (req: Request, res: Response) => {
  try {
    const { email, role } = req.body;
    const existingUser: any = await UserService.findUserByEmail(email);

    if (existingUser) {
      const hasFiles = req.file || (req.files && Object.keys(req.files).length > 0);
      if (hasFiles) await deleteUploadedFilesFromReq(req);
      throw new apiErrors.BadRequestError("A user with this email already exists.");
    }

    const userDetails: any = await UserService.createUser(req);
    let roleName = '';
    switch (userDetails.role) {
      case 2:
        roleName = 'Admin';
        break;
      case 3:
        roleName = 'Tenant';
        break;
      default:
        roleName = 'User';
        break;
    }
    const response = successResponse(`${roleName} have been created successfully`, userDetails);
    return res.status(response.statusCode).json(response.body);
  } catch (error: any) {
    if (req?.file || (req?.files && Object.keys(req.files).length > 0)) {
      deleteUploadedFilesFromReq(req);
    }
    if (error.message == 'Validation error') {
      return res.status(404).json({ status: false, message: "A user with this email already exists." });
    }
    const status = error instanceof apiErrors.BadRequestError ? 400 : 500;
    return res.status(status).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// ===== GET ALL USERS =====
export const UsersfindAll = async (req: Request, res: Response) => {
  try {
    const users = await UserService.findAllUsers(req.query as any);
    const response = successResponse("Users found successfully", users);
    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

// ===== GET ALL ADMINS =====
export const FindAllAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await UserService.fetchAllAdmin(req.query as any);
    const response = successResponse("Admins found successfully", admins);
    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

// ===== UPDATE USER =====
export const UpdateUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) throw new apiErrors.BadRequestError("User ID is required.");

    const updatedUser = await UserService.updateUser(id, req);
    return res.json({
      status: true,
      message: "User updated successfully!",
      data: updatedUser,
    });
  } catch (error: any) {
    if (req?.file || (req?.files && Object.keys(req.files).length > 0)) {
      deleteUploadedFilesFromReq(req);
    } const status = error.message?.includes("email") ? 400 : 500;
    return res.status(status).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// ===== DELETE USER =====
export const DeleteUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) throw new apiErrors.NotFoundError("User ID is required.");

    const result = await UserService.deleteUserById(id);
    const response = successResponse("User deleted successfully.", result);
    return res.status(response.statusCode).json(response.body);
  } catch (error: any) {
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// ===== FIND USER BY ID =====
export const FindUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) throw new apiErrors.NotFoundError("User ID is required.");

    const user: any = await UserService.findUserById(id);
    if (!user) throw new apiErrors.BadRequestError("User not found.");

    const response = successResponse("User found successfully.", user);
    return res.status(response.statusCode).json(response.body);
  } catch (error: any) {
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// ===== UPDATE USER STATUS =====
export const UpdateStatusUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) throw new apiErrors.BadRequestError("User ID is required.");

    const updatedUser = await UserService.updateUserStatus(id, req);
    return res.json({
      status: true,
      message: "User status updated successfully!",
      data: updatedUser,
    });
  } catch (error: any) {
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// ===== UPDATE USER APPROVAL =====
export const ApproveUserForThereTenantShip = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) throw new apiErrors.BadRequestError("User ID is required.");

    const approveUser: any = await UserService.approveUser(id, req);

    if (!approveUser || approveUser.status === false) {
      return res.status(400).json({
        status: false,
        message: approveUser?.message || "Failed to approve user.",
      });
    }
    return res.json({
      status: true,
      message: "User approved successfully!",
      data: approveUser,
    });
  } catch (error: any) {
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// ===== SEARCH USER =====
export const SearchUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { page, limit, searchTerm, fromDate, toDate } = req.query;

    const user = await UserService.searchUser(
      Number(page),
      Number(limit),
      searchTerm as string,
      fromDate as string,
      toDate as string
    );

    const response = successResponse('Users fetched successfully', user);
    return res.status(response.statusCode).json(response.body);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};