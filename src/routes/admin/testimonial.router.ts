import express, { Router } from 'express';
import * as TestimonialController from '../../controllers/admin/testimonial.controller';
import ErrorHandler from '../../middleware/error.middleware';
import * as schema from '../../validations/admin/testimonial.validation';
import validateWithCleanup from '../../utils/validatorWithCleanup.util';
import createUploader from '../../middleware/uploadMiddleware';
const router: Router = express.Router();

// Add Testimonial
router.post('/add', createUploader(['image', 'company_logo'], 'multi', 'image', 5),
  validateWithCleanup(schema.TestimonialJoiSchema) as any,
  ErrorHandler(TestimonialController.CreateTestimonials as any)
);

// View Testimonial By ID
router.get('/view/:id', ErrorHandler(TestimonialController.FindTestimonialsById as any));

// View All Testimonials
router.get('/view-all', ErrorHandler(TestimonialController.FindAllTestimonials as any));

// Update Testimonial
router.put('/update/:id', createUploader(['image', 'company_logo'], 'multi', 'image', 5),
  validateWithCleanup(schema.UpdateTestimonialJoiSchema) as any,
  ErrorHandler(TestimonialController.UpdateTestimonials as any)
);

// Delete Testimonial
router.delete('/delete/:id', ErrorHandler(TestimonialController.DeleteTestimonials as any));

// Change Testimonial Status
router.patch('/status-update/:id', ErrorHandler(TestimonialController.UpdateStatusTestimonials as any));

// Wrong path
router.all('*', (req, res) => { res.status(404).json({ status: false, message: 'Path not found..!' }); });

export default router;