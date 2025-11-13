import express, { Router } from 'express';
import * as AuthController from '../controllers/admin/admin.controller';
import ErrorHandler from '../middleware/error.middleware';
import schema from '../validations/admin/admin.validation';
import validate from '../utils/validator.util';
import { authMiddleware } from '../middleware/auth.middleware';
import { authorizeRole } from '../middleware/role.middleware';
import { setSchema } from '../middleware/setSchema.middleware';
import * as ProfileController from '../controllers/admin/profile.controller';
import recaptchaRoutes from './admin/reCAPTCHA.router';
import UsersRouter from './admin/users.router';
import SchemaRouter from './admin/schema.routes';
import ProjectRouter from './admin/project.router';
import StaticRouter from './admin/static.router';
import SliderRouter from './admin/slider.router';
import GalleryRouter from './admin/gallery.router';
import SeoRouter from './admin/seo.router';
import TestimonialRouter from './admin/testimonial.router';
import ClientLogoRouter from './admin/clientlogo.router';
import EnquiryRouter from './admin/enquiry.router';
import FaqRouter from './admin/faq.router';
import ThemeRouter from './admin/theme.router';
import PlanRouter from './admin/plan.router';

// Create a new Router instance
const router: Router = express.Router();
router.use('/reCAPTCHA', recaptchaRoutes);
router.use('/users', authMiddleware as any, authorizeRole(['1']) as any, UsersRouter as any);
router.use('/schema', authMiddleware as any, authorizeRole(['1']) as any, SchemaRouter as any);
router.use('/themes', authMiddleware as any, authorizeRole(['1']) as any, ThemeRouter as any);
router.use('/plans', authMiddleware as any, authorizeRole(['1']) as any, PlanRouter as any);

router.use('/static', setSchema as any, StaticRouter as any);
router.use('/slider', setSchema as any, SliderRouter as any);
router.use('/gallery', setSchema as any, GalleryRouter as any);
router.use('/enquiries', setSchema as any, EnquiryRouter as any);
router.use('/testimonials', setSchema as any, TestimonialRouter as any);
router.use('/client-logos', setSchema as any, ClientLogoRouter as any);

router.use('/seo', setSchema as any, authMiddleware as any, SeoRouter as any);
router.use('/faq', setSchema as any, authMiddleware as any, FaqRouter as any);

// Admin login route with validation and error handling
router.post('/auth/login', validate(schema.login) as any, ErrorHandler(AuthController.login));

// router.post('/register', ErrorHandler(AuthController.register as any));
router.get('/profile', authMiddleware as any, ErrorHandler(ProfileController.FindUser));
router.use('/update-profile', authMiddleware as any, UsersRouter as any);
router.use('/company', ProjectRouter);

// Catch-all route for undefined paths (404 handler)
router.all('*', (req, res) => { res.status(404).json({ status: false, message: 'Path not found..!' }); });

// Export the configured router
export default router;
