import express, { Router } from 'express';
import * as GalleryController from '../../controllers/admin/gallery.controller';
import ErrorHandler from '../../middleware/error.middleware';
import * as schema from '../../validatons/admin/gallery.validation';
import validateWithCleanup from '../../utils/validatorWithCleanup.util';
import validate from "../../utils/validator.util";
import createUploader from '../../middleware/uploadMiddleware';
const router: Router = express.Router();

// Add new Gallery
router.post('/add', createUploader(['images'], 'multi', 'image', 5),
    (req, res, next) => { if (!req.files) { console.log('⚠️ Multer did not receive any file!'); } next(); },
    validateWithCleanup(schema.GallerySchema) as any,
    ErrorHandler(GalleryController.CreateGallery as any)
);

// Find Gallery Gallery
router.get('/view/:id', ErrorHandler(GalleryController.findGalleryById as any));

// Get Gallery By title
router.get('/view-by/:slug', ErrorHandler(GalleryController.findGalleryBySlug as any));

// Get all Galleries
router.get('/view-all', ErrorHandler(GalleryController.findAllGalleries as any));

// Update Gallery
router.put('/update/:id', createUploader(['images'], 'multi', 'image', 5),
    // validateWithCleanup(schema.GalleryUpdateJoiSchema) as any,
    ErrorHandler(GalleryController.UpdateGallery as any)
);

// Delete Gallery
router.delete('/delete/:id', ErrorHandler(GalleryController.DeleteGallery as any));

// Delete Gallery
router.delete('/delete-image', ErrorHandler(GalleryController.DeleteGalleryImage as any));

// Update-Status Gallery
router.patch('/status-update/:id', ErrorHandler(GalleryController.UpdateGalleryStatus as any));

router.all('*', (req, res) => { res.status(404).json({ status: false, message: 'Path not found..!' }); });

export default router;