import { Request, Response } from 'express';
import * as GalleryServices from '../../services/admin/gallery.service';
import { successResponse } from '../../utils/responseUtils';
import { apiErrors } from '../../utils/api-errors';
import { deleteUploadedFilesFromReq } from "../../utils/delete-multi";

// Get by Id
export const findGalleryById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (!id) {
            throw new apiErrors.NotFoundError('Gallery ID is required.');
        }
        const gallery = await GalleryServices.findGalleryById(id);
        if (!gallery) {
            throw new apiErrors.BadRequestError('Gallery not found.');
        }
        const response = successResponse('Gallery found successfully', gallery);
        return res.status(response.statusCode).json(response.body);
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ status: false, message: error?.message ?? 'Internal Server Error' });
    }
};

// Get by Title
export const findGalleryBySlug = async (req: Request, res: Response) => {
    try {
        const slug = req?.params.slug;
        if (!slug) {
            throw new apiErrors.NotFoundError('Gallery slug is required.');
        }
        const gallery = await GalleryServices.findGalleryBySlug(slug);
        if (!gallery || gallery == null) {
            return res.status(404).json({ success: false, message: 'Gallery page not found.' });
        }
        const response = successResponse('Gallery page found successfully', gallery);
        return res.status(response.statusCode).json(response.body);
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ status: false, message: error?.message ?? 'Internal Server Error' });
    }
};

// Create a new Gallery (Gallery)
export const CreateGallery = async (req: Request, res: Response) => {
    try {
        const { slug } = req.body;

        // 🧠 1. Check for duplicate
        const existingGallery = await GalleryServices.findGalleryBySlug(slug);
        if (existingGallery) {
            // 🗑️ Clean up uploaded files immediately (before throwing)
            if (req?.files && Object.keys(req.files).length > 0) {
                deleteUploadedFilesFromReq(req);
            }
            throw new apiErrors.BadRequestError("A gallery with this slug already exists.");
        }

        // 🖼️ 2. Create new gallery
        const newGallery = await GalleryServices.createGallery(req);

        const response = successResponse("Gallery has been created successfully", newGallery);
        return res.status(response.statusCode).json(response.body);

    } catch (error: any) {
        console.error("❌ Gallery creation failed:", error);

        // 🧹 Always clean up uploaded files if error occurs
        if (req?.files && Object.keys(req.files).length > 0) {
            deleteUploadedFilesFromReq(req);
        }

        // 🧩 Handle known error types
        if (error instanceof apiErrors.BadRequestError) {
            return res.status(400).json({ status: false, message: error.message });
        }

        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

// Get all Gallery
export const findAllGalleries = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.params.page ?? (req.query.page as string)) || 1;
        const limit = parseInt(req.params.limit ?? (req.query.limit as string)) || 10;

        const gallery = await GalleryServices.findGalleries(page, limit);
        const response = successResponse('Gallery found successfully', gallery);
        return res.status(response.statusCode).json(response.body);
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ status: false, message: error?.message ?? 'Internal Server Error' });
    }
};

// Update Gallery
export const UpdateGallery = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const { title, slug } = req.body;

        if (!id || isNaN(id)) {
            if (req?.files && Object.keys(req.files).length > 0) {
                deleteUploadedFilesFromReq(req);
            }
            throw new apiErrors.NotFoundError('Valid gallery ID is required.');
        }

        // 🧠 Check if the gallery exists
        const existingGallery = await GalleryServices.findGalleryById(id);
        if (!existingGallery) {
            if (req?.files && Object.keys(req.files).length > 0) {
                deleteUploadedFilesFromReq(req);
            }
            throw new apiErrors.NotFoundError('Gallery not found.');
        }

        // 🧩 Check for duplicate slug (excluding current gallery)
        if (slug) {
            const duplicate: any = await GalleryServices.findGalleryBySlug(slug);
            if (duplicate && duplicate.id !== id) {
                if (req?.files && Object.keys(req.files).length > 0) {
                    deleteUploadedFilesFromReq(req);
                }
                return res.status(400).json({
                    status: false,
                    message: "A gallery with this slug already exists. Please use a unique slug.",
                });
            }
        }

        // 🖼️ Perform update using service
        const updatedGallery = await GalleryServices.updateGallery(id, req);

        if (!updatedGallery) {
            return res.status(400).json({
                status: false,
                message: "Gallery update failed. Please try again.",
            });
        }

        return res.status(200).json({
            status: true,
            message: "Gallery updated successfully!",
            data: updatedGallery,
        });
    } catch (error: any) {
        console.error("❌ Update failed:", error);

        // 🧹 Cleanup any uploaded files on failure
        if (req?.files && Object.keys(req.files).length > 0) {
            deleteUploadedFilesFromReq(req);
        }

        const message =
            typeof error?.message === "string" && error.message.length < 200
                ? error.message
                : "Internal Server Error";

        return res.status(500).json({ status: false, message });
    }
};

// Delete Gallery by ID
export const DeleteGallery = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        if (!id) { throw new apiErrors.NotFoundError('ID is required.'); }

        const result = await GalleryServices.deleteGallery(Number(id));
        if (!result) { throw new apiErrors.BadRequestError('Gallery not found.'); }

        const response = successResponse('Gallery deleted successfully.', result);
        return res.status(response.statusCode).json(response.body);
    } catch (error: any) {
        console.error("Error: ", error);
        return res.status(500).json({ status: false, message: error?.message ?? 'Internal Server Error' });
    }
};

// Find Gallery Status by ID
export const UpdateGalleryStatus = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (!id) {
            throw new apiErrors.BadRequestError('ID is required.');
        }
        const gallery = await GalleryServices.findGalleryById(id);
        if (!gallery) {
            throw new apiErrors.BadRequestError("Gallery not found.");
        }
        const success = await GalleryServices.updateStatus(id, req);

        return res.json({
            status: true,
            message: 'Gallery Status updated successfully!',
            success,
        });
    } catch (error: any) {
        console.error("Error: ", error);
        return res.status(500).json({ status: false, message: error?.message ?? 'Internal Server Error' });
    }
};

// Delete Gallery Image by filename
export const DeleteGalleryImage = async (req: Request, res: Response) => {
    const { galleryname, filename } = req.body;

    if (!galleryname || !filename) {
        return res.status(400).json({ message: "Gallery name and filename are required." });
    }

    try {
        const success = await GalleryServices.deleteGalleryImage(galleryname, filename);

        return res.status(200).json({ message: "Image deleted successfully", success, });
    } catch (error: any) {
        console.error("❌ Image deletion failed:", error);
        return res.status(500).json({ message: error.message || "Internal Server Error", });
    }
};