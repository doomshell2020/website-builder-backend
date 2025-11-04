import { Request, Response } from 'express';
import * as UserService from '../../services/admin/profile.service';
import { successResponse } from '../../utils/responseUtils';
import { apiErrors } from '../../utils/api-errors';
import * as UserUpdateService from "../../services/admin/users.service";
import { deleteUploadedFilesFromReq } from "../../utils/delete-multi";

export const FindUser = async (req: Request, res: Response) => {
  try {
    const id = (req as any)?.user?.id;

    if (!id) {
      throw new apiErrors.NotFoundError('User ID is required.');
    }
    const result = await UserService.findUserById(Number(id));
    if (!result) {
      throw new apiErrors.BadRequestError('User not found.');
    }
    const response = successResponse('User found successfully.', result);
    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    //  console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

export const UpdateUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any)?.user?.id;
    const id = Number(req.params.id);
    if (!id) throw new apiErrors.BadRequestError("User ID is required.");
    if (id !== userId) {
      return res.status(403).json({ message: "You can update only your own profile" });
    }
    const updatedUser = await UserUpdateService.updateUser(id, req);
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
