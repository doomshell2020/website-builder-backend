import db from '../../models/index';
import { deleteFile } from '../../utils/delete-single-file'

// Find Single Testimonial by Ids
export const findTestimonialsByIds = async (id: string) => {
  const { Testimonials } = db;
  const testimonial = await Testimonials.findByPk(id);
  if (!testimonial) throw new Error('Testimonial not found');
  return testimonial;
};

// Find Single Testimonial by Name
export const findName = async (name: string) => {
  const { Testimonials } = db;
  return await Testimonials.findOne({ where: { name } });
};

// Create Testimonial
export const createTestimonials = async (req: any) => {
  const { Testimonials } = db;
  const { body, files } = req;

  const imageFolder = req.imagefolder; // 📁 e.g. tenantA_1731424523123

  // 🧠 Safely build full relative paths for each file
  const image = files?.image?.[0]?.filename
    ? `${imageFolder}/${files.image[0].filename}`
    : null;

  const companyLogo = files?.company_logo?.[0]?.filename
    ? `${imageFolder}/${files.company_logo[0].filename}`
    : null;

  const testimonialData = {
    ...body,
    image,
    company_logo: companyLogo,
  };

  return await Testimonials.create(testimonialData);
};

// List Testimonials with Pagination
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

// Update Testimonial
export const updateTestimonials = async (id: number, req: any) => {
  const { Testimonials } = db;
  const { body } = req;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

  // 📦 Get existing record
  const existing: any = await Testimonials.findByPk(id);
  if (!existing) throw new Error("Testimonial not found.");

  const updateData: any = {
    ...body,
    updatedAt: new Date(),
  };

  // 📁 Get folder from multer (auto-created)
  const imageFolder = req.imagefolder;

  // 🖼️ If new image uploaded
  if (files?.image?.[0]) {
    const newImagePath = `${imageFolder}/${files.image[0].filename}`;

    // Delete old image (safe check)
    if (existing.image) deleteFile(existing.image);

    updateData.image = newImagePath;
  }

  // 🏢 If new company logo uploaded
  if (files?.company_logo?.[0]) {
    const newLogoPath = `${imageFolder}/${files.company_logo[0].filename}`;

    // Delete old logo (safe check)
    if (existing.company_logo) deleteFile(existing.company_logo);

    updateData.company_logo = newLogoPath;
  }

  try {
    // 🔄 Update record
    const [affectedCount, updatedRows] = await Testimonials.update(updateData, {
      where: { id },
      returning: true,
    });

    if (affectedCount === 0) throw new Error("No changes made to Testimonial");

    return updatedRows?.[0] ?? (await Testimonials.findByPk(id));
  } catch (error) {
    console.error("❌ Error updating Testimonial:", error);
    throw error;
  }
};

//  Delete Testimonial
export const deleteTestimonials = async (id: number) => {
  const { Testimonials } = db;

  // 1️⃣ Find existing testimonial
  const testimonial: any = await Testimonials.findByPk(id);
  if (!testimonial) {
    throw new Error("Testimonial not found");
  }

  // 2️⃣ Delete record from DB
  await Testimonials.destroy({ where: { id } });

  // 3️⃣ Delete associated uploaded files
  try {
    if (testimonial.image) {
      deleteFile(testimonial.image);
      console.log(`🗑 Deleted testimonial image: ${testimonial.image}`);
    }

    if (testimonial.company_logo) {
      deleteFile(testimonial.company_logo);
      console.log(`🗑 Deleted testimonial company logo: ${testimonial.company_logo}`);
    }
  } catch (error) {
    console.error("⚠️ Error deleting testimonial files:", error);
  }
  return true;
};

// Update Status Only
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