import db from '../../models/index';
import { Op } from 'sequelize';

export const findSeoByIds = async (id: string) => {
  const { Seo } = db;
  const seo = await Seo.findOne({ where: { id: id } });
  return seo;
};

export const findSeoByPage = async (orgid: string, type: string) => {
  const { Seo } = db;
  const seo = await Seo.findOne({ where: { orgid: orgid } }); //type : type
  return seo;
};

export const createSeo = async (req: any) => {
  const { Seo } = db;
  const { body } = req;
  const createSeo = {
    ...body,
  };
  return await Seo.create(createSeo);
};

export const findAllSeo = async (page: number = 1, limit: number = 10) => {
  const { Seo } = db;
  const pageNumber = Number.isInteger(page) && page > 0 ? page : 1;
  const limitNumber = Number.isInteger(limit) && limit > 0 ? limit : 10;
  const offset = (pageNumber - 1) * limitNumber;

  const { count, rows } = await Seo.findAndCountAll({
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

export const searchSeosByType = async (
  searchType: any,
  searchQuery: any,
  page: number = 1,
  limit: number = 10
) => {
  const { Seo } = db;
  const pageNumber = Number.isInteger(page) && page > 0 ? page : 1;
  const limitNumber = Number.isInteger(limit) && limit > 0 ? limit : 10;
  const offset = (pageNumber - 1) * limitNumber;

  const searchableFields = ['page', 'location', 'keyword', 'description', 'title'];

  if (!searchableFields.includes(searchType)) {
    throw new Error('Invalid search type');
  }
  const { count, rows } = await Seo.findAndCountAll({
    where: { [searchType]: { [Op.iLike]: `%${searchQuery}%` } },
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

export const updateSeo = async (id: number, req: any) => {
  const { Seo } = db;
  const { body } = req;
  const updateData: any = {
    ...body,
    updatedAt: new Date(),
  };

  try {
    const [affectedCount, updatedRows] = await Seo.update(updateData, {
      where: { id },
      returning: true,
    });

    if (affectedCount === 0) {
      throw new Error('Seo not found or no changes made.');
    }

    return updatedRows[0]; // Updated Seo
  } catch (error) {
    console.error('Error while updating Seo:', error);
    throw error;
  }
};

export const deleteSeo = async (id: number) => {
  const { Seo } = db;
  await Seo.destroy({ where: { id } });
  return true;
};

export const deleteSeoByOrgId = async (id: number) => {
  const { Seo } = db;
  await Seo.destroy({ where: { orgid: id } });
  return true;
};

export const updateSeoStatus = async (id: string, req: any) => {
  const { Seo } = db;
  const { status } = req.body;

  await Seo.update({ status, updatedAt: new Date() }, { where: { id } });
  return await Seo.findByPk(id);
};
