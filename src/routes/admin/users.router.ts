import express, { Router } from "express";
import * as UserController from "../../controllers/admin/users.controller";
import * as ProfileController from '../../controllers/admin/profile.controller';
import ErrorHandler from "../../middleware/error.middleware";
import * as schema from '../../validations/admin/users.validation';
import validate from "../../utils/validatorWithCleanup.util";
import createUploaderOnlyUsers from "../../middleware/uploadMiddlewareForUsers";

const router: Router = express.Router();

// ===== CREATE USER =====
router.post("/add", createUploaderOnlyUsers('company_logo', 'single', 'image', 5),
  validate(schema.cmsUserSchema) as any, ErrorHandler(UserController.CreateUser as any));

// ===== GET USERS =====
router.get("/view-all", ErrorHandler(UserController.UsersFindAll as any));
router.get("/view-all-admin", ErrorHandler(UserController.FindAllAdmins as any));
router.get("/view/:id", ErrorHandler(UserController.FindUser as any));
// router.get("/view-company/:name", ErrorHandler(UserController.FindProject as any));

// ===== UPDATE USERS =====
router.put("/update/:id", createUploaderOnlyUsers('company_logo', 'single', 'image', 5),
  validate(schema.editCmsUserSchema) as any, ErrorHandler(UserController.UpdateUser as any));

// ===== UPDATE USERS =====
router.put("/self/:id", createUploaderOnlyUsers('company_logo', 'single', 'image', 5),
  validate(schema.editCmsUserSchema) as any, ErrorHandler(ProfileController.UpdateUser as any));

// ===== DELETE USER =====
router.delete("/delete/:id", ErrorHandler(UserController.DeleteUser as any));

// ===== UPDATE USER STATUS =====
router.patch("/status/:id", ErrorHandler(UserController.UpdateStatusUser as any));

// ===== DELETE USER =====
router.get('/search', ErrorHandler(UserController.SearchUser as any));

// ===== APPROVE USER FOR USE DB =====
router.patch("/approve/:id", ErrorHandler(UserController.ApproveUserForThereTenantShip as any));

// ===== CREATE CUSTOM DOMAIN =====
router.put("/save/custom-domain/:id", ErrorHandler(UserController.SaveDomain as any));

// ===== DELETE CUSTOM DOMAIN =====
router.put("/remove/custom-domain/:id", ErrorHandler(UserController.RemoveDomain as any));

// ===== 404 FALLBACK =====
router.all("*", (req, res) => { res.status(404).json({ status: false, message: "Path not found!" }); });

export default router;