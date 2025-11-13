import { Request, Response } from "express";
import * as UserService from "../../services/admin/users.service";
import { successResponse } from "../../utils/responseUtils";
import { apiErrors } from "../../utils/api-errors";
import { deleteUploadedFilesFromReq } from "../../utils/delete-multi-files";
import { deleteUploadFolder } from "../../utils/delete-folder";

// ===== CREATE USER =====
export const CreateUser = async (req: any, res: Response) => {
  try {
    const { email, role, company_name, subdomain } = req.body;

    // 🔍 1️⃣ Check if user already exists
    const existingUser: any = await UserService.findUserByEmail(email);

    if (existingUser) {
      // Clean up uploaded files/folder
      if (req.file || (req.files && Object.keys(req.files).length > 0)) {
        await deleteUploadedFilesFromReq(req);
      }
      if (req.imagefolder) deleteUploadFolder(req.imagefolder);

      throw new apiErrors.BadRequestError("A user with this email already exists.");
    }
    // 🔍 2️⃣ Check if company already exists & subdomain
    const existingCompany: any = await UserService.findCompanyName(company_name);

    if (existingCompany) {
      if (req.file || (req.files && Object.keys(req.files).length > 0)) {
        await deleteUploadedFilesFromReq(req);
      }
      if (req.imagefolder) deleteUploadFolder(req.imagefolder);

      throw new apiErrors.BadRequestError("A company with this name already exists.");
    }

    const existingSubdomain: any = await UserService.findCompanySubdomain(subdomain);

    if (existingSubdomain) {
      if (req.file || (req.files && Object.keys(req.files).length > 0)) {
        await deleteUploadedFilesFromReq(req);
      }
      if (req.imagefolder) deleteUploadFolder(req.imagefolder);

      throw new apiErrors.BadRequestError("A company with this subdomain already exists.");
    }

    // ✅ 3️⃣ Create new user
    const userDetails: any = await UserService.createUser(req);

    const response = successResponse(`User has been created successfully`, userDetails);
    return res.status(response.statusCode).json(response.body);
  } catch (error: any) {
    // 🧹 Cleanup if any failure occurs
    if (req?.file || (req?.files && Object.keys(req.files).length > 0)) {
      deleteUploadedFilesFromReq(req);
    }

    if (req?.imagefolder) {
      deleteUploadFolder(req.imagefolder);
    }

    if (error.message === "Validation error") {
      return res.status(404).json({
        status: false,
        message: "A user with this email already exists.",
      });
    }

    const status = error instanceof apiErrors.BadRequestError ? 400 : 500;
    return res.status(status).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ===== GET ALL USERS =====
export const UsersFindAll = async (req: Request, res: Response) => {
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
    const { company_name } = req.body;

    if (!id) throw new apiErrors.BadRequestError("User ID is required.");

    const existingCompany: any = await UserService.findCompanyNameOnUpdate(company_name, id);

    if (existingCompany) {
      const hasFiles = req.file || (req.files && Object.keys(req.files).length > 0);
      if (hasFiles) await deleteUploadedFilesFromReq(req);
      throw new apiErrors.BadRequestError("A company with this name already exists.");
    }

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

// ===== UPDATE CUSTOM DOMAIN =====
export const SaveDomain = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) throw new apiErrors.BadRequestError("User ID is required.");

    const domainDetail = await UserService.saveDomain(id, req);

    if (!domainDetail) {
      return res.status(400).json({ status: false, message: "Custom domain update failed!" });
    }

    return res.status(200).json({
      status: true,
      message: "Custom domain added successfully!",
      data: domainDetail,
    });
  } catch (error: any) {
    console.error("SaveDomain Error:", error?.message);
    return res.status(500).json({
      status: false,
      message: error?.message || "Internal Server Error",
    });
  }
};

// ===== REMOVE CUSTOM DOMAIN =====
export const RemoveDomain = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) throw new apiErrors.BadRequestError("User ID is required.");

    const result = await UserService.removeDomain(id);

    return res.status(200).json({
      status: true,
      message: "Custom domain deleted successfully.",
    });
  } catch (error: any) {
    console.error("RemoveDomain Error:", error?.message);
    return res.status(500).json({
      status: false,
      message: error?.message || "Internal Server Error",
    });
  }
};