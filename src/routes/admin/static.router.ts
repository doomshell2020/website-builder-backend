import express, { Router } from 'express';
import * as StaticController from '../../controllers/admin/static.controller';
import ErrorHandler from '../../middleware/error.middleware';
import * as schema from '../../validatons/admin/static.validation';
import validate from '../../utils/validator.util';
const router: Router = express.Router();

// Add new Static
router.post('/add', validate(schema.StaticJoiSchema) as any, ErrorHandler(StaticController.CreateStatic as any));

// Get Statics By id
router.get('/view/:id', ErrorHandler(StaticController.findStaticById as any));

// Get Statics By title
router.get('/view-by/:title', ErrorHandler(StaticController.findStaticByTitle as any));

// Get all Statics
router.get('/view-all', ErrorHandler(StaticController.findAllStatics as any));

// Update Static
router.put('/update/:id', validate(schema.StaticUpdateJoiSchema) as any, ErrorHandler(StaticController.UpdateStatic as any));

// Delete Static
router.delete('/delete/:id', ErrorHandler(StaticController.DeleteStatic as any));

// Update-Status Static
router.patch('/status-update/:id', ErrorHandler(StaticController.UpdateStatusStatic as any));

// Wrong path
router.all('*', (req, res) => { res.status(404).json({ status: false, message: 'Path not found..!' }); });

export default router;