import express, { Router } from 'express';
import * as EnquiryController from '../../controllers/admin/enquiry.controller';
import ErrorHandler from '../../middleware/error.middleware';
import * as schema from '../../validatons/admin/enquiry.validation';
import validate from '../../utils/validator.util';
const router: Router = express.Router();

// Add new Enquiry
router.post('/add',
  validate(schema.createEnquirySchema) as any,
  ErrorHandler(EnquiryController.CreateEnquiry as any)
);

// Get Enquiry By id
router.get('/view/:id', ErrorHandler(EnquiryController.ViewEnquiry as any));

// Get all Enquiries
router.get('/view-all', ErrorHandler(EnquiryController.FindEnquiry as any));

// Update Enquiry
router.put(
  '/update/:id',
  validate(schema.updateEnquirySchema) as any,
  ErrorHandler(EnquiryController.UpdateEnquiry as any)
);

// Delete Enquiry
router.delete('/delete/:id', ErrorHandler(EnquiryController.DeleteEnquiry as any));

// Delete Multiple Enquiry
router.delete('/delete-multiple', ErrorHandler(EnquiryController.DeleteMultipleEnquiry as any));

// Update-Status Enquiry
router.patch('/update-status/:id', ErrorHandler(EnquiryController.UpdateEnquiryStatus as any));

// Wrong path
router.all('*', (req, res) => { res.status(404).json({ status: false, message: 'Path not found..!' }); });

export default router;
