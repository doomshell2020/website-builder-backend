import express, { Router } from "express";
import * as UserController from "../../controllers/admin/users.controller";
import * as ProfileController from '../../controllers/admin/profile.controller';
import ErrorHandler from "../../middleware/error.middleware";
import * as schema from '../../validatons/admin/users.validation';
import validate from "../../utils/validatorWithCleanup.util";
import createUploader from "../../middleware/uploadMiddleware";

const router: Router = express.Router();

// ===== CREATE USER =====
router.post("/add", createUploader(['image', 'company_logo'], 'multi', 'image', 5), validate(schema.cmsUserSchema) as any,
  ErrorHandler(UserController.CreateUser as any));

// ===== GET USERS =====
router.get("/view-all", ErrorHandler(UserController.UsersfindAll as any));
router.get("/view-all-admin", ErrorHandler(UserController.FindAllAdmins as any));
router.get("/view/:id", ErrorHandler(UserController.FindUser as any));
// router.get("/view-company/:name", ErrorHandler(UserController.FindProject as any));

// ===== UPDATE USERS =====
router.put("/update/:id", createUploader(['image', 'company_logo'], 'multi', 'image', 5), validate(schema.editCmsUserSchema) as any,
  ErrorHandler(UserController.UpdateUser as any));

// ===== UPDATE USERS =====
router.put("/self/:id", createUploader(['image', 'company_logo'], 'multi', 'image', 5), validate(schema.editCmsUserSchema) as any,
  ErrorHandler(ProfileController.UpdateUser as any));

// ===== DELETE USER =====
router.delete("/delete/:id", ErrorHandler(UserController.DeleteUser as any));

// ===== UPDATE USER STATUS =====
router.patch("/status/:id", ErrorHandler(UserController.UpdateStatusUser as any));

// ===== UPDATE USER STATUS =====
router.patch("/approve/:id", ErrorHandler(UserController.ApproveUserForThereTenantShip as any));

// ===== DELETE USER =====
router.get('/search', ErrorHandler(UserController.SearchUser as any));

// ===== 404 FALLBACK =====
router.all("*", (req, res) => { res.status(404).json({ status: false, message: "Path not found!" }); });

export default router;