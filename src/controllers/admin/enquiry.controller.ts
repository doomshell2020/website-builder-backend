import { Request, Response } from 'express';
import * as EnService from '../../services/admin/enquiry.service';
import { successResponse } from '../../utils/responseUtils';
import { apiErrors } from '../../utils/api-errors';

// Get by id
export const ViewEnquiry = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      throw new apiErrors.NotFoundError('Enquiry ID is required.');
    }
    const Enquiry = await EnService.viewEn(id);
    if (!Enquiry) {
      throw new apiErrors.BadRequestError('Enquiry not found.');
    }
    const response = successResponse('Enquiries found successfully', Enquiry);
    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Create a new Enquiry
export const CreateEnquiry = async (req: Request, res: Response) => {
  try {
    const EnquiryDetails = await EnService.createEn(req);
    const response = successResponse('Enquiry have been created successfully', EnquiryDetails);
    return res.status(response.statusCode).json(response.body);
  } catch (error: any) {
    console.error(error);
    if (error instanceof apiErrors.BadRequestError) {
      return res.status(400).json({ status: false, message: error.message });
    }
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Get all Enquiry
export const FindEnquiry = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const Enquiry = await EnService.findEn(page, limit);
    const response = successResponse('Enquiries found successfully', Enquiry);
    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Update Enquiry
export const UpdateEnquiry = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ status: false, message: 'Enquiry ID is required.' });
    }
    const Enquiry = await EnService.viewEn(id);
    if (!Enquiry) {
      return res.status(400).json({ status: false, message: 'Enquiry not found.' });
    }
    const result = await EnService.updateEn(id, req);
    return res.json({
      status: true,
      message: 'Enquiry updated successfully!',
      data: result,
    });
  } catch (error: any) {
    if (error.message?.includes('title')) {
      return res.status(400).json({ status: false, message: error.message });
    }
    console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Delete Enquiry by id
export const DeleteEnquiry = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (!id) {
      throw new apiErrors.NotFoundError('Enquiry ID is required.');
    }

    const Enquiry = await EnService.viewEn(id);
    if (!Enquiry) {
      return res.status(400).json({ status: false, message: 'Enquiry not found.' });
    }

    const result = await EnService.deleteEn(id);

    if (!result) {
      throw new apiErrors.BadRequestError('Enquiry not found.');
    }

    const response = successResponse('Enquiry deleted successfully.', result);
    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Delete Multiple Enquiry by id
export const DeleteMultipleEnquiry = async (req: Request, res: Response): Promise<any> => {
  try {
    let { ids } = req.body;

    if (!Array.isArray(ids)) {
      return res.status(400).json({ status: false, message: 'not found!' });
    }
    const deletedCount = await EnService.deleteMultipleEn(ids);
    const response = successResponse(`${deletedCount} Enquiry deleted successfully`, {
      deletedCount,
    });
    return res.status(response.statusCode).json(response.body);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Find Enquiry Status by id
export const UpdateEnquiryStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      throw new apiErrors.BadRequestError('Enquiry ID is required.');
    }
    const Enquiry = await EnService.viewEn(id);
    if (!Enquiry) {
      return res.status(400).json({ status: false, message: 'Enquiry not found.' });
    }
    const result = await EnService.updateEnStatus(id, req);

    return res.json({
      status: true,
      message: 'Enquiry Status updated successfully!',
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};