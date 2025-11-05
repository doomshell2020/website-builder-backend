import { Request, Response } from 'express';
import * as StaticServices from '../../services/admin/static.service';
import { successResponse } from '../../utils/responseUtils';
import { apiErrors } from '../../utils/api-errors';

// Get by Id
export const findStaticById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      throw new apiErrors.NotFoundError('Static ID is required.');
    }
    const Static = await StaticServices.findStaticByIds(id);
    if (!Static) {
      throw new apiErrors.BadRequestError('Static not found.');
    }
    const response = successResponse('Statics found successfully', Static);
    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Get by Title
export const findStaticByTitle = async (req: Request, res: Response) => {
  try {

    const title = req.params.title;
    // console.log("title: ",req.params.title);
    if (!title) {
      throw new apiErrors.NotFoundError('Static title is required.');
    }
    const Static = await StaticServices.findTitle(title);
    if (!Static || Static == null) {
      return res.status(404).json({ success: false, message: 'Static page not found.' });
    }
    const response = successResponse('Static page found successfully', Static);
    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Create a new Static (Static)
export const CreateStatic = async (req: Request, res: Response) => {
  try {
    const StaticDetails = await StaticServices.createStatic(req);
    const response = successResponse('Static have been created successfully', StaticDetails);
    return res.status(response.statusCode).json(response.body);
  } catch (error: any) {
    console.error(error);
    if (error instanceof apiErrors.BadRequestError) {
      return res.status(400).json({ status: false, message: error.message });
    }
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Get all Static
export const findAllStatics = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;


    // ✅ Pass schema to service
    const statics = await StaticServices.findAllStatics(page, limit);

    const response = successResponse('Statics found successfully', statics);
    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    console.error('Error fetching statics:', error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Update Static
export const UpdateStatic = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ status: false, message: 'Static ID is required.' });
    }

    const Static = await StaticServices.findStaticByIds(id);
    if (!Static) {
      return res.status(400).json({ status: false, message: 'Static not found.' });
    }
    const result = await StaticServices.updateStatic(Number(id), req);
    return res.json({
      status: true,
      message: 'Static updated successfully!',
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

// Delete Static by ID
export const DeleteStatic = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (!id) {
      throw new apiErrors.NotFoundError('Static ID is required.');
    }


    const Static = await StaticServices.findStaticByIds(id);
    if (!Static) {
      return res.status(400).json({ status: false, message: 'Static not found.' });
    }

    const result = await StaticServices.deleteStatic(Number(id));

    if (!result) {
      throw new apiErrors.BadRequestError('Static not found.');
    }

    const response = successResponse('Static deleted successfully.', result);
    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Find Static Status by ID
export const UpdateStatusStatic = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      throw new apiErrors.BadRequestError('Static ID is required.');
    }

    const Static = await StaticServices.findStaticByIds(id);
    if (!Static) {
      return res.status(400).json({ status: false, message: 'Static not found.' });
    }
    const result = await StaticServices.updateStaticStatus(id, req);

    return res.json({
      status: true,
      message: 'Static Status updated successfully!',
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};
