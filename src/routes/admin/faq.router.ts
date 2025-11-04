import express, { Router } from "express";
import * as FAQController from "../../controllers/admin/faq.controller";
import ErrorHandler from "../../middleware/error.middleware";
import validate from "../../utils/validator.util";
import * as schema from "../../validatons/admin/faqs.validation";

const router: Router = express.Router();

/** ================= FAQ CATEGORY ================= */
router.post("/category/add", validate(schema.createFAQCategorySchema) as any, ErrorHandler(FAQController.CreateFAQCategory as any));
router.get("/category/view/:id", ErrorHandler(FAQController.ViewFAQCategory as any));
router.get("/category/view-all", ErrorHandler(FAQController.FindFAQCategory as any));
router.get("/category/view-faq", ErrorHandler(FAQController.FindFAQCategory as any));
router.put("/category/update/:id", validate(schema.updateFAQCategorySchema) as any, ErrorHandler(FAQController.UpdateFAQCategory as any));
router.delete("/category/delete/:id", ErrorHandler(FAQController.DeleteFAQCategory as any));
router.delete("/category/delete-multiple", ErrorHandler(FAQController.DeleteMultipleFAQCategory as any));
router.patch("/category/update-status/:id", ErrorHandler(FAQController.UpdateFAQCategoryStatus as any));

/** ================= FAQ ================= */
router.post("/add", validate(schema.createFAQSchema) as any, ErrorHandler(FAQController.CreateFAQ as any));
router.get("/view/:id", ErrorHandler(FAQController.ViewFAQ as any));
router.get("/view-all", ErrorHandler(FAQController.FindFAQ as any));
router.put("/update/:id", validate(schema.updateFAQSchema) as any, ErrorHandler(FAQController.UpdateFAQ as any));
router.delete("/delete/:id", ErrorHandler(FAQController.DeleteFAQ as any));
router.delete("/delete-multiple", ErrorHandler(FAQController.DeleteMultipleFAQ as any));
router.patch("/update-status/:id", ErrorHandler(FAQController.UpdateFAQStatus as any));
router.patch("/update-bulk-status", ErrorHandler(FAQController.UpdateBulkFAQStatus as any));

// Wrong path
router.all('*', (req, res) => { res.status(404).json({ status: false, message: 'Path not found..!' }); });

export default router;