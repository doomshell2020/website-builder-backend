import express, { Router } from 'express';
import * as ClientLogoController from '../../controllers/admin/clientlogo.controller';
import ErrorHandler from '../../middleware/error.middleware';
import * as schema from '../../validatons/admin/clientlogo.validation';
import validateWithCleanup from '../../utils/validatorWithCleanup.util';
import createUploader from '../../middleware/uploadMiddleware';
const router: Router = express.Router();

// Add new client-logo
router.post('/add', createUploader('image', 'single', 'image', 2),
  (req, res, next) => {
    if (!req.file) {
      console.log('⚠️ Multer did not receive any file!');
    }
    next();
  },
  validateWithCleanup(schema.ClientlogoJoiSchema) as any,
  ErrorHandler(ClientLogoController.CreateClientLogo as any)
);

// Get single client-logo
router.get('/view/:id', ErrorHandler(ClientLogoController.FindClientLogoById as any));

// Get all client-logo
router.get('/view-all', ErrorHandler(ClientLogoController.FindAllClientLogos as any));

// Update client-logo
router.put('/update/:id',
  createUploader('image', 'single', 'image', 2),
  validateWithCleanup(schema.UpdateClientlogoJoiSchema) as any,
  ErrorHandler(ClientLogoController.UpdateClientLogo as any)
);

// Delete client-logo
router.delete('/delete/:id', ErrorHandler(ClientLogoController.DeleteClientLogo as any));

// Update-Status client-logo
router.patch('/status-update/:id', ErrorHandler(ClientLogoController.UpdateStatusClientLogo as any));

// For Invalid route
router.all('*', (req, res) => { res.status(404).json({ status: false, message: 'Path not found..!' }) });

export default router;