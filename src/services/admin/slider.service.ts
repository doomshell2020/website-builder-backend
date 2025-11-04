import db from '../../models/index';
import fs from 'fs';
import path from 'path';

// 🧹 File Delete Helper
const deleteFile = (filename?: string) => {
  if (!filename) return;
  const filePath = path.join(process.cwd(), "uploads", filename);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filePath}`);
    } catch (err) {
      console.error(`Failed to delete file ${filename}:`, err);
    }
  }
};

export const findSlider = async (id: string) => {
  const { Slider } = db;
  const slider = await Slider.findByPk(id);
  if (!slider) throw new Error('Slider not found');
  return slider;
};

export const findTitle = async (title: string) => {
  const { Slider } = db;
  try {
    const sliderData = await Slider.findAll({ where: { title: title, status: 'Y' }, order: [['createdAt', 'ASC']], });
    return sliderData;
  } catch (error) {
    throw error;
  }
};

export const findSliderByTitle = async (title: string) => {
  const { Slider } = db;
  const slider = await Slider.findOne({ where: { title } });
  return slider || null;
};

export const createSlider = async (req: any) => {
  const { Slider } = db;
  const { body, file } = req;

  const SliderData = {
    ...body,
    images: file?.filename || null,
  };

  return await Slider.create(SliderData);
};

export const findSliders = async (page: number = 1, limit: number = 10) => {
  const { Slider } = db;
  const pageNumber = Number(page) > 0 ? Number(page) : 1;
  const limitNumber = Number(limit) > 0 ? Number(limit) : 10;
  const offset = (pageNumber - 1) * limitNumber;

  const { count, rows } = await Slider.findAndCountAll({
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

export const updateSlider = async (id: number, req: any) => {
  const { Slider } = db;
  const { body, file } = req;

  const existing: any = await Slider.findByPk(id);
  if (!existing) throw new Error('Slider not found');

  const updateData: any = { ...body, updatedAt: new Date() };

  if (file?.filename) {
    updateData.images = file.filename;
    // Delete old image
    deleteFile(existing.images);
  }

  const [affectedCount, updatedRows] = await Slider.update(updateData, {
    where: { id },
    returning: true,
  });

  if (affectedCount === 0) throw new Error('No changes made to slider');

  return updatedRows[0];
};

export const deleteSlider = async (id: number) => {
  const { Slider } = db;
  const slider: any = await Slider.findByPk(id);
  if (!slider) throw new Error('Slider not found');

  // Delete file safely
  deleteFile(slider.images);

  // Delete DB record
  await Slider.destroy({ where: { id } });

  return true;
};

export const updateStatus = async (id: string, req: any) => {
  const { Slider } = db;
  const { status } = req.body;

  const [updatedCount] = await Slider.update(
    { status, updatedAt: new Date() },
    { where: { id } }
  );

  if (updatedCount === 0) throw new Error('Slider not found or status unchanged');

  return await Slider.findByPk(id);
};
