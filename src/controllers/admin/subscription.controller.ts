import { Request, Response } from "express";
import * as SubscriptionService from "../../services/admin/subscription.service";
import { successResponse } from "../../utils/responseUtils";
import { apiErrors } from '../../utils/api-errors';

// Get by Id
export const FindSubscriptionById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) {
            throw new apiErrors.NotFoundError('Subscription ID is required.');
        }
        const Subscription = await SubscriptionService.findSubscriptionById(id);
        const response = successResponse('Subscription found successfully', Subscription);
        return res.status(response.statusCode).json(response.body);
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ status: false, message: error?.message ?? 'Internal Server Error' });
    }
};

// Find all Subscriptions for dropdown
export const FindSubscription = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const SubscriptionData = await SubscriptionService.findSubscription(page, limit);
        const response = successResponse("Subscription fetched successfully", SubscriptionData);
        return res.status(response.statusCode).json(response.body);
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

// Get all Subscriptions
export const FindAllSubscriptions = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        // ✅ Pass schema to service
        const Subscription = await SubscriptionService.findAllSubscription(page, limit);

        const response = successResponse('Subscriptions found successfully', Subscription);
        return res.status(response.statusCode).json(response.body);
    } catch (error: any) {
        console.error('Error fetching Subscription:', error);
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

// Create a new Subscription
export const CreateSubscription = async (req: Request, res: Response) => {
    try {
        const SubscriptionDetail = await SubscriptionService.createSubscription(req);
        const response = successResponse('Subscription have been created successfully', SubscriptionDetail);
        return res.status(response.statusCode).json(response.body);
    } catch (error: any) {
        console.error(error);
        if (error instanceof apiErrors.BadRequestError) {
            return res.status(400).json({ status: false, message: error.message });
        }
        return res.status(500).json({ status: false, message: error?.message ?? 'Internal Server Error' });
    }
};

// Update Subscription Status
export const UpdateStatusSubscription = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) { throw new apiErrors.BadRequestError('Subscription ID is required.'); }

        const Subscription = await SubscriptionService.findSubscriptionById(id);
        if (!Subscription) {
            return res.status(400).json({ status: false, message: 'Subscription not found.' });
        }
        const result = await SubscriptionService.updateSubscriptionStatus(id, req);
        return res.json({ status: true, message: 'Subscription Status updated successfully!', data: result, });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ status: false, message: error?.message ?? 'Internal Server Error' });
    }
};

// Update Payment Status
export const UpdatePaymentStatus = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) { throw new apiErrors.BadRequestError('Subscription ID is required.'); }
        const Subscription = await SubscriptionService.findSubscriptionById(id);
        if (!Subscription) {
            return res.status(400).json({ status: false, message: 'Subscription not found.' });
        }
        const result = await SubscriptionService.updatePaymentStatus(id, req);
        return res.json({ status: true, message: 'Payment status updated successfully!', data: result, });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ status: false, message: error?.message ?? 'Internal Server Error' });
    }
};

// Update Subscription 
export const UpdateSubscription = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({ status: false, message: 'Subscription ID is required.' });
        }

        const Subscription = await SubscriptionService.findSubscriptionById(id);
        if (!Subscription) {
            return res.status(400).json({ status: false, message: 'Subscription not found.' });
        }
        const result = await SubscriptionService.updateSubscription(Number(id), req);
        return res.json({
            status: true,
            message: 'Subscription has been updated successfully!',
            data: result,
        });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ status: false, message: error?.message ?? 'Internal Server Error' });
    }
};

// Delete Subscription
export const DeleteSubscription = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        if (!id) {
            throw new apiErrors.NotFoundError('Subscription ID is required.');
        }

        const Subscription = await SubscriptionService.findSubscriptionById(id);
        if (!Subscription) {
            return res.status(400).json({ status: false, message: 'Subscription not found.' });
        }

        const result = await SubscriptionService.deleteSubscription(Number(id));

        if (!result) {
            throw new apiErrors.BadRequestError('Subscription not found.');
        }

        const response = successResponse('Subscription has been deleted successfully..', result);
        return res.status(response.statusCode).json(response.body);
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ status: false, message: error?.message ?? 'Internal Server Error' });
    }
};

// Search Subscription
export const SearchSubscription = async (req: Request, res: Response): Promise<any> => {
    try {
        const { page, limit, searchTerm, fromDate, toDate } = req.query;

        const user = await SubscriptionService.searchSubscriptionBilling(
            Number(page),
            Number(limit),
            searchTerm as string,
            fromDate as string,
            toDate as string
        );

        const response = successResponse('Subscription fetched successfully', user);
        return res.status(response.statusCode).json(response.body);
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ status: false, message: error?.message ?? 'Internal Server Error' });
    }
};

// Send Email
export const SendEmail = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        if (!id) { throw new apiErrors.BadRequestError('ID is required.'); }
        const user = await SubscriptionService.sendMail(id);
        const response = successResponse('Email generated successfully', user);
        return res.status(response.statusCode).json(response.body);
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ status: false, message: error?.message ?? 'Internal Server Error' });
    }
};

// Inactivate Expired Subscription
export const InactivateExpiredSubs = async (req: Request, res: Response): Promise<any> => {
    try {
        const result = await SubscriptionService.bulkInactiveExpiredSubscriptions();
        return res.status(200).json(result);
    } catch (err: any) {
        return res.status(500).json({
            status: false, message: err.message || "Internal server error",
        });
    }
};