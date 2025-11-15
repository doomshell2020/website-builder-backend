import db from "../../models/index";
import { Op } from "sequelize";
import { apiErrors } from '../../utils/api-errors';
const { Theme, User } = db;

export const findTheme = async (page: number, limit: number) => {
    try {
        const { count, rows } = await Theme.findAndCountAll({
            where: { status: 'Y' },
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: User,
                    as: "Users",
                    attributes: ["id", "name", "email", "website_type"],
                },
            ],
        });
        return { data: rows, page, limit, total: count, totalPages: Math.ceil(count / limit) };
    } catch (error) {
        console.error("Error fetching Theme:", error);
        throw error;
    }
};

export const findThemeById = async (id: string) => {
    try {
        const webTypeData = await Theme.findOne({
            where: { id },
            include: [
                {
                    model: User,
                    as: "Users",
                    attributes: ["id", "name", "email", "website_type"],
                },
            ],
        });
        if (!webTypeData) {
            throw new apiErrors.BadRequestError("Theme not exists.");
        }
        return webTypeData;
    } catch (error) {
        throw error;
    }
};

export const createTheme = async (req: any) => {
    const { name, slug } = req.body;

    // Check if name already exists
    const alreadyExistsByName = await Theme.findOne({ where: { name } });
    if (alreadyExistsByName) {
        throw new apiErrors.BadRequestError("Theme name already exists.");
    }

    // Check if slug already exists
    const alreadyExistsBySlug = await Theme.findOne({ where: { slug } });
    if (slug && alreadyExistsBySlug) {
        throw new apiErrors.BadRequestError("Theme slug already exists.");
    }

    return await Theme.create(req.body);
};

export const findAllTheme = async (page: number, limit: number) => {
    const pageNumber = page && !isNaN(Number(page)) ? Number(page) : 1;
    const limitNumber = limit && !isNaN(Number(limit)) ? Number(limit) : 10;
    const offset = (pageNumber - 1) * limitNumber;

    const { count, rows } = await Theme.findAndCountAll({
        offset,
        limit: limitNumber,
        order: [['createdAt', 'DESC']],
        include: [
            {
                model: User,
                as: "Users",
                attributes: ["id", "name", "email", "website_type"],
            },
        ],
    });

    return {
        data: rows,
        page: pageNumber,
        limit: limitNumber,
        total: count,
        totalPages: Math.ceil(count / limitNumber), // Correct total pages
    };
};

export const updateTheme = async (id: number, req: any) => {
    const { body } = req;
    const { name, slug } = body;

    try {
        // 🔹 Check duplicate NAME (exclude current record)
        if (name) {
            const existsByName = await Theme.findOne({
                where: { name, id: { [Op.ne]: id } },
            });

            if (existsByName) {
                throw new apiErrors.BadRequestError("Theme name already exists.");
            }
        }

        // 🔹 Check duplicate SLUG (exclude current record)
        if (slug) {
            const existsBySlug = await Theme.findOne({
                where: { slug: slug, id: { [Op.ne]: id } },
            });

            if (existsBySlug) {
                throw new apiErrors.BadRequestError("Theme slug already exists.");
            }
        }

        // ✅ Prepare update data
        const updateData = { ...body, updatedAt: new Date() };

        // ✅ Update record
        const [affectedCount, updatedRows] = await Theme.update(updateData, {
            where: { id },
            returning: true,
        });

        if (affectedCount === 0) {
            throw new apiErrors.BadRequestError("Theme not found.");
        }

        return {
            status: true,
            message: "Theme updated successfully.",
            result: updatedRows[0],
        };

    } catch (error) {
        console.error("Error while updating Theme:", error);
        throw (error);
    }
};

export const deleteTheme = async (id: number) => {
    await Theme.destroy({ where: { id } });
    return true;
};

export const updateThemeStatus = async (id: string, req: any) => {
    const { status } = req.body;

    await Theme.update({ status, updatedAt: new Date() }, { where: { id } });
    return await Theme.findByPk(id);
};