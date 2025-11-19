import express, { Router } from "express";
import * as SubscriptionController from "../../controllers/admin/subscription.controller";
import ErrorHandler from "../../middleware/error.middleware";
import validate from '../../utils/validator.util';
import * as schema from '../../validations/admin/subscriptions.validation';

const router: Router = express.Router();

router.get("/read-all", ErrorHandler(SubscriptionController.FindSubscription as any));
router.get('/view/:id', ErrorHandler(SubscriptionController.FindSubscriptionById as any));
router.get('/view-all', ErrorHandler(SubscriptionController.FindAllSubscriptions as any));
router.post('/create', validate(schema.subscriptionJoiSchema) as any, ErrorHandler(SubscriptionController.CreateSubscription as any));
router.patch('/status/:id', ErrorHandler(SubscriptionController.UpdateStatusSubscription as any));
router.patch('/payment/:id', ErrorHandler(SubscriptionController.UpdatePaymentStatus as any));
// router.put('/update/:id', validate(schema.updateSubscriptionJoi) as any, ErrorHandler(SubscriptionController.UpdateSubscription as any));
router.delete('/delete/:id', ErrorHandler(SubscriptionController.DeleteSubscription as any));
router.get('/search', ErrorHandler(SubscriptionController.SearchSubscription as any));
router.get('/send/email/:id', ErrorHandler(SubscriptionController.SendEmail as any));
router.get('/check-expired-subs', ErrorHandler(SubscriptionController.InactivateExpiredSubs as any));

router.all('*', (req, res) => { res.status(404).json({ status: false, message: 'Path not found..!' }); });

export default router;
