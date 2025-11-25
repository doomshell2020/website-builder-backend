import { Request, Response } from "express";
import * as SubscriptionService from "../../services/admin/userSubscription.service";
import { successResponse } from "../../utils/responseUtils";
import { apiErrors } from '../../utils/api-errors';

// Get by Id
export const FindSubscriptionById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) {
            throw new apiErrors.NotFoundError('Subscription ID is required.');
        }
        const Subscription = await SubscriptionService.findSubscriptionByInvoiceId(id);
        const response = successResponse('Subscription found successfully', Subscription);
        return res.status(response.statusCode).json(response.body);
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ status: false, message: error?.message ?? 'Internal Server Error' });
    }
};


// Find all Subscriptions By Users
export const FindAllSubscriptionsByUser = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const id = req.params.id;
        if (!id) { throw new apiErrors.BadRequestError('Subscription ID is required.'); }
        const Subscription = await SubscriptionService.findAllSubscriptionByUsers(id, page, limit);
        const response = successResponse('Subscriptions found successfully', Subscription);
        return res.status(response.statusCode).json(response.body);
    } catch (error: any) {
        console.error('Error fetching Subscription:', error);
        return res.status(500).json({ status: false, message: error?.message ?? 'Internal Server Error' });
    }
};