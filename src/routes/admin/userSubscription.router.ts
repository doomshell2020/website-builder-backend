import express, { Router } from "express";
import * as UserSubscriptionController from "../../controllers/admin/userSubscription.controller";
import ErrorHandler from "../../middleware/error.middleware";

const router: Router = express.Router();

router.get('/plan/:id', ErrorHandler(UserSubscriptionController.FindSubscriptionById as any));
router.get('/plan/user-wise/:id', ErrorHandler(UserSubscriptionController.FindAllSubscriptionsByUser as any));

router.all('*', (req, res) => { res.status(404).json({ status: false, message: 'Path not found..!' }); });

export default router;