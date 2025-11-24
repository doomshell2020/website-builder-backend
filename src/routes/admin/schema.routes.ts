import express from 'express';
import * as SchemaController from '../../controllers/admin/schema.controller';
import { downloadSchemaZip } from "../../controllers/admin/export.controller";
import ErrorHandler from '../../middleware/error.middleware';
const router = express.Router();

router.post('/create-schema', ErrorHandler(SchemaController.createSchema));
router.post('/clone', ErrorHandler(SchemaController.cloneSchema));
router.get('/view-all', ErrorHandler(SchemaController.getAllSchemas));
router.delete('/delete-schema', ErrorHandler(SchemaController.DeleteSchema));
router.post("/add-table", ErrorHandler(SchemaController.AddTableToAllSchema));
router.delete("/delete-table", ErrorHandler(SchemaController.DeleteTableToAllSchema));
router.post("/add-column", ErrorHandler(SchemaController.AddColumnToAllSchemas));
router.delete("/delete-column", ErrorHandler(SchemaController.DeleteColumnToAllSchemas));
router.get("/backup/:name/zip", downloadSchemaZip);
// router.get("/download-schema/:schema", ErrorHandler(SchemaController.ExportSchemaSQL));
// ===== 404 FALLBACK =====
router.all("*", (req, res) => { res.status(404).json({ status: false, message: "Path not found!" }); });
export default router;