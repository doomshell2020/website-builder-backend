import { Request, Response } from "express";
import * as PlanService from "../../services/admin/plan.service";
import { successResponse } from "../../utils/responseUtils";
import { apiErrors } from '../../utils/api-errors';

// Get by Id
export const FindPlanById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) {
            throw new apiErrors.NotFoundError('Plan ID is required.');
        }
        const Plan = await PlanService.findPlanById(id);
        const response = successResponse('Plan found successfully', Plan);
        return res.status(response.statusCode).json(response.body);
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ status: false, message: error?.message ?? 'Internal Server Error' });
    }
};

// Find all plans for dropdown
export const FindPlan = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const planData = await PlanService.findPlan(page, limit);
        const response = successResponse("Plan fetched successfully", planData);
        return res.status(response.statusCode).json(response.body);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

// Get all Plan
export const FindAllPlans = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        // ✅ Pass schema to service
        const Plan = await PlanService.findAllPlan(page, limit);

        const response = successResponse('Plans found successfully', Plan);
        return res.status(response.statusCode).json(response.body);
    } catch (error) {
        console.error('Error fetching Plan:', error);
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};

// Create a new Plan
export const CreatePlan = async (req: Request, res: Response) => {
    try {
        const PlanDetail = await PlanService.createPlan(req);
        const response = successResponse('Plan have been created successfully', PlanDetail);
        return res.status(response.statusCode).json(response.body);
    } catch (error: any) {
        console.error(error);
        if (error instanceof apiErrors.BadRequestError) {
            return res.status(400).json({ status: false, message: error.message });
        }
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};

// Find Plan Status
export const UpdateStatusPlan = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) {
            throw new apiErrors.BadRequestError('Plan ID is required.');
        }

        const Plan = await PlanService.findPlanById(id);
        if (!Plan) {
            return res.status(400).json({ status: false, message: 'Plan not found.' });
        }
        const result = await PlanService.updatePlanStatus(id, req);

        return res.json({
            status: true,
            message: 'Plan Status updated successfully!',
            data: result,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};

// Update Plan 
export const UpdatePlan = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({ status: false, message: 'Plan ID is required.' });
        }

        const Plan = await PlanService.findPlanById(id);
        if (!Plan) {
            return res.status(400).json({ status: false, message: 'Plan not found.' });
        }
        const result = await PlanService.updatePlan(Number(id), req);
        return res.json({
            status: true,
            message: 'Plan has been updated successfully!',
            data: result,
        });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ status: false, message: error?.message ?? 'Internal Server Error' });
    }
};

// Delete Plan
export const DeletePlan = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        if (!id) {
            throw new apiErrors.NotFoundError('Plan ID is required.');
        }

        const Plan = await PlanService.findPlanById(id);
        if (!Plan) {
            return res.status(400).json({ status: false, message: 'Plan not found.' });
        }

        const result = await PlanService.deletePlan(Number(id));

        if (!result) {
            throw new apiErrors.BadRequestError('Plan not found.');
        }

        const response = successResponse('Plan has been deleted successfully..', result);
        return res.status(response.statusCode).json(response.body);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};