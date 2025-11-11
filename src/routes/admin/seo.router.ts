import express, { Router } from 'express';
import * as SeoController from '../../controllers/admin/seo.controller';
import ErrorHandler from '../../middleware/error.middleware';
import * as schema from '../../validations/admin/seo.validation';
import validate from '../../utils/validator.util';
const router: Router = express.Router();

// Add new Seo
router.post('/add', validate(schema.SeoJoiSchema) as any, ErrorHandler(SeoController.CreateSeo as any));

// View Seo by id
router.get('/view/:id', ErrorHandler(SeoController.FindSeoById as any));

// View Seo by orgid and page
router.get('/view-seo', ErrorHandler(SeoController.FindSeoByPage as any));

// Get all Seo
router.get('/view-all', ErrorHandler(SeoController.FindAllSeo as any));

// Search Seo
router.get('/search', ErrorHandler(SeoController.SearchSeo as any));

// Update Seo
router.put('/update/:id', validate(schema.UpdateSeoJoiSchema) as any, ErrorHandler(SeoController.UpdateSeo as any));

// Delete Seo
router.delete('/delete/:id', ErrorHandler(SeoController.DeleteSeo as any));

// Delete Seo by orig_id
router.delete('/delete-multiple/:id', ErrorHandler(SeoController.DeleteSeoByOrgId as any));

// Update-Status Seo
router.patch('/status-update/:id', ErrorHandler(SeoController.UpdateStatusSeo as any));

router.all('*', (req, res) => { res.status(404).json({ status: false, message: 'Path not found..!' }); });

export default router;
