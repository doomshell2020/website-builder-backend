import db from '../../models/index';

export const findStaticByIds = async (id: string) => {
  const { Static } = db;
  try {
    const staticData = await Static.findOne({ where: { id: id } });
    return staticData;
  } catch (error) {
    throw error;
  }
};

export const findTitle = async (url: string) => {
  const { Static } = db;
  try {
    const staticData = await Static.findOne({ where: { url: url, status: 'Y' } });
    return staticData;
  } catch (error) {
    throw error;
  }
};

export const createStatic = async (req: any) => {
  const { Static } = db;
  const { body, file } = req;
  return await Static.create(body);
};

export const findAllStatics = async (page: number, limit: number) => {
  const { Static } = db;
  const pageNumber = page && !isNaN(Number(page)) ? Number(page) : 1;
  const limitNumber = limit && !isNaN(Number(limit)) ? Number(limit) : 10;
  const offset = (pageNumber - 1) * limitNumber;

  const { count, rows } = await Static.findAndCountAll({
    offset,
    limit: limitNumber,
    order: [['createdAt', 'DESC']],
  });

  return {
    data: rows,
    page: pageNumber,
    limit: limitNumber,
    total: count,
    totalPages: Math.ceil(count / limitNumber), // Correct total pages
  };
};

export const updateStatic = async (id: number, req: any) => {
  const { Static } = db;
  const { body, file } = req;

  const updateData: any = {
    ...body,
    updatedAt: new Date(),
  };

  try {
    const [affectedCount, updatedRows] = await Static.update(updateData, {
      where: { id },
      returning: true,
    });

    if (affectedCount === 0) {
      throw new Error('static not found or no changes made.');
    }

    return updatedRows[0]; // Updated static
  } catch (error) {
    console.error('Error while updating static:', error);
    throw error;
  }
};

export const deleteStatic = async (id: number) => {
  const { Static } = db;
  await Static.destroy({ where: { id } });
  return true;
};

export const updateStaticStatus = async (id: string, req: any) => {
  const { Static } = db;
  const { status } = req.body;

  await Static.update({ status, updatedAt: new Date() }, { where: { id } });
  return await Static.findByPk(id);
};