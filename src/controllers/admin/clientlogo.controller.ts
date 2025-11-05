import { Request, Response } from 'express';
import * as ClientLogoServices from '../../services/admin/clientlogo.service';
import { successResponse } from '../../utils/responseUtils';
import { apiErrors } from '../../utils/api-errors';
import { deleteUploadedFilesFromReq } from "../../utils/delete-multi";

// Get by Id
export const FindClientLogoById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      throw new apiErrors.NotFoundError('ClientLogo ID is required.');
    }
    const clientLogo = await ClientLogoServices.findClientLogoByIds(id);
    if (!clientLogo) {
      throw new apiErrors.BadRequestError('ClientLogo not found.');
    }
    const response = successResponse('ClientLogos found successfully', clientLogo);
    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Create a new ClientLogo (ClientLogo)
export const CreateClientLogo = async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    const clientLogo = await ClientLogoServices.findUrl(url);

    if (clientLogo) {
      if (req?.file) { deleteUploadedFilesFromReq(req); }
      throw new apiErrors.BadRequestError('A Client logo with this Url/Website already exists.');
    }
    const clientLogoDetails = await ClientLogoServices.createClientLogo(req);
    const response = successResponse(
      'Client logo have been created successfully',
      clientLogoDetails
    );
    return res.status(response.statusCode).json(response.body);
  } catch (error: any) {
    console.error(error);
    if (req?.file) { deleteUploadedFilesFromReq(req); }
    if (error instanceof apiErrors.BadRequestError) {
      return res.status(400).json({ status: false, message: error.message });
    }
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Get all ClientLogo
export const FindAllClientLogos = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const ClientLogo = await ClientLogoServices.findAllClientLogos(page, limit);
    const response = successResponse('Client logos found successfully', ClientLogo);
    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Update ClientLogo
export const UpdateClientLogo = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      if (req?.file) { deleteUploadedFilesFromReq(req); }
      return res.status(400).json({ status: false, message: 'Client logo ID is required.' });
    }
    const result = await ClientLogoServices.updateClientLogo(Number(id), req);
    return res.json({
      status: true,
      message: 'Client logo updated successfully!',
      data: result,
    });
  } catch (error: any) {
    if (req?.file) { deleteUploadedFilesFromReq(req); }
    if (error.message?.includes('url')) { return res.status(400).json({ status: false, message: error.message }) }
    console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Delete ClientLogo by ID
export const DeleteClientLogo = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (!id) {
      throw new apiErrors.NotFoundError('Client logo Not Found.');
    }
    const result = await ClientLogoServices.deleteClientLogo(Number(id));
    if (!result) {
      throw new apiErrors.BadRequestError('Client logo not found.');
    }
    const response = successResponse('Client logo deleted successfully.', result);
    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    // console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Find ClientLogo Status by ID
export const UpdateStatusClientLogo = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      throw new apiErrors.BadRequestError('Client logo ID is required.');
    }
    const ClientLogo = await ClientLogoServices.findClientLogoByIds(id);
    if (!ClientLogo) {
      return res.status(400).json({ status: false, message: 'Client logo not found.' });
    }
    const result = await ClientLogoServices.updateClientLogoStatus(id, req);

    return res.json({
      status: true,
      message: 'Client logo Status updated successfully!',
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};
