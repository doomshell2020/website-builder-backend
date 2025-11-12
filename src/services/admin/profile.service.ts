import db from '../../models/index';
const { User } = db;

// Find user by ID
export const findUserById = async (id: string | number) => {
  return await User.findByPk(id, {
    attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'deleted','role'] },
  });
};
