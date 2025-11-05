import { Request, Response } from "express";
import * as FAQService from "../../services/admin/faq.service";
import { successResponse } from "../../utils/responseUtils";
import { apiErrors } from "../../utils/api-errors";

/** ================= FAQ CATEGORY ================= */

// View single FAQ Category
export const ViewFAQCategory = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) throw new apiErrors.NotFoundError("FAQ Category ID is required.");

    const category = await FAQService.viewFAQCategory(id);
    if (!category) throw new apiErrors.BadRequestError("FAQ Category not found.");

    const response = successResponse("FAQ Category found successfully", category);
    return res.status(response.statusCode).json(response.body);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// Create FAQ Category
export const CreateFAQCategory = async (req: Request, res: Response) => {
  try {
    const category = await FAQService.createFAQCategory(req);
    const response = successResponse("FAQ Category created successfully", category);
    return res.status(response.statusCode).json(response.body);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// List FAQ Categories
export const FindFAQCategory = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const categories = await FAQService.findFAQCategory(page, limit, search);
    const response = successResponse("FAQ Categories fetched successfully", categories);
    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

// Update FAQ Category
export const UpdateFAQCategory = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      throw new apiErrors.NotFoundError('FAQ category ID is required.');
    }
    const FaqCategory = await FAQService.viewFAQCategory(id);
    if (!FaqCategory) {
      return res.status(400).json({ status: false, message: 'FAQ category not found.' });
    }
    const updatedCategory = await FAQService.updateFAQCategory(id, req);
    return res.json({
      status: true,
      message: "FAQ Category updated successfully",
      data: updatedCategory,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// Delete FAQ Category
export const DeleteFAQCategory = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      throw new apiErrors.NotFoundError('FAQ category ID is required.');
    }
    const FaqCategory = await FAQService.viewFAQCategory(id);
    if (!FaqCategory) {
      return res.status(400).json({ status: false, message: 'FAQ category not found.' });
    }
    await FAQService.deleteFAQCategory(id);
    const response = successResponse("FAQ Category deleted successfully", true);
    return res.status(response.statusCode).json(response.body);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// Delete Multiple Enquiry by id
export const DeleteMultipleFAQCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    let { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ status: false, message: 'not found!' });
    }
    const deletedCount = await FAQService.deleteMultipleFAQCategory(ids);
    const response = successResponse(`${deletedCount} FAQ categories deleted successfully`, { deletedCount, });
    return res.status(response.statusCode).json(response.body);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Update Status
export const UpdateFAQCategoryStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      throw new apiErrors.BadRequestError('FAQ Category ID is required.');
    }
    const { status } = req.body;
    const updated = await FAQService.updateFAQCategoryStatus(id, status);
    const response = successResponse("FAQ Category status updated successfully", updated);
    return res.status(response.statusCode).json(response.body);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};


/** ================= FAQ ================= */

// View single FAQ
export const ViewFAQ = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) throw new apiErrors.NotFoundError("FAQ  ID is required.");
    const faq = await FAQService.viewFAQ(id);
    if (!faq) throw new apiErrors.BadRequestError("FAQ not found.");
    const response = successResponse("FAQ fetched successfully", faq);
    return res.status(response.statusCode).json(response.body);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// Create FAQ
export const CreateFAQ = async (req: Request, res: Response) => {
  try {
    const faq = await FAQService.createFAQ(req);
    const response = successResponse("FAQ created successfully", faq);
    return res.status(response.statusCode).json(response.body);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// List FAQs
export const FindFAQ = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;

    const faqs = await FAQService.findFAQ(page, limit, search, categoryId);
    const response = successResponse("FAQs fetched successfully", faqs);
    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

// Update FAQ
export const UpdateFAQ = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      throw new apiErrors.NotFoundError('FAQ ID is required.');
    }
    const Faq = await FAQService.viewFAQ(id);
    if (!Faq) {
      return res.status(400).json({ status: false, message: 'FAQ not found.' });
    }
    const updated = await FAQService.updateFAQ(id, req);
    return res.json({ status: true, message: "FAQ updated successfully", data: updated });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// Delete FAQ
export const DeleteFAQ = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      throw new apiErrors.NotFoundError('FAQ ID is required.');
    }
    const Faq = await FAQService.viewFAQ(id);
    if (!Faq) {
      return res.status(400).json({ status: false, message: 'FAQ not found.' });
    }
    await FAQService.deleteFAQ(id);
    const response = successResponse("FAQ deleted successfully", true);
    return res.status(response.statusCode).json(response.body);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// Delete Multiple Enquiry by id
export const DeleteMultipleFAQ = async (req: Request, res: Response): Promise<any> => {
  try {
    let { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ status: false, message: 'not found!' });
    }
    const deletedCount = await FAQService.deleteMultipleFAQ(ids);
    const response = successResponse(`${deletedCount} FAQ deleted successfully`, {
      deletedCount,
    });
    return res.status(response.statusCode).json(response.body);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
};

// Update FAQ Status
export const UpdateFAQStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      throw new apiErrors.BadRequestError('FAQ ID is required.');
    }
    const Faq = await FAQService.viewFAQ(id);
    if (!Faq) {
      return res.status(400).json({ status: false, message: 'FAQ not found.' });
    }
    const { status } = req.body;
    const updated = await FAQService.updateFAQStatus(id, status);
    const response = successResponse("FAQ status updated successfully", updated);
    return res.status(response.statusCode).json(response.body);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// Bulk Update Status
export const UpdateBulkFAQStatus = async (req: Request, res: Response) => {
  try {
    const { ids, status } = req.body;
    const updated = await FAQService.updateBulkFAQStatus(ids, status);
    const response = successResponse("FAQ status updated successfully", updated);
    return res.status(response.statusCode).json(response.body);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
