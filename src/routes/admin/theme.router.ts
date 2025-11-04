import express, { Router } from "express";
import * as ThemeController from "../../controllers/admin/theme.controller";
import ErrorHandler from "../../middleware/error.middleware";
import * as schema from '../../validatons/admin/theme.validation';
import validate from '../../utils/validator.util';

const router: Router = express.Router();

router.get("/read-all", ErrorHandler(ThemeController.FindTheme as any));
router.post('/add', validate(schema.ThemeSchema) as any, ErrorHandler(ThemeController.CreateTheme as any));
router.get('/view/:id', ErrorHandler(ThemeController.FindThemeById as any));
router.get('/view-all', ErrorHandler(ThemeController.FindAllThemes as any));
router.put('/update/:id', validate(schema.editThemeSchema) as any, ErrorHandler(ThemeController.UpdateTheme as any));
router.delete('/delete/:id', ErrorHandler(ThemeController.DeleteTheme as any));
router.patch('/status/:id', ErrorHandler(ThemeController.UpdateStatusTheme as any));

router.all('*', (req, res) => { res.status(404).json({ status: false, message: 'Path not found..!' }); });

export default router;
