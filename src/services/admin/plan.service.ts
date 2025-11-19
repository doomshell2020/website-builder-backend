import db from "../../models/index";
import { Op } from "sequelize";
import { apiErrors } from '../../utils/api-errors';
const { Plan } = db;

export const findPlanById = async (id: string) => {
    try {
        const planData = await Plan.findOne({ where: { id }, });
        if (!planData) {
            throw new apiErrors.BadRequestError("Plan not exists.");
        }
        return planData;
    } catch (error) {
        throw error;
    }
};

export const findPlan = async (page: number, limit: number) => {
    try {
        const { count, rows } = await Plan.findAndCountAll({
            where: { status: 'Y' },
            order: [["createdAt", "DESC"]],
        });
        return {
            data: rows,
            total: count,
        };
    } catch (error) {
        console.error("Error fetching Plan:", error);
        throw error;
    }
};

export const createPlan = async (req: any) => {
    const { name } = req.body;

    const alreadyExist = await Plan.findOne({ where: { name: { [Op.iLike]: name } } });
    if (alreadyExist) {
        throw new apiErrors.BadRequestError("Plan with this name already exists.");
    }

    return await Plan.create(req.body);
};

export const findAllPlan = async (page: number, limit: number) => {
    const pageNumber = page && !isNaN(Number(page)) ? Number(page) : 1;
    const limitNumber = limit && !isNaN(Number(limit)) ? Number(limit) : 10;
    const offset = (pageNumber - 1) * limitNumber;

    const { count, rows } = await Plan.findAndCountAll({
        offset,
        limit: limitNumber,
        order: [["createdAt", "DESC"]]
    });

    return {
        data: rows,
        page: pageNumber,
        limit: limitNumber,
        total: count,
        totalPages: Math.ceil(count / limitNumber),
    };
};

export const updatePlan = async (id: number, req: any) => {
    const { body } = req;
    const { name } = body;

    try {
        if (name) {
            const alreadyExists = await Plan.findOne({
                where: { name: { [Op.iLike]: name }, id: { [Op.ne]: id } },
            });

            if (alreadyExists) {
                throw new apiErrors.BadRequestError("Plan with this name already exists.");
            }
        }

        const updateData = { ...body, updatedAt: new Date() };

        const [affectedCount, updatedRows] = await Plan.update(updateData, {
            where: { id },
            returning: true,
        });

        if (affectedCount === 0) {
            throw new apiErrors.BadRequestError("Plan not found.");
        }

        return {
            status: true,
            message: "Plan updated successfully.",
            result: updatedRows[0],
        };

    } catch (error) {
        console.error("Error while updating plan:", error);
        throw (error);
    }
};

export const deletePlan = async (id: number) => {
    await Plan.destroy({ where: { id } });
    return true;
};

export const updatePlanStatus = async (id: string, req: any) => {
    const { status } = req.body;

    await Plan.update({ status, updatedAt: new Date() }, { where: { id } });
    return await Plan.findByPk(id);
};