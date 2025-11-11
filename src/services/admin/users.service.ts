import { Op } from "sequelize";
import db from "../../models/index";
import bcryptUtil from "../../utils/bcrypt.util";
import { sendEmail } from '../../utils/email';
import { UpdateStatus } from '../../utils/email-templates';
import fs from "fs";
import path from "path";
import { createSchema, createAndCloneSchema, deleteSchema, renameSchema } from "./schema.service";
const { User, Role, Theme } = db;

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

// Helper to delete file if exists
const deleteFile = (filename?: string) => {
  if (!filename) return;
  const filePath = path.join(process.cwd(), "uploads", filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
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
    order: [["createdAt", "ASC"]],
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

  const companyLogo = file?.filename || null;
  console.log("companyLogo: ", companyLogo);
  const hashedPassword = await bcryptUtil.createHash(body.password);

  const newUser = await User.create({
    ...body,
    status: 'N',
    approval: 'N',
    password: hashedPassword,
    company_logo: companyLogo,
  });

  if (newUser) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Welcome to Doomshell</title>
</head>

<body style="margin:0; padding:0; background-color:#f3f6fa; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:40px 0;">
    <tr>
      <td align="center">

        <!-- Main Container -->
        <table width="640" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff"
          style="border-radius:12px; overflow:hidden; box-shadow:0 4px 18px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #1b4d7a, #3085c3); padding:24px 36px;">
              <table width="100%">
                <tr>
                  <td align="left">
                    <img src="{LOGO_URL}" alt="Company Logo" style="height:58px; display:block;" />
                  </td>
                  <td align="right" style="color:#e8f4fb; font-weight:600; font-size:18px;">
                    Doomshell Software Pvt. Ltd.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:48px 40px 32px 40px; color:#1c1c1c; font-size:16px; line-height:1.7;">
              <p style="margin:0 0 10px; font-size:22px; font-weight:700; color:#1b4d7a;">
                Welcome, {Name}! 🎉
              </p>
              <p style="margin:0 0 16px;">
                We’re thrilled to have you as part of the <strong>Doomshell</strong> family! Your account has been successfully created — and your dashboard is ready to explore.
              </p>

              <p style="margin:0 0 18px;">Here are your login details:</p>

              <table cellpadding="0" cellspacing="0" border="0" style="width:100%; background:#f7fafc; border-radius:8px; margin:20px 0;">
                <tr>
                  <td style="padding:12px 16px; font-weight:600; width:140px; color:#1b4d7a;">Username:</td>
                  <td style="padding:12px 16px; color:#333;">{username}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px; font-weight:600; color:#1b4d7a;">Password:</td>
                  <td style="padding:12px 16px; color:#333;">{password}</td>
                </tr>
              </table>

              <p style="margin:0 0 28px;">
                Access your personalized dashboard using the button below and begin managing your digital experience with ease.
              </p>

              <div style="text-align:center; margin:40px 0;">
                <a href="{LOGIN_URL}"
                  style="background-color:#1b4d7a; color:#ffffff; padding:14px 36px; text-decoration:none; font-weight:700; border-radius:8px; display:inline-block;">
                  Open My Dashboard
                </a>
              </div>

              <p style="margin:0 0 16px;">Need help? Our support team is just a click away.</p>
              <p style="margin:0; color:#666;">
                Welcome again to Doomshell — delivering smart IT solutions and powerful dashboards to drive your business forward.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f1f4f7; padding:20px; text-align:center; color:#555; font-size:13px;">
              &copy; {DATE} Doomshell Software Pvt. Ltd. All rights reserved.<br />
              <a href="{SITE_URL2}" style="color:#1b4d7a; text-decoration:none; font-weight:500;">Visit Website</a> |
              <a href="{LOGIN_URL}" style="color:#1b4d7a; text-decoration:none; font-weight:500;">Login</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
      .replace('{Name}', body.name)
      .replace('{username}', body.email)
      .replace('{password}', body.password)
      .replace('{LOGIN_URL}', `https://doomshell.com/admin`)
      .replace('{SITE_URL2}', `https://doomshell.com`)
      .replace('{DATE}', `${new Date().getFullYear()}`)
      .replace(
        '{LOGO_URL}',
        'https://media.licdn.com/dms/image/v2/D560BAQHvMq7-Q3ebQA/company-logo_200_200/company-logo_200_200/0/1704523933480/doomshell_software_pvt_ltd_logo?e=2147483647&v=beta&t=P-uYX09AKWYJHHP2wI1rX8xUISPOZJkYJXXCAlXHJ5c'
      );

    const emailPayload = UpdateStatus({
      toEmail: newUser.dataValues.email,
      subject: '🎉 Welcome to Doomshell — Your Account Details Inside',
      html,
      Name: newUser.dataValues.name,
      username: body.email,
      password: body.password,
    });

    try {
      await sendEmail(emailPayload);
      console.log('Registration email sent successfully');
    } catch (err) {
      console.error('Failed to send email:', err);
    }
  }
  return newUser;
};

export const findUserByEmail = async (email: string) => {
  await User.findOne({
    where: { email }, include: [
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
    ],
  });
}

export const findCompanyName = async (company_name: string, id?: number) => {
  const company = await User.findOne({
    where: {
      company_name,
      ...(id && { id: { [Op.ne]: id } }), // exclude self if provided
    },
  });

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
    ],
  });
};

export const updateUser = async (id: number, req: any) => {
  const { body, file } = req;
  const { oldSchemaName, newSchemaName } = req.body;

  const newCompanyLogo = file?.filename || null;

  const existing: any = await User.findOne({
    where: { email: body.email, id: { [Op.ne]: id } },
  });

  if (existing) {
    if (newCompanyLogo) deleteFile(newCompanyLogo);
    throw new Error("This email is already used by another user.");
  }

  // new add to approvals
  if (existing?.approval == 'N') {
    if (newCompanyLogo) deleteFile(newCompanyLogo);
    throw new Error("This your is not approved to update.");
  }

  const currentUser: any = await User.findByPk(id);
  if (!currentUser) {
    if (newCompanyLogo) deleteFile(newCompanyLogo);
    throw new Error("User not found.");
  }

  const updateData: any = {
    ...body,
    updatedAt: new Date(),
  };

  if (newCompanyLogo) {
    updateData.company_logo = newCompanyLogo;
    if (currentUser.company_logo) deleteFile(currentUser.company_logo);
  }
  if (body.password) {
    updateData.password = await bcryptUtil.createHash(body.password);
  }

  const updatedData = await User.update(updateData, { where: { id } });
  // if (updatedData) {
  //   try {
  //     await renameSchema(oldSchemaName, newSchemaName);
  //   } catch (err: any) {
  //     console.error(`❌ Failed to update Schema name: `, err);
  //     throw new Error(`Failed to update user's schema name: ${err.message}`);
  //   }
  // }
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

  // Delete uploaded files
  if (userData.company_logo) deleteFile(userData.company_logo);

  // Delete user record
  const deletedCount = await User.destroy({ where: { id } });
  if (deletedCount === 0) {
    console.warn(`⚠️ Failed to delete user with ID ${id} — record not found`);
    return false;
  }

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
      { name: { [Op.iLike]: term } }, // PostgreSQL only
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
