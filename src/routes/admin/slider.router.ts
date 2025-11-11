import express, { Router } from 'express';
import * as SliderController from '../../controllers/admin/slider.controller';
import ErrorHandler from '../../middleware/error.middleware';
import * as schema from '../../validations/admin/slider.validation';
import validateWithCleanup from '../../utils/validatorWithCleanup.util';
import createUploader from '../../middleware/uploadMiddleware';
const router: Router = express.Router();

// Add new Slider
router.post('/add', createUploader('images', 'single', 'image', 2),
  (req, res, next) => {
    if (!req.file) {
      console.log('⚠️ Multer did not receive any file!');
    } next();
  },
  validateWithCleanup(schema.SliderJoiSchema) as any,
  ErrorHandler(SliderController.CreateSlider as any)
);

// Find Slider Slider
router.get('/view/:id', ErrorHandler(SliderController.findSliderById as any));

// Get Slider By title
router.get('/view-by/:title', ErrorHandler(SliderController.findSliderByTitle as any));

// Get all Sliders
router.get('/view-all', ErrorHandler(SliderController.findAllSliders as any));

// Update Slider
router.put(
  '/update/:id',
  createUploader('images', 'single', 'image', 2),
  // validateWithCleanup(schema.SliderUpdateJoiSchema) as any,
  ErrorHandler(SliderController.UpdateSlider as any)
);

// Delete Slider
router.delete('/delete/:id', ErrorHandler(SliderController.DeleteSlider as any));

// Update-Status Slider
router.patch('/status-update/:id', ErrorHandler(SliderController.UpdateStatusSlider as any));

router.all('*', (req, res) => { res.status(404).json({ status: false, message: 'Path not found..!' }); });

export default router;