import { Op } from "sequelize";
import db from "../../models/index";
import bcryptUtil from "../../utils/bcrypt.util";
import { sendEmail } from '../../utils/email';
import { UpdateStatus } from '../../utils/email-templates';
import { deleteUploadFolder } from "../../utils/delete-folder";
import { deleteFile } from '../../utils/delete-single-file'
import { createSchema, createAndCloneSchema, deleteSchema, renameSchema } from "./schema.service";
const { User, Role, Theme, Subscription, Plan } = db;

type PaginationParams = {
  page?: number | string;
  limit?: number | string;
};

// Helper to parse pagination
const parsePagination = ({ page, limit }: PaginationParams) => {
  const pageNumber = page && !isNaN(Number(page)) ? Number(page) : 1;
  const limitNumber = limit && !isNaN(Number(limit)) ? Number(limit) : 10;
  const offset = (pageNumber - 1) * limitNumber;
  return { pageNumber, limitNumber, offset };
};

// ====== USER SERVICES ======
export const findAllUsers = async (params: PaginationParams) => {
  const { pageNumber, limitNumber, offset } = parsePagination(params);
  const { count, rows } = await User.findAndCountAll({
    offset,
    limit: limitNumber,
    where: { role: { [Op.notIn]: [1] } },
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: Role,
        as: 'roleData',
        attributes: ['id', 'name', 'description'],
      },
      {
        model: Theme,
        as: 'Theme', // ✅ Must match association alias
        attributes: ['id', 'name', 'description'],
      },
      {
        model: Subscription,
        as: "subscriptionData",
        limit: 1,
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: Plan,
            as: "Plan",
            attributes: ["id", "name", "price"],
          },
        ],
      },
    ],
  });
  return {
    data: rows,
    limit: rows.length,
    total: count,
    page: pageNumber,
    totalPages: Math.ceil(count / limitNumber),
  };
};

export const fetchAllAdmin = async (params: PaginationParams) => {
  const { pageNumber, limitNumber, offset } = parsePagination(params);
  const { count, rows } = await User.findAndCountAll({
    offset,
    limit: limitNumber,
    where: { role: 1, status: "Y" },
    order: [["createdAt", "DESC"]],
  });
  return {
    data: rows,
    limit: rows.length,
    total: count,
    page: pageNumber,
    totalPages: Math.ceil(count / limitNumber),
  };
};

export const createUser = async (req: any) => {
  const { body, file } = req;

  const imageFolder = req.imagefolder; // e.g. tenantA_1731424523123
  const uploadedFile = file?.filename || null; // e.g. uuid_timestamp.png

  // Build file path (optional, for easy access)
  const companyLogoPath = uploadedFile ? `${imageFolder}/${uploadedFile}` : null;

  // console.log("📁 Folder:", imageFolder);
  // console.log("🖼️ Uploaded File:", uploadedFile);
  // console.log("✅ Full Path:", companyLogoPath);

  const hashedPassword = await bcryptUtil.createHash(body.password);

  const newUser = await User.create({
    ...body,
    password: hashedPassword,
    status: "N",
    approval: "N",
    imageFolder: imageFolder, // folder name
    company_logo: companyLogoPath, // full path 
  });

  return newUser;
};

export const findUserByEmail = async (email: string) => {
  return await User.findOne({ where: { email } });
};

export const findCompanyName = async (company_name: string) => {
  const company = await User.findOne({ where: { company_name } });
  return company;
};

export const findCompanySubdomain = async (subdomain: string) => {

  const company = await User.findOne({ where: { subdomain } });
  return company;
};

export const findCompanyNameOnUpdate = async (
  company_name: string,
  id?: number
) => {
  const where: any = {
    company_name, // direct equality (case-sensitive)
  };

  if (id) {
    where.id = { [Op.ne]: id }; // exclude current record
  }

  const company = await User.findOne({ where });
  return company;
};

export const findUserById = async (id: string | number) => {
  return await User.findByPk(id, {
    include: [
      {
        model: Role,
        as: 'roleData',
        attributes: ['id', 'name', 'description'],
      },
      {
        model: Theme,
        as: 'Theme', // ✅ Must match association alias
        attributes: ['id', 'name', 'description'],
      },
      {
        model: Subscription,
        as: "subscriptionData",
        limit: 1,
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: Plan,
            as: "Plan",
            attributes: ["id", "name", "price"],
          },
        ],
      }
    ],
  });
};

export const updateUser = async (id: number, req: any) => {
  const { body, file } = req;

  // 🖼️ Handle new upload (if any)
  const imageFolder = req.imagefolder; // e.g. tenantA_1731424523123
  const uploadedFile = file?.filename || null; // e.g. uuid_timestamp.png
  const companyLogoPath = uploadedFile ? `${imageFolder}/${uploadedFile}` : null;

  // 🧠 1️⃣ Validate duplicate email
  const existing = await User.findOne({
    where: { email: body.email, id: { [Op.ne]: id } },
  });
  if (existing) {
    if (companyLogoPath) deleteFile(companyLogoPath);
    throw new Error("A user with this email already exists.");
  }

  // 🧠 2️⃣ Get current user
  const currentUser: any = await User.findByPk(id);
  if (!currentUser) {
    if (companyLogoPath) deleteFile(companyLogoPath);
    throw new Error("User not found.");
  }

  // // 🧠 3️⃣ Approval check
  // if (currentUser.approval === "N") {
  //   if (companyLogoPath) deleteFile(companyLogoPath);
  //   throw new Error("This user is not approved for update.");
  // }

  // 🧩 4️⃣ Prepare updated data
  const updateData: any = {
    ...body,
    updatedAt: new Date(),
  };

  // 🧠 5️⃣ Password hashing (if provided)
  if (body.password) {
    updateData.password = await bcryptUtil.createHash(body.password);
  }

  // 🖼️ 6️⃣ Handle new logo file
  if (companyLogoPath) {
    // delete old logo if exists
    if (currentUser.company_logo) {
      await deleteFile(currentUser.company_logo);
    }
    updateData.company_logo = companyLogoPath;
  }

  // 🧠 7️⃣ Update record
  await User.update(updateData, { where: { id } });

  // 🧠 8️⃣ Return updated user
  return await User.findByPk(id);
};

export const deleteUserById = async (id: number): Promise<boolean> => {
  if (!id || typeof id !== 'number') {
    throw new Error('Invalid user ID');
  }

  const userData: any = await User.findByPk(id);
  if (!userData) {
    throw new Error('User not found');
  }

  // Delete user's schema if schema_name exists
  if (userData.schema_name) {
    const schemaName = userData.schema_name;

    // Prevent accidental deletion of critical schemas
    if (['public', 'information_schema', 'pg_catalog'].includes(schemaName)) {
      console.warn(`⚠️ Skipping deletion of critical schema: ${schemaName}`);
    } else {
      try {
        await deleteSchema(schemaName);
      } catch (err: any) {
        console.error(`❌ Failed to delete schema "${schemaName}":`, err);
        throw new Error(`Failed to delete user's schema: ${err.message}`);
      }
    }
  }
  // Delete user record
  const deletedCount = await User.destroy({ where: { id } });
  if (deletedCount === 0) {
    console.warn(`⚠️ Failed to delete user with ID ${id} — record not found`);
    return false;
  }

  // Delete uploaded folder
  if (userData?.imageFolder) await deleteUploadFolder(userData.imageFolder);

  return true;
};

export const updateUserStatus = async (id: string, req: any) => {
  const { status } = req.body;
  await User.update({ status, updatedAt: new Date() }, { where: { id } });
  return await User.findByPk(id);
};

export const searchUser = async (page = 1, limit = 10, searchTerm?: string, fromDate?: string, toDate?: string) => {
  const offset = (page - 1) * limit;
  const whereClause: any = {};

  // 🔍 Search Term
  if (searchTerm?.trim()) {
    const term = `%${searchTerm.trim()}%`;
    whereClause[Op.or] = [
      { company_name: { [Op.iLike]: term } }, // PostgreSQL only
      { email: { [Op.iLike]: term } },
    ];
  }

  // 📅 Date filters
  if (fromDate && toDate) {
    whereClause.createdAt = {
      [Op.between]: [new Date(`${fromDate}T00:00:00Z`), new Date(`${toDate}T23:59:59Z`)],
    };
  } else if (fromDate) {
    whereClause.createdAt = { [Op.gte]: new Date(`${fromDate}T00:00:00Z`) };
  } else if (toDate) {
    whereClause.createdAt = { [Op.lte]: new Date(`${toDate}T23:59:59Z`) };
  }

  // ✅ Debug the final where clause
  // console.log('Final WHERE clause:', JSON.stringify(whereClause, null, 2));
  const finalWhere = {
    ...whereClause,
    role: { [Op.notIn]: [1] },
  };

  const { count, rows } = await User.findAndCountAll({
    offset, limit, where: finalWhere, order: [['createdAt', 'DESC']],
    include: [
      {
        model: Role,
        as: 'roleData',
        attributes: ['id', 'name', 'description'],
      },
      {
        model: Theme,
        as: 'Theme', // ✅ Must match association alias
        attributes: ['id', 'name', 'description'],
      },
      {
        model: Subscription,
        as: "subscriptionData",
        limit: 1, // get latest
        order: [["created", "DESC"]],
      }
    ],
  });

  return { data: rows, page, limit, total: count, totalPages: Math.ceil(count / limit), };
};

export const approveUser = async (id: string, req: any) => {
  try {
    const { approval, newSchema, role } = req?.body;
    const oldSchema = "demo";

    if (approval != 'Y' || !newSchema) throw new Error("Insufficient details provided to approve the user. Please provide all the necessary information.");

    const response: any = await createAndCloneSchema(oldSchema, newSchema);
    if (response?.status === true) {
      await User.update({ approval: "Y", updatedAt: new Date() }, { where: { id } });
      return await User.findByPk(id);
    } else {
      return { status: false, message: "Failed to apprve the user. Due to invalid credentials" };
    }

  } catch (error: any) {
    console.error("❌ User not approved: ", error);
    return {
      status: false,
      message: "Failed to create or clone schema.",
      error: error.message,
    };
  }
};

export const saveDomain = async (id: number, req: any) => {
  const { www_domain } = req.body;

  const existingUser: any = await User.findByPk(id);
  if (!existingUser) {
    throw new Error("User not found.");
  }

  // if (existingUser?.approval === "N") {
  //   throw new Error("This user is not approved to update.");
  // }

  const updateData = {
    custom_domain: www_domain,
    updatedAt: new Date(),
  };

  await User.update(updateData, { where: { id } });
  return await User.findByPk(id);
};

export const removeDomain = async (id: number) => {
  if (!id) throw new Error("Invalid user ID");

  const user = await User.findByPk(id);
  if (!user) throw new Error("User not found");
  await User.update({ custom_domain: null, updatedAt: new Date() }, { where: { id } });
  return await User.findByPk(id);
};
