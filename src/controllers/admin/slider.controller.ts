import { Request, Response } from 'express';
import * as SliderServices from '../../services/admin/slider.service';
import { successResponse } from '../../utils/responseUtils';
import { apiErrors } from '../../utils/api-errors';
import { deleteUploadedFilesFromReq } from "../../utils/delete-multi";

// Get by Id
export const findSliderById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      throw new apiErrors.NotFoundError('Slider ID is required.');
    }
    const slider = await SliderServices.findSlider(id);
    if (!slider) {
      throw new apiErrors.BadRequestError('Slider not found.');
    }
    const response = successResponse('Sliders found successfully', slider);
    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Get by Title
export const findSliderByTitle = async (req: Request, res: Response) => {
  try {
    const title = req.params.title;
    if (!title) {
      throw new apiErrors.NotFoundError('Slider title is required.');
    }
    const Slider = await SliderServices.findTitle(title);
    if (!Slider || Slider == null) {
      return res.status(404).json({ success: false, message: 'Slider page not found.' });
    }
    const response = successResponse('Slider page found successfully', Slider);
    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Create a new Slider (Slider)
export const CreateSlider = async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    // const Slider = await SliderServices.findSliderByTitle(title);

    // if (Slider) {
    //   if (req?.file || (req?.files && Object.keys(req.files).length > 0)) {
    //     deleteUploadedFilesFromReq(req);
    //   }
    //   throw new apiErrors.BadRequestError('A Slider with this title already exists.');
    // }
    const SliderDetails = await SliderServices.createSlider(req);
    const response = successResponse('Slider have been created successfully', SliderDetails);
    return res.status(response.statusCode).json(response.body);
  } catch (error: any) {
    console.error(error);
    if (error instanceof apiErrors.BadRequestError) {
      return res.status(400).json({ status: false, message: error.message });
    }
    if (req?.file || (req?.files && Object.keys(req.files).length > 0)) {
      deleteUploadedFilesFromReq(req);
    }
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Get all Slider
export const findAllSliders = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.params.page ?? (req.query.page as string)) || 1;
    const limit = parseInt(req.params.limit ?? (req.query.limit as string)) || 10;

    const Slider = await SliderServices.findSliders(page, limit);
    const response = successResponse('Sliders found successfully', Slider);
    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Update Slider
export const UpdateSlider = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ status: false, message: 'Slider ID is required.' });
    }
    const result = await SliderServices.updateSlider(Number(id), req);
    return res.json({
      status: true,
      message: 'Slider updated successfully!',
      data: result,
    });
  } catch (error: any) {
    if (error.message?.includes('title')) {
      return res.status(400).json({ status: false, message: error.message });
    }
    if (req?.file || (req?.files && Object.keys(req.files).length > 0)) {
      deleteUploadedFilesFromReq(req);
    } console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Delete Slider by ID
export const DeleteSlider = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (!id) {
      throw new apiErrors.NotFoundError('Slider ID is required OR Slider Not Found.');
    }

    const result = await SliderServices.deleteSlider(Number(id));

    if (!result) {
      throw new apiErrors.BadRequestError('Slider not found.');
    }

    const response = successResponse('Slider deleted successfully.', result);
    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    // console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Find Slider Status by ID
export const UpdateStatusSlider = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      throw new apiErrors.BadRequestError('Slider ID is required.');
    }
    const slider = await SliderServices.findSlider(id);
    if (!slider) {
      return res.status(400).json({ status: false, message: 'Slider not found.' });
    }
    const result = await SliderServices.updateStatus(id, req);

    return res.json({
      status: true,
      message: 'Slider Status updated successfully!',
      data: result,
    });
  } catch (error) {
    // console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

