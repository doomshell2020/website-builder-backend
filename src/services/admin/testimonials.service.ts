import db from '../../models/index';
import fs from 'fs';
import path from 'path';
import cleanupUploads from '../../utils/cleanupImage';

// 🧹 File Deletion Helper
const deleteFile = (filename?: string) => {
  if (!filename) return;
  const filePath = path.join(process.cwd(), 'uploads', filename);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filename}`);
    } catch (err) {
      console.error(`Failed to delete file "${filename}":`, err);
    }
  }
};

// 🔍 Find Single Testimonial by Ids
export const findTestimonialsByIds = async (id: string) => {
  const { Testimonials } = db;
  const testimonial = await Testimonials.findByPk(id);
  if (!testimonial) throw new Error('Testimonial not found');
  return testimonial;
};

// 🔍 Find Single Testimonial by Name
export const findName = async (name: string) => {
  const { Testimonials } = db;
  return await Testimonials.findOne({ where: { name } });
};

// ➕ Create Testimonial
export const createTestimonials = async (req: any) => {
  const { Testimonials } = db;
  const { body, files } = req;

  const image = files?.image?.[0]?.filename || null;
  const companyLogo = files?.company_logo?.[0]?.filename || null;

  const newTestimonial = await Testimonials.create({
    ...body,
    image,
    company_logo: companyLogo,
  });

  return newTestimonial;
};

// 📄 List Testimonials with Pagination
export const findAllTestimonials = async (page: number = 1, limit: number = 10) => {
  const { Testimonials } = db;
  const pageNumber = Number.isInteger(page) && page > 0 ? page : 1;
  const limitNumber = Number.isInteger(limit) && limit > 0 ? limit : 10;
  const offset = (pageNumber - 1) * limitNumber;

  const { count, rows } = await Testimonials.findAndCountAll({
    offset,
    limit: limitNumber,
    order: [['createdAt', 'DESC']],
  });

  return {
    data: rows,
    page: pageNumber,
    limit: limitNumber,
    total: count,
    totalPages: Math.ceil(count / limitNumber),
  };
};

// ✏️ Update Testimonial
export const updateTestimonials = async (id: number, req: any) => {
  const { Testimonials } = db;
  const { body } = req;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

  const existing: any = await Testimonials.findByPk(id);
  if (!existing) {
    await cleanupUploads(req);
    throw new Error('Testimonial not found');
  }

  const updateData: any = {
    ...body,
    updatedAt: new Date(),
  };

  // Update images if new files are uploaded
  if (files?.image?.[0]) {
    deleteFile(existing.image);
    updateData.image = files.image[0].filename;
  }

  if (files?.company_logo?.[0]) {
    deleteFile(existing.company_logo);
    updateData.company_logo = files.company_logo[0].filename;
  }

  try {
    const [affectedCount, updatedRows] = await Testimonials.update(updateData, {
      where: { id },
      returning: true,
    });

    if (affectedCount === 0) throw new Error('No changes made to Testimonial');

    return updatedRows?.[0] ?? (await Testimonials.findByPk(id));
  } catch (error) {
    console.error('Error updating Testimonial:', error);
    await cleanupUploads(req);
    throw error;
  }
};

// 🗑 Delete Testimonial
export const deleteTestimonials = async (id: number) => {
  const { Testimonials } = db;
  const testimonial: any = await Testimonials.findByPk(id);
  if (!testimonial) throw new Error('Testimonial not found');

  ['image', 'company_logo'].forEach((field) => deleteFile(testimonial[field]));

  await Testimonials.destroy({ where: { id } });
  return true;
};

// ⚡ Update Status Only
export const updateTestimonialsStatus = async (id: string, req: any) => {
  const { Testimonials } = db;
  const { status } = req.body;

  const [updatedCount] = await Testimonials.update(
    { status, updatedAt: new Date() },
    { where: { id } }
  );

  if (updatedCount === 0) throw new Error('Testimonial not found or status unchanged');

  return await Testimonials.findByPk(id);
};