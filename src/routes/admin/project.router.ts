
import express, { Router } from "express";
import * as ProjectController from "../../controllers/admin/project.controller";
import ErrorHandler from "../../middleware/error.middleware";

const router: Router = express.Router();

// ✅ Sub-domian-based project lookup
router.get('/view-company/:name', ErrorHandler(ProjectController.FindProject as any));

// ✅ Domain-based project lookup
router.get("/company/view-company-by-domain/:domain", ErrorHandler(ProjectController.FindProjectByDomain as any));

// ===== 404 FALLBACK =====
router.all("*", (req, res) => { res.status(404).json({ status: false, message: "Path not found!" }); });

export default router;