import { Request, Response } from 'express';
import * as TestimonialsServices from '../../services/admin/testimonials.service';
import { successResponse } from '../../utils/responseUtils';
import { apiErrors } from '../../utils/api-errors';
import { deleteUploadedFilesFromReq } from "../../utils/delete-multi";

// Get by Id
export const FindTestimonialsById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      throw new apiErrors.NotFoundError('Testimonials ID is required.');
    }
    const testimonials = await TestimonialsServices.findTestimonialsByIds(id);
    if (!testimonials) {
      throw new apiErrors.BadRequestError('Testimonials not found.');
    }
    const response = successResponse('Testimonialss found successfully', testimonials);
    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Create a new Testimonials (Testimonials)
export const CreateTestimonials = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const testimonials = await TestimonialsServices.findName(name);

    if (testimonials) {
      if (req?.file || (req?.files && Object.keys(req.files).length > 0)) {
        deleteUploadedFilesFromReq(req);
      }
      throw new apiErrors.BadRequestError('A Testimonials with this person already exists.');
    }
    const TestimonialsDetails = await TestimonialsServices.createTestimonials(req);
    const response = successResponse(
      'Testimonials have been created successfully',
      TestimonialsDetails
    );
    return res.status(response.statusCode).json(response.body);
  } catch (error: any) {
    if (req?.file || (req?.files && Object.keys(req.files).length > 0)) {
      deleteUploadedFilesFromReq(req);
    }
    console.error(error);
    if (error instanceof apiErrors.BadRequestError) {
      return res.status(400).json({ status: false, message: error.message });
    }
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Get all Testimonials
export const FindAllTestimonials = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await TestimonialsServices.findAllTestimonials(page, limit);

    const response = successResponse('Testimonials found successfully', result);
    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Update Testimonials
export const UpdateTestimonials = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ status: false, message: 'Testimonials ID is required.' });
    }
    const Testimonials = await TestimonialsServices.findTestimonialsByIds(id);
    if (!Testimonials) {
      if (req?.file || (req?.files && Object.keys(req.files).length > 0)) {
        deleteUploadedFilesFromReq(req);
      }
      return res.status(400).json({ status: false, message: 'Testimonials not found.' });
    }
    const result = await TestimonialsServices.updateTestimonials(Number(id), req);
    return res.json({
      status: true,
      message: 'Testimonials updated successfully!',
      data: result,
    });
  } catch (error: any) {
    if (error.message?.includes('name')) {
      return res.status(400).json({ status: false, message: error.message });
    }
    if (req?.file || (req?.files && Object.keys(req.files).length > 0)) {
      deleteUploadedFilesFromReq(req);
    }
    console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Delete Testimonials by ID
export const DeleteTestimonials = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (!id) {
      throw new apiErrors.NotFoundError('Testimonial ID is required OR Testimonials Not Found.');
    }

    const Testimonials = await TestimonialsServices.findTestimonialsByIds(id);
    if (!Testimonials) {
      return res.status(400).json({ status: false, message: 'Testimonials not found.' });
    }

    const result = await TestimonialsServices.deleteTestimonials(Number(id));

    if (!result) {
      throw new apiErrors.BadRequestError('Testimonials not found.');
    }

    const response = successResponse('Testimonials deleted successfully.', result);
    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    // console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Find Testimonials Status by ID
export const UpdateStatusTestimonials = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      throw new apiErrors.BadRequestError('Testimonials ID is required.');
    }
    const Testimonials = await TestimonialsServices.findTestimonialsByIds(id);
    if (!Testimonials) {
      return res.status(400).json({ status: false, message: 'Testimonials not found.' });
    }
    const result = await TestimonialsServices.updateTestimonialsStatus(id, req);

    return res.json({
      status: true,
      message: 'Testimonials Status updated successfully!',
      data: result,
    });
  } catch (error) {
    // console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};
