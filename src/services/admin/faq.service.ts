import db from "../../models/index";
import { Op } from "sequelize";

/** ================= FAQ CATEGORY ================= */
export const viewFAQCategory = async (id: string) => {
  const { FAQCategory, Faq } = db;
  try {
    const category = await FAQCategory.findByPk(id, {
      include: [{ model: Faq, as: "faqs", where: { deleted: "N" }, required: false }],
    });
    return category;
  } catch (error) {
    console.error("Error viewing FAQ Category:", error);
    throw error;
  }
};

/** Create FAQ Category */
export const createFAQCategory = async (req: any) => {
  const { FAQCategory } = db;
  const { name } = req.body;

  try {
    // ✅ Check if category with the same name already exists (case-insensitive)
    const existingCategory = await FAQCategory.findOne({
      where: { name: name.trim().toLowerCase(), deleted: "N" },
    });

    if (existingCategory) {
      const error: any = new Error("A category with this name already exists.");
      error.statusCode = 400;
      throw error;
    }

    // ✅ Create new category
    const created = await FAQCategory.create({
      ...req.body,
      name: name.trim(),
    });

    return created;
  } catch (error) {
    console.error("Error creating FAQ Category:", error);
    throw error;
  }
};

/** Find FAQ Categories with pagination + optional search */
export const findFAQCategory = async (page: number, limit: number, search?: string) => {
  const { FAQCategory } = db;
  try {
    const offset = (page - 1) * limit;
    const where: any = { deleted: "N" };
    if (search) where.name = { [Op.iLike]: `%${search}%` };

    const { count, rows } = await FAQCategory.findAndCountAll({
      where,
      offset,
      limit,
      order: [["createdAt", "DESC"]],
      include: [{ model: db.Faq, as: "faqs", where: { deleted: "N" }, required: false }],
    });

    return { data: rows, page, limit, total: count, totalPages: Math.ceil(count / limit) };
  } catch (error) {
    console.error("Error fetching FAQ Categories:", error);
    throw error;
  }
};

/** Update FAQ Category */
export const updateFAQCategory = async (id: string, req: any) => {
  const { FAQCategory } = db;
  const { name } = req.body;

  try {
    // ✅ Check for duplicate name (excluding self)
    const existingCategory = await FAQCategory.findOne({
      where: {
        name: name.trim(),
        deleted: "N",
        id: { [Op.ne]: id }, // 👈 exclude the current category
      },
    });

    if (existingCategory) {
      const error: any = new Error("A category with this name already exists.");
      error.statusCode = 400;
      throw error;
    }

    // ✅ Proceed with update
    const [count, updatedRows] = await FAQCategory.update(
      { ...req.body, updatedAt: new Date() },
      { where: { id }, returning: true }
    );

    if (count === 0)
      throw new Error("FAQ Category not found or no changes made.");

    return updatedRows[0];
  } catch (error) {
    console.error("Error updating FAQ Category:", error);
    throw error;
  }
};

/** Soft Delete FAQ Category */
export const deleteFAQCategory = async (id: string) => {
  const { FAQCategory } = db;
  try {
    await FAQCategory.update({ deleted: "Y", updatedAt: new Date() }, { where: { id } });
    return true;
  } catch (error) {
    console.error("Error deleting FAQ Category:", error);
    throw error;
  }
};

/** Bulk Delete FAQs */
export const deleteMultipleFAQCategory = async (ids: number[]) => {
  const { FAQCategory } = db;
  try {
    await FAQCategory.update({ deleted: "Y", updatedAt: new Date() }, { where: { id: ids } });
    return ids.length;
  } catch (error) {
    console.error("Error deleting multiple FAQ categories:", error);
    throw error;
  }
};

/** Status Update for Categories */
export const updateFAQCategoryStatus = async (id: string, status: "Y" | "N") => {
  const { FAQCategory } = db;
  try {
    await FAQCategory.update({ status, updatedAt: new Date() }, { where: { id } });
    return await FAQCategory.findByPk(id);
  } catch (error) {
    console.error("Error updating FAQ Category status:", error);
    throw error;
  }
};


/** ================= FAQ ================= */


/** View single FAQ by ID */
export const viewFAQ = async (id: string) => {
  const { Faq, FAQCategory } = db;
  try {
    const faq: any = await Faq.findOne({
      where: { id, deleted: "N" }, // ✅ filter by PK + deleted
      include: [{ model: FAQCategory, as: "category" }],
    });
    return faq;
  } catch (error) {
    console.error("Error viewing FAQ:", error);
    throw error;
  }
};

/** Create FAQ */
export const createFAQ = async (req: any) => {
  const { Faq } = db;
  try {
    const created = await Faq.create(req.body);
    return created;
  } catch (error) {
    console.error("Error creating FAQ:", error);
    throw error;
  }
};

/** Find FAQs with search, pagination, category filter */
export const findFAQ = async (
  page: number,
  limit: number,
  search?: string,
  categoryId?: number
) => {
  const { Faq, FAQCategory } = db;
  try {
    const offset = (page - 1) * limit;
    const where: any = { deleted: "N" };

    if (search) {
      where[Op.or] = [
        { question: { [Op.iLike]: `%${search}%` } },
        { answer: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (categoryId) where.category_id = categoryId;

    const { count, rows } = await Faq.findAndCountAll({
      where,
      offset,
      limit,
      order: [["createdAt", "DESC"]],
      include: [{ model: FAQCategory, as: "category" }],
    });

    return { data: rows, page, limit, total: count, totalPages: Math.ceil(count / limit) };
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    throw error;
  }
};

/** Update FAQ */
export const updateFAQ = async (id: string, req: any) => {
  const { Faq } = db;
  try {
    const [count, updatedRows] = await Faq.update(
      { ...req.body, updatedAt: new Date() },
      { where: { id }, returning: true }
    );
    if (count === 0) throw new Error("FAQ not found or no changes made.");
    return updatedRows[0];
  } catch (error) {
    console.error("Error updating FAQ:", error);
    throw error;
  }
};

/** Soft Delete FAQ */
export const deleteFAQ = async (id: string) => {
  const { Faq } = db;
  try {
    await Faq.update({ deleted: "Y", updatedAt: new Date() }, { where: { id } });
    return true;
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    throw error;
  }
};

/** Bulk Delete FAQs */
export const deleteMultipleFAQ = async (ids: number[]) => {
  const { Faq } = db;
  try {
    await Faq.update({ deleted: "Y", updatedAt: new Date() }, { where: { id: ids } });
    return ids.length;
  } catch (error) {
    console.error("Error deleting multiple FAQs:", error);
    throw error;
  }
};

/** Status Update FAQs */
export const updateFAQStatus = async (id: string, status: "Y" | "N") => {
  const { Faq } = db;
  try {
    await Faq.update({ status, updatedAt: new Date() }, { where: { id } });
    return await Faq.findByPk(id);
  } catch (error) {
    console.error("Error updating FAQ status:", error);
    throw error;
  }
};

/** Bulk Status Update */
export const updateBulkFAQStatus = async (ids: string[], status: "Y" | "N") => {
  const { Faq } = db;
  try {
    const updated = await Faq.update(
      { status, updatedAt: new Date() },
      { where: { id: ids } }
    );
    return updated;
  } catch (error) {
    console.error("Error updating FAQ status:", error);
    throw error;
  }
};
