import { Request, Response } from "express";
import * as ThemeService from "../../services/admin/theme.service";
import { successResponse } from "../../utils/responseUtils";
import { apiErrors } from '../../utils/api-errors';

// Create a new Theme
export const CreateTheme = async (req: Request, res: Response) => {
    try {
        const ThemeDetail = await ThemeService.createTheme(req);
        const response = successResponse('Theme have been created successfully', ThemeDetail);
        return res.status(response.statusCode).json(response.body);
    } catch (error: any) {
        console.error(error);
        if (error instanceof apiErrors.BadRequestError) {
            return res.status(400).json({ status: false, message: error.message });
        }
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};

// Get all Theme
export const FindAllThemes = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        // ✅ Pass schema to service
        const Theme = await ThemeService.findAllTheme(page, limit);

        const response = successResponse('Theme found successfully', Theme);
        return res.status(response.statusCode).json(response.body);
    } catch (error) {
        console.error('Error fetching Theme:', error);
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};

// find all theme for dropdown
export const FindTheme = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const webType = await ThemeService.findTheme(page, limit);
        const response = successResponse("Theme fetched successfully", webType);
        return res.status(response.statusCode).json(response.body);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

// Get by Id
export const FindThemeById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) {
            throw new apiErrors.NotFoundError('Theme ID is required.');
        }
        const Theme = await ThemeService.findThemeById(id);
        const response = successResponse('Theme found successfully', Theme);
        return res.status(response.statusCode).json(response.body);
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ status: false, message: error?.message ?? 'Internal Server Error' });
    }
};

// Update Theme
export const UpdateTheme = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({ status: false, message: 'Theme ID is required.' });
        }

        const Theme = await ThemeService.findThemeById(id);
        if (!Theme) {
            return res.status(400).json({ status: false, message: 'Theme not found.' });
        }
        const result = await ThemeService.updateTheme(Number(id), req);
        return res.json({
            status: true,
            message: 'Theme updated successfully!',
            data: result,
        });
    } catch (error: any) {
        if (error.message?.includes('name')) {
            return res.status(400).json({ status: false, message: error.message });
        }
        console.error(error);
        return res.status(500).json({ status: false, message: error?.message ?? 'Internal Server Error' });
    }
};

// Delete Theme by ID
export const DeleteTheme = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        if (!id) {
            throw new apiErrors.NotFoundError('Theme ID is required.');
        }

        const Theme = await ThemeService.findThemeById(id);
        if (!Theme) {
            return res.status(400).json({ status: false, message: 'Theme not found.' });
        }

        const result = await ThemeService.deleteTheme(Number(id));

        if (!result) {
            throw new apiErrors.BadRequestError('Theme not found.');
        }

        const response = successResponse('Theme deleted successfully.', result);
        return res.status(response.statusCode).json(response.body);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};

// Find Theme Status by ID
export const UpdateStatusTheme = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) {
            throw new apiErrors.BadRequestError('Theme ID is required.');
        }

        const Theme = await ThemeService.findThemeById(id);
        if (!Theme) {
            return res.status(400).json({ status: false, message: 'Theme not found.' });
        }
        const result = await ThemeService.updateThemeStatus(id, req);

        return res.json({
            status: true,
            message: 'Theme Status updated successfully!',
            data: result,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};
