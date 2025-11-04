import { Request, Response } from 'express';
import * as SeoServices from '../../services/admin/seos.service';
import { successResponse } from '../../utils/responseUtils';
import { apiErrors } from '../../utils/api-errors';

// get by Id
export const FindSeoById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      throw new apiErrors.NotFoundError('Seo ID is required.');
    }
    const seo = await SeoServices.findSeoByIds(id);
    if (!seo) {
      return res.status(400).json({ status: false, message: 'Seo not found.' });
    }
    const response = successResponse('Seo found successfully', seo);
    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// get by Page
export const FindSeoByPage = async (req: Request, res: Response) => {
  try {
    // ✅ Coerce query params to string
    const orgid = String(req.query.orgid || '');
    const type = String(req.query.type || '');

    // Optional: validate that they are not empty
    if (!orgid || !type) {
      return res.status(400).json({ status: false, message: 'orgid and type are required' });
    }

    const seo = await SeoServices.findSeoByPage(orgid, type);

    if (!seo) {
      return res.status(400).json({ status: false, message: 'Seo not found.' });
    }

    const response = successResponse('Seo found successfully', seo);
    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Create a new Seo (Seo)
export const CreateSeo = async (req: Request, res: Response) => {
  try {
    const seo = await SeoServices.createSeo(req);
    const response = successResponse('Seo have been created successfully', seo);
    return res.status(response.statusCode).json(response.body);
  } catch (error: any) {
    console.error(error);
    if (error instanceof apiErrors.BadRequestError) {
      return res.status(400).json({ status: false, message: error.message });
    }
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Get all Seo
export const FindAllSeo = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await SeoServices.findAllSeo(page, limit);

    const response = successResponse('Seo found successfully', result);
    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    console.error('Error fetching seo:', error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

/// Search all Seo
export const SearchSeo = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { searchType, searchQuery } = req.query;

    const result = await SeoServices.searchSeosByType(searchType, searchQuery, page, limit);

    const response = successResponse('Seo founded successfully', result);
    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    console.error('Error fetching seo:', error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Update Seo
export const UpdateSeo = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ status: false, message: 'Seo ID is required.' });
    }
    const Seo = await SeoServices.findSeoByIds(id);
    if (!Seo) {
      return res.status(400).json({ status: false, message: 'Seo not found.' });
    }
    const result = await SeoServices.updateSeo(Number(id), req);
    return res.json({
      status: true,
      message: 'Seo updated successfully!',
      data: result,
    });
  } catch (error: any) {
    if (error.message?.includes('name')) {
      return res.status(400).json({ status: false, message: error.message });
    }
    console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Delete Seo by ID
export const DeleteSeo = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (!id) {
      throw new apiErrors.NotFoundError('Seo ID is required OR Seo Not Found.');
    }

    const Seo = await SeoServices.findSeoByIds(id);
    if (!Seo) {
      return res.status(400).json({ status: false, message: 'Seo not found.' });
    }

    const result = await SeoServices.deleteSeo(Number(id));

    if (!result) {
      throw new apiErrors.BadRequestError('Seo not found.');
    }

    const response = successResponse('Seo deleted successfully.', result);
    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    // console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Delete Seo by ID
export const DeleteSeoByOrgId = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      throw new apiErrors.NotFoundError('Seo ID is required OR Seo Not Found.');
    }
    const result = await SeoServices.deleteSeoByOrgId(Number(id));
    if (!result) {
      return res.status(400).json({ status: false, message: 'Seo not found.' });
    }
    const response = successResponse('Seo deleted successfully.', result);
    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    // console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Find Seo Status by ID
export const UpdateStatusSeo = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      throw new apiErrors.BadRequestError('Seo ID is required.');
    }
    const Seo = await SeoServices.findSeoByIds(id);
    if (!Seo) {
      return res.status(400).json({ status: false, message: 'Seo not found.' });
    }

    const result = await SeoServices.updateSeoStatus(id, req);
    const response = successResponse('Seo Status updated successfully!', result);
    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    // console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};
