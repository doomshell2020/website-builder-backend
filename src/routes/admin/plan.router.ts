import express, { Router } from "express";
import * as PlanController from "../../controllers/admin/plan.controller";
import ErrorHandler from "../../middleware/error.middleware";
import validate from '../../utils/validator.util';
import * as schema from '../../validations/admin/plan.validation';

const router: Router = express.Router();

router.get("/read-all", ErrorHandler(PlanController.FindPlan as any));
router.get('/view/:id', ErrorHandler(PlanController.FindPlanById as any));
router.get('/view-all', ErrorHandler(PlanController.FindAllPlans as any));
router.post('/add', validate(schema.createPlanJoi) as any, ErrorHandler(PlanController.CreatePlan as any));
router.patch('/status/:id', ErrorHandler(PlanController.UpdateStatusPlan as any));
router.put('/update/:id', validate(schema.updatePlanJoi) as any, ErrorHandler(PlanController.UpdatePlan as any));
router.delete('/delete/:id', ErrorHandler(PlanController.DeletePlan as any));

router.all('*', (req, res) => { res.status(404).json({ status: false, message: 'Path not found..!' }); });

export default router;
