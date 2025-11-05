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

export const findClientLogoByIds = async (id: string) => {
  const { ClientLogo } = db;
  try {
    const Client = await ClientLogo.findOne({ where: { id: id } });
    return Client;
  } catch (error) {
    throw error;
  }
};

export const findUrl = async (url: string) => {
  const { ClientLogo } = db;
  try {
    const Client = await ClientLogo.findOne({ where: { url: url } });
    return Client;
  } catch (error) {
    throw error;
  }
};

export const createClientLogo = async (req: any) => {
  const { ClientLogo } = db;
  const { body, file } = req;

  const ClientLogoData = {
    ...body,
    image: file?.filename || null,
  };

  return await ClientLogo.create(ClientLogoData);
};

export const findAllClientLogos = async (page: number = 1, limit: number = 10) => {
  const { ClientLogo } = db;
  const pageNumber = Number.isInteger(page) && page > 0 ? page : 1;
  const limitNumber = Number.isInteger(limit) && limit > 0 ? limit : 10;
  const offset = (pageNumber - 1) * limitNumber;

  const { count, rows } = await ClientLogo.findAndCountAll({
    offset,
    limit: limitNumber,
    distinct: true,
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

export const updateClientLogo = async (id: number, req: any) => {
  const { ClientLogo } = db;
  const { body, file } = req;
  const existing: any = await ClientLogo.findByPk(id);
  if (!existing) {
    throw new Error('Client Logo not found.');
  }
  const updateData: any = {
    ...body,
    updatedAt: new Date(),
  };

  if (file?.filename) {
    updateData.image = file.filename;
    // Delete old image
    deleteFile(existing.image);
  }
  const [affectedCount, updatedRows] = await ClientLogo.update(updateData, {
    where: { id },
    returning: true,
  });

  if (affectedCount === 0) { throw new Error('No changes made to Client Logo.'); }
  return updatedRows[0];
};

export const deleteClientLogo = async (id: number) => {
  const { ClientLogo } = db;
  const clientlogo: any = await ClientLogo.findByPk(id);
  if (!clientlogo) {
    throw new Error('Client Logo not found');
  }
  deleteFile(clientlogo.image);

  await ClientLogo.destroy({ where: { id } });
  return true;
};

export const updateClientLogoStatus = async (id: string, req: any) => {
  const { ClientLogo } = db;
  const { status } = req.body;

  await ClientLogo.update({ status, updatedAt: new Date() }, { where: { id } });
  return await ClientLogo.findByPk(id);
};
